import { normalizeCurrencyCodeXummImpl } from "src/utils/normalizers";
import { useContext, useState } from "react";
import {
    styled, useTheme,
    Box,
    CardMedia,
    Chip,
    Link,
    Stack,
    Tooltip,
    Typography,
    Skeleton,
    Card,
    CardContent
} from '@mui/material';
import SportsScoreIcon from '@mui/icons-material/SportsScore';
import LeaderboardOutlinedIcon from '@mui/icons-material/LeaderboardOutlined';
import CloseIcon from '@mui/icons-material/Close';

import { getMinterName } from "src/utils/constants";
import { fNumber, fIntNumber } from 'src/utils/formatNumber';
import { getNftCoverUrl } from "src/utils/parse/utils";
import Label from './Label';
import { AppContext } from "src/AppContext";
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
    '&:hover': {
        transform: 'translateY(-5px)',
        boxShadow: '0 12px 40px 0 rgba(31, 38, 135, 0.5)',
    },
}));

export default function NFTCard({ nft, handleRemove }) {
    const theme = useTheme();
    const { accountProfile } = useContext(AppContext);
    const isAdmin = accountProfile?.admin;

    const [loadingImg, setLoadingImg] = useState(true);

    const {
        uuid,
        account,
        cost,
        costb,
        meta,
        NFTokenID,
        destination,
        rarity_rank,
        updateEvent,
    } = nft;

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

    return (
        <Link href={`/nft/${NFTokenID}`} underline='none' sx={{ position: 'relative' }}>
            <CardWrapper sx={{ margin: 'auto', maxWidth: 280, aspectRatio: '9 / 13' }}>
                {isAdmin && (
                    <CloseIcon
                        sx={{ position: 'absolute', top: 8, right: 8, zIndex: 1500, color: theme.palette.grey[300] }}
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
                <CardMedia
                    component={loadingImg ? Skeleton : 'img'}
                    image={imgUrl}
                    loading={loadingImg.toString()}
                    alt={'NFT' + uuid}
                    sx={{ width: '100%', height: '75%', objectFit: 'cover', borderRadius: '16px 16px 0 0' }}
                />
                <img src={imgUrl} style={{ display: 'none' }} onLoad={onImageLoaded} />

                <CardContent
                    sx={{ 
                        padding: 1.5,
                        background: theme.palette.background.default,
                        height: '25%',
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
                        {cost && (
                            <Typography variant="caption" color="text.secondary" noWrap>
                                {cost.currency === "XRP" ? `✕ ${fNumber(cost.amount)}` : `${fNumber(cost.amount)} ${normalizeCurrencyCodeXummImpl(cost.currency)}`}
                            </Typography>
                        )}
                    </Box>
                    <Stack direction="row" alignItems='center' justifyContent='space-between'>
                        {destination && getMinterName(account) ? (
                            <Tooltip title={`Sold & Transfer`}>
                                <SportsScoreIcon color="primary" fontSize="small" />
                            </Tooltip>
                        ) : (
                            <Typography variant="caption" color="text.secondary">
                                {costb ? `Offer ✕ ${fNumber(costb.amount)}` : 'No Offer'}
                            </Typography>
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
        </Link>
    );
}
