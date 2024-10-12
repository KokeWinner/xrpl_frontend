import axios from 'axios';
import { useRef, useState, useEffect } from 'react';
import {CopyToClipboard} from 'react-copy-to-clipboard';
import { FacebookIcon, TwitterIcon } from "react-share";
import { FacebookShareButton, TwitterShareButton } from "react-share";

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
import DescriptionIcon from '@mui/icons-material/Description';
import ArticleIcon from '@mui/icons-material/Article';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

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
import { fNumber, fIntNumber, fVolume } from 'src/utils/formatNumber';
import { getHashIcon } from 'src/utils/extra';
import { convertHexToString, parseNFTokenID } from 'src/utils/parse/utils';

// Components
import NFTPreview from './NFTPreview';
import QRDialog from 'src/components/QRDialog';
import ConfirmAcceptOfferDialog from './ConfirmAcceptOfferDialog';
// import TimePeriods from './TimePeriodsDropdown';
import OffersList from './OffersList';
import SelectPriceDialog from './SelectPriceDialog';

import BurnNFT from './BurnNFT';
import TransferDialog from './TransferDialog';
import HistoryList from './HistoryList';
import SeeMoreTypography from 'src/components/SeeMoreTypography';
import FlagsContainer from 'src/components/Flags';
import Properties from './Properties';

// const NFT_FLAGS = {
//     0x00000001: 'lsfBurnable',
//     0x00000002: 'lsfOnlyXRP',
//     0x00000004: 'lsfTrustLine',
//     0x00000008: 'lsfTransferable',
// }

function getProperties(meta) {
    const properties = [];
    if (!meta) return [];

    // Attributes
    try {
        const attributes = meta.attributes;
        if (attributes && attributes.length > 0) {
            for (const attr of attributes) {
                const type = attr.type || attr.trait_type;
                const value = attr.value;
                properties.push({type, value});
            }
        }
    } catch (e) {}

    // Other props
    const props = [
        'Rarity',
        'Signature',
        'Background',
        'Base',
        'Mouth',
        'Accessories',
        'Base Effects',
        // ==============
        'Blade Effect',
        'End Scene',
        'Music',
        'Blades In Video',
        // ==============
        'Special',
    ];

    try {
        for (const prop of props) {
            if (meta[prop]) {
                properties.push({type: prop, value: meta[prop]});
            }
        }
    } catch (e) {}

    return properties;

}

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
    return (str.length > n) ? str.substr(0, n-1) + ' ...' : str;
};

