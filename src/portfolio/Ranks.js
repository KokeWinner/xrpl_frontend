import { alpha, Avatar, Box, Card, CardContent, Grid, Stack, Typography, useTheme } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { AppContext } from "src/AppContext";
import PsychologyIcon from '@mui/icons-material/Psychology';
import WaterIcon from '@mui/icons-material/Water';
import VerifiedUserIcon from '@mui/icons-material/VerifiedUser';
import LockIcon from '@mui/icons-material/Lock';
import SecurityIcon from '@mui/icons-material/Security';
import VerifiedIcon from '@mui/icons-material/Verified';
import axios from "axios";
import { PulseLoader } from "react-spinners";
import { useRouter } from 'next/router';

const ranks = {
  riddler: {
    id: 'riddler',
    name: 'Riddler',
    price: 5,
    description: 'Entry-level rank for XRP puzzle solvers',
    icon: PsychologyIcon,
    color: '#FFD700'
  },
  rippler: {
    id: 'rippler',
    name: 'Rippler',
    price: 0.0001,
    description: 'Intermediate rank for XRP enthusiasts',
    icon: WaterIcon,
    color: '#4CAF50'
  },
  validator: {
    id: 'validator',
    name: 'Validator',
    price: 0.0001,
    description: 'Advanced rank with enhanced features',
    icon: VerifiedUserIcon,
    color: '#2196F3'
  },
  escrow: {
    id: 'escrow',
    name: 'Escrow Master',
    price: 0.0001,
    description: 'Elite rank with exclusive XRP-themed perks',
    icon: LockIcon,
    color: '#9C27B0'
  },
  ledger: {
    id: 'ledger',
    name: 'Ledger Guardian',
    price: 0.0001,
    description: 'Legendary rank for true XRP aficionados',
    icon: SecurityIcon,
    color: '#F44336'
  },
  verified: {
    id: 'verified',
    name: 'Verified',
    price: 0.0001,
    description: 'Exclusive verified status with premium benefits',
    icon: VerifiedIcon,
    color: '#1DA1F2'
  }
};

const chatURL = "http://65.108.136.237:5000"; //http://65.108.136.237:5000

const Ranks = ({ profileAccount }) => {

  const theme = useTheme();
  const { accountProfile, darkMode, openSnackbar } = useContext(AppContext);
  const [purchased, setPurchased] = useState([]);
  const [activeRank, setActiveRank] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {

    async function getPurchasedRanks() {
      setLoading(true);
      const accountToUse = profileAccount || router.query.slug;
      
      if (!accountToUse) {
        setLoading(false);
        return;
      }

      try {
        const res = await axios.post(`${chatURL}/api/get-purchased-ranks`, {
          account: accountToUse
        });

        const result = res.data;
        console.log('Response from /api/get-purchased-ranks:', result);
        const activePurchases = result.chatFeatures.filter(feature => feature.status === true);
        setPurchased(activePurchases);
        setActiveRank(result.activeRank);
      } catch (error) {
        console.error('Error fetching purchased ranks:', error);
        openSnackbar('Failed to fetch ranks', 'error');
      } finally {
        setLoading(false);
      }
    }

    getPurchasedRanks();
  }, [profileAccount, router.query.slug]);

  const updateActiveRank = async(rank) => {

    if (!accountProfile?.account) {
      openSnackbar('Please login to change active rank', 'error');
      return;
    }

    if (profileAccount !== accountProfile?.account) {
      openSnackbar('You can only change the active rank on your own profile', 'error');
      return;
    }

    try {
      await axios.post(`${chatURL}/api/set-active-rank`, {
        account: accountProfile.account,
        rank
      });
      setActiveRank(rank);
      openSnackbar(`Selected ${ranks[rank].name} as active rank successfully!`, 'success');
    } catch(err) {
      console.error('Error updating active rank:', err);
      openSnackbar('Failed to update active rank', 'error');
    }
  }

  return (
    <Box sx={{ p: 2, minHeight: "300px"}}>
      {
        loading ? (
          <Stack alignItems="center">
              <PulseLoader color={darkMode ? '#007B55' : '#5569ff'} size={10} />
          </Stack>
        ) :
        <>
          {
            purchased.length ? (
              <Grid container spacing={2}>
                {purchased.map((purchase) => {
                  if (ranks[purchase.feature]) {
                    const item = ranks[purchase.feature];
                    return (
                      <Grid item xs={12} sm={6} md={4} lg={3} key={item.name} onClick={() => updateActiveRank(item.id)}>
                        <Card
                          sx={{
                            height: '100%',
                            display: 'flex',
                            flexDirection: 'column',
                            transition: 'transform 0.3s, box-shadow 0.3s',
                            '&:hover': {
                              transform: 'translateY(-3px)',
                              boxShadow: theme.shadows[5]
                            },
                            ...(item.id === activeRank && {
                              border: `2px solid ${item.color}`,
                              boxShadow: `0 0 10px ${alpha(item.color, 0.5)}`
                            }),
                            borderRadius: 2,
                            overflow: 'hidden',
                            cursor: "pointer"
                          }}
                        >
                          <Box sx={{
                            bgcolor: alpha(item.color, 0.1),
                            p: 2,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                          }}>
                            <Avatar sx={{ bgcolor: item.color, width: 36, height: 36 }}>
                              <item.icon sx={{ fontSize: 20 }} />
                            </Avatar>
                            <Typography variant="subtitle1" component="div" sx={{ fontWeight: 'bold', color: item.color }}>
                              {item.name}
                              {item.id === 'verified' && (
                                <VerifiedIcon sx={{ ml: 1, verticalAlign: 'middle', fontSize: 16 }} />
                              )}
                            </Typography>
                          </Box>
                          <CardContent sx={{ flexGrow: 1, p: 2 }}>
                            <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: '0.8rem' }}>
                              {item.description}
                            </Typography>
                            <Typography
                              variant="subtitle1"
                              sx={{ fontWeight: 'bold', color: theme.palette.secondary.main }}
                            >
                              Price: 0.0001 XRP
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    );
                  }
                  return null;
                })}
              </Grid>
            ) : <Typography>No Active Purchased Ranks</Typography>
          }
        </>
      }
    </Box>
  )
}

export default Ranks;