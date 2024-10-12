// TradeNFTPicker.js
import React, { useEffect, useContext } from 'react';
import axios from 'axios';
import { PulseLoader } from 'react-spinners';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import ArrowBackIcon from '@mui/icons-material/KeyboardBackspace';
import LeaderboardOutlinedIcon from '@mui/icons-material/LeaderboardOutlined';
import { getNftCoverUrl } from 'src/utils/parse/utils';
import { fIntNumber } from 'src/utils/formatNumber';
import {
  Box,
  Card,
  CardContent,
  CardMedia,
  Typography,
  Chip,
  Button,
  Stack,
  Grid,
  Skeleton,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { styled, alpha } from '@mui/material/styles';
import { motion } from 'framer-motion';
import PropTypes from 'prop-types';
import { AppContext } from 'src/AppContext';

// Constants
const BASE_URL = 'https://api.xrpnft.com/api';

// Styled overlay to indicate selection
const SelectedOverlay = styled(Box)(({ theme }) => ({
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backgroundColor: 'rgba(0, 255, 0, 0.3)', // Semi-transparent green overlay
  borderRadius: theme.shape.borderRadius,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#fff',
  fontWeight: 'bold',
  fontSize: '1.2rem',
}));

// ChatNFTCard Component
const ChatNFTCard = ({ nft, onSelect, isSelected }) => {
  const { darkMode } = useContext(AppContext);
  const theme = useTheme();

  // Use unique identifier, e.g., NFTokenID
  const uniqueId = nft.NFTokenID || nft.id;

  const imgUrl = getNftCoverUrl(nft, 'small');
  const name = nft.meta?.name || nft.meta?.Name || 'No Name';

  return (
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Card
        onClick={() => onSelect(nft)}
        sx={{
          cursor: 'pointer',
          border: isSelected ? `2px solid ${theme.palette.success.main}` : '1px solid #ccc',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          bgcolor: darkMode ? alpha(theme.palette.background.paper, 0.1) : alpha(theme.palette.background.paper, 0.8),
          backdropFilter: 'blur(8px)',
          transition: 'all 0.3s ease-in-out',
          '&:hover': {
            boxShadow: theme.shadows[10],
            bgcolor: darkMode ? alpha(theme.palette.background.paper, 0.2) : alpha(theme.palette.background.paper, 0.9),
          },
          width: '100%',
          aspectRatio: '1 / 1',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <CardMedia
          component="img"
          image={imgUrl}
          alt={name}
          sx={{
            width: '110%',
            height: '110%',
            objectFit: 'cover',
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
          }}
        />
        {isSelected && <SelectedOverlay>Selected</SelectedOverlay>}
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            padding: '4px',
          }}
        >
          <Typography 
            variant="caption"
            component="div" 
            sx={{
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              lineHeight: 1.2,
              textAlign: 'center',
              width: '100%',
              fontSize: '0.7rem',
              color: 'white',
            }}
          >
            {name}
          </Typography>
        </Box>
      </Card>
    </motion.div>
  );
};

ChatNFTCard.propTypes = {
  nft: PropTypes.object.isRequired,
  onSelect: PropTypes.func.isRequired,
  isSelected: PropTypes.bool.isRequired,
};

// ChatCollectionCard Component
const CardWrapper = styled(motion.div)(
  ({ theme }) => `
    border-radius: 12px;
    overflow: hidden;
    height: 140px;
    width: 100%;
    background: ${alpha(theme.palette.background.paper, 0.8)};
    backdrop-filter: blur(8px);
    transition: all 0.3s ease-in-out;
    &:hover {
      box-shadow: ${theme.shadows[10]};
      background: ${alpha(theme.palette.background.paper, 0.9)};
    }
  `
);

const ChatCollectionCard = ({ collectionData, onSelect }) => {
  const { accountProfile } = useContext(AppContext);
  const [loadingImg, setLoadingImg] = React.useState(true);
  const theme = useTheme();

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
    <CardWrapper
      onClick={handleClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <Box display="flex" flexDirection="column" alignItems="center" height="100%" p={1.5}>
        {loadingImg ? (
          <Skeleton variant="rectangular" width={60} height={60} sx={{ mb: 1.5, borderRadius: '8px' }} />
        ) : (
          <Box
            sx={{
              width: '60px',
              height: '60px',
              position: 'relative',
              overflow: 'hidden',
              borderRadius: '8px',
              mb: 1.5
            }}
          >
            <CardMedia
              component="img"
              image={imgUrl}
              alt={name}
              sx={{
                width: '110%',
                height: '110%',
                objectFit: 'cover',
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
              }}
              onLoad={onImageLoaded}
            />
          </Box>
        )}
        <Typography
          variant="caption"
          sx={{
            fontSize: '0.75rem',
            lineHeight: 1.2,
            textAlign: 'center',
            maxWidth: '100%',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            mb: 0.75
          }}
        >
          {name}
        </Typography>
        {collection.rarity_rank > 0 && (
          <Chip
            variant="outlined"
            icon={<LeaderboardOutlinedIcon sx={{ width: '12px', height: '12px' }} />}
            label={
              <Typography variant="caption" sx={{ fontSize: '0.7rem' }}>
                {fIntNumber(collection.rarity_rank)}
              </Typography>
            }
            sx={{
              height: '20px',
              '& .MuiChip-label': { padding: '0 6px' }
            }}
          />
        )}
      </Box>
      <img src={imgUrl} style={{ display: 'none' }} onLoad={onImageLoaded} alt={name} />
    </CardWrapper>
  );
};

ChatCollectionCard.propTypes = {
  collectionData: PropTypes.object.isRequired,
  onSelect: PropTypes.func.isRequired,
};

// ProfileNFTs Component
const ProfileNFTs = ({
  account,
  collection,
  type = 'collected',
  limit,
  onSelect,
  selectedAssets,
  smallSize = false
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const scrollRef = React.useRef(null);
  const { darkMode } = useContext(AppContext);

  const [nfts, setNFTs] = React.useState([]);
  const [loading, setLoading] = React.useState(false);
  const [selectedCollection, setSelectedCollection] = React.useState(null);
  const [selectedNFT, setSelectedNFT] = React.useState(null);

  useEffect(() => {
    if (account) {
      getNFTs();
      if (scrollRef.current) {
        scrollRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
      console.log('XRPNFT API Response:', res.data); // Log the entire response
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
        height: isMobile ? '420px' : '360px',
        width: '100%',
        maxWidth: '100%',
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
        <Grid container spacing={3}>
          {nfts.map((nft) => (
            <Grid item key={nft.NFTokenID || nft.id} xs={6} sm={4} md={3} lg={3} xl={2}>
              {selectedCollection ? (
                <ChatNFTCard
                  nft={nft}
                  onSelect={handleNFTSelect}
                  isSelected={selectedAssets.some(asset => asset.NFTokenID === nft.NFTokenID)}
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

ProfileNFTs.propTypes = {
  account: PropTypes.string.isRequired,
  collection: PropTypes.string,
  type: PropTypes.string,
  limit: PropTypes.number.isRequired,
  onSelect: PropTypes.func.isRequired,
  selectedAssets: PropTypes.arrayOf(PropTypes.object).isRequired,
  smallSize: PropTypes.bool,
};

// TradeNFTPicker Component
function TradeNFTPicker({ onSelect, account, isPartner, selectedAssets }) {
  const theme = useTheme();
  const { accountProfile } = useContext(AppContext);

  // Determine which account to use for fetching NFTs
  // const nftAccount = isPartner ? account : accountProfile.address;

  return (
    <Box sx={{ width: '100%', p: 2, borderRadius: 2, bgcolor: alpha(theme.palette.background.paper, 0.6) }}>
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 'bold', color: 'primary.main' }}>
        {isPartner ? "Partner's NFTs" : "Your NFTs"}
      </Typography>
      <ProfileNFTs
        account={account}
        type="collected"
        limit={20}
        onSelect={onSelect}
        selectedAssets={selectedAssets}
      />
    </Box>
  );
}

TradeNFTPicker.propTypes = {
  onSelect: PropTypes.func.isRequired,
  account: PropTypes.string.isRequired,
  isPartner: PropTypes.bool.isRequired,
  selectedAssets: PropTypes.arrayOf(PropTypes.object).isRequired,
};

export default TradeNFTPicker;