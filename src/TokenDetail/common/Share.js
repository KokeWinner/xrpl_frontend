import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import {
  FacebookShareButton,
  TwitterShareButton,
  LinkedinShareButton,
  WhatsappShareButton,
  RedditShareButton,
  TelegramShareButton,
  VKShareButton,
  WeiboShareButton,
  PinterestShareButton,
  TumblrShareButton,
  EmailShareButton
} from 'react-share';
import {
  FacebookIcon,
  TwitterIcon,
  LinkedinIcon,
  WhatsappIcon,
  RedditIcon,
  TelegramIcon,
  VKIcon,
  WeiboIcon,
  PinterestIcon,
  TumblrIcon,
  EmailIcon
} from 'react-share';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import {
  styled,
  useTheme,
  useMediaQuery,
  Avatar,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Link,
  Stack,
  Tooltip,
  Typography
} from '@mui/material';
import { Share as ShareIcon, Close as CloseIcon } from '@mui/icons-material';
import { useContext } from 'react';
import { AppContext } from 'src/AppContext';
import { useSelector } from 'react-redux';
import { selectActiveFiatCurrency, selectMetrics } from 'src/redux/statusSlice';
import { Icon } from '@iconify/react';
import copyIcon from '@iconify/icons-fad/copy';
import { fNumber } from 'src/utils/formatNumber';
import { currencySymbols } from 'src/utils/constants';

const ShareDialog = styled(Dialog)(({ theme }) => ({
  backdropFilter: 'blur(1px)',
  WebkitBackdropFilter: 'blur(1px)',
  '& .MuiDialogContent-root': {
    padding: theme.spacing(2)
  },
  '& .MuiDialogActions-root': {
    padding: theme.spacing(1)
  },
  // Add mobile-specific styles here
  '@media (max-width: 600px)': {
    '& .MuiDialogContent-root': {
      padding: theme.spacing(1)
    }
  }
}));

const ShareDialogTitle = (props) => {
  const { children, onClose, ...other } = props;

  return (
    <DialogTitle sx={{ m: 0, p: 2 }} {...other}>
      {children}
      {onClose ? (
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500]
          }}
        >
          <CloseIcon />
        </IconButton>
      ) : null}
    </DialogTitle>
  );
};

ShareDialogTitle.propTypes = {
  children: PropTypes.node,
  onClose: PropTypes.func.isRequired
};

export default function Share({ token }) {
  const theme = useTheme();
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
  const metrics = useSelector(selectMetrics);
  const activeFiatCurrency = useSelector(selectActiveFiatCurrency);
  const { accountProfile, openSnackbar, darkMode } = useContext(AppContext);

  const [open, setOpen] = useState(false);

  const { name, ext, md5, exch } = token;

  let user = token.user;
  if (!user) user = name;

  const imgUrl = `https://s1.xrpl.to/token/${md5}`;
  const title = `${user} price today: ${name} to ${activeFiatCurrency} conversion, live rates, trading volume, historical data, and interactive chart`;
  const desc = `Access up-to-date ${user} prices, ${name} market cap, trading pairs, interactive charts, and comprehensive data from the leading XRP Ledger token price-tracking platform.`;
  const url =
    typeof window !== 'undefined' && window.location.href
      ? window.location.href
      : '';

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <IconButton
        sx={{
          '& .MuiChip-icon': {
            color: '#F6B87E'
          },
          borderRadius: '4px',
          border: `1px solid ${darkMode ? '#616161' : '#bdbdbd'}`
        }}
        onClick={handleClickOpen}
      >
        <ShareIcon fontSize="small" />
      </IconButton>

      <ShareDialog
        fullScreen={fullScreen}
        onClose={handleClose}
        aria-labelledby="customized-dialog-title"
        open={open}
        sx={{ zIndex: 1302 }}
      >
        <ShareDialogTitle onClose={handleClose}>
        
        </ShareDialogTitle>
        <DialogContent>
          <Stack alignItems="center">
            <Avatar
              alt={`${user}${name} Logo`}
              src={imgUrl}
              sx={{ width: 64, height: 64, mt: 2 }}
            />

            <Typography
              variant="desc"
              sx={{ color: darkMode ? '#007B55' : '#5569ff' }}
            >
              {user} {name}
            </Typography>
            <Typography
              variant="desc"
              sx={{
                mt: 2,
                maxWidth: '100%',
                overflowWrap: 'break-word',
                textAlign: 'center'
              }}
            >
              Spread the word: Share with your friends and network
            </Typography>
            <Typography variant="subtitle1" sx={{ mt: 1, mb: 2 }}>
              The current price of {user} {name} is{' '}
              {currencySymbols[activeFiatCurrency]}{' '}
              {fNumber(exch / metrics[activeFiatCurrency])}!
            </Typography>
            <Stack
              direction="row"
              spacing={2}
              sx={{ flexWrap: 'wrap', justifyContent: 'center' }}
            >
              <TwitterShareButton title={title} url={url} hashtag={'#'}>
                <TwitterIcon size={36} round />
              </TwitterShareButton>

              <FacebookShareButton
                url={url}
                quote={title}
                hashtag={'#'}
                description={desc}
              >
                <FacebookIcon size={36} round />
              </FacebookShareButton>

              <VKShareButton url={url} title={title} image={imgUrl}>
                <VKIcon size={36} round />
              </VKShareButton>

              <LinkedinShareButton url={url} title={title} description={desc}>
                <LinkedinIcon size={36} round />
              </LinkedinShareButton>

              <RedditShareButton url={url} title={title}>
                <RedditIcon size={36} round />
              </RedditShareButton>

              <WhatsappShareButton url={url} title={title} separator=":: ">
                <WhatsappIcon size={36} round />
              </WhatsappShareButton>

              <TelegramShareButton url={url} title={title}>
                <TelegramIcon size={36} round />
              </TelegramShareButton>

              <WeiboShareButton url={url} title={title}>
                <WeiboIcon size={36} round />
              </WeiboShareButton>

              <PinterestShareButton url={url} media={imgUrl} description={desc}>
                <PinterestIcon size={36} round />
              </PinterestShareButton>

              <EmailShareButton
                subject={title}
                body={`Check out this link: ${url}`}
              >
                <EmailIcon size={36} round />
              </EmailShareButton>
            </Stack>
            <Stack direction="row" alignItems="center">
              <Link
                underline="none"
                color="inherit"
                target="_blank"
                href={url}
                rel="noreferrer noopener nofollow"
              >
                {url}
              </Link>
              <CopyToClipboard
                text={url}
                onCopy={() => openSnackbar('Copied!', 'success')}
              >
                <Tooltip title={'Click to copy'}>
                  <IconButton>
                    <Icon icon={copyIcon} />
                  </IconButton>
                </Tooltip>
              </CopyToClipboard>
            </Stack>
          </Stack>
        </DialogContent>
      </ShareDialog>
    </>
  );
}
