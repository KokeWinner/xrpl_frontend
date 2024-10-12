import { normalizeAmount } from 'src/utils/normalizers';

// Material
import {
    useTheme, useMediaQuery,
    styled,
    Button,
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    Link,
    Stack,
    Typography
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
import { alpha } from '@mui/material/styles';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';

// ----------------------------------------------------------------------
const ConfirmDialog = styled(Dialog) (({ theme }) => ({
    '& .MuiDialog-paper': {
        borderRadius: 16,
        boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        border: '1px solid rgba(255, 255, 255, 0.18)',
    },
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
}));

const ConfirmDialogTitle = (props) => {
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

export default function ConfirmAcceptOfferDialog({open, setOpen, offer, onContinue }) {
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

    const price = normalizeAmount(offer?.amount);

    const handleClose = () => {
        setOpen(false);
    }

    const handleYes = () => {
        setOpen(false);
        onContinue();
    }

    const handleNo = () => {
        setOpen(false);
    }

    return (
        <ConfirmDialog
            fullScreen={fullScreen}
            onClose={handleClose}
            open={open}
            // sx={{zIndex: 1302}}
            maxWidth="xs"
            hideBackdrop={true}
            disableScrollLock
            disablePortal
            keepMounted
            PaperProps={{
                style: {
                    background: alpha(theme.palette.background.paper, 0.8),
                },
            }}
        >
            <ConfirmDialogTitle id="customized-dialog-title" onClose={handleClose}>
                <Stack direction="row" spacing={1} alignItems="center">
                    <CheckCircleOutlineIcon color="primary" />
                    <Typography variant="h6" color="primary.main">Confirm Offer</Typography>
                </Stack>
            </ConfirmDialogTitle>

            <DialogContent>
                <Stack spacing={3} sx={{ px: 2 }}>
                    <Typography variant="body1" align="center">
                        Are you sure you want to accept the offer of
                    </Typography>
                    <Typography variant="h4" color="primary.main" align="center" fontWeight="bold">
                        {price.amount} {price.name}
                    </Typography>
                    <Stack direction="row" spacing={2} justifyContent="center">
                        <Button
                            variant="outlined"
                            onClick={handleNo}
                            color="primary"
                            size="large"
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="contained"
                            onClick={handleYes}
                            color="primary"
                            size="large"
                        >
                            Accept Offer
                        </Button>
                    </Stack>
                </Stack>
            </DialogContent>
        </ConfirmDialog>
    );
}
