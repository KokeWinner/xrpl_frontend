import axios from 'axios';
import { useState, useEffect } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';


// Material
import { withStyles } from '@mui/styles';
import {
  alpha,
  useTheme,
  useMediaQuery,
  styled,
  Avatar,
  Backdrop,
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Link,
  Stack,
  Tooltip,
  Typography,
  TextField
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

// Context
import { useContext } from 'react';
import { AppContext } from 'src/AppContext';

// Redux
import { useDispatch } from 'react-redux';

// Components
import QRDialog from './QRDialog';

// Loader
import { PulseLoader } from 'react-spinners';

// Utils
import { fNumber } from 'src/utils/formatNumber';
import Decimal from 'decimal.js';

// Iconify
import { Icon } from '@iconify/react';
import copyIcon from '@iconify/icons-fad/copy';
import Wallet from './Wallet';
import { isInstalled, setTrustline, submitTransaction } from '@gemwallet/api';
import { enqueueSnackbar } from 'notistack';
import sdk from "@crossmarkio/sdk";
import { updateProcess, updateTxHash } from 'src/redux/transactionSlice';
import CustomDialog from './Dialog';

// ----------------------------------------------------------------------
const TrustDialog = styled(Dialog)(({ theme }) => ({
  backdropFilter: 'blur(1px)',
  WebkitBackdropFilter: 'blur(1px)', // Fix on Mobile
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2)
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1)
  }
}));

