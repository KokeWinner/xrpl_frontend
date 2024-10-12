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
    CircularProgress
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SendIcon from '@mui/icons-material/Send';
// Context
import { useContext } from 'react';
import { AppContext } from 'src/AppContext'

// Loader
import { PulseLoader } from "react-spinners";

// Utils
import { XRP_TOKEN } from 'src/utils/constants';

// Components
import QRDialog from 'src/components/QRDialog';
import { isValidClassicAddress } from 'ripple-address-codec';
import { configureMemos } from 'src/utils/parse/OfferChanges';
import { isInstalled, submitTransaction } from '@gemwallet/api';
import sdk from "@crossmarkio/sdk";
import { selectProcess, updateProcess, updateTxHash } from 'src/redux/transactionSlice';
import { useDispatch, useSelector } from 'react-redux';

// ----------------------------------------------------------------------
const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: 16,
    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
    backdropFilter: 'blur(4px)',
    WebkitBackdropFilter: 'blur(4px)',
    border: '1px solid rgba(255, 255, 255, 0.18)',
  },
}));

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  background: theme.palette.background.default,
  color: theme.palette.text.primary,
  borderBottom: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
}));

const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
  padding: theme.spacing(4),
}));

const StyledTextField = styled(TextField)(({ theme }) => ({
  '& .MuiOutlinedInput-root': {
    borderRadius: 12,
    '&.Mui-focused': {
      boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
    },
  },
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: 25,
  padding: theme.spacing(1.5, 4),
  textTransform: 'none',
  fontWeight: 600,
}));

export default function TransferDialog({ open, setOpen, nft }) {
  const theme = useTheme();
  const BASE_URL = 'https://api.xrpnft.com/api';
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  const dispatch = useDispatch();
  const isProcessing = useSelector(selectProcess);

  const { accountProfile, openSnackbar, sync, setSync } = useContext(AppContext);
  const account = accountProfile?.account;
  const accountToken = accountProfile?.token;

  const [destination, setDestination] = useState('');

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
        const dispatched_result = res.dispatched_result;

        return dispatched_result;
      } catch (err) {}
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

    const stopInterval = () => {
      clearInterval(dispatchTimer);
      handleClose();
      handleScanQRClose();
    };

    async function getPayload() {
      console.log(counter + " " + isRunning, uuid);
      if (isRunning) return;
      isRunning = true;
      try {
        const ret = await axios.get(`${BASE_URL}/offers/create/${uuid}?account=${account}`, { headers: { 'x-access-token': accountToken } });
        const resolved_at = ret.data?.resolved_at;
        if (resolved_at) {
          startInterval();
          return;
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

    setLoading(true);
    try {
      const user_token = accountProfile?.user_token;
      const wallet_type = accountProfile?.wallet_type;

      const uuid = nft.uuid;

      const NFTokenID = nft.NFTokenID;
      const owner = nft.account;

      const transferTxData = {
        TransactionType: "NFTokenCreateOffer",
        Account: account,
        NFTokenID,
        Amount: "0",
        Flags: 1,
        Destination: destination,
        Memos: configureMemos('XRPNFT-nft-create-sell-offer', '', `https://xrpnft.com/nft/${NFTokenID}`)
      };

      switch(wallet_type) {
        case "xaman":
          const body = { account, NFTokenID, owner, user_token, destination };

          const res = await axios.post(`${BASE_URL}/offers/transfer`, body, { headers: { 'x-access-token': accountToken } });

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
                transaction: transferTxData
              }).then(({ type, result }) => {
                if (type == "response") {
                  dispatch(updateProcess(2));
                  dispatch(updateTxHash(result?.hash));
                }

                else {
                  dispatch(updateProcess(3));
                }
              });
            }
          });
          break;
        case "crossmark":
          dispatch(updateProcess(1));
          await sdk.methods.signAndSubmitAndWait(transferTxData)
            .then(({ response }) => {
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
    setDestination('');
  }

  const handleChangeAccount = (e) => {
    setDestination(e.target.value);
  }

  const handleTransferNFT = () => {
    const isValid = isValidClassicAddress(destination) && account !== destination
    if (isValid) {
      onCreateOfferXumm();
    } else {
      openSnackbar('Invalid value!', 'error');
    }
  }

  const handleMsg = () => {
    if (isProcessing == 1) return "Pending Transferring";
    if (!destination) return "Enter an Account";
    else return "Transfer";
  }

  return (
    <>
      <Backdrop
        sx={{ color: "#000", zIndex: 1303 }}
        open={loading}
      >
        <PulseLoader color={"#FF4842"} size={10} />
      </Backdrop>

      <StyledDialog
        fullScreen={fullScreen}
        onClose={handleClose}
        fullWidth
        maxWidth='xs'
        open={open}
        disableScrollLock
        disablePortal
        keepMounted
      >
        <StyledDialogTitle>
          <Typography variant="h6" fontWeight="bold">Transfer NFT</Typography>
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </StyledDialogTitle>

        <StyledDialogContent>
          <Typography variant="body1" sx={{ mb: 3 }}>
            For this transfer to be completed, the recipient must accept it through their wallet.
          </Typography>
          <StyledTextField
            fullWidth
            id='receive-account'
            variant='outlined'
            placeholder='Enter destination account'
            onChange={handleChangeAccount}
            value={destination}
            onFocus={event => event.target.select()}
            onKeyDown={(e) => e.stopPropagation()}
            sx={{ mb: 4 }}
          />

          <StyledButton
            variant="contained"
            startIcon={
              isProcessing == 1 ? (
                <CircularProgress size={20} color="inherit" />
              ) : (
                <SendIcon />
              )
            }
            onClick={handleTransferNFT}
            disabled={isProcessing == 1}
            fullWidth
          >
            {handleMsg()}
          </StyledButton>
        </StyledDialogContent>
      </StyledDialog>

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
