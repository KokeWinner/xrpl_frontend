import axios from 'axios';
import PropTypes from 'prop-types';
import { useState, useEffect, useRef } from 'react';
import Decimal from 'decimal.js';
// Material
import { withStyles } from '@mui/styles';
import { styled } from '@mui/material';

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
import { PuffLoader, PulseLoader } from 'react-spinners';
import { ProgressBar, Discuss } from 'react-loader-spinner';

// Utils
import { checkExpiration } from 'src/utils/extra';
import { formatDateTime } from 'src/utils/formatTime';
import { fNumber } from 'src/utils/formatNumber';
import { normalizeCurrencyCodeXummImpl } from 'src/utils/normalizers';

// Context
import { useContext } from 'react';
import { AppContext } from 'src/AppContext';

// Components
import QRDialog from 'src/components/QRDialog';
import ListToolbar from './ListToolbar';

// ----------------------------------------------------------------------
//import StackStyle from 'src/components/StackStyle';

const noRipplingStyle = {
  display: 'inline-block',
  marginLeft: '4px',
  color: '#C4CDD5',
  fontSize: '11px',
  fontWeight: '500',
  lineHeight: '18px',
  backgroundColor: '#323546',
  borderRadius: '4px',
  padding: '2px 4px'
};

const ripplingStyle = {
  display: 'inline-block',
  marginLeft: '4px',
  color: '#FFFFFF',
  fontSize: '11px',
  fontWeight: '500',
  lineHeight: '18px',
  backgroundColor: '#007B55',
  borderRadius: '4px',
  padding: '2px 4px'
};

const BuyTypography = withStyles({
  root: {
    color: '#007B55',
    borderRadius: '5px',
    border: '0.05em solid #007B55',
    fontSize: '0.7rem',
    lineHeight: '1',
    paddingLeft: '8px',
    paddingRight: '8px',
    paddingTop: '3px',
    paddingBottom: '3px'
  }
})(Typography);

const SellTypography = withStyles({
  root: {
    color: '#B72136',
    borderRadius: '5px',
    border: '0.05em solid #B72136',
    fontSize: '0.7rem',
    lineHeight: '1',
    paddingLeft: '6px',
    paddingRight: '6px',
    paddingTop: '3px',
    paddingBottom: '3px'
  }
})(Typography);

function truncate(str, n) {
  if (!str) return '';
  //return (str.length > n) ? str.substr(0, n-1) + '&hellip;' : str;
  return str.length > n ? str.substr(0, n - 1) + ' ...' : str;
}

function truncateAccount(str) {
  if (!str) return '';
  return str.slice(0, 9) + '...' + str.slice(-9);
}

const trustlineFlags = {
  // Flag Name	 Hex Value	Corresponding TrustSet Flag	Description
  lsfLowReserve: 0x00010000, // [NONE],         This RippleState object contributes to the low account's owner reserve.
  lsfHighReserve: 0x00020000, // [NONE],         This RippleState object contributes to the high account's owner reserve.
  lsfLowAuth: 0x00040000, // tfSetAuth,      The low account has authorized the high account to hold tokens issued by the low account.
  lsfHighAuth: 0x00080000, // tfSetAuth,      The high account has authorized the low account to hold tokens issued by the high account.
  lsfLowNoRipple: 0x00100000, // tfSetNoRipple,	The low account has disabled rippling from this trust line.
  lsfHighNoRipple: 0x00200000, // tfSetNoRipple,	The high account has disabled rippling from this trust line.
  lsfLowFreeze: 0x00400000, // tfSetFreeze,	The low account has frozen the trust line, preventing the high account from transferring the asset.
  lsfHighFreeze: 0x00800000 // tfSetFreeze,	The high account has frozen the trust line, preventing the low account from transferring the asset.
};

