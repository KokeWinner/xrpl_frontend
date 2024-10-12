import { useState, useEffect } from 'react';
import Decimal from 'decimal.js';

// Material
import {
    styled,
    Box,
    FormControlLabel,
    Radio,
    RadioGroup,
    Stack,
    TextField,
    ToggleButton,
    ToggleButtonGroup,
    Typography
} from '@mui/material';

import {
    Token as TokenIcon,
    PriceChange as PriceChangeIcon,
    SwapVerticalCircle as SwapVerticalCircleIcon,
} from '@mui/icons-material';

// Components
import AccountBalance from './AccountBalance';
import PlaceOrder from './PlaceOrder';

// Context
import { useContext } from 'react'
import { AppContext } from 'src/AppContext'
import scientificToDecimal from 'scientific-to-decimal';
import millify from "millify";

// Utils

// ----------------------------------------------------------------------
const StackDexStyle = styled(Stack)(({ theme }) => ({
    width: '100%',
    display: 'inline-block',
    color: '#C4CDD5',
    fontSize: '11px',
    fontWeight: '500',
    lineHeight: '18px',
    // backgroundColor: '#7A0C2E',
    borderRadius: '8px',
    border: `1px solid ${theme.palette.divider}`,
    padding: '0px 12px'
}));

const expo = (x, f) => {
    return Number.parseFloat(x).toExponential(f);
}

const fmNumber = (value, len) => {
    const amount = new Decimal(value).toNumber();
    if ((amount.toString().length > 8 && amount < 0.001) || amount > 1000000000)
        return expo(amount, 2);
    else
        return new Decimal(amount).toFixed(len, Decimal.ROUND_DOWN);
}

