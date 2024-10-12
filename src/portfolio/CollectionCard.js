import { normalizeCurrencyCodeXummImpl } from "src/utils/normalizers";
import { useContext, useState } from "react";

// Material
import {
    styled, useTheme,
    Box,
    CardMedia,
    Chip,
    Stack,
    Tooltip,
    Typography,
    Skeleton,
    Card,
    Grid,
    CardContent
} from '@mui/material';
import SportsScoreIcon from '@mui/icons-material/SportsScore';
import LeaderboardOutlinedIcon from '@mui/icons-material/LeaderboardOutlined';
import CloseIcon from '@mui/icons-material/Close';

// Iconify
import { Icon } from '@iconify/react';

// Utils
import { getMinterName } from "src/utils/constants";
import { fNumber, fIntNumber } from 'src/utils/formatNumber';

// Components
import Label from './Label';
import { AppContext } from "src/AppContext";
import { useRouter } from "next/router";

import { alpha } from '@mui/material/styles';

const CardWrapper = styled(Card)(
    ({ theme }) => `
        border-radius: 16px;
        backdrop-filter: blur(20px);
        background-color: ${alpha(theme.palette.background.paper, 0.8)};
        box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.37);
        border: 1px solid rgba(255, 255, 255, 0.18);
        padding: 0;
        cursor: pointer;
        transition: all 0.3s ease-in-out;
        overflow: hidden;
        
        &:hover {
            transform: translateY(-5px);
            box-shadow: 0 12px 40px 0 rgba(31, 38, 135, 0.5);
        }
  `
);

export default function CollectionCard({ collectionData, type, account, handleRemove }) {
    const theme = useTheme();
    const router = useRouter();
    const { accountProfile } = useContext(AppContext);
    const isAdmin = accountProfile?.admin;

    const [loadingImg, setLoadingImg] = useState(true);
    const [colors, setColors] = useState([]);

    console.log('CollectionCard - collectionData:', collectionData);
    console.log('CollectionCard - collection:', collectionData.collection);

    const collection = collectionData.collection;
    if (!collection) return null;

    const {
        id: uuid,
        cost,
        costb,
        meta,
        dfile,
        NFTokenID,
        destination,
        rarity,
        rarity_rank
    } = collection;

    console.log('CollectionCard - Destructured collection properties:', {
        uuid,
        cost,
        costb,
        meta,
        dfile,
        NFTokenID,
        destination,
        rarity,
        rarity_rank
    });

    const isSold = false;
    const imgUrl = `https://s1.xrpnft.com/collection/${collection.logoImage}`;
    const isVideo = false;

    const name = collection.name || 'No Name';

    const getColors = colors => {
        setColors(c => [...c, ...colors]);
    }

    const onImageLoaded = () => {
        setLoadingImg(false);
    }

    const handleRemoveNft = (e) => {
        e.preventDefault();

        if (!isAdmin) return;

        if (!confirm(`Are you sure you want to remove "${name}"?`)) {
            return;
        }

        handleRemove(NFTokenID);
    }

    const collectionType = type.charAt(0).toUpperCase() + type.slice(1);

    const redirectToDetail = () => {
        router.push(`/profile/${account}/collection${collectionType}/${collectionData.collection.id}`);
    }

    return (
        <Stack onClick={redirectToDetail}>
            <CardWrapper
                sx={{
                    marginLeft: 'auto',
                    marginRight: 'auto',
                    width: '100%',
                    maxWidth: 280,
                    aspectRatio: '9 / 13', // Changed from '9 / 15' to make the card shorter
                }}
            >
                {isAdmin &&
                    <CloseIcon
                        sx={{
                            position: 'absolute',
                            top: 0,
                            right: 0,
                            zIndex: 1500
                        }}
                        onClick={(e) => handleRemoveNft(e)}
                    />
                }
                {isSold && (
                    <Label
                        variant="filled"
                        color={(isSold && 'error') || 'info'}
                        sx={{
                            zIndex: 9,
                            top: 24,
                            right: 24,
                            position: 'absolute',
                            textTransform: 'uppercase'
                        }}
                    >
                        SOLD
                    </Label>
                )}
                <CardMedia
                    component={
                        loadingImg ? () =>
                            <Skeleton
                                variant='rectangular'
                                sx={{
                                    width: '100%',
                                    height: '75%', // Increased back to 75% as we're reducing overall card height
                                    borderRadius: '16px 16px 0 0',
                                }}
                            /> :
                            isVideo ? 'video' : 'img'}
                    image={imgUrl}
                    loading={loadingImg.toString()}
                    alt={'NFT' + uuid}
                    sx={{
                        width: '100%',
                        height: '75%', // Increased back to 75%
                        maxWidth: 280,
                        objectFit: 'cover',
                        borderRadius: '16px 16px 0 0',
                    }}
                />
                <img src={imgUrl}
                    style={{ display: 'none' }}
                    onLoad={onImageLoaded} />
                {
                    isVideo &&
                    <video src={imgUrl}
                        style={{ display: 'none' }}
                        onCanPlay={onImageLoaded}
                    />
                }
                <CardContent
                    sx={{ 
                        padding: 1.5,
                        background: theme.palette.background.default,
                        height: '25%', // Reduced from 30% to 25%
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
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
                            }}
                        >
                            {name}
                        </Typography>
                        <Typography variant='caption' color="text.secondary">
                            {collectionData.nftCount} item(s)
                        </Typography>
                    </Box>
                    <Stack direction="row" alignItems='center' justifyContent='space-between'>
                        {destination && getMinterName(account) ? (
                            <Tooltip title={`Sold & Transfer`}>
                                <SportsScoreIcon color="primary" fontSize="small" />
                            </Tooltip>
                        ) : (
                            <Box /> // Empty box to maintain layout
                        )}
                        {rarity_rank > 0 &&
                            <Chip
                                variant="filled"
                                color="secondary"
                                icon={<LeaderboardOutlinedIcon sx={{ width: '14px' }} />}
                                label={<Typography variant="caption">{fIntNumber(rarity_rank)}</Typography>}
                                size="small"
                                sx={{
                                    height: '20px',
                                    '& .MuiChip-label': { px: 0.5 },
                                }}
                            />
                        }
                    </Stack>
                </CardContent>
            </CardWrapper>
        </Stack >
    );
};
