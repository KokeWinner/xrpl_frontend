import { alpha, Button, Card, Link, Stack, Typography, Box, useTheme } from '@mui/material';
import { Icon } from '@iconify/react';
import linkExternal from '@iconify/icons-charm/link-external';
import { useCallback } from 'react';

const WalletCard = ({ name, link, imgUrl }) => {
  const theme = useTheme();

  // Handler to open the link with useCallback for performance optimization
  const handleLinkClick = useCallback((url) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  }, []);

  return (
    <Card sx={{
      p: 3,
      borderRadius: theme.shape.borderRadiusMd,
      boxShadow: 'none',
      border: 1,
      borderColor: 'divider',
      '&:hover': {
        boxShadow: theme.shadows[3]
      }
    }}>
      <Stack spacing={2} alignItems='center'>
        <Box
          component="img"
          alt={'wallet'}
          src={imgUrl}
          sx={{ height: 56, transition: 'transform .2s', '&:hover': { transform: 'scale(1.05)' } }}
        />
        <Typography variant="subtitle2" fontWeight="bold">
          {name}
        </Typography>
        <Button startIcon={<Icon icon={linkExternal} />} size="small" variant="outlined" onClick={() => handleLinkClick(link)} sx={{ mt: 1 }}>
          Visit Website
        </Button>
      </Stack>
    </Card>
  );
};

export default WalletCard;
