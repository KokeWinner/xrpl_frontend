import React from 'react';
import { Card, CardContent, CardActions, Typography, Button, Box, Avatar, Tooltip, Link } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';
import VerifiedIcon from '@mui/icons-material/Verified';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

function RankItem({ item, onPurchase, isPurchased, purchaseDate, transactionHash }) {
  const theme = useTheme();

  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const truncateHash = (hash) => {
    if (!hash) return '';
    return `${hash.slice(0, 6)}...${hash.slice(-6)}`;
  };

  return (
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
        ...(item.id === 'verified' && {
          border: `2px solid ${item.color}`,
          boxShadow: `0 0 10px ${alpha(item.color, 0.5)}`
        }),
        borderRadius: 2,
        overflow: 'hidden'
      }}
    >
      <Box
        sx={{
          bgcolor: alpha(item.color, 0.1),
          p: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}
      >
        <Avatar sx={{ bgcolor: item.color, width: 36, height: 36 }}>
          <item.icon sx={{ fontSize: 20 }} />
        </Avatar>
        <Typography
          variant="subtitle1"
          component="div"
          sx={{ fontWeight: 'bold', color: item.color }}
        >
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
          Price: {item.price} XRP
        </Typography>
        {isPurchased && (
          <Box sx={{ mt: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Purchased on: {formatDate(purchaseDate)}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mr: 1 }}>
                TX:
              </Typography>
              <Tooltip title="View transaction on XRPL Explorer">
                <Link
                  href={`https://livenet.xrpl.org/transactions/${transactionHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  sx={{ display: 'flex', alignItems: 'center' }}
                >
                  <Typography variant="body2" color="primary">
                    {truncateHash(transactionHash)}
                  </Typography>
                  <InfoOutlinedIcon sx={{ fontSize: 16, ml: 0.5 }} />
                </Link>
              </Tooltip>
            </Box>
          </Box>
        )}
      </CardContent>
      <CardActions sx={{ justifyContent: 'center', p: 1 }}>
        <Button
          variant="contained"
          color="primary"
          fullWidth
          size="small"
          onClick={() => onPurchase(item)}
          disabled={isPurchased}
          sx={{
            bgcolor: item.color,
            color: '#fff',
            '&:hover': {
              bgcolor: theme.palette.augmentColor({ color: { main: item.color } }).dark
            }
          }}
        >
          {isPurchased ? 'Purchased' : 'Purchase'}
        </Button>
      </CardActions>
    </Card>
  );
}

export default RankItem;