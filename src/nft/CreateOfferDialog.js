import axios from 'axios';
import { useState, useEffect } from 'react';
import Decimal from 'decimal.js';

// Material
import { withStyles } from '@mui/styles';
import {
    alpha, useTheme, useMediaQuery,
    styled,
    Backdrop,
    Button,
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    Select,
    Stack,
    Typography,
    TextField,
    CircularProgress,
    Box,
    Divider
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddCircleIcon from '@mui/icons-material/AddCircle';

// Context
import { useContext } from 'react';
import { AppContext } from 'src/AppContext'

// Loader
import { PulseLoader } from "react-spinners";

// Utils
import { XRP_TOKEN } from 'src/utils/constants';

// Components
import QueryToken from 'src/components/QueryToken';
import QRDialog from 'src/components/QRDialog';
import { configureMemos } from 'src/utils/parse/OfferChanges';
import { isInstalled, submitTransaction } from '@gemwallet/api';
import sdk from "@crossmarkio/sdk";
import { selectProcess, updateProcess, updateTxHash } from 'src/redux/transactionSlice';
import { useDispatch, useSelector } from 'react-redux';

// ----------------------------------------------------------------------
const OfferDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialog-paper': {
        margin: 0,
        width: '100%',
        maxWidth: 'sm',
        borderRadius: theme.shape.borderRadius,
    },
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
}));

const OfferDialogTitle = (props) => {
    const { children, onClose, ...other } = props;

    return (
        <DialogTitle sx={{ m: 0, p: 2 }} {...other}>
            {children}
            {onClose ? (
                <IconButton
                    aria-label="close"
                    onClick={onClose}
                    sx={{
                        position: 'absolute',
                        right: 8,
                        top: 8,
                        color: (theme) => theme.palette.grey[500],
                    }}
                >
                    <CloseIcon />
                </IconButton>
            ) : null}
        </DialogTitle>
    );
};

const Label = withStyles({
    root: {
        color: alpha('#637381', 0.99)
    }
})(Typography);

const CustomSelect = styled(Select)(({ theme }) => ({
    '& .MuiOutlinedInput-notchedOutline': {
        border: 'none'
    }
}));

function GetNum(amount) {
    let num = 0;
    try {
        num = new Decimal(amount).toNumber();
        if (num < 0) num = 0;
    } catch (err) { }
    return num;
}

