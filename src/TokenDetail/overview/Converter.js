import React from 'react';
import Decimal from 'decimal.js';
import { useState, useEffect } from 'react';

// Material
import {
  styled,
  useTheme,
  useMediaQuery,
  Avatar,
  Box,
  Card,
  CardHeader,
  IconButton,
  Input,
  Link,
  Stack,
  TextField,
  Tooltip,
  Typography
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';
import CurrencyExchangeIcon from '@mui/icons-material/CurrencyExchange';

// Iconify
import { Icon } from '@iconify/react';
import exchangeIcon from '@iconify/icons-uil/exchange';
import arrowExchangeIcon from '@iconify/icons-gg/arrows-exchange-v';

// Context
import { useContext } from 'react';
import { AppContext } from 'src/AppContext';

// Redux
import { useSelector /*, useDispatch*/ } from 'react-redux';
import { selectMetrics } from 'src/redux/statusSlice';

// Utils
import { fPercent, fNumber, fNumberWithCurreny } from 'src/utils/formatNumber';

const CurrencyContent = styled('div')(
  ({ theme }) => `
    box-sizing: border-box;
    margin: 0px;
    display: flex;
    flex: 1 1 0%;
    flex-direction: row;
    padding: 20px 24px;
    -webkit-box-align: center;
    align-items: center;
`
);

const InputContent = styled('div')(
  ({ theme }) => `
    box-sizing: border-box;
    margin: 0px;
    display: flex;
    flex: 1 1 0%;
    flex-direction: row;
    -webkit-box-align: center;
    align-items: center;
    -webkit-box-pack: end;
    justify-content: flex-end;
    color: rgb(255, 255, 255);
`
);

let border; // webxtor SEO fix
if (typeof theme !== 'undefined' && theme.currency) {
  border = theme.currency.border;
}
const ConverterFrame = styled('div')(
  ({ theme }) => `
    flex-direction: row;
    overflow: hidden;
    margin: 0px;
    box-sizing: border-box;
    position: relative;
    border-radius: 16px;
    display: flex;

    @media (max-width: 700px) {
        flex-direction: column;
        overflow: hidden;
        margin: auto 0px;
        border-right: none;
        border-left: none;
        border-image: initial;
        border-radius: unset;
        border-top: ${border}; /*$000{theme.currency.border};*/
        border-bottom: ${border}; /*$000{theme.currency.border};*/
    }

    border: ${border} /*$000{theme.currency.border};*/
`
);

const ToggleContent = styled('div')(
  ({ theme }) => `
    cursor: pointer;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
`
);

export default function Converter({ token }) {
  const theme = useTheme();
  const { accountProfile, activeFiatCurrency } = useContext(AppContext);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const metrics = useSelector(selectMetrics);

  const {
    id,
    name,
    pro24h,
    amount,
    supply,
    issuer,
    currency,
    vol24h,
    vol24hxrp,
    vol24hx,
    marketcap,
    date,
    md5,
    pro7d,
    trustlines,
    holders,
    offers,
    ext,
    exch
  } = token;

  let user = token.user;
  if (!user) user = name;

  // const imgUrl1 = `/static/tokens/${md5}.${ext}`;
  const imgUrl1 = `https://s1.xrpl.to/token/${md5}`;
  const imgUrl2 = `/static/xrp.webp`;

  const [revert, setRevert] = useState(false);
  const [amount1, setAmount1] = useState(1); // Token
  const [amount2, setAmount2] = useState(exch ? fNumber(exch) : 0); // XRP

  let color1, color2;
  if (typeof theme !== 'undefined' && theme.currency) {
    //webxtor SEO fix
    /*const */ color1 = revert
      ? theme.currency.background2
      : theme.currency.background1;
    /*const */ color2 = revert
      ? theme.currency.background1
      : theme.currency.background2;
  }
  const handleChangeAmount1 = (e) => {
    const amt = e.target.value;
    setAmount1(amt);

    const cexch = 0;
    if (amt) {
      cexch = Decimal.mul(amt, exch).toNumber();
    }
    setAmount2(fNumber(cexch));
  };

  const handleChangeAmount2 = (e) => {
    const amt = e.target.value;
    setAmount2(amt);

    const cexch = 0;
    if (amt && exch > 0) {
      cexch = Decimal.div(amt, exch).toNumber();
    }
    setAmount1(fNumber(cexch));
  };

  return (
    <Stack>
      <Typography
        variant="h3"
        fontSize="1.1rem"
        sx={{ mt: { xs: 4, md: 0 }, mb: 3 }}
      >
        {`${name} to XRP Converter`}
      </Typography>

      <ConverterFrame>
        <CurrencyContent
          style={{
            order: revert ? 2 : 1,
            backgroundColor: color1
          }}
        >
          <Avatar
            alt={`${user} ${name}`}
            src={imgUrl1}
            sx={{ mr: 1.3, width: 32, height: 32 }}
          />
          <Stack spacing={0}>
            <Typography variant="s7">{name}</Typography>
            <Typography variant="s8">{user}</Typography>
          </Stack>
          <InputContent>
            <Input
              autoComplete="new-password"
              disableUnderline
              value={amount1}
              placeholder=""
              onChange={handleChangeAmount1}
              sx={{
                width: '100%',
                input: {
                  autoComplete: 'off',
                  padding: '10px 0px',
                  border: 'none',
                  fontSize: '16px',
                  textAlign: 'end',
                  appearance: 'none',
                  fontWeight: 700
                }
              }}
            />
          </InputContent>
        </CurrencyContent>

        <CurrencyContent
          style={{
            order: revert ? 1 : 2,
            backgroundColor: color2
          }}
        >
          <Avatar
            alt="XRP"
            src={imgUrl2}
            sx={{ mr: 1.3, width: 32, height: 32 }}
          />
          <Stack spacing={0}>
            <Typography variant="s7">XRP</Typography>
            <Typography variant="s8">XRP</Typography>
          </Stack>
          <InputContent>
            <Input
              autoComplete="new-password"
              disableUnderline
              value={amount2}
              placeholder=""
              onChange={handleChangeAmount2}
              sx={{
                width: '100%',
                input: {
                  autoComplete: 'off',
                  padding: '10px 0px',
                  border: 'none',
                  fontSize: '16px',
                  textAlign: 'end',
                  appearance: 'none',
                  fontWeight: 700
                }
              }}
            />
          </InputContent>
        </CurrencyContent>

        <ToggleContent>
          <IconButton size="medium" onClick={() => setRevert(!revert)}>
            <Icon
              icon={isMobile ? arrowExchangeIcon : exchangeIcon}
              width="28"
              height="28"
              style={{
                padding: 6,
                borderRadius: '50%',
                color: '#17171AAA',
                background: '#ffffff'
              }}
            />
          </IconButton>
        </ToggleContent>
      </ConverterFrame>
    </Stack>
  );
}
