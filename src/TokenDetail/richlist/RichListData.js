import axios from 'axios';
import { useState, useEffect, useRef } from 'react';

import Tooltip from '@mui/material/Tooltip';
import InfoIcon from '@mui/icons-material/Info';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'; // Make sure this is imported

// Material
import {
  Avatar,
  Box,
  Checkbox,
  IconButton,
  Link,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableSortLabel,
  TableRow,
  Typography
} from '@mui/material';
import { visuallyHidden } from '@mui/utils';

// Context
import { useContext } from 'react';
import { AppContext } from 'src/AppContext';

// Redux
import { useSelector } from 'react-redux';
import { selectMetrics } from 'src/redux/statusSlice';

// Components
import RichListToolbar from './RichListToolbar';

// Iconify
import { Icon } from '@iconify/react';

import checkIcon from '@iconify/icons-akar-icons/check';
import caretDown from '@iconify/icons-bx/caret-down';
import caretUp from '@iconify/icons-bx/caret-up';

// Utils
import { fNumber, fPercent } from 'src/utils/formatNumber';

import NumberTooltip from 'src/components/NumberTooltip';
import { currencySymbols } from 'src/utils/constants';

// ----------------------------------------------------------------------
function truncate(str, n) {
  if (!str) return '';
  //return (str.length > n) ? str.substr(0, n-1) + '&hellip;' : str;
  return str.length > n ? str.substr(0, n - 1) + ' ...' : str;
}

