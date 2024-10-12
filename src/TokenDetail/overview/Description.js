import React from 'react';
import Decimal from 'decimal.js';
import { useState, useEffect, useContext } from 'react';
import dynamic from 'next/dynamic';
import ReactMarkdown from 'react-markdown';

// Material
import {
  styled,
  IconButton,
  Link,
  Stack,
  Tooltip,
  Typography
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CloseIcon from '@mui/icons-material/Close';

// Context
import { AppContext } from 'src/AppContext';

// Redux
import { useSelector } from 'react-redux';
import { selectMetrics } from 'src/redux/statusSlice';

// Utils
import { fPercent, fNumber, fNumberWithCurreny } from 'src/utils/formatNumber';

// Components
import Converter from './Converter';
import NumberTooltip from 'src/components/NumberTooltip';
import { currencySymbols } from 'src/utils/constants';

const ReadMore = ({ children }) => {
  const [showFullContent, setShowFullContent] = useState(false);
  const { darkMode } = useContext(AppContext);

  const toggleReadMore = () => {
    setShowFullContent(!showFullContent);
  };

  const ContentClosed = styled('div')(
    ({ theme }) => `
        -webkit-box-flex: 1;
        flex-grow: 1;
        height: 30em;
        overflow: hidden;
        text-overflow: ellipsis;
        position: relative;
    
        &::after {
            content: "";
            position: absolute;
            left: 0px;
            bottom: 0px;
            width: 100%;
            height: 8em;
            background: linear-gradient(180deg, rgba(255,255,255,0), ${theme.palette.background.default});
            z-index: 1000;
        }
    `
  );

  const ContentOpened = styled('div')(
    ({ theme }) => `
        height: unset;
        overflow: unset;
        text-overflow: unset;
        min-height: 20em;
    `
  );

  return (
    <Stack>
      {showFullContent ? (
        <ContentOpened>{children}</ContentOpened>
      ) : (
        <ContentClosed>{children}</ContentClosed>
      )}

      <Stack direction="row">
        <Link
          component="button"
          underline="none"
          variant="body2"
          color={darkMode ? '#22B14C' : '#3366FF'}
          onClick={toggleReadMore}
        >
          <Typography variant="s6" sx={{ pt: 3, pb: 3 }}>
            {showFullContent ? 'Read Less' : 'Read More'}
          </Typography>
        </Link>
      </Stack>
    </Stack>
  );
};

export default function Description({
  token,
  showEditor,
  setShowEditor,
  description,
  onApplyDescription
}) {
  const { accountProfile, darkMode, activeFiatCurrency } = useContext(AppContext);
  const isAdmin = accountProfile && accountProfile.account && accountProfile.admin;

  const metrics = useSelector(selectMetrics);
  const { id, name, amount, maxMin24h, pro24h, pro7d, p24h, supply, issuer, vol24h, vol24hx, vol24hxrp, slug, marketcap, exch, dom } = token;

  let user = token.user;
  if (!user) user = name;

  const price = fNumberWithCurreny(exch || 0, metrics[activeFiatCurrency]);
  const convertedMarketCap = Decimal.div(marketcap, metrics[activeFiatCurrency]).toNumber(); // .toFixed(5, Decimal.ROUND_DOWN)

  const vpro24h = fPercent(pro24h);
  const vpro7d = fPercent(pro7d);

  let strPro24h = 0;
  if (vpro24h < 0) {
    strPro24h = -vpro24h;
    strPro24h = 'down ' + strPro24h + '%';
  } else {
    strPro24h = 'up ' + vpro24h + '%';
  }

  const handleClickEdit = () => {
    if (showEditor) {
      onApplyDescription();
    }
    setShowEditor(!showEditor);
  };

  const structuredData = {
    "@context": "https://schema.org/",
    "@type": "Cryptocurrency",
    "name": `${user} ${name}`,
    "description": description,
    "tickerSymbol": name,
    "currentExchangeRate": {
      "@type": "MonetaryAmount",
      "currency": activeFiatCurrency,
      "value": price
    },
    "marketCap": {
      "@type": "MonetaryAmount",
      "currency": activeFiatCurrency,
      "value": convertedMarketCap
    },
    "supply": fNumber(supply, true),
    "priceChangePercentage24h": strPro24h,
    "priceChangePercentage7d": vpro7d,
    "fiatChange24h": p24h,
    "maxPrice24h": maxMin24h.max,
    "minPrice24h": maxMin24h.min,
    "tradingVolume24h": {
      "@type": "MonetaryAmount",
      "currency": "XRP",
      "value": fNumber(vol24hxrp, true)
    },
    "marketDominance": dom
  };

  return (
    <Stack>
      <script type="application/ld+json">
        {JSON.stringify(structuredData)}
      </script>
      
      {issuer !== 'XRPL' && <Converter token={token} />}

      <Typography
        variant="h2"
        fontSize="1.1rem"
        sx={{ mt: 4 }}
      >{`${name} Price Live Data`}</Typography>

      <Typography sx={{ mt: 3 }}>
        Today's live {user} price is{' '}
        <NumberTooltip
          prepend={currencySymbols[activeFiatCurrency]}
          number={price}
        />{' '}
        {activeFiatCurrency}, accompanied by a 24-hour trading volume of{' '}
        {fNumber(vol24hx)} {name}. Our {name} to {activeFiatCurrency} price is
        updated in real-time. In the last 24 hours, {user} has experienced a{' '}
        {strPro24h} change. XRPL.to currently ranks it at #{id}, with a live
        market cap of {currencySymbols[activeFiatCurrency]}
        {fNumber(convertedMarketCap)} {activeFiatCurrency} and a circulating
        supply of {fNumber(supply)} {name} tokens.
      </Typography>

      <Typography sx={{ mt: 2, mb: 3 }}>
        If you're interested in purchasing {user}, the top XRPL DEX platform for
        trading {user} tokens is currently:
        <Link
          color={darkMode ? '#22B14C' : '#3366FF'}
          underline="none"
          href={`/token/${slug}/trade`}
        >
          {' xrpl.to DEX'}
        </Link>{' '}
        {/*and
                <Link color={ darkMode ? '#22B14C': '#3366FF' } underline="none"
                    href={`https://sologenic.org/trade?network=mainnet&market=${currency}%2B${issuer}%2FXRP`}
                >{' Sologenic DEX'}</Link>.
        */}
      </Typography>

      {isAdmin && (
        <Stack direction="row" sx={{ mt: 0, mb: 0 }}>
          <Tooltip
            title={showEditor ? 'Apply changes' : 'Click to edit description'}
          >
            <IconButton
              onClick={handleClickEdit}
              edge="end"
              aria-label="edit"
              size="small"
            >
              {showEditor ? <CloseIcon color="error" /> : <EditIcon />}
            </IconButton>
          </Tooltip>
        </Stack>
      )}

      {!showEditor && description && (
        <ReadMore>
          <ReactMarkdown
            className={darkMode ? 'reactMarkDowndark' : 'reactMarkDownlight'}
          >
            {description}
          </ReactMarkdown>
        </ReadMore>
      )}
    </Stack>
  );
}