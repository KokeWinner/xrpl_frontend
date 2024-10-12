import React, { useContext, useEffect, useState } from 'react';
import { Button, Stack, Typography, Input, IconButton, Box } from '@mui/material';
import { styled, useTheme, keyframes } from '@mui/material/styles';
import { Icon } from '@iconify/react';
import exchangeIcon from '@iconify/icons-uil/exchange';
import swapIcon from '@iconify/icons-uil/sync'; // Import an icon for swap
import hideIcon from '@iconify/icons-uil/eye-slash'; // Import an icon for hide
import { AppContext } from 'src/AppContext';
import { useDispatch, useSelector } from 'react-redux';
import axios from 'axios';
import ConnectWallet from 'src/components/ConnectWallet';
import QRDialog from 'src/components/QRDialog';
import { selectMetrics } from 'src/redux/statusSlice';
import { selectProcess, updateProcess, updateTxHash } from 'src/redux/transactionSlice';
import { currencySymbols, XRP_TOKEN } from 'src/utils/constants';
import Decimal from 'decimal.js';
import { fNumber } from 'src/utils/formatNumber';
import useWebSocket from 'react-use-websocket';
import { isInstalled, submitTransaction } from '@gemwallet/api';
import sdk from "@crossmarkio/sdk";
import { configureMemos } from 'src/utils/parse/OfferChanges';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { PuffLoader } from 'react-spinners';

const pulse = keyframes`
  0% {
    transform: scale(0.95);
    opacity: 1;
  }
  70% {
    transform: scale(1);
    opacity: 0.7;
  }
  100% {
    transform: scale(0.95);
    opacity: 1;
  }
`;

const CurrencyContent = styled('div')(
  ({ theme }) => `
    box-sizing: border-box;
    margin: 10px 0;
    display: flex;
    flex-direction: row;
    padding: 20px;
    border-radius: 10px;
    align-items: center;
    background-color: ${theme.palette.background.paper};
    border: 1px solid ${theme.palette.divider};
    width: 100%;
    justify-content: space-between;
`
);

const InputContent = styled('div')(
  ({ theme }) => `
    box-sizing: border-box;
    margin: 0;
    display: flex;
    flex-direction: column;
    align-items: flex-end;
    justify-content: flex-end;
    color: ${theme.palette.text.primary};
`
);

const OverviewWrapper = styled('div')(
  ({ theme }) => `
    flex-direction: column;
    overflow: hidden;
    box-sizing: border-box;
    position: relative;
    border-radius: 16px;
    display: flex;
    border: ${theme.palette.divider};
    padding-bottom: 10px;
    max-width: 600px;
    width: 100%;
    background-color: ${theme.palette.background.default};
    @media (max-width: 600px) {
        border-right: none;
        border-left: none;
        border-image: initial;
        border-radius: unset;
        border-top: none;
        border-bottom: none;
    }
`
);

const ConverterFrame = styled('div')(
  ({ theme }) => `
    flex-direction: column;
    overflow: hidden;
    position: relative;
    display: flex;
    width: 100%;
`
);

const ToggleContent = styled('div')(
  ({ theme }) => `
    cursor: pointer;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    background-color: ${theme.palette.background.paper};
    border-radius: 50%;
    padding: 6px;
`
);

const ExchangeButton = styled(Button)(
  ({ theme }) => `
    width: 100%;
    max-width: 600px;
    @media (max-width: 600px) {
        margin-left: 10px;
        margin-right: 10px;
    }
`
);

const TokenImage = styled(LazyLoadImage)(({ theme }) => ({
  borderRadius: '50%',
  overflow: 'hidden'
}));

