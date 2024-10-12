import axios from 'axios';
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import useWebSocket from 'react-use-websocket';
import {
  Box,
  Table,
  TableBody,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { makeStyles } from '@mui/styles';
import { useContext } from 'react';
import { AppContext } from 'src/AppContext';
import { useDispatch, useSelector } from 'react-redux';
import {
  update_metrics,
  update_filteredCount,
  selectMetrics
} from 'src/redux/statusSlice';
import TokenListHead from './TokenListHead';
import TokenListToolbar from './TokenListToolbar';
import SearchToolbar from './SearchToolbar';
import { TokenRow } from './TokenRow';
import EditTokenDialog from 'src/components/EditTokenDialog';
import TrustSetDialog from 'src/components/TrustSetDialog';
import React, { memo } from 'react';
import { debounce } from 'lodash';
import { throttle } from 'lodash';

const useStyles = makeStyles({
  tableContainer: {
    display: 'flex',
    gap: 1,
    py: 1,
    overflow: 'auto',
    width: '100%',
    '& > *': {
      scrollSnapAlign: 'center'
    },
    '::-webkit-scrollbar': { display: 'none' }
  },
  tableCell: {
    borderBottom: 'none',
    padding: (props) => (props.isMobile ? '4px' : '16px')
  }
});

const MemoizedTokenRow = memo(TokenRow);

export default function TokenList({
  showWatchList,
  tag,
  tagName,
  tags,
  tokens,
  setTokens,
  tMap
}) {
  const { accountProfile, openSnackbar, setLoading, darkMode, activeFiatCurrency } = useContext(AppContext);
  const theme = useTheme();
  const dispatch = useDispatch();
  const metrics = useSelector(selectMetrics);
  const exchRate = metrics[activeFiatCurrency];
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const classes = useStyles({ isMobile });

  const WSS_FEED_URL = 'wss://api.xrpl.to/ws/sync';
  const BASE_URL = process.env.API_URL;

  const [filterName, setFilterName] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(0);
  const [order, setOrder] = useState('desc');
  const [orderBy, setOrderBy] = useState('vol24hxrp');
  const [sync, setSync] = useState(showWatchList ? 1 : 0);
  const [editToken, setEditToken] = useState(null);
  const [trustToken, setTrustToken] = useState(null);
  const [rows, setRows] = useState(100);
  const [showNew, setShowNew] = useState(false);
  const [showSlug, setShowSlug] = useState(false);
  const [showDate, setShowDate] = useState(false);
  const [viewType, setViewType] = useState("row");

  const tableContainerRef = useRef(null);
  const tableRef = useRef(null);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [scrollTopLength, setScrollTopLength] = useState(0);

  const handleScrollX = useCallback(throttle(() => {
    if (tableContainerRef.current) {
      setScrollLeft(tableContainerRef.current.scrollLeft > 0);
    }
  }, 100), []);

  const handleScrollY = useCallback(throttle(() => {
    if (tableRef.current) {
      const tableOffsetTop = tableRef.current.offsetTop;
      const tableHeight = tableRef.current.clientHeight;
      const scrollTop = window.scrollY;
      const anchorTop = tableOffsetTop;
      const anchorBottom = tableOffsetTop + tableHeight;

      if (scrollTop > anchorTop && scrollTop < anchorBottom) {
        setScrollTopLength(scrollTop - anchorTop);
      } else if (scrollTopLength !== 0) {
        setScrollTopLength(0);
      }
    }
  }, 100), [scrollTopLength]);

  useEffect(() => {
    const tableContainer = tableContainerRef.current;
    if (tableContainer) {
      tableContainer.addEventListener('scroll', handleScrollX);
    }
    window.addEventListener('scroll', handleScrollY);

    return () => {
      if (tableContainer) {
        tableContainer.removeEventListener('scroll', handleScrollX);
      }
      window.removeEventListener('scroll', handleScrollY);
    };
  }, [handleScrollX, handleScrollY]);

  const [watchList, setWatchList] = useState([]);

  const [lastJsonMessage, setLastJsonMessage] = useState(null);

  const { sendJsonMessage } = useWebSocket(WSS_FEED_URL, {
    shouldReconnect: () => true,
    onMessage: (event) => {
      try {
        const json = JSON.parse(event.data);
        setLastJsonMessage(json);
      } catch (err) {
        console.error('Error parsing WebSocket message:', err);
      }
    }
  });

  useEffect(() => {
    if (lastJsonMessage) {
      dispatch(update_metrics(lastJsonMessage));
      if (lastJsonMessage.tokens && lastJsonMessage.tokens.length > 0) {
        applyTokenChanges(lastJsonMessage.tokens);
      }
    }
  }, [lastJsonMessage, dispatch, applyTokenChanges]);

  const tokenMap = useMemo(() => new Map(tokens.map(token => [token.md5, token])), [tokens]);

  const applyTokenChanges = useCallback((newTokens) => {
    let hasChanges = false;
    newTokens.forEach(newToken => {
      const existingToken = tokenMap.get(newToken.md5);
      if (existingToken) {
        const updatedToken = {
          ...existingToken,
          ...newToken,
          time: Date.now(),
          bearbull: existingToken.exch > newToken.exch ? -1 : 1
        };
        
        if (JSON.stringify(existingToken) !== JSON.stringify(updatedToken)) {
          tokenMap.set(newToken.md5, updatedToken);
          hasChanges = true;
        }
      }
    });

    if (hasChanges) {
      setTokens(Array.from(tokenMap.values()));
    }
  }, [tokenMap]);

  const debouncedLoadTokens = useCallback(
    debounce(() => {
      const start = page * rows + 1;
      const ntag = tag || '';
      const watchAccount = showWatchList ? accountProfile?.account || '' : '';

      axios
        .get(`${BASE_URL}/tokens?tag=${ntag}&watchlist=${watchAccount}&start=${start}&limit=${rows}&sortBy=${orderBy}&sortType=${order}&filter=${filterName}&showNew=${showNew}&showSlug=${showSlug}&showDate=${showDate}`)
        .then((res) => {
          if (res.status === 200 && res.data) {
            const ret = res.data;
            dispatch(update_metrics(ret));
            dispatch(update_filteredCount(ret));
            setTokens(ret.tokens);
          }
        })
        .catch((err) => console.log('err->>', err))
        .finally(() => setSearch(filterName));
    }, 300),
    [accountProfile, filterName, order, orderBy, page, rows, showDate, showNew, showSlug, showWatchList, tag, dispatch, setTokens]
  );

  useEffect(() => {
    if (sync > 0) debouncedLoadTokens();
  }, [debouncedLoadTokens, sync]);

  useEffect(() => {
    const getWatchList = () => {
      const account = accountProfile?.account;
      if (!account) {
        setWatchList([]);
        return;
      }

      axios
        .get(`${BASE_URL}/watchlist/get_list?account=${account}`)
        .then((res) => {
          if (res.status === 200) {
            setWatchList(res.data.watchlist);
          }
        })
        .catch((err) => console.log('Error on getting watchlist!', err));
    };
    getWatchList();
  }, [accountProfile, sync]);

  const onChangeWatchList = useCallback(async (md5) => {
    const account = accountProfile?.account;
    const accountToken = accountProfile?.token;

    if (!account || !accountToken) {
      openSnackbar('Please login!', 'error');
      return;
    }

    // Optimistically update the local state
    const newWatchList = watchList.includes(md5)
      ? watchList.filter(item => item !== md5)
      : [...watchList, md5];
    setWatchList(newWatchList);

    // If in watchlist view, update the tokens list immediately
    if (showWatchList) {
      setTokens(prevTokens => prevTokens.filter(token => newWatchList.includes(token.md5)));
    }

    try {
      const action = watchList.includes(md5) ? 'remove' : 'add';
      const body = { md5, account, action };

      const res = await axios.post(`${BASE_URL}/watchlist/update_watchlist`, body, {
        headers: { 'x-access-token': accountToken }
      });

      if (res.status === 200) {
        const ret = res.data;
        if (ret.status) {
          // Server confirmed the change, no need to update state again
          openSnackbar('Watchlist updated successfully!', 'success');
        } else {
          // Revert the local change if server update failed
          setWatchList(watchList);
          if (showWatchList) {
            setSync(prev => prev + 1); // Trigger a re-fetch of tokens
          }
          openSnackbar(ret.err || 'Failed to update watchlist', 'error');
        }
      }
    } catch (err) {
      console.error(err);
      // Revert the local change if request failed
      setWatchList(watchList);
      if (showWatchList) {
        setSync(prev => prev + 1); // Trigger a re-fetch of tokens
      }
      openSnackbar('Failed to update watchlist', 'error');
    }
  }, [accountProfile, watchList, showWatchList, setTokens, openSnackbar, setSync]);

  const handleRequestSort = (event, id) => {
    const isDesc = orderBy === id && order === 'desc';
    setOrder(isDesc ? 'asc' : 'desc');
    setOrderBy(id);
    setPage(0);
    setSync(sync + 1);
  };

  const updatePage = (newPage) => {
    if (newPage !== page) {
      setPage(newPage);
      setSync(sync + 1);
    }
  };

  const updateRows = (newRows) => {
    if (newRows !== rows) {
      setRows(newRows);
      if (tokens.length < newRows) setSync(sync + 1);
    }
  };

  const updateShowNew = (val) => {
    setShowNew(val);
    setPage(0);
    setSync(sync + 1);
  };

  const updateShowSlug = (val) => {
    setShowSlug(val);
    setPage(0);
    setSync(sync + 1);
  };

  const updateShowDate = (val) => {
    setShowDate(val);
    setPage(0);
    setSync(sync + 1);
  };

  const handleFilterByName = (event) => {
    setFilterName(event.target.value);
    setPage(0);
    setSync(sync + 1);
  };

  const visibleTokens = useMemo(() => {
    return tokens.slice(0, rows);
  }, [tokens, rows]);

  return (
    <>
      {editToken && (
        <EditTokenDialog token={editToken} setToken={setEditToken} />
      )}

      {trustToken && (
        <TrustSetDialog token={trustToken} setToken={setTrustToken} />
      )}

      <SearchToolbar
        tags={tags}
        tagName={tagName}
        filterName={filterName}
        onFilterName={handleFilterByName}
        rows={rows}
        setRows={updateRows}
        showNew={showNew}
        setShowNew={updateShowNew}
        showSlug={showSlug}
        setShowSlug={updateShowSlug}
        showDate={showDate}
        setShowDate={updateShowDate}
        viewType={viewType}
        setViewType={setViewType}
      />
      
      <Box className={classes.tableContainer} ref={tableContainerRef}>
        <Table ref={tableRef}>
          <TokenListHead
            order={order}
            orderBy={orderBy}
            onRequestSort={handleRequestSort}
            scrollLeft={scrollLeft}
            tokens={tokens}
            scrollTopLength={scrollTopLength}
          />
          <TableBody>
            {visibleTokens.map((row, idx) => (
              <MemoizedTokenRow
                key={row.md5}
                time={row.time}
                idx={idx + page * rows}
                token={row}
                setEditToken={setEditToken}
                setTrustToken={setTrustToken}
                watchList={watchList}
                onChangeWatchList={onChangeWatchList}
                scrollLeft={scrollLeft}
                activeFiatCurrency={activeFiatCurrency}
                exchRate={exchRate}
              />
            ))}
          </TableBody>
        </Table>
      </Box>
      <TokenListToolbar
        rows={rows}
        setRows={updateRows}
        page={page}
        setPage={updatePage}
      />
    </>
  );
}