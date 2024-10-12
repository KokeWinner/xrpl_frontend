import axios from 'axios';
import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { useContext } from 'react';
import { AppContext } from 'src/AppContext';
import { debounce } from 'lodash';

// Material
import {
    styled,
    Avatar,
    FormControl,
    Grid,
    IconButton,
    InputLabel,
    Link,
    MenuItem,
    Select,
    Stack,
    Tooltip,
    Typography
} from '@mui/material';


// Iconify
import { Icon } from '@iconify/react';
import arrowsExchange from '@iconify/icons-gg/arrows-exchange';

// Utils
import { fNumber } from 'src/utils/formatNumber';

// ----------------------------------------------------------------------

const CustomSelect = styled(Select)(({ theme }) => ({
    // '& .MuiOutlinedInput-notchedOutline' : {
    //     border: 'none'
    // }
}));
// ----------------------------------------------------------------------

const badge24hStyle = {
    display: 'inline-block',
    marginLeft: '4px',
    marginRight: '4px',
   // color: '#C4CDD5',
    fontSize: '11px',
    fontWeight: '500',
    lineHeight: '18px',
    //backgroundColor: '#323546',
    borderRadius: '4px',
    border: '1px solid #323546',
    padding: '1px 4px'
};

const StackDexStyle = styled(Stack)(({ theme }) => ({
    width: '100%',
    display: 'inline-block',
    marginLeft: '4px',
    marginRight: '4px',
   // color: '#C4CDD5',
    fontSize: '11px',
    fontWeight: '500',
    lineHeight: '18px',
    // backgroundColor: '#7A0C2E',
    borderRadius: '8px',
    border: `1px solid ${theme.palette.divider}`,
    padding: '0px 12px'
}));

const PairsSelect = memo(({ token, pair, setPair }) => {
    const BASE_URL = process.env.API_URL;
    const { darkMode } = useContext(AppContext);
    const [pairs, setPairs] = useState([]);

    const getPairs = useCallback(() => {
        axios.get(`${BASE_URL}/pairs?md5=${token.md5}`)
            .then(res => {
                if (res.status === 200 && res.data) {
                    const newPairs = res.data.pairs;
                    setPairs(newPairs);
                    if (!pair || !newPairs.find(e => e.pair === pair.pair)) {
                        setPair(newPairs[0]);
                    }
                }
            }).catch(err => {
                console.log("Error on getting pairs!!!", err);
            });
    }, [token.md5, pair, setPair, BASE_URL]);

    useEffect(() => {
        if (pairs.length === 0) {
            getPairs();
        }

        const timer = setInterval(getPairs, 10000);

        return () => clearInterval(timer);
    }, [pairs.length, getPairs]);

    const handleChangePair = useCallback((event) => {
        const strPair = event.target.value;
        const newPair = pairs.find(e => e.pair === strPair);
        if (newPair) setPair(newPair);
    }, [pairs, setPair]);

    const menuItems = useMemo(() => pairs.map((row) => {
        const { id, pair, curr1, curr2 } = row;
        const name1 = curr1.name;
        const name2 = curr2.name;

        return (
            <MenuItem key={id} value={pair}>
                <Stack direction="row" alignItems='center'>
                    <Typography variant="subtitle2" sx={{ color: '#B72136' }}>{name1}</Typography>
                    <Icon icon={arrowsExchange} width="16" height="16"/>
                    <Typography variant="subtitle2" sx={{ color: darkMode ? '#007B55' : '#5569ff' }}>{name2}</Typography>
                    <span style={badge24hStyle}>24h</span>
                    <Typography variant="subtitle2" sx={{ color: '#B72136' }}>{fNumber(curr1.value)}</Typography>
                </Stack>
            </MenuItem>
        );
    }), [pairs, darkMode]);

    const curr1 = pair.curr1;
    const curr2 = pair.curr2;

    let soloDexURL = `https://sologenic.org/trade?network=mainnet&market=${curr1.currency}%2B${curr1.issuer}%2F${curr2.currency}`;
    if (curr2.currency !== 'XRP')
        soloDexURL += `%2B${curr2.issuer}`;

    let gatehubDexURL = `https://gatehub.net/markets/${curr1.currency}+${curr1.issuer}/${curr2.currency}`;
    if (curr2.currency !== 'XRP')
        gatehubDexURL += `+${curr2.issuer}`;

    let xpmarketDexURL = `https://gatehub.net/markets/${curr1.currency}+${curr1.issuer}/${curr2.currency}`;
    if (curr2.currency !== 'XRP')
        xpmarketDexURL += `+${curr2.issuer}`;
        
    const xummDexURL = `https://xumm.app/detect/xapp:xumm.dex?issuer=${curr1.issuer}&currency=${curr1.currency}`;

    return (
        <Grid container spacing={0} sx={{p:0}}>
            <Grid item>
                <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
                    <InputLabel id="demo-select-small">Pairs</InputLabel>
                    <CustomSelect
                        labelId="demo-select-small"
                        id="demo-select-small"
                        value={pair.pair}
                        label="Pair"
                        onChange={handleChangePair}
                    >
                        {menuItems}
                    </CustomSelect>
                </FormControl>
            </Grid>

            <Grid item>
                <Stack direction="row">
                { /*
                <StackDexStyle direction="row" sx={{ m: 1, minWidth: 120 }} spacing={2} alignItems="center">
                        DEX
                        <Tooltip title="Sologenic">
                            <Link
                                underline="none"
                                color="inherit"
                                target="_blank"
                                href={soloDexURL}
                                rel="noreferrer noopener nofollow"
                            >
                                <IconButton edge="end" aria-label="solo">
                                    <Avatar variant="rounded" alt="Sologenic" src="/static/solo.webp" sx={{ width: 24, height: 24 }} />
                                </IconButton>
                            </Link>
                        </Tooltip>
                        
                        <Tooltip title="GateHub">
                            <Link
                                underline="none"
                                color="inherit"
                                target="_blank"
                                href={gatehubDexURL}
                                rel="noreferrer noopener nofollow"
                            >
                                <IconButton edge="end" aria-label="solo">
                                    <Avatar variant="rounded" alt="Gatehub" src="/static/gatehub.webp" sx={{ width: 24, height: 24 }} />
                                </IconButton>
                            </Link>
                        </Tooltip>
                        <Tooltip title="XUMM">
                            <Link
                                underline="none"
                                color="inherit"
                                target="_blank"
                                href={xummDexURL}
                                rel="noreferrer noopener nofollow"
                            >
                                <IconButton edge="end" aria-label="solo">
                                    <Avatar variant="rounded" alt="XUMM" src="/static/xumm.webp" sx={{ width: 24, height: 24 }} />
                                </IconButton>
                            </Link>
                        </Tooltip>

                        <Tooltip title="xpmarket">
                            <Link
                                underline="none"
                                color="inherit"
                                target="_blank"
                                href={xpmarketDexURL}
                                rel="noreferrer noopener nofollow"
                            >
                                <IconButton edge="end" aria-label="solo">
                                    <Avatar variant="rounded" alt="xpmarket" src="/static/xpmarket.webp" sx={{ width: 24, height: 24 }} />
                                </IconButton>
                            </Link>
                        </Tooltip>
                    </StackDexStyle>
                    */ }
                </Stack>
            </Grid>
        </Grid>
    );
});

export default PairsSelect;
