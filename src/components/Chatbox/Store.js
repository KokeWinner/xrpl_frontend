import React, { useState, useContext, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Snackbar,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Backdrop
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { AppContext } from 'src/AppContext';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ConfirmPurchaseDialog from './ConfirmPurchaseDialog';
import { isInstalled, submitTransaction } from '@gemwallet/api';
import axios from 'axios';
import sdk from '@crossmarkio/sdk';
import { ProgressBar } from 'react-loader-spinner';
import QRDialog from 'src/components/QRDialog';
import { ranks, verifiedStatus } from './RankItems';
import RankItem from './RankItem';

const chatURL = 'http://65.108.136.237:5000';
const BASE_URL = process.env.API_URL;

function Store() {
  const theme = useTheme();
  const { accountProfile, enqueueSnackbar } = useContext(AppContext);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [expandedCategory, setExpandedCategory] = useState(null);
  const [openConfirm, setOpenConfirm] = useState(false);
  const [rank, setRank] = useState(null);
  const [pageLoading, setPageLoading] = useState(false);
  const [openScanQR, setOpenScanQR] = useState(false);
  const [uuid, setUuid] = useState(null);
  const [qrUrl, setQrUrl] = useState(null);
  const [nextUrl, setNextUrl] = useState(null);
  const [purchasedFeatures, setPurchasedFeatures] = useState([]);

  const updatePurchasedFeatures = (newFeature) => {
    setPurchasedFeatures(prevFeatures => [
      ...prevFeatures,
      {
        id: newFeature.id,
        purchaseDate: new Date().toISOString(),
        transactionHash: newFeature.transactionHash
      }
    ]);
  };

  useEffect(() => {
    var timer = null;
    var isRunning = false;
    var counter = 150;
    var dispatchTimer = null;

    async function getDispatchResult() {
      try {
        const ret = await axios.get(`${BASE_URL}/xumm/payload/${uuid}`);
        const res = ret.data.data.response;
        return res;
      } catch (err) {
        console.error('Error getting dispatch result:', err);
        return null;
      }
    }

    const startInterval = () => {
      let times = 0;

      dispatchTimer = setInterval(async () => {
        const result = await getDispatchResult();

        if (result && result.dispatched_result === 'tesSUCCESS') {
          const response = await fetch(`${chatURL}/api/purchase-chat-feature`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              account: accountProfile.account,
              feature: `${rank.id}`,
              transactionHash: result?.txid
            })
          });

          if (response.ok) {
            setSnackbarMessage(`Successfully purchased ${rank.name} rank!`);
            setSnackbarOpen(true);
            updatePurchasedFeatures({ id: rank.id, transactionHash: result?.txid });
          } else {
            setSnackbarMessage(`Purchase failed. Please try again.`);
            setSnackbarOpen(true);
          }

          stopInterval();
          return;
        }

        times++;

        if (times >= 10) {
          setSnackbarMessage(`Purchase timed out. Please try again.`);
          setSnackbarOpen(true);
          stopInterval();
          return;
        }
      }, 1000);
    };

    // Stop the interval
    const stopInterval = () => {
      clearInterval(dispatchTimer);
      setOpenScanQR(false);
    };

    async function getPayload() {
      if (isRunning) return;
      isRunning = true;
      try {
        const ret = await axios.get(`${BASE_URL}/xumm/payload/${uuid}`);
        const res = ret.data.data.response;
        const resolved_at = res.resolved_at;
        if (resolved_at) {
          startInterval();
          return;
        }
      } catch (err) {}
      isRunning = false;
      counter--;
      if (counter <= 0) {
        setSnackbarMessage('Timeout!');
        setSnackbarOpen(true);
        handleScanQRClose();
      }
    }
    if (openScanQR) {
      timer = setInterval(getPayload, 2000);
    }
    return () => {
      if (timer) {
        clearInterval(timer);
      }
    };
  }, [openScanQR, uuid, accountProfile, rank]);

  const handlePurchase = async () => {
    if (!accountProfile?.account) {
      setSnackbarMessage('Please connect your XRP wallet to make a purchase.');
      setSnackbarOpen(true);
      return;
    }
    const wallet_type = accountProfile?.wallet_type;
    setPageLoading(true);
    try {
      console.log('Account Profile:', accountProfile);

      const response = await fetch(`${chatURL}/api/request-new-chat-feature`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          account: accountProfile.account,
          feature: `${rank.id}`
        })
      });

      if (response.ok) {
        console.log('Feature request successful');
        let body = {
          TransactionType: 'Payment',
          Account: accountProfile.account,
          Amount: `${rank.price * 1000000}`,
          Destination: 'rhsxg4xH8FtYc3eR53XDSjTGfKQsaAGaqm',
          Fee: '12',
          SourceTag: 20221212
        };
        console.log('Transaction body:', body);

        if (wallet_type == 'xaman') {
          console.log('Initiating XUMM transfer');
          const res2 = await axios.post(`${BASE_URL}/xumm/transfer`, body);
          console.log('XUMM transfer response:', res2.data);

          if (res2.status === 200) {
            const uuid = res2.data.data.uuid;
            const qrlink = res2.data.data.qrUrl;
            const nextlink = res2.data.data.next;

            setUuid(uuid);
            setQrUrl(qrlink);
            setNextUrl(nextlink);
            setOpenScanQR(true);
            setSnackbarMessage('Please complete the payment in XUMM.');
            setSnackbarOpen(true);
          }
        } else if (wallet_type == 'gem') {
          await isInstalled().then(async (response) => {
            if (response.result.isInstalled) {
              await submitTransaction({
                transaction: body
              }).then(async ({ type, result }) => {
                if (type === 'response') {
                  const response = await fetch(`${chatURL}/api/purchase-chat-feature`, {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                      account: accountProfile.account,
                      feature: `${rank.id}`,
                      transactionHash: result?.hash
                    })
                  });
                  if (response.ok) {
                    setSnackbarMessage(`Successfully purchased ${rank.name} rank!`);
                    setSnackbarOpen(true);
                    updatePurchasedFeatures({ id: rank.id, transactionHash: result?.hash });
                  } else {
                    setSnackbarMessage(`Purchase failed. Please try again.`);
                    setSnackbarOpen(true);
                  }
                } else {
                  setPageLoading(false);
                }
              });
            } else {
              enqueueSnackbar('GemWallet is not installed', { variant: 'error' });
              setPageLoading(false);
            }
          });
        } else if (wallet_type == 'crossmark') {
          await sdk.methods.signAndSubmitAndWait(body).then(async ({ response }) => {
            if (response.data.meta.isSuccess) {
              const response = await fetch(`${chatURL}/api/purchase-chat-feature`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                  account: accountProfile.account,
                  feature: `${rank.id}`,
                  transactionHash: response.data.resp.result?.hash
                })
              });
              if (response.ok) {
                setSnackbarMessage(`Successfully purchased ${rank.name} rank!`);
                setSnackbarOpen(true);
                updatePurchasedFeatures({ id: rank.id, transactionHash: response.data.resp.result?.hash });
              } else {
                setSnackbarMessage(`Purchase failed. Please try again.`);
                setSnackbarOpen(true);
              }
            } else {
              setPageLoading(false);
            }
          });
        }
      } else {
        console.log('Feature request failed');
        setSnackbarMessage('Failed to purchase rank. Please check your XRP balance and try again.');
        setSnackbarOpen(true);
      }
    } catch (error) {
      console.error('Error purchasing rank:', error);
      setSnackbarMessage('An error occurred. Please try again later.');
      setSnackbarOpen(true);
    }

    setPageLoading(false);
  };

  const onDisconnectXumm = async (uuid) => {
    setPageLoading(true);
    try {
      const res = await axios.delete(`${BASE_URL}/xumm/logout/${uuid}`);
      if (res.status === 200) {
        setUuid(null);
      }
    } catch (err) {}
    setPageLoading(false);
  };

  const handleScanQRClose = () => {
    setOpenScanQR(false);
    onDisconnectXumm(uuid);
  };

  const chooseRank = (item) => {
    setRank(item);
    setOpenConfirm(true);
  };

  const handleCategoryChange = (category) => (event, isExpanded) => {
    setExpandedCategory(isExpanded ? category : null);
  };

  const renderContent = (items) => (
    <Grid container spacing={2}>
      {items.map((item) => {
        const purchasedFeature = purchasedFeatures.find(f => f.id === item.id);
        return (
          <Grid item xs={12} sm={6} key={item.id}>
            <RankItem 
              item={item} 
              onPurchase={chooseRank} 
              isPurchased={!!purchasedFeature}
              purchaseDate={purchasedFeature?.purchaseDate}
              transactionHash={purchasedFeature?.transactionHash}
            />
          </Grid>
        );
      })}
    </Grid>
  );

  useEffect(() => {
    const fetchPurchasedFeatures = async () => {
      if (accountProfile?.account) {
        try {
          const response = await fetch(`${chatURL}/api/get-purchased-ranks`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({ account: accountProfile.account })
          });
          if (response.ok) {
            const data = await response.json();
            // Update this to include more details about each feature
            setPurchasedFeatures(data.chatFeatures
              .filter(feature => feature.status)
              .map(feature => ({
                id: feature.feature,
                purchaseDate: feature.purchaseDate || null,
                transactionHash: feature.transactionHash || null
              }))
            );
          }
        } catch (error) {
          console.error('Error fetching purchased features:', error);
        }
      }
    };

    fetchPurchasedFeatures();
  }, [accountProfile]);

  return (
    <>
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
      <Box sx={{ p: 2, backgroundColor: theme.palette.background.default }}>
        <ConfirmPurchaseDialog
          open={openConfirm}
          setOpen={setOpenConfirm}
          onContinue={handlePurchase}
        />
        <QRDialog
          open={openScanQR}
          type="Payment"
          onClose={handleScanQRClose}
          qrUrl={qrUrl}
          nextUrl={nextUrl}
        />
        <Typography
          variant="h6"
          gutterBottom
          sx={{
            fontWeight: 'bold',
            color: theme.palette.primary.main,
            mb: 2,
            textAlign: 'center'
          }}
        >
          XRP Ledger Chat Premium Features
        </Typography>

        <Accordion expanded={expandedCategory === 'ranks'} onChange={handleCategoryChange('ranks')}>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1">XRP Ledger Chat Ranks</Typography>
          </AccordionSummary>
          <AccordionDetails>{renderContent(ranks)}</AccordionDetails>
        </Accordion>

        <Accordion
          expanded={expandedCategory === 'verified'}
          onChange={handleCategoryChange('verified')}
        >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle1">Special Status</Typography>
          </AccordionSummary>
          <AccordionDetails>{renderContent([verifiedStatus])}</AccordionDetails>
        </Accordion>

        <Snackbar
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={() => setSnackbarOpen(false)}
          message={snackbarMessage}
        />
      </Box>
    </>
  );
}

export default Store;
