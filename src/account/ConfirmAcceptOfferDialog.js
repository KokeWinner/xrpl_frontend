import { normalizeAmount } from 'src/utils/normalizers';

// Material
import {
    styled,
    useTheme, useMediaQuery,
    Button,
    Dialog,
    DialogContent,
    DialogTitle,
    IconButton,
    Stack,
    Typography
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutline';
// ----------------------------------------------------------------------

const ConfirmDialog = styled(Dialog) (({ theme }) => ({
    backdropFilter: 'blur(1px)',
    WebkitBackdropFilter: 'blur(1px)', // Fix on Mobile
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
            // hideBackdrop={true}
            disableScrollLock
            disablePortal
            keepMounted
        >
            <ConfirmDialogTitle id="customized-dialog-title" onClose={handleClose}>
                <Stack direction="row" spacing={1}>
                    <ErrorOutlineIcon color="error" />
                    <Typography variant="p4" color="error"></Typography>
                </Stack>
            </ConfirmDialogTitle>

            <DialogContent>
                <Stack sx={{pl:1, pr:1}}>
                    <Typography variant="p5" sx={{mt: 2}}>Are you sure to accept offer with <Typography variant='s3' color='primary'>{price.amount} {price.name}</Typography> ?</Typography>

                    <Stack direction='row' spacing={2} justifyContent="center" sx={{mt:3, mb:4}}>
                        <Button
                            variant="contained"
                            onClick={handleNo}
                            color='primary'
                            // size='medium'
                        >
                            No
                        </Button>
                        <Button
                            variant="outlined"
                            onClick={handleYes}
                            color='primary'
                            // size='medium'
                        >
                            Yes
                        </Button>
                    </Stack>
                </Stack>
            </DialogContent>
        </ConfirmDialog>
    );
}
