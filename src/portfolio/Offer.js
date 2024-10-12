import { useContext, useEffect, useRef, useState } from "react";
import { Box, Card, CardContent, CardHeader, styled } from "@mui/material";

import {
    IconButton,
    Link,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Tooltip,
    Typography,
} from '@mui/material';

import { AppContext } from "src/AppContext";
import { PulseLoader } from "react-spinners";
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import CancelIcon from '@mui/icons-material/Cancel';
import axios from "axios";

import QRDialog from 'src/components/QRDialog';
import { useDispatch } from "react-redux";
import { updateProcess, updateTxHash } from "src/redux/transactionSlice";
import { enqueueSnackbar } from "notistack";
import { isInstalled, submitTransaction } from "@gemwallet/api";
import sdk from "@crossmarkio/sdk";

const OfferBox = styled(Box)(({ theme }) => ``);

function truncate(str, n) {
    if (!str) return '';
    return (str.length > n) ? str.substr(0, n - 1) + ' ...' : str;
};

const Offer = ({ account }) => {

    const BASE_URL = 'https://api.xrpl.to/api';

    const dispatch = useDispatch();
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
                    setLoading(false);
                });
        }
        if (account)
            getOffers();
    }, [account, sync, page, rows]);

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
        const wallet_type = accountProfile?.wallet_type;
        try {
            const OfferSequence = seq;

            const user_token = accountProfile.user_token;

            const body = {
                OfferSequence,
                user_token,
                Account: accountProfile?.account,
                TransactionType: "OfferCancel"
            };

            switch (wallet_type) {
                case "xaman":
                    setLoading(true);
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
                    break;
                case "gem":
                    dispatch(updateProcess(1));
                    isInstalled().then(async (response) => {
                        if (response.result.isInstalled) {
                            await submitTransaction({
                                transaction: body
                            }).then(({ type, result }) => {
                                if (type == "response") {
                                    dispatch(updateProcess(2));
                                    dispatch(updateTxHash(result?.hash));
                                } else {
                                    dispatch(updateProcess(3));
                                }
                            });
                        } else {
                            enqueueSnackbar("GemWallet is not installed", { variant: "error" });
                        }
                    });
                    break;
                case "crossmark":
                    dispatch(updateProcess(1));
                    await sdk.methods.signAndSubmitAndWait(body).then(({ response }) => {
                        if (response.data.meta.isSuccess) {
                            dispatch(updateProcess(2));
                            dispatch(updateTxHash(response.data.resp.result?.hash));

                        } else {
                            dispatch(updateProcess(3));
                        }
                    });
                    break;
            }
        } catch (err) {
            alert(err);
        } finally {
            dispatch(updateProcess(0));
            setSync(!sync);
            setLoading(false);
        }
    };

    const onDisconnectXumm = async (uuid) => {
        setLoading(true);
        try {
            const res = await axios.delete(`${BASE_URL}/offer/logout/${uuid}`);
            if (res.status === 200) {
                setUuid(null);
            }
        } catch (err) {
        }
        setLoading(false);
    };

    const handleScanQRClose = () => {
        setOpenScanQR(false);
        onDisconnectXumm(uuid);
    };

    return (
        <Card sx={{ mt: 3, height: "320px" }}>
            <CardHeader title="Offer" />
            <CardContent>
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
                )}

                <QRDialog
                    open={openScanQR}
                    type="OfferCancel"
                    onClose={handleScanQRClose}
                    qrUrl={qrUrl}
                    nextUrl={nextUrl}
                />

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
                                    <TableCell align="left">Taker Gets</TableCell>
                                    <TableCell align="left">Taker Pays</TableCell>
                                    <TableCell align="left">Hash</TableCell>
                                    {
                                        (account && accountProfile?.account == account) && (
                                            <TableCell align="center">Actions</TableCell>
                                        )
                                    }
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {
                                    offers.map((row, idx) => {
                                        const {
                                            _id,
                                            account,
                                            seq,
                                            gets,
                                            pays,
                                            chash,
                                        } = row;

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
                                                <TableCell align="left">
                                                    <Typography variant="s6" noWrap>{gets.value} <Typography variant="small">{gets.name}</Typography></Typography>
                                                </TableCell>

                                                <TableCell align="left">
                                                    <Typography variant="s6" noWrap>{pays.value} <Typography variant="small">{pays.name}</Typography></Typography>
                                                </TableCell>

                                                <TableCell align="left">
                                                    {chash &&
                                                        <Link
                                                            target="_blank"
                                                            href={`https://bithomp.com/explorer/${chash}`}
                                                            rel="noreferrer noopener nofollow"
                                                        >
                                                            <Typography variant="s6" noWrap color="primary">
                                                                {truncate(chash, 16)}
                                                            </Typography>
                                                        </Link>
                                                    }
                                                </TableCell>

                                                {
                                                    (account && accountProfile?.account == account) && (

                                                        <TableCell align="center">
                                                            <Tooltip title="Cancel Offer">
                                                                <IconButton color='error' onClick={e => handleCancel(e, account, seq)} aria-label="cancel">
                                                                    <CancelIcon fontSize='small' />
                                                                </IconButton>
                                                            </Tooltip>
                                                        </TableCell>
                                                    )
                                                }
                                            </TableRow>
                                        );
                                    })}
                            </TableBody>
                        </Table>
                    </Box>
                }
            </CardContent>
        </Card>
    )
}

export default Offer;
