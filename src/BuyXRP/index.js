import axios from 'axios'
import Decimal from 'decimal.js';
// import dynamic from 'next/dynamic';
import { useState, useEffect } from 'react';
import { isMobileSafari, isSafari, isChrome, isIOS, deviceType, OsTypes } from 'react-device-detect';

// Material
import { withStyles } from '@mui/styles';
import {
    alpha,
    Card,
    Checkbox,
    FormControlLabel,
    Grid,
    MenuItem,
    Stack,
    TextField,
    Typography
} from '@mui/material';
import LoadingButton from '@mui/lab/LoadingButton';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';
import ErrorOutlineOutlinedIcon from '@mui/icons-material/ErrorOutlineOutlined';

// Context
import { useContext } from 'react';
import { AppContext } from 'src/AppContext';

// Loader
import { PuffLoader } from "react-spinners";

// Components
import PayMethod from './PayMethod';

// Utils
import { fIntNumber, fNumber } from 'src/utils/formatNumber';

function GetNum(amount) {
    let num = 0;
    try {
        num = new Decimal(amount).toNumber();
        if (num < 0) num = 0;
    } catch (err) {}
    return num;
}

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
    PaperProps: {
        style: {
            maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
            // width: 180,
        },
    },
};

export default function BuyXRP({fiats, coins}) {
    const BASE_URL = process.env.API_URL;
    const { accountProfile, darkMode, openSnackbar } = useContext(AppContext);
    const [fiat, setFiat] = useState('USD');
    const [coin, setCoin] = useState('XRP');
    const [fiatAmount, setFiatAmount] = useState('0');
    const [coinAmount, setCoinAmount] = useState('0');
    const [prices, setPrices] = useState([]);
    const [selPay, setSelPay] = useState(-1);
    const [limitMin, setLimitMin] = useState(0);
    const [limitMax, setLimitMax] = useState(0);
    const [disclaimer, setDisclaimer] = useState(false);

    const [sync, setSync] = useState(0);
    const [counter, setCounter] = useState(60);

    const [loading, setLoading] = useState(false);
    const [ordering, setOrdering] = useState(false);

    const isLoggedIn = accountProfile && accountProfile.account;

    const banxa_black = "/banxa-logo-black.webp";
    const banxa_white = "/banxa-logo-white.webp";
    
    const banxa_img = darkMode?banxa_white:banxa_black;

    let isBuyCryptoDisabled = true;
    const amount = GetNum(fiatAmount);
    if (amount > 0 && limitMin > 0 && amount > limitMin && amount < limitMax && disclaimer)
        isBuyCryptoDisabled = false;

    useEffect(() => {
        const getPrices=() => {
            // https://xrplto.banxa-sandbox.com/
            // https://api.xrpl.to/api/banxa/prices?source_amount=100&source=USD&target=XRP
            const amount = GetNum(fiatAmount);
            setCounter(0);
            setSelPay(-1);
            setLimitMax(0);
            setLimitMin(0);

            if (amount === 0) {
                setCoinAmount('0');
                return;
            }

            setLoading(true);
            axios.get(`${BASE_URL}/banxa/prices?source_amount=${amount}&source=${fiat}&target=XRP`)
            .then(res => {
                try {
                    if (res.status === 200 && res.data) {
                        const prices = res.data.prices;
                        const newPrices = [];

                        for (var p of prices) {
                            let add = true;
                            // // const agents = p.supported_agents;
                            // // if (agents) {
                            // //     for (var a of agents) {
                            // //         if (a.browser === 'safari' && !isSafari) {
                            // //             add = false;
                            // //             break;
                            // //         }
                            // //     }
                            // // }
                            // if (add)
                                newPrices.push(p);
                        }
                        if (newPrices.length > 0) {
                            setPrices(newPrices);
                            setSelPay(0);
                        } else {
                            setSelPay(-1);
                        }
                        
                    }
                } catch (error) {
                    setCoinAmount('0');
                    console.log(error);
                }
            }).catch(err => {
                setCoinAmount('0');
                console.log("err->>", err);
            }).then(function () {
                // Always executed
                setLoading(false);
                setCounter(60);
            });
        };

        let timer = setTimeout(getPrices, 800);

        return () => {
            clearTimeout(timer);
        };
    }, [sync]); // fiat, fiatAmount

    useEffect(() => {
        const loop = () => {
            if (counter > 0) {
                counter--;
                setCounter(counter)
                if (counter === 0) {
                    setSync(sync + 1);
                }
            }
        };

        let timer = null;
        if (counter > 0)
            timer = setTimeout(loop, 1000);

        return () => {
            if (timer)
                clearTimeout(timer);
        };
    }, [counter]);


    useEffect(() => {
        if (prices.length > 0 && selPay >= 0) {
            const p = prices[selPay];
            setCoinAmount(p.coin_amount);
            setLimitMin(GetNum(p.transaction_limit.min));
            setLimitMax(GetNum(p.transaction_limit.max));
        } else {
            setCoinAmount('0');
        }
    }, [selPay]);

    const onProcessOrder = async () => {
        setOrdering(true);
        try {
            const body = {
                // account_reference: "xrpl.to",
                payment_method_id: prices[selPay].payment_method_id,
                source: fiat,
                source_amount: fiatAmount,
                target: "XRP",
                wallet_address: accountProfile.account,
                return_url_on_success: "https://xrpl.to/buy-xrp"
            };

            // {
            //     "payment_method_id": 6030,
            //     "source": "USD",
            //     "source_amount": "100",
            //     "target": "XRP",
            //     "wallet_address": "r22G1hNbxBVapj2zSmvjdXyKcedpSDKsm",
            //     "return_url_on_success": "https://sologenic.org/trade"
            // }

            const res = await axios.post(`${BASE_URL}/banxa/orders`, body);

            const retry = true;
            if (res.status === 200) {
                const newOrder = res.data.order;
                if (newOrder && newOrder.checkout_url) {
                    // {
                    //     "id": "73c73f9ddb4c2930eebd11f319e60e78",
                    //     "account_id": "291a29fb4ee6f9eaffd28df1b77bc232",
                    //     "account_reference": "xrpl.to",
                    //     "order_type": "CRYPTO-BUY",
                    //     "fiat_code": "USD",
                    //     "coin_code": "XRP",
                    //     "wallet_address": "r22G1hNbxBVapj2zSmvjdXyKcedpSDKsm",
                    //     "blockchain": {
                    //         "id": 7,
                    //         "code": "XRP",
                    //         "description": "Ripple"
                    //     },
                    //     "created_at": "04-Aug-2022 02:05:38",
                    //     "checkout_url": "https://xrplto.banxa-sandbox.com?expires=1659578798&id=f974d347-f44f-483f-846a-bad72442a8ab&oid=73c73f9ddb4c2930eebd11f319e60e78&signature=9e8c920c17a2d842459564d1d6e245655b22242cd03235f55468a9915474a933"
                    // }
                    retry = false;
                    window.open(newOrder.checkout_url, "_blank") //to open new page
                }
            }
            if (retry)
                openSnackbar('Network error, try again!', 'error');
        } catch (err) {
            // console.log(err);
            openSnackbar('Network error, try again!', 'error');
        }
        setOrdering(false);
    };

    const handleChangeAmount = (e) => {
        setFiatAmount(e.target.value);
        setSync(sync + 1);
    }

    const handleChangeFiat = (e) => {
        setFiat(e.target.value);
        setSync(sync + 1);
    }

    const handleRefresh = (e) => {
        setCounter(0);
        setCoinAmount('0');
        setSync(sync + 1);
    }

    const handleChangeDisclaimer = (e) => {
        setDisclaimer(e.target.checked);
    };

    const handleBuyCrypto = (e) => {
        if (!isLoggedIn) {
            openSnackbar('Please connect wallet!', 'error');
        } else {
            onProcessOrder();
        }
    }
    return (
        <>
            <Stack alignItems="center" sx={{mt:5, mb:3}}>
                <Typography variant="h2a">Buy XRP with Fiat</Typography>
            </Stack>

            <Stack sx={{mt:5, mb:3}}>
                <Typography variant="h4a">I WANT TO SPEND</Typography>
                <Stack direction="row">
                    <TextField
                        id="input-with-sx1"
                        variant="outlined"
                        label=""
                        placeholder="Enter Amount"
                        value={fiatAmount}
                        onChange={handleChangeAmount}
                        onFocus={event => {
                            event.target.select();
                        }}
                        sx={{
                            width: '75%',
                            '& .MuiOutlinedInput-root' : {
                                borderTopRightRadius: 0,
                                borderBottomRightRadius: 0,
                            }
                        }}
                    />
                    <TextField
                        id="outlined-select-currency1"
                        select
                        label=""
                        value={fiat}
                        onChange={handleChangeFiat}
                        helperText=""
                        sx={{
                            width: '25%',
                            '& .MuiOutlinedInput-root' : {
                                borderTopLeftRadius: 0,
                                borderBottomLeftRadius: 0,
                            }
                        }}
                        SelectProps={{
                            MenuProps
                        }}
                    >
                        {fiats.map((f, idx) => (
                            <MenuItem key={idx + "_" + f.fiat_code} value={f.fiat_code}>
                                {f.fiat_code}
                            </MenuItem>
                        ))}
                    </TextField>
                </Stack>
                {limitMin > 0 &&
                    <Stack direction="row" alignItems="center" spacing={0.5}>
                        <ErrorOutlineOutlinedIcon fontSize="small" color="error"/>
                        <Typography variant="p3">Min: {fIntNumber(limitMin)} {fiat} - Max: {fIntNumber(limitMax)} {fiat}</Typography>
                    </Stack>
                }
            </Stack>

            <Stack alignItems="center" sx={{mt:4}}>
                <CurrencyExchangeIcon fontSize="large"/>
            </Stack>

            <Stack sx={{mt:3, mb:3}}>
                <Typography variant="h4a">You will get</Typography>
                <Stack direction="row">
                    <TextField
                        fullWidth
                        disabled
                        id="input-with-sx2"
                        variant="outlined"
                        label=""
                        placeholder="Enter Amount"
                        value={coinAmount}
                        onFocus={event => {
                            event.target.select();
                        }}
                        sx={{
                            width: '75%',
                            '& .MuiOutlinedInput-root' : {
                                borderTopRightRadius: 0,
                                borderBottomRightRadius: 0,
                            }
                        }}
                    />
                    <TextField
                        disabled
                        id="outlined-select-currency2"
                        select
                        label=""
                        value={coin}
                        helperText=""
                        sx={{
                            width: '25%',
                            '& .MuiOutlinedInput-root' : {
                                borderTopLeftRadius: 0,
                                borderBottomLeftRadius: 0,
                            }
                        }}
                    >
                        <MenuItem key={'XRP'} value={'XRP'}>
                            XRP
                        </MenuItem>
                    </TextField>
                </Stack>
            </Stack>

            {(fiatAmount !== '0' || coinAmount !== '0') &&
                <Stack sx={{mt:5, mb:3}}>
                    <Stack
                        direction="row"
                        justifyContent="space-between"
                        alignItems="center"
                        spacing={2}
                    >
                        <Stack>
                            <Typography variant="h4a" sx={{mb:2}}>Payment methods</Typography>
                            <Typography variant="p2" sx={{mb:2}}>Select a payment method</Typography>
                        </Stack>

                        {counter > 0 &&
                            <LoadingButton
                                size="small"
                                onClick={handleRefresh}
                                loading={loading}
                                variant="outlined"
                                color={"error"}
                                sx={{mt:0}}
                            >
                                {`Refresh (${counter})`}
                            </LoadingButton>
                        }
                    </Stack>

                    {loading ?
                        <Stack alignItems="center" sx={{mt: 5, mb: 5}}>
                            <PuffLoader color={"#00AB55"} size={35} sx={{mt:5, mb:5}}/>
                        </Stack>
                    :(
                        <Grid container spacing={3} sx={{p:0}}>
                            {prices.map((m, idx) => (
                                <Grid key={idx} item xs={12} sm={4}>
                                    <PayMethod method={m} idx={idx} selected={selPay} setSelected={setSelPay}/>
                                </Grid>
                            ))}
                        </Grid>
                    )}
                </Stack>
            }

            <Stack sx={{mt:5, mb:3}}>
                <Typography variant="h4a" sx={{mb:2}}>Service Provider Info</Typography>
                <Card variant="outlined" sx={{p:3}}>
                    <Stack direction="row" spacing={2} sx={{mb: 5}}>
                        <img
                            alt={'Banxa Logo'}
                            src={banxa_img}
                            style={{
                                width:'30%',
                                justifySelf: 'center',
                                objectFit: 'contain'
                            }}
                        />
                        <Stack sx={{width:'70%'}}>
                            <Typography variant="p2">You will receive <Typography variant="s15" noWrap> ≈ {fNumber(coinAmount)} XRP</Typography></Typography>
                            <Typography variant="p3" noWrap>Up to 48 hours</Typography>
                        </Stack>
                    </Stack>

                    <FormControlLabel control={<Checkbox checked={disclaimer} onChange={handleChangeDisclaimer}/>}
                        label="I understand that I will be purchasing cryptocurrency directly through 3rd party service providers. The XRPL.to is a decentralized platform; hence, will not take responsability for any issues that may affect my transactions through the 3rd party service providers."
                    />

                    <Stack alignItems='flex-end'>
                        <LoadingButton
                            size="small"
                            disabled={isBuyCryptoDisabled}
                            onClick={handleBuyCrypto}
                            loading={ordering}
                            variant="outlined"
                            color="primary"
                            sx={{mt:3}}
                        >
                            BUY XRP
                        </LoadingButton>
                    </Stack>
                </Card>
            </Stack>
        </>
    );
}
