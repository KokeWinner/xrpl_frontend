import axios from 'axios';
import { useRef, useState, useEffect } from 'react';
import { FacebookShareButton, TwitterShareButton } from "react-share";
import { FacebookIcon, TwitterIcon } from "react-share";

// Material
import {
    useTheme, useMediaQuery,
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Avatar,
    Backdrop,
    Box,
    Button,
    Divider,
    Grid,
    IconButton,
    Link,
    Paper,
    Popover,
    Stack,
    Typography,
    Tooltip,
} from '@mui/material';
import ListIcon from '@mui/icons-material/List';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import TimelineIcon from '@mui/icons-material/Timeline';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import PanToolIcon from '@mui/icons-material/PanTool';
import SendIcon from '@mui/icons-material/Send';
import HistoryIcon from '@mui/icons-material/History';
import ShareIcon from '@mui/icons-material/Share';
import VerifiedIcon from '@mui/icons-material/Verified';
import LeaderboardOutlinedIcon from '@mui/icons-material/LeaderboardOutlined';
import MessageIcon from '@mui/icons-material/Message';
import MessageOutlinedIcon from '@mui/icons-material/MessageOutlined';

// Iconify
import { Icon } from '@iconify/react';

import infoFilled from '@iconify/icons-ep/info-filled';

// Loader
import { PuffLoader, PulseLoader } from "react-spinners";
import { ProgressBar, Discuss } from 'react-loader-spinner';

// Context
import { useContext } from 'react';
import { AppContext } from 'src/AppContext';

// Utils
import { NFToken, getMinterName } from "src/utils/constants";
import { normalizeAmount } from 'src/utils/normalizers';
import { fNumber, fIntNumber } from 'src/utils/formatNumber';
import { getHashIcon } from 'src/utils/extra';

// Components
import CreateOfferDialog from './CreateOfferDialog';
import QRDialog from 'src/components/QRDialog';
import ConfirmAcceptOfferDialog from './ConfirmAcceptOfferDialog';
// import TimePeriods from './TimePeriodsDropdown';
import OffersList from './OffersList';
import SelectPriceDialog from './SelectPriceDialog';

import BurnNFT from './BurnNFT';
import TransferDialog from './TransferDialog';
import HistoryList from './HistoryList';
import { isInstalled, submitTransaction } from '@gemwallet/api';
import sdk from "@crossmarkio/sdk";
import { configureMemos } from 'src/utils/parse/OfferChanges';
import { useDispatch } from 'react-redux';
import { updateProcess, updateTxHash } from 'src/redux/transactionSlice';

// const NFT_FLAGS = {
//     0x00000001: 'lsfBurnable',
//     0x00000002: 'lsfOnlyXRP',
//     0x00000004: 'lsfTrustLine',
//     0x00000008: 'lsfTransferable',
// }

function getCostFromOffers(nftOwner, offers, isSellOffer) {
    let xrpCost = null;
    let noXrpCost = null;
    for (const offer of offers) {
        const {
            amount,
            destination,
            flags,
            nft_offer_index,
            owner
        } = offer;

        let validOffer = true;

        if (destination) validOffer = false;

        if (isSellOffer && nftOwner !== owner) validOffer = false;

        if (!validOffer) continue;

        const cost = normalizeAmount(amount);

        cost.offer = offer;

        if (cost.currency === "XRP") {
            if (xrpCost) {
                if (isSellOffer) {
                    if (cost.amount < xrpCost.amount)
                        xrpCost = cost;
                } else {
                    if (cost.amount > xrpCost.amount)
                        xrpCost = cost;
                }
            } else {
                xrpCost = cost;
            }
        } else {
            if (noXrpCost) {
                // Do nothing for now.
            } else {
                noXrpCost = cost;
            }
        }
    }

    return xrpCost || noXrpCost;
}

function truncate(str, n) {
    if (!str) return '';
    //return (str.length > n) ? str.substr(0, n-1) + '&hellip;' : str;
    return (str.length > n) ? str.substr(0, n - 1) + ' ...' : str;
};

