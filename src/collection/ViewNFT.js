import React from 'react';
import { useRef, useState } from 'react';
import { FacebookShareButton, TwitterShareButton } from 'react-share';
import { FacebookIcon, TwitterIcon } from 'react-share';

// Material
import { useTheme } from '@mui/material/styles';
import {
  styled,
  useMediaQuery,
  Box,
  IconButton,
  Link,
  Popover,
  Stack,
  Tooltip,
  Typography
} from '@mui/material';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import ShareIcon from '@mui/icons-material/Share';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import EditIcon from '@mui/icons-material/Edit';
import VerifiedIcon from '@mui/icons-material/Verified';
import { alpha } from '@mui/material/styles';
import BlurOnIcon from '@mui/icons-material/BlurOn';

// Iconify
import { Icon } from '@iconify/react';

import infoFilled from '@iconify/icons-ep/info-filled';

// Utils
import { formatMonthYear } from 'src/utils/formatTime';
import { fNumber, fIntNumber, fPercent, fVolume } from 'src/utils/formatNumber';

// Context
import { useContext } from 'react';
import { AppContext } from 'src/AppContext';

// Components
import ExploreNFT from 'src/explore';
import SeeMoreTypography from 'src/components/SeeMoreTypography';
import Watch from 'src/components/Watch';

const IconCover = styled('div')(
  ({ theme }) => `
        width: 102px;
        height: 102px;
        margin-top: -56px;
        margin-bottom: 16px;
        @media (min-width: ${theme.breakpoints.values.sm}px) {
            width: 132px;
            height: 132px;
            margin-top: -86px;
        }
        @media (min-width: ${theme.breakpoints.values.md}px) {
            width: 192px;
            height: 192px;
            margin-top: -156px;
        }
        border: 6px solid ${theme.colors?.alpha.black[50]};
        border-radius: 10px;
        box-shadow: rgb(0 0 0 / 8%) 0px 5px 10px;
        background-color: ${theme.colors?.alpha.white[70]};
        position: relative;
        overflow: hidden;
    `
);

const IconWrapper = styled('div')(
  ({ theme }) => `
        box-sizing: border-box;
        display: inline-block;
        position: relative;
        width: 90px;
        height: 90px;
        @media (min-width: ${theme.breakpoints.values.sm}px) {
            width: 120px;
            height: 120px;
        }
        @media (min-width: ${theme.breakpoints.values.md}px) {
            width: 180px;
            height: 180px;
        }
        &:hover, &.Mui-focusVisible {
            z-index: 1;
            & .MuiImageBackdrop-root {
                opacity: 0.1;
            }
            & .MuiIconEditButton-root {
                opacity: 1;
            }
        }
  `
);

const IconImage = styled('img')(
  ({ theme }) => `
    position: absolute;
    inset: 0px;
    box-sizing: border-box;
    padding: 0px;
    border: none;
    margin: auto;
    display: block;
    width: 0px; height: 0px;
    min-width: 100%;
    max-width: 100%;
    min-height: 100%;
    max-height: 100%;
    object-fit: cover;
    border-radius: 0px;
  `
);

const ImageBackdrop = styled('span')(({ theme }) => ({
  position: 'absolute',
  left: 0,
  right: 0,
  top: 0,
  bottom: 0,
  backgroundColor: theme.palette.common.black,
  opacity: 0,
  transition: theme.transitions.create('opacity')
}));

const CardOverlay = styled('div')(
  ({ theme }) => `
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    position: absolute;
    inset: 0;
`
);

const GlassBox = styled(Box)(({ theme }) => ({
  backdropFilter: 'blur(10px)',
  backgroundColor: alpha(theme.palette.background.paper, 0.8),
  borderRadius: theme.shape.borderRadius,
  padding: theme.spacing(3),
  boxShadow: theme.shadows[10]
}));

function truncate(str, n) {
  if (!str) return '';
  //return (str.length > n) ? str.substr(0, n-1) + '&hellip;' : str;
  return str.length > n ? str.substr(0, n - 1) + ' ...' : str;
}