const TrustDialogTitle = (props) => {
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
            color: (theme) => theme.palette.grey[500]
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

export default function TrustSetDialog({ limit, token, setToken, balance }) {
  const theme = useTheme();
  const dispatch = useDispatch();
  const BASE_URL = 'https://api.xrpl.to/api';
  const { accountProfile, openSnackbar, darkMode, sync, setSync } = useContext(AppContext);

  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

  const isLoggedIn = accountProfile && accountProfile.account;

  const [openScanQR, setOpenScanQR] = useState(false);
  const [uuid, setUuid] = useState(null);
  const [qrUrl, setQrUrl] = useState(null);
  const [nextUrl, setNextUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState(fNumber(token.amount));
  const [content, setContent] = useState("");
  const [openConfirm, setOpenConfirm] = useState(false);
  const [xamanStep, setXamanStep] = useState(0);
  const [xamanTitle, setXamanTitle] = useState(0);
  const [stepTitle, setStepTitle] = useState("");

  const [isRemove, setIsRemove] = useState(false);

  const { issuer, name, user, currency, md5, ext, slug } = token;

  // const imgUrl = `/static/tokens/${md5}.${ext}`;
  const imgUrl = `https://s1.xrpl.to/token/${md5}`;

  useEffect(() => {
    var timer = null;
    var isRunning = false;
    var counter = 150;
    var dispatchTimer = null;

    async function getDispatchResult() {
      try {
        const ret = await axios.get(`${BASE_URL}/xumm/payload/${uuid}`);
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
          openSnackbar(
            `Successfully ${isRemove ? 'removed' : 'set'} trustline!`,
            'success'
          );
          stopInterval();
          return;
        }

        times++;

        if (times >= 10) {
          openSnackbar('Operation rejected!', 'error');
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
      // console.log(counter + " " + isRunning, uuid);
      if (isRunning) return;
      isRunning = true;
      try {
        const ret = await axios.get(`${BASE_URL}/xumm/payload/${uuid}`);
        const res = ret.data.data.response;
        // const account = res.account;
        const resolved_at = res.resolved_at;
        if (resolved_at) {
          startInterval();
          return;
        }
      } catch (err) { }
      isRunning = false;
      counter--;
      if (counter <= 0) {
        openSnackbar('Timeout!', 'error');
        handleScanQRClose();
      }
    }
    if (openScanQR) {
      timer = setInterval(getPayload, 2000);
    }
    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [openScanQR, uuid]);

  useEffect(() => {
    const getLines = () => {
      if (!isLoggedIn) return;

      setLoading(true);
      // https://api.xrpl.to/api/account/lines/r22G1hNbxBVapj2zSmvjdXyKcedpSDKsm
      axios
        .get(`${BASE_URL}/account/lines/${accountProfile.account}`)
        .then((res) => {
          let ret = res.status === 200 ? res.data : undefined;
          if (ret) {
            const trustlines = ret.lines;

            const trustlineToRemove = trustlines.find((trustline) => {
              return (
                (trustline.LowLimit.issuer === issuer ||
                  trustline.HighLimit.issuer) &&
                trustline.LowLimit.currency === currency
              );
            });

            setIsRemove(trustlineToRemove);

            if (trustlineToRemove) {
              setAmount(0);
            }
          }
        })
        .catch((err) => {
          console.log('Error on getting account lines!!!', err);
        })
        .then(function () {
          // always executed
          setLoading(false);
        });
    };
    getLines();
  }, [token, openScanQR]);

  const onTrustSetXumm = async (value) => {
    /*{
            "TransactionType": "TrustSet",
            "Account": "ra5nK24KXen9AHvsdFTKHSANinZseWnPcX",
            "Fee": "12",
            "Flags": 262144,
            "LastLedgerSequence": 8007750,
            "LimitAmount": {
              "currency": "USD",
              "issuer": "rsP3mgGb2tcYUrxiLFiHJiQXhsziegtwBc",
              "value": "100"
            },
            "Sequence": 12
        }*/
    try {
      const { issuer, currency } = token;
      const wallet_type = accountProfile.wallet_type;
      const user_token = accountProfile?.user_token;

      const Flags = 0x00020000;

      let LimitAmount = {};
      LimitAmount.issuer = issuer;
      LimitAmount.currency = currency;
      LimitAmount.value = value.toString();

      const body = { LimitAmount, Flags, user_token };

      switch (wallet_type) {
        case "xaman":
          setLoading(true);
          const res = await axios.post(`${BASE_URL}/xumm/trustset`, body);

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
              const trustSet = {
                flags: Flags,
                limitAmount: LimitAmount,
              }

              dispatch(updateProcess(1));
              await setTrustline(trustSet).then(({ type, result }) => {
                if (type == "response") {
                  dispatch(updateProcess(2));
                  dispatch(updateTxHash(result?.hash));
                }

                else {
                  dispatch(updateProcess(3));
                }
              });
            }

            else {
              enqueueSnackbar("GemWallet is not installed", { variant: "error" });
            }
          })
          break;
        case "crossmark":
          // if (!window.xrpl) {
          //   enqueueSnackbar("CrossMark wallet is not installed", { variant: "error" });
          //   return;
          // }
          // const { isCrossmark } = window.xrpl;
          // if (isCrossmark) {
          const trustSet = {
            Flags: Flags,
            LimitAmount: LimitAmount,
          }

          dispatch(updateProcess(1));
          await sdk.methods.signAndSubmitAndWait({
            ...trustSet,
            Account: accountProfile.account,
            TransactionType: 'TrustSet'
          }).then(({ response }) => {
            if (response.data.meta.isSuccess) {
              dispatch(updateProcess(2));
              dispatch(updateTxHash(response.data.resp.result?.hash));

            } else {
              dispatch(updateProcess(3));
            }
          });
          // }
          break;
      }


    } catch (err) {
      console.log(err);
      dispatch(updateProcess(0));
      openSnackbar('Network error!', 'error');
    }
    setLoading(false);
  };

  const onDisconnectXumm = async (uuid) => {
    setLoading(true);
    try {
      const res = await axios.delete(`${BASE_URL}/xumm/logout/${uuid}`);
      if (res.status === 200) {
        setUuid(null);
      }
    } catch (err) { }
    setLoading(false);
  };

  const handleScanQRClose = () => {
    setOpenScanQR(false);
    onDisconnectXumm(uuid);
  };

  const handleClose = () => {
    setToken(null);
  };

  const handleChangeAmount = (e) => {
    const amt = e.target.value;
    setAmount(amt);
  };

  const isNumber = (num) => {
    return /^[0-9.,]*$/.test(num.toString());
  };

  const handleSetTrust = (e) => {
    let fAmount = 0;
    try {
      if (isNumber(amount)) {
        fAmount = new Decimal(amount.replaceAll(',', '')).toNumber();
      }
    } catch (e) { }

    if (fAmount > 0) {
      onTrustSetXumm(fAmount);
    } else {
      openSnackbar('Invalid value!', 'error');
    }
  }

  useEffect(() => {

    switch (xamanStep) {
      case 1:
        setContent(`This TrustLine still contains ${balance} ${currency}. If you continue, it will be sent back to the issuer before your TrustLine is deleted.`);
        setXamanTitle("Refund to Issuer");
        setStepTitle("Warning");
        setOpenConfirm(true);
        break;
      case 2:
        setContent("Your dust balance has been sent back to the issuer. The TrustLine can now be eliminated");
        setStepTitle("Success");
        setOpenConfirm(true);
        break;
      case 3:
        setContent("You are removing this token from your XRP ledger account. Are you sure?");
        setXamanTitle("Trust Set");
        setStepTitle("Warning");
        setOpenConfirm(true);
        break;
      case 4:
        openSnackbar("You removed trustline", "success");
        handleConfirmClose();
        break;
    }

  }, [xamanStep]);

  const handleRemoveTrust = async () => {
    try {

      if (balance > 0) {
        setXamanStep(1);
      } else {
        setXamanStep(3);
      }

    } catch (err) {
      console.log(err);
      openSnackbar('Network error!', 'error');
    }
  };
  const handleConfirmClose = () => {
    setOpenConfirm(false);
    setXamanStep(0);
  }

  const handleConfirmContinue = async () => {
    const user_token = accountProfile?.user_token;
    const wallet_type = accountProfile?.wallet_type;

    let body;
    switch (xamanStep) {
      case 3:
        if (limit == 0) {
          setXamanStep(4);
          return;
        }

        const Flags = 0x00020000;
        let LimitAmount = {};
        LimitAmount.issuer = issuer;
        LimitAmount.currency = currency;
        LimitAmount.value = "0";

        body = { LimitAmount, Flags, user_token, TransactionType: "TrustSet" };
        if (wallet_type == "xaman") {
          const res1 = await axios.post(`${BASE_URL}/xumm/trustset`, body);
          if (res1.status === 200) {
            const uuid = res1.data.data.uuid;
            const qrlink = res1.data.data.qrUrl;
            const nextlink = res1.data.data.next;

            setXamanStep(4);
            setUuid(uuid);
            setQrUrl(qrlink);
            setNextUrl(nextlink);
            setOpenScanQR(true);
          }
        }

        else if (wallet_type == "gem") {
          isInstalled().then(async (response) => {
            if (response.result.isInstalled) {
              await submitTransaction({
                transaction: body
              }).then(({ type, result }) => {
                if (type === "response") {
                  setXamanStep(4);
                } else {
                  handleConfirmClose();
                }
              });
            } else {
              enqueueSnackbar("GemWallet is not installed", { variant: "error" });
              handleConfirmClose();
            }
          });
        }

        else if (wallet_type == "crossmark") {
          await sdk.methods.signAndSubmitAndWait(body).then(({ response }) => {
            if (response.data.meta.isSuccess) {
              setXamanStep(4);
            } else {
              handleConfirmClose();
            }
          });
        }
        break;
      case 2:
        setXamanStep(3);
        break;
      case 1:
        body = {
          TransactionType: "Payment",
          Account: accountProfile.account,
          Amount: {
            currency: currency,
            value: balance,
            issuer: issuer
          },
          Destination: issuer,
          Fee: "12",
          SourceTag: 20221212,
          DestinationTag: 20221212,
        }
        if (wallet_type == "xaman") {
          const res2 = await axios.post(`${BASE_URL}/xumm/transfer`, body);
          if (res2.status === 200) {
            const uuid = res2.data.data.uuid;
            const qrlink = res2.data.data.qrUrl;
            const nextlink = res2.data.data.next;

            setXamanStep(2);
            setUuid(uuid);
            setQrUrl(qrlink);
            setNextUrl(nextlink);
            setOpenScanQR(true);
          }
        }

        else if (wallet_type == "gem") {
          isInstalled().then(async (response) => {
            if (response.result.isInstalled) {
              await submitTransaction({
                transaction: body
              }).then(({ type, result }) => {
                if (type === "response") {
                  setXamanStep(2);
                } else {
                  handleConfirmClose();
                }
              });
            } else {
              enqueueSnackbar("GemWallet is not installed", { variant: "error" });
              handleConfirmClose();
            }
          });
        }

        else if (wallet_type == "crossmark") {
          await sdk.methods.signAndSubmitAndWait(body).then(({ response }) => {
            if (response.data.meta.isSuccess) {
              setXamanStep(2);
            } else {
              handleConfirmClose();
            }
          });
        }

        break;
    }

    setSync(!sync);
  }

  return (
    <>
      <Backdrop sx={{ color: '#000', zIndex: 1303 }} open={loading}>
        <PulseLoader color={darkMode ? '#007B55' : '#5569ff'} size={10} />

      </Backdrop>

      <TrustDialog
        fullScreen={fullScreen}
        onClose={handleClose}
        open={true}
        sx={{ zIndex: 1302 }}
      // hideBackdrop={true}
      >
        <TrustDialogTitle id="customized-dialog-title" onClose={handleClose}>
          <Stack direction="row" alignItems="center">
            <Avatar alt={`${user} ${name} Logo`} src={imgUrl} sx={{ mr: 1 }} />
            <Stack>
              <Typography variant="token" color="primary">{name}</Typography>
              <Typography variant="caption">{user}</Typography>
            </Stack>
          </Stack>
        </TrustDialogTitle>

        <DialogContent>
          <Stack spacing={1.5} sx={{ pl: 1, pr: 1 }}>
            <Stack direction="row" alignItems="center">
              <Label variant="subtitle2" noWrap>
                {issuer}
              </Label>
              <Link
                underline="none"
                color="inherit"
                target="_blank"
                href={`https://bithomp.com/explorer/${issuer}`}
                rel="noreferrer noopener nofollow"
              >
                <IconButton edge="end" aria-label="bithomp">
                  <Avatar
                    alt="Bithomp Explorer"
                    src="/static/bithomp.ico"
                    sx={{ width: 16, height: 16 }}
                  />
                </IconButton>
              </Link>
            </Stack>

            <Label variant="subtitle2" noWrap>
              {currency}
            </Label>

            <TextField
              fullWidth
              id="input-with-sx1"
              label="Amount"
              value={amount}
              onChange={handleChangeAmount}
              variant="standard"
              disabled={isRemove}
            />

            <Stack direction="row" alignItems="center">
              <Link
                underline="none"
                color="inherit"
                target="_blank"
                href={`https://xrpl.to/trustset/${slug}`}
                rel="noreferrer noopener nofollow"
              >
                https://xrpl.to/trustset/{slug}
              </Link>
              <CopyToClipboard
                text={`https://xrpl.to/trustset/${slug}`}
                onCopy={() => openSnackbar('Copied!', 'success')}
              >
                <Tooltip title={'Click to copy'}>
                  <IconButton>
                    <Icon icon={copyIcon} />
                  </IconButton>
                </Tooltip>
              </CopyToClipboard>
            </Stack>

            <Stack
              direction="row"
              spacing={2}
              justifyContent="center"
              sx={{ mt: 2 }}
            >
              {isLoggedIn ? (
                <Button
                  variant="contained"
                  onClick={isRemove ? handleRemoveTrust : handleSetTrust}
                  color={`${isRemove ? 'error' : 'primary'}`}
                  size="small"
                >
                  {`${isRemove ? 'Remove' : 'Set'} Trustline`}
                </Button>
              ) : (
                <Wallet />
              )}

              <CopyToClipboard
                text={`https://xrpl.to/trustset/${slug}`}
                onCopy={() => openSnackbar('Copied!', 'success')}
              >
                <Button variant="outlined" color="primary" size="small">
                  Copy Link
                </Button>
              </CopyToClipboard>
            </Stack>
          </Stack>
        </DialogContent>
      </TrustDialog>

      <QRDialog
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
