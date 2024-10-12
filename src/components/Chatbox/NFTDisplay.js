import React, { useEffect, useState, useContext } from 'react';
import {
  Stack,
  styled,
  Paper,
  Typography,
  Tooltip,
  Box,
  Button,
  useTheme,
  tooltipClasses,
  Divider,
  Backdrop
} from '@mui/material';
import { Send as SendIcon, LocalOffer as LocalOfferIcon } from '@mui/icons-material';
import axios from 'axios';
import { AppContext } from 'src/AppContext';
import CreateOfferDialog from 'src/nft/CreateOfferDialog';
import { NFToken } from 'src/utils/constants';
import TransferDialog from 'src/nft/TransferDialog';
import BurnNFT from 'src/nft/BurnNFT';
import ConfirmAcceptOfferDialog from 'src/nft/ConfirmAcceptOfferDialog';
import SelectPriceDialog from 'src/nft/SelectPriceDialog';
import { useDispatch } from 'react-redux';
import { isInstalled, submitTransaction } from '@gemwallet/api';
import sdk from '@crossmarkio/sdk';
import { updateProcess, updateTxHash } from 'src/redux/transactionSlice';
import QRDialog from 'src/components/QRDialog';
import { normalizeAmount } from 'src/utils/normalizers';
import { ProgressBar } from 'react-loader-spinner';

const StyledTooltip = styled(({ className, ...props }) => (
  <Tooltip {...props} classes={{ popper: className }} />
))(({ theme }) => ({
  [`& .${tooltipClasses.tooltip}`]: {
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.primary,
    maxWidth: 350,
    fontSize: theme.typography.pxToRem(12),
    // border: '1px solid #dadde9'
  }
}));

function getCostFromOffers(nftOwner, offers, isSellOffer) {
  let xrpCost = null;
  let noXrpCost = null;
  for (const offer of offers) {
    const { amount, destination, flags, nft_offer_index, owner } = offer;

    let validOffer = true;

    if (destination) validOffer = false;

    if (isSellOffer && nftOwner !== owner) validOffer = false;

    if (!validOffer) continue;

    const cost = normalizeAmount(amount);

    cost.offer = offer;

    if (cost.currency === 'XRP') {
      if (xrpCost) {
        if (isSellOffer) {
          if (cost.amount < xrpCost.amount) xrpCost = cost;
        } else {
          if (cost.amount > xrpCost.amount) xrpCost = cost;
        }
      } else {
        xrpCost = cost;
      }
    } else {
      if (!noXrpCost) {
        noXrpCost = cost;
      }
    }
  }

  return xrpCost || noXrpCost;
}