export default function CreateOfferDialog({ open, setOpen, nft, isSellOffer }) {
    // "costs": [
    //     {
    //         "md5": "0413ca7cfc258dfaf698c02fe304e607",
    //         "name": "SOLO",
    //         "issuer": "rsoLo2S1kiGeCcn6hCUXVrCpGMWLrRrLZz",
    //         "currency": "534F4C4F00000000000000000000000000000000",
    //         "ext": "jpg",
    //         "exch": 0.29431199670355546,
    //         "cost": "100"
    //     }
    // ]
    const theme = useTheme();
    const dispatch = useDispatch();
    const isProcessing = useSelector(selectProcess);
    const BASE_URL = 'https://api.xrpnft.com/api';
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

    const { accountProfile, openSnackbar, sync, setSync } = useContext(AppContext);
    const account = accountProfile?.account;
    const accountToken = accountProfile?.token;

    const [token, setToken] = useState(XRP_TOKEN);
    const [amount, setAmount] = useState('');

    const [openScanQR, setOpenScanQR] = useState(false);
    const [uuid, setUuid] = useState(null);
    const [qrUrl, setQrUrl] = useState(null);
    const [nextUrl, setNextUrl] = useState(null);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        var timer = null;
        var isRunning = false;
        var counter = 150;

        var dispatchTimer = null;

        async function getDispatchResult() {
            try {
                const ret = await axios.get(`${BASE_URL}/offers/create/${uuid}?account=${account}`, { headers: { 'x-access-token': accountToken } });
                const res = ret.data.data.response;
                // const account = res.account;
                const dispatched_result = res.dispatched_result;

                return dispatched_result;
            } catch (err) { }
        }

        const startInterval = () => {
            let times = 0;

            dispatchTimer = setInterval(async () => {
                const dispatched_result = await getDispatchResult();

                if (dispatched_result && dispatched_result === 'tesSUCCESS') {
                    setSync(sync + 1);
                    openSnackbar('Create Offer successful!', 'success');
                    stopInterval();
                    return;
                }

                times++;

                if (times >= 10) {
                    openSnackbar('Create Offer rejected!', 'error');
                    stopInterval();
                    return;
                }
            }, 1000);
        };

        // Stop the interval
        const stopInterval = () => {
            clearInterval(dispatchTimer);
            setOpenScanQR(false);
            handleClose();
        };

        async function getPayload() {
            console.log(counter + " " + isRunning, uuid);
            if (isRunning) return;
            isRunning = true;
            try {
                const ret = await axios.get(`${BASE_URL}/offers/create/${uuid}?account=${account}`, { headers: { 'x-access-token': accountToken } });
                const resolved_at = ret.data?.resolved_at;
                const dispatched_result = ret.data?.dispatched_result;
                if (resolved_at) {
                    startInterval();
                    return;
                    // setOpenScanQR(false);
                    // if (dispatched_result === 'tesSUCCESS') {
                    //     // const newMints = ret.data.mints;
                    //     handleClose();
                    //     setSync(sync + 1);
                    //     openSnackbar('Create Offer successful!', 'success');
                    // }
                    // else
                    //     openSnackbar('Create Offer rejected!', 'error');

                    // return;
                }
            } catch (err) {
                console.log(err);
            }
            isRunning = false;
            counter--;
            if (counter <= 0) {
                openSnackbar('Create Offer timeout!', 'error');
                handleScanQRClose();
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
    }, [openScanQR, uuid, sync]);

    const onCreateOfferXumm = async () => {
        if (!account || !accountToken) {
            openSnackbar('Please login', 'error');
            return;
        }

        try {
            const user_token = accountProfile?.user_token;
            const wallet_type = accountProfile.wallet_type;

            const issuer = token.issuer;
            const currency = token.currency;

            const owner = nft.account;
            const NFTokenID = nft.NFTokenID;

            const body = { account, issuer, currency, amount, isSellOffer, NFTokenID, owner, user_token };

            let Amount = {};
            if (currency === 'XRP') {
                Amount = new Decimal(amount).mul(1000000).toString();
            } else {
                Amount.issuer = issuer;
                Amount.currency = currency;
                Amount.value = new Decimal(amount).toString();
            }

            let offerTxData = {
                TransactionType: "NFTokenCreateOffer",
                Account: account,
                NFTokenID,
                Amount,
                Memos: configureMemos(isSellOffer ? 'XRPNFT-nft-create-sell-offer' : 'XRPNFT-nft-create-buy-offer', '', `https://xrpnft.com/nft/${NFTokenID}`)
            }

            if (isSellOffer) {
                offerTxData.Flags = 1;
            } else {
                offerTxData.Owner = owner;
            }
            
            switch (wallet_type) {
                case "xaman":
                    setLoading(true);
                    const res = await axios.post(`${BASE_URL}/offers/create`, body, { headers: { 'x-access-token': accountToken } });

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
                    isInstalled().then(async (response) => {
                        if (response.result.isInstalled) {

                            dispatch(updateProcess(1));
                            await submitTransaction({
                                transaction: offerTxData
                            }).then(({ type, result }) => {
                                if (type == "response") {
                                    dispatch(updateProcess(2));
                                    dispatch(updateTxHash(result?.hash));
                                }

                                else {
                                    dispatch(updateProcess(3));
                                }
                            });

                            handleClose();
                        }
                    });
                    break;
                case "crossmark":
                    
                    dispatch(updateProcess(1));
                    await sdk.methods.signAndSubmitAndWait(offerTxData)
                        .then(({ response }) => {
                            if (response.data.meta.isSuccess) {
                                dispatch(updateProcess(2));
                                dispatch(updateTxHash(response.data.resp.result?.hash));

                            } else {
                                dispatch(updateProcess(3));
                            }
                        });
                    handleClose();
                    break;
            }

        } catch (err) {
            console.error(err);
            openSnackbar('Network error!', 'error');
            dispatch(updateProcess(0));
        }
        setLoading(false);
    };

    const onDisconnectXumm = async (uuid) => {
        setLoading(true);
        try {
            const res = await axios.delete(`${BASE_URL}/offers/create/${uuid}`, { headers: { 'x-access-token': accountToken } });
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

    const handleClose = () => {
        setOpen(false);
        setToken(XRP_TOKEN);
        setAmount('');
    }

    const handleChangeAmount = (e) => {
        const value = e.target.value;
        const newAmount = value ? value.replace(/[^0-9.]/g, "") : '';
        setAmount(newAmount);
    }

    const handleCreateOffer = () => {
        if (amount > 0) {
            onCreateOfferXumm();
        } else {
            openSnackbar('Invalid value!', 'error');
        }
    }

    const handleMsg = () => {
        if (isProcessing == 1) return "Pending Creating";
        if (!amount) return "Enter an Amount";
        else return "Create";
    }

    return (
        <>
            <Backdrop
                sx={{ color: "#000", zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={loading}
            >
                <PulseLoader color={"#FF4842"} size={10} />
            </Backdrop>

            <OfferDialog
                fullScreen={fullScreen}
                onClose={handleClose}
                open={open}
                disableScrollLock
                disablePortal={false}
                keepMounted
                TransitionProps={{
                    enter: true,
                    exit: true,
                }}
            >
                <OfferDialogTitle id="customized-dialog-title" onClose={handleClose}>
                    <Typography variant="h6">Create {isSellOffer ? 'Sell' : 'Buy'} Offer</Typography>
                </OfferDialogTitle>

                <Divider />

                <DialogContent>
                    <Box sx={{ p: 2 }}>
                        <QueryToken
                            token={token}
                            onChangeToken={setToken}
                        />

                        <Box sx={{ mt: 3 }}>
                            <Typography variant='subtitle1' gutterBottom>Cost <Typography component="span" color="error">*</Typography></Typography>

                            <Stack direction="row" spacing={2} alignItems="center">
                                <TextField
                                    id='id_txt_costamount'
                                    variant='outlined'
                                    placeholder='Enter amount'
                                    onChange={handleChangeAmount}
                                    autoComplete='new-password'
                                    value={amount}
                                    onFocus={event => {
                                        event.target.select();
                                    }}
                                    onKeyDown={(e) => e.stopPropagation()}
                                    fullWidth
                                />
                                <Typography variant='body1'>{token?.name}</Typography>
                            </Stack>
                        </Box>

                        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'center' }}>
                            <Button
                                variant="contained"
                                startIcon={
                                    isProcessing == 1 ? <CircularProgress
                                        disableShrink
                                        size={20}
                                        color="inherit"
                                    /> : <AddCircleIcon />}
                                onClick={handleCreateOffer}
                                disabled={isProcessing == 1 || !amount}
                                sx={{ minWidth: 200 }}
                            >
                                {handleMsg()}
                            </Button>
                        </Box>
                    </Box>
                </DialogContent>
            </OfferDialog>

            <QRDialog
                open={openScanQR}
                type="NFTokenCreateOffer"
                onClose={handleScanQRClose}
                qrUrl={qrUrl}
                nextUrl={nextUrl}
            />
        </>
    );
}
