import axios from 'axios'
import PropTypes from 'prop-types';
import { useState, useEffect, useRef } from 'react';
import Decimal from 'decimal.js';
// Material
import { withStyles } from '@mui/styles';
import {
    styled,
} from '@mui/material';

import {
    Avatar,
    Backdrop,
    Box,
    Container,
    IconButton,
    Link,
    Stack,
    Tab,
    Tabs,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Tooltip,
    Typography
} from '@mui/material';
import CancelIcon from '@mui/icons-material/Cancel';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

// Loader
import { PuffLoader, PulseLoader } from "react-spinners";
import { ProgressBar, Discuss } from 'react-loader-spinner';


// Utils
import { checkExpiration } from 'src/utils/extra';
import { formatDateTime } from 'src/utils/formatTime';

// Context
import { useContext } from 'react'
import { AppContext } from 'src/AppContext'

// Components
import QRDialog from 'src/components/QRDialog';
import ListToolbar from './ListToolbar';

// ----------------------------------------------------------------------

//import StackStyle from 'src/components/StackStyle';
// ----------------------------------------------------------------------

const BuyTypography = withStyles({
    root: {
        color: "#007B55",
        borderRadius: '5px',
        border: '0.05em solid #007B55',
        fontSize: '0.7rem',
        lineHeight: '1',
        paddingLeft: '8px',
        paddingRight: '8px',
        paddingTop: '3px',
        paddingBottom: '3px',
    }
})(Typography);

const SellTypography = withStyles({
    root: {
        color: "#B72136",
        borderRadius: '5px',
        border: '0.05em solid #B72136',
        fontSize: '0.7rem',
        lineHeight: '1',
        paddingLeft: '6px',
        paddingRight: '6px',
        paddingTop: '3px',
        paddingBottom: '3px',
    }
})(Typography);

function truncate(str, n) {
    if (!str) return '';
    //return (str.length > n) ? str.substr(0, n-1) + '&hellip;' : str;
    return (str.length > n) ? str.substr(0, n-1) + ' ...' : str;
};

function truncateAccount(str) {
    if (!str) return '';
    return str.slice(0, 9) + '...' + str.slice(-9);
};