const NFTDisplay = ({ nftLink }) => {
  const BASE_URL = 'https://api.xrpnft.com/api';
  const IMAGE_BASE_URL = 'https://s2.xrpnft.com/d1/'; // Base URL for images
  const theme = useTheme();
  const dispatch = useDispatch();
  const { accountProfile, openSnackbar } = useContext(AppContext);
  const accountLogin = accountProfile?.account;
  const accountToken = accountProfile?.token;

  const [pageLoading, setPageLoading] = useState(false);
  const [nft, setNFT] = useState(null);
  const [openCreateOffer, setOpenCreateOffer] = useState(false);
  const [isSellOffer, setIsSellOffer] = useState(false);
  const [openTransfer, setOpenTransfer] = useState(false);
  const [burnt, setBurnt] = useState(false);
  const [cost, setCost] = useState(null);
  const [sellOffers, setSellOffers] = useState([]);
  const [openSelectPrice, setOpenSelectPrice] = useState(false);
  const [acceptOffer, setAcceptOffer] = useState(null);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [openScanQR, setOpenScanQR] = useState(false);
  const [xummUuid, setXummUuid] = useState(null);
  const [qrUrl, setQrUrl] = useState(null);
  const [nextUrl, setNextUrl] = useState(null);
  const [qrType, setQrType] = useState('NFTokenAcceptOffer');

  // Adjusted regex to match the nftLink format
  const match = nftLink.match(/\[NFT: (.*?) \((.*?)\)\]/);
  const [_, name, tokenId] = match || [null, null, null];

  useEffect(() => {
    if (tokenId) {
      async function fetchNFT() {
        try {
          const res = await axios.get(`${BASE_URL}/nft/${tokenId}`);
          setNFT(res.data.nft);
          setBurnt(res.data.nft.status === NFToken.BURNT);
        } catch (error) {
          console.error('Error fetching NFT:', error);
        }
      }
      fetchNFT();
    }
  }, [tokenId]);

  useEffect(() => {
    async function getOffers() {
      try {
        const res = await axios.get(`${BASE_URL}/offers/${tokenId}`);
        if (res.status === 200) {
          const ret = res.data;
          const offers = ret.sellOffers;
          const nftOwner = nft.account;
          setCost(getCostFromOffers(nftOwner, offers, true));
          setSellOffers(getValidOffers(ret.sellOffers, true));
        }
      } catch (err) {
        console.log('Error on getting NFT offers list:', err);
      }
    }

    if (tokenId && nft) {
      getOffers();
    }
  }, [tokenId, nft]);

  const isOwner = accountLogin === nft?.account;

  const getValidOffers = (offers, isSell) => {
    const newOffers = [];
    for (const offer of offers) {
      if (isSell) {
        // Sell Offers
        if (isOwner) {
          // I am the Owner of NFT
          if (accountLogin === offer.owner) {
            newOffers.push(offer);
          }
        } else {
          // I am not the Owner of NFT
          if (accountLogin === offer.owner) {
            newOffers.push(offer);
          } else {
            if (
              nft.account === offer.owner &&
              (!offer.destination || accountLogin === offer.destination)
            ) {
              newOffers.push(offer);
            }
          }
        }
      } else {
        // Buy Offers
        if (!offer.destination || accountLogin === offer.destination) {
          newOffers.push(offer);
        }
      }
    }

    return newOffers;
  };

  /**
   * Updated getMediaPreview to utilize the files array for image display.
   * Prioritizes displaying the small thumbnail if available.
   * Uses the https://s2.xrpnft.com/d1/ base URL for all image sources.
   * Removes IPFS-related logic.
   * Updates video type check to use file.type === 'video'.
   * Incorporates logic from ChatNFTCard to ensure consistent media handling.
   */
  const getMediaPreview = () => {
    if (!nft || !nft.files || nft.files.length === 0) return null;

    // Use the first file in the files array (similar to ChatNFTCard)
    const file = nft.files[0];

    if (!file) return null;

    // Determine the image URL based on priority
    let mediaUrl = null;

    if (file.thumbnail?.small) {
      mediaUrl = `${IMAGE_BASE_URL}${file.thumbnail.small}`;
    } else if (file.thumbnail?.big) {
      mediaUrl = `${IMAGE_BASE_URL}${file.thumbnail.big}`;
    } else if (file.convertedFile) {
      mediaUrl = `${IMAGE_BASE_URL}${file.convertedFile}`;
    } else if (file.dfile) {
      mediaUrl = `${IMAGE_BASE_URL}${file.dfile}`;
    }

    if (!mediaUrl) return null;

    // Check if the file is a video
    if (file.type === 'video') {
      return (
        <video
          width="auto"
          height="30px"
          muted
          loop
          autoPlay
          playsInline
          style={{ borderRadius: '3px' }}
        >
          <source src={mediaUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      );
    }

    // Otherwise, render an image
    return (
      <img
        src={mediaUrl}
        alt={nft.name || 'Unnamed NFT'}
        style={{
          width: 'auto',
          height: '30px',
          objectFit: 'contain',
          borderRadius: '3px'
        }}
      />
    );
  };

  /**
   * New function to get the full-size image for the tooltip.
   * This ensures that the tooltip displays a larger version of the NFT image.
   */
  const getFullSizeMedia = () => {
    if (!nft || !nft.files || nft.files.length === 0) return null;

    // Use the first file in the files array (similar to ChatNFTCard)
    const file = nft.files[0];

    if (!file) return null;

    // Determine the image URL based on priority
    let mediaUrl = null;

    if (file.thumbnail?.small) {
      mediaUrl = `${IMAGE_BASE_URL}${file.thumbnail.small}`;
    } else if (file.thumbnail?.big) {
      mediaUrl = `${IMAGE_BASE_URL}${file.thumbnail.big}`;
    } else if (file.convertedFile) {
      mediaUrl = `${IMAGE_BASE_URL}${file.convertedFile}`;
    } else if (file.dfile) {
      mediaUrl = `${IMAGE_BASE_URL}${file.dfile}`;
    }

    if (!mediaUrl) return null;

    // Check if the file is a video
    if (file.type === 'video') {
      return (
        <video
          width="100%"
          height="auto"
          muted
          loop
          controls
          style={{ borderRadius: '3px', marginBottom: theme.spacing(1) }}
        >
          <source src={mediaUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>
      );
    }

    // Otherwise, render an image
    return (
      <img
        src={mediaUrl}
        alt={nft.name || 'Unnamed NFT'}
        style={{
          width: '100%',
          height: 'auto',
          objectFit: 'contain',
          borderRadius: '3px',
          marginBottom: theme.spacing(1)
        }}
      />
    );
  };

  const handleCreateSellOffer = () => {
    setIsSellOffer(true);
    setOpenCreateOffer(true);
  };

  const handleTransfer = () => {
    setOpenTransfer(true);
  };

  const handleCreateBuyOffer = () => {
    setIsSellOffer(false);
    setOpenCreateOffer(true);
  };

  const onHandleBurn = () => {
    setBurnt(true);
  };

  const handleAcceptOffer = async (offer) => {
    setAcceptOffer(offer);
    setOpenConfirm(true);
  };

  const handleBuyNow = async () => {
    if (sellOffers.length > 1) {
      setOpenSelectPrice(true);
    } else {
      handleAcceptOffer(cost.offer);
    }
  };

  const doProcessOffer = async (offer, isAcceptOrCancel) => {
    if (!accountLogin || !accountToken) {
      openSnackbar('Please login', 'error');
      return;
    }

    const index = offer.nft_offer_index;
    const owner = offer.owner;
    const destination = offer.destination;
    const isSell = offer.flags === 1;

    if (isAcceptOrCancel) {
      // Accept mode
      if (accountLogin === owner) {
        openSnackbar('You are the owner of this offer, you cannot accept it.', 'error');
        return;
      }
    } else {
      // Cancel mode
      if (accountLogin !== owner) {
        openSnackbar('You are not the owner of this offer', 'error');
        return;
      }
    }

    setPageLoading(true);
    try {
      const { uuid, NFTokenID } = nft;

      const user_token = accountProfile.user_token;
      const wallet_type = accountProfile.wallet_type;

      let offerTxData = {
        TransactionType: isAcceptOrCancel ? 'NFTokenAcceptOffer' : 'NFTokenCancelOffer',
        Memos: [],
        NFTokenOffers: !isAcceptOrCancel ? [index] : undefined,
        Account: accountLogin
      };

      if (isAcceptOrCancel) {
        if (isSell) {
          offerTxData['NFTokenSellOffer'] = index;
        } else {
          offerTxData['NFTokenBuyOffer'] = index;
        }
      }

      switch (wallet_type) {
        case 'xaman':
          const body = {
            account: accountLogin,
            uuid,
            NFTokenID,
            index,
            destination,
            accept: isAcceptOrCancel ? 'yes' : 'no',
            sell: isSell ? 'yes' : 'no',
            user_token
          };

          const res = await axios.post(`${BASE_URL}/offers/acceptcancel`, body, {
            headers: { 'x-access-token': accountToken }
          });

          if (res.status === 200) {
            const newUuid = res.data.data.uuid;
            const qrlink = res.data.data.qrUrl;
            const nextlink = res.data.data.next;

            let newQrType = isAcceptOrCancel ? 'NFTokenAcceptOffer' : 'NFTokenCancelOffer';
            if (isSell) newQrType += ' [Sell Offer]';
            else newQrType += ' [Buy Offer]';

            setQrType(newQrType);
            setXummUuid(newUuid);
            setQrUrl(qrlink);
            setNextUrl(nextlink);
            setOpenScanQR(true);
          }
          break;
        case 'gem':
          isInstalled().then(async (response) => {
            if (response.result.isInstalled) {
              dispatch(updateProcess(1));
              await submitTransaction({
                transaction: offerTxData
              }).then(({ type, result }) => {
                if (type === 'response') {
                  dispatch(updateProcess(2));
                  dispatch(updateTxHash(result?.hash));
                } else {
                  dispatch(updateProcess(3));
                }
              });
            }
          });
          break;
        case 'crossmark':
          dispatch(updateProcess(1));
          await sdk.methods.signAndSubmitAndWait(offerTxData).then(({ response }) => {
            if (response.data.meta.isSuccess) {
              dispatch(updateProcess(2));
              dispatch(updateTxHash(response.data.resp.result?.hash));
            } else {
              dispatch(updateProcess(3));
            }
          });
          break;
        default:
          openSnackbar('Unsupported wallet type', 'error');
          break;
      }
    } catch (err) {
      console.error(err);
      dispatch(updateProcess(0));
    }
    setPageLoading(false);
  };

  const onDisconnectXumm = async () => {
    setPageLoading(true);
    try {
      await axios.delete(`${BASE_URL}/offers/acceptcancel/${xummUuid}`);
    } catch (err) {
      console.error(err);
    }
    setXummUuid(null);
    setPageLoading(false);
  };

  const handleScanQRClose = () => {
    setOpenScanQR(false);
    onDisconnectXumm();
  };

  const onContinueAccept = async () => {
    doProcessOffer(acceptOffer, true);
  };

  if (!match) return null;

  return (
    <>
      <StyledTooltip
        title={
          <Paper elevation={0}>
            <Box sx={{ p: 1.5 }}>
              {/* Full-size media in tooltip */}
              {getFullSizeMedia()}
              
              {/* NFT Name with gutterBottom */}
              <Typography variant="h6" gutterBottom>
                {nft ? nft.name : name}
              </Typography>
              <Divider sx={{ my: 1 }} />
              {nft?.collection && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Collection:</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {nft.collection}
                  </Typography>
                </Box>
              )}
              {nft?.rarity_rank && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Rarity Rank:</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {nft.rarity_rank} / {nft.total}
                  </Typography>
                </Box>
              )}
              {nft?.royalty && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                  <Typography variant="body2">Royalty:</Typography>
                  <Typography variant="body2" fontWeight="bold">
                    {(nft.royalty / 1000).toFixed(2)}%
                  </Typography>
                </Box>
              )}
              {nft?.props && nft.props.length > 0 && (
                <>
                  <Divider sx={{ my: 1 }} />
                  <Typography variant="subtitle2" gutterBottom>
                    Properties:
                  </Typography>
                  {nft.props.map((prop, index) => (
                    <Box
                      key={index}
                      sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}
                    >
                      <Typography variant="body2">{prop.type}:</Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {prop.value}
                      </Typography>
                    </Box>
                  ))}
                </>
              )}
              {nft?.cfloor && (
                <>
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">Floor Price:</Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {nft.cfloor.amount} {nft.cfloor.currency}
                    </Typography>
                  </Box>
                </>
              )}
              <Divider sx={{ my: 1 }} />
              <Typography variant="caption" color="textSecondary">
                Token ID: {tokenId}
              </Typography>
              <Divider sx={{ my: 1 }} />
              {isOwner ? (
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'space-around',
                    gap: 1
                  }}
                >
                  <Button
                    fullWidth
                    variant="outlined"
                    startIcon={<LocalOfferIcon />}
                    onClick={handleCreateSellOffer}
                    color="success"
                    disabled={!accountLogin || burnt}
                  >
                    Sell
                  </Button>
                  <Button
                    fullWidth
                    sx={{ padding: '8px 30px' }}
                    variant="outlined"
                    startIcon={<SendIcon />}
                    onClick={handleTransfer}
                    color="info"
                    disabled={!accountLogin || burnt}
                  >
                    Transfer
                  </Button>
                  <BurnNFT nft={nft} onHandleBurn={onHandleBurn} />
                </Box>
              ) : (
                <Stack spacing={{ xs: 1, sm: 2 }} direction="row">
                  <Button
                    fullWidth
                    disabled={!cost || burnt}
                    variant="contained"
                    onClick={handleBuyNow}
                  >
                    Buy Now
                  </Button>
                  <Button
                    fullWidth
                    disabled={!accountLogin || burnt}
                    variant="outlined"
                    onClick={handleCreateBuyOffer}
                  >
                    Make Offer
                  </Button>
                </Stack>
              )}
            </Box>
          </Paper>
        }
        arrow
        placement="right"
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            marginLeft: 0.5,
            gap: 0.5
          }}
        >
          {getMediaPreview()}
          <Typography
            variant="caption"
            sx={{ color: theme.palette.primary.main, fontWeight: 'bold', fontSize: '0.75rem' }}
          >
            {nft ? nft.name : name}
          </Typography>
        </Box>
      </StyledTooltip>
      <Backdrop
        sx={{ color: '#000', zIndex: (theme) => theme.zIndex.drawer + 1 }}
        open={pageLoading}
      >
        <ProgressBar
          height="80"
          width="80"
          ariaLabel="progress-bar-loading"
          wrapperStyle={{}}
          wrapperClass="progress-bar-wrapper"
          borderColor="#F4442E"
          barColor="#51E5FF"
        />
      </Backdrop>
      <ConfirmAcceptOfferDialog
        open={openConfirm}
        setOpen={setOpenConfirm}
        offer={acceptOffer}
        onContinue={onContinueAccept}
      />

      <CreateOfferDialog
        open={openCreateOffer}
        setOpen={setOpenCreateOffer}
        nft={nft}
        isSellOffer={isSellOffer}
      />

      <TransferDialog open={openTransfer} setOpen={setOpenTransfer} nft={nft} />

      <SelectPriceDialog
        open={openSelectPrice}
        setOpen={setOpenSelectPrice}
        offers={sellOffers}
        handleAccept={handleAcceptOffer}
      />

      <QRDialog
        open={openScanQR}
        type={qrType}
        onClose={handleScanQRClose}
        qrUrl={qrUrl}
        nextUrl={nextUrl}
      />
    </>
  );
};

