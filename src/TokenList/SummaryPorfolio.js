import { withStyles } from '@mui/styles';
import {
  alpha,
  Box,
  Button,
  Container,
  Grid,
  Typography,
  Paper,
} from '@mui/material';

// Icons
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import ShareIcon from '@mui/icons-material/Share';
import EmailIcon from '@mui/icons-material/Email';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

// Context
import { useContext } from 'react';
import { AppContext } from 'src/AppContext';

// Utils
import { fNumber } from 'src/utils/formatNumber';

// Components
const ContentTypography = withStyles({
  root: {
    color: alpha('#919EAB', 0.99),
  },
})(Typography);

export default function TokenDirectoryPage({}) {
  const { accountProfile, openSnackbar, setLoading } = useContext(AppContext);

  const account = accountProfile?.account;

  return (
    <Box display="flex" flexDirection="column" minHeight="100vh">
      <Box flex="1">
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center" justifyContent="center" mt={6}>
            {/* Left side - Text Content */}
            <Grid item xs={12} lg={6}>
              <Box>
                <Typography variant="h2" gutterBottom>XRPL Token Porfolio</Typography>

                {/* Prominent CTA */}
                {!account && (
                  <Box mt={3}>
                    <Typography variant="h6" color="primary" gutterBottom>
                      Discover and Track XRP Ledger Tokens
                    </Typography>
                    <Button
                      variant="contained"
                      color="primary"
                      size="large"
                      startIcon={<AccountBalanceWalletIcon />}
                    >
                      Connect Wallet & Track Tokens
                    </Button>
                  </Box>
                )}

                {/* Introduction */}
                <Box mt={5}>
                  <Typography variant="h5" gutterBottom>
                  Track Your Tokens on the XRPL With Ease
                  </Typography>
                  <Typography variant="body1" paragraph>
                  Delve into the dynamic world of XRP Ledger tokens. Our platform empowers you, whether you're an investor seeking growth, a developer looking for opportunities, or an enthusiast eager for insights. Experience seamless tracking of token prices and market trends, all in one intuitive DApp
                  </Typography>
                </Box>
              </Box>
            </Grid>

            {/* Right side - Image Content */}
            <Grid item xs={12} lg={6}>
              <Box display="flex" justifyContent="center" alignItems="center" height="100%">
                <img
                  src="https://s2.coinmarketcap.com/static/cloud/img/portfolio/home/safari-darkmode-v2.png?_=1db0ce4"
                  alt="XRP Ledger"
                  style={{ maxWidth: '100%', height: 'auto' }}
                />
              </Box>
            </Grid>
          </Grid>
        </Container>

        {/* Features Section moved to the bottom */}
        <Container maxWidth="lg" sx={{ my: 10 }}>
          <Typography variant="h3" gutterBottom>
            Key Features
          </Typography>
          <Grid container spacing={5}>
            <Grid item xs={12} sm={6} lg={3}>
              <Paper elevation={3} sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
                <MonetizationOnIcon color="primary" sx={{ fontSize: 60, mb: 2 }} />
                <Typography variant="h6" color="primary">
                  Real-time Prices
                </Typography>
                <ContentTypography variant="body1">
                  Stay updated with real-time token prices and market data using XRP Ledger.
                </ContentTypography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <Paper elevation={3} sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
                <NotificationsActiveIcon color="primary" sx={{ fontSize: 60, mb: 2 }} />
                <Typography variant="h6" color="primary">
                  Price Alerts
                </Typography>
                <ContentTypography variant="body1">
                  Set up price alerts to get notified when your favorite tokens reach your desired prices.
                </ContentTypography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <Paper elevation={3} sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
                <ShareIcon color="primary" sx={{ fontSize: 60, mb: 2 }} />
                <Typography variant="h6" color="primary">
                  Share Porfolio
                </Typography>
                <ContentTypography variant="body1">
                  Share your porfolio with others or collaborate on token tracking.
                </ContentTypography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6} lg={3}>
              <Paper elevation={3} sx={{ p: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
                <EmailIcon color="primary" sx={{ fontSize: 60, mb: 2 }} />
                <Typography variant="h6" color="primary">
                  News Alerts
                </Typography>
                <ContentTypography variant="body1">
                Get immediate News Alerts on XRP Ledger tokens for smart, swift decision-making.
                </ContentTypography>
              </Paper>
            </Grid>
          </Grid>
        </Container>
      </Box>
    </Box>
  );
}
