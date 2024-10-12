import axios from 'axios';
import { useState, useEffect } from 'react';

// Material
import {
    useTheme,
    Backdrop,
    Button
} from '@mui/material';

// Iconify
import { Icon } from '@iconify/react';

// Context
import { useContext } from 'react';
import { AppContext } from 'src/AppContext'

// Loader
import { PulseLoader } from "react-spinners";

// Components
import QRDialog from 'src/components/QRDialog';
import ConfirmBurnDialog from './ConfirmBurnDialog';
import { isInstalled, submitTransaction } from '@gemwallet/api';
import sdk from "@crossmarkio/sdk";
import { updateProcess, updateTxHash } from 'src/redux/transactionSlice';
import { useDispatch } from 'react-redux';
import { configureMemos } from 'src/utils/parse/OfferChanges';

// ----------------------------------------------------------------------
export default function BurnNFT({ nft, onHandleBurn }) {
    const theme = useTheme();
    const BASE_URL = 'https://api.xrpnft.com/api';

    const dispatch = useDispatch();
    const { accountProfile, openSnackbar } = useContext(AppContext);
    const accountLogin = accountProfile?.account;
    const accountToken = accountProfile?.token;

    const [openScanQR, setOpenScanQR] = useState(false);
    const [xummUuid, setXummUuid] = useState(null);
    const [qrUrl, setQrUrl] = useState(null);
    const [nextUrl, setNextUrl] = useState(null);

    const [loading, setLoading] = useState(false);

    const [openConfirm, setOpenConfirm] = useState(false);

    const {
        flag = 0,
        account = '',
        NFTokenID = ''
    } = nft || {};

    // const isBurnable = (flag & 0x00000001) > 0;
    const isBurnable = accountLogin === account && account !== '';

    useEffect(() => {
        var timer = null;
        var isRunning = false;
        var counter = 150;
        async function getPayload() {
            console.log(counter + " " + isRunning, xummUuid);
            if (isRunning) return;
            isRunning = true;
            try {
                const ret = await axios.get(`${BASE_URL}/burn/one/${xummUuid}?account=${accountLogin}`, { headers: { 'x-access-token': accountToken } });
                const resolved_at = ret.data?.resolved_at;
                const dispatched_result = ret.data?.dispatched_result;
                if (resolved_at) {
                    setOpenScanQR(false);
                    if (dispatched_result === 'tesSUCCESS') {
                        onHandleBurn();
                        openSnackbar('Burning NFT successful!', 'success');
                        window.location.href = `/congrats/burnnft/${nft.uuid}`;
                    }
                    else
                        openSnackbar('Burning NFT rejected!', 'error');

                    return;
                }
            } catch (err) {
                console.log(err);
            }
            isRunning = false;
            counter--;
            if (counter <= 0) {
                openSnackbar('Burning NFT timeout!', 'error');
                handleScanQRClose();
            }
        }
        if (openScanQR) {
            timer = setInterval(getPayload, 2000);
        }
        return () => {
            if (timer) {
                clearInterval(timer)
            }
        };
    }, [openScanQR, xummUuid]);

    const onBurnNFTXumm = async () => {
        if (!accountLogin || !accountToken) {
            openSnackbar('Please login', 'error');
            return;
        }

        setLoading(true);
        try {
            const user_token = accountProfile?.user_token;
            const wallet_type = accountProfile?.wallet_type;

            const burnTxData = {
                TransactionType: "NFTokenBurn",
                Account: accountLogin,
                Owner: account,
                NFTokenID,
                Memos: configureMemos('XRPNFT-nft-burn', '', `https://xrpnft.com`)
            };

            switch (wallet_type) {
                case "xaman":
                    const body = { account: accountLogin, NFTokenID, owner: account, user_token };

                    const res = await axios.post(`${BASE_URL}/burn/one`, body, { headers: { 'x-access-token': accountToken } });

                    if (res.status === 200) {
                        const uuid = res.data.data.uuid;
                        const qrlink = res.data.data.qrUrl;
                        const nextlink = res.data.data.next;

                        setXummUuid(uuid);
                        setQrUrl(qrlink);
                        setNextUrl(nextlink);
                        setOpenScanQR(true);
                    }
                    break;
                case "gem":
                    isInstalled().then(async (response) => {
                        if (response.result.isInstalled) {
                            dispatch(updateProcess(1));
                            await submitTransaction({
                                transaction: burnTxData
                            }).then(({ type, result }) => {
                                if (type == "response") {
                                    dispatch(updateProcess(2));
                                    dispatch(updateTxHash(result?.hash));
                                }

                                else {
                                    dispatch(updateProcess(3));
                                }
                            });
                        }
                    });
                    break;
                case "crossmark":
                    dispatch(updateProcess(1));
                    await sdk.methods.signAndSubmitAndWait(burnTxData)
                        .then(({ response }) => {
                            if (response.data.meta.isSuccess) {
                                dispatch(updateProcess(2));
                                dispatch(updateTxHash(response.data.resp.result?.hash));

                            } else {
                                dispatch(updateProcess(3));
                            }
                        });
                    break;
            }
        } catch (err) {
            console.error(err);
            openSnackbar('Network error!', 'error');
            dispatch(updateProcess(0));
        }
        setLoading(false);
    };

    const onDisconnectXumm = async (uuid) => {
        setLoading(true);
        try {
            const res = await axios.delete(`${BASE_URL}/offers/create/${uuid}`, { headers: { 'x-access-token': accountToken } });
            if (res.status === 200) {
                setXummUuid(null);
            }
        } catch (err) {
        }
        setLoading(false);
    };

    const handleScanQRClose = () => {
        setOpenScanQR(false);
        onDisconnectXumm(xummUuid);
    };

    const handleBurnNFT = () => {
        setOpenConfirm(true);
        // onBurnNFTXumm();
    }

    return (
        <>
            <Backdrop
                sx={{ color: "#000", zIndex: 1303 }}
                open={loading}
            >
                <PulseLoader color={"#FF4842"} size={10} />
            </Backdrop>

            <ConfirmBurnDialog open={openConfirm} setOpen={setOpenConfirm} onContinue={onBurnNFTXumm} />

            <Button
                variant='outlined'
                fullWidth
                // sx={{ minWidth: 150 }}
                color='warning'
                startIcon={<Icon icon='ps:feedburner' />}
                onClick={() => handleBurnNFT()}
                disabled={!accountLogin || !isBurnable || !nft} // Added !nft check
            >
                Burn
            </Button>

            <QRDialog
                open={openScanQR}
                type="NFTokenBurn"
                onClose={handleScanQRClose}
                qrUrl={qrUrl}
                nextUrl={nextUrl}
            />
        </>
    );
}
