import axios from 'axios';
import { useState, useEffect } from 'react';
import Decimal from 'decimal.js';

// Material
import { withStyles } from '@mui/styles';
import {
    alpha, useTheme, useMediaQuery,
    styled,
    Backdrop,
    Button,
    Dialog,
    DialogContent,
    DialogTitle,
    Divider,
    IconButton,
    Link,
    ListItemButton,
    Select,
    Stack,
    Typography,
    TextField
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import TransferWithinAStationIcon from '@mui/icons-material/TransferWithinAStation';

// Context
import { useContext } from 'react';
import { AppContext } from 'src/AppContext'

// Utils
import { normalizeAmount } from 'src/utils/normalizers';
import { formatDateTime } from 'src/utils/formatTime';
import { checkExpiration } from 'src/utils/extra';

// ----------------------------------------------------------------------
const PriceDialog = styled(Dialog)(({ theme }) => ({
    backdropFilter: 'blur(1px)',
    WebkitBackdropFilter: 'blur(1px)', // Fix on Mobile
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
}));

const PriceDialogTitle = (props) => {
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
                        color: (theme) => theme.palette.grey[500],
                    }}
                >
                    <CloseIcon />
                </IconButton>
            ) : null}
        </DialogTitle>
    );
};

const Label = withStyles({
    root: {
        color: alpha('#637381', 0.99)
    }
})(Typography);

const CustomSelect = styled(Select)(({ theme }) => ({
    '& .MuiOutlinedInput-notchedOutline': {
        border: 'none'
    }
}));

function GetNum(amount) {
    let num = 0;
    try {
        num = new Decimal(amount).toNumber();
        if (num < 0) num = 0;
    } catch (err) { }
    return num;
}

export default function SelectPriceDialog({ open, setOpen, offers, handleAccept }) {
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

    const { accountProfile, openSnackbar } = useContext(AppContext);

    const [offer, setOffer] = useState(null);
    const [selectedIndex, setSelectedIndex] = useState(-1);

    const handleClose = () => {
        setOpen(false);
    }

    const handleOK = () => {
        if (offer) {
            handleAccept(offer);
            setOpen(false);
        } else {
            openSnackbar('Please select one payment method', 'error');
        }
    }

    const handleListItemClick = (event, index) => {
        setSelectedIndex(index);
        setOffer(offers[index]);
    };

    return (
        <>
            <PriceDialog
                fullScreen={fullScreen}
                onClose={handleClose}
                open={open}
                maxWidth="xs"
                fullWidth
                // sx={{zIndex: 1302}}
                hideBackdrop={true}
                disableScrollLock
                disablePortal
                keepMounted
            >
                <PriceDialogTitle id="customized-dialog-title" onClose={handleClose}>
                    <Stack direction="row" spacing={1}>
                        <CheckCircleOutlineIcon />
                        <Typography variant="s10">Checkout</Typography>
                    </Stack>
                </PriceDialogTitle>

                <DialogContent>
                    {
                        offers.map((offer, idx) => {
                            const price = normalizeAmount(offer.amount);
                            let priceAmount = price.amount;
                            if (priceAmount < 1) {
                            } else {
                                priceAmount = new Decimal(price.amount).toDP(2, Decimal.ROUND_DOWN).toNumber();
                            }

                            // let expired = false;
                            const expired = checkExpiration(offer.expiration);

                            // if (offer.expiration) {
                            //     const now = Date.now();
                            //     const expire = (offer.expiration > 946684800 ? offer.expiration: offer.expiration + 946684800) * 1000;

                            //     if (expire < now)
                            //         expired = true;
                            // }

                            return (
                                <Stack key={offer.nft_offer_index}>
                                    {idx > 0 &&
                                        <Divider sx={{ mt: 1, mb: 1 }} />
                                    }
                                    <ListItemButton
                                        selected={selectedIndex === idx}
                                        onClick={(event) => handleListItemClick(event, idx)}
                                        sx={{ pt: 2, pb: 2 }}
                                    >
                                        <Stack spacing={1}>
                                            <Stack direction="row" spacing={2} alignItems="center">
                                                <Typography variant='s9' color='#33C2FF' noWrap>{priceAmount} {price.name}</Typography>
                                                <Stack>
                                                    {/* <Typography variant='s8' style={{ wordBreak: "break-all" }}> {offer.owner}</Typography> */}
                                                    {offer.destination &&
                                                        <Stack direction="row" spacing={1} alignItems="center">
                                                            {/* <Typography variant='s4'>Destination</Typography> */}
                                                            <TransferWithinAStationIcon />
                                                            <Typography variant='s6'>{offer.destination}</Typography>
                                                        </Stack>
                                                    }

                                                    {offer.expiration &&
                                                        <Stack direction="row" spacing={1} alignItems="center">
                                                            <Typography variant='s7'>{expired ? 'Expired' : 'Expires'} on {formatDateTime(offer.expiration * 1000)}</Typography>
                                                        </Stack>
                                                    }
                                                </Stack>
                                            </Stack>



                                            {/* {offer.expiration ?
                                            <Stack direction="row" alignItems="center">
                                                <Typography variant='s4'>Expires by {new Date(getUnixTimeEpochFromRippleEpoch(offer.expiration)).toLocaleString()}</Typography>
                                                <CountdownTimer targetDate={getUnixTimeEpochFromRippleEpoch(offer.expiration)} />
                                            </Stack>
                                            :
                                            <Stack direction="row" alignItems="center">
                                                <Typography variant='s16'>No Expiration</Typography>
                                            </Stack>
                                        } */}
                                        </Stack>
                                    </ListItemButton>
                                </Stack>
                            )
                        })
                    }

                    <Stack direction='row' spacing={2} justifyContent="center" sx={{ mt: 3, mb: 4 }}>
                        <Button
                            variant="outlined"
                            onClick={handleOK}
                            color='primary'
                        // size='medium'
                        >
                            OK
                        </Button>
                    </Stack>
                </DialogContent>
            </PriceDialog>
        </>
    );
}
