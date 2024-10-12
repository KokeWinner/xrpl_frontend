import Decimal from 'decimal.js';
import { useTheme } from '@mui/material/styles';
import { useState, useEffect } from 'react';
import React from 'react';
import {
  LazyLoadImage,
  LazyLoadComponent
} from 'react-lazy-load-image-component';

// Material
import { withStyles } from '@mui/styles';
import {
  styled,
  Link,
  Stack,
  TableCell,
  useMediaQuery,
  TableRow,
  Typography
} from '@mui/material';

// Iconify
import { Icon } from '@iconify/react';
import arrowsExchange from '@iconify/icons-gg/arrows-exchange';


// Context
import { useContext } from 'react';
import { AppContext } from 'src/AppContext';

// Components
import TokenMoreMenu from './TokenMoreMenu';
import BearBullLabel from 'src/components/BearBullLabel';

// Utils
import { fNumber, fNumberWithCurreny } from 'src/utils/formatNumber';
import { currencySymbols } from 'src/utils/constants';
import LoadChart from 'src/components/LoadChart';

// This style will ensure the sticky cell content does not overflow its container
const StyledTableRow = withStyles((theme) => ({
  root: {
    // Added overflow hidden here to prevent x-axis overflow on scroll
    overflow: 'hidden',
  },
}))(TableRow);

const StickyTableCell = withStyles((theme) => ({
  head: {
    position: 'sticky',
    zIndex: 100,
    top: 0,
    left: 0, // Changed from 24 to 0
  },
  body: {
    position: 'sticky',
    zIndex: 100,
    left: 0, // Changed from 24 to 0
  }
}))(TableCell);

const TransitionTypo = styled(Typography)(
  () => `
        -webkit-transition: background-color 300ms linear, color 1s linear;
        -moz-transition: background-color 300ms linear, color 1s linear;
        -o-transition: background-color 300ms linear, color 1s linear;
        -ms-transition: background-color 300ms linear, color 1s linear;
        transition: background-color 300ms linear, color 1s linear;
    `
);

const AdminImage = styled(LazyLoadImage)(({ theme }) => ({
  borderRadius: '50%',
  overflow: 'hidden',
  '&:hover': {
    cursor: 'pointer',
    opacity: 0.6
  }
}));

const TokenImage = styled(LazyLoadImage)(({ theme }) => ({
  borderRadius: '50%',
  overflow: 'hidden'
}));

function truncate(str, n) {
  if (!str) return '';
  //return (str.length > n) ? str.substr(0, n-1) + '&hellip;' : str;
  return str.length > n ? str.substr(0, n - 1) + '... ' : str;
}

function getPriceColor(token, theme) {
  const bearbull = token.bearbull;
  let color = '';

  if (bearbull === -1) {
    color = theme.palette.error.main;
  } else if (bearbull === 1) {
    color = theme.palette.success.main;
  }

  return color;
}

export const TokenRow = React.memo(FTokenRow);

