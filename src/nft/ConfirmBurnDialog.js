// Material
import {
    useTheme, useMediaQuery,
    styled,
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
import { alpha } from '@mui/material/styles';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';

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

const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
    background: `linear-gradient(145deg, ${alpha(theme.palette.background.paper, 0.9)}, ${alpha(theme.palette.background.paper, 0.95)})`,
    backdropFilter: 'blur(10px)',
    borderRadius: theme.shape.borderRadius,
    padding: theme.spacing(4),
}));

const WarningIcon = styled(LocalFireDepartmentIcon)(({ theme }) => ({
    fontSize: 48,
    color: theme.palette.error.main,
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

export default function ConfirmBurnDialog({open, setOpen, onContinue }) {
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
            PaperProps={{
                style: {
                    borderRadius: 16,
                    boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.37)',
                },
            }}
        >
            <StyledDialogContent>
                <Stack spacing={3} alignItems="center">
                    <WarningIcon />
                    <Typography variant="h5" fontWeight="bold" textAlign="center">
                        Confirm NFT Burn
                    </Typography>
                    <Typography variant="body1" textAlign="center">
                        Are you absolutely certain you want to burn this NFT? This action cannot be undone.
                    </Typography>
                    <Stack direction="row" spacing={2} justifyContent="center" sx={{ mt: 2 }}>
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
                            color="error"
                            size="large"
                            startIcon={<LocalFireDepartmentIcon />}
                        >
                            Burn NFT
                        </Button>
                    </Stack>
                </Stack>
            </StyledDialogContent>
        </ConfirmDialog>
    );
}
