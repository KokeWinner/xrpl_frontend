import { useState, useEffect, useContext } from 'react';
import React from 'react';
import {
  LazyLoadImage,
  LazyLoadComponent
} from 'react-lazy-load-image-component';

// Material
import {
  styled,
  Link,
  Stack,
  useTheme,
  useMediaQuery,
  TableCell,
  TableRow,
  Typography
} from '@mui/material';

// Iconify
import { Icon } from '@iconify/react';
import arrowsExchange from '@iconify/icons-gg/arrows-exchange';

// Context
import { AppContext } from 'src/AppContext';

// Components
import TokenMoreMenu from 'src/TokenDetail/analysis/TokenMoreMenu';
import BearBullLabel from 'src/components/BearBullLabel';

// Utils
import { fNumber, fNumberWithCurreny } from 'src/utils/formatNumber';
import { currencySymbols } from 'src/utils/constants';

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

export const GainersLosersTokenRow = React.memo(fTokenRow);

function fTokenRow({
  time,
  token,
  admin,
  setEditToken,
  setTrustToken,
  scrollLeft,
  activeFiatCurrency,
  exchRate
}) {
  const { darkMode } = useContext(AppContext);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [priceColor, setPriceColor] = useState('');

  useEffect(() => {
    setPriceColor(getPriceColor(token, theme));
    setTimeout(() => {
      setPriceColor('');
    }, 3000);
  }, [time, token, theme]);

  const {
    id,
    name,
    date,
    vol24hxrp,
    vol24hx,
    kyc,
    md5,
    slug,
    user,
    pro24h,
    exch,
    isOMCF
  } = token;

  const imgUrl = `https://s1.xrpl.to/token/${md5}`;

  return (
    <TableRow
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
      <TableCell
        align="left"
        style={{
          position: 'sticky',
          left: 0,
          background: darkMode ? '#000000' : '#FFFFFF'
        }}
      >
        {id}
      </TableCell>
      <LazyLoadComponent visibleByDefault={true}>
        <TableCell
          align="left"
          sx={{
            p: 0,
            position: 'sticky',
            left: 67,
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
                width={isMobile ? 26 : 46}
                height={isMobile ? 26 : 46}
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
            {currencySymbols[activeFiatCurrency]} {fNumberWithCurreny(exch, exchRate)}
          </TransitionTypo>
        </TableCell>
        <TableCell align="right">
          <BearBullLabel value={pro24h} variant="h4" />
        </TableCell>
        <TableCell align="right">
          <Stack
            direction="row"
            spacing={0.5}
            justifyContent="flex-end"
            alignItems="center"
          >
            <Typography>✕</Typography>
            <Typography variant="h4" noWrap>
              {fNumber(vol24hxrp)}
            </Typography>
          </Stack>
          <Stack
            direction="row"
            spacing={0.5}
            justifyContent="flex-end"
            alignItems="center"
          >
      
            <Typography variant="h5" color="primary.dark">
              {fNumber(vol24hx)} {name}
            </Typography>
          </Stack>
        </TableCell>
        <TableCell align="right">
          <TokenMoreMenu token={token} setTrustToken={setTrustToken} />
        </TableCell>
      </LazyLoadComponent>
    </TableRow>
  );
}
