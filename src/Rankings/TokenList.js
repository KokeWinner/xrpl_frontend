// Material
import {
  useTheme,
  styled,
  Link,
  CardHeader,
  Stack,
  Typography,
  Table,
  TableRow,
  TableBody,
  TableCell,
  Box
} from '@mui/material';
import { tableCellClasses } from '@mui/material/TableCell';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import StackStyle from 'src/components/StackStyle';

// Context
import { useContext } from 'react';
import { AppContext } from 'src/AppContext';

import { useState, useEffect } from 'react';
import axios from 'axios';

import {
  LazyLoadImage,
  LazyLoadComponent
} from 'react-lazy-load-image-component';
const TokenImage = styled(LazyLoadImage)(({ theme }) => ({
  borderRadius: '50%',
  overflow: 'hidden'
}));

// Redux
import { useSelector } from 'react-redux';
import { selectMetrics } from 'src/redux/statusSlice';

// Components
import TokenListHead from 'src/TokenDetail/analysis/TokenListHead';
import { TokenRow } from 'src/TokenDetail/analysis/TokenRow';
import RecentTokenListHead from './RecentTokenListHead';
import { RecentTokenRow } from './RecentTokenRow';

import { useRef } from 'react';

export default function TokenList({ sortBy }) {
  const metrics = useSelector(selectMetrics);
  const BASE_URL = process.env.API_URL; //'http://65.108.4.235:3000/api';//process.env.API_URL;

  const { accountProfile, darkMode, activeFiatCurrency } =
    useContext(AppContext);
  const isAdmin =
    accountProfile && accountProfile.account && accountProfile.admin;

  const theme = useTheme();

  const [count, setCount] = useState(0);
  const [tokens, setTokens] = useState([]);

  const [editToken, setEditToken] = useState(null);
  const [trustToken, setTrustToken] = useState(null);

  var TokenListHeadComponent = TokenListHead;
  var TokenRowComponent = TokenRow;
  var showNew = false;
  if (sortBy == 'dateon') {
    TokenListHeadComponent = RecentTokenListHead;
    TokenRowComponent = RecentTokenRow;
    showNew = true;
  }

  useEffect(() => {
    function getTokens() {
      axios
        .get(
          `${BASE_URL}/tokens?start=0&limit=30&sortBy=${sortBy}&sortType=desc&filter=&tags=&showNew=${showNew}&showSlug=false`
        )
        .then((res) => {
          let ret = res.status === 200 ? res.data : undefined;
          if (ret) {
            setCount(ret.count);
            setTokens(ret.tokens);
          }
        })
        .catch((err) => {
          console.log('Error on getting TrendingTokens!', err);
        })
        .then(function () {
          // always executed
        });
    }
    getTokens();
  }, []);

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
          sx={{
            '& .MuiTableCell-root': {
              borderBottom: 'none',
              boxShadow: darkMode
                ? 'inset 0 -1px 0 rgba(68 67 67), inset 0 -1px 0 rgba(255, 255, 255, 0.1)'
                : 'inset 0 -1px 0 #dadee3'
            }
          }}
        >
          {count > 0 && (
            <TokenListHeadComponent scrollLeft={scrollLeft} tokens={tokens} />
          )}
          <TableBody
            sx={{
              '& .MuiTableCell-root:nth-of-type(1)': {
                position: "sticky",
                zIndex: 1001,
                left: 0,
                // background: darkMode ? "#17171A" : '#FFFFFF'
              },
              '& .MuiTableCell-root:nth-of-type(2)': {
                position: "sticky",
                zIndex: 1002,
                left: tokens.length > 0 ? 55 : 40,
                // background: darkMode ? "#17171A" : '#FFFFFF',
                '&:before': (scrollLeft ? {
                  content: "''",
                  boxShadow: "inset 10px 0 8px -8px #00000026",
                  position: "absolute",
                  top: "0",
                  right: "0",
                  bottom: "-1px",
                  width: "30px",
                  transform: "translate(100%)",
                  transition: "box-shadow .3s",
                  pointerEvents: "none",
                } : {})
              },
            }}
          >
            {tokens.map((row, idx) => {
              return (
                <TokenRowComponent
                  key={idx}
                  time={row.time}
                  token={row}
                  admin={isAdmin}
                  setEditToken={setEditToken}
                  setTrustToken={setTrustToken}
                  scrollLeft={scrollLeft}
                  activeFiatCurrency={activeFiatCurrency}
                  exchRate={metrics[activeFiatCurrency]}
                />
              );
            })}
          </TableBody>
        </Table>
      </Box>
    </>
  );
}