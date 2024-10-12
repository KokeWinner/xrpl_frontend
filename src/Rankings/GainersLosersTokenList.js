// Material
import {
    useTheme,
    styled,
    Stack,
    Typography,
    Table,
    TableBody,
    Box,
} from '@mui/material';

// Context
import { useContext } from 'react';
import { AppContext } from 'src/AppContext';

import { useState, useEffect } from 'react';
import axios from 'axios';

import {
    LazyLoadImage,
} from 'react-lazy-load-image-component';
const TokenImage = styled(LazyLoadImage)(({ theme }) => ({
    borderRadius: '50%',
    overflow: 'hidden'
}));

// Redux
import { useSelector } from "react-redux";
import { selectMetrics } from "src/redux/statusSlice";

// Components
import GainersLosersTokenListHead from './GainersLosersTokenListHead';
import { GainersLosersTokenRow } from './GainersLosersTokenRow';

import { useRef } from 'react';

export default function GainersLosersTTokenList({ }) {
    const metrics = useSelector(selectMetrics);
    const BASE_URL = process.env.API_URL;//'http://65.108.4.235:3000/api';//process.env.API_URL;

    const { accountProfile, darkMode, activeFiatCurrency } = useContext(AppContext);
    const isAdmin = accountProfile && accountProfile.account && accountProfile.admin;

    const theme = useTheme();

    const [countGainers, setCountGainers] = useState(0);
    const [tokensGainers, setTokensGainers] = useState([]);

    const [countLosers, setCountLosers] = useState(0);
    const [tokensLosers, setTokensLosers] = useState([]);

    const [editToken, setEditToken] = useState(null);
    const [trustToken, setTrustToken] = useState(null);

    var TokenListHeadComponent = GainersLosersTokenListHead;
    var TokenRowComponent = GainersLosersTokenRow;
    var showNew = false;

    const sortBy = 'pro24h';
    useEffect(() => {
        function getTokens(sortType) {
            axios.get(`${BASE_URL}/tokens?start=0&limit=30&sortBy=${sortBy}&sortType=${sortType}&filter=&tags=&showNew=${showNew}&showSlug=false`)
                .then(res => {
                    let ret = res.status === 200 ? res.data : undefined;
                    if (ret) {
                        if (sortType == 'desc') {
                            setCountGainers(ret.count);
                            setTokensGainers(ret.tokens);
                        } else {
                            setCountLosers(ret.count);
                            setTokensLosers(ret.tokens);
                        }
                    }
                }).catch(err => {
                    console.log("Error on getting GainersLosers!", err);
                }).then(function () {
                    // always executed
                });
        }
        getTokens('desc');
        getTokens('asc');
    }, []);

    const tableRef = useRef(null);
    const [scrollLeft, setScrollLeft] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            setScrollLeft(tableRef?.current?.scrollLeft > 0);
        };

        tableRef?.current?.addEventListener('scroll', handleScroll);

        return () => {
            tableRef?.current?.removeEventListener('scroll', handleScroll);
        };
    }, []);

    return (
        <>

            <Box
                sx={{
                    display: "flex-row",
                    gap: 1,
                    py: 1,
                    overflow: "auto",
                    width: "100%",
                    "& > *": {
                        scrollSnapAlign: "center",
                    },
                    "::-webkit-scrollbar": { display: "none" },
                }}
                ref={tableRef}
            >
                <Stack>
                    <Typography variant="h3" fontSize='1.1rem' sx={{ mt: { xs: 4, md: 0 }, mb: 3 }}>Top gainers</Typography>
                    <Table sx={{
                        "& .MuiTableCell-root": {
                            borderBottom: "none",
                            boxShadow: darkMode
                                ? "inset 0 -1px 0 rgba(68 67 67), inset 0 -1px 0 rgba(255, 255, 255, 0.1)"
                                : "inset 0 -1px 0 #dadee3",
                        }
                    }}>
                        {countGainers > 0 &&
                            <TokenListHeadComponent scrollLeft={scrollLeft} tokens={tokensGainers} />
                        }
                        <TableBody>
                            {
                                tokensGainers.map((row, idx) => {
                                    return (
                                        <TokenRowComponent
                                            key={idx}
                                            time={row.time}
                                            token={row}
                                            admin={isAdmin}
                                            setEditToken={setEditToken}
                                            setTrustToken={setTrustToken}
                                            scrollLeft={scrollLeft}
                                            activeFiatCurrency={activeFiatCurrency}
                                            exchRate={metrics[activeFiatCurrency]}
                                        />
                                    );
                                })
                            }
                        </TableBody>
                    </Table>
                    <Typography variant="h3" fontSize='1.1rem' sx={{ mt: { xs: 4, md: 0, lg: 4 }, mb: 3 }}>Top losers</Typography>
                    <Table sx={{
                        "& .MuiTableCell-root": {
                            borderBottom: "none",
                            boxShadow: darkMode
                                ? "inset 0 -1px 0 rgba(68 67 67), inset 0 -1px 0 rgba(255, 255, 255, 0.1)"
                                : "inset 0 -1px 0 #dadee3",
                        }
                    }}>
                        {countLosers > 0 &&
                            <TokenListHeadComponent scrollLeft={scrollLeft} tokens={tokensLosers} />
                        }
                        <TableBody>
                            {
                                tokensLosers.map((row, idx) => {
                                    return (
                                        <TokenRowComponent
                                            key={idx}
                                            time={row.time}
                                            token={row}
                                            admin={isAdmin}
                                            setEditToken={setEditToken}
                                            setTrustToken={setTrustToken}
                                            scrollLeft={scrollLeft}
                                            activeFiatCurrency={activeFiatCurrency}
                                            exchRate={metrics[activeFiatCurrency]}
                                        />
                                    );
                                })
                            }
                        </TableBody>
                    </Table>
                </Stack>
            </Box>

        </>
    );
}