import { normalizeCurrencyCodeXummImpl } from "src/utils/normalizers";
import { useContext, useState } from "react";

// Material
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
    Grid,
    CardContent
} from '@mui/material';
// import FavoriteIcon from '@mui/icons-material/Favorite';
import SportsScoreIcon from '@mui/icons-material/SportsScore';
import LeaderboardOutlinedIcon from '@mui/icons-material/LeaderboardOutlined';
import CloseIcon from '@mui/icons-material/Close';

// Iconify
import { Icon } from '@iconify/react';

// import infoFilled from '@iconify/icons-ep/info-filled';

// Utils
import { getMinterName } from "src/utils/constants";
import { fNumber, fIntNumber } from 'src/utils/formatNumber';
import { getNftCoverUrl } from 'src/utils/parse/utils';

// Components
// import FlagsContainer from 'src/components/Flags';
import Label from './Label';
import { AppContext } from "src/AppContext";

const CardWrapper = styled(Card)(
    ({ theme }) => `
        // box-shadow: 0px -0.5px 4px rgba(100, 100, 111, 0.9);
        // filter: drop-shadow(16px 16px 10px rgba(0,0,0,0.8));
        // filter: drop-shadow(0 0 0.2rem rgba(0,0,0,0.8));
        border-radius: 10px;
        backdrop-filter: blur(50px);
        // background: rgb(2, 0, 36);
        padding: 0px;
        // text-align: center;
        object-fit: cover;
        cursor: pointer;
        transition: width 1s ease-in-out, height .5s ease-in-out !important;
        -webkit-tap-highlight-color: transparent;
        overflow: hidden;
        padding-bottom: 5px;
  `
);

