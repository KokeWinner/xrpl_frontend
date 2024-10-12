import axios from 'axios'
import { useState, useEffect } from 'react';
import Decimal from 'decimal.js';
import {MD5} from "crypto-js";

// Material
import {
    styled, useTheme,
    Avatar,
    Box,
    IconButton,
    Link,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Typography
} from '@mui/material';
import { tableCellClasses } from "@mui/material/TableCell";

// Utils
import { fNumber } from 'src/utils/formatNumber';
import { normalizeCurrencyCodeXummImpl } from 'src/utils/normalizers';
import { formatDateTime } from 'src/utils/formatTime';

// Components
import HistoryToolbar from './HistoryToolbar';
// ----------------------------------------------------------------------

function truncate(str, n){
    if (!str) return '';
    //return (str.length > n) ? str.substr(0, n-1) + '&hellip;' : str;
    return (str.length > n) ? str.substr(0, n-1) + ' ...' : str;
};

function getMD5(issuer, currency) {
    return MD5(issuer  + '_' +  currency).toString();
}

export default function TradeList({account}) {
    const theme = useTheme();
    const BASE_URL = process.env.API_URL;

    const [page, setPage] = useState(0);
    const [rows, setRows] = useState(10);
    const [count, setCount] = useState(0);
    const [hists, setHists] = useState([]);
    
    const md5 = 'c9ac9a6c44763c1bd9ccc6e47572fd26';

    useEffect(() => {
        function getHistories() {
            // https://api.xrpl.to/api/history?md5=c9ac9a6c44763c1bd9ccc6e47572fd26&page=0&limit=10
            axios.get(`${BASE_URL}/history?md5=${md5}&page=${page}&limit=${rows}`)
                .then(res => {
                    let ret = res.status === 200 ? res.data : undefined;
                    if (ret) {
                        setCount(ret.count);
                        setHists(ret.hists);
                    }
                }).catch(err => {
                    console.log("Error on getting exchanges!!!", err);
                }).then(function () {
                    // always executed
                });
        }
        getHistories();
    }, [page, rows]);

    return (
        <>
            <Box
                sx={{
                    display: "flex",
                    gap: 1,
                    py: 1,
                    overflow: "auto",
                    width: "100%",
                    "& > *": {
                        scrollSnapAlign: "center",
                    },
                    "::-webkit-scrollbar": { display: "none" },
                }}
            >
                <Table stickyHeader sx={{
                    [`& .${tableCellClasses.root}`]: {
                        borderBottom: "1px solid",
                        borderBottomColor: theme.palette.divider
                    }
                }}>
                    <TableHead>
                        <TableRow>
                            <TableCell align="left">#</TableCell>
                            <TableCell align="left">Time</TableCell>
                            <TableCell align="left">Price</TableCell>
                            <TableCell align="left">Taker Paid</TableCell>
                            <TableCell align="left">Taker Got</TableCell>
                            <TableCell align="left">Taker</TableCell>
                            <TableCell align="left">Maker</TableCell>
                            <TableCell align="left">Ledger</TableCell>
                            <TableCell align="left">Hash</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                    {
                        // {
                        //     "_id": "23304962_1",
                        //     "dir": "buy",
                        //     "account": "rHmaZbZGqKWN7D45ue7J5cRu8yxyNdHeN2",
                        //     "paid": {
                        //         "issuer": "XRPL",
                        //         "currency": "XRP",
                        //         "name": "XRP",
                        //         "value": "179999.9982"
                        //     },
                        //     "got": {
                        //         "issuer": "rvYAfWj5gh67oV6fW32ZzP3Aw4Eubs59B",
                        //         "currency": "USD",
                        //         "name": "USD",
                        //         "value": "1096.755823946603"
                        //     },
                        //     "pair": "21e8e9b61d766f6187cb9009fda56e9e",
                        //     "hash": "98229608E154559663CBA8A78AF42AF7E803B40E5814CFABC639CA238A9E8DFE",
                        //     "ledger": 23304962,
                        //     "time": 1471034710000
                        // },
                        hists.map((row, idx) => {

                                const {
                                    _id,
                                    maker,
                                    taker,
                                    seq,
                                    paid,
                                    got,
                                    ledger,
                                    hash,
                                    time
                                } = row;

                                
                                const paidName = normalizeCurrencyCodeXummImpl(paid.currency);
                                const gotName = normalizeCurrencyCodeXummImpl(got.currency);
                                const md51 = getMD5(paid.issuer, paid.currency);
                                // const md52 = getMD5(got.issuer, got.currency);
                                
                                let exch;
                                let name;

                                if (md5 === md51) {
                                    // volume = got.value;
                                    exch = Decimal.div(got.value, paid.value).toNumber();
                                    name = gotName;
                                } else {
                                    // volume = paid.value;
                                    exch = Decimal.div(paid.value, got.value).toNumber();
                                    name = paidName;
                                }

                                const strDateTime = formatDateTime(time);

                                return (
                                    <TableRow
                                        hover
                                        key={_id}
                                    >
                                        <TableCell align="left"><Typography variant="subtitle2">{idx + page * rows + 1}</Typography></TableCell>
                                        <TableCell align="left">
                                            <Typography variant="caption">{strDateTime}</Typography>
                                        </TableCell>
                                        <TableCell align="left"><Typography variant="caption">{fNumber(exch)} {name}</Typography></TableCell>
                                        <TableCell align="left">
                                            {fNumber(paid.value)} <Typography variant="caption">{paidName}</Typography>
                                        </TableCell>

                                        <TableCell align="left">
                                            {fNumber(got.value)} <Typography variant="caption">{gotName}</Typography>
                                        </TableCell>

                                        <TableCell align="left">
                                            <Link
                                                // underline="none"
                                                // color="inherit"
                                                target="_blank"
                                                href={`https://bithomp.com/explorer/${taker}`}
                                                rel="noreferrer noopener nofollow"
                                            >
                                                {truncate(taker, 12)}
                                            </Link>
                                        </TableCell>

                                        <TableCell align="left">
                                            <Link
                                                // underline="none"
                                                // color="inherit"
                                                target="_blank"
                                                href={`https://bithomp.com/explorer/${maker}`}
                                                rel="noreferrer noopener nofollow"
                                            >
                                                {truncate(maker, 12)}
                                            </Link>
                                        </TableCell>
                                        <TableCell align="left">{ledger}</TableCell>
                                        <TableCell align="left">
                                            <Stack direction="row" alignItems='center'>
                                                <Link
                                                    // underline="none"
                                                    // color="inherit"
                                                    target="_blank"
                                                    href={`https://bithomp.com/explorer/${hash}`}
                                                    rel="noreferrer noopener nofollow"
                                                >
                                                    <Stack direction="row" alignItems='center'>
                                                        {truncate(hash, 16)}
                                                        <IconButton edge="end" aria-label="bithomp">
                                                            <Avatar alt="Bithomp Explorer" src="/static/bithomp.ico" sx={{ width: 16, height: 16 }} />
                                                        </IconButton>
                                                    </Stack>
                                                </Link>

                                                <Link
                                                    // underline="none"
                                                    // color="inherit"
                                                    target="_blank"
                                                    href={`https://livenet.xrpl.org/transactions/${hash}`}
                                                    rel="noreferrer noopener nofollow"
                                                >
                                                    <IconButton edge="end" aria-label="bithomp">
                                                        <Avatar alt="livenet.xrpl.org Explorer" src="/static/livenetxrplorg.ico" sx={{ width: 16, height: 16 }} />
                                                    </IconButton>
                                                </Link>
                                            </Stack>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                    </TableBody>
                </Table>
            </Box>
            <HistoryToolbar
                count={count}
                rows={rows}
                setRows={setRows}
                page={page}
                setPage={setPage}
            />
        </>
    );
}
