import axios from 'axios';
import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';

// Material
import {
  useTheme,
  Avatar,
  Box,
  Container,
  Link,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableRow,
  Typography
} from '@mui/material';
import { tableCellClasses } from '@mui/material/TableCell';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import GridOnIcon from '@mui/icons-material/GridOn';
import Grid4x4Icon from '@mui/icons-material/Grid4x4';
import ApprovalIcon from '@mui/icons-material/Approval';
import TokenIcon from '@mui/icons-material/Token';
import CollectionsIcon from '@mui/icons-material/Collections';
import CasinoIcon from '@mui/icons-material/Casino';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HowToRegIcon from '@mui/icons-material/HowToReg';
import SportsScoreIcon from '@mui/icons-material/SportsScore';
import FireplaceIcon from '@mui/icons-material/Fireplace';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import AnimationIcon from '@mui/icons-material/Animation';
import PaymentIcon from '@mui/icons-material/Payment';
import ImportExportIcon from '@mui/icons-material/ImportExport';

// Utils
import { Activity } from 'src/utils/constants';
import { normalizeAmount } from 'src/utils/normalizers';

// Loader
import { PulseLoader } from 'react-spinners';

// Components
import FlagsContainer from 'src/components/Flags';
import ListToolbar from 'src/components/ListToolbar';