export default function OfferList({account}) {
    const BASE_URL = 'https://api.xrpl.to/api';
    
    const { accountProfile, openSnackbar, sync, setSync, darkMode } = useContext(AppContext);
    const isLoggedIn = accountProfile && accountProfile.account;
    const [openScanQR, setOpenScanQR] = useState(false);
    const [uuid, setUuid] = useState(null);
    const [qrUrl, setQrUrl] = useState(null);
    const [nextUrl, setNextUrl] = useState(null);

    const [loading, setLoading] = useState(false);
    const [pageLoading, setPageLoading] = useState(false);

    const [page, setPage] = useState(0);
    const [rows, setRows] = useState(10);
    const [total, setTotal] = useState(0);
    const [offers, setOffers] = useState([]);
    
    useEffect(() => {
        function getOffers() {
            setLoading(true);
            // https://api.xrpl.to/api/account/offers/r22G1hNbxBVapj2zSmvjdXyKcedpSDKsm
            axios.get(`${BASE_URL}/account/offers/${account}?page=${page}&limit=${rows}`)
                .then(res => {
                    let ret = res.status === 200 ? res.data : undefined;
                    if (ret) {
                        setTotal(ret.total);
                        setOffers(ret.offers);
                    }
                }).catch(err => {
                    console.log("Error on getting account orders!!!", err);
                }).then(function () {
                    // always executed
                    setLoading(false);
                });
        }
        getOffers();
    }, [account, sync, page, rows]);

    const handleCancel = (event, account, seq) => {
        if (!isLoggedIn) {
            openSnackbar('Please connect wallet!', 'error');
        } else if (accountProfile.account !== account) {
            openSnackbar('You are not the owner of this offer!', 'error');
        } else {
            onOfferCancelXumm(seq);
        }
    }

    useEffect(() => {
        var timer = null;
        var isRunning = false;
        var counter = 150;
        async function getPayload() {
            if (isRunning) return;
            isRunning = true;
            try {
                const ret = await axios.get(`${BASE_URL}/xumm/payload/${uuid}`);
                const res = ret.data.data.response;

                const resolved_at = res.resolved_at;
                const dispatched_result = res.dispatched_result;
                if (resolved_at) {
                    setOpenScanQR(false);
                    if (dispatched_result === 'tesSUCCESS') {
                        // TRIGGER account refresh
                        setSync(sync + 1);
                    }
                    return;
                }
            } catch (err) {
            }
            isRunning = false;
            counter--;
            if (counter <= 0) {
                setOpenScanQR(false);
            }
        }
        if (openScanQR) {
            timer = setInterval(getPayload, 2000);
        }
        return () => {
            if (timer) {
                clearInterval(timer)
            }
        };
    }, [openScanQR, uuid]);

    const onOfferCancelXumm = async (seq) => {
        setLoading(true);
        try {
            const OfferSequence = seq;

            const user_token = accountProfile.user_token;
            
            const body={OfferSequence, user_token};

            const res = await axios.post(`${BASE_URL}/offer/cancel`, body);

            if (res.status === 200) {
                const uuid = res.data.data.uuid;
                const qrlink = res.data.data.qrUrl;
                const nextlink = res.data.data.next;

                setUuid(uuid);
                setQrUrl(qrlink);
                setNextUrl(nextlink);
                setOpenScanQR(true);
            }
        } catch (err) {
            alert(err);
        }
        setLoading(false);
    };

    const onDisconnectXumm = async (uuid) => {
        setLoading(true);
        try {
            const res = await axios.delete(`${BASE_URL}/offer/logout/${uuid}`);
            if (res.status === 200) {
                setUuid(null);
            }
        } catch(err) {
        }
        setLoading(false);
    };

    const handleScanQRClose = () => {
        setOpenScanQR(false);
        onDisconnectXumm(uuid);
    };

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

    // https://api.sologenic.org/api/v1/trades?symbol=534F4C4F00000000000000000000000000000000%2BrsoLo2S1kiGeCcn6hCUXVrCpGMWLrRrLZz%2FXRP&account=r22G1hNbxBVapj2zSmvjdXyKcedpSDKsm
    
    return (
        <Container maxWidth="xl" sx={{pl: 0, pr: 0}}>
            <Backdrop
                sx={{ color: '#000', zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={pageLoading}
            >
                <ProgressBar
                    height="80"
                    width="80"
                    ariaLabel="progress-bar-loading"
                    wrapperStyle={{}}
                    wrapperClass="progress-bar-wrapper"
                    borderColor='#F4442E'
                    barColor='#51E5FF'
                />
            </Backdrop>

            <QRDialog
                open={openScanQR}
                type="OfferCancel"
                onClose={handleScanQRClose}
                qrUrl={qrUrl}
                nextUrl={nextUrl}
            />

            {loading ? (
                <Stack alignItems="center">
                    <PulseLoader color={darkMode ? '#007B55' : '#5569ff'} size={10} />
                </Stack>
            ) : (
                offers && offers.length === 0 &&
                <Stack alignItems="center" sx={{ mt: 2, mb: 1 }}>
                    <ErrorOutlineIcon fontSize="small" sx={{ mr: '5px' }} />
                    <Typography variant="s6" color='primary'>[ No Offers ]</Typography>
                </Stack>
            )
            }

            {total > 0 &&

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
                ref={tableRef}
            >
                <Table stickyHeader size={'small'}
                    sx={{
                        "& .MuiTableCell-root": {
                            borderBottom: "none",
                            boxShadow: darkMode
                                ? "inset 0 -1px 0 rgba(68 67 67), inset 0 -1px 0 rgba(255, 255, 255, 0.1)"
                                : "inset 0 -1px 0 #dadee3",
                        }
                    }}
                >
                    <TableHead>
                        <TableRow>
                            <TableCell align="left" sx={{
                                position: "sticky",
                                zIndex: 1001,
                                left: 0,
                                background: darkMode ? "#000000" : '#FFFFFF'
                            }}></TableCell>
                            <TableCell align="left" sx={{
                                position: "sticky",
                                zIndex: 1002,
                                left: 32,
                                background: darkMode ? "#000000" : '#FFFFFF',
                                '&:before': (scrollLeft ? {
                                    content: "''",
                                    boxShadow: "inset 10px 0 8px -8px #00000026",
                                    position: "absolute",
                                    top: "0",
                                    right: "0",
                                    bottom: "-1px",
                                    width: "30px",
                                    transform: "translate(100%)",
                                    transition: "box-shadow .3s",
                                    pointerEvents: "none",
                                } : {})
                            }}>#</TableCell>
                            <TableCell align="left">Taker Gets</TableCell>
                            <TableCell align="left">Taker Pays</TableCell>
                            <TableCell align="left">Seq</TableCell>
                            <TableCell align="left">Account</TableCell>
                            <TableCell align="left">Expire</TableCell>
                            <TableCell align="left">Modified</TableCell>
                            <TableCell align="left">Created</TableCell>
                            <TableCell align="left">Hash</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                    {
                        offers.map((row, idx) => {
                                /*{
                                    "_id": "r22G1hNbxBVapj2zSmvjdXyKcedpSDKsm_71158478",
                                    "account": "r22G1hNbxBVapj2zSmvjdXyKcedpSDKsm",
                                    "seq": 71158478,
                                    "flags": 0,
                                    "gets": {
                                        "issuer": "XRPL",
                                        "currency": "XRP",
                                        "name": "XRP",
                                        "value": "5"
                                    },
                                    "pays": {
                                        "issuer": "rLpunkscgfzS8so59bUCJBVqZ3eHZue64r",
                                        "currency": "4C656467657250756E6B73000000000000000000",
                                        "name": "LedgerPunks",
                                        "value": "5000"
                                    },
                                    "pair": "1e766311a6e689cd7225b5923ed5811c"
                                },*/
                                const {
                                    _id,
                                    account,
                                    seq,
                                    flags,
                                    gets,
                                    pays,
                                    expire,
                                    user,
                                    chash,
                                    ctime,
                                    mhash,
                                    mtime
                                } = row;

                                const expired = checkExpiration(expire);

                                const strCreatedTime = formatDateTime(ctime);
                                const strModifiedTime = formatDateTime(mtime);
                                const strExpireTime = expire?formatDateTime(expire):"";
                                
                                return (
                                    <TableRow
                                        key={_id}
                                        sx={{
                                            "&:hover": {
                                                "& .MuiTableCell-root": {
                                                    backgroundColor: darkMode ? "#232326 !important" : "#D9DCE0 !important"
                                                }
                                            }
                                        }}
                                    >
                                        <TableCell align="left" sx={{
                                            position: "sticky",
                                            zIndex: 1001,
                                            left: 0,
                                            background: darkMode ? "#000000" : '#FFFFFF'
                                        }}>
                                            <Tooltip title="Cancel Offer">
                                                <IconButton color='error' onClick={e=>handleCancel(e, account, seq)} aria-label="cancel">
                                                    <CancelIcon fontSize='small'/>
                                                </IconButton>
                                            </Tooltip>
                                        </TableCell>

                                        <TableCell align="left" sx={{
                                            position: "sticky",
                                            zIndex: 1002,
                                            left: 32,
                                            background: darkMode ? "#000000" : '#FFFFFF',
                                            '&:before': (scrollLeft ? {
                                                content: "''",
                                                boxShadow: "inset 10px 0 8px -8px #00000026",
                                                position: "absolute",
                                                top: "0",
                                                right: "0",
                                                bottom: "-1px",
                                                width: "30px",
                                                transform: "translate(100%)",
                                                transition: "box-shadow .3s",
                                                pointerEvents: "none",
                                            } : {})
                                        }}>
                                            <Typography variant="s6" noWrap>{idx + page * rows + 1}</Typography>
                                        </TableCell>

                                        <TableCell align="left">
                                            <Typography variant="s6" noWrap>{gets.value} <Typography variant="small">{gets.name}</Typography></Typography>
                                        </TableCell>

                                        <TableCell align="left">
                                            <Typography variant="s6" noWrap>{pays.value} <Typography variant="small">{pays.name}</Typography></Typography>
                                        </TableCell>

                                        <TableCell align="left">
                                            <Typography variant="s6" noWrap>{seq}</Typography>
                                        </TableCell>

                                        <TableCell align="left">
                                            <Link
                                                // underline="none"
                                                // color="inherit"
                                                target="_blank"
                                                href={`https://bithomp.com/explorer/${account}`}
                                                rel="noreferrer noopener nofollow"
                                            >
                                                <Typography variant="s6" color="primary" noWrap>{truncateAccount(account)}</Typography>
                                            </Link>
                                        </TableCell>

                                        <TableCell align="left">
                                            <Typography variant="s6" noWrap>{strExpireTime}</Typography>
                                        </TableCell>

                                        <TableCell align="left">
                                            <Typography variant="s6" noWrap>{strModifiedTime}</Typography>
                                        </TableCell>

                                        <TableCell align="left">
                                            <Typography variant="s6" noWrap>{strCreatedTime}</Typography>
                                        </TableCell>

                                        <TableCell align="left">
                                            {chash &&
                                                <Stack direction="row" alignItems='center'>
                                                    <Link
                                                        // underline="none"
                                                        // color="inherit"
                                                        target="_blank"
                                                        href={`https://bithomp.com/explorer/${chash}`}
                                                        rel="noreferrer noopener nofollow"
                                                    >
                                                        <Stack direction="row" alignItems='center'>
                                                        <Typography variant="s6" noWrap color="primary">
                                                            {truncate(chash, 16)}
                                                            </Typography>
                                                            <IconButton edge="end" aria-label="bithomp">
                                                                <Avatar alt="Bithomp Explorer" src="/static/bithomp.ico" sx={{ width: 16, height: 16 }} />
                                                            </IconButton>
                                                        </Stack>
                                                    </Link>

                                                    <Link
                                                        // underline="none"
                                                        // color="inherit"
                                                        target="_blank"
                                                        href={`https://livenet.xrpl.org/transactions/${chash}`}
                                                        rel="noreferrer noopener nofollow"
                                                    >
                                                        <IconButton edge="end" aria-label="bithomp">
                                                            <Avatar alt="livenetxrpl.org Explorer" src="/static/livenetxrplorg.ico" sx={{ width: 16, height: 16 }} />
                                                        </IconButton>
                                                    </Link>
                                                </Stack>
                                            }
                                        </TableCell>

                                        
                                    </TableRow>
                                );
                            })}
                    </TableBody>
                </Table>
            </Box>
            }
            {total > 0 &&
                <ListToolbar
                    count={total}
                    rows={rows}
                    setRows={setRows}
                    page={page}
                    setPage={setPage}
                />
            }
        </Container>
    );
}
