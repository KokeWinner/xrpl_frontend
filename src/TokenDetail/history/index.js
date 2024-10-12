import React, { useState, useEffect, useRef, useContext } from 'react';
import axios from 'axios';
import Decimal from 'decimal.js';
import { MD5 } from 'crypto-js';
import {
  Avatar,
  Box,
  IconButton,
  Link,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
  Grid,
  Tooltip,
  Stack
} from '@mui/material';
import DateRangeIcon from '@mui/icons-material/DateRange';
import InfoIcon from '@mui/icons-material/Info';
import { makeStyles } from '@mui/styles';
import { FacebookShareButton, TwitterShareButton, FacebookIcon, TwitterIcon } from 'react-share';
import moment from 'moment';
import HistoryToolbar from './HistoryToolbar';
import { fNumber, fNumberWithCurreny } from 'src/utils/formatNumber';
import { normalizeCurrencyCodeXummImpl } from 'src/utils/normalizers';
import { formatDateTime } from 'src/utils/formatTime';
import { AppContext } from 'src/AppContext';
import StackStyle from 'src/components/StackStyle';
import { useSelector } from 'react-redux';
import { selectMetrics } from 'src/redux/statusSlice';
import { currencySymbols } from 'src/utils/constants';

const generateClassName = (rule, sheet) => {
  return `my-component-${rule.key}`;
};

const useStyles = makeStyles(
  () => ({
    customComponent: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'flex-start',
      margin: '10px 0'
    },
    lineContainer: {
      display: 'flex',
      alignItems: 'center',
      marginBottom: '5px',
      width: '100%'
    },
    verticalLine: {
      width: '2px',
      height: '15px',
      background: 'grey',
      marginLeft: '11px'
    },
    icon: {
      marginRight: '5px',
      fontSize: '1.25rem',
      color: 'grey'
    },
    yearsAgo: {
      marginRight: '10px',
      fontSize: '12px',
      color: 'grey'
    },
    price: {
      marginLeft: 'auto',
      fontWeight: 'bold',
      fontSize: '14px'
    },
    priceToday: {
      fontSize: '17px'
    }
  }),
  { generateClassName }
);

function truncate(str, n) {
  if (!str) return '';
  return str.length > n ? str.substr(0, n - 1) + ' ...' : str;
}

function getMD5(issuer, currency) {
  return MD5(issuer + '_' + currency).toString();
}