const Swap = ({ token }) => {
  const WSS_URL = 'wss://ws.xrpl.to';

  const [sellAmount, setSellAmount] = useState('');
  const [buyAmount, setBuyAmount] = useState('');
  const [pair, setPair] = useState({
    curr1: XRP_TOKEN,
    curr2: token
  });

  const curr1 = pair.curr1;
  const curr2 = pair.curr2;

  const theme = useTheme();
  const color1 = theme.palette.background.default;
  const color2 = theme.palette.background.default;

  const BASE_URL = process.env.API_URL;
  const QR_BLUR = '/static/blurqr.webp';

  const dispatch = useDispatch();
  const metrics = useSelector(selectMetrics);
  const isProcessing = useSelector(selectProcess);

  const { accountProfile, darkMode, setLoading, sync, setSync, openSnackbar, activeFiatCurrency } =
    useContext(AppContext);

  const [openScanQR, setOpenScanQR] = useState(false);
  const [uuid, setUuid] = useState(null);
  const [qrUrl, setQrUrl] = useState(null);
  const [nextUrl, setNextUrl] = useState(null);
  const [revert, setRevert] = useState(false);

  const [token1, setToken1] = useState(curr1);
  const [token2, setToken2] = useState(curr2);

  const [amount1, setAmount1] = useState(''); // XRP
  const [amount2, setAmount2] = useState(''); // Token

  const [tokenExch1, setTokenExch1] = useState(0);
  const [tokenExch2, setTokenExch2] = useState(0);
  const [isSwapped, setSwapped] = useState(false);

  const [active, setActive] = useState('AMOUNT');

  const [accountPairBalance, setAccountPairBalance] = useState(null);

  const [loadingPrice, setLoadingPrice] = useState(false);
  const [focusTop, setFocusTop] = useState(false);
  const [focusBottom, setFocusBottom] = useState(false);

  const amount = revert ? amount2 : amount1;
  const value = revert ? amount1 : amount2;
  const setAmount = revert ? setAmount2 : setAmount1;
  const setValue = revert ? setAmount1 : setAmount2;
  const tokenPrice1 = new Decimal(tokenExch1 || 0)
    .mul(amount1 || 0)
    .div(metrics[activeFiatCurrency] || 1)
    .toNumber();
  const tokenPrice2 = new Decimal(tokenExch2 || 0)
    .mul(amount2 || 0)
    .div(metrics[activeFiatCurrency] || 1)
    .toNumber();

  const inputPrice = revert ? tokenPrice2 : tokenPrice1;
  const outputPrice = revert ? tokenPrice1 : tokenPrice2;
  const priceImpact =
    inputPrice > 0
      ? new Decimal(outputPrice)
        .sub(inputPrice)
        .mul(100)
        .div(inputPrice)
        .toDP(2, Decimal.ROUND_DOWN)
        .toNumber()
      : 0;

  // const color1 = revert?theme.currency.background2:theme.currency.background1;
  // const color2 = revert?theme.currency.background1:theme.currency.background2;
  // var color1, color2;
  // if (typeof theme.currency !== "undefined") // webxtor SEO fix
  // {
  //   /*const */color1 = theme.currency.background2;
  //   /*const */color2 = theme.currency.background2;
  // }

  const isLoggedIn =
    accountProfile && accountProfile.account && accountPairBalance;

  let isSufficientBalance = false;
  let errMsg = '';

  if (isLoggedIn) {
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

    errMsg = '';
    isSufficientBalance = false;
    try {
      const fAmount = new Decimal(amount || 0).toNumber();
      const fValue = new Decimal(value || 0).toNumber();
      const accountAmount = new Decimal(
        accountPairBalance.curr1.value
      ).toNumber();
      const accountValue = new Decimal(
        accountPairBalance.curr2.value
      ).toNumber();

      if (amount1 && amount2) {
        if (fAmount > 0 && fValue > 0) {
          if (accountAmount >= fAmount) {
            isSufficientBalance = true;
          } else {
            errMsg = 'Insufficient wallet balance';
          }
        } else {
          errMsg = 'Insufficient wallet balance';
        }
      }
    } catch (e) {
      errMsg = 'Insufficient wallet balance';
    }
  } else {
    errMsg = 'Connect your wallet!';
    isSufficientBalance = false;
  }

  const canPlaceOrder = isLoggedIn && isSufficientBalance;

  const [bids, setBids] = useState([]); // Orderbook Bids
  const [asks, setAsks] = useState([]); // Orderbook Asks

  const [wsReady, setWsReady] = useState(false);
  const { sendJsonMessage/*, getWebSocket*/ } = useWebSocket(WSS_URL, {
    onOpen: () => { setWsReady(true); },
    onClose: () => { setWsReady(false); },
    shouldReconnect: (closeEvent) => true,
    onMessage: (event) => processMessages(event)
  });

  // Orderbook related useEffect - Start
  useEffect(() => {
    let reqID = 1;
    function sendRequest() {
      if (!wsReady) return;
      /*{
          "id":17,
          "command":"book_offers",
          "taker_gets":{
              "currency":"534F4C4F00000000000000000000000000000000",
              "issuer":"rsoLo2S1kiGeCcn6hCUXVrCpGMWLrRrLZz"
          },
          "taker_pays":{
              "currency":"XRP"
          },
          "ledger_index":"validated",
          "limit":200
      }

      {
          "id":20,
          "command":"book_offers",
          "taker_gets":{"currency":"XRP"},
          "taker_pays":{
              "currency":"534F4C4F00000000000000000000000000000000",
              "issuer":"rsoLo2S1kiGeCcn6hCUXVrCpGMWLrRrLZz"
          },
          "ledger_index":"validated",
          "limit":200
      }*/

      const curr1 = pair.curr1;
      const curr2 = pair.curr2;

      const cmdAsk = {
        id: reqID,
        command: 'book_offers',
        taker_gets: {
          currency: curr1.currency,
          issuer: curr1.currency === 'XRP' ? undefined : curr1.issuer
        },
        taker_pays: {
          currency: curr2.currency,
          issuer: curr2.currency === 'XRP' ? undefined : curr2.issuer
        },
        ledger_index: 'validated',
        limit: 60
      }
      const cmdBid = {
        id: reqID + 1,
        command: 'book_offers',
        taker_gets: {
          currency: curr2.currency,
          issuer: curr2.currency === 'XRP' ? undefined : curr2.issuer
        },
        taker_pays: {
          currency: curr1.currency,
          issuer: curr1.currency === 'XRP' ? undefined : curr1.issuer
        },
        ledger_index: 'validated',
        limit: 60
      }
      sendJsonMessage(cmdAsk);
      sendJsonMessage(cmdBid);
      reqID += 2;
    }

    sendRequest();

    const timer = setInterval(() => sendRequest(), 4000);

    return () => {
      clearInterval(timer);
    }

  }, [wsReady, pair, revert, sendJsonMessage]);
  // Orderbook related useEffect - END

  // web socket process messages for orderbook
  const processMessages = (event) => {
    const orderBook = JSON.parse(event.data);

    if (orderBook.hasOwnProperty('result') && orderBook.status === 'success') {
      const req = orderBook.id % 2;
      //console.log(`Received id ${orderBook.id}`)
      if (req === 1) {
        const parsed = formatOrderBook(orderBook.result.offers, ORDER_TYPE_ASKS);
        setAsks(parsed);
      }
      if (req === 0) {
        const parsed = formatOrderBook(orderBook.result.offers, ORDER_TYPE_BIDS);
        setBids(parsed);
      }
    }
  };

  useEffect(() => {
    function getAccountInfo() {
      if (!accountProfile || !accountProfile.account) return;
      if (!curr1 || !curr2) return;

      const account = accountProfile.account;
      // https://api.xrpl.to/api/account/info/r22G1hNbxBVapj2zSmvjdXyKcedpSDKsm?curr1=534F4C4F00000000000000000000000000000000&issuer1=rsoLo2S1kiGeCcn6hCUXVrCpGMWLrRrLZz&curr2=XRP&issuer2=XRPL
      axios
        .get(
          `${BASE_URL}/account/info/${account}?curr1=${curr1.currency}&issuer1=${curr1.issuer}&curr2=${curr2.currency}&issuer2=${curr2.issuer}`
        )
        .then((res) => {
          let ret = res.status === 200 ? res.data : undefined;
          if (ret) {
            setAccountPairBalance(ret.pair);
          }
        })
        .catch((err) => {
          console.log('Error on getting details!!!', err);
        })
        .then(function () {
          // always executed
        });
    }
    // console.log('account_info')
    getAccountInfo();
  }, [accountProfile, curr1, curr2, sync, isSwapped]);

  useEffect(() => {
    function getTokenPrice() {
      setLoadingPrice(true);
      const md51 = token1.md5;
      const md52 = token2.md5;
      // https://api.xrpl.to/api/pair_rates?md51=84e5efeb89c4eae8f68188982dc290d8&md52=c9ac9a6c44763c1bd9ccc6e47572fd26
      axios
        .get(`${BASE_URL}/pair_rates?md51=${md51}&md52=${md52}`)
        .then((res) => {
          let ret = res.status === 200 ? res.data : undefined;
          if (ret) {
            setTokenExch1(ret.rate1 || 0);
            setTokenExch2(ret.rate2 || 0);
          }
        })
        .catch((err) => {
          console.log('Error on getting token info!', err);
        })
        .then(function () {
          // always executed
          setLoadingPrice(false);
        });
    }
    getTokenPrice();
  }, [token1, amount1, token2, amount2]);

  useEffect(() => {
    if (active === 'VALUE') {
      setAmount(calcQuantity(value, active));
    } else {
      setValue(calcQuantity(amount, active));
    }
  }, [asks, bids, revert, active]);

  useEffect(() => {
    const pair = {
      curr1: revert ? token2 : token1,
      curr2: revert ? token1 : token2
    };
    setPair(pair);
  }, [revert, token1, token2]);

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
      setAmount1('');
      setAmount2('');
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
  }, [openScanQR, uuid]);

  const onOfferCreateXumm = async () => {
    try {
      // const curr1 = revert?pair.curr2:pair.curr1;
      // const curr2 = revert?pair.curr1:pair.curr2;
      const curr1 = pair.curr1;
      const curr2 = pair.curr2;
      const Account = accountProfile.account;
      const user_token = accountProfile.user_token;
      const wallet_type = accountProfile.wallet_type;
      let TakerGets, TakerPays;
      /*if (buySell === 'BUY') {
                // BUY logic
                TakerGets = {currency:curr2.currency, issuer:curr2.issuer, value: value.toString()};
                TakerPays = {currency:curr1.currency, issuer:curr1.issuer, value: amount.toString()};
            } else */
      // {
      // SELL logic
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
      // }

      const OfferCreate = {
        tfPassive: 0x00010000,
        tfImmediateOrCancel: 0x00020000,
        tfFillOrKill: 0x00040000,
        tfSell: 0x00080000
      };

      //const Flags = OfferCreate.tfSell | OfferCreate.tfImmediateOrCancel;
      const Flags = OfferCreate.tfImmediateOrCancel;

      const body = { /*Account,*/ TakerGets, TakerPays, Flags, user_token };

      let memoData = `Create offer via https://xrpl.to`;
      if (Flags & OfferCreate.tfImmediateOrCancel) {
        memoData = `Token Exchange via https://xrpl.to`;
      }

      switch (wallet_type) {
        case "xaman":
          setLoading(true);
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
          isInstalled().then(async (response) => {
            if (response.result.isInstalled) {
              if (TakerGets.currency === 'XRP') {
                TakerGets = Decimal.mul(TakerGets.value, 1000000).toString();
              }

              if (TakerPays.currency === 'XRP') {
                TakerPays = Decimal.mul(TakerPays.value, 1000000).toString();
              }
              let offerTxData = {
                TransactionType: "OfferCreate",
                Account,
                Flags,
                TakerGets,
                TakerPays,
                Memos: configureMemos('', '', memoData)
              };

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

                setSwapped(!isSwapped);
              });
            }

            else {
              enqueueSnackbar("GemWallet is not installed", { variant: "error" });
            }
          })
          break;
        case "crossmark":

          if (TakerGets.currency === 'XRP') {
            TakerGets = Decimal.mul(TakerGets.value, 1000000).toString();
          }

          if (TakerPays.currency === 'XRP') {
            TakerPays = Decimal.mul(TakerPays.value, 1000000).toString();
          }
          let offerTxData = {
            TransactionType: "OfferCreate",
            Account,
            Flags,
            TakerGets,
            TakerPays,
            Memos: configureMemos('', '', memoData)
          };

          dispatch(updateProcess(1));
          await sdk.methods.signAndSubmitAndWait(offerTxData)
            .then(({ response }) => {
              if (response.data.meta.isSuccess) {
                dispatch(updateProcess(2));
                dispatch(updateTxHash(response.data.resp.result?.hash));

              } else {
                dispatch(updateProcess(3));
              }
              setSwapped(!isSwapped);
            });
          // }
          break;
      }

    } catch (err) {
      console.log("err", err);
      dispatch(updateProcess(0));
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
    } catch (err) { }
    setLoading(false);
  };

  const calcQuantity = (amount, active) => {
    let amt = 0;
    let val = 0;

    /*
            ask: taker_gets = curr1, taker_pays = curr2
            bid: taker_gets = curr2, taker_pays = curr1
         */
    try {
      amt = new Decimal(amount).toNumber();
    } catch (e) { }

    if (amt === 0) return "";

    try {
      if (active === 'AMOUNT') {
        for (var bid of bids) {
          if (bid.sumAmount >= amt) {
            val = new Decimal(bid.sumValue)
              .mul(amt)
              .div(bid.sumAmount)
              .toNumber();
            break;
          }
        }
      } else {
        for (var bid of bids) {
          if (bid.sumValue >= amt) {
            val = new Decimal(bid.sumAmount)
              .mul(amt)
              .div(bid.sumValue)
              .toNumber();
            break;
          }
        }
      }
      return new Decimal(val).toFixed(6, Decimal.ROUND_DOWN);
    } catch (e) { }

    return 0;
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
  };

  const handleChangeAmount1 = (e) => {
    let value = e.target.value;

    if (value == ".") value = "0.";
    if (isNaN(Number(value))) return;

    setAmount1(value);
    setActive(revert ? 'VALUE' : 'AMOUNT');
  };

  const handleChangeAmount2 = (e) => {
    const value = e.target.value;

    if (value == ".") value = "0.";
    if (isNaN(Number(value))) return;

    setAmount2(value);
    setActive(revert ? 'AMOUNT' : 'VALUE');
  };

  const onRevertExchange = () => {
    setRevert(!revert);
    /*
        
        const newToken1 = {...token2};
        const newToken2 = {...token1};
        setToken1(newToken1);
        setToken2(newToken2);
        setAmount1(amount1);
        setAmount2(amount2);

        */
  };

  const handleMsg = () => {
    if (isProcessing == 1) return "Pending Exchanging";
    if (!amount1 || !amount2) return "Enter an Amount";
    else if (errMsg && amount1 !== '' && amount2 !== '') return errMsg;
    else return "Exchange";
  }

  const onFillMax = () => {
    if (revert) {
      if (accountPairBalance?.curr1.value > 0)
        setAmount2(accountPairBalance?.curr1.value);
    }

    else {
      if (accountPairBalance?.curr1.value > 0)
        setAmount1(accountPairBalance?.curr1.value);
    }
  }

  return (
    <Stack alignItems="center" width="100%">
      <OverviewWrapper>
        <ConverterFrame>
          <CurrencyContent style={{ backgroundColor: color1 }}>
            <Box display="flex" flexDirection="column" flex="1" gap="5.4px">
              <Box display="flex" justifyContent="space-between" alignItems="top" width="100%">
                <Typography lineHeight="1.4" variant="subtitle1">You sell</Typography>
              </Box>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <TokenImage
                  src={`https://s1.xrpl.to/token/${curr1.md5}`} // use normal <img> attributes as props
                  width={32}
                  height={32}
                  onError={(event) => (event.target.src = '/static/alt.webp')}
                />
                <Typography variant="h6">{curr1.name}</Typography>
              </Stack>
              <Typography variant="body2" color="textSecondary">{curr1.user}</Typography>
            </Box>
            <InputContent>
              {
                isLoggedIn &&
                <Stack direction="row" alignItems="center" justifyContent="flex-end" spacing={1}>
                  <Typography variant="s7">
                    Balance{' '}
                    <Typography variant="s2" color="primary" >
                      {accountPairBalance?.curr1.value}
                    </Typography>
                  </Typography>

                  <Button sx={{ px: 0, py: 0, minWidth: 0 }} onClick={onFillMax}>MAX</Button>
                </Stack>
              }
              <Input
                placeholder="0"
                autoComplete="new-password"
                disableUnderline
                value={amount1}
                onChange={handleChangeAmount1}
                sx={{
                  width: '100%',
                  input: {
                    autoComplete: 'off',
                    padding: '0px 0 10px 0px',
                    border: 'none',
                    fontSize: '18px',
                    textAlign: 'end',
                    appearance: 'none',
                    fontWeight: 700
                  }
                }}
              />
              <Typography variant="body2" color="textSecondary">~{currencySymbols[activeFiatCurrency]} {fNumber(tokenPrice1)}</Typography>
            </InputContent>
          </CurrencyContent>

          <CurrencyContent style={{ backgroundColor: color2 }}>
            <Box display="flex" flexDirection="column" flex="1" gap="5.4px">
              <Box display="flex" justifyContent="space-between" alignItems="center" width="100%">
                <Typography variant="subtitle1">You buy</Typography>
              </Box>
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <TokenImage
                  src={`https://s1.xrpl.to/token/${curr2.md5}`} // use normal <img> attributes as props
                  width={32}
                  height={32}
                  onError={(event) => (event.target.src = '/static/alt.webp')}
                />
                <Typography variant="h6">{curr2.name}</Typography>
              </Stack>
              <Typography variant="body2" color="textSecondary">{curr2.user}</Typography>
            </Box>
            <InputContent>
              {
                isLoggedIn &&
                <Stack direction="row" alignItems="center" justifyContent="flex-end" spacing={1}>
                  <Typography variant="s7">
                    Balance{' '}
                    <Typography variant="s2" color="primary" >
                      {accountPairBalance?.curr2.value}
                    </Typography>
                  </Typography>
                </Stack>
              }
              <Input
                placeholder="0"
                autoComplete="new-password"
                disableUnderline
                value={amount2}
                onChange={handleChangeAmount2}
                disabled
                sx={{
                  width: '100%',
                  input: {
                    autoComplete: 'off',
                    padding: '0px 0 10px 0px',
                    border: 'none',
                    fontSize: '18px',
                    textAlign: 'end',
                    appearance: 'none',
                    fontWeight: 700
                  }
                }}
              />
              <Typography variant="body2" color="textSecondary">~{currencySymbols[activeFiatCurrency]} {fNumber(tokenPrice2)}</Typography>
            </InputContent>
          </CurrencyContent>

          <ToggleContent>
            <IconButton size="medium" onClick={onRevertExchange}>
              <Icon
                icon={exchangeIcon}
                width="28"
                height="28"
                style={{
                  color: theme.palette.text.primary,
                  transform: 'rotate(90deg)',
                }}
              />
            </IconButton>
          </ToggleContent>
        </ConverterFrame>
      </OverviewWrapper>

      <Stack direction="row" alignItems="center" justifyContent="flex-start" spacing={0.5} sx={{ mt: 1, mb: 1, width: '100%' }}>
        <PuffLoader color={darkMode ? '#007B55' : '#5569ff'} size={20} />
        <Typography variant="body1">
          1 {curr1.name} = {revert ? tokenExch2.toFixed(3) : (1 / tokenExch2).toFixed(3)} {curr2.name}
        </Typography>
      </Stack>

      <Stack sx={{ width: "100%" }}>
        {
          accountProfile && accountProfile.account ? (
            <ExchangeButton
              variant="contained"

              onClick={handlePlaceOrder}
              sx={{ mt: 0 }}
            >
              {handleMsg()}
            </ExchangeButton>
          ) : (
            <ConnectWallet pair={pair} />
          )
        }
      </Stack>

      <QRDialog
        open={openScanQR}
        type="OfferCreate"
        onClose={handleScanQRClose}
        qrUrl={qrUrl}
        nextUrl={nextUrl}
      />

    </Stack>
  );
};

