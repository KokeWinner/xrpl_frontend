import Decimal from 'decimal.js';
import {CopyToClipboard} from 'react-copy-to-clipboard';

// Material
import { withStyles } from '@mui/styles';
import {
    alpha, useTheme, useMediaQuery,
    styled,
    Avatar,
    Backdrop,
    Button,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Divider,
    IconButton,
    Link,
    Stack,
    Table,
    TableBody,
    TableRow,
    TableCell,
    Tooltip,
    Typography,
    TextField
} from '@mui/material';
import { tableCellClasses } from "@mui/material/TableCell";

import CloseIcon from '@mui/icons-material/Close';

// Iconify
import { Icon } from '@iconify/react';
import copyIcon from '@iconify/icons-fad/copy';

// Context
import { useContext } from 'react';
import { AppContext } from 'src/AppContext'

// Utils
import { fNumber } from 'src/utils/formatNumber';

// Components

// ----------------------------------------------------------------------
const IssuerDialog = styled(Dialog) (({ theme }) => ({
    backdropFilter: 'blur(1px)',
    WebkitBackdropFilter: 'blur(1px)', // Fix on Mobile
    '& .MuiDialogContent-root': {
        padding: theme.spacing(2),
    },
    '& .MuiDialogActions-root': {
        padding: theme.spacing(1),
    },
}));
  