export default function HistoryData({ token }) {
  const BASE_URL = process.env.API_URL;

  const { darkMode, activeFiatCurrency } = useContext(AppContext);
  const metrics = useSelector(selectMetrics);

  const [page, setPage] = useState(0);
  const [rows, setRows] = useState(10);
  const [count, setCount] = useState(0);
  const [hists, setHists] = useState([]);

  const { issuer, currency, md5 } = token;

  useEffect(() => {
    function getHistories() {
      axios
        .get(`${BASE_URL}/history?md5=${md5}&page=${page}&limit=${rows}`)
        .then((res) => {
          let ret = res.status === 200 ? res.data : undefined;
          if (ret) {
            setCount(ret.count);
            setHists(ret.hists);
          }
        })
        .catch((err) => {
          console.log('Error on getting exchanges!!!', err);
        })
        .then(function () {
          // always executed
        });
    }
    getHistories();
  }, [page, rows]);

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

  const { name } = token;
  let user = token.user;
  if (!user) user = name;
  const imgUrl = `https://s1.xrpl.to/token/${md5}`;

  function getClosestEntry(date, entries, startIndex = 0) {
    let closestEntry = entries[startIndex];
    let minDiff = Math.abs(date - closestEntry[0]);

    for (let i = startIndex; i < entries.length; i++) {
      const entry = entries[i];
      const diff = Math.abs(date - entry[0]);

      if (diff > minDiff) {
        break;
      }

      minDiff = diff;
      closestEntry = entry;
    }

    closestEntry[2] = startIndex;
    return closestEntry;
  }

  const [histsPrices, setHistsPrices] = useState([]);

  useEffect(() => {
    axios
      .get(`${BASE_URL}/graph/${md5}?range=ALL`)
      .then((res) => {
        let ret = res.status === 200 ? res.data : undefined;
        if (ret) {
          const currentDate = new Date();
          const history = ret.history.reverse();
          const yearlyValues = [token.exch];
          let startIndex = 0;

          for (let yearsAgo = 1; ; yearsAgo++) {
            const targetDate = new Date(
              currentDate.getFullYear() - yearsAgo,
              currentDate.getMonth(),
              currentDate.getDate()
            );
            const closestEntry = getClosestEntry(
              targetDate.getTime(),
              history,
              startIndex
            );

            if (closestEntry[0] === history[history.length - 1][0]) {
              const daysDifference =
                Math.abs(targetDate - new Date(closestEntry[0])) /
                (1000 * 60 * 60 * 24);
              if (daysDifference <= 10) {
                yearlyValues.push(closestEntry[1]);
                break;
              }
              break;
            }

            yearlyValues.push(closestEntry[1]);
            startIndex = closestEntry[2];
          }
          setHistsPrices(yearlyValues);
        }
      })
      .catch((err) => {
        console.log('Error on getting graph ALL!!!', err);
      })
      .then(function () {
        // always executed
      });
  }, []);

  const classes = useStyles();
  const title = `${user} price today: ${name} to ${activeFiatCurrency} conversion, live rates, trading volume, historical data, and interactive chart`;
  const desc = `Access up-to-date ${user} prices, ${name} market cap, trading pairs, interactive charts, and comprehensive data from the leading XRP Ledger token price-tracking platform.`;
  const url =
    typeof window !== 'undefined' && window.location.href
      ? window.location.href
      : '';

  function getValueIcon(paidValue, gotValue) {
    if (paidValue < 500 || gotValue < 500) return '🦐';
    if ((paidValue >= 500 && paidValue < 5000) || (gotValue >= 500 && gotValue < 5000)) return '🐬';
    if ((paidValue >= 5000 && paidValue < 10000) || (gotValue >= 5000 && gotValue < 10000)) return '🐋';
    return '';
  }

  return (
    <>
      <Grid container spacing={3} sx={{ p: 0 }}>
        <Grid item xs={12} md={9.5} lg={9.5} sx={{ order: { xs: 2, lg: 1 } }}>
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
                  <TableCell align="left">Time</TableCell>
                  <TableCell align="left">Price</TableCell>
                  <TableCell align="left">
                    Value
                    <Tooltip
                      title={
                        <React.Fragment>
                          <Typography variant="body2">{'< 500 XRP 🦐'}</Typography>
                          <Typography variant="body2">{'500 - 5000 XRP 🐬'}</Typography>
                          <Typography variant="body2">{'5000 - 10000 XRP 🐋'}</Typography>
                        </React.Fragment>
                      }
                    >
                      <IconButton size="small">
                        <InfoIcon fontSize="inherit" />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                  <TableCell align="left">Taker Paid</TableCell>
                  <TableCell align="left">Taker Got</TableCell>
                  <TableCell align="left">Taker</TableCell>
                  <TableCell align="left">Maker</TableCell>
                  <TableCell align="left">Ledger</TableCell>
                  <TableCell align="left">Hash</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {hists.map((row, idx) => {
                  const {
                    maker,
                    taker,
                    seq,
                    paid,
                    got,
                    ledger,
                    hash,
                    time
                  } = row;

                  const paidName = normalizeCurrencyCodeXummImpl(
                    paid.currency
                  );
                  const gotName = normalizeCurrencyCodeXummImpl(got.currency);
                  const md51 = getMD5(paid.issuer, paid.currency);

                  let exch;
                  let name;

                  if (md5 === md51) {
                    exch = Decimal.div(got.value, paid.value).toNumber();
                    name = gotName;
                  } else {
                    exch = Decimal.div(paid.value, got.value).toNumber();
                    name = paidName;
                  }

                  const strDateTime = formatDateTime(time);
                  const relativeTime = moment(time).fromNow();

                  return (
                    <TableRow
                      key={hash}
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
                      <TableCell align="left">
                        <Tooltip title={strDateTime}>
                          <Typography variant="caption">
                            {relativeTime}
                          </Typography>
                        </Tooltip>
                      </TableCell>
                      <TableCell align="left">
                        <Typography variant="caption">
                          {fNumber(exch)} {name}
                        </Typography>
                      </TableCell>
                      <TableCell align="left">
                        {getValueIcon(paid.value, got.value)}
                      </TableCell>
                      <TableCell align="left">
                        {fNumber(paid.value)}{' '}
                        <Typography variant="caption">{paidName}</Typography>
                      </TableCell>
                      <TableCell align="left">
                        {fNumber(got.value)}{' '}
                        <Typography variant="caption">{gotName}</Typography>
                      </TableCell>
                      <TableCell align="left">
                        <Link
                          color="primary"
                          target="_blank"
                          href={`https://bithomp.com/explorer/${taker}`}
                          rel="noreferrer noopener nofollow"
                        >
                          {truncate(taker, 12)}
                        </Link>
                      </TableCell>
                      <TableCell align="left">
                        <Link
                          color="primary"
                          target="_blank"
                          href={`https://bithomp.com/explorer/${maker}`}
                          rel="noreferrer noopener nofollow"
                        >
                          {truncate(maker, 12)}
                        </Link>
                      </TableCell>
                      <TableCell align="left">{ledger}</TableCell>
                      <TableCell
                        align="left"
                        sx={{
                          width: '5%',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        <Stack direction="row" alignItems="center">
                          <Link
                            color="primary"
                            target="_blank"
                            href={`https://bithomp.com/explorer/${hash}`}
                            rel="noreferrer noopener nofollow"
                          >
                            <Stack direction="row" alignItems="center">
                              {truncate(hash, 16)}
                              <IconButton edge="end" aria-label="bithomp"></IconButton>
                            </Stack>
                          </Link>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Box>
        </Grid>

        <Grid
          item
          xs={12}
          md={2.5}
          lg={2.5}
          sx={{ order: { xs: 1, md: 2, lg: 2 } }}
        >
          <Typography variant="h2" fontSize="1.1rem">
            On This Day
          </Typography>
          <Typography variant="s7" noWrap sx={{ paddingBottom: '20px' }}>
            {new Date().toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </Typography>
          <Typography variant="h2" fontSize="0.5rem">
            &nbsp;
          </Typography>
          <StackStyle>
            <Stack
              spacing={0.2}
              sx={{ paddingTop: '20px', paddingBottom: '10px' }}
            >
              <Stack direction="row" alignItems="center" spacing={0.5}>
                <Avatar
                  alt={user}
                  src={imgUrl}
                  sx={{ width: 28, height: 28 }}
                />
                <Stack direction="row" alignItems="baseline" spacing={0.5}>
                  <Typography
                    variant="h2"
                    fontSize="1rem"
                    sx={{ color: darkMode ? '#007B55' : '#5569ff' }}
                  >
                    {user}
                  </Typography>
                  <Typography variant="s16">{name}</Typography>
                </Stack>
              </Stack>
            </Stack>

            <div className={classes.customComponent}>
              {histsPrices.map((value, index) => {
                const isToday = index === 0;
                const yearsAgoText = isToday
                  ? 'Today'
                  : `${index} ${index === 1 ? 'year' : 'years'} ago`;

                return [
                  <div
                    className={classes.lineContainer}
                    key={`lineContainer-${index}`}
                  >
                    <DateRangeIcon className={classes.icon} />
                    <span className={classes.yearsAgo}>{yearsAgoText}</span>
                    <span
                      className={`${classes.price} ${
                        isToday ? classes.priceToday : ''
                      }`}
                      style={{ textAlign: 'right' }}
                    >
                      {currencySymbols[activeFiatCurrency]}
                      {fNumberWithCurreny(value, metrics[activeFiatCurrency])}
                    </span>
                  </div>,
                  index < histsPrices.length - 1 && (
                    <div
                      className={classes.lineContainer}
                      key={`verticalLine-${index}`}
                    >
                      <div className={classes.verticalLine}></div>
                    </div>
                  )
                ];
              })}
            </div>

            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              style={{ justifyContent: 'center', paddingTop: '15px' }}
            >
              <Box>Share </Box>
              <FacebookShareButton
                url={url}
                quote={title}
                hashtag={'#'}
                description={desc}
              >
                <FacebookIcon size={32} round />
              </FacebookShareButton>
              <TwitterShareButton title={title} url={url} hashtag={'#'}>
                <TwitterIcon size={32} round />
              </TwitterShareButton>
            </Stack>
          </StackStyle>
        </Grid>
      </Grid>

      <HistoryToolbar
        count={count}
        rows={rows}
        setRows={setRows}
        page={page}
        setPage={setPage}
      />
    </>
  );
}