export default function CollectionCard({ collectionData, type, account, handleRemove }) {
    const collection = collectionData.collection;
    //console.log(`CollectionCard: ${JSON.stringify(collection)}`);
    const theme = useTheme();

    const { accountProfile } = useContext(AppContext);
    const isAdmin = accountProfile?.admin;

    // const [imgUrl, setImgUrl] = useState('');
    // const [loading, setLoading] = useState(false);

    // const [isLike, setIsLike] = useState(false);
    const [colors, setColors] = useState([]);
    

    // const like = () => setIsLike(!isLike);

    const {
        uuid,
        // name,
        // flag,
        //account,
        // minter,
        cost,
        costb,
        // issuer,
        // date,
        meta,
        dfile,
        NFTokenID,
        // URI,
        // status,
        destination,
        rarity,
        rarity_rank
    } = collection;

    const isSold = false;

    // const imgUrl = '/static/nft.png';
    const imgUrl = `https://s1.xrpnft.com/collection/${collection.logoImage}`//getNftCoverUrl(nft, 'small');//get..ImgUrl(nft, 300);

    const isVideo = /*meta?.video ? true : */false; // disabling for  now video as showing animated thumbnails

    const [loadingImg, setLoadingImg] = useState(true)

    const name = collection.name || 'No Name';

    const getColors = colors => {
        setColors(c => [...c, ...colors]);
    }

    const onImageLoaded = () => {
        setLoadingImg(false)
    }

    const handleRemoveNft = (e) => {
        e.preventDefault();

        if (!isAdmin) return;

        if (!confirm(`Are you sure you want to remove "${name}"?`)) {
            return;
        }

        handleRemove(NFTokenID);
    }

    const collectionType = type.charAt(0).toUpperCase() + type.slice(1)

    return (
        <Link href={`/account/${account}/collection${collectionType}/${collectionData.collection.id/*slug*/}`} underline='none' sx={{ position: 'relative' }}>
            <CardWrapper
                sx={{
                    marginLeft: 'auto',
                    marginRight: 'auto',
                    width: '100%',
                    maxWidth: 280,
                    // height: 250,
                    aspectRatio: '9 / 15',//9 / 14
                    // minHeight: 250,
                    // background: `radial-gradient(
                    //         circle,
                    //         rgba(255, 255, 255, 0.05) 0%,
                    //         ${colors[0]} 0%,
                    //         rgba(255, 255, 255, 0.05) 70%
                    //     )`,
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
                                // animation='wave'
                                sx={{
                                    width: '100%',
                                    height: '75%'
                                }}
                            /> :
                            isVideo ? 'video' : 'img'}
                    image={imgUrl}
                    loading={loadingImg.toString()}
                    alt={'NFT' + uuid}
                    // controls={isVideo}
                    // autoPlay={isVideo}
                    // loop={isVideo}
                    sx={{
                        width: '100%',
                        height: '75%',
                        maxWidth: 280,
                        // maxHeight: 250,
                        marginTop: 0,
                        // borderTopLeftRadius: 20,
                        // borderTopRightRadius: 20,
                        // borderBottomLeftRadius: 0,
                        // borderBottomRightRadius: 0,
                        objectFit: 'cover'
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
                {/* {isVideo ?
                    <CardMedia
                        component={isVideo ? 'video' : 'img'}
                        image={imgUrl}
                        alt={'NFT' + uuid}
                        controls={isVideo}
                        style={{
                            width: '100%',
                            maxWidth: 280,
                            maxHeight: 250,
                            marginTop: 0,
                            // borderTopLeftRadius: 20,
                            // borderTopRightRadius: 20,
                            // borderBottomLeftRadius: 0,
                            // borderBottomRightRadius: 0,
                            objectFit: 'cover'
                        }}
                    />
                    :
                    <ColorExtractor getColors={getColors}>
                        <img src={imgUrl}
                            onLoad={onImageLoaded}
                            style={{
                                width: '100%',
                                maxWidth: 280,
                                maxHeight: 250,
                                marginTop: 0,
                                // borderTopLeftRadius: 20,
                                // borderTopRightRadius: 20,
                                // borderBottomLeftRadius: 0,
                                // borderBottomRightRadius: 0,
                                objectFit: 'cover'
                            }}
                        />
                    </ColorExtractor>
                } */}
                {/* {
                  !loading
                    ?
                    <CardMedia
                        component='img'
                        image={imgUrl}
                        alt={imgUrl}
                        style={{
                            width: 260,
                            height: 220,
                            marginTop: 4,
                            borderRadius:20
                        }}
                    />
                    :
                    <Skeleton
                        animation='wave'
                        variant='rectangular'
                        style={{
                            width: 260,
                            height: 220,
                            marginTop: 4,
                            borderRadius:20
                        }}
                    />
                } */}
                {/* <Stack direction="row" justifyContent='space-between' sx={{mt:1}}>
                    <Typography variant='s2'>{type.toUpperCase()}</Typography>
                    <Typography variant='s2'>Price</Typography>
                </Stack> */}

                {/* <Stack direction="row" > */}
                {/* <Stack direction="row" sx={{ mt: 1, pl: 2, pr: 2 }}> */}
                <CardContent
                    sx={{ padding: 0 }}
                >
                    <Box display={'flex'} flexDirection='column' justifyContent={'space-evenly'} px={1}>
                        {name.length > 20 ?
                            <Box display='flex'>
                                <Typography
                                    variant="s15"
                                    textOverflow='ellipsis'
                                    overflow='hidden'
                                    whiteSpace='nowrap'
                                    sx={{mt:0.5, mb:0.4}}
                                >
                                    {name.slice(0, -5)}
                                </Typography>
                                <Typography
                                    variant="s15"
                                    sx={{mt:0.5, mb:0.4, width: 45}}
                                >
                                    {name.slice(-5)}
                                </Typography>
                            </Box>
                            :
                            <Typography
                                variant="s15"
                                sx={{mt:0.5, mb:0.4}}
                            >
                                {name}
                            </Typography>
                        }
                        {destination && getMinterName(account) ? (
                            // <Typography variant='s2'>TRANSFER</Typography>
                            <Stack direction="row" alignItems='center' justifyContent='space-between' sx={{mt:0, pl:0, pr:0}}>
                                <Tooltip title={`Sold & Transfer`}>
                                    <SportsScoreIcon />
                                </Tooltip>

                                {rarity_rank > 0 &&
                                    <Chip
                                        variant="outlined"
                                        // size="small"
                                        icon={<LeaderboardOutlinedIcon sx={{width: '11px'}} />}
                                        label={<Typography variant="s12">{fIntNumber(rarity_rank)}</Typography>}
                                        sx={{
                                            height: '18px',
                                            pt: 0
                                        }}
                                    />
                                }
                            </Stack>
                        ) : (
                            <Grid container alignItems='center' spacing={0.1}>
                                <Grid item xs={12}>
                                    <Stack direction="row" alignItems='center' justifyContent='space-between' sx={{mt:0, pl:0, pr:0}}>
                                        <Typography variant='s7'>{collectionData.nftCount} item(s)</Typography>

                                        {rarity_rank > 0 &&
                                            <Chip
                                                variant="outlined"
                                                // size="small"
                                                icon={<LeaderboardOutlinedIcon sx={{width: '11px'}} />}
                                                label={<Typography variant="s12">{fIntNumber(rarity_rank)}</Typography>}
                                                sx={{
                                                    height: '18px',
                                                    pt: 0
                                                }}
                                            />
                                        }
                                    </Stack>
                                </Grid>
                                <Grid item xs={12}>
                                       <Typography variant='s7'>{collectionData.nftsForSale} listed</Typography>
                                </Grid>
                            </Grid>
                            // <Stack alignItems="left">
                            //     {cost ? (
                            //         cost.currency === "XRP" ?
                            //             <Stack direction="row" spacing={0.5} alignItems="center">
                            //                 <Typography variant='s3' pt={0.8}><Icon icon={rippleSolid} width="16" height="16" /></Typography>
                            //                 <Typography variant='s3'>{fNumber(cost.amount)}</Typography>
                            //             </Stack>
                            //             :
                            //             <Typography variant='s3'>{fNumber(cost.amount)} {normalizeCurrencyCodeXummImpl(cost.currency)}</Typography>

                            //     ) : (
                            //         <Typography variant='s8'>- - -</Typography>
                            //     )}

                            //     {costb &&
                            //         <>
                            //             {costb.currency === "XRP" ?
                            //                 <Stack direction="row" spacing={0.5} alignItems="center">
                            //                     <Typography variant='s7'>Offer</Typography>
                            //                     <Icon icon={rippleSolid} color="#00AB55" width="12" height="12" />
                            //                     <Typography variant='s2' color="#00AB55">{fNumber(costb.amount)}</Typography>
                            //                 </Stack>
                            //                 :
                            //                 <Stack direction="row" spacing={0.5} alignItems="center">
                            //                     <Typography variant='s7'>Offer</Typography>
                            //                     <Typography variant='s2' color="#00AB55">{fNumber(costb.amount)} {normalizeCurrencyCodeXummImpl(costb.currency)}</Typography>
                            //                 </Stack>
                            //             }
                            //         </>
                            //     }
                            // </Stack>
                        )}
                    </Box>
                </CardContent>
                {/* <Divider sx={{mt:0.8, mb:0.3}}/>
                <Stack direction="row" justifyContent='space-between' sx={{mt:1, pl:1, pr:1}}>
                    <FlagsContainer Flags={flag} />
                    <FavoriteIcon />
                </Stack> */}

            </CardWrapper>
        </Link >
    );
};
