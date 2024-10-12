import { useContext, useState } from 'react';

import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import { Divider, IconButton, Stack, Typography } from '@mui/material';
import styled from '@emotion/styled';
import ClearIcon from '@mui/icons-material/Clear';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { enqueueSnackbar } from 'notistack';

import { isInstalled, getPublicKey, signMessage } from "@gemwallet/api";
import sdk from "@crossmarkio/sdk";

import LoginDialog from '../LoginDialog';
import { AppContext } from 'src/AppContext';
import axios from 'axios';

const WalletItem = styled(Stack)(({ theme }) => ({
  padding: "15px",
  cursor: "pointer",
  transition: "all 0.2s",
  "&:hover": {
    backgroundColor: theme.general.backgroundAlt
  }
}));


const WalletConnectModal = () => {
  const BASE_URL = 'https://api.xrpl.to/api';

  const {
    darkMode,
    openWalletModal,
    setOpenWalletModal,
    openLogin,
    qrUrl,
    nextUrl,
    handleLoginClose,
    handleLogin,
    onLogoutXumm,
    doLogIn
  } = useContext(AppContext);


  const handleClose = () => {
    setOpenWalletModal(false);
  };

  const handleConnectGem = () => {
    isInstalled().then((response) => {
      if (response.result.isInstalled) {
        getPublicKey().then(async (response) => {
          // console.log(`${response.result?.address} - ${response.result?.publicKey}`);
          const pubkey = response.result?.publicKey;
          //fetch nonce from /api/gem/nonce?pubkey=pubkey
          await axios.get(
            `${BASE_URL}/account/auth/gem/nonce?pubkey=${pubkey}&address=${response.result?.address}`
          )
            .then((res) => {
              const nonceToken = res.data.token;
              const opts = {
                headers: {
                  "Content-Type": "application/json",
                  Authorization: `Bearer ${nonceToken}`,
                },
              };
              signMessage(nonceToken).then(async (response) => {
                const signedMessage = response.result?.signedMessage;
                if (signedMessage !== undefined) {
                  await axios.post(`${BASE_URL}/account/auth/gem/check-sign?signature=${signedMessage}`, {}, opts)
                    .then((res) => {
                      const { profile } = res.data;
                      doLogIn({ ...profile, wallet_type: "gem" });
                      setOpenWalletModal(false);
                    });
                }
              });
            });
        });
      }
      else {
        enqueueSnackbar("GemWallet is not installed", { variant: "error" });
      }
    })
  };

  const handleConnectCrossmark = async () => {
    try {
      // if (!window.xrpl) {
      //   enqueueSnackbar("CrossMark wallet is not installed", { variant: "error" });
      //   return;
      // }
      // const { isCrossmark } = window.xrpl;
      // if (isCrossmark) {
        const hashR = await axios.get(`${BASE_URL}/account/auth/crossmark/hash`);
        const hashJson = hashR.data;
        const hash = hashJson.hash;
        const id = await sdk.methods.signInAndWait(hash);
        const address = id.response.data.address;
        const pubkey = id.response.data.publicKey;
        const signature = id.response.data.signature;
        await axios.post(
          `${BASE_URL}/account/auth/crossmark/check-sign?signature=${signature}`,
          {
            pubkey: pubkey,
            address: address,
          },
          {
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${hash}`,
            },
          }
        ).then((res) => {
          const { profile } = res.data;
          doLogIn({ ...profile, wallet_type: "crossmark" });
          setOpenWalletModal(false);
        }).catch(err => {

        });
      // }
    } catch (err) {
      console.log(err);
    }
  };

  return (
    <Dialog
      open={openWalletModal}
      onClose={handleClose}
      aria-labelledby="scroll-dialog-title"
      aria-describedby="scroll-dialog-description"
      PaperProps={{
        sx: {
          width: "100%",
          maxWidth: "450px",
        }
      }}
      sx={{
        zIndex: 9999
      }}
    >
      <DialogTitle>
        <Stack direction="row" justifyContent={openLogin ? "space-between" : "end"}>
          {
            openLogin &&
            <IconButton onClick={onLogoutXumm}>
              <ArrowBackIcon />
            </IconButton>
          }
          <IconButton onClick={handleClose}>
            <ClearIcon />
          </IconButton>
        </Stack>
      </DialogTitle>
      <DialogContent sx={{ paddingBottom: "60px" }}>
        {
          openLogin ?
            <LoginDialog
              open={openLogin}
              handleClose={handleLoginClose}
              qrUrl={qrUrl}
              nextUrl={nextUrl}
            />
            :
            <>
              <Typography variant="modal" mb={2}>Login</Typography>
              <Stack
                spacing={0.5}
              >
                <WalletItem direction="row" spacing={2} alignItems="center" onClick={handleLogin}>
                  <img src="/icons/xaman.png" />
                  <Typography variant="h3">Xaman</Typography>
                </WalletItem>
                <Divider />

                <WalletItem direction="row" spacing={2} alignItems="center" onClick={handleConnectGem}>
                  <img src="/icons/gem.svg" />
                  <Typography variant="h3">GemWallet</Typography>
                </WalletItem>
                <Divider />

                <WalletItem direction="row" spacing={2} alignItems="center" onClick={handleConnectCrossmark}>
                  <img src="/icons/crossmark.png" />
                  <Typography variant="h3">CrossMark</Typography>
                </WalletItem>
              </Stack>
            </>
        }


      </DialogContent>
    </Dialog>
  )
}

export default WalletConnectModal;