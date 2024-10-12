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
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';

const ConfirmDialog = styled(Dialog)(({ theme }) => ({
    '& .MuiDialog-paper': {
        borderRadius: 16,
        boxShadow: `0 8px 32px 0 ${alpha(theme.palette.common.black, 0.08)}`,
    },
    backdropFilter: 'blur(5px)',
    WebkitBackdropFilter: 'blur(5px)',
}));

const ConfirmDialogTitle = styled(DialogTitle)(({ theme }) => ({
    background: theme.palette.background.default,
    borderBottom: `1px solid ${theme.palette.divider}`,
    padding: theme.spacing(3),
}));

const StyledButton = styled(Button)(({ theme }) => ({
    borderRadius: 25,
    padding: theme.spacing(1, 4),
    textTransform: 'none',
    fontWeight: 600,
}));

export default function ConfirmPurchaseDialog({open, setOpen, onContinue }) {
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

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
            PaperProps={{ elevation: 0 }}
        >
            <ConfirmDialogTitle id="customized-dialog-title" onClose={handleClose}>
                <Stack direction="row" spacing={2} alignItems="center">
                    <ShoppingCartIcon color="primary" fontSize="large" />
                    <Typography variant="h5" fontWeight="bold">Confirm Purchase</Typography>
                </Stack>
            </ConfirmDialogTitle>

            <DialogContent sx={{ p: 4 }}>
                <Typography variant="body1" sx={{ mb: 3 }}>
                    Are you sure you want to proceed with this purchase? This action cannot be undone.
                </Typography>

                <Stack direction="row" spacing={2} justifyContent="flex-end">
                    <StyledButton
                        variant="outlined"
                        onClick={handleNo}
                        color="primary"
                    >
                        Cancel
                    </StyledButton>
                    <StyledButton
                        variant="contained"
                        onClick={handleYes}
                        color="primary"
                    >
                        Confirm Purchase
                    </StyledButton>
                </Stack>
            </DialogContent>
        </ConfirmDialog>
    );
}