export default function TradePanel({pair, bids, asks, bidId, askId}) {
    const [buySell, setBuySell] = useState('BUY');
    const [amount, setAmount] = useState('');
    const [price, setPrice] = useState('');
    const [value, setValue] = useState('');
    const [marketLimit, setMarketLimit] = useState('market');
    const [accountPairBalance, setAccountPairBalance] = useState(null);
    const { darkMode } = useContext(AppContext);
    useEffect(() => {
        if (bidId < 0) return;
        const idx = bidId;
        setBuySell('SELL');
        setMarketLimit('limit');
        const bid = bids[idx];

        const sumAmount = fmNumber(bid.sumAmount, 2);
        const sumValue = fmNumber(bid.sumValue, 5);
        const price = fmNumber(bid.price, 5);

        setAmount(scientificToDecimal(sumAmount));
        setPrice(scientificToDecimal(price));
        setValue(scientificToDecimal(sumValue));
    }, [bidId]);

    useEffect(() => {
        if (askId < 0) return;
        const idx = askId;
        setBuySell('BUY');
        setMarketLimit('limit');
        const ask = asks[idx];

        const sumAmount = fmNumber(ask.sumAmount, 2);
        const sumValue = fmNumber(ask.sumValue, 5);
        const price = fmNumber(ask.price, 5);

        setAmount(scientificToDecimal(sumAmount));
        setPrice(scientificToDecimal(price));
        setValue(scientificToDecimal(sumValue));
    }, [askId]);

    useEffect(() => {
        if (marketLimit !== 'market') return;
        const amt = new Decimal(amount || 0).toNumber();
        if (amt === 0) {
            setValue(0);
            return;
        }
        // if (amt > 0) {}

        const val = calcValue(amount, buySell);
        setValue(val);

    }, [asks, bids, marketLimit, buySell, amount]);

    const handleChangeBuySell = (event, newValue) => {
        if (newValue)
            setBuySell(newValue);
    };

    const calcValue = (amount, buyorsell) => {
        let val = 0;
        let amt;

        try {
            amt = new Decimal(amount).toNumber();
            if (amt === 0) return 0;
            if (buyorsell === 'BUY') {
                for (var ask of asks) {
                    if (ask.sumAmount >= amt) {
                        val = new Decimal(ask.sumValue).mul(amt).div(ask.sumAmount).toNumber();
                        break;
                    }
                }
            } else {
                for (var bid of bids) {
                    if (bid.sumAmount >= amt) {
                        val = new Decimal(bid.sumValue).mul(amt).div(bid.sumAmount).toNumber();
                        break;
                    }
                }
            }
            return new Decimal(val).toFixed(6, Decimal.ROUND_DOWN);
        } catch (e) {}

        return 0;
    }

    const handleChangeAmount = (e) => {
        const amt = e.target.value;
        
        if (amt === '.') {
            setAmount('0.');
            return;
        }
        
        if (isNaN(Number(amt))) return;

        setAmount(amt);
        if (marketLimit !== 'market') {
            const val = (Number(amt) * Number(price)).toFixed(6);
            setValue(val);
        }
    }

    const handleChangePrice = (e) => {
        const newPrice = e.target.value;
        
        if (isNaN(Number(newPrice))) return;

        setPrice(newPrice);
        const val = (amount * newPrice).toFixed(6);
        setValue(val);
    }

    const handleChangeMarketLimit = (e) => {
        setMarketLimit(e.target.value);
    }

    const curr1 = pair.curr1;
    const curr2 = pair.curr2;
    
    // https://mui.com/system/display/

    return (
        <>
            <Stack spacing={1} alignItems="center">
                <Typography variant='subtitle1' sx={{color:'#FFC107', textAlign: 'center', ml:0, mt:2, mb:0}}>Trade Now</Typography>
            </Stack>
            <StackDexStyle spacing={2} sx={{ mt:4, pt:2, pb:2 }}>
                <AccountBalance
                    pair={pair}
                    accountPairBalance={accountPairBalance}
                    setAccountPairBalance={setAccountPairBalance}
                />

                <ToggleButtonGroup
                    color="primary"
                    // orientation="vertical"
                    value={buySell}
                    fullWidth
                    exclusive
                    onChange={handleChangeBuySell}
                >
                    <ToggleButton sx={{pt:0.5,pb:0.5}} value="BUY">BUY</ToggleButton>
                    <ToggleButton color="error" sx={{pt:0.5, pb:0.5}} value="SELL">SELL</ToggleButton>
                </ToggleButtonGroup>

                <Stack alignItems="center">

                    {buySell === 'BUY' &&
                        <Typography variant='caption' alignItems={'center'}>
                            Get <Typography variant="caption" sx={{ color: '#B72136' }}>{curr1.name}</Typography> by selling <Typography variant="caption" sx={{ color: darkMode ? '#007B55' : '#5569ff' }}>{curr2.name}</Typography>
                        </Typography>
                    }

                    {buySell === 'SELL' &&
                        <Typography variant='caption' alignItems={'center'}>
                            Sell <Typography variant="caption" sx={{ color: '#B72136' }}>{curr1.name}</Typography> to get <Typography variant="caption" sx={{ color: darkMode ? '#007B55' : '#5569ff' }}>{curr2.name}</Typography>
                        </Typography>
                    }
                </Stack>

                <Stack alignItems="center" sx={{mt: 1}}>
                    <RadioGroup
                        row
                        aria-labelledby="demo-row-radio-buttons-group-label"
                        name="row-radio-buttons-group"
                        value={marketLimit}
                        onChange={handleChangeMarketLimit}
                    >
                        <FormControlLabel value="market" control={<Radio size="small"/>} label="MARKET" />
                        <FormControlLabel value="limit" control={<Radio size="small"/>} label="LIMIT" />
                    </RadioGroup>
                </Stack>

                <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
                    <TokenIcon sx={{ color: 'action.active', mr: 1.5, my: 0.5 }} />
                    <TextField 
                        fullWidth 
                        id="input-with-sx1" 
                        label="Amount" 
                        value={amount} 
                        onChange={handleChangeAmount} 
                        variant="standard"
                        inputProps={{ 
                            inputMode: 'numeric', 
                            pattern: '[0-9]*',
                            autoComplete: 'off',
                            name: `amount-${pair.curr1.name}-${pair.curr2.name}` // Unique name
                        }}
                        autoComplete="off"
                    />
                    <Typography variant="caption" color='#FF4842'>{curr1.name}</Typography>
                </Box>

                {marketLimit === 'limit' && (
                    <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
                        <PriceChangeIcon sx={{ color: 'action.active', mr: 1.5, my: 0.5 }} />
                        <TextField fullWidth id="input-with-sx2" label="Price" value={price} onChange={handleChangePrice} variant="standard"/>
                        
                        <Typography variant="caption" sx={{ color: darkMode ? '#007B55' : '#5569ff' }}>{curr2.name}</Typography>
                    </Box>
                )}

                <Box sx={{ display: 'flex', alignItems: 'flex-end' }}>
                    <SwapVerticalCircleIcon sx={{ color: 'action.active', mr: 1.5, my: 0.5 }} />
                    <Typography>Total</Typography>
                    <Box sx={{ flexGrow: 1 }} />
                    <Typography sx={{mr:1}}>≈</Typography>
                    <Typography alignItems='right' sx={{mr:2}}>{value < 1 ? value : millify(value)} <Typography variant="caption"> {curr2.name}</Typography></Typography>
                </Box>

                <PlaceOrder marketLimit={marketLimit} buySell={buySell} pair={pair} amount={amount} value={value} accountPairBalance={accountPairBalance} />
            </StackDexStyle>
        </>
    );
}