/**
 * Helper function to render the full-size media for the tooltip.
 * This ensures that the tooltip displays a larger version of the NFT image or video.
 */
const getFullSizeMedia = (nft, IMAGE_BASE_URL, theme) => {
  if (!nft || !nft.files || nft.files.length === 0) return null;

  // Use the first file in the files array
  const file = nft.files[0];

  if (!file) return null;

  // Determine the image URL based on priority
  let mediaUrl = null;

  if (file.thumbnail?.small) {
    mediaUrl = `${IMAGE_BASE_URL}${file.thumbnail.small}`;
  } else if (file.thumbnail?.big) {
    mediaUrl = `${IMAGE_BASE_URL}${file.thumbnail.big}`;
  } else if (file.convertedFile) {
    mediaUrl = `${IMAGE_BASE_URL}${file.convertedFile}`;
  } else if (file.dfile) {
    mediaUrl = `${IMAGE_BASE_URL}${file.dfile}`;
  }

  if (!mediaUrl) return null;

  // Check if the file is a video
  if (file.type === 'video') {
    return (
      <video
        width="100%"
        height="auto"
        muted
        loop
        controls
        style={{ borderRadius: '3px', marginBottom: theme.spacing(1) }}
      >
        <source src={mediaUrl} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    );
  }

  // Otherwise, render an image
  return (
    <img
      src={mediaUrl}
      alt={nft.name || 'Unnamed NFT'}
      style={{
        width: '100%',
        height: 'auto',
        objectFit: 'contain',
        borderRadius: '3px',
        marginBottom: theme.spacing(1)
      }}
    />
  );
};

export default NFTDisplay;