export default function TrustList({ account }) {
  const BASE_URL = 'https://api.xrpl.to/api';

  const { accountProfile, openSnackbar, sync, setSync, darkMode } =
    useContext(AppContext);
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
  const [lines, setLines] = useState([]);

  const getLines = () => {
    setLoading(true);
    // https://api.xrpl.to/api/account/lines/r22G1hNbxBVapj2zSmvjdXyKcedpSDKsm
    axios
      .get(`${BASE_URL}/account/lines/${account}?page=${page}&limit=${rows}`)
      .then((res) => {
        let ret = res.status === 200 ? res.data : undefined;
        if (ret) {
          setTotal(ret.total);
          setLines(ret.lines);
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

  useEffect(() => {
    getLines();
  }, [account, sync, page, rows]);

  const handleCancel = (event, issuer, currency) => {
    if (!isLoggedIn) {
      openSnackbar('Please connect wallet!', 'error');
    } else if (accountProfile.account !== account) {
      openSnackbar('You are not the owner of this offer!', 'error');
    } else {
      // onOfferCancelXumm(seq);
      onTrustRemoveXumm(event, issuer, currency);
    }
  };

  const onTrustRemoveXumm = async (e, issuer, currency) => {
    /*{
            "TransactionType": "TrustSet",
            "Account": "ra5nK24KXen9AHvsdFTKHSANinZseWnPcX",
            "Fee": "12",
            "Flags": 262144,
            "LastLedgerSequence": 8007750,
            "LimitAmount": {
              "currency": "USD",
              "issuer": "rsP3mgGb2tcYUrxiLFiHJiQXhsziegtwBc",
              "value": "0"
            },
            "Sequence": 12
        }*/
    setLoading(true);
    try {
      const user_token = accountProfile?.user_token;

      const Flags = 0x00020000;

      let LimitAmount = {};
      LimitAmount.issuer = issuer;
      LimitAmount.currency = currency;
      LimitAmount.value = 0;

      const body = { LimitAmount, Flags, user_token };

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
    } catch (err) {
      openSnackbar('Network error!', 'error');
    }
    setLoading(false);
  };

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
          openSnackbar('Successfully removed trustline!', 'success');
          getLines();
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
    };

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
        if (resolved_at) {
          startInterval();
          return;
        }
      } catch (err) {}
      isRunning = false;
      counter--;
      if (counter <= 0) {
        openSnackbar('Timeout!', 'error');
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

  const onOfferCancelXumm = async (seq) => {
    setLoading(true);
    try {
      const OfferSequence = seq;

      const user_token = accountProfile.user_token;

      const body = { OfferSequence, user_token };

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
    } catch (err) {}
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

  return (
    <Container maxWidth="xl" sx={{ pl: 0, pr: 0 }}>
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
          borderColor="#F4442E"
          barColor="#51E5FF"
        />
      </Backdrop>

      <QRDialog
        open={openScanQR}
        type="RemoveTrustLine"
        onClose={handleScanQRClose}
        qrUrl={qrUrl}
        nextUrl={nextUrl}
      />

      {loading ? (
        <Stack alignItems="center">
          <PulseLoader color={darkMode ? '#007B55' : '#5569ff'} size={10} />
        </Stack>
      ) : (
        lines &&
        lines.length === 0 && (
          <Stack alignItems="center" sx={{ mt: 2, mb: 1 }}>
            <Typography variant="s6" color="primary">
              <ErrorOutlineIcon fontSize="small" sx={{ mr: '5px' }} />
              [ No TrustLines ]
            </Typography>
          </Stack>
        )
      )}

      {total > 0 && (
        <Box
          sx={{
            display: 'flex',
            gap: 1,
            py: 1,
            overflow: 'auto',
            width: '100%',
            '& > *': {
              scrollSnapAlign: 'center'
            },
            '::-webkit-scrollbar': { display: 'none' }
          }}
          ref={tableRef}
        >
          <Table
            stickyHeader
            size={'small'}
            sx={{
              '& .MuiTableCell-root': {
                borderBottom: 'none',
                boxShadow: darkMode
                  ? 'inset 0 -1px 0 rgba(68 67 67), inset 0 -1px 0 rgba(255, 255, 255, 0.1)'
                  : 'inset 0 -1px 0 #dadee3'
              }
            }}
          >
            <TableHead>
              <TableRow>
                <TableCell
                  align="left"
                  sx={{
                    position: 'sticky',
                    zIndex: 1001,
                    left: 0,
                    background: darkMode ? '#000000' : '#FFFFFF'
                  }}
                ></TableCell>
                <TableCell
                  align="left"
                  sx={{
                    position: 'sticky',
                    zIndex: 1002,
                    left: 32,
                    background: darkMode ? '#000000' : '#FFFFFF',
                    '&:before': scrollLeft
                      ? {
                          content: "''",
                          boxShadow: 'inset 10px 0 8px -8px #00000026',
                          position: 'absolute',
                          top: '0',
                          right: '0',
                          bottom: '-1px',
                          width: '30px',
                          transform: 'translate(100%)',
                          transition: 'box-shadow .3s',
                          pointerEvents: 'none'
                        }
                      : {}
                  }}
                >
                  #
                </TableCell>
                <TableCell align="left">Peer</TableCell>
                <TableCell align="left">Currency</TableCell>
                <TableCell align="left">Peer Limit</TableCell>
                <TableCell align="left">Owner Limit</TableCell>
                <TableCell align="left">Balance</TableCell>
                <TableCell align="left">Rippling</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {lines.map((row, idx) => {
                /*
                                {
                                    "_id": "r22G1hNbxBVapj2zSmvjdXyKcedpSDKsm_534F4C4F00000000000000000000000000000000_rsoLo2S1kiGeCcn6hCUXVrCpGMWLrRrLZz",
                                    "Balance": {
                                        "currency": "534F4C4F00000000000000000000000000000000",
                                        "issuer": "rrrrrrrrrrrrrrrrrrrrBZbvji",
                                        "value": "10.00000383697235"
                                    },
                                    "Flags": 1114112,
                                    "HighLimit": {
                                        "currency": "534F4C4F00000000000000000000000000000000",
                                        "issuer": "rsoLo2S1kiGeCcn6hCUXVrCpGMWLrRrLZz",
                                        "value": "0"
                                    },
                                    "HighNode": "342c",
                                    "LedgerEntryType": "RippleState",
                                    "LowLimit": {
                                        "currency": "534F4C4F00000000000000000000000000000000",
                                        "issuer": "r22G1hNbxBVapj2zSmvjdXyKcedpSDKsm",
                                        "value": "1000000000"
                                    },
                                    "LowNode": "0",
                                    "PreviousTxnID": "1DA69360B07CACFD4353933F5ED9CC9933413BEBB4ECF9CE623F7503E3AA3D5E",
                                    "PreviousTxnLgrSeq": 78677075,
                                    "index": "F7B30BCAEE7B8590858F40D12C30C7219A14907B12477C5A3788C6DBE386BD78"
                                },
                                */
                const { _id, Balance, Flags, HighLimit, LowLimit } = row;
                const flags = Flags || 0;
                const currency = Balance.currency;
                const currencyName = normalizeCurrencyCodeXummImpl(currency);
                let peer = null;
                let owner = null;
                let peerFrozen = false;
                let ownerFrozen = false;
                let balance = 0;
                if (account === HighLimit.issuer) {
                  peer = LowLimit;
                  owner = HighLimit;
                  peerFrozen =
                    (flags & trustlineFlags.lsfLowFreeze) > 0 ? true : false;
                  ownerFrozen =
                    (flags & trustlineFlags.lsfHighFreeze) > 0 ? true : false;
                  balance = Decimal.abs(Balance.value).toString();
                } else {
                  peer = HighLimit;
                  owner = LowLimit;
                  peerFrozen =
                    (flags & trustlineFlags.lsfHighFreeze) > 0 ? true : false;
                  ownerFrozen =
                    (flags & trustlineFlags.lsfLowFreeze) > 0 ? true : false;
                  balance = Balance.value;
                }

                const rippling =
                  flags & trustlineFlags.lsfLowNoRipple ||
                  flags & trustlineFlags.lsfHighNoRipple
                    ? false
                    : true;

                const frozen =
                  flags & trustlineFlags.lsfLowFreeze ||
                  flags & trustlineFlags.lsfHighFreeze
                    ? true
                    : false;

                // const strCreatedTime = formatDateTime(ctime);
                // peer, currency, peer limit, owner limit, balance, rippling
                return (
                  <TableRow
                    key={_id}
                    sx={{
                      '&:hover': {
                        '& .MuiTableCell-root': {
                          backgroundColor: darkMode
                            ? '#232326 !important'
                            : '#D9DCE0 !important'
                        }
                      }
                    }}
                  >
                    <TableCell
                      align="left"
                      sx={{
                        position: 'sticky',
                        zIndex: 1001,
                        left: 0,
                        background: darkMode ? '#000000' : '#FFFFFF'
                      }}
                    >
                      <Tooltip title="Remove TrustLine">
                        <IconButton
                          color="error"
                          onClick={(e) =>
                            handleCancel(e, peer.issuer, currency)
                          }
                          aria-label="cancel"
                        >
                          <CancelIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </TableCell>

                    <TableCell
                      align="left"
                      sx={{
                        position: 'sticky',
                        zIndex: 1002,
                        left: 32,
                        background: darkMode ? '#000000' : '#FFFFFF',
                        '&:before': scrollLeft
                          ? {
                              content: "''",
                              boxShadow: 'inset 10px 0 8px -8px #00000026',
                              position: 'absolute',
                              top: '0',
                              right: '0',
                              bottom: '-1px',
                              width: '30px',
                              transform: 'translate(100%)',
                              transition: 'box-shadow .3s',
                              pointerEvents: 'none'
                            }
                          : {}
                      }}
                    >
                      <Typography variant="s6" noWrap>
                        {idx + page * rows + 1}
                      </Typography>
                    </TableCell>

                    <TableCell align="left">
                      <Link
                        // underline="none"
                        // color="inherit"
                        target="_blank"
                        href={`https://bithomp.com/explorer/${peer.issuer}`}
                        rel="noreferrer noopener nofollow"
                      >
                        <Typography variant="s6" noWrap color="primary">
                          {peer.issuer}
                        </Typography>
                      </Link>
                    </TableCell>

                    <TableCell align="left">
                      <Typography variant="s6" noWrap>
                        {currencyName}
                      </Typography>
                    </TableCell>

                    <TableCell align="left">
                      <Typography variant="s6" noWrap>
                        {fNumber(peer.value)}
                        {peerFrozen && (
                          <span style={ripplingStyle}>FROZEN</span>
                        )}
                      </Typography>
                    </TableCell>

                    <TableCell align="left">
                      <Typography variant="s6" noWrap>
                        {fNumber(owner.value)}
                        {ownerFrozen && (
                          <span style={ripplingStyle}>FROZEN</span>
                        )}
                      </Typography>
                    </TableCell>

                    <TableCell align="left">
                      <Typography variant="s6" noWrap>
                        {fNumber(balance)}
                      </Typography>
                    </TableCell>

                    <TableCell align="left">
                      <Typography variant="s6" noWrap>
                        {rippling ? (
                          <span style={ripplingStyle}>YES</span>
                        ) : (
                          <span style={noRipplingStyle}>NO</span>
                        )}
                      </Typography>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Box>
      )}
      {total > 0 && (
        <ListToolbar
          count={total}
          rows={rows}
          setRows={setRows}
          page={page}
          setPage={setPage}
        />
      )}
    </Container>
  );
}
