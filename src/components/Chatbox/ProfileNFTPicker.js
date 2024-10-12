import { useContext, useEffect, useRef, useState } from 'react';
import {
  Box,
  Grid,
  Typography,
  Stack,
  Button,
  Card,
  CardMedia,
  CardContent,
  Skeleton,
  Chip,
  styled,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { AppContext } from 'src/AppContext';
import axios from 'axios';
import { PulseLoader } from 'react-spinners';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import ArrowBackIcon from '@mui/icons-material/KeyboardBackspace';
import LeaderboardOutlinedIcon from '@mui/icons-material/LeaderboardOutlined';
import { getNftCoverUrl } from 'src/utils/parse/utils';
import { fIntNumber } from 'src/utils/formatNumber';

const BASE_URL = 'https://api.xrpnft.com/api';

// Implement ChatNFTCard directly in this file
const ChatNFTCard = ({ nft, onSelect, isSelected }) => {
  const { darkMode } = useContext(AppContext);

  const imgUrl = getNftCoverUrl(nft, 'small');
  const name = nft.meta?.name || nft.meta?.Name || 'No Name';
  const nftId = nft.NFTokenID || nft.nftokenID || nft.id || 'Unknown';

  return (
    <Card
      onClick={() => onSelect(nft)}
      sx={{
        cursor: 'pointer',
        border: isSelected ? '2px solid #007B55' : 'none',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: darkMode ? 'rgba(0, 0, 0, 0.1)' : 'rgba(255, 255, 255, 0.1)',
        '&:hover': {
          bgcolor: darkMode ? 'rgba(0, 0, 0, 0.2)' : 'rgba(255, 255, 255, 0.2)'
        }
      }}
    >
      <CardMedia
        component="img"
        image={imgUrl}
        alt={name}
        sx={{
          height: 40,
          objectFit: 'cover'
        }}
      />
      <CardContent sx={{ p: 0.5, flexGrow: 1 }}>
        <Typography variant="caption" component="div" noWrap>
          {name} ({nftId})
        </Typography>
      </CardContent>
    </Card>
  );
};

// Implement ChatCollectionCard directly in this file
const CardWrapper = styled(Card)(
  ({ theme }) => `
        border-radius: 8px;
        padding: 0px;
        cursor: pointer;
        overflow: hidden;
        height: 100px;
        width: 100%;
  `
);

const ChatCollectionCard = ({ collectionData, onSelect }) => {
  const { accountProfile } = useContext(AppContext);
  const [loadingImg, setLoadingImg] = useState(true);

  const collection = collectionData.collection;
  if (!collection) return null;

  const imgUrl = `https://s1.xrpnft.com/collection/${collection.logoImage}`;
  const name = collection.name || 'No Name';

  const handleClick = () => {
    if (onSelect) {
      onSelect(collectionData);
    }
  };

  const onImageLoaded = () => {
    setLoadingImg(false);
  };

  return (
    <CardWrapper onClick={handleClick}>
      <Box display="flex" flexDirection="column" alignItems="center" height="100%" p={1}>
        {loadingImg ? (
          <Skeleton variant="rectangular" width={40} height={40} sx={{ mb: 1 }} />
        ) : (
          <CardMedia
            component="img"
            image={imgUrl}
            alt={name}
            sx={{
              width: '40px',
              height: '40px',
              objectFit: 'cover',
              borderRadius: '4px',
              mb: 1
            }}
            onLoad={onImageLoaded}
          />
        )}
        <Typography
          variant="caption"
          sx={{
            fontSize: '0.65rem',
            lineHeight: 1.2,
            textAlign: 'center',
            maxWidth: '100%',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            mb: 0.5
          }}
        >
          {name}
        </Typography>
        {collection.rarity_rank > 0 && (
          <Chip
            variant="outlined"
            icon={<LeaderboardOutlinedIcon sx={{ width: '10px', height: '10px' }} />}
            label={
              <Typography variant="caption" sx={{ fontSize: '0.6rem' }}>
                {fIntNumber(collection.rarity_rank)}
              </Typography>
            }
            sx={{
              height: '16px',
              '& .MuiChip-label': { padding: '0 4px' }
            }}
          />
        )}
      </Box>
      <img src={imgUrl} style={{ display: 'none' }} onLoad={onImageLoaded} />
    </CardWrapper>
  );
};

const ProfileNFTs = ({
  account,
  collection,
  type = 'collected',
  limit,
  onSelect,
  smallSize = false
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const scrollRef = useRef(null);
  const { darkMode } = useContext(AppContext);

  const [nfts, setNFTs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState(null);
  const [selectedNFT, setSelectedNFT] = useState(null);

  useEffect(() => {
    if (account) {
      getNFTs();
      if (scrollRef.current) {
        scrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [account, collection, type, selectedCollection]);

  const getNFTs = async () => {
    const body = {
      account,
      filter: 0,
      limit,
      page: 0,
      search: '',
      subFilter: 'pricexrpasc',
      type,
      collection: selectedCollection
    };

    setLoading(true);
    try {
      const res = await axios.post(`${BASE_URL}/account/collectedCreated`, body);
      setNFTs(res.data.nfts);
    } catch (err) {
      console.error('Error fetching NFTs:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCollectionSelect = (collectionData) => {
    setSelectedCollection(collectionData.collection.id);
  };

  const handleNFTSelect = (nft) => {
    setSelectedNFT(nft);
    onSelect(nft);
  };

  const handleBack = () => {
    if (selectedNFT) {
      setSelectedNFT(null);
    } else {
      setSelectedCollection(null);
    }
  };

  return (
    <Box
      ref={scrollRef}
      sx={{
        padding: '10px',
        pt: 0,
        height: isMobile ? '300px' : '240px',
        width: '100%',
        maxWidth: isMobile ? '100%' : '320px',
        overflow: 'auto',
        '&::-webkit-scrollbar': {
          width: '6px !important'
        },
        '&::-webkit-scrollbar-thumb': {
          borderRadius: '10px',
          backgroundColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)',
        }
      }}
    >
      {(selectedCollection || selectedNFT) && (
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Button 
            size="small" 
            onClick={handleBack}
            startIcon={<ArrowBackIcon fontSize="small" />}
            sx={{ color: theme.palette.text.secondary }}
          >
            Back
          </Button>
          {selectedNFT && (
            <Typography variant="subtitle2" color="text.secondary">
              Selected: {selectedNFT.name}
            </Typography>
          )}
        </Box>
      )}
      {loading ? (
        <Stack alignItems="center" justifyContent="center" height="100%">
          <PulseLoader color={theme.palette.primary.main} size={10} />
        </Stack>
      ) : nfts.length === 0 ? (
        <Stack alignItems="center" justifyContent="center" height="100%">
          <ErrorOutlineIcon fontSize="large" sx={{ mb: 1, color: theme.palette.text.secondary }} />
          <Typography variant="body2" color="text.secondary">
            No NFTs found
          </Typography>
        </Stack>
      ) : (
        <Grid container spacing={2}>
          {nfts.map((nft, index) => (
            <Grid item key={index} xs={6} sm={4} md={3}>
              {selectedCollection ? (
                <ChatNFTCard
                  nft={nft}
                  onSelect={handleNFTSelect}
                  isSelected={selectedNFT && selectedNFT.id === nft.id}
                />
              ) : (
                <ChatCollectionCard collectionData={nft} onSelect={handleCollectionSelect} />
              )}
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
};

function ProfileNFTPicker({ onSelect }) {
  const { accountProfile } = useContext(AppContext);
  const [selectedNFT, setSelectedNFT] = useState(null);

  const handleNFTSelect = (nft) => {
    setSelectedNFT(nft);
    onSelect(nft);
  };

  return (
    <Box>
      <ProfileNFTs
        account={accountProfile?.account}
        type="collected"
        limit={20}
        onSelect={handleNFTSelect}
      />
    </Box>
  );
}

export default ProfileNFTPicker;
