import axios from 'axios';
import { useState, useEffect, useRef } from 'react';
import Decimal from 'decimal.js';
import CryptoJS from 'crypto-js';
// Material
import { Box, Stack, Table, TableBody, TableCell, TableHead, TableRow, Typography, useMediaQuery, useTheme } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
// Loader
import { PulseLoader } from 'react-spinners';
// Utils
import { normalizeCurrencyCodeXummImpl } from 'src/utils/normalizers';
// Context
import { useContext } from 'react';
import { AppContext } from 'src/AppContext';
// Components
import ListToolbar from 'src/account/ListToolbar';
import TrustLineRow from './TrustLineRow';
import useWebSocket from 'react-use-websocket';
import { selectMetrics, update_metrics } from 'src/redux/statusSlice';
import { useDispatch, useSelector } from 'react-redux';

function truncate(str, n) {
  if (!str) return '';
  return str.length > n ? str.substr(0, n - 1) + ' ...' : str;
}

function truncateAccount(str) {
  if (!str) return '';
  return str.slice(0, 9) + '...' + str.slice(-9);
}

const trustlineFlags = {
  lsfLowReserve: 0x00010000,
  lsfHighReserve: 0x00020000,
  lsfLowAuth: 0x00040000,
  lsfHighAuth: 0x00080000,
  lsfLowNoRipple: 0x00100000,
  lsfHighNoRipple: 0x00200000,
  lsfLowFreeze: 0x00400000,
  lsfHighFreeze: 0x00800000,
};

export default function TrustLines({ account }) {
  const BASE_URL = 'https://api.xrpl.to/api';

  const theme = useTheme();
  const { accountProfile, openSnackbar, sync, activeFiatCurrency, darkMode } = useContext(AppContext);
  const isLoggedIn = accountProfile && accountProfile.account;
  const isMobile = useMediaQuery('(max-width:600px)');
  const dispatch = useDispatch();
  const metrics = useSelector(selectMetrics);
  const exchRate = metrics[activeFiatCurrency];

  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rows, setRows] = useState(10);
  const [total, setTotal] = useState(0);
  const [lines, setLines] = useState([]);

  const WSS_FEED_URL = 'wss://api.xrpl.to/ws/sync';

  const { sendJsonMessage, getWebSocket } = useWebSocket(WSS_FEED_URL, {
    onOpen: () => { },
    onClose: () => { },
    shouldReconnect: (closeEvent) => true,
    onMessage: (event) => processMessages(event),
  });

  const processMessages = (event) => {
    try {
      var t1 = Date.now();
      const json = JSON.parse(event.data);
      dispatch(update_metrics(json));
    } catch (err) {
      console.error(err);
    }
  };

  const getLines = () => {
    setLoading(true);
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
        setLoading(false);
      });
  };

  useEffect(() => {
    getLines();
  }, [account, sync, page, rows]);

  const tableRef = useRef(null);

  return (
    <Box>
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
            '::-webkit-scrollbar': { display: 'none' },
            mt: 2
          }}
          ref={tableRef}
        >
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Currency</TableCell>
                <TableCell align="right" sx={{ display: { xs: 'none', sm: 'table-cell' } }}>Balance</TableCell>
                <TableCell align="right">Value</TableCell>
                {isLoggedIn && accountProfile?.account === account && (
                  <TableCell align="center">Action</TableCell>
                )}
              </TableRow>
            </TableHead>
            <TableBody>
              {lines.map((row, idx) => {
                const { _id, Balance, HighLimit, LowLimit } = row;
                const currency = Balance.currency;
                const currencyName = normalizeCurrencyCodeXummImpl(currency);
                let balance = 0;
                if (account === HighLimit.issuer) {
                  balance = Decimal.abs(Balance.value).toString();
                } else {
                  balance = Balance.value;
                }

                let issuer = null;
                let _balance = Number.parseFloat(Balance.value);
                let highLimit = Number.parseFloat(HighLimit.value);
                let lowLimit = Number.parseFloat(LowLimit.value);
                if (_balance > 0) {
                  issuer = HighLimit.issuer;
                  account = LowLimit.issuer;
                } else if (_balance < 0) {
                  issuer = LowLimit.issuer;
                  account = HighLimit.issuer;
                } else {
                  if (highLimit > 0 && lowLimit == 0) {
                    issuer = LowLimit.issuer;
                    account = HighLimit.issuer;
                  } else if (lowLimit > 0 && highLimit == 0) {
                    issuer = HighLimit.issuer;
                    account = LowLimit.issuer;
                  } else {
                    issuer = null;
                    account = null;
                  }
                }

                let md5 = null;
                if (issuer && currency) md5 = CryptoJS.MD5(issuer + "_" + currency).toString();
                return (
                  <TrustLineRow
                    key={_id}
                    currencyName={currencyName}
                    currency={currency}
                    balance={balance}
                    md5={md5}
                    exchRate={exchRate}
                    issuer={issuer}
                    account={account}
                    limit={highLimit || lowLimit}
                  />
                );
              })}
            </TableBody>
          </Table>
        </Box>
      )}
      {total > 0 && (
        <Box sx={{ px: 1 }}>
          <ListToolbar
            count={total}
            rows={rows}
            setRows={setRows}
            page={page}
            setPage={setPage}
          />
        </Box>
      )}
    </Box>
  );
}