const App = ({ token }) => {
  const [showSwap, setShowSwap] = useState(false);

  const toggleSwap = () => {
    setShowSwap(!showSwap);
  };

  return (
    <Stack alignItems="center" width="100%">
      <Button variant="outlined" onClick={toggleSwap} fullWidth startIcon={<Icon icon={showSwap ? hideIcon : swapIcon} />}>
        {showSwap ? 'Hide Swap' : 'Swap Now'}
      </Button>
      {showSwap && <Swap token={token} />}
    </Stack>
  );
};

export default App;

const ORDER_TYPE_BIDS = 1;
const ORDER_TYPE_ASKS = 2;

const formatOrderBook = (offers, orderType = ORDER_TYPE_BIDS) => {

  if (offers.length < 1) return []

  const getCurrency = offers[0].TakerGets?.currency || 'XRP'
  const payCurrency = offers[0].TakerPays?.currency || 'XRP'

  let multiplier = 1
  const isBID = orderType === ORDER_TYPE_BIDS

  // It's the same on each condition?
  if (isBID) {
    if (getCurrency === 'XRP')
      multiplier = 1_000_000
    else if (payCurrency === 'XRP')
      multiplier = 0.000_001
  } else {
    if (getCurrency === 'XRP')
      multiplier = 1_000_000
    else if (payCurrency === 'XRP')
      multiplier = 0.000_001
  }

  // let precision = maxDecimals(isBID ? Math.pow(offers[0].quality * multiplier, -1) : offers[0].quality * multiplier)

  // let index = 0
  const array = []
  let sumAmount = 0;
  let sumValue = 0;

  for (let i = 0; i < offers.length; i++) {
    const offer = offers[i]
    const obj = {
      id: '',
      price: 0,
      amount: 0,
      value: 0,
      sumAmount: 0, // SOLO
      sumValue: 0, // XRP
      avgPrice: 0,
      sumGets: 0,
      sumPays: 0,
      isNew: false
    }

    const id = `${offer.Account}:${offer.Sequence}`;
    const gets = offer.taker_gets_funded || offer.TakerGets;
    const pays = offer.taker_pays_funded || offer.TakerPays;
    // const partial = (offer.taker_gets_funded || offer.taker_pays_funded) ? true: false;

    const takerPays = pays.value || pays;
    const takerGets = gets.value || gets;

    const amount = Number(isBID ? takerPays : takerGets)
    const price = isBID ? Math.pow(offer.quality * multiplier, -1) : offer.quality * multiplier
    const value = amount * price;

    sumAmount += amount;
    sumValue += value;
    obj.id = id;
    obj.price = price
    obj.amount = amount // SOLO
    obj.value = value // XRP
    obj.sumAmount = sumAmount
    obj.sumValue = sumValue

    if (sumAmount > 0)
      obj.avgPrice = sumValue / sumAmount
    else
      obj.avgPrice = 0

    //obj.partial = partial

    if (amount > 0)
      array.push(obj)

  }

  const sortedArrayByPrice = [...array].sort(
    (a, b) => {
      let result = 0;
      if (orderType === ORDER_TYPE_BIDS) {
        result = b.price - a.price;
      } else {
        result = a.price - b.price;
      }
      return result;
    }
  );

  return sortedArrayByPrice;
}