function FTokenRow({
  time,
  token,
  admin,
  setEditToken,
  setTrustToken,
  scrollLeft,
  activeFiatCurrency,
  exchRate
}) {
  const BASE_URL = process.env.API_URL;
  const { accountProfile, darkMode } = useContext(AppContext);
  const isAdmin =
    accountProfile && accountProfile.account && accountProfile.admin;

  const [priceColor, setPriceColor] = useState('');
  const {
    id,
    name,
    date,
    amount,
    supply,
    trustlines,
    vol24hxrp,
    vol24hx,
    vol24htx,
    kyc,
    md5,
    slug,
    user,
    pro7d,
    pro24h,
    exch,
    ext,
    marketcap,
    isOMCF
  } = token;

  useEffect(() => {
    setPriceColor(getPriceColor(token));
    setTimeout(() => {
      setPriceColor('');
    }, 3000);
  }, [time]);

  const imgUrl = `https://s1.xrpl.to/token/${md5}`;
  const convertedMarketCap = Decimal.div(marketcap, exchRate).toNumber();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <StyledTableRow
      key={id}
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
      <StickyTableCell
        align="left"
        style={{
          position: 'sticky',
          overflow: 'hidden',
         
          left: 0,
          background: darkMode ? '#000000' : '#FFFFFF'
        }}
      >
        {id}
      </StickyTableCell>
      <LazyLoadComponent visibleByDefault={true}>
        <TableCell
          align="left"
          sx={{
            p: 0,
            position: 'sticky',
         
            left: 0, // Changed from 67 to 0
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
          <Stack direction="row" alignItems="center" spacing={2} sx={{ p: 0 }}>
            {admin ? (
              <AdminImage
                src={imgUrl}
                width={46}
                height={46}
                onClick={() => setEditToken(token)}
                onError={(event) => (event.target.src = '/static/alt.webp')}
                alt={`${user} ${name} Logo`}
              />
            ) : (
              <TokenImage 
                src={imgUrl}
                width={isMobile ? 26 : 46}
                height={isMobile ? 26 : 46}
                onError={(event) => (event.target.src = '/static/alt.webp')}
                alt={`${user} ${name} Logo`}
              />
            )}

            <Link
              underline="none"
              color="inherit"
              href={`/token/${slug}`}
              rel="noreferrer noopener nofollow"
            >
              <Stack>
                <Typography
                  variant="token"
                  color={
                    isOMCF !== 'yes' ? (darkMode ? '#fff' : '#222531') : (darkMode ? '#007B55' : slug === md5 ? '#B72136' : '') 
                  }
                  noWrap
                >
                  {truncate(name, 8)}
                </Typography>
                <Typography
                  variant="caption"
                  color={
                    isOMCF !== 'yes' ? (darkMode ? '#fff' : '#222531') : ''
                  }
                  noWrap
                >
                  {truncate(user, 13)}
                  {kyc && (
                    <Typography variant="kyc" sx={{ ml: 0.2 }}>
                      KYC
                    </Typography>
                  )}
                </Typography>
                <Typography
                  variant="small"
                  color={
                    isOMCF !== 'yes' ? (darkMode ? '#fff' : '#222531') : ''
                  }
                >
                  {date}
                </Typography>
              </Stack>
            </Link>
          </Stack>
        </TableCell>
        <TableCell
          align="right"
          sx={{
            color: priceColor
          }}
        >
          <TransitionTypo variant="h4" noWrap>
            {currencySymbols[activeFiatCurrency]} {fNumberWithCurreny(exch,exchRate)}
          </TransitionTypo>
          {/* <TransitionTypo variant="h6" noWrap>
          <Typography>✕</Typography> {fNumber(exch)}
          </TransitionTypo> */}
        </TableCell>
        <TableCell align="right">
          <BearBullLabel value={pro24h} variant="h4" />
        </TableCell>
        <TableCell align="right">
          <BearBullLabel value={pro7d} variant="h4" />
        </TableCell>
        <TableCell align="right">
          <Stack
            direction="row"
            spacing={0.5}
            justifyContent="flex-end"
            alignItems="center"
          >
            <Typography>{currencySymbols[activeFiatCurrency]}</Typography>
            <Typography variant="h4" noWrap>
              {fNumberWithCurreny(vol24hxrp, exchRate)}
            </Typography>
          </Stack>
          <Stack
            direction="row"
            spacing={0.5}
            justifyContent="flex-end"
            alignItems="center"
          >
            <Icon
              icon={arrowsExchange}
              color="#primary"
              width="16"
              height="16"
            />
            <Typography variant="h5" color="primary">
              {fNumber(vol24hx)}
            </Typography>
          </Stack>
        </TableCell>
        <TableCell align="right">{fNumber(vol24htx)}</TableCell>
        <TableCell align="right">{currencySymbols[activeFiatCurrency]}{fNumber(convertedMarketCap)}</TableCell>
        <TableCell align="right">{fNumber(trustlines)}</TableCell>
        <TableCell align="right">
          {fNumber(supply)}{' '}
          <Typography variant="small" noWrap>
            {name}
          </Typography>
        </TableCell>
        <TableCell align="right">
          <LoadChart
            url={`${BASE_URL}/sparkline/${md5}?pro7d=${pro7d}`}
          />
        </TableCell>
        <TableCell align="right">
          <TokenMoreMenu token={token} setTrustToken={setTrustToken} />
        </TableCell>
      </LazyLoadComponent>
    </StyledTableRow>
  );
}
