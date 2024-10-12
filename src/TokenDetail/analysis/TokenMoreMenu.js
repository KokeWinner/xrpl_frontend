import { useContext } from 'react';
import { AppContext } from 'src/AppContext';
import { Icon } from '@iconify/react';
import { useRef, useState } from 'react';
import moreVerticalFill from '@iconify/icons-eva/more-vertical-fill';
import LinkIcon from '@mui/icons-material/Link';
import EditIcon from '@mui/icons-material/Edit';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';

// Material
import {
    Avatar,
    IconButton,
    Link,
    ListItemText,
    Menu,
    MenuItem
} from '@mui/material';
// ----------------------------------------------------------------------

export default function TokenMoreMenu({token, admin, setEditToken, setTrustToken}) {
    const ref = useRef(null);
    const {
        issuer,
        slug,
        currency
    } = token;

    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <IconButton ref={ref} onClick={() => setIsOpen(true)}>
                <Icon icon={moreVerticalFill} width={20} height={20} />
            </IconButton>

            <Menu
                open={isOpen}
                anchorEl={ref.current}
                onClose={() => setIsOpen(false)}
                PaperProps={{
                    sx: { width: 170, maxWidth: '100%' }
                }}
                anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
                <MenuItem onClick={() => {setIsOpen(false);setTrustToken(token);}} disableRipple sx={{ color: 'text.secondary' }}>
                    <LinkIcon sx={{ mr:1, width: 24, height: 24 }} />
                    <ListItemText primary="Trust Set" primaryTypographyProps={{ variant: 'subtitle2' }} />
                </MenuItem>


                <Link
                    underline="none"
                    color="inherit"
                    target="_blank"
                    href={`https://xrpl.to/token/${slug}/trade`}
                    rel="noreferrer noopener nofollow"
                >
                    <MenuItem onClick={() => setIsOpen(false)} disableRipple sx={{ color: 'text.secondary' }}>
                    <SwapHorizIcon sx={{ mr:1, width: 24, height: 24 }} />
                        <ListItemText primary="DEX Trade" primaryTypographyProps={{ variant: 'subtitle2' }} />
                    </MenuItem>
                </Link>


                
{/*
                <Link
                    underline="none"
                    color="inherit"
                    target="_blank"
                    href={`https://bithomp.com/explorer/${issuer}`}
                    rel="noreferrer noopener nofollow"
                >
                    <MenuItem onClick={() => setIsOpen(false)} disableRipple sx={{ color: 'text.secondary' }}>
                        <Avatar alt="Bithomp Explorer" src="/static/bithomp.webp" sx={{ mr:1, width: 24, height: 24 }} />
                        <ListItemText primary="Bithomp" primaryTypographyProps={{ variant: 'subtitle2' }} />
                    </MenuItem>
                </Link>
                <Link
                    underline="none"
                    color="inherit"
                    target="_blank"
                    href={`https://xrpscan.com/account/${issuer}`}
                    rel="noreferrer noopener nofollow"
                >
                    <MenuItem onClick={() => setIsOpen(false)} disableRipple sx={{ color: 'text.secondary' }}>
                        <Avatar alt="XRPSCAN Explorer" src="/static/xrpscan.webp" sx={{ mr:1, width: 24, height: 24 }} />
                        <ListItemText primary="XRPScan" primaryTypographyProps={{ variant: 'subtitle2' }} />
                    </MenuItem>
                </Link>
                <Link
                    underline="none"
                    color="inherit"
                    target="_blank"
                    href={`https://gatehub.net/explorer/${issuer}`}
                    rel="noreferrer noopener nofollow"
                >
                    <MenuItem onClick={() => setIsOpen(false)} disableRipple sx={{ color: 'text.secondary' }}>
                        <Avatar alt="Gatehub Explorer" src="/static/gatehub.webp" sx={{ mr:1, width: 24, height: 24 }} />
                        <ListItemText primary="GateHub" primaryTypographyProps={{ variant: 'subtitle2' }} />
                    </MenuItem>
                </Link>


                <Link
                    underline="none"
                    color="inherit"
                    target="_blank"
                    href={`https://livenet.xrpl.org/accounts/${issuer}`}
                    rel="noreferrer noopener nofollow"
                >
                    <MenuItem onClick={() => setIsOpen(false)} disableRipple sx={{ color: 'text.secondary' }}>
                        <Avatar alt="XRPL Explorer" src="/static/xrpl-org.webp" sx={{ mr:1, width: 24, height: 24 }} />
                        <ListItemText primary="XRPL Explorer" primaryTypographyProps={{ variant: 'subtitle2' }} />
                    </MenuItem>
                </Link>


                <Link
                    underline="none"
                    color="inherit"
                    target="_blank"
                    href={`https://explorer.xrplf.org/${issuer}`}
                    rel="noreferrer noopener nofollow"
                >
                    <MenuItem onClick={() => setIsOpen(false)} disableRipple sx={{ color: 'text.secondary' }}>
                        <Avatar alt="XRPL Foundation Explorer" src="/static/xrplf_black.svg" sx={{ mr:1, width: 24, height: 24 }} />
                        <ListItemText primary="XRPLF Explorer" primaryTypographyProps={{ variant: 'subtitle2' }} />
                    </MenuItem>
                </Link>

            */}
                {/* <Link
                    underline="none"
                    color="inherit"
                    target="_blank"
                    href={`https://xrplorer.com/account/${issuer}`}
                    rel="noreferrer noopener nofollow"
                >
                    <MenuItem onClick={() => setIsOpen(false)} disableRipple sx={{ color: 'text.secondary' }}>
                        <Avatar alt="xrplorer" src="/static/xrplorer.svg" sx={{ mr:1, width: 24, height: 24 }} />
                        <ListItemText primary="XRPLORER" primaryTypographyProps={{ variant: 'subtitle2' }} />
                    </MenuItem>
                </Link> 
                <Link
                    underline="none"
                    color="inherit"
                    target="_blank"
                    href={`https://xumm.app/detect/xapp:xumm.dex?issuer=${issuer}&currency=${currency}`}
                    rel="noreferrer noopener nofollow"
                >
                    <MenuItem onClick={() => setIsOpen(false)} disableRipple sx={{ color: 'text.secondary' }}>
                        <Avatar alt="xumm" src="/static/xumm.webp" sx={{ mr:1, width: 24, height: 24 }} />
                        <ListItemText primary="Xumm DEX" primaryTypographyProps={{ variant: 'subtitle2' }} />
                    </MenuItem>
                </Link>
                <Link
                    underline="none"
                    color="inherit"
                    target="_blank"
                    href={`https://sologenic.org/trade?network=mainnet&market=${currency}%2B${issuer}%2FXRP`}
                    rel="noreferrer noopener nofollow"
                >
                    <MenuItem onClick={() => setIsOpen(false)} disableRipple sx={{ color: 'text.secondary' }}>
                        <Avatar alt="sologenic" src="/static/solo.webp" sx={{ mr:1, width: 24, height: 24 }} />
                        <ListItemText primary="Sologenic DEX" primaryTypographyProps={{ variant: 'subtitle2' }} />
                    </MenuItem>
                </Link>
                <Link
                    underline="none"
                    color="inherit"
                    target="_blank"
                    href={`https://gatehub.net/markets/${currency}+${issuer}/XRP`}
                    rel="noreferrer noopener nofollow"
                >
                    <MenuItem onClick={() => setIsOpen(false)} disableRipple sx={{ color: 'text.secondary' }}>
                        <Avatar alt="gatehub" src="/static/gatehub.webp" sx={{ mr:1, width: 24, height: 24 }} />
                        <ListItemText primary="GateHub DEX" primaryTypographyProps={{ variant: 'subtitle2' }} />
                    </MenuItem>
                </Link>*/}
            </Menu>
        </>
    );
}
