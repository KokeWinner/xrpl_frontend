import React from 'react';
import { Card, CardMedia, CardContent, Typography, CardActionArea } from '@mui/material';

const XRPNFT_IMAGE_BASE_URL = 'https://s2.xrpnft.com/d1/';

function ChatNFTCard({ nft, onSelect }) {
  const handleSelect = () => {
    if (onSelect) {
      const nftName = nft.name || nft.meta?.name || 'Unnamed NFT';
      const nftLink = `[NFT: ${nftName} (${nft.NFTokenID})]`;
      onSelect(nftLink);
    }
  };

  // Determine the image URL
  let imageUrl = null;
  if (nft.files && nft.files.length > 0) {
    const file = nft.files[0];
    if (file.thumbnail && file.thumbnail.small) {
      imageUrl = XRPNFT_IMAGE_BASE_URL + file.thumbnail.small;
    } else if (file.convertedFile) {
      imageUrl = XRPNFT_IMAGE_BASE_URL + file.convertedFile;
    } else if (file.dfile) {
      imageUrl = XRPNFT_IMAGE_BASE_URL + file.dfile;
    }
  }

  return (
    <Card onClick={handleSelect} sx={{ cursor: 'pointer' }}>
      <CardActionArea>
        {imageUrl && (
          <CardMedia
            component="img"
            height="140"
            image={imageUrl}
            alt={nft.name || nft.meta?.name || 'Unnamed NFT'}
          />
        )}
        <CardContent>
          <Typography gutterBottom variant="h6" component="div" noWrap>
            {nft.name || nft.meta?.name || 'Unnamed NFT'}
          </Typography>
        </CardContent>
      </CardActionArea>
    </Card>
  );
}

export default ChatNFTCard;
