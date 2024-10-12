import { useContext, useState } from "react";
import { styled, Box, CardMedia, Typography, Card, CardContent, Skeleton, Chip } from '@mui/material';
import { AppContext } from "src/AppContext";
import LeaderboardOutlinedIcon from '@mui/icons-material/LeaderboardOutlined';
import { fIntNumber } from 'src/utils/formatNumber';

const CardWrapper = styled(Card)(
    ({ theme }) => `
        border-radius: 8px;
        padding: 0px;
        cursor: pointer;
        overflow: hidden;
        height: 60px;
        width: 100%;
  `
);

export default function ChatCollectionCard({ collectionData, onSelect }) {
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
            <Box display="flex" height="100%">
                {loadingImg ? (
                    <Skeleton variant="rectangular" width={40} height="100%" />
                ) : (
                    <CardMedia
                        component="img"
                        image={imgUrl}
                        alt={name}
                        sx={{
                            width: '40px',
                            height: '100%',
                            objectFit: 'cover'
                        }}
                        onLoad={onImageLoaded}
                    />
                )}
                <CardContent sx={{ padding: '2px', flexGrow: 1, overflow: 'hidden' }}>
                    <Typography
                        variant="caption"
                        sx={{
                            fontSize: '0.5rem',
                            lineHeight: 1.1,
                            display: '-webkit-box',
                            WebkitLineClamp: 2,
                            WebkitBoxOrient: 'vertical',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                        }}
                    >
                        {name}
                    </Typography>
                    <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography variant="caption" sx={{ fontSize: '0.4rem', color: 'text.secondary' }}>
                            {collectionData.nftCount} item(s)
                        </Typography>
                        {collection.rarity_rank > 0 && (
                            <Chip
                                variant="outlined"
                                icon={<LeaderboardOutlinedIcon sx={{ width: '8px', height: '8px' }} />}
                                label={<Typography variant="caption" sx={{ fontSize: '0.4rem' }}>{fIntNumber(collection.rarity_rank)}</Typography>}
                                sx={{
                                    height: '12px',
                                    '& .MuiChip-label': { padding: '0 2px' }
                                }}
                            />
                        )}
                    </Box>
                </CardContent>
            </Box>
            <img src={imgUrl} style={{ display: 'none' }} onLoad={onImageLoaded} />
        </CardWrapper>
    );
}