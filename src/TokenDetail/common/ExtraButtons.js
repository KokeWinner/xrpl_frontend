import { useEffect, useState } from 'react';
import axios from 'axios';

// Material
import {
  Avatar,
  Button,
  Chip,
  Grid,
  Link,
  Stack,
  Typography,
  useMediaQuery,
  useTheme
} from '@mui/material';

// Utils
import { fNumber } from 'src/utils/formatNumber';
import { CURRENCY_ISSUERS } from 'src/utils/constants';

// Components
import TrustSetDialog from 'src/components/TrustSetDialog';

// Step 1: Import the necessary dependencies
import { useContext } from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { AppContext } from 'src/AppContext';
import Decimal from 'decimal.js';

// ----------------------------------------------------------------------
export default function ExtraButtons({ token }) {
  const BASE_URL = 'https://api.xrpl.to/api';
  const theme = useTheme();
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  const [trustToken, setTrustToken] = useState(null);
  const [lines, setLines] = useState([]);
  const [isRemove, setIsRemove] = useState(false);
  const [balance, setBalance] = useState(0);
  const [limit, setLimit] = useState(0);

  // Step 2: Access the darkMode variable from AppContext
  const { darkMode, accountProfile, sync } = useContext(AppContext);

  const {
    id,
    issuer,
    name,
    currency,
    domain,
    whitepaper,
    kyc,
    holders,
    offers,
    trustlines,
    ext,
    md5,
    tags,
    social
  } = token;

  let user = token.user;
  if (!user) user = name;

  useEffect(() => {
    if (!accountProfile) return;
    axios
    .get(`${BASE_URL}/account/lines/${accountProfile?.account}`)
    .then((res) => {
      let ret = res.status === 200 ? res.data : undefined;
      if (ret) {
        const trustlines = ret.lines;

        const trustlineToRemove = trustlines.find((trustline) => {
          return (
            (trustline.LowLimit.issuer === issuer ||
              trustline.HighLimit.issuer === issuer) &&
            trustline.LowLimit.currency === currency
          );
        });

        if (trustlineToRemove) {
          setBalance(Decimal.abs(trustlineToRemove.Balance.value).toString());
          setLimit(trustlineToRemove.HighLimit.value);
        }
        
        setIsRemove(trustlineToRemove);
      }
    })
    .catch((err) => {
      console.log('Error on getting account lines!!!', err);
    })
  }, [trustToken, accountProfile, sync])

  const handleSetTrust = (e) => {
    setTrustToken(token);
  };

  const handleByCrypto = (e) => {};

  return (
    <Stack alignItems="center">
      {trustToken && (
        <TrustSetDialog
          balance={balance}
          limit={limit}
          token={trustToken}
          setToken={setTrustToken}
        />
      )}

      <Grid container direction="row" spacing={1}>
        <Grid item>
          <Button
            variant="contained"
            onClick={handleSetTrust}
            color={`${isRemove ? 'error' : 'primary'}`}
            size="small"
            disabled={CURRENCY_ISSUERS.XRP_MD5 === md5}
          >
            {`${isRemove ? 'Remove' : 'Set'} Trustline`}
          </Button>
        </Grid>

        <Grid item>
          <Link
            underline="none"
            color="inherit"
            // target="_blank"
            href={`/buy-xrp`}
            rel="noreferrer noopener nofollow"
          >
            <Button variant="outlined" color="primary" size="small">
              Buy XRP
            </Button>
          </Link>
        </Grid>
      </Grid>

      <Stack
        direction="row"
        alignItems="center"
        sx={{ mt: 1, width: isTablet ? '100%' : 'auto' }}
        justifyContent={isTablet ? 'flex-end' : 'flex-start'}
      >
        {/* Step 4: Use darkMode to select the appropriate image */}
        <LazyLoadImage
          src={darkMode ? "/static/sponsor-dark-theme.svg" : "/static/sponsor-light-theme.svg"}
          width={24}
          height={24}
        />
        <Typography variant="sponsored">Sponsored</Typography>
      </Stack>
    </Stack>
  );
}
