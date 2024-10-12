import React, { useState, useContext, useEffect } from 'react';
import { Box, Typography, Button, Grid, Paper, Divider, Chip, Tabs, Tab, Stack } from '@mui/material';
import { styled } from '@mui/material/styles';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import { format } from 'date-fns'; // Make sure to install this package if not already present
import axios from 'axios';
import { AppContext } from 'src/AppContext';
import { normalizeCurrencyCodeXummImpl } from 'src/utils/normalizers';
import { isInstalled, submitBulkTransactions } from '@gemwallet/api';
import { Client, xrpToDrops } from 'xrpl';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import sdk from "@crossmarkio/sdk";

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(3),
  marginBottom: theme.spacing(3),
  borderRadius: theme.spacing(2),
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
}));

const StyledButton = styled(Button)(({ theme }) => ({
  borderRadius: theme.spacing(2),
  padding: theme.spacing(0.75, 2),
  fontWeight: 600,
  fontSize: '0.875rem',
}));

const NFTRADE_URL = 'http://65.108.136.237:5333';

function TradeOffer({ _id, status, timestamp, fromAddress, toAddress, isOutgoing, itemsSent, itemsRequested }) {
  const { accountProfile } = useContext(AppContext);
  const [tradeStatus, setTradeStatus] = useState(status);
  const offer = isOutgoing ? {
    toAddress: toAddress,
    offering: itemsSent,
    wanting: itemsRequested
  } : {
    fromAddress: fromAddress,
    offering: itemsSent,
    wanting: itemsRequested
  };

  const handleReactions = async(tradeId, actionType) => {
    // Implement accept trade logic here
    console.log('Trade accepted', tradeId, actionType, fromAddress);
    if(actionType === 'accept') {
      let payRequested = await handleTradeAccept(tradeId, itemsRequested, fromAddress);
      console.log(payRequested, "payRequested")
      if(!payRequested)
        return false;
    }
    
    let action_ret = await axios.post(`${NFTRADE_URL}/trades/reactions`, {
      tradeId: tradeId,
      actionType: actionType,
    });
    console.log(action_ret, "status from middleware")
    setTradeStatus(actionType);

    // if(status === "success") {
    // }
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
            itemType: 'requested',
            index: i,
            hash: tokenHash[i]['hash']
          });
        }
      }
    }
  }
    
  const handleTradeAccept = async(tradeId, itemsRequested, fromAddress) => {
    // Implement trade logic here
    try {
      return isInstalled().then(async (response) => {
        if (response.result.isInstalled) {
          const paymentTxData = itemsRequested.map((offer, index) => (
            offer.token_type === 'token' ?
              {
                TransactionType: "Payment",
                Account: accountProfile.account,
                Amount: offer.currency === 'XRP' ? xrpToDrops(`${offer.amount}`) : {
                  currency: offer.currency,
                  value: `${offer.amount}`,
                  issuer: offer.issuer
                },
                Destination: fromAddress,
                Fee: "12",
                SourceTag: 20221212,
                DestinationTag: 20221212,
              }
               : 
              {
                TransactionType: "NFTokenCreateOffer",
                Account: accountProfile.account,
                NFTokenID: offer.token_address,
                Amount: "0",
                Destination: fromAddress,
                Flags: 1,
              }
          ));

          console.log(paymentTxData, "paymentTxData = ", itemsRequested)
          const result = await submitBulkTransactions({
            transactions: paymentTxData
          });
          console.log(result, "result = ")

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
        
        }
        return true;
      })
    } catch (err) {
      console.log(err);
      return false;
    }
  };

  const renderStatusInfo = () => {
    const formattedDate = timestamp ? format(new Date(timestamp), 'MMM d, yyyy HH:mm') : '';
    console.log(formattedDate, tradeStatus, "here is render status info");
    switch (tradeStatus) {
      case 'completed':
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', color: 'success.main', mt: 2 }}>
            <CheckCircleOutlineIcon sx={{ mr: 1 }} />
            <Box>
              <Typography variant="body2">Trade Completed</Typography>
              {/* <Typography variant="caption">{formattedDate}</Typography> */}
            </Box>
          </Box>
        );
      case 'decline':
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', color: 'error.main', mt: 2 }}>
            <CancelOutlinedIcon sx={{ mr: 1 }} />
            <Box>
              <Typography variant="body2">Trade Declined</Typography>
              {/* <Typography variant="caption">{formattedDate}</Typography> */}
            </Box>
          </Box>
        );
      case 'return':
        return (
          <Box sx={{ display: 'flex', alignItems: 'center', color: 'error.main', mt: 2 }}>
            <CancelOutlinedIcon sx={{ mr: 1 }} />
            <Box>
              <Typography variant="body2">Trade Canceled</Typography>
              {/* <Typography variant="caption">{formattedDate}</Typography> */}
            </Box>
          </Box>
        );
      case 'pending':
        return (
          <Box sx={{ display: 'flex', gap: 1 }}>
            {isOutgoing ? (
              <StyledButton variant="outlined" color="error" onClick={() => handleReactions(_id, 'return')} size="small">
                Return items
              </StyledButton>
            ) : (
              <>
                <StyledButton variant="outlined" color="error" onClick={() => handleReactions(_id, 'decline')} size="small">
                  Decline
                </StyledButton>
                <StyledButton variant="contained" color="primary" onClick={() => handleReactions(_id, 'accept')} size="small">
                  Accept Trade
                </StyledButton>
              </>
            )}
          </Box>
        );
      case 'accepted':
      default:
        return null;
    }
  };

  return (
    <StyledPaper>
      <Typography variant="h6" gutterBottom fontWeight="bold">
        Trade Offer
      </Typography>
      <Typography variant="subtitle2" color="text.secondary" gutterBottom>
        {isOutgoing ? `To: ${offer.toAddress}` : `From: ${offer.fromAddress}`}
      </Typography>
      <Divider sx={{ my: 2 }} />
      <Grid container spacing={4}>
        <Grid item xs={6}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            {isOutgoing ? "You're offering:" : "They're offering:"}
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            { 
              offer.offering.map((item, key) => {
                console.log(item.token_type, "item.token_type", item)
                  if(!item.currency || item.hash === '')
                      return false;
                  return (item.token_type !== 'NFT') ? (
                    <Chip key={key} label={`${item.amount} ${normalizeCurrencyCodeXummImpl(item.currency).toUpperCase()}`} color="primary" variant="outlined" />
                  ) : <Chip key={key} label={`NFT ${item.currency}`} color="primary" variant="outlined" />
                }
              )
            }
            {/* {offer.offering.nfts.map((nft, index) => (
              <Chip key={index} label={`${nft.name} ${nft.id}`} color="primary" variant="outlined" />
            ))} */}
          </Box>
        </Grid>

        <Grid item xs={6}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            {isOutgoing ? "You want:" : "They want:"}
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {
              offer.wanting.map((item, key) => {
                  if(!item.currency)
                    return false;

                return (item.token_type !== 'NFT') ? (
                  <Chip key={key} label={`${item.amount} ${normalizeCurrencyCodeXummImpl(item.currency).toUpperCase()}`} color="secondary" variant="outlined" />
                ) : <Chip key={key} label={`NFT ${item.currency}`} color="secondary" variant="outlined" />
                }
              )
            }
            {/* {offer.wanting.nfts.map((nft, index) => (
              <Chip key={index} label={`${nft.name} ${nft.id}`} color="secondary" variant="outlined" />
            ))} */}
          </Box>
        </Grid>
      </Grid>
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {renderStatusInfo()}
      </Box>
    </StyledPaper>
  );
}

