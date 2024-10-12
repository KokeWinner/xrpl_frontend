// Trade.js
import React, { useState, useContext, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Grid,
  Typography,
  Box,
  TextField,
  Paper,
  Divider,
  IconButton,
  Select,
  MenuItem,
  Snackbar
} from '@mui/material';
import MuiAlert from '@mui/material/Alert';
import { styled } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import TradeNFTPicker from './TradeNFTPicker';
import { AppContext } from 'src/AppContext';
import { Client, xrpToDrops, isoTimeToRippleTime } from 'xrpl';
import { normalizeCurrencyCodeXummImpl } from 'src/utils/normalizers';
import CryptoJS from 'crypto-js';
import { isInstalled, submitBulkTransactions, submitTransaction } from '@gemwallet/api';
import axios from 'axios';
import {
  Edit as EditIcon,
  Save as SaveIcon,
  Cancel as CancelIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';
import { configureMemos } from 'src/utils/parse/OfferChanges';
import sdk from "@crossmarkio/sdk";
import QRDialog from '../QRDialog';

const BASE_URL = 'https://api.xrpl.to/api';
const NFTRADE_URL = 'http://65.108.136.237:5333';

const BASE_RESERVE = 10;
const OWNER_RESERVE = 2;

const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: 24,
    boxShadow: '0 12px 48px rgba(0, 0, 0, 0.12)',
  },
}));

const StyledDialogTitle = styled(DialogTitle)(({ theme }) => ({
  background: theme.palette.background.default,
  color: theme.palette.text.primary,
  padding: theme.spacing(3, 4),
  borderBottom: `1px solid ${theme.palette.divider}`,
}));

const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
  padding: theme.spacing(4),
  background: theme.palette.background.default,
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: 16,
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.08)',
  background: theme.palette.background.paper,
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: 20,
  textTransform: 'none',
  fontWeight: 600,
}));

