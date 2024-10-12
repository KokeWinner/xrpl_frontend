import axios from 'axios';
import Decimal from 'decimal.js';
import { useState, useEffect, useContext } from 'react';

// Material
import { withStyles } from '@mui/styles';
import { useTheme, Checkbox, Divider, FormControlLabel, FormGroup, Grid, Stack, Tooltip, Typography } from '@mui/material';

// Iconify
import { Icon } from '@iconify/react';
import infoFilled from '@iconify/icons-ep/info-filled';

// Context
import { AppContext } from 'src/AppContext';

// Utils
import { fNumber } from 'src/utils/formatNumber';

// Redux
import { useSelector } from "react-redux";
import { selectMetrics } from "src/redux/statusSlice";

import NumberTooltip from 'src/components/NumberTooltip';
import { currencySymbols } from 'src/utils/constants';

// ----------------------------------------------------------------------

export default function ExtraDesc({ token }) {
    const BASE_URL = process.env.API_URL;
    const theme = useTheme();
    const metrics = useSelector(selectMetrics);

    const { accountProfile, setLoading, openSnackbar, activeFiatCurrency } = useContext(AppContext);
    const isAdmin = accountProfile && accountProfile.account && accountProfile.admin;

    const {
        md5,
        name,
        amount,
        supply,
        exch,
        vol24h,
        marketcap,
        vol24htx,
        vol24hx,
        vol24hxrp,
        holders,
        offers,
        id,
        issuer,
        currency,
        date,
        trustlines,
    } = token;

    const [omcf, setOMCF] = useState(token.isOMCF || "no"); // is Old Market Cap Formula

    let user = token.user;
    if (!user) user = name;

    const circulatingSupply = fNumber(supply);
    const totalSupply = fNumber(amount);
    const volume = fNumber(vol24hx);
    const voldivmarket = marketcap > 0 ? Decimal.div(vol24hxrp, marketcap).toNumber() : 0; // .toFixed(5, Decimal.ROUND_DOWN)
    const convertedMarketCap = Decimal.div(marketcap, metrics[activeFiatCurrency]).toNumber(); // .toFixed(5, Decimal.ROUND_DOWN)
    const convertedVolume = Decimal.div(vol24hxrp, metrics[activeFiatCurrency]).toNumber(); // .toFixed(5, Decimal.ROUND_DOWN)

    const onChangeMarketCalculation = async () => {
        setLoading(true);
        try {
            const accountAdmin = accountProfile.account;
            const accountToken = accountProfile.token;

            const body = { md5 };

            const res = await axios.post(`${BASE_URL}/admin/toggle_marketcap_formula`, body, {
                headers: { 'x-access-account': accountAdmin, 'x-access-token': accountToken }
            });

            if (res.status === 200) {
                const ret = res.data;
                if (ret.status) {
                    setOMCF(ret.isOMCF);
                    openSnackbar('Successful!', 'success');
                } else {
                    const err = ret.err;
                    openSnackbar(err, 'error');
                }
            }
        } catch (err) {
            console.log(err);
        }
        setLoading(false);
    };

    const MarketTypography = withStyles({
        root: {
            color: "#2CD9C5"
        }
    })(Typography);

    const VolumeTypography = withStyles({
        root: {
            color: theme.palette.error.main
        }
    })(Typography);

    const SupplyTypography = withStyles({
        root: {
            color: "#3366FF"
        }
    })(Typography);

    const TotalSupplyTypography = withStyles({
        root: {
            color: theme.palette.warning.main
        }
    })(Typography);

    return (
        <Stack spacing={2}>
            <Grid item container>
                <Grid item xs={12} md={4} sx={{ display: { xs: 'none', md: 'block' }, borderRight: '1px solid', borderRightColor: theme.palette.divider }}>
                    <Stack direction="row" alignItems="center" gap={1} sx={{ pl: 3 }}>
                        <Typography variant="body1">Market cap</Typography>
                        <Tooltip title={<Typography style={{ display: 'inline-block' }} variant="body2">The total market value of {name} token's circulating supply represents its overall worth. This concept is similar to free-float capitalization in the stock market.<br/><br/>{omcf === 'yes' ? 'Price x Circulating Supply' : '(Price x Circulating Supply) x (Average daily trading volume / Average daily trading volume for all tokens)'}.</Typography>}>
                            <Icon icon={infoFilled} />
                        </Tooltip>
                        {isAdmin &&
                            <FormGroup sx={{ ml: 2 }}>
                                <FormControlLabel control={
                                    <Checkbox
                                        size="small"
                                        checked={omcf === 'yes'}
                                        onClick={() => { onChangeMarketCalculation() }}
                                        inputProps={{ 'aria-label': 'controlled' }}
                                    />
                                }
                                    label="Use original formula"
                                />
                            </FormGroup>
                        }
                    </Stack>
                    <Stack alignItems="center">
                        <MarketTypography variant="desc" sx={{ mt: 3, mb: 3 }}>{currencySymbols[activeFiatCurrency]} {fNumber(convertedMarketCap)}</MarketTypography>
                    </Stack>
                    <Stack direction="row" alignItems="center" gap={1} sx={{ pl: 3 }}>
                        <Typography variant="body1">Volume / Marketcap</Typography>
                        <Tooltip title={<Typography variant="body2">This metric represents the ratio of trading volume within the past 24 hours to the market capitalization of {name} token. It provides insights into the token's liquidity and trading activity relative to its overall market value.</Typography>}>
                            <Icon icon={infoFilled} />
                        </Tooltip>
                    </Stack>
                    <Stack alignItems="center">
                        <VolumeTypography variant="subtitle2" sx={{ mt: 1, mb: 1 }}>{fNumber(voldivmarket)}</VolumeTypography>
                    </Stack>
                </Grid>

                <Grid item xs={12} md={4} sx={{ display: { xs: 'none', md: 'block' }, borderRight: '1px solid', borderRightColor: theme.palette.divider }}>
                    <Stack direction="row" alignItems="center" gap={1} sx={{ pl: 3 }}>
                        <Typography variant="body1">Volume (24h)</Typography>
                        <Tooltip title={<Typography variant="body2">Trading volume of {name} tokens within the past 24 hours.</Typography>}>
                            <Icon icon={infoFilled} />
                        </Tooltip>
                    </Stack>
                    <Stack alignItems="center">
                        
                        <VolumeTypography variant="desc" sx={{ mt: 3, mb: 2 }}>{currencySymbols[activeFiatCurrency]} {fNumber(convertedVolume)} </VolumeTypography>
                        <VolumeTypography variant="desc" sx={{ mt: 3, mb: 2 }}><NumberTooltip number={volume} /> <VolumeTypography variant="small">{name}</VolumeTypography></VolumeTypography>
                    </Stack>
                </Grid>

                <Grid item xs={12} md={4} sx={{ display: { xs: 'none', md: 'block' } }}>
                    <Stack direction="row" alignItems="center" gap={1} sx={{ pl: 3 }}>
                        <Typography variant="body1">Circulating Supply</Typography>
                        <Tooltip title={<Typography variant="body2">The number of {name} tokens in circulation within the market and held by the public is comparable to the concept of outstanding shares in the stock market.</Typography>}>
                            <Icon icon={infoFilled} />
                        </Tooltip>
                    </Stack>
                    <Stack alignItems="center">
                        <SupplyTypography color="primary" variant="desc" sx={{ mt: 3, mb: 2 }}>{circulatingSupply}</SupplyTypography>
                    </Stack>

                    <Stack direction="row" alignItems="center" gap={1} sx={{ pl: 3 }}>
                        <Typography variant="body1">Total Supply</Typography>
                        <Tooltip title={<Typography variant="body2">Total number of {name} tokens that have been issued. This includes tokens that are in circulation as well as those that are not currently active in the market.</Typography>}>
                            <Icon icon={infoFilled} />
                        </Tooltip>
                    </Stack>
                    <Stack alignItems="center">
                        <TotalSupplyTypography variant="desc" sx={{ mt: 1, mb: 1 }}>{totalSupply}</TotalSupplyTypography>
                    </Stack>
                </Grid>
            </Grid>
        </Stack>
    );
}