function TabPanel({ children, value, index, ...other }) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`trade-tabpanel-${index}`}
      aria-labelledby={`trade-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `trade-tab-${index}`,
    'aria-controls': `trade-tabpanel-${index}`,
  };
}

function Trades() {
  const { accountProfile } = useContext(AppContext);
  const [tabValue, setTabValue] = useState(0);
  const [tradeHistory, setTradeHistory] = useState([]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
    fetchTradesHistory(newValue);
  };

  useEffect(() => {
    fetchTradesHistory(tabValue);
  }, []);
  
  const fetchTradesHistory = async(newTabValue) => {
    await axios.post(`${NFTRADE_URL}/trades`, {
      userAddress: accountProfile.account,
      tradeType: newTabValue
    })
    .then((res) => {
      setTradeHistory(res.data);
    });
  }

  return (
    <Box sx={{ p: 4 }}>
      <Typography variant="h4" gutterBottom fontWeight="bold">
        Active Trades
      </Typography>
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="trade tabs">
          <Tab label="Incoming" {...a11yProps(0)} />
          <Tab label="Outgoing" {...a11yProps(1)} />
        </Tabs>
      </Box>
      {
        tradeHistory.length > 0 ? 
        <>
          <TabPanel value={tabValue} index={0}>
            {
              tabValue === 0 &&  
              tradeHistory.map((trade, index) => 
                <TradeOffer key={index} {...trade} isOutgoing={false} />
              )
            }
          </TabPanel>
          <TabPanel value={tabValue} index={1}>
            {
              tabValue === 1 &&  (
              tradeHistory.map((trade, index) => 
                <TradeOffer key={index} {...trade} isOutgoing={true} />
              ))
            }
          </TabPanel>
        </>
        :
        <Stack alignItems="center" mt={10} justifyContent="center" height="100%">
          <ErrorOutlineIcon fontSize="large" sx={{ mb: 2, color: 'text.secondary' }} />
          <Typography variant="body1" color="text.secondary">
            No Trades found
          </Typography>
        </Stack>
      }
    </Box>
  );
}

export default Trades;