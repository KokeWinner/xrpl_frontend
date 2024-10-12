import { normalizeCurrencyCodeXummImpl } from 'src/utils/normalizers';
import { useContext, useState } from 'react';
import {
  styled,
  useTheme,
  Box,
  CardMedia,
  Chip,
  Link,
  Stack,
  Tooltip,
  Typography,
  Skeleton,
  Card,
  Grid,
  CardContent,
  Button
} from '@mui/material';
import SportsScoreIcon from '@mui/icons-material/SportsScore';
import LeaderboardOutlinedIcon from '@mui/icons-material/LeaderboardOutlined';
import CloseIcon from '@mui/icons-material/Close';
import { Icon } from '@iconify/react';

import { getMinterName } from 'src/utils/constants';
import { fNumber, fIntNumber } from 'src/utils/formatNumber';
import { getNftCoverUrl } from 'src/utils/parse/utils';
import Label from './Label';
import { AppContext } from 'src/AppContext';
import { alpha } from '@mui/material/styles';

const CardWrapper = styled(Card)(({ theme }) => ({
  borderRadius: 16,
  backdropFilter: 'blur(20px)',
  backgroundColor: alpha(theme.palette.background.paper, 0.8),
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
  border: '1px solid rgba(255, 255, 255, 0.18)',
  padding: 0,
  cursor: 'pointer',
  transition: 'all 0.3s ease-in-out',
  overflow: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  '&:hover': {
    transform: 'translateY(-5px)',
    boxShadow: '0 12px 40px 0 rgba(31, 38, 135, 0.5)'
  },
  height: 300, // Reduced from 340
}));

export default function NFTCard({ nft, handleRemove }) {
  const theme = useTheme();
  const { accountProfile } = useContext(AppContext);
  const isAdmin = accountProfile?.admin;

  const [loadingImg, setLoadingImg] = useState(true);

  const { uuid, account, cost, costb, meta, NFTokenID, destination, rarity_rank, updateEvent, amount } = nft;

  const isSold = false;
  const imgUrl = getNftCoverUrl(nft, 'small');
  const name = nft.meta?.name || meta?.Name || 'No Name';

  const onImageLoaded = () => {
    setLoadingImg(false);
  };

  const handleRemoveNft = (e) => {
    e.preventDefault();
    if (!isAdmin) return;
    if (!confirm(`Are you sure you want to remove "${name}"?`)) return;
    handleRemove(NFTokenID);
  };

  const showBuyNowButton = (cost && cost.issuer === 'XRPL' && cost.currency === 'XRP' && cost.amount) || amount;

  return (
    <Link href={`/nft/${NFTokenID}`} underline="none" sx={{ position: 'relative' }}>
      <CardWrapper sx={{ margin: 'auto', maxWidth: 240, height: 300 }}>
        {isAdmin && (
          <CloseIcon
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              zIndex: 1500,
              color: theme.palette.grey[300]
            }}
            onClick={(e) => handleRemoveNft(e)}
          />
        )}
        {isSold && (
          <Label
            variant="filled"
            color="error"
            sx={{ zIndex: 9, top: 24, right: 24, position: 'absolute', textTransform: 'uppercase' }}
          >
            SOLD
          </Label>
        )}
        <Box sx={{ position: 'relative', height: '60%' }}>
          <CardMedia
            component={loadingImg ? Skeleton : 'img'}
            image={imgUrl}
            loading={loadingImg.toString()}
            alt={'NFT' + uuid}
            sx={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '16px 16px 0 0' }}
          />
          <img src={imgUrl} style={{ display: 'none' }} onLoad={onImageLoaded} />

          {/* Offer and Event Display */}
          <Stack
            direction="column"
            alignItems="flex-end"
            justifyContent="flex-start"
            spacing={0.5}
            sx={{ position: 'absolute', top: 8, right: 8, left: 8, zIndex: 1500 }}
          >
            {costb && costb.amount && (
              <Box
                sx={{
                  backgroundColor: theme.palette.primary.main,
                  borderRadius: '8px',
                  padding: '4px 8px',
                  marginBottom: '8px',
                  boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.2)'
                }}
              >
                <Typography
                  variant="caption"
                  sx={{
                    fontWeight: 'bold',
                    color: '#fff',
                    textShadow: '1px 1px 2px rgba(0, 0, 0, 0.5)'
                  }}
                  noWrap
                >
                  Offer ✕ {fNumber(costb.amount)}
                </Typography>
              </Box>
            )}
            {updateEvent && (
              <Box
                sx={{
                  backgroundColor: 'rgba(0, 0, 0, 0.6)',
                  borderRadius: '8px',
                  padding: '2px 6px',
                  boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.2)'
                }}
              >
                <Typography variant="caption" sx={{ fontWeight: 'bold', color: '#fff' }} noWrap>
                  {updateEvent}
                </Typography>
              </Box>
            )}
          </Stack>
        </Box>

        <CardContent
          sx={{
            padding: 1,
            background: theme.palette.background.default,
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between'
          }}
        >
          <Box>
            <Typography
              variant="subtitle2"
              sx={{
                fontWeight: 'bold',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                display: '-webkit-box',
                WebkitLineClamp: 1,
                WebkitBoxOrient: 'vertical',
                fontSize: '0.8rem'
              }}
            >
              {name}
            </Typography>
            {(cost || amount) && (
              <Typography variant="caption" color="text.secondary" noWrap sx={{ fontSize: '0.7rem' }}>
                {cost
                  ? cost.currency === 'XRP'
                    ? `✕ ${fNumber(cost.amount)}`
                    : `${fNumber(cost.amount)} ${normalizeCurrencyCodeXummImpl(cost.currency)}`
                  : `✕ ${fNumber(amount)}`}
              </Typography>
            )}
            {destination && getMinterName(account) && (
              <Tooltip title={`Sold & Transfer`}>
                <SportsScoreIcon color="primary" sx={{ fontSize: '1rem', mt: 0.5 }} />
              </Tooltip>
            )}
          </Box>

          {/* Buy Now button and Ranking */}
          <Stack direction="row" alignItems="center" justifyContent="space-between" width="100%" mt={1}>
            {showBuyNowButton && (
              <Button
                variant="contained"
                color="primary"
                sx={{
                  boxShadow: '0px 2px 6px rgba(0, 0, 0, 0.2)',
                  borderRadius: '6px',
                  transition: 'transform 0.2s',
                  '&:hover': { transform: 'scale(1.02)' },
                  padding: '2px 6px',
                  fontSize: '0.7rem',
                  minHeight: '24px',
                  maxWidth: '80px'
                }}
              >
                Buy Now
              </Button>
            )}
            {rarity_rank > 0 && (
              <Chip
                variant="filled"
                color="secondary"
                icon={<LeaderboardOutlinedIcon sx={{ width: '12px' }} />}
                label={<Typography variant="caption" sx={{ fontSize: '0.65rem' }}>{fIntNumber(rarity_rank)}</Typography>}
                size="small"
                sx={{
                  height: '20px',
                  '& .MuiChip-label': { px: 0.5 }
                }}
              />
            )}
          </Stack>
        </CardContent>
      </CardWrapper>
    </Link>
  );
}