// ----------------------------------------------------------------------
export default function NFTHistory({ account }) {
  const theme = useTheme();
  const BASE_URL = 'https://api.xrpnft.com/api';

  const [page, setPage] = useState(0);
  const [rows, setRows] = useState(10);
  const [total, setTotal] = useState(0);
  const [acts, setActs] = useState([]);
  const [nftDetails, setNftDetails] = useState({});

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getActivities = async () => {
      setLoading(true);
      try {
        const { status, data } = await axios.get(`${BASE_URL}/account/activity`, {
          params: { account, page, limit: rows }
        });
        if (status === 200 && data) {
          setTotal(data.total);
          setActs(data.acts);
        }
      } catch (err) {
        console.error('Error on getting activity list!!!', err);
      } finally {
        setLoading(false);
      }
    };
    getActivities();
  }, [account, page, rows]);

  const fetchNFTDetails = async (NFTokenID) => {
    try {
      const response = await axios.get(`${BASE_URL}/nft/${NFTokenID}`);
      console.log('Fetched NFT Details:', response.data.nft);
      if (response.data.nft && response.data.nft.NFTokenID === NFTokenID) {
        setNftDetails((prevDetails) => {
          const newDetails = {
            ...prevDetails,
            [NFTokenID]: response.data.nft
          };
          console.log('Updated NFT Details:', newDetails);
          return newDetails;
        });
      } else {
        console.error('Fetched NFT does not match requested NFTokenID');
      }
    } catch (error) {
      console.error('Error fetching NFT details:', error);
    }
  };

  const renderNFTPreview = (nft) => {
    if (!nft) return null;

    const getImageUrl = (nft) => {
      if (nft.files && nft.files.length > 0) {
        const fileWithThumbnail = nft.files.find(file => file.thumbnail);
        if (fileWithThumbnail) {
          const thumbnailUrl = fileWithThumbnail.thumbnail.big || fileWithThumbnail.thumbnail.small;
          if (thumbnailUrl) {
            return `https://s2.xrpnft.com/d1/${thumbnailUrl}`;
          }
        }
      }

      // Fallback to other methods if files array doesn't contain a suitable thumbnail
      if (nft.thumbnail && nft.thumbnail.image) {
        return `https://s2.xrpnft.com/d1/${nft.thumbnail.image}`;
      }

      if (nft.dfile && nft.dfile.image) {
        return `https://s2.xrpnft.com/d1/${nft.dfile.image}`;
      }

      return null;
    };

    const imageUrl = getImageUrl(nft);

    if (imageUrl) {
      return (
        <img
          src={imageUrl}
          alt={nft.name || 'NFT'}
          style={{
            maxWidth: '50px',
            maxHeight: '50px',
            objectFit: 'contain',
            borderRadius: '3px'
          }}
          onError={(e) => {
            console.error('Error loading NFT image:', e);
            e.target.src = '/path/to/fallback/image.png'; // Add a fallback image
          }}
        />
      );
    }

    // Fallback for NFTs without images
    return (
      <Box
        sx={{
          width: '50px',
          height: '50px',
          backgroundColor: 'grey.300',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          borderRadius: '3px'
        }}
      >
        <Typography variant="caption">No Image</Typography>
      </Box>
    );
  };

  const renderActivityIcon = (activity) => {
    switch (activity) {
      case Activity.UPDATE_PROFILE:
        return <ManageAccountsIcon />;
      case Activity.CREATE_COLLECTION:
        return <GridOnIcon />;
      case Activity.IMPORT_COLLECTION:
        return <ImportExportIcon />;
      case Activity.UPDATE_COLLECTION:
        return <Grid4x4Icon />;
      case Activity.MINT_BULK:
        return <CollectionsIcon />;
      case Activity.BUY_MINT:
        return <ShoppingBagIcon />;
      case Activity.BUY_RANDOM_NFT:
        return <CasinoIcon />;
      case Activity.BUY_SEQUENCE_NFT:
        return <AnimationIcon />;
      case Activity.BUY_BULK_NFT:
        return <TaskAltIcon />;
      case Activity.CREATE_SELL_OFFER:
      case Activity.CREATE_BUY_OFFER:
        return <LocalOfferIcon />;
      case Activity.CANCEL_SELL_OFFER:
      case Activity.CANCEL_BUY_OFFER:
        return <HighlightOffIcon />;
      case Activity.ACCEPT_BUY_OFFER:
      case Activity.ACCEPT_SELL_OFFER:
        return <CheckCircleOutlineIcon />;
      case Activity.OWNER_ACCPETED_YOUR_BUY_OFFER:
      case Activity.BUYER_ACCEPTED_YOUR_SELL_OFFER:
      case Activity.BROKER_ACCEPTED_YOUR_BUY_OFFER:
      case Activity.BROKER_ACCEPTED_YOUR_SELL_OFFER:
        return <HowToRegIcon />;
      case Activity.YOU_RECEIVED_A_NFT:
        return <SportsScoreIcon />;
      case Activity.MINT_NFT:
        return <TokenIcon />;
      case Activity.BURN_NFT:
        return <FireplaceIcon />;
      case Activity.SET_NFT_MINTER:
        return <ApprovalIcon />;
      case Activity.REFUND_BUYER:
        return <PaymentIcon />;
      default:
        return <HelpOutlineIcon />;
    }
  };

  const renderActivityDetails = (activity, data) => {
    switch (activity) {
      case Activity.CREATE_COLLECTION:
      case Activity.IMPORT_COLLECTION:
      case Activity.UPDATE_COLLECTION:
        return (
          <Stack direction="row" spacing={1} alignItems="center">
            <Avatar alt="C" src={`https://s1.xrpnft.com/collection/${data.logo}`} sx={{ width: 24, height: 24 }} />
            <Stack>
              <Stack direction="row" spacing={1}>
                <Typography variant="s7">Name: </Typography>
                <Typography variant="s8">{data.name}</Typography>
              </Stack>
              <Stack direction="row" spacing={1}>
                <Typography variant="s7">Type: </Typography>
                <Typography variant="s8">{data.type}</Typography>
              </Stack>
            </Stack>
          </Stack>
        );
      case Activity.MINT_BULK:
        return (
          <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={1}>
              <Avatar alt="C" src={`https://gateway.xrpnft.com/ipfs/${data.meta.image}`} sx={{ width: 24, height: 24 }} />
              <Stack>
                <Stack direction="row" spacing={1}>
                  <Typography variant="s7">Minter: </Typography>
                  <Typography variant="s8">{data.minter}</Typography>
                </Stack>
                <Stack direction="row" spacing={1}>
                  <Typography variant="s7">Issuer: </Typography>
                  <Typography variant="s8">{data.issuer}</Typography>
                </Stack>
                <Stack direction="row" spacing={1}>
                  <Typography variant="s7">Total: </Typography>
                  <Typography variant="s8">{data.count}</Typography>
                </Stack>
              </Stack>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <FlagsContainer Flags={data.flag} />
            </Stack>
          </Stack>
        );
      case Activity.BUY_MINT:
        return (
          <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={1}>
              <Avatar alt="C" src={`https://s1.xrpl.to/token/${data.cost?.md5}`} sx={{ width: 24, height: 24 }} />
              <Stack>
                <Stack direction="row" spacing={1}>
                  <Typography variant="s7">Collection: </Typography>
                  <Typography variant="s8">{data.cname}</Typography>
                </Stack>
                <Stack direction="row" spacing={0.8} alignItems="center">
                  <Typography variant="p4" color="#EB5757">
                    {data.cost?.amount}
                  </Typography>
                  <Typography variant="s2">{data.cost?.name}</Typography>
                </Stack>
              </Stack>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <Stack direction="row" spacing={1}>
                <Typography variant="s7">Quantity: </Typography>
                <Typography variant="s8">{data.quantity}</Typography>
              </Stack>
            </Stack>
          </Stack>
        );
      case Activity.CREATE_SELL_OFFER:
      case Activity.CREATE_BUY_OFFER:
      case Activity.CANCEL_SELL_OFFER:
      case Activity.CANCEL_BUY_OFFER:
      case Activity.ACCEPT_BUY_OFFER:
      case Activity.ACCEPT_SELL_OFFER:
      case Activity.OWNER_ACCPETED_YOUR_BUY_OFFER:
      case Activity.BUYER_ACCEPTED_YOUR_SELL_OFFER:
      case Activity.BROKER_ACCEPTED_YOUR_BUY_OFFER:
      case Activity.BROKER_ACCEPTED_YOUR_SELL_OFFER:
      case Activity.YOU_RECEIVED_A_NFT:
        console.log('NFT Activity Data:', data);
        console.log('NFT Details:', nftDetails[data.NFTokenID]);

        if (!nftDetails[data.NFTokenID]) {
          fetchNFTDetails(data.NFTokenID);
        }
        const nft = nftDetails[data.NFTokenID];

        console.log('Rendered NFT:', nft);

        return (
          <Stack direction="row" spacing={2} alignItems="center">
            {nft ? renderNFTPreview(nft) : <Typography variant="s7">Loading NFT preview...</Typography>}
            <Stack>
              <Typography variant="s7">NFTokenID: </Typography>
              <Link
                color="inherit"
                target="_blank"
                href={`/nft/${data.NFTokenID}`}
                rel="noreferrer noopener nofollow"
              >
                <Typography variant="s8">{data.NFTokenID}</Typography>
              </Link>
              {nft && (
                <>
                  <Typography variant="s7">Name: {nft.name || 'N/A'}</Typography>
                  <Typography variant="s7">Collection: {nft.collection || 'N/A'}</Typography>
                </>
              )}
              {!nft && <Typography variant="s7">Loading NFT details...</Typography>}
            </Stack>
          </Stack>
        );
      case Activity.MINT_NFT:
        console.log('Mint NFT Data:', data);
        return data.meta ? (
          <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={1}>
              <Avatar alt="C" src={`https://gateway.xrpnft.com/ipfs/${data.meta.image}`} sx={{ width: 24, height: 24 }} />
              <Stack>
                <Stack direction="row" spacing={1}>
                  <Typography variant="s7">Name: </Typography>
                  <Typography variant="s8">{data.name}</Typography>
                </Stack>
                <Stack direction="row" spacing={1}>
                  <Typography variant="s7">Type: </Typography>
                  <Typography variant="s8">{data.type}</Typography>
                </Stack>
              </Stack>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <FlagsContainer Flags={data.flag} />
            </Stack>
          </Stack>
        ) : (
          <Stack direction="row" spacing={1}>
            <Typography variant="s7">NFTokenID: </Typography>
            <Link
              color="inherit"
              target="_blank"
              href={`/nft/${data.NFTokenID}`}
              rel="noreferrer noopener nofollow"
            >
              <Typography variant="s8">{data.NFTokenID}</Typography>
            </Link>
          </Stack>
        );
      case Activity.BURN_NFT:
        return (
          <Stack direction="row" spacing={1}>
            <Typography variant="s7">NFTokenID: </Typography>
            <Link
              color="inherit"
              target="_blank"
              href={`/nft/${data.NFTokenID}`}
              rel="noreferrer noopener nofollow"
            >
              <Typography variant="s8">{data.NFTokenID}</Typography>
            </Link>
          </Stack>
        );
      case Activity.SET_NFT_MINTER:
        return (
          <Stack direction="row" spacing={1}>
            <Typography variant="s7">Minter: </Typography>
            <Typography variant="s8">{data.NFTokenMinter}</Typography>
          </Stack>
        );
      case Activity.REFUND_BUYER:
        const amount = normalizeAmount(data.amount);
        return (
          <Stack direction="row" spacing={1} justifyContent="space-between" alignItems="center">
            <Stack direction="row" spacing={1}>
              <Avatar alt="C" src={`https://s1.xrpl.to/token/${data.cost?.md5}`} sx={{ width: 24, height: 24 }} />
              <Stack>
                <Stack direction="row" spacing={1}>
                  <Typography variant="s7">Collection: </Typography>
                  <Typography variant="s8">{data.cname}</Typography>
                </Stack>
                <Stack direction="row" spacing={0.8} alignItems="center">
                  <Typography variant="s7">Cost x Quantity: </Typography>
                  <Typography variant="s8">{data.cost?.amount}</Typography>
                  <Typography variant="s8">{data.cost?.name}</Typography>
                  <Typography variant="s8">x</Typography>
                  <Typography variant="s8">{data.quantity}</Typography>
                </Stack>
                <Stack direction="row" spacing={1}>
                  <Typography variant="s7">To: </Typography>
                  <Typography variant="s8">{data.dest}</Typography>
                </Stack>
              </Stack>
            </Stack>
            <Stack direction="row" spacing={1} alignItems="center">
              <Stack direction="row" spacing={1}>
                <Typography variant="s7">Amount: </Typography>
                <Typography variant="s8">{amount.amount}</Typography>
                <Typography variant="s8">{data.cost?.name}</Typography>
              </Stack>
            </Stack>
          </Stack>
        );
      default:
        return null;
    }
  };

  const getActivityName = (activity) => {
    switch (activity) {
      case Activity.UPDATE_PROFILE:
        return 'Update Profile';
      case Activity.CREATE_COLLECTION:
        return 'Create a Collection';
      case Activity.IMPORT_COLLECTION:
        return 'Import a Collection';
      case Activity.UPDATE_COLLECTION:
        return 'Update Collection';
      case Activity.MINT_BULK:
        return 'Mint Bulk NFTs';
      case Activity.BUY_MINT:
        return 'Buy Mint';
      case Activity.BUY_RANDOM_NFT:
        return 'Buy Random NFT';
      case Activity.BUY_SEQUENCE_NFT:
        return 'Buy Sequence NFT';
      case Activity.BUY_BULK_NFT:
        return 'Buy Bulk NFT';
      case Activity.CREATE_SELL_OFFER:
        return 'Create Sell Offer';
      case Activity.CREATE_BUY_OFFER:
        return 'Create Buy Offer';
      case Activity.CANCEL_SELL_OFFER:
        return 'Cancel Sell Offer';
      case Activity.CANCEL_BUY_OFFER:
        return 'Cancel Buy Offer';
      case Activity.ACCEPT_BUY_OFFER:
        return 'Accept Buy Offer';
      case Activity.ACCEPT_SELL_OFFER:
        return 'Accept Sell Offer';
      case Activity.OWNER_ACCPETED_YOUR_BUY_OFFER:
        return 'NFT Owner accepted your Buy Offer';
      case Activity.BUYER_ACCEPTED_YOUR_SELL_OFFER:
        return 'Buyer accepted your Sell Offer';
      case Activity.YOU_RECEIVED_A_NFT:
        return 'You received a NFT';
      case Activity.MINT_NFT:
        return 'Minted a NFT';
      case Activity.BURN_NFT:
        return 'Burnt a NFT';
      case Activity.SET_NFT_MINTER:
        return 'Set NFT Minter';
      case Activity.REFUND_BUYER:
        return 'Refund Mint Amount to Buyer';
      case Activity.BROKER_ACCEPTED_YOUR_BUY_OFFER:
        return 'Broker accepted your Buy Offer';
      case Activity.BROKER_ACCEPTED_YOUR_SELL_OFFER:
        return 'Broker accepted your Sell Offer';
      default:
        return null;
    }
  };

  useEffect(() => {
    // This effect will trigger a re-render when nftDetails are updated
  }, [nftDetails]);

  return (
    <Container maxWidth="lg" sx={{ pl: 0, pr: 0 }}>
      {loading ? (
        <Stack alignItems="center" sx={{ mt: 3 }}>
          <PulseLoader color="#00AB55" size={10} />
        </Stack>
      ) : acts.length === 0 ? (
        <Stack alignItems="center" sx={{ mt: 5 }}>
          <Typography variant="h6">No activity found</Typography>
        </Stack>
      ) : (
        <Box sx={{ mt: 2, mb: 2 }}>
          <Table
            stickyHeader
            sx={{
              [`& .${tableCellClasses.root}`]: {
                borderBottom: '1px solid',
                borderColor: theme.palette.divider
              }
            }}
          >
            <TableBody>
              {acts.map(({ account, activity, data, time }) => {
                const activityName = getActivityName(activity);
                const activityDetails = renderActivityDetails(activity, data);
                
                // Skip rendering if activityName is null
                if (activityName === null) {
                  return null;
                }

                const strDateTime = formatDistanceToNow(new Date(time), { addSuffix: true });
                return (
                  <TableRow key={time} hover>
                    <TableCell align="left" sx={{ width: '50px' }}>
                      {renderActivityIcon(activity)}
                    </TableCell>
                    <TableCell align="left">
                      <Stack spacing={1}>
                        <Stack
                          direction="row"
                          spacing={1}
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <Typography variant="subtitle1" fontWeight="bold">
                            {activityName}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {strDateTime}
                          </Typography>
                        </Stack>
                        {activityDetails}
                      </Stack>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Box>
      )}
      {total > 0 && (
        <ListToolbar count={total} rows={rows} setRows={setRows} page={page} setPage={setPage} />
      )}
    </Container>
  );
}