export default function NFTActions({ nft }) {
    const anchorRef = useRef(null);
    const BASE_URL = 'https://api.xrpnft.com/api';
    const { accountProfile, openSnackbar } = useContext(AppContext);
    const accountLogin = accountProfile?.account;
    const accountToken = accountProfile?.token;

    // const theme = useTheme();
    // const largescreen = useMediaQuery(theme => theme.breakpoints.up('md'));

    const dispatch = useDispatch();
    const {
        uuid,
        name,
        collection,
        cslug,
        cverified,
        cfloor,
        citems,
        rarity_rank,
        flag,
        type,
        account,
        minter,
        issuer,
        date,
        meta,
        URI,
        status,
        // cost,
        destination,
        NFTokenID,
        self
    } = nft;

    const collectionName = collection || meta?.collection?.name || '[No Collection]';

    const nftName = meta?.name || meta?.Name || '[No Name]';

    const floorPrice = cfloor?.amount || 0;

    const accountLogo = getHashIcon(account);

    const shareUrl = `https://xrpnft.com/nft/${NFTokenID}`;
    const shareTitle = nftName;
    const shareDesc = meta?.description || '';

    const isOwner = accountLogin === account;
    const isBurnable = (flag & 0x00000001) > 0;

    const [openShare, setOpenShare] = useState(false);

    const [openCreateOffer, setOpenCreateOffer] = useState(false);
    const [openTransfer, setOpenTransfer] = useState(false);
    const [isSellOffer, setIsSellOffer] = useState(false);

    const [burnt, setBurnt] = useState(status === NFToken.BURNT);

    const [sellOffers, setSellOffers] = useState([]);
    const [buyOffers, setBuyOffers] = useState([]);

    const [loading, setLoading] = useState(true);
    const [pageLoading, setPageLoading] = useState(false);

    const [acceptOffer, setAcceptOffer] = useState(null);
    const [openConfirm, setOpenConfirm] = useState(false);
    const [openSelectPrice, setOpenSelectPrice] = useState(false);

    const [openScanQR, setOpenScanQR] = useState(false);
    const [xummUuid, setXummUuid] = useState(null);
    const [qrUrl, setQrUrl] = useState(null);
    const [nextUrl, setNextUrl] = useState(null);
    const [qrType, setQrType] = useState("NFTokenAcceptOffer");

    const [cost, setCost] = useState(null);

    const [sync, setSync] = useState(0);

    useEffect(() => {
        function getOffers() {
            setLoading(true);
            axios.get(`${BASE_URL}/offers/${NFTokenID}`)
                .then(res => {
                    let ret = res.status === 200 ? res.data : undefined;
                    if (ret) {
                        const offers = ret.sellOffers;
                        const nftOwner = nft.account;
                        setCost(getCostFromOffers(nftOwner, offers, true));

                        setSellOffers(getValidOffers(ret.sellOffers, true));
                        setBuyOffers(getValidOffers(ret.buyOffers, false));
                    }
                }).catch(err => {
                    console.log("Error on getting nft offers list!!!", err);
                }).then(function () {
                    // always executed
                    setLoading(false);
                });
        }
        getOffers();
    }, [sync]);

    useEffect(() => {
        var timer = null;
        var isRunning = false;
        var counter = 150;
        var dispatchTimer = null;

        async function getDispatchResult() {
            try {
                const ret = await axios.get(`${BASE_URL}/offers/acceptcancel/${xummUuid}`);
                const res = ret.data.data.response;
                // const account = res.account;
                const dispatched_result = res.dispatched_result;

                return dispatched_result;
            } catch (err) { }
        }

        const startInterval = () => {
            let times = 0;

            dispatchTimer = setInterval(async () => {
                const dispatched_result = await getDispatchResult();

                if (dispatched_result && dispatched_result === 'tesSUCCESS') {
                    setSync(sync + 1);
                    openSnackbar('Successful!', 'success');
                    stopInterval();
                    return;
                }

                times++;

                if (times >= 15) {
                    openSnackbar('Rejected!', 'error');
                    stopInterval();
                    return;
                }
            }, 1200);
        };

        // Stop the interval
        const stopInterval = () => {
            clearInterval(dispatchTimer);
            handleScanQRClose();
        };

        async function getPayload() {
            console.log(counter + " " + isRunning, xummUuid);
            if (isRunning) return;
            isRunning = true;
            try {
                const ret = await axios.get(`${BASE_URL}/offers/acceptcancel/${xummUuid}`);
                const resolved_at = ret.data?.resolved_at;
                // const dispatched_result = ret.data?.dispatched_result;
                if (resolved_at) {
                    startInterval();
                    return;
                }
            } catch (err) {
            }
            isRunning = false;
            counter--;
            if (counter <= 0) {
                openSnackbar('Timeout!', 'error');
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
    }, [openScanQR, xummUuid, sync]);

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
                openSnackbar('You are the owner of this offer, you can not accept it.', 'error');
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
            const {
                uuid,
                NFTokenID
            } = nft;

            const user_token = accountProfile.user_token;
            const wallet_type = accountProfile.wallet_type;

            let offerTxData = {
                TransactionType: isAcceptOrCancel ? "NFTokenAcceptOffer" : "NFTokenCancelOffer",
                Memos: isAcceptOrCancel ? configureMemos(isSell ? 'XRPNFT-nft-accept-sell-offer' : 'XRPNFT-nft-accept-buy-offer', '', `https://xrpnft.com/nft/${NFTokenID}`) : configureMemos(isSell ? 'XRPNFT-nft-cancel-sell-offer' : 'XRPNFT-nft-cancel-buy-offer', '', `https://xrpnft.com/nft/${NFTokenID}`),
                NFTokenOffers: !isAcceptOrCancel ? [index] : undefined,
                Account: accountLogin
            };

            if (isAcceptOrCancel) {
                if (isSell) {
                    offerTxData["NFTokenSellOffer"] = index;
                }
                else {
                    offerTxData["NFTokenBuyOffer"] = index;
                }
            }

            switch (wallet_type) {
                case "xaman":
                    const body = {
                        account: accountLogin,
                        uuid,
                        NFTokenID,
                        index,
                        destination,
                        accept: isAcceptOrCancel ? "yes" : "no",
                        sell: isSell ? "yes" : "no",
                        user_token
                    };


                    const res = await axios.post(`${BASE_URL}/offers/acceptcancel`, body, { headers: { 'x-access-token': accountToken } });

                    if (res.status === 200) {
                        const newUuid = res.data.data.uuid;
                        const qrlink = res.data.data.qrUrl;
                        const nextlink = res.data.data.next;

                        let newQrType = isAcceptOrCancel ? "NFTokenAcceptOffer" : "NFTokenCancelOffer";
                        if (isSell)
                            newQrType += " [Sell Offer]";
                        else
                            newQrType += " [Buy Offer]";

                        setQrType(newQrType);
                        setXummUuid(newUuid);
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
                                transaction: offerTxData
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
                    await sdk.methods.signAndSubmitAndWait(offerTxData)
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
            dispatch(updateProcess(0));
        }
        setPageLoading(false);
    };

    const onDisconnectXumm = async () => {
        setPageLoading(true);
        try {
            const res = await axios.delete(`${BASE_URL}/offers/acceptcancel/${xummUuid}`);
            // if (res.status === 200) {
            //     setXummUuid(null);
            // }
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

    const getValidOffers = (offers, isSell) => {
        const newOffers = []
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
                        if (nft.account === offer.owner && (!offer.destination || accountLogin === offer.destination)) {
                            newOffers.push(offer);
                        }
                    }
                }
            } else {
                // Buy Offers
                if (isOwner) {
                    // I am the Owner of NFT
                } else {
                    // I am not the Owner of NFT
                }

                if (!offer.destination || accountLogin === offer.destination)
                    // if ((!offer.destination || accountLogin === offer.destination) && offer.)
                    newOffers.push(offer);
            }
        }

        return newOffers;
    }

    const handleCreateSellOffer = () => {
        setIsSellOffer(true);
        setOpenCreateOffer(true);
    }

    const handleTransfer = () => {
        setOpenTransfer(true);
    }

    const handleCreateBuyOffer = () => {
        setIsSellOffer(false);
        setOpenCreateOffer(true);
    }

    const onHandleBurn = () => {
        setBurnt(true);
    }

    const handleCancelOffer = async (offer) => {
        // Sell Offer
        /*
        {
            "amount": {
                "currency": "534F4C4F00000000000000000000000000000000",
                "issuer": "rsoLo2S1kiGeCcn6hCUXVrCpGMWLrRrLZz",
                "value": "10"
            },
            "flags": 1,
            "nft_offer_index": "2212BFA0AAF995E9F9E9B6553DC97A1C37FB97334BBE8C5856CF7C7B1016D20E",
            "owner": "rHAfrQNDBohGbWuWTWzpJe1LQWyYVnbG2n"
        },
        {
            "amount": "10000000",
            "flags": 1,
            "nft_offer_index": "DF13A4FE5F44FF804015ED5C827F753BB7A1379651D88473CB50454EB0B89F17",
            "owner": "rHAfrQNDBohGbWuWTWzpJe1LQWyYVnbG2n"
        }
        */

        doProcessOffer(offer, false);
    }

    const handleAcceptOffer = async (offer) => {
        setAcceptOffer(offer);
        setOpenConfirm(true);
    }

    const onContinueAccept = async () => {
        doProcessOffer(acceptOffer, true);
    }

    const handleBuyNow = async () => {
        if (sellOffers.length > 1) {
            setOpenSelectPrice(true);
        } else {
            handleAcceptOffer(cost.offer);
        }
    }

    const handleOpenShare = () => {
        setOpenShare(true);
    }

    const handleCloseShare = () => {
        setOpenShare(false);
    };

    return (
        <Stack spacing={2}>
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
                    borderColor='#F4442E'
                    barColor='#51E5FF'
                />
            </Backdrop>

            <ConfirmAcceptOfferDialog open={openConfirm} setOpen={setOpenConfirm} offer={acceptOffer} onContinue={onContinueAccept} />

            <QRDialog
                open={openScanQR}
                type={qrType}
                onClose={handleScanQRClose}
                qrUrl={qrUrl}
                nextUrl={nextUrl}
            />

            <CreateOfferDialog
                open={openCreateOffer}
                setOpen={setOpenCreateOffer}
                nft={nft}
                isSellOffer={isSellOffer}
            />
            <TransferDialog
                open={openTransfer}
                setOpen={setOpenTransfer}
                nft={nft}
            />

            <SelectPriceDialog
                open={openSelectPrice}
                setOpen={setOpenSelectPrice}
                offers={sellOffers}
                handleAccept={handleAcceptOffer}
            />

            {self &&
                <Stack direction="row" spacing={2} justifyContent="space-between" sx={{ mt: 2, mb: 2 }}>
                    <Stack spacing={1}>
                        <Stack direction="row" spacing={1} alignItems="center">
                            <Link href={`/collection/${cslug}`} underline='none'>
                                <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.main' }}>{collectionName}</Typography>
                            </Link>
                            {cverified === 'yes' &&
                                <Tooltip title='Verified'>
                                    <VerifiedIcon fontSize="small" sx={{ color: "primary.main" }} />
                                </Tooltip>
                            }
                        </Stack>

                        <Stack direction="row" spacing={1} alignItems='center'>
                            <Typography variant="body2" sx={{ color: 'text.secondary' }}>Global Floor</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{fNumber(floorPrice)} XRP</Typography>
                        </Stack>
                    </Stack>

                    <Stack direction="row" alignItems="center" spacing={2}>
                        <Tooltip title="Share">
                            <IconButton 
                                size='large'
                                sx={{ 
                                    bgcolor: 'background.paper',
                                    boxShadow: 1,
                                    '&:hover': { bgcolor: 'primary.lighter' }
                                }}
                                ref={anchorRef}
                                onClick={handleOpenShare}
                            >
                                <ShareIcon sx={{ color: 'primary.main' }} />
                            </IconButton>
                        </Tooltip>

                        <Popover
                            open={openShare}
                            onClose={handleCloseShare}
                            anchorEl={anchorRef.current}
                            anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                            transformOrigin={{ vertical: 'top', horizontal: 'right' }}
                            PaperProps={{
                                elevation: 3,
                                sx: { borderRadius: 2, p: 1 }
                            }}
                        >
                            <Stack direction="row" spacing={2}>
                                <FacebookShareButton
                                    url={shareUrl}
                                    quote={shareTitle}
                                    hashtag={"#"}
                                    description={shareDesc}
                                    onClick={handleCloseShare}
                                >
                                    <FacebookIcon size={32} round />
                                </FacebookShareButton>
                                <TwitterShareButton
                                    title={shareTitle}
                                    url={shareUrl}
                                    hashtag={"#"}
                                    onClick={handleCloseShare}
                                >
                                    <TwitterIcon size={32} round />
                                </TwitterShareButton>
                            </Stack>
                        </Popover>
                    </Stack>
                </Stack>
            }

            <Stack spacing={2} sx={{ mt: 2 }}>
                {/* <Link underline='none' color={'text.primary'}>
                    Name
                </Link> */}
                <Typography variant='h2a'>{nftName}</Typography>
            </Stack>

            {/* {meta?.description &&
                <Typography variant="s7">{meta.description}</Typography>
            } */}

            {self && rarity_rank > 0 &&
                <Stack direction="row" >
                    <Tooltip title={`Rarity Rank #${fIntNumber(rarity_rank)} / ${fIntNumber(citems)}`}>
                        <Stack direction="row" spacing={1} alignItems="center" >
                            <LeaderboardOutlinedIcon sx={{ width: '14px' }} width="auto" style={{ color: '#B2B2B2' }} />
                            <Typography variant="s7"><Typography variant="s14">{fIntNumber(rarity_rank)}</Typography> / {fIntNumber(citems)}</Typography>
                        </Stack>
                    </Tooltip>
                </Stack>
            }

            <Stack direction="row" spacing={1} alignItems="center">
                <Avatar alt="C" src={accountLogo} variant="square" style={{ width: '32px', height: '32px' }} />
                <Stack spacing={0}>
                    <Typography variant="s7">Owner</Typography>
                    <Link
                        // color="inherit"
                        // target="_blank"
                        href={`/account/${account}`}
                    // rel="noreferrer noopener nofollow"
                    >
                        <Typography variant='s15' noWrap> {truncate(account, 16)}</Typography>
                    </Link>
                </Stack>
                {/*   <Tooltip title="Contact owner via XRPNFT chat"> 
                    <IconButton size='small' sx={{ padding: 1 }}
                        onClick={() => {
                        }}
                    >
                        <MessageOutlinedIcon fontSize="small" />
                    </IconButton>
                </Tooltip> */}
            </Stack>

            {/* Make offer start */}
            <Paper
                sx={{
                    padding: 2,
                }}
            >
                {burnt ?
                    <Typography variant="s5">This NFT is burnt.</Typography>
                    :
                    <>
                        {destination && getMinterName(account) ? (
                            <>
                                {destination === accountLogin ? (
                                    <Paper elevation={3} sx={{ 
                                        backgroundColor: 'transparent', 
                                        borderRadius: '8px', 
                                        padding: '16px'
                                    }}>
                                        <Typography variant="h6" sx={{ fontWeight: 600, marginBottom: '8px' }}>
                                            Incoming NFT Transfer
                                        </Typography>
                                        <Typography variant="body1" sx={{ display: 'flex', alignItems: 'center' }}>
                                            This NFT is being transferred to you. 
                                            <Button 
                                                variant="contained" 
                                                color="success" 
                                                size="small" 
                                                startIcon={<CheckCircleOutlineIcon />}
                                                sx={{ marginLeft: '8px', textTransform: 'none' }}
                                            >
                                                Accept Transfer
                                            </Button>
                                        </Typography>
                                    </Paper>
                                ) : (
                                    <Paper elevation={3} sx={{ 
                                        backgroundColor: 'transparent', 
                                        borderRadius: '8px', 
                                        padding: '16px'
                                    }}>
                                        <Typography variant="h6" sx={{ fontWeight: 600, marginBottom: '8px' }}>
                                            Outgoing NFT Transfer
                                        </Typography>
                                        <Typography variant="body1">
                                            This NFT is being transferred to:
                                        </Typography>
                                        <Link
                                            href={`https://bithomp.com/explorer/${destination}`}
                                            target="_blank"
                                            rel="noreferrer noopener nofollow"
                                            sx={{ 
                                                textDecoration: 'none', 
                                                '&:hover': { textDecoration: 'underline' } 
                                            }}
                                        >
                                            <Typography variant="body1" sx={{ 
                                                color: '#1976d2', 
                                                fontWeight: 500,
                                                wordBreak: 'break-all'
                                            }}>
                                                {destination}
                                            </Typography>
                                        </Link>
                                    </Paper>
                                )}
                            </>
                        ) : (
                            isOwner ? (
                                <Box sx={{
                                    display: 'flex',
                                    justifyContent: 'space-around',
                                    gap: 2,
                                    padding: '20px',
                                    backgroundColor: '#f8f9fa',
                                    borderRadius: '12px',
                                    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                                }}>
                                    <Button
                                        fullWidth
                                        variant='contained'
                                        startIcon={<LocalOfferIcon />}
                                        onClick={handleCreateSellOffer}
                                        color='primary'
                                        disabled={!accountLogin || burnt}
                                        sx={{
                                            height: '48px',
                                            fontWeight: 'bold',
                                            textTransform: 'none',
                                            borderRadius: '8px',
                                            '&:hover': {
                                                backgroundColor: '#0056b3'
                                            }
                                        }}
                                    >
                                        List for Sale
                                    </Button>
                                    <Button
                                        fullWidth
                                        variant='outlined'
                                        startIcon={<SendIcon />}
                                        onClick={handleTransfer}
                                        color='secondary'
                                        disabled={!accountLogin || burnt}
                                        sx={{
                                            height: '48px',
                                            fontWeight: 'bold',
                                            textTransform: 'none',
                                            borderRadius: '8px',
                                            borderWidth: '2px',
                                            '&:hover': {
                                                borderWidth: '2px'
                                            }
                                        }}
                                    >
                                        Transfer Asset
                                    </Button>
                                    <BurnNFT 
                                        nft={nft} 
                                        onHandleBurn={onHandleBurn} 
                                        sx={{
                                            height: '48px',
                                            fontWeight: 'bold',
                                            textTransform: 'none',
                                            borderRadius: '8px'
                                        }}
                                    />
                                </Box>
                            ) : (
                                <Grid container>
                                    <Grid item xs={12} sm={7}>
                                        <Typography variant="s7">Current Price</Typography>
                                        <Stack sx={{ mt: 0, mb: 2 }}>
                                            {loading ? (
                                                <PulseLoader color='#00AB55' size={10} />
                                            ) : (
                                                cost ? (
                                                    cost.currency === "XRP" ?
                                                        <Stack direction="row" spacing={0.5} alignItems="center">
                                                            <Typography variant='s9' pt={0.8}><Typography>✕</Typography></Typography>
                                                            <Typography variant='s9'>{fNumber(cost.amount)}</Typography>
                                                        </Stack>
                                                        :
                                                        <Typography variant='s3'>{fNumber(cost.amount)} {cost.name}</Typography>

                                                ) : (
                                                    <Typography variant='s8'>- - -</Typography>
                                                )
                                            )}
                                        </Stack>
                                    </Grid>
                                    <Grid item xs={12} sm={5}>
                                        <Stack
                                            direction={{ xs: 'row', sm: 'column' }}
                                            spacing={{ xs: 1, sm: 2 }}
                                        >
                                            <Button
                                                fullWidth
                                                disabled={!cost || burnt}
                                                variant='contained'
                                                onClick={handleBuyNow}
                                            >
                                                Buy Now
                                            </Button>
                                            <Button
                                                fullWidth
                                                disabled={!accountLogin || burnt}
                                                variant='outlined'
                                                onClick={handleCreateBuyOffer}
                                            >
                                                Make Offer
                                            </Button>
                                        </Stack>
                                    </Grid>
                                </Grid>
                            )
                        )}
                    </>
                }

            </Paper>
            {/* /* Make offer end */}

            {isOwner &&
                <Stack>
                    <Accordion defaultExpanded>
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls='panel3a-content'
                            id='panel3a-header'
                        >
                            <Stack direction='row' spacing={2}>
                                <LocalOfferIcon />
                                <Typography variant='s16'>Sell Offers</Typography>
                            </Stack>
                        </AccordionSummary>
                        <AccordionDetails sx={{ textAlign: 'center' }}>
                            <OffersList
                                nft={nft}
                                offers={sellOffers}
                                handleAcceptOffer={handleAcceptOffer}
                                handleCancelOffer={handleCancelOffer}
                                isSell={true}
                            />
                        </AccordionDetails>
                    </Accordion>
                </Stack>
            }

            <Stack>
                {/* Buy Offers start */}
                <Accordion defaultExpanded>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls='panel3a-content'
                        id='panel3a-header'
                    >
                        <Stack direction='row' spacing={2}>
                            <PanToolIcon />
                            <Typography variant='s16'>Offers</Typography>
                        </Stack>
                    </AccordionSummary>
                    {/* <Divider /> */}
                    <AccordionDetails>
                        <OffersList
                            nft={nft}
                            offers={buyOffers}
                            handleAcceptOffer={handleAcceptOffer}
                            handleCancelOffer={handleCancelOffer}
                            isSell={false}
                        />
                    </AccordionDetails>
                </Accordion>
                {/* Buy Offers end */}
            </Stack>

            <Stack>
                {/* History Start */}
                <Accordion defaultExpanded >
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls='panel2a-content'
                        id='panel2a-header'
                    >
                        <Stack direction='row' spacing={2}>
                            <HistoryIcon />
                            <Typography variant='s16'>History</Typography>
                        </Stack>
                    </AccordionSummary>
                    <Divider />
                    <AccordionDetails>
                        <HistoryList
                            nft={nft}
                        />
                    </AccordionDetails>
                </Accordion>
                {/* History end */}
            </Stack>
        </Stack>
    )
}