export default function NFTDetailsMobile({ nft }) {
    const anchorRef = useRef(null);
    const BASE_URL = 'https://api.xrpnft.com/api';
    const { accountProfile, openSnackbar } = useContext(AppContext);
    const accountLogin = accountProfile?.account;
    const accountToken = accountProfile?.token;

    // const theme = useTheme();
    // const largescreen = useMediaQuery(theme => theme.breakpoints.up('md'));

    const {
        uuid,
        // name,
        collection,
        cslug,
        cverified,
        cfloor,
        citems,
        rarity_rank,
        type,
        account,
        minter,
        date,
        meta,
        dfile,
        URI,
        status,
        // cost,
        destination,
        NFTokenID,
        self,
        props,
        total,
        volume
    } = nft;

    const collectionName = collection || meta?.collection?.name || '[No Collection]';

    const nftName = meta?.name || meta?.Name || '[No Name]';

    const floorPrice = cfloor?.amount || 0;

    const accountLogo = getHashIcon(account);

    const ParsedURI = convertHexToString(URI);

    const {
        flag,
        royalty,
        issuer,
        taxon,
        transferFee
    } = parseNFTokenID(NFTokenID);

    let strDateTime = '';
    if (date) {
        const dt = new Date(date); // .toLocaleDateString().split('.')[0].replace('T', ' ')
        const strDate = dt.toLocaleDateString();
        const strTime = dt.toLocaleTimeString();
        strDateTime = `${strDate} ${strTime}`;
    }

    const properties = props || getProperties(meta);

    const shareUrl = `https://xrpnft.com/nft/${NFTokenID}`;
    const shareTitle = nftName;
    const shareDesc = meta?.description || '';

    const isOwner = accountLogin === account;
    const isBurnable = (flag & 0x00000001) > 0;

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

    const [openShare, setOpenShare] = useState(false);

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
        async function getPayload() {
            console.log(counter + " " + isRunning, xummUuid);
            if (isRunning) return;
            isRunning = true;
            try {
                const ret = await axios.get(`${BASE_URL}/offers/acceptcancel/${xummUuid}`);
                const resolved_at = ret.data?.resolved_at;
                const dispatched_result = ret.data?.dispatched_result;
                if (resolved_at) {
                    setOpenScanQR(false);
                    if (dispatched_result === 'tesSUCCESS') {
                        setSync(sync + 1);
                        openSnackbar('Successful!', 'success');
                    }
                    else
                        openSnackbar('Rejected!', 'error');
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
        } catch (err) {
            console.error(err);
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
                <Stack direction="row" spacing={2} justifyContent="space-between" sx={{ mt: 1, mb: 1 }}>
                    <Stack>
                        <Stack direction="row" spacing={1}>
                            <Link href={`/collection/${cslug}`} underline='none'>
                                <Typography variant="s5" sx={{pl:0}}>{collectionName}</Typography>
                            </Link>
                            {cverified === 'yes' &&
                                <Tooltip title='Verified'>
                                    <VerifiedIcon fontSize="small" style={{color: "#4589ff"}} />
                                </Tooltip>
                            }
                        </Stack>

                        <Stack direction="row" spacing={0.5} alignItems='center'>
                            <Typography variant="s7" noWrap>Global Floor</Typography>
                            <Typography>✕</Typography>
                            <Typography variant="s7" noWrap>{fNumber(floorPrice)}</Typography>
                        </Stack>
                    </Stack>

                    <Stack direction="row" alignItems="center" spacing={1}>
                        <Tooltip title="Share">
                            <IconButton size='medium' sx={{ padding: 1 }}
                                ref={anchorRef}
                                onClick={handleOpenShare}
                            >
                                <ShareIcon />
                            </IconButton>
                        </Tooltip>

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
                            <Stack direction="row" spacing={2} sx={{pt: 1.5, pl: 1, pr: 1, pb: 1}}>
                                <FacebookShareButton
                                    url={shareUrl}
                                    quote={shareTitle}
                                    hashtag={"#"}
                                    description={shareDesc}
                                    onClick={handleCloseShare}
                                >
                                    <FacebookIcon size={24} round />
                                </FacebookShareButton>
                                <TwitterShareButton
                                    title={shareTitle}
                                    url={shareUrl}
                                    hashtag={"#"}
                                    onClick={handleCloseShare}
                                >
                                    <TwitterIcon size={24} round />
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
                <SeeMoreTypography variant="s7" text={meta.description} />
            } */}

            {self && rarity_rank > 0 &&
                <Stack direction="row" >
                    <Tooltip title={`Rarity Rank #${fIntNumber(rarity_rank)} / ${fIntNumber(citems)}`}>
                        <Stack direction="row" spacing={1} alignItems="center" >
                            <LeaderboardOutlinedIcon sx={{width: '14px'}} width="auto" style={{color: '#B2B2B2'}}/>
                            <Typography variant="s7"><Typography variant="s14">{fIntNumber(rarity_rank)}</Typography> / {fIntNumber(citems)}</Typography>
                        </Stack>
                    </Tooltip>
                </Stack>
            }

            <NFTPreview nft={nft} /> {/* NFTokenID={NFTokenID} meta={meta} dfile={dfile} */}

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
                                {destination === accountLogin ?
                                    <Typography variant="s5">This NFT is being transferred to you. Click <CheckCircleOutlineIcon color='success' /> to accept it.</Typography>
                                    :
                                    <Typography variant="s5">This NFT is being transferred to &nbsp;
                                        <Link
                                            color="inherit"
                                            target="_blank"
                                            href={`https://bithomp.com/explorer/${destination}`}
                                            rel="noreferrer noopener nofollow"
                                        >
                                            <Typography variant="s3" color="primary">{destination}</Typography>
                                        </Link>.
                                    </Typography>
                                }
                            </>
                        ) : (
                            isOwner ? (
                                <Box sx={{
                                    display: 'flex',
                                    justifyContent: 'space-around',
                                    gap: 1
                                }}>
                                    <Button
                                        fullWidth
                                        // sx={{ minWidth: 150 }}
                                        variant='outlined'
                                        startIcon={<LocalOfferIcon />}
                                        onClick={handleCreateSellOffer}
                                        color='success'
                                        disabled={!accountLogin || burnt}
                                    >
                                        Sell
                                    </Button>
                                    <Button
                                        fullWidth
                                        // sx={{ minWidth: 150 }}
                                        variant='outlined'
                                        startIcon={<SendIcon />}
                                        onClick={handleTransfer}
                                        color='info'
                                        disabled={!accountLogin || burnt}
                                    >
                                        Transfer
                                    </Button>
                                    <BurnNFT nft={nft} onHandleBurn={onHandleBurn} />
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

            <Stack direction="row" spacing={1} alignItems="center">
                <Avatar alt="C" src={accountLogo} variant="square" style={{width: '32px', height: '32px'}} />
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

                {/*
                <Tooltip title="Contact owner via XRPNFT chat">
                    <IconButton size='small' sx={{ padding: 1 }}
                        onClick={() => {
                        }}
                    >
                        <MessageOutlinedIcon fontSize="small" />
                    </IconButton>
                    </Tooltip> */}
            </Stack>

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
                <Accordion>
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
                <Accordion >
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

            <Stack>
                <Accordion defaultExpanded>
                    <AccordionSummary
                        id="panel3bh-header"
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel3bh-content"
                    >
                        <Stack spacing={2} direction='row'>
                            <Icon icon='majesticons:checkbox-list-detail-line' fontSize={25} />
                            <Typography variant='s16'>Properties</Typography>
                        </Stack>
                    </AccordionSummary>
                    <AccordionDetails>
                        {properties && properties.length > 0 ?
                            <Properties properties={properties} total={total} />
                            :
                            <Stack alignItems="center">
                                <Typography>No Properties</Typography>
                            </Stack>
                        }
                    </AccordionDetails>
                </Accordion>
            </Stack>
            <Stack>
                <Accordion>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel1bh-content"
                        id="panel1bh-header"
                    >
                        <Stack spacing={2} direction='row'>
                            <ArticleIcon />
                            <Typography variant='s16'>Details</Typography>
                        </Stack>
                    </AccordionSummary>
                    <AccordionDetails>
                        <Stack direction="row" spacing={2} alignItems="center">
                            <Typography variant="caption">Flags</Typography>
                            <FlagsContainer Flags={flag}/>
                            <Typography variant="s6">{strDateTime}</Typography>
                        </Stack>
                        {rarity_rank > 0 &&
                            <Stack direction="row" spacing={2} sx={{mt: 2}}>
                                <Typography variant="caption">Rarity Rank</Typography>
                                <Typography variant="s6"># {rarity_rank}</Typography>
                            </Stack>
                        }
                        <Stack direction="row" spacing={2} sx={{mt: 2}}>
                            <Typography variant="caption">Taxon</Typography>
                            <Typography variant="s6">{taxon}</Typography>
                            <Typography variant="caption">Transfer Fee</Typography>
                            <Typography variant="s6">{transferFee} %</Typography>
                        </Stack>
                        <Stack direction="row" spacing={2} sx={{mt: 2}}>
                            <Typography variant='caption'>Collection</Typography>
                            {cslug ? (
                                <Link href={`/collection/${cslug}`} underline='none'>
                                    <Typography sx={{pl:1}}>{collectionName}</Typography>
                                </Link>
                            ):(
                                <Typography sx={{pl:1}}>{collectionName}</Typography>
                            )}
                        </Stack>
                        <Stack direction="row" spacing={2} sx={{mt: 2}}>
                            <Typography variant="caption">Volume</Typography>
                            <Stack direction="row" spacing={0.5} alignItems='center'>
                            <Typography>✕</Typography>
                                <Typography variant="s6">{fVolume(volume || 0)}</Typography>
                                <Tooltip title={<Typography variant="body2">Traded volume on XRPL</Typography>}>
                                    <Icon icon={infoFilled} />
                                </Tooltip>
                            </Stack>
                        </Stack>
                        <Divider sx={{mt:2, mb:2}}/>

                        <Stack spacing={1}>
                            <Typography variant="caption">Owner</Typography>
                            <Stack direction="row" spacing={0.2} alignItems="center" sx={{display: 'inline-flex', overflowWrap: 'anywhere' }}>
                                <Link
                                    href={`/account/${account}`}
                                    underline='hover'
                                    // target="_blank"
                                    variant='info'
                                    // rel="noreferrer noopener nofollow"
                                >
                                    <Typography sx={{ml:1}}>{account}</Typography>
                                </Link>
                                <Link
                                    underline="none"
                                    color="inherit"
                                    target="_blank"
                                    href={`https://bithomp.com/explorer/${account}`}
                                    rel="noreferrer noopener nofollow"
                                >
                                    <Tooltip title="Check on Bithomp">
                                        <IconButton edge="end" aria-label="bithomp" size="small">
                                            <Avatar alt="bithomp" src="/static/bithomp.ico" sx={{ width: 16, height: 16 }} />
                                        </IconButton>
                                    </Tooltip>
                                </Link>
                                <CopyToClipboard text={account} onCopy={()=>openSnackbar('Copied!', 'success')}>
                                    <Tooltip title='Click to copy'>
                                        <IconButton size="small">
                                            <ContentCopyIcon fontSize="small" sx={{ width: 16, height: 16 }}/>
                                        </IconButton>
                                    </Tooltip>
                                </CopyToClipboard>
                            </Stack>
                        </Stack>
                        <Divider sx={{mt:2, mb:2}}/>

                        <Stack spacing={1}>
                            <Typography variant="caption">Issuer</Typography>
                            <Stack direction="row" spacing={0.2} alignItems="center" sx={{display: 'inline-flex', overflowWrap: 'anywhere' }}>
                                <Link
                                    href={`/account/${issuer}`}
                                    underline='hover'
                                    // target="_blank"
                                    variant='info'
                                    // rel="noreferrer noopener nofollow"
                                >
                                    <Typography sx={{ml:1}}>{issuer}</Typography>
                                </Link>
                                <Link
                                    underline="none"
                                    color="inherit"
                                    target="_blank"
                                    href={`https://bithomp.com/explorer/${issuer}`}
                                    rel="noreferrer noopener nofollow"
                                >
                                    <Tooltip title="Check on Bithomp">
                                        <IconButton edge="end" aria-label="bithomp" size="small">
                                            <Avatar alt="bithomp" src="/static/bithomp.ico" sx={{ width: 16, height: 16 }} />
                                        </IconButton>
                                    </Tooltip>
                                </Link>
                                <CopyToClipboard text={issuer} onCopy={()=>openSnackbar('Copied!', 'success')}>
                                    <Tooltip title='Click to copy'>
                                        <IconButton size="small">
                                            <ContentCopyIcon fontSize="small" sx={{ width: 16, height: 16 }}/>
                                        </IconButton>
                                    </Tooltip>
                                </CopyToClipboard>
                            </Stack>
                        </Stack>
                        <Divider sx={{mt:2, mb:2}}/>

                        <Stack spacing={1}>
                            <Typography variant="caption">NFTokenID</Typography>
                            <Link
                                href={`https://bithomp.com/explorer/${NFTokenID}`}
                                target='_blank'
                                variant='info'
                                rel="noreferrer noopener nofollow"
                            >
                                <Typography
                                    sx={{ml:1}}
                                    style={{ wordWrap: "break-word" }}
                                >
                                    {NFTokenID}
                                </Typography>
                            </Link>
                        </Stack>

                        <Stack spacing={1} mt={1}>
                            <Typography variant='caption'>URI</Typography>
                            <Typography sx={{ml:1}} style={{ wordWrap: "break-word" }}>{ParsedURI}</Typography>
                        </Stack>
                        <Divider sx={{mt:2, mb:2}}/>

                        {
                            meta?.external_link && (
                                <>
                                    <Stack spacing={1}>
                                        <Typography variant='caption'>Link</Typography>
                                        <Link
                                            href={`${meta.external_link}`}
                                            sx={{ mt: 1.5, display: 'inline-flex', overflowWrap: 'anywhere' }}
                                            underline='hover'
                                            target="_blank"
                                            variant='info'
                                            rel="noreferrer noopener nofollow"
                                        >
                                            <Typography sx={{ml:1}}>{meta.external_link}</Typography>
                                        </Link>
                                    </Stack>
                                    <Divider sx={{mt:2, mb:2}}/>
                                </>
                            )
                        }

                    </AccordionDetails>
                </Accordion>
            </Stack>
            <Stack>
                <Accordion>
                    <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        aria-controls="panel2bh-content"
                        id="panel2bh-header"
                    >
                        <Stack spacing={2} direction='row' borderRadius={20}>
                            <DescriptionIcon />
                            <Typography variant='s16' >Description</Typography>
                        </Stack>
                    </AccordionSummary>
                    <AccordionDetails>
                        {meta?.description ?
                            <Typography>{meta.description}</Typography>
                            :
                            <Typography sx={{ textAlign: 'center' }}>No description for this item</Typography>
                        }
                    </AccordionDetails>
                </Accordion>


                {/* NFT Leveled Properties start--- */}
                {/* {
                    levels &&
                    <Accordion defaultExpanded>
                        <AccordionSummary
                            expandIcon={<ExpandMoreIcon />}
                            aria-controls="panel4bh-content"
                            id="panel4bh-header"
                        >
                            <Stack spacing={2} direction='row'>
                                <Icon icon='majesticons:checkbox-list-detail-line' fontSize={25} />
                                <Typography variant='s16' >Level Properties</Typography>
                            </Stack>
                        </AccordionSummary>
                        <AccordionDetails>
                            <Levels levels={data.description?.levels} />
                        </AccordionDetails>
                    </Accordion>
                } */}
                {/* NFT Leveled Properties end--- */}
            </Stack>
        </Stack>
    )
}

