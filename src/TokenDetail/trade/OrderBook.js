import Decimal from 'decimal.js';
import React, { useEffect, useState } from 'react';

// Material
import {
    styled,
    useTheme,
    Box,
    Grid,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Tooltip,
    Typography
} from '@mui/material';
import { tableCellClasses } from "@mui/material/TableCell";

// Components
import Spread from './Spread';

// Utils
import { fNumber } from 'src/utils/formatNumber';

import NumberTooltip from 'src/components/NumberTooltip';

const LoaderContainer = styled('div')({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '49vh'
});

const ORDER_TYPE_BIDS = 1;
const ORDER_TYPE_ASKS = 2;

export default function OrderBook({pair, asks, bids, onAskClick, onBidClick}) {
    const theme = useTheme();
    const [isPageVisible, setIsPageVisible] = useState(true);
    const [selected, setSelected] = useState([0, 0]);

    // Page Visibility detection
    useEffect(() => {
        // Set the name of the hidden property and the change event for visibility
        let hidden = '';
        let visibilityChange = '';

        if (typeof document.hidden !== 'undefined') { // Opera 12.10 and Firefox 18 and later support
            hidden = 'hidden';
            visibilityChange = 'visibilitychange';
        } else { // @ts-ignore
            if (typeof document.msHidden !== 'undefined') {
                hidden = 'msHidden';
                visibilityChange = 'msvisibilitychange';
            } else { // @ts-ignore
                if (typeof document.webkitHidden !== 'undefined') {
                    hidden = 'webkitHidden';
                    visibilityChange = 'webkitvisibilitychange';
                }
            }
        }

        const handleVisibilityChange = () => {
            const isHidden = document['hidden'];
            if (isHidden) {
                //document.title = 'Orderbook Paused';
                setIsPageVisible(false);
            } else {
                //document.title = 'Orderbook';
                setIsPageVisible(true);
            }
        };

        // Warn if the browser doesn't support addEventListener or the Page Visibility API
        if (typeof document.addEventListener === 'undefined' || hidden === '') {
            console.log('This demo requires a browser, such as Google Chrome or Firefox, that supports the Page Visibility API.');
        } else {
            // Handle page visibility change
            document.addEventListener(visibilityChange, handleVisibilityChange, false);
        }
    }, []);

    const getIndicatorProgress = (value) => {
        if(isNaN(value)) throw new Error('Needs a value')

        let totA
        let avgA

        if (asks.length >= 1) {
            totA = Number(asks[asks.length - 1].sumAmount)
            avgA = totA / asks.length
        }

        let totB
        let avgB

        if (bids.length >= 1) {
            totB = Number(bids[bids.length - 1].sumAmount)
            avgB = totB / bids.length
        }

        const avg = (Number(avgA) + Number(avgB)) / 2
        
        const max100 = avg / 50 * 100

        const progress = value / max100 > 1 ? 1 : (value / max100).toFixed(2)

        const percentage = (progress * 100).toFixed(0)

        return percentage
    }

    const onBidMouseOver = (e, idx) => {
        setSelected([idx + 1, 0]);
    }

    const onAskMouseOver = (e, idx) => {
        setSelected([0, idx + 1]);
    }

    const onMouseLeave = (e, idx) => {
        setSelected([0, 0]);
    }

    const buildPriceLevels = (levels, orderType = ORDER_TYPE_BIDS) => {
        return (
            levels.slice(0, 30).map((level, idx) => {
                // const id = level.id;
                let price = level.price;//fNumber(level.price);
                let avgPrice = level.avgPrice;
                let amount = level.amount; // fNumber(level.amount);
                const value = level.value.toFixed(2); // fNumber(level.value);
                let sumAmount = level.sumAmount; // fNumber(level.sumAmount);
                const sumValue = level.sumValue; // fNumber(level.sumValue);
                const isNew = level.isNew;
                const isBid = orderType === ORDER_TYPE_BIDS;
                const depth = getIndicatorProgress(level.amount);
                const currName1 = pair?.curr1.name;
                const currName2 = pair?.curr2.name;
                
                avgPrice = fNumber(avgPrice);//fmNumber(avgPrice, 5);
                price = fNumber(price);//fmNumber(price, 5);
                amount = fNumber(amount);//fmNumber(amount, 2);
                sumAmount = fNumber(sumAmount);//fmNumber(sumAmount, 2);
                sumValue = fNumber(sumValue);//fmNumber(sumValue, 2);
              
                let bidBackgroundColor;
                if (isNew)
                    bidBackgroundColor = `#00AB5588`;
                else
                    bidBackgroundColor = `linear-gradient(to right, #00AB5533, rgba(0, 0, 0, 0.0) ${depth}%, rgba(0, 0, 0, 0.0))`;
                    // bidBackgroundColor = `#00AB55${depth}`;

                let askBackgroundColor;
                if (isNew)
                    askBackgroundColor = `#FF484288`;
                else
                    askBackgroundColor = `linear-gradient(to left, #FF484233, rgba(0, 0, 0, 0.0) ${depth}%, rgba(0, 0, 0, 0.0))`;
                    // askBackgroundColor = `#FF4842${depth}`;

                if (idx < selected[0])
                    bidBackgroundColor = `#00AB5588`;

                if (idx < selected[1])
                    askBackgroundColor = `#FF484288`;

                // TableRow
                // sx={{
                //     cursor: 'pointer',
                //     background: `${bidBackgroundColor}`,
                //     "&:hover": {
                //         background: "#00AB5588 !important"
                //     },
                //     transition: "all .3s ease",
                //     WebkitTransition: "all .3s ease",
                //     MozTransition: "all .3s ease",
                // }}

                return (
                    <Tooltip
                        key={`${orderType}-${price}-${amount}`}
                        title={
                            <Table
                                sx={{
                                    [`& .${tableCellClasses.root}`]: {
                                        borderBottom: "0px solid",
                                        borderBottomColor: theme.palette.divider
                                    }
                                }}
                            >
                                <TableBody>
                                    <TableRow>
                                        <TableCell align='right' width='30px' sx={{pt:1, pb:1}}>
                                            <Typography variant='body2'>Avg Price:</Typography>
                                        </TableCell>
                                        <TableCell sx={{pt:1, pb:1}}>
                                            <Typography variant='body2'>≈  <NumberTooltip number={avgPrice} /></Typography>
                                        </TableCell>
                                    </TableRow>

                                    <TableRow>
                                        <TableCell align='right' sx={{pt:1, pb:1}}>
                                            <Typography variant='body2' noWrap>Sum {currName1}:</Typography>
                                        </TableCell>
                                        <TableCell sx={{pt:1, pb:1}}>
                                            <Typography variant='body2'>{sumAmount}</Typography>
                                        </TableCell>
                                    </TableRow>

                                    <TableRow>
                                        <TableCell sx={{pt:1, pb:1}} align='right'>
                                            <Typography variant='body2' noWrap>Sum {currName2}:</Typography>
                                        </TableCell>
                                        <TableCell sx={{pt:1, pb:1}}>
                                            <Typography variant='body2'>{sumValue}</Typography>
                                        </TableCell>
                                    </TableRow>

                                </TableBody>
                            </Table>
                        }
                        placement='right-end' arrow
                    >
                    {isBid ?
                        <TableRow
                            hover
                            sx={{
                                cursor: 'pointer',
                                background: `${bidBackgroundColor}`,
                                "&:hover": {
                                    background: "#00AB5588 !important"
                                }
                            }}
                            onMouseOver={e=>onBidMouseOver(e, idx)}
                            onMouseLeave={e=>onMouseLeave(e, idx)}
                            onClick={e=>onBidClick(e, idx)}
                        >
                            <TableCell sx={{ p:0 }} align="right">{sumAmount}</TableCell>
                            {/* <TableCell sx={{ p:0 }} align="right">{value}</TableCell> */}
                            <TableCell sx={{ p:0 }} align="right">{amount}</TableCell>
                            {/* <TableCell sx={{ p:0, pr:1 }} align="right">{price}</TableCell> */}
                            <TableCell sx={{ p:0, pr:1 }} align="right" style={{color: `${isNew || selected[0] > idx?'':'#118860'}`}}><NumberTooltip number={price} pos='bottom' /></TableCell>
                        </TableRow>
                    :
                        <TableRow
                            hover
                            sx={{
                                cursor: 'pointer',
                                background: `${askBackgroundColor}`,
                                "&:hover": {
                                    background: "#FF484288 !important"
                                },
                            }}
                            onMouseOver={e=>onAskMouseOver(e, idx)}
                            onMouseLeave={e=>onMouseLeave(e, idx)}
                            onClick={e=>onAskClick(e, idx)}
                        >
                            {/* <TableCell sx={{ p:0, pl:1 }}>{price}</TableCell> */}
                            <TableCell sx={{ p:0, pl:1 }} style={{color: `${isNew || selected[1] > idx?'':'#bb3336'}`}}><NumberTooltip number={price} pos='bottom' /></TableCell>
                            <TableCell sx={{ p:0 }}>{amount}</TableCell>
                            {/* <TableCell sx={{ p:0 }}>{value}</TableCell> */}
                            <TableCell sx={{ p:0 }}>{sumAmount}</TableCell>
                        </TableRow>
                    }
                    </Tooltip>
                );
            })
        );
    };

    if (isPageVisible) {
        return (
        <Stack>
            <Grid container spacing={0} sx={{p:0}}>
                <Grid item xs={12} md={6} lg={6}>
                    <Stack direction='row' alignItems='center'>
                        <Typography variant='subtitle1' sx={{color:'#007B55', ml:0, mt:2, mb:1}}>Buy Orders({bids.length})</Typography>
                        <Box sx={{ flexGrow: 1 }} />
                        <Spread bids={bids} asks={asks}/>
                    </Stack>
                    <Table
                        stickyHeader
                        size={'small'}
                        sx={{
                            [`& .${tableCellClasses.root}`]: {
                                borderBottom: "0px solid",
                                borderBottomColor: theme.palette.divider
                            }
                        }}
                    >
                        <TableHead>
                            <TableRow
                                key={'BID_KEY'}
                                sx={{
                                    [`& .${tableCellClasses.root}`]: {
                                        borderBottom: "1px solid",
                                        borderBottomColor: theme.palette.divider
                                    }
                                }}
                            >
                                <TableCell align="right" sx={{ p:0 }}>Sum</TableCell>
                                {/* <TableCell align="right" sx={{ p:0 }}>Value</TableCell> */}
                                <TableCell align="right" sx={{ p:0 }}>Amount ({pair.curr1.name})</TableCell>
                                <TableCell align="right" sx={{ p:0, pr: 1 }}>Bid ({pair.curr2.name})</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {buildPriceLevels(bids, ORDER_TYPE_BIDS)}
                        </TableBody>
                    </Table>
                </Grid>
                <Grid item xs={12} md={6} lg={6} sx={{p:0}}>
                    <Typography align='right' variant='subtitle1' sx={{color:'#B72136', ml:2, mt:2, mb:1}}>Sell Orders({asks.length})</Typography>
                    <Table
                        stickyHeader
                        size={'small'}
                        sx={{
                            [`& .${tableCellClasses.root}`]: {
                                borderBottom: "0px solid",
                                borderBottomColor: theme.palette.divider
                            }
                        }}
                    >
                        <TableHead>
                            <TableRow
                                key={'ASK_KEY'}
                                sx={{
                                    [`& .${tableCellClasses.root}`]: {
                                        borderBottom: "1px solid",
                                        borderBottomColor: theme.palette.divider
                                    }
                                }}
                            >
                                <TableCell align="left" sx={{ p:0, pl: 1 }}>Ask ({pair.curr2.name})</TableCell>
                                <TableCell align="left" sx={{ p:0 }}>Amount ({pair.curr1.name})</TableCell>
                                {/* <TableCell align="left" sx={{ p:0 }}>Value</TableCell> */}
                                <TableCell align="left" sx={{ p:0 }}>Sum</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {buildPriceLevels(asks, ORDER_TYPE_ASKS)}
                        </TableBody>
                    </Table>
                </Grid>
            </Grid>
            {bids.length === 0 && asks.length === 0 &&
                <LoaderContainer>
                    {/* <PuffLoader color={"#00AB55"} size={50} /> */}
                </LoaderContainer>
            }
        </Stack> )
    } else
        return 'HIDDEN PAGE.';
};