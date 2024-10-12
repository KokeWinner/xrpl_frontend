import { Avatar, IconButton, Stack, TableCell, TableRow, Tooltip, Typography, useMediaQuery, Box, Chip } from "@mui/material";
import { useContext, useEffect, useState, useMemo, useCallback } from "react";
import { AppContext } from "src/AppContext";
import { fNumberWithCurreny } from "src/utils/formatNumber";
import { currencySymbols } from "src/utils/constants";
import axios from "axios";
import { isInstalled, submitTransaction } from '@gemwallet/api';
import sdk from "@crossmarkio/sdk";
import CustomQRDialog from "src/components/QRDialog";
import { useDispatch } from "react-redux";
import CustomDialog from "src/components/Dialog";
import CancelIcon from '@mui/icons-material/Cancel';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';

const TrustLineRow = ({ limit, currencyName, balance, md5, exchRate, issuer, account, currency }) => {

    const BASE_URL = 'https://api.xrpl.to/api';

    const dispatch = useDispatch();
    const { darkMode, activeFiatCurrency, openSnackbar, accountProfile, sync, setSync } = useContext(AppContext);
    const isMobile = useMediaQuery('(max-width:600px)');
    const isLoggedIn = accountProfile && accountProfile.account;

    const [token, setToken] = useState({});
    const [openScanQR, setOpenScanQR] = useState(false);
    const [uuid, setUuid] = useState(null);
    const [qrUrl, setQrUrl] = useState(null);
    const [nextUrl, setNextUrl] = useState(null);
    const [content, setContent] = useState("");
    const [openConfirm, setOpenConfirm] = useState(false);
    const [xamanStep, setXamanStep] = useState(0);
    const [xamanTitle, setXamanTitle] = useState("");
    const [stepTitle, setStepTitle] = useState("");
    const [loading, setLoading] = useState(false);

    const fetchToken = useCallback(async () => {
        if (md5) {
            const res = await axios.get(`${BASE_URL}/token/get-by-hash/${md5}`);
            setToken(res.data.token);
        }
    }, [md5]);

    useEffect(() => {
        fetchToken();
    }, [fetchToken]);

    useEffect(() => {
        if (!openScanQR || !uuid) return;

        const timer = setInterval(async () => {
            const ret = await axios.get(`${BASE_URL}/xumm/payload/${uuid}`);
            const res = ret.data.data.response;
            if (res.resolved_at) {
                clearInterval(timer);
                startDispatchInterval();
            }
        }, 2000);

        return () => clearInterval(timer);

    }, [openScanQR, uuid]);

    const startDispatchInterval = () => {
        let times = 0;
        const dispatchTimer = setInterval(async () => {
            const ret = await axios.get(`${BASE_URL}/xumm/payload/${uuid}`);
            const res = ret.data.data.response;
            const dispatched_result = res.dispatched_result;

            if (dispatched_result === 'tesSUCCESS') {
                setXamanStep(prev => prev + 1);
                clearInterval(dispatchTimer);
                setOpenScanQR(false);
            } else if (++times >= 20) {
                openSnackbar('Operation rejected!', 'error');
                clearInterval(dispatchTimer);
                handleConfirmClose();
            }
        }, 1000);
    };

    useEffect(() => {
        const stepsContent = [
            { title: "Refund to Issuer", content: `This TrustLine still contains ${balance} ${currencyName}. If you continue, it will be sent back to the issuer before your TrustLine is deleted.` },
            { title: "Success", content: "Your dust balance has been sent back to the issuer. The TrustLine can now be eliminated" },
            { title: "Trust Set", content: "You are removing this token from your XRP ledger account. Are you sure?" },
        ];

        if (xamanStep > 0 && xamanStep < 4) {
            const { title, content } = stepsContent[xamanStep - 1];
            setXamanTitle(title);
            setContent(content);
            setStepTitle(xamanStep === 1 ? "Warning" : "Success");
            setOpenConfirm(true);
        } else if (xamanStep === 4) {
            openSnackbar("You removed trustline", "success");
            handleConfirmClose();
        }
    }, [xamanStep]);

    const handleCancel = async () => {
        if (!isLoggedIn) {
            openSnackbar('Please connect wallet!', 'error');
        } else if (accountProfile.account !== account) {
            openSnackbar('You are not the owner of this offer!', 'error');
        } else {
            await onTrustRemoveXumm();
        }
    };

    const handleScanQRClose = () => {
        setOpenScanQR(false);
        onDisconnectXumm(uuid);
    };

    const onTrustRemoveXumm = async () => {
        setXamanStep(balance > 0 ? 1 : 3);
    };

    const onDisconnectXumm = async (uuid) => {
        setLoading(true);
        await axios.delete(`${BASE_URL}/xumm/logout/${uuid}`);
        setUuid(null);
        setLoading(false);
    };

    const handleConfirmClose = () => {
        setOpenConfirm(false);
        setXamanStep(0);
        setSync(prev => !prev);
    }

    const handleConfirmContinue = async () => {
        const user_token = accountProfile?.user_token;
        const wallet_type = accountProfile?.wallet_type;
        let body;

        if (xamanStep === 3) {
            if (limit === 0) {
                setXamanStep(4);
                return;
            }
            const Flags = 0x00020000;
            body = {
                LimitAmount: { issuer, currency, value: "0" },
                Flags,
                user_token,
                TransactionType: "TrustSet"
            };
        } else if (xamanStep === 1) {
            body = {
                TransactionType: "Payment",
                Account: accountProfile.account,
                Amount: { currency, value: balance, issuer },
                Destination: issuer,
                Fee: "12",
                SourceTag: 20221212,
                DestinationTag: 20221212
            };
        }

        if (wallet_type === "xaman") {
            const res = await axios.post(`${BASE_URL}/xumm/${xamanStep === 3 ? 'trustset' : 'transfer'}`, body);
            if (res.status === 200) {
                const { uuid, qrUrl, next } = res.data.data;
                setUuid(uuid);
                setQrUrl(qrUrl);
                setNextUrl(next);
                setOpenScanQR(true);
            }
        } else if (wallet_type === "gem") {
            isInstalled().then(async (response) => {
                if (response.result.isInstalled) {
                    const { type, result } = await submitTransaction({ transaction: body });
                    if (type === "response") {
                        setXamanStep(xamanStep + 1);
                    } else {
                        handleConfirmClose();
                    }
                } else {
                    enqueueSnackbar("GemWallet is not installed", { variant: "error" });
                    handleConfirmClose();
                }
            });
        } else if (wallet_type === "crossmark") {
            const { response } = await sdk.methods.signAndSubmitAndWait(body);
            if (response.data.meta.isSuccess) {
                setXamanStep(xamanStep + 1);
            } else {
                handleConfirmClose();
            }
        }
    };

    const formatNumber = (num) => {
        // Convert to regular notation, round to 2 decimal places, and remove trailing zeros
        return parseFloat(parseFloat(num).toFixed(2)).toString();
    };

    const computedBalance = useMemo(() => formatNumber(balance), [balance]);
    const computedValue = useMemo(() => {
        const value = token.exch ? balance * fNumberWithCurreny(token.exch, exchRate) : 0;
        return value.toFixed(2); // This will round to 2 decimal places
    }, [balance, token.exch, exchRate]);

    return (
        <>
            <TableRow
                sx={{
                    '&:hover': {
                        '& .MuiTableCell-root': {
                            backgroundColor: darkMode ? 'rgba(255, 255, 255, 0.08)' : 'rgba(0, 0, 0, 0.04)'
                        }
                    },
                    '& .MuiTableCell-root': {
                        padding: '16px 8px',
                        borderBottom: `1px solid ${darkMode ? 'rgba(255, 255, 255, 0.12)' : 'rgba(0, 0, 0, 0.12)'}`
                    }
                }}
            >
                <TableCell align="left">
                    <Stack direction="row" spacing={2} alignItems="center">
                        <Avatar src={`https://s1.xrpl.to/token/${md5}`} sx={{ width: 40, height: 40 }} />
                        <Box>
                            <Typography variant="subtitle2" noWrap>
                                {currencyName}
                            </Typography>
                            <Typography variant="caption" color="text.secondary" noWrap>
                                {issuer.substring(0, 6)}...{issuer.substring(issuer.length - 4)}
                            </Typography>
                        </Box>
                    </Stack>
                </TableCell>

                <TableCell align="right" sx={{ display: isMobile ? "none" : "table-cell" }}>
                    <Typography variant="body2" noWrap>
                        {computedBalance}
                    </Typography>
                </TableCell>

                <TableCell align="right">
                    <Typography variant="body2" noWrap>
                        {currencySymbols[activeFiatCurrency]}{computedValue}
                    </Typography>
                </TableCell>

                {isLoggedIn && accountProfile?.account === account && (
                    <TableCell align="center">
                        <Tooltip title="Remove TrustLine">
                            <Chip
                                icon={<DeleteOutlineIcon fontSize="small" />}
                                label="Remove"
                                color="error"
                                variant="outlined"
                                size="small"
                                onClick={handleCancel}
                                sx={{ cursor: 'pointer' }}
                            />
                        </Tooltip>
                    </TableCell>
                )}
            </TableRow>
            <CustomQRDialog
                open={openScanQR}
                type={xamanTitle}
                onClose={handleScanQRClose}
                qrUrl={qrUrl}
                nextUrl={nextUrl}
            />
            <CustomDialog open={openConfirm} content={content} title={stepTitle} handleClose={handleConfirmClose} handleContinue={handleConfirmContinue} />
        </>
    );
}

export default TrustLineRow;