export default function ViewNFT({ collection }) {
  const anchorRef = useRef(null);
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  const { accountProfile, openSnackbar } = useContext(AppContext);
  const accountLogin = accountProfile?.account;
  const accountToken = accountProfile?.token;

  const [openShare, setOpenShare] = useState(false);

  // "collection": {
  //     "_id": "6310c27cf81fe46884ef89ba",
  //     "account": "rpcmZhxthTeWoLMpro5dfRAsAmwZCrsxGK",
  //     "name": "collection1",
  //     "slug": "collection-1",
  //     "description": "",
  //     "logoImage": "1662042748001_12e8a38273134f0e87f1039958d5b132.png",
  //     "featuredImage": "1662042748001_70910cc4c6134845bf84cf262e696d05.png",
  //     "bannerImage": "1662042748002_b32b442dea454998aa29ab61c8fa0887.jpg",
  //     "created": 1662042748016,
  //     "creator": "xrpnft.com",
  //     "uuid": "bc80f29343bb43f09f73d8e5e290ee4a"
  // }
  const {
    account,
    accountName,
    name,
    slug,
    items,
    type,
    description,
    logoImage,
    featuredImage,
    bannerImage,
    costs,
    extra,
    minter,
    verified,
    created,
    volume,
    totalVolume,
    floor,
    totalVol24h
  } = collection;

  const floorPrice = floor?.amount || 0;
  let volume1 = fVolume(volume || 0);
  let volume2 = fVolume(totalVolume || 0);

  const shareUrl = `https://xrpnft.com/collection/${slug}`;
  const shareTitle = name;
  const shareDesc = description || '';

  const handleOpenShare = () => {
    setOpenShare(true);
  };

  const handleCloseShare = () => {
    setOpenShare(false);
  };

  return (
    <GlassBox>
      <Popover
        open={openShare}
        onClose={handleCloseShare}
        anchorEl={anchorRef.current}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        PaperProps={{
          sx: {
            // mt: 1.5,
            // ml: 0.5,
            // overflow: 'inherit',
            // boxShadow: (theme) => theme.customShadows.z20,
            // border: (theme) => `solid 1px ${alpha('#919EAB', 0.08)}`,
            // width: 'auto',
          }
        }}
      >
        <Stack direction="row" spacing={2} sx={{ pt: 1.5, pl: 1, pr: 1, pb: 1 }}>
          <FacebookShareButton
            url={shareUrl}
            quote={shareTitle}
            hashtag={'#'}
            description={shareDesc}
            onClick={handleCloseShare}
          >
            <FacebookIcon size={24} round />
          </FacebookShareButton>
          <TwitterShareButton
            title={shareTitle}
            url={shareUrl}
            hashtag={'#'}
            onClick={handleCloseShare}
          >
            <TwitterIcon size={24} round />
          </TwitterShareButton>
        </Stack>
      </Popover>
      <IconCover>
        <IconWrapper>
          <IconImage src={`https://s1.xrpnft.com/collection/${logoImage}`} />
          {accountLogin === collection.account && (
            <Link href={`/collection/${slug}/edit`} underline="none">
              <CardOverlay>
                <EditIcon
                  className="MuiIconEditButton-root"
                  // color='primary'
                  fontSize="large"
                  sx={{ opacity: 0, zIndex: 1 }}
                />
              </CardOverlay>
              <ImageBackdrop className="MuiImageBackdrop-root" />
            </Link>
          )}
        </IconWrapper>
      </IconCover>
      <Stack
        direction={fullScreen ? 'column' : 'row'}
        spacing={2}
        justifyContent="space-between"
        sx={{ mt: 1, mb: 1 }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <Typography variant="h4" fontWeight="bold">
            {name}
          </Typography>
          {verified === 'yes' && (
            <Tooltip title="Verified">
              <VerifiedIcon style={{ color: '#4589ff' }} />
            </Tooltip>
          )}
        </Stack>

        <Stack direction="row" alignItems="center" spacing={1}>
          {accountLogin === collection.account && (
            <Link href={`/collection/${slug}/edit`} underline="none">
              <Tooltip title="Edit your collection">
                <IconButton size="medium" sx={{ padding: 1 }}>
                  <EditIcon />
                </IconButton>
              </Tooltip>
            </Link>
          )}

          <Tooltip title="Add to watchlist">
            {/*<IconButton size='medium' sx={{ padding: 1 }}
                            onClick={() => {
                            }}
                        >
                            <StarBorderIcon />
                        </IconButton>*/}
            <Watch collection={collection} />
          </Tooltip>

          <Tooltip title="Share">
            <IconButton size="medium" sx={{ padding: 1 }} ref={anchorRef} onClick={handleOpenShare}>
              <ShareIcon />
            </IconButton>
          </Tooltip>

          <IconButton size="medium" sx={{ padding: 1 }} onClick={() => {}}>
            <MoreHorizIcon />
          </IconButton>

          <Tooltip title="Explore">
            <IconButton size="medium" sx={{ padding: 1 }}>
              <BlurOnIcon />
            </IconButton>
          </Tooltip>
        </Stack>
      </Stack>

      <Stack direction="row" sx={{ mt: 2, mb: 3 }} spacing={1}>
        <Typography variant="s5" style={{ wordBreak: 'break-word' }}>
          By&nbsp;
          <Link
            color="inherit"
            // target="_blank"
            href={`/account/${account}`}
            // rel="noreferrer noopener nofollow"
          >
            <Typography variant="s5" color="primary">
              {accountName || account.slice(0, 4) + '...' + account.slice(-4)}
            </Typography>
          </Link>
          <Typography variant="s10">
            &nbsp;&nbsp;·&nbsp;Created{' '}
            <Typography variant="s3">{formatMonthYear(created)}</Typography>
          </Typography>
        </Typography>
      </Stack>

      <SeeMoreTypography variant="d3" text={description} />

      {/* {description &&
                <Typography variant="d3" style={{ wordBreak: "break-word" }}>{description}</Typography>
            } */}

      <Box
        sx={{
          display: 'flex',
          gap: 2,
          py: 3,
          overflow: 'auto',
          width: '100%',
          '& > *': {
            scrollSnapAlign: 'center'
          },
          '::-webkit-scrollbar': { display: 'none' }
        }}
      >
        <Stack
          direction="row"
          width="100%"
          spacing={{ xs: 3, sm: 5 }}
          alignItems="flex-start"
          justifyContent={{ xs: 'space-around', sm: 'space-between' }}
        >
          {[
            { label: 'Floor Price', value: fNumber(floorPrice), icon: '✕' },
            { label: '24h Vol', value: fNumber(totalVol24h), icon: '✕' },
            { label: 'All Vol', value: volume2, icon: '✕', tooltip: true },
            { label: 'Supply', value: items },
            { label: 'Owners', value: extra.owners }
          ].map((item, index) => (
            <Stack key={index} alignItems="center" sx={{ minWidth: 100 }}>
              <Typography variant="h6" fontWeight="bold" noWrap>
                {item.icon && <span style={{ marginRight: '4px' }}>{item.icon}</span>}
                {item.value}
              </Typography>
              <Typography variant="body2" color="text.secondary" noWrap>
                {item.label}
              </Typography>
              {item.tooltip && (
                <Tooltip title={`Volume on XRPNFT: ${volume1}`}>
                  <Icon icon={infoFilled} style={{ marginTop: '4px' }} />
                </Tooltip>
              )}
            </Stack>
          ))}
        </Stack>
      </Box>

      <ExploreNFT collection={collection} />

      {/* <Button component={Link} href="/collection/create" variant="contained" color="primary">
                Create a collection
            </Button> */}
      {/* <Stack sx={{mt:5, minHeight: '50vh'}}>
            </Stack> */}
    </GlassBox>
  );
}