const Trade = ({ open, onClose, tradePartner }) => {
  const { accountProfile } = useContext(AppContext);
  const [selectedLoggedInUserAssets, setSelectedLoggedInUserAssets] = useState([]);
  const [selectedPartnerAssets, setSelectedPartnerAssets] = useState([]);
  const [loggedInUserXrpBalance, setLoggedInUserXrpBalance] = useState(0);
  const [partnerXrpBalance, setPartnerXrpBalance] = useState(0);
  const [loggedInUserTokens, setLoggedInUserTokens] = useState([]);
  const [partnerTokens, setPartnerTokens] = useState([]);
  const [loggedInUserOffers, setLoggedInUserOffers] = useState([{ currency: 'XRP', amount: 0, token_type: 'token' }]);
  const [partnerOffers, setPartnerOffers] = useState([{ currency: 'XRP', amount: 0, token_type: 'token' }]);
  const [loggedInUserLines, setLoggedInUserLines] = useState([]);
  const [partnerLines, setPartnerLines] = useState([]);
  const [notifications, setNotifications] = useState(true);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [xamanStep, setXamanStep] = useState(0);
  const [xamanTitle, setXamanTitle] = useState(0);
  const [openScanQR, setOpenScanQR] = useState(false);
  const [qrUrl, setQrUrl] = useState(null);
  const [nextUrl, setNextUrl] = useState(null);
  const [uuid, setUuid] = useState(null);
  
  const onDisconnectXumm = async (uuid) => {
    setLoading(true);
    try {
      const res = await axios.delete(`${BASE_URL}/xumm/logout/${uuid}`);
      if (res.status === 200) {
        setUuid(null);
      }
    } catch (err) { }
    setLoading(false);
  };

  const handleScanQRClose = () => {
    setOpenScanQR(false);
    onDisconnectXumm(uuid);
  };
  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  const showNotification = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  useEffect(() => {
    if (open && accountProfile && tradePartner) {
      fetchBalances();
    }
    console.log(open, "open = open", tradePartner)
  }, [open, accountProfile, tradePartner]);

  const fetchBalances = async () => {
    const client = new Client('wss://s1.ripple.com');
    try {
      await client.connect();

      const loggedInUserInfo = await client.request({
        command: 'account_info',
        account: accountProfile.account,
        ledger_index: 'validated'
      });
      const loggedInUserTotalBalance = Number(loggedInUserInfo.result.account_data.Balance) / 1000000;
      const loggedInUserOwnerCount = loggedInUserInfo.result.account_data.OwnerCount;
      const loggedInUserReserve = BASE_RESERVE + (loggedInUserOwnerCount * OWNER_RESERVE);
      setLoggedInUserXrpBalance(Math.max(0, loggedInUserTotalBalance - loggedInUserReserve));

      const partnerInfo = await client.request({
        command: 'account_info',
        account: tradePartner.username,
        ledger_index: 'validated'
      });
      const partnerTotalBalance = Number(partnerInfo.result.account_data.Balance) / 1000000;
      const partnerOwnerCount = partnerInfo.result.account_data.OwnerCount;
      const partnerReserve = BASE_RESERVE + (partnerOwnerCount * OWNER_RESERVE);
      setPartnerXrpBalance(Math.max(0, partnerTotalBalance - partnerReserve));

      const loggedInUserLines = await client.request({
        command: 'account_lines',
        account: accountProfile.account,
      });
      setLoggedInUserLines(loggedInUserLines.result.lines);

      const partnerLines = await client.request({
        command: 'account_lines',
        account: tradePartner.username,
      });
      setPartnerLines(partnerLines.result.lines);

      // Process the lines to set tokens
      setLoggedInUserTokens(processLines(loggedInUserLines.result.lines, accountProfile.account));
      setPartnerTokens(processLines(partnerLines.result.lines, tradePartner.username));

    } catch (error) {
      console.error('Error fetching balances:', error);
    } finally {
      client.disconnect();
    }
  };

  const getLines = () => {
    setLoading(true);
    axios
      .get(`${BASE_URL}/account/lines/${account}?page=${page}&limit=${rows}`)
      .then((res) => {
        let ret = res.status === 200 ? res.data : undefined;
        if (ret) {
          setTotal(ret.total);
          setLines(ret.lines);
        }
      })
      .catch((err) => {
        console.log('Error on getting account lines!!!', err);
      })
      .then(function () {
        setLoading(false);
      });
  };

  const processLines = (lines, account) => {
    return lines.map(line => {
      const { currency, account: issuer } = line;
      const balance = account === line.account ? Math.abs(Number(line.balance)) : Number(line.balance);
      const currencyName = normalizeCurrencyCodeXummImpl(currency);
      const md5 = CryptoJS.MD5(issuer + "_" + currency).toString();
      return {
        currencyName: currencyName,
        currency,
        issuer,
        balance,
        md5,
      };
    });
  };

  // Selection handler for Logged-In User
  const handleLoggedInUserAssetSelect = (nft) => {
    setSelectedLoggedInUserAssets((prev) => {
      const exists = prev.some(asset => asset.NFTokenID === nft.NFTokenID);
      if (exists) {
        // Deselect the NFT
        return prev.filter(asset => asset.NFTokenID !== nft.NFTokenID);
      } else {
        // Select the NFT
        return [...prev, nft];
      }
    });
  };

  // Selection handler for Partner
  const handlePartnerAssetSelect = (nft) => {
    setSelectedPartnerAssets((prev) => {
      const exists = prev.some(asset => asset.NFTokenID === nft.NFTokenID);
      if (exists) {
        // Deselect the NFT
        return prev.filter(asset => asset.NFTokenID !== nft.NFTokenID);
      } else {
        // Select the NFT
        return [...prev, nft];
      }
    });
  };

  const handleAddOffer = (isLoggedInUser) => {
    if (isLoggedInUser) {
      setLoggedInUserOffers([...loggedInUserOffers, { currency: 'XRP', amount: 0, token_type: 'token' }]);
    } else {
      setPartnerOffers([...partnerOffers, { currency: 'XRP', amount: 0, token_type: 'token' }]);
    }
  };

  const handleRemoveOffer = (index, isLoggedInUser) => {
    if (isLoggedInUser) {
      setLoggedInUserOffers(loggedInUserOffers.filter((_, i) => i !== index));
    } else {
      setPartnerOffers(partnerOffers.filter((_, i) => i !== index));
    }
  };

  const handleOfferChange = (index, field, value, isLoggedInUser) => {
    const updateOffers = (offers) =>
      offers.map((offer, i) => {
        if (i === index) {
          if (field === 'currency') {
            const selectedToken = isLoggedInUser 
              ? loggedInUserTokens.find(token => token.currency === value)
              : partnerTokens.find(token => token.currency === value);
            return { 
              ...offer, 
              [field]: value, 
              issuer: selectedToken?.issuer, 
              token_type: 'token' 
            };
          } else if (field === 'amount') {
            return { ...offer, [field]: value === '' ? '' : Number(value) };
          }
        }
        return offer;
      });
      
    if (isLoggedInUser) {
      setLoggedInUserOffers(updateOffers(loggedInUserOffers));
    } else {
      setPartnerOffers(updateOffers(partnerOffers));
    }
  };

  const addTrustLine = (async(wallet_address, currency, issuer) => {
    axios
        .get(`${NFTRADE_URL}/trustline/add/${wallet_address}/${currency}/${issuer}`)
        .then(async(res) => {
          let ret = res.status === 200 ? res.data : undefined;
          if (ret) {
            console.log(ret, "message from trustline");
          }
        })
        .catch((err) => {
          console.log('Error on setting account lines!!!', err);
        })
  });

  const getTrustLines = async(wallet_address, currency, issuer) => {
    axios
        .get(`${BASE_URL}/account/lines/${wallet_address}`)
        .then(async(res) => {
          let ret = res.status === 200 ? res.data : undefined;
          if (ret) {
            const trustlines = ret.lines;

            const trustlineStatus = await trustlines.find((trustline) => {
              return (
                (trustline.LowLimit.issuer === wallet_address ||
                  trustline.HighLimit.issuer) &&
                trustline.LowLimit.currency === currency
              );
            });
            console.log(trustlineStatus, "trustlineStatus from")
            if(trustlineStatus === undefined) {
              // add trust line
              await addTrustLine(wallet_address, currency, issuer)
            }
          }
        })
        .catch((err) => {
          console.log('Error on getting account lines!!!', err);
        })
  }
        
  const handleTrade = async() => {
    const middle_wallet_address = 'rKxpqFqHWFWRzBuSkjZGHg9HXUYMGn6zbk';
    let validateTrade = true;
    loggedInUserOffers.map(async(tokenInfo, index) => {
      if(tokenInfo.currency !== 'XRP' && tokenInfo.token_type !== 'NFT')
         await getTrustLines(middle_wallet_address, tokenInfo.currency, tokenInfo.issuer);

      if(tokenInfo.amount === 0) {
        showNotification(`Invalid token amount for ${normalizeCurrencyCodeXummImpl(tokenInfo.currency)}`, 'error');
        validateTrade = false;
      }
    });

    console.log(loggedInUserOffers, "loggedInUserOffers")
    
    // check trust line
    if(!validateTrade)
      return false;
    
    // Implement trade logic here
    try {
          let itemsSent = loggedInUserOffers;
          if(selectedLoggedInUserAssets.length > 0) {
            selectedLoggedInUserAssets.map((item, index) => {
              let temp = {
                currency : item.name,
                amount : 0,
                token_type : 'NFT',
                issuer : item.issuer,
                token_address : item.NFTokenID,
                token_icon : item.ufile.image,
              }
              itemsSent.push(temp)
            })
          }
          let itemsRequested = partnerOffers;
          if(selectedPartnerAssets.length > 0) {
            selectedPartnerAssets.map((item, index) => {
              let temp = {
                currency : item.name,
                amount : 0,
                token_type : 'NFT',
                issuer : item.issuer,
                token_address : item.NFTokenID,
                token_icon : item.ufile.image,
              }
              itemsRequested.push(temp)
            })
          }
          
          console.log(itemsSent, " check token sfor itemsSent")
          console.log(itemsRequested, " check token sfor partnerOffers")
          
          const tradeData = await axios.post(`${NFTRADE_URL}/trade`, {
            fromAddress: accountProfile.account,
            toAddress: tradePartner.username,
            itemsSent: itemsSent,
            itemsRequested: itemsRequested,
          });
         
          const paymentTxData = itemsSent.map((offer, index) => (
            offer.token_type === 'NFT' ? 
            {
              TransactionType: "NFTokenCreateOffer",
              Account: accountProfile.account,
              NFTokenID: offer.token_address,
              Amount: "0",
              Flags: 1,
              Destination: middle_wallet_address,
              Memos: configureMemos('XRPNFT-nft-create-sell-offer', '', `https://xrpnft.com/nft/${offer.token_address}`)
            }
             : 
            {
              TransactionType: "Payment",
              Account: accountProfile.account,
              Amount: offer.currency === 'XRP' ? xrpToDrops(`${offer.amount}`) : {
                currency: offer.currency,
                value: `${offer.amount}`,
                issuer: offer.issuer
              },
              Destination: middle_wallet_address,
              Fee: "12",
              SourceTag: 20221212,
              DestinationTag: 20221212,
            }
          ))
          console.log(paymentTxData, "paymentTxData")
          const requestedData = tradeData.data;
          
          const wallet_type = accountProfile.wallet_type;
          console.log(wallet_type, "wallet type")
          switch (wallet_type) {
            case "xaman":
              
            case "gem":
            isInstalled().then(async (response) => {
              if (response.result.isInstalled) {
                const result = await submitBulkTransactions({
                  transactions: paymentTxData
                });
                console.log(result, "tokenHash")
                await processTxhash(result, requestedData.tradeId);
              }
            })
            case "crossmark":
              await sdk.methods.bulkSignAndSubmitAndWait(paymentTxData).then(async ({ response }) => {
                console.log(response, "crossmark response");
                if (response.data.meta.isSuccess) {
                  await processTxhash(response, requestedData.tradeId);
                } else {
                  
                }
              });
          }
          
          
    } catch (err) {
      console.log(err);
    }
  };
  const processTxhash = async(paymentResult, tradeId) => {
    if(paymentResult.result === undefined) {
      await axios.post(`${NFTRADE_URL}/update-trade`, {
        tradeId: tradeId,
        itemType: 'rejected',
        index: 0,
        hash: 'rejected-hash',
      });
    }else {
      const tokenHash = paymentResult.result.transactions;
      for (let i = 0; i < tokenHash.length; i++) {
        if(tokenHash[i]['hash'].length === 64) {
          await axios.post(`${NFTRADE_URL}/update-trade`, {
            tradeId: tradeId,
            itemType: 'sent',
            index: i,
            hash: tokenHash[i]['hash']
          });
        }
      }
    }
  }
  const handleClose = () => {
    setSelectedLoggedInUserAssets([]);
    setSelectedPartnerAssets([]);
    setLoggedInUserOffers([{ currency: 'XRP', amount: 0, token_type: 'token' }]);
    setPartnerOffers([{ currency: 'XRP', amount: 0, token_type: 'token' }]);
    onClose();
  };

  const renderSelectedAssets = (assets) => (
    <Box>
      {assets.map((asset) => (
        <Typography key={asset.NFTokenID || asset.id} variant="body2">
          {asset.meta?.name || asset.meta?.Name || 'Unnamed NFT'} ({asset.NFTokenID || asset.id})
        </Typography>
      ))}
    </Box>
  );

  const renderOffers = (offers, tokens, isLoggedInUser) => (
    <Box>
      {offers.map((offer, index) => (
        <Box key={index} display="flex" alignItems="center" mb={2}>
          <Select
            value={offer.currency}
            onChange={(e) => handleOfferChange(index, 'currency', e.target.value, isLoggedInUser)}
            sx={{ width: '40%', mr: 1, borderRadius: 2 }}
          >
            <MenuItem value="XRP">XRP</MenuItem>
            {tokens.map((token) => (
              <MenuItem key={`${token.currency}-${token.issuer}`} value={token.currency}>
                {token.currencyName} ({token.balance.toFixed(6)})
              </MenuItem>
            ))}
          </Select>
          <TextField
            type="number"
            value={offer.amount || ''}
            onChange={(e) => handleOfferChange(index, 'amount', e.target.value === '' ? '' : Number(e.target.value), isLoggedInUser)}
            inputProps={{ min: 0, step: 0.000001 }}
            placeholder="0"
            sx={{
              width: '40%',
              '& .MuiOutlinedInput-root': { borderRadius: 2 },
              '& input::placeholder': {
                color: 'text.disabled',
                opacity: 1,
              },
            }}
          />
          <IconButton onClick={() => handleRemoveOffer(index, isLoggedInUser)} sx={{ ml: 1 }}>
            <CloseIcon />
          </IconButton>
        </Box>
      ))}
      <StyledButton
        onClick={() => handleAddOffer(isLoggedInUser)}
        variant="outlined"
        size="small"
        startIcon={<AddCircleOutlineIcon />}
      >
        Add Token
      </StyledButton>
    </Box>
  );

  // Move the check here, after all hooks have been called
  if (!accountProfile || !tradePartner) {
    return null; // or return a loading indicator
  }

  return (
    <StyledDialog
      open={open}
      onClose={() => { }}
      maxWidth="lg"
      fullWidth
      disableEscapeKeyDown
      disableBackdropClick
    >
      <StyledDialogTitle>
        <Typography variant="h5" fontWeight="bold">Asset Exchange</Typography>
        <IconButton
          aria-label="close"
          onClick={handleClose}
          sx={{
            position: 'absolute',
            right: 16,
            top: 16,
            color: (theme) => theme.palette.text.secondary,
          }}
        >
          <CloseIcon />
        </IconButton>
      </StyledDialogTitle>
      <StyledDialogContent>
        <Grid container spacing={4}>
          <Grid item xs={6}>
            <StyledPaper elevation={3}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>Your Portfolio</Typography>
              <Typography variant="body1" color="text.secondary" mb={2}>
                Available XRP: <Box component="span" fontWeight="bold">{loggedInUserXrpBalance.toFixed(6)} XRP</Box>
              </Typography>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Tokens to Offer:</Typography>
              {renderOffers(loggedInUserOffers, loggedInUserTokens, true)}
              <Box mt={3} mb={3}>
                <Divider />
              </Box>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Select Assets to Offer:</Typography>
              <TradeNFTPicker
                onSelect={handleLoggedInUserAssetSelect}
                account={accountProfile.account}
                isPartner={false}
                selectedAssets={selectedLoggedInUserAssets} // Pass selected assets
              />
              <Box mt={3}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Selected Assets:</Typography>
                {renderSelectedAssets(selectedLoggedInUserAssets)}
              </Box>
            </StyledPaper>
          </Grid>
          <Grid item xs={6}>
            <StyledPaper elevation={3}>
              <Typography variant="h6" fontWeight="bold" gutterBottom>{tradePartner.username}'s Portfolio</Typography>
              <Typography variant="body1" color="text.secondary" mb={2}>
                Available XRP: <Box component="span" fontWeight="bold">{partnerXrpBalance.toFixed(6)} XRP</Box>
              </Typography>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Tokens to Request:</Typography>
              {renderOffers(partnerOffers, partnerTokens, false)}
              <Box mt={3} mb={3}>
                <Divider />
              </Box>
              <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Select Assets to Request:</Typography>
              <TradeNFTPicker
                onSelect={handlePartnerAssetSelect}
                account={tradePartner.username}
                isPartner={true}
                selectedAssets={selectedPartnerAssets} // Pass selected assets
              />
              <Box mt={3}>
                <Typography variant="subtitle1" fontWeight="bold" gutterBottom>Selected Assets:</Typography>
                {renderSelectedAssets(selectedPartnerAssets)}
              </Box>
            </StyledPaper>
          </Grid>
        </Grid>
      </StyledDialogContent>
      <DialogActions sx={{ padding: (theme) => theme.spacing(3), borderTop: (theme) => `1px solid ${theme.palette.divider}` }}>
        <StyledButton onClick={handleClose} variant="outlined">Close</StyledButton>
        <StyledButton
          onClick={handleTrade}
          variant="contained"
          color="primary"
          startIcon={<SwapHorizIcon />}
        >
          Propose Exchange
        </StyledButton>
      </DialogActions>

      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={handleCloseSnackbar}>
        <MuiAlert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </MuiAlert>
      </Snackbar>

      <QRDialog
        open={openScanQR}
        type={"xamanTitle"}
        onClose={handleScanQRClose}
        qrUrl={"qrUrl"}
        nextUrl={"nextUrl"}
      />
    </StyledDialog>
  );
};

export default Trade;