import axios from 'axios';
import { useState, useEffect } from 'react';
import { FadeLoader } from 'react-spinners';
import Decimal from 'decimal.js';

// Material
import {
    useTheme,
    Backdrop,
    Divider,
    IconButton,
    Link,
    Stack,
    Tooltip,
    Typography,
    Paper,
    Avatar
} from '@mui/material';
import { tableCellClasses } from "@mui/material/TableCell";
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import TransferWithinAStationIcon from '@mui/icons-material/TransferWithinAStation';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

// Loader
import { PuffLoader, PulseLoader } from "react-spinners";
import { ProgressBar, Discuss } from 'react-loader-spinner';

// Utils
// import { checkExpiration, getUnixTimeEpochFromRippleEpoch } from 'src/utils/parse';
import { checkExpiration } from 'src/utils/extra';
import { formatDateTime } from 'src/utils/formatTime';
import { normalizeAmount } from 'src/utils/normalizers';

// Context
import { useContext } from 'react';
import { AppContext } from 'src/AppContext';

// Components
import CountdownTimer from './CountDownTimer';
import QRDialog from 'src/components/QRDialog';
import ConfirmAcceptOfferDialog from './ConfirmAcceptOfferDialog';

export default function OffersList({ nft, offers, handleAcceptOffer, handleCancelOffer, isSell }) {
    const theme = useTheme();
    const BASE_URL = 'https://api.xrpnft.com/api';
    const { accountProfile, openSnackbar, sync, setSync } = useContext(AppContext);
    const accountLogin = accountProfile?.account;
    const accountToken = accountProfile?.token;

    const isOwner = accountLogin === nft.account;

    const [loading, setLoading] = useState(false);

    return (
        <Paper elevation={3} sx={{ p: 3, borderRadius: 2, backgroundColor: theme.palette.background.paper }}>
            {offers && offers.length === 0 && (
                <Typography variant="body2" align="center" color="text.secondary" sx={{ my: 2 }}>
                    No offers available at the moment
                </Typography>
            )}

            <Stack spacing={2}>
                {offers.map((offer, idx) => {
                    const price = normalizeAmount(offer.amount);
                    let priceAmount = price.amount;
                    if (priceAmount < 1) {
                    } else {
                        priceAmount = new Decimal(price.amount).toDP(2, Decimal.ROUND_DOWN).toNumber();
                    }

                    const expired = checkExpiration(offer.expiration);

                    return (
                        <Paper key={offer.nft_offer_index} elevation={1} sx={{ p: 2, borderRadius: 1 }}>
                            <Stack direction="row" justifyContent="space-between" alignItems="center">
                                <Stack direction="row" spacing={2} alignItems="center">
                                    <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
                                        {offer.owner.charAt(0).toUpperCase()}
                                    </Avatar>
                                    <Stack>
                                        <Typography variant="h6" color="primary.main">
                                            {priceAmount} {price.name}
                                        </Typography>
                                        <Link
                                            href={`https://xrpnft.com/account/${offer.owner}`}
                                            rel="noreferrer noopener nofollow"
                                            color="text.secondary"
                                            underline="hover"
                                        >
                                            <Typography variant="body2" noWrap>
                                                {offer.owner}
                                            </Typography>
                                        </Link>
                                    </Stack>
                                </Stack>

                                {/* Action buttons */}
                                <Stack direction="row" spacing={1}>
                                    {/* ... existing action button logic ... */}
                                </Stack>
                            </Stack>

                            {offer.destination && (
                                <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                                    <TransferWithinAStationIcon color="action" fontSize="small" />
                                    <Typography variant="body2" color="text.secondary">
                                        {offer.destination}
                                    </Typography>
                                </Stack>
                            )}

                            {offer.expiration && (
                                <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                                    <AccessTimeIcon color="action" fontSize="small" />
                                    <Typography variant="body2" color="text.secondary">
                                        {expired ? 'Expired' : 'Expires'} on {formatDateTime(offer.expiration * 1000)}
                                    </Typography>
                                </Stack>
                            )}
                        </Paper>
                    );
                })}
            </Stack>
        </Paper>
    );
}