const IssuerInfoDialogTitle = (props) => {
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

const BlackTypography = withStyles({
    root: {
        color: "#B72136",
        borderRadius: '6px',
        border: '0.1em solid #B72136',
        //fontSize: '0.5rem',
        // lineHeight: '1',
        paddingLeft: '8px',
        paddingRight: '8px',
        paddingTop: '6px',
        paddingBottom: '6px',
    }
})(Typography);


export default function IssuerInfoDialog({open, setOpen, token}) {
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));
    const { accountProfile, openSnackbar } = useContext(AppContext);

    const {
        issuer,
        name,
        user,
        currency,
        md5,
        ext,
        issuer_info
    } = token;

    // const imgUrl = `/static/tokens/${md5}.${ext}`;
    const imgUrl = `https://s1.xrpl.to/token/${md5}`;

    // passwordSpent
    // requireDestTag   | YES
    // requireAuth      | YES
    // depositAuth      | YES
    // disallowXRP      | YES
    // disableMaster    | YES
    // noFreeze         | YES
    // globalFreeze     | YES
    // defaultRipple    | YES

    // blackholed       | YES

    // emailHash=C2C2097ADA6046F0EF8FFECD07AFC676,
    // walletLocator
    // messageKey
    // domain=nftfightercat01.xrpl-art.work             | YES
    // transferRate                                     | YES
    // tickSize                                         | YES

    const info = issuer_info || {};

    const handleClose = () => {
        setOpen(false);
    }

    return (
        <>
            <IssuerDialog
                fullScreen={fullScreen}
                onClose={handleClose}
                open={open}
                sx={{zIndex: 1302}}
                // hideBackdrop={true}
            >
                <IssuerInfoDialogTitle id="customized-dialog-title" onClose={handleClose}>
                    <Stack direction='row' alignItems='center'>
                        <Avatar alt={`${user} ${name} Logo`} src={imgUrl} sx={{ mr: 1 }} />

                        <Stack>
                            <Typography variant="token" color="primary">{name}</Typography>
                            <Typography variant="caption">{user}</Typography>
                        </Stack>
                    </Stack>
                </IssuerInfoDialogTitle>

                <DialogContent>
                    <Stack spacing={0} sx={{pl:1, pr:1, pb: 3}}>
                        <Stack direction="row" alignItems="center">
                            <Label variant="subtitle2" noWrap>
                                
                            </Label>
                            <Link
                                underline="none"
                                color="primary"
                                target="_blank"
                                href={`https://bithomp.com/explorer/${issuer}`}
                                rel="noreferrer noopener nofollow"
                                
                            >
                                {issuer}
                                <IconButton edge="end" aria-label="bithomp">
                                    <Avatar alt="Bithomp Explorer Logo" src="/static/bithomp.ico" sx={{ width: 16, height: 16 }} />
                                </IconButton>
                            </Link>
                        </Stack>

                        <Stack direction="row" alignItems="center">
                            <Typography variant="s7" noWrap>{currency}</Typography>
                            <CopyToClipboard text={currency} onCopy={()=>openSnackbar("Copied!", "success")}>
                                <Tooltip title={'Click to copy'}>
                                    <IconButton>
                                        <Icon icon={copyIcon} />
                                    </IconButton>
                                </Tooltip>
                            </CopyToClipboard>
                        </Stack>

                        {info.blackholed &&
                            <Stack direction="row" spacing={1} alignItems="center" sx={{mt: 1}}>
                                <BlackTypography variant="s11">This account is BLACKHOLED. It can not issue more tokens.</BlackTypography>
                            </Stack>
                        }

                        {info.domain &&
                            <Stack direction="row" spacing={1} alignItems="center" sx={{mt: 1.5}}>
                                <Typography variant="s17">Domain:</Typography>
                                <Link
                                    underline="always"
                                    color="inherit"
                                    target="_blank"
                                    href={info.domain.startsWith("https://")?`${info.domain}`:`https://${info.domain}`}
                                    rel="noreferrer noopener nofollow"
                                >
                                    <Typography variant="s18">{info.domain}</Typography>
                                </Link>
                            </Stack>
                        }

                        {info.tickSize &&
                            <Stack direction="row" spacing={1} alignItems="center" sx={{mt: 1.5}}>
                                <Link
                                    underline="always"
                                    color="inherit"
                                    target="_blank"
                                    href={`https://xrpl.org/ticksize.html`}
                                    rel="noreferrer noopener nofollow"
                                >
                                    <Typography variant="s17">Tick Size:</Typography>
                                </Link>
                                <Typography variant="s18">{info.tickSize}</Typography>
                            </Stack>
                        }

                        {info.globalFreeze &&
                            <Stack direction="row" spacing={1} alignItems="center" sx={{mt: 1.5}}>
                                <Typography variant="s17">Global Freeze:</Typography>
                                <Link
                                    underline="always"
                                    color="inherit"
                                    target="_blank"
                                    href={`https://xrpl.org/freezes.html`}
                                    rel="noreferrer noopener nofollow"
                                >
                                    <Typography variant="s18">Freeze</Typography>
                                </Link>
                            </Stack>
                        }

                        {info.requireAuth &&
                            <Stack direction="row" spacing={1} alignItems="center" sx={{mt: 1.5}}>
                                <Typography variant="s17">Token auth:</Typography>
                                <Typography variant="s18">required</Typography>
                            </Stack>
                        }

                        {info.disableMaster &&
                            <Stack direction="row" spacing={1} alignItems="center" sx={{mt: 1.5}}>
                                <Typography variant="s17">Disable Master:</Typography>
                                <Typography variant="s18">Disallowed</Typography>
                            </Stack>
                        }

                        {info.depositAuth &&
                            <Stack direction="row" spacing={1} alignItems="center" sx={{mt: 1.5}}>
                                <Typography variant="s17">Deposit auth:</Typography>
                                <Link
                                    underline="always"
                                    color="inherit"
                                    target="_blank"
                                    href={`https://xrpl.org/depositauth.html`}
                                    rel="noreferrer noopener nofollow"
                                >
                                    <Typography variant="s18">enabled</Typography>
                                </Link>
                            </Stack>
                        }

                        {info.requireDestTag &&
                            <Stack direction="row" spacing={1} alignItems="center" sx={{mt: 1.5}}>
                                <Typography variant="s17">Destination tag:</Typography>
                                <Typography variant="s18">required</Typography>
                            </Stack>
                        }

                        {info.disallowXRP &&
                            <Stack direction="row" spacing={1} alignItems="center" sx={{mt: 1.5}}>
                                <Typography variant="s17">Receiving XRP:</Typography>
                                <Typography variant="s18">disabled</Typography>
                            </Stack>
                        }

                        {info.transferRate &&
                            <Stack direction="row" spacing={1} alignItems="center" sx={{mt: 1.5}}>
                                <Typography variant="s17">Transfer fee:</Typography>
                                <Typography variant="s18">{fNumber(new Decimal(info.transferRate).sub(1).mul(100).toNumber())} %</Typography>
                            </Stack>
                        }

                        {info.noFreeze &&
                            <Stack direction="row" spacing={1} alignItems="center" sx={{mt: 1.5}}>
                                <Typography variant="s17">No freeze:</Typography>
                                <Link
                                    underline="always"
                                    color="inherit"
                                    target="_blank"
                                    href={`https://xrpl.org/freezes.html`}
                                    rel="noreferrer noopener nofollow"
                                >
                                    <Typography variant="s18">true</Typography>
                                </Link>
                            </Stack>
                        }

                        {info.defaultRipple &&
                            <Stack direction="row" spacing={1} alignItems="center" sx={{mt: 1.5}}>
                                <Typography variant="s17">Rippling:</Typography>
                                <Typography variant="s18">enabled</Typography>
                            </Stack>
                        }

                    </Stack>
                </DialogContent>
            </IssuerDialog>
        </>
    );
}