export default function RichListData({ token }) {
  const BASE_URL = process.env.API_URL;
  const metrics = useSelector(selectMetrics);

  const {
    accountProfile,
    setLoading,
    openSnackbar,
    darkMode,
    activeFiatCurrency
  } = useContext(AppContext);
  const isAdmin =
    accountProfile && accountProfile.account && accountProfile.admin;

  const [page, setPage] = useState(0);
  const [rows, setRows] = useState(20);
  const [frozen, setFrozen] = useState(false);
  const [count, setCount] = useState(0);
  const [richList, setRichList] = useState([]);
  const [wallets, setWallets] = useState([]); // Team Wallets

  const [order, setOrder] = useState('desc');
  const [orderBy, setOrderBy] = useState('');

  const { name, exch } = token;

  const badge24hStyle = {
    display: 'inline-block',
    marginLeft: '4px',
    marginRight: '4px',
    // color: '#C4CDD5',
    fontSize: '11px',
    fontWeight: '500',
    lineHeight: '18px',
    //backgroundColor: '#323546',
    borderRadius: '4px',
    border: '1px solid #323546',
    padding: '1px 4px'
  };

  useEffect(() => {
    function getRichList() {
      // https://api.xrpl.to/api/richlist/0413ca7cfc258dfaf698c02fe304e607?start=0&limit=100&freeze=false
      axios
        .get(
          `${BASE_URL}/richlist/${token.md5}?start=${
            page * rows
          }&limit=${rows}&freeze=${frozen}&sortBy=${orderBy}&sortType=${order}`
        )
        .then((res) => {
          let ret = res.status === 200 ? res.data : undefined;
          if (ret) {
            setCount(ret.length);
            setRichList(ret.richList);
          }
        })
        .catch((err) => {
          console.log('Error on getting richlist!', err);
        })
        .then(function () {
          // always executed
        });
    }
    getRichList();
  }, [page, rows, frozen, orderBy, order]);

  useEffect(() => {
    function getTeamWallets() {
      const accountAdmin = accountProfile.account;
      const accountToken = accountProfile.token;
      // https://api.xrpl.to/api/admin/get_team_wallets/0413ca7cfc258dfaf698c02fe304e607
      axios
        .get(`${BASE_URL}/admin/get_team_wallets/${token.md5}`, {
          headers: {
            'x-access-account': accountAdmin,
            'x-access-token': accountToken
          }
        })
        .then((res) => {
          let ret = res.status === 200 ? res.data : undefined;
          if (ret) {
            setWallets(ret.wallets);
          }
        })
        .catch((err) => {
          console.log('Error on getting team wallets!', err);
        })
        .then(function () {
          // always executed
        });
    }
    if (isAdmin) getTeamWallets();
  }, [isAdmin]);

  const onChangeTeamWallet = async (account) => {
    setLoading(true);
    try {
      let res;

      const accountAdmin = accountProfile.account;
      const accountToken = accountProfile.token;

      let action = 'add';

      if (wallets.includes(account)) {
        action = 'remove';
      }

      const body = { md5: token.md5, account, action };

      res = await axios.post(`${BASE_URL}/admin/update_team_wallets`, body, {
        headers: {
          'x-access-account': accountAdmin,
          'x-access-token': accountToken
        }
      });

      if (res.status === 200) {
        const ret = res.data;
        if (ret.status) {
          setWallets(ret.wallets);
          openSnackbar('Successful!', 'success');
        } else {
          const err = ret.err;
          openSnackbar(err, 'error');
        }
      }
    } catch (err) {
      console.log(err);
    }
    setLoading(false);
  };

  const onChangeFrozen = (e) => {
    setFrozen(!frozen);
  };
  const createSortHandler = (id) => (event) => {
    const isDesc = orderBy === id && order === 'desc';
    setOrder(isDesc ? 'asc' : 'desc');
    setOrderBy(id);
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

  const vars = {};
  const [hoveredHeader, setHoveredHeader] = useState(null);
  return (
    <>
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
              <TableCell
                align="left"
                sx={{
                  position: 'sticky',
                  left: 0,
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

              <TableCell align="left">Address</TableCell>

              <TableCell align="left">
                {/*<Tooltip title="Indicates whether the account's tokens are frozen." placement="top">*/}
                {(() => {
                  vars.cellId = 'frozen';
                })()}
                <TableSortLabel
                  hideSortIcon
                  active={orderBy === vars.cellId}
                  direction={orderBy === vars.cellId ? order : 'desc'}
                  onClick={onChangeFrozen}
                >
                  <InfoIcon fontSize="smaller" />
                  Frozen ({frozen ? 'YES' : 'ALL'})
                  {orderBy === vars.cellId ? (
                    <Box sx={{ ...visuallyHidden }}>
                      {order === 'desc'
                        ? 'sorted descending'
                        : 'sorted ascending'}
                    </Box>
                  ) : null}
                </TableSortLabel>
                {/*</Tooltip>                           */}
              </TableCell>

              <TableCell align="left">
                {/*<Tooltip title="Total account token balance."  placement="top">*/}
                {(() => {
                  vars.cellId = 'balance';
                })()}
                <TableSortLabel
                  hideSortIcon
                  active={orderBy === vars.cellId}
                  direction={orderBy === vars.cellId ? order : 'desc'}
                  onClick={true ? createSortHandler(vars.cellId) : undefined}
                >
                  <InfoIcon fontSize="smaller" />
                  Balance({name})
                  {orderBy === vars.cellId ? (
                    <Box sx={{ ...visuallyHidden }}>
                      {order === 'desc'
                        ? 'sorted descending'
                        : 'sorted ascending'}
                    </Box>
                  ) : null}
                </TableSortLabel>
                {/*</Tooltip>                           */}
              </TableCell>

              <TableCell align="left">
                {/*<Tooltip title="Balance change within 24 hours." placement="top">*/}
                {(() => {
                  vars.cellId = 'balance24h';
                })()}
                <TableSortLabel
                  hideSortIcon
                  active={orderBy === vars.cellId}
                  direction={orderBy === vars.cellId ? order : 'desc'}
                  onClick={true ? createSortHandler(vars.cellId) : undefined}
                >
                  <InfoIcon fontSize="smaller" />
                  Change<span style={badge24hStyle}>24h</span>
                  {orderBy === vars.cellId ? (
                    <Box sx={{ ...visuallyHidden }}>
                      {order === 'desc'
                        ? 'sorted descending'
                        : 'sorted ascending'}
                    </Box>
                  ) : null}
                </TableSortLabel>
                {/*</Tooltip>*/}
              </TableCell>

              <TableCell align="left">
                {/*<Tooltip title="Percent of total token holdings." placement="top">*/}
                {(() => {
                  vars.cellId = 'holding';
                })()}
                <TableSortLabel
                  hideSortIcon
                  active={orderBy === vars.cellId}
                  direction={orderBy === vars.cellId ? order : 'desc'}
                  onClick={true ? createSortHandler(vars.cellId) : undefined}
                >
                  <InfoIcon fontSize="smaller" />
                  Holding
                  {orderBy === vars.cellId ? (
                    <Box sx={{ ...visuallyHidden }}>
                      {order === 'desc'
                        ? 'sorted descending'
                        : 'sorted ascending'}
                    </Box>
                  ) : null}
                </TableSortLabel>
                {/*</Tooltip>*/}
              </TableCell>

              <TableCell align="left">Value</TableCell>
              {isAdmin && <TableCell align="left">Team Wallet</TableCell>}
              <TableCell align="left"></TableCell>
            </TableRow>
          </TableHead>

          <TableBody>
            {
              // exchs.slice(page * rows, page * rows + rows)
              richList.map((row) => {
                const { id, account, freeze, balance, holding } = row;

                var balance24h = false;
                if (row.balance24h) {
                  var change = balance - row.balance24h;
                  var percentChange = Math.abs(
                    (change / row.balance24h) * 100
                  ).toFixed(2);
                  var color24h, icon24h;
                  if (change >= 0) {
                    color24h = '#54D62C';
                    icon24h = caretUp;
                  } else {
                    color24h = '#FF6C40';
                    icon24h = caretDown;
                  }
                  balance24h = true;
                }

                return (
                  <TableRow
                    key={id}
                    // sx={{
                    //     [`& .${tableCellClasses.root}`]: {
                    //         color: (/*buy*/dir === 'sell' ? '#007B55' : '#B72136')
                    //     }
                    // }}
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
                        //zIndex: 1001,
                        left: 0,
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
                      <Typography variant="subtitle1">{id}</Typography>
                    </TableCell>
                    <TableCell align="left">
                      <Link
                        underline="none"
                        color="inherit"
                        target="_blank"
                        href={`https://bithomp.com/explorer/${account}`}
                        rel="noreferrer noopener nofollow"
                      >
                        <Typography variant="subtitle1" color="primary">
                          {truncate(account, 20)}
                        </Typography>
                      </Link>
                    </TableCell>
                    <TableCell align="left">
                      {freeze && <Icon icon={checkIcon} />}
                    </TableCell>
                    <TableCell align="left">
                      <Typography variant="subtitle1">
                        {fNumber(balance)}
                      </Typography>
                    </TableCell>
                    <TableCell align="left">
                      {balance24h && (
                        <Stack
                          direction="row"
                          spacing={0.1}
                          alignItems="center"
                        >
                          <Icon icon={icon24h} color={color24h} />
                          <Typography
                            sx={{ color: color24h }}
                            variant="subtitle1"
                          >
                            <NumberTooltip number={Math.abs(change)} /> (
                            <NumberTooltip append="%" number={percentChange} />)
                          </Typography>
                        </Stack>
                      )}
                    </TableCell>
                    <TableCell align="left">
                      <Typography variant="subtitle1">{holding} %</Typography>
                    </TableCell>
                    <TableCell align="left">
                      <Stack>
                        <Typography variant="h4" noWrap>
                          {currencySymbols[activeFiatCurrency]}{' '}
                          {fNumber(
                            (exch * balance) / metrics[activeFiatCurrency]
                          )}
                        </Typography>
                      </Stack>
                    </TableCell>

                    {isAdmin && (
                      <TableCell align="left">
                        <Checkbox
                          checked={wallets.includes(account)}
                          // onChange={onChangeTeamWallet(account)}
                          onClick={() => {
                            onChangeTeamWallet(account);
                          }}
                          inputProps={{ 'aria-label': 'controlled' }}
                        />
                      </TableCell>
                    )}

                    <TableCell align="left">
                      <Stack direction="row" alignItems="center" spacing={2}>
                        <Link
                          underline="none"
                          color="inherit"
                          target="_blank"
                          href={`https://bithomp.com/explorer/${account}`}
                          rel="noreferrer noopener nofollow"
                        >
                          <IconButton edge="end" aria-label="bithomp">
                            <Avatar
                              alt="livenet.xrpl.org Explorer"
                              src="/static/bithomp.ico"
                              sx={{ width: 20, height: 20 }}
                            />
                          </IconButton>
                        </Link>

                        <Link
                          underline="none"
                          color="inherit"
                          target="_blank"
                          href={`https://livenet.xrpl.org/accounts/${account}`}
                          rel="noreferrer noopener nofollow"
                        >
                          <IconButton edge="end" aria-label="livenetxrplorg">
                            <Avatar
                              alt="livenet.xrpl.org Explorer"
                              src="/static/livenetxrplorg.ico"
                              sx={{ width: 20, height: 20 }}
                            />
                          </IconButton>
                        </Link>
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })
            }
          </TableBody>
        </Table>
      </Box>

      <RichListToolbar
        count={count}
        rows={rows}
        setRows={setRows}
        page={page}
        setPage={setPage}
      />
    </>
  );
}
