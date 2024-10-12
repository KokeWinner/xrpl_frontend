import axios from 'axios'
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import Decimal from 'decimal.js';
// Material
import { withStyles } from '@mui/styles';
import {
    styled,
} from '@mui/material';

import {
    Avatar,
    Box,
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
    Typography
} from '@mui/material';
import { tableCellClasses } from "@mui/material/TableCell";
import CancelIcon from '@mui/icons-material/Cancel';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';

// Loader
import { PuffLoader } from "react-spinners";


// Utils
import { checkExpiration } from 'src/utils/extra';

// Context
import { useContext } from 'react'
import { AppContext } from 'src/AppContext'

// Components
import QRDialog from 'src/components/QRDialog';
import { useRef } from 'react';

// ----------------------------------------------------------------------
import StackStyle from 'src/components/StackStyle'; //Maybe need to disable?
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

const ConnectWalletContainer = styled(Box)({
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'flex-end',
    height: '10vh'
});

function truncate(str, n) {
    if (!str) return '';
    //return (str.length > n) ? str.substr(0, n-1) + '&hellip;' : str;
    return (str.length > n) ? str.substr(0, n-1) + ' ...' : str;
};

export default function Orders({pair}) {
    const BASE_URL = process.env.API_URL;
    
    const { accountProfile, sync, setSync, darkMode } = useContext(AppContext);
    const accountAddress = accountProfile?.account;
    
    const [openScanQR, setOpenScanQR] = useState(false);
    const [uuid, setUuid] = useState(null);
    const [qrUrl, setQrUrl] = useState(null);
    const [nextUrl, setNextUrl] = useState(null);

    const [loading, setLoading] = useState(false);

    const [offers, setOffers] = useState([]);

    const curr1 = pair.curr1;
    const curr2 = pair.curr2;

    useEffect(() => {
        function getOffers() {
            const accountAddress = accountProfile?.account;
            if (!accountAddress) return;
            setLoading(true);
            // https://api.xrpl.to/api/account/offers/r22G1hNbxBVapj2zSmvjdXyKcedpSDKsm?pair=7f64eb975be54ed0f1717c522e2ad754
            axios.get(`${BASE_URL}/account/offers/${accountAddress}?pair=${pair.pair}`)
                .then(res => {
                    let ret = res.status === 200 ? res.data : undefined;
                    if (ret) {
                        // setCount(ret.count);
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
    }, [accountProfile, pair, sync]);

    const handleCancel = (event, seq) => {
        onOfferCancelXumm(seq);
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
                /*
                {
                    "hex": "120008228000000024043DCAC32019043DCAC2201B0448348868400000000000000F732103924E47158D3980DDAF7479A838EF3C0AE53D953BD2A526E658AC5F3EF0FA7D2174473045022100D10E91E2704A4BDAB510B599B8258956F9F34592B2B62BE383ED3E4DBF57DE2B02204837DD77A787D4E0DC43DCC53A7BBE160B164617FE3D0FFCFF9F6CC808D46DEE811406598086E863F1FF42AD87DCBE2E1B5F5A8B5EB8",
                    "txid": "EC13B221808A21EA1012C95FB0EF53BF0110D7AB2EB17104154A27E5E70C39C5",
                    "resolved_at": "2022-05-23T07:45:37.000Z",
                    "dispatched_to": "wss://s2.ripple.com",
                    "dispatched_result": "tesSUCCESS",
                    "dispatched_nodetype": "MAINNET",
                    "multisign_account": "",
                    "account": "r22G1hNbxBVapj2zSmvjdXyKcedpSDKsm"
                }
                */

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
        <Stack>{/*<StackStyle>*/}
            <QRDialog
                open={openScanQR}
                type="OfferCancel"
                onClose={handleScanQRClose}
                qrUrl={qrUrl}
                nextUrl={nextUrl}
            />
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
                            }}>Side</TableCell>
                            <TableCell align="left">Price</TableCell>
                            <TableCell align="left">Taker Gets</TableCell>
                            <TableCell align="left">Taker Pays</TableCell>
                            <TableCell align="left">Cancel</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                    {
                        offers.map((row) => {

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
                                    chash,
                                    ctime,
                                    mhash,
                                    mtime
                                } = row;

                                const expired = checkExpiration(expire);

                                let exch = 0;

                                let buy;
                                if (pays.issuer === curr1.issuer && pays.currency === curr1.currency) {
                                    // BUY
                                    buy = true;
                                    exch = new Decimal(gets.value).div(pays.value).toNumber();
                                } else {
                                    // SELL
                                    buy = false;
                                    exch = new Decimal(pays.value).div(gets.value).toNumber();
                                }

                                return (
                                    <TableRow
                                        key={_id}
                                        sx={{
                                            [`& .${tableCellClasses.root}`]: {
                                                color: (buy ? '#007B55' : '#B72136')  // this places color on table items in Open Orders
                                            },
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
                                            {
                                                buy ? (
                                                    <BuyTypography variant="caption">
                                                        BUY
                                                    </BuyTypography>
                                                ):(
                                                    <SellTypography variant="caption">
                                                        SELL
                                                    </SellTypography>
                                                )
                                            }
                                        </TableCell>
                                        <TableCell align="left">{exch}</TableCell>
                                        <TableCell align="left">
                                            <Typography variant="h6" noWrap>{gets.value} <Typography variant="small">{gets.name}</Typography></Typography>
                                        </TableCell>

                                        <TableCell align="left">
                                            <Typography variant="h6" noWrap>{pays.value} <Typography variant="small">{pays.name}</Typography></Typography>
                                        </TableCell>

                                        <TableCell align="left">
                                            <IconButton color='error' onClick={e=>handleCancel(e, seq)} aria-label="cancel">
                                                <CancelIcon fontSize='small'/>
                                            </IconButton>
                                        </TableCell>
                                    </TableRow>
                                );
                            })}
                    </TableBody>
                </Table>
            </Box>
            {!accountAddress ?
                <ConnectWalletContainer>
                    <Typography variant='subtitle2' color='error'
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    >
                        <ErrorOutlineIcon fontSize='small' sx={{ mr: '5px' }} />
                        Connect your wallet to access data.
                    </Typography>
                </ConnectWalletContainer>
                :
                loading ?
                    <Stack alignItems="center" sx={{mt: 5, mb: 5}}>
                        <PuffLoader color={darkMode ? '#007B55' : '#5569ff'} size={35} sx={{ mt: 5, mb: 5 }} />
                    </Stack>
                    :
                    offers.length === 0 ?
                        <ConnectWalletContainer>
                            <Typography variant='subtitle2' color='error'
                                sx={{
                                    display: 'flex',
                                    alignItems: 'center',
                                }}
                            >
                                <ErrorOutlineIcon fontSize='small' sx={{ mr: '5px' }} />
                                No Open Orders
                            </Typography>
                        </ConnectWalletContainer>
                        :
                        <></>
            }
        </Stack>
    );
}