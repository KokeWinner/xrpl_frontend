import axios from 'axios';
import { useState, useEffect } from 'react';
import Decimal from 'decimal.js';

// Material
import { withStyles } from '@mui/styles';
import { Button, Stack, Typography } from '@mui/material';

// Context
import { useContext } from 'react';
import { AppContext } from 'src/AppContext';

import { createOffer, isInstalled, submitTransaction } from "@gemwallet/api";
import sdk from "@crossmarkio/sdk";

// Redux
import { useDispatch } from 'react-redux';

// Components
import QRDialog from 'src/components/QRDialog';
import { enqueueSnackbar } from 'notistack';
import { configureMemos } from 'src/utils/parse/OfferChanges';
// ----------------------------------------------------------------------
const DisabledButton = withStyles({
  root: {
    '&.Mui-disabled': {
      pointerEvents: 'unset', // allow :hover styles to be triggered
      cursor: 'not-allowed' // and custom cursor can be defined without :hover state
    }
  }
})(Button);

export default function PlaceOrder({
  marketLimit,
  buySell,
  pair,
  amount,
  value,
  accountPairBalance
}) {
  const BASE_URL = process.env.API_URL;
  const dispatch = useDispatch();
  const { accountProfile, setLoading, openSnackbar, sync, setSync } =
    useContext(AppContext);
  const [openScanQR, setOpenScanQR] = useState(false);
  const [uuid, setUuid] = useState(null);
  const [qrUrl, setQrUrl] = useState(null);
  const [nextUrl, setNextUrl] = useState(null);

  const isLoggedIn =
    accountProfile && accountProfile.account && accountPairBalance;
  let isSufficientBalance = false;
  let errMsg = '';

  if (isLoggedIn && amount && value) {
    /* accountPairBalance
        {
            "curr1": {
                "currency": "534F4C4F00000000000000000000000000000000",
                "issuer": "rsoLo2S1kiGeCcn6hCUXVrCpGMWLrRrLZz",
                "value": "0.00000383697235788"
            },
            "curr2": {
                "currency": "XRP",
                "issuer": "XRPL",
                "value": 26.733742000000007
            }
        }
        */
    const fAmount = Number(amount); // SOLO
    const fValue = Number(value); // XRP

    if (fAmount > 0 && fValue > 0) {
      const accountAmount = new Decimal(
        accountPairBalance.curr1.value
      ).toNumber();
      const accountValue = new Decimal(
        accountPairBalance.curr2.value
      ).toNumber();
      if (buySell === 'BUY') {
        if (accountValue >= fValue) {
          isSufficientBalance = true;
          errMsg = '';
        } else {
          isSufficientBalance = false;
          errMsg = 'Insufficient wallet balance';
        }
      } else {
        if (accountAmount >= fAmount) {
          isSufficientBalance = true;
          errMsg = '';
        } else {
          isSufficientBalance = false;
          errMsg = 'Insufficient wallet balance';
        }
      }
    }
  } else {
    errMsg = '';
    isSufficientBalance = false;
    if (!isLoggedIn) {
      errMsg = 'Connect your wallet!';
    }
  }

  const canPlaceOrder = isLoggedIn && isSufficientBalance;

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
      } catch (err) {}
    }

    const startInterval = () => {
      let times = 0;

      dispatchTimer = setInterval(async () => {
        const dispatched_result = await getDispatchResult();

        if (dispatched_result && dispatched_result === 'tesSUCCESS') {
          setSync(sync + 1);
          openSnackbar('Successfully submitted the order!', 'success');
          stopInterval();
          return;
        }

        times++;

        if (times >= 10) {
          openSnackbar('Transaction signing rejected!', 'error');
          stopInterval();
          return;
        }
      }, 1000);
    };

    // Stop the interval
    const stopInterval = () => {
      clearInterval(dispatchTimer);
      setOpenScanQR(false);
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
      } catch (err) {}
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
        clearInterval(timer);
      }
    };
  }, [dispatch, openScanQR, uuid]);

  const onOfferCreateXumm = async () => {
    setLoading(true);
    try {
      const curr1 = pair.curr1;
      const curr2 = pair.curr2;
      // const Account = accountProfile.account;
      const user_token = accountProfile.user_token;
      let TakerGets, TakerPays;
      if (buySell === 'BUY') {
        // BUY logic
        // TakerGets: curr2(value) TakerPays: curr1(amount)
        if (curr2.currency === 'XRP') {
          TakerGets = Decimal.mul(value, 1000000).toString();
          TakerPays = {
            currency: curr1.currency,
            issuer: curr1.issuer,
            value: amount.toString()
          };
        } else {
          TakerGets = {
            currency: curr2.currency,
            issuer: curr2.issuer,
            value: value.toString()
          };
          TakerPays = {
            currency: curr1.currency,
            issuer: curr1.issuer,
            value: amount.toString()
          };
        }
      } else {
        // SELL logic
        // TakerGets: curr1(amount) TakerPays: curr2(value)
        if (curr2.currency === 'XRP') {
          TakerGets = {
            currency: curr1.currency,
            issuer: curr1.issuer,
            value: amount.toString()
          };
          TakerPays = Decimal.mul(value, 1000000).toString();
        } else {
          TakerGets = {
            currency: curr1.currency,
            issuer: curr1.issuer,
            value: amount.toString()
          };
          TakerPays = {
            currency: curr2.currency,
            issuer: curr2.issuer,
            value: value.toString()
          };
        }
      }

      const OfferCreate = {
        tfPassive: 0x00010000,
        tfImmediateOrCancel: 0x00020000,
        tfFillOrKill: 0x00040000,
        tfSell: 0x00080000
      };

      let Flags = 0;
      if (marketLimit === 'limit') {
        Flags = OfferCreate.tfSell;
      } else {
        if (buySell === 'BUY') Flags = OfferCreate.tfImmediateOrCancel;
        else Flags = OfferCreate.tfSell | OfferCreate.tfImmediateOrCancel;
      }
      const body = { /*Account,*/ TakerGets, TakerPays, Flags, user_token };
      let memoData = `Create offer via https://xrpl.to`;
      if (Flags & OfferCreate.tfImmediateOrCancel) {
          memoData = `Token Exchange via https://xrpl.to`;
      }

      switch(wallet_type) {
        case "xaman":
          const res = await axios.post(`${BASE_URL}/offer/create`, body);
    
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
          isInstalled().then(async(response) => {
            if (response.result.isInstalled) {
              
              let offerTxData = {
                TransactionType: "OfferCreate",
                Account,
                Flags,
                TakerGets,
                TakerPays,
                Memos: configureMemos('', '', memoData)
              };
              const { response } = await submitTransaction({
                transaction: offerTxData
              });
            }

            else {
              enqueueSnackbar("GemWallet is not installed", { variant: "error" });
            }
          })
          break;
        case "crossmark":
          
          let offerTxData = {
            TransactionType: "OfferCreate",
            Account,
            Flags,
            TakerGets,
            TakerPays,
            Memos: configureMemos('', '', memoData)
          };

          await sdk.methods.signAndSubmitAndWait(offerTxData);
          break;
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
    } catch (err) {}
    setLoading(false);
  };

  const handleScanQRClose = () => {
    setOpenScanQR(false);
    onDisconnectXumm(uuid);
  };

  const handlePlaceOrder = (e) => {
    const fAmount = Number(amount);
    const fValue = Number(value);
    if (fAmount > 0 && fValue > 0) onOfferCreateXumm();
    else {
      openSnackbar('Invalid values!', 'error');
    }

    // if (accountProfile && accountProfile.account) {
    //     // Create offer
    //     /*{
    //         "TransactionType": "OfferCreate",
    //         "Account": "ra5nK24KXen9AHvsdFTKHSANinZseWnPcX",
    //         "Fee": "12",
    //         "Flags": 0,
    //         "LastLedgerSequence": 7108682,
    //         "Sequence": 8,
    //         "TakerGets": "6000000",
    //         "TakerPays": {
    //           "currency": "GKO",
    //           "issuer": "ruazs5h1qEsqpke88pcqnaseXdm6od2xc",
    //           "value": "2"
    //         }
    //     }*/
    //     onOfferCreateXumm();

    // } else {
    //     setShowAccountAlert(true);
    //     setTimeout(() => {
    //         setShowAccountAlert(false);
    //     }, 2000);
    // }
  };

  return (
    <Stack alignItems="center">
      {errMsg && <Typography variant="s2">{errMsg}</Typography>}
      {canPlaceOrder ? (
        <Button
          variant="outlined"
          sx={{ mt: 1.5 }}
          onClick={handlePlaceOrder}
          color={buySell === 'BUY' ? 'primary' : 'error'}
        >
          PLACE ORDER
        </Button>
      ) : (
        <DisabledButton
          variant="outlined"
          sx={{ mt: 1.5 }}
          // onClick={()=>openSnackbar('Please connect wallet!', 'error')}
          disabled
        >
          PLACE ORDER
        </DisabledButton>
      )}

      <QRDialog
        open={openScanQR}
        type="OfferCreate"
        onClose={handleScanQRClose}
        qrUrl={qrUrl}
        nextUrl={nextUrl}
      />
    </Stack>
  );
}
