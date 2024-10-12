
// Material
import {
    styled,
    Chip,
    Link,
    useTheme,
    Menu,
    MenuItem,
    Avatar,
    ListItemText
} from '@mui/material';

// Iconify
import { Icon } from '@iconify/react';
import { useState } from 'react';
import zoomIcon from '@iconify/icons-cil/zoom';
import chevronDown from '@iconify/icons-akar-icons/chevron-down';

// ----------------------------------------------------------------------
const LinkChip = styled(Chip)(({ theme }) => ({
    // color: theme.palette.text.primary,
    '&&:hover' : {
        backgroundColor: theme.palette.grey[500_24],
        cursor: 'pointer'
    },
    "&&:focus": {
    },
    borderRadius: '6px'
}));


export default function ExplorersMenu({issuer}) {
    const [anchorEl, setAnchorEl] = useState(null);
    const [open, setOpen] = useState(false);
    const theme = useTheme();

    const handleClick = () => {
    }

    const handleOpen = (event) => {
        setAnchorEl(event.currentTarget);
        setOpen(true);
    };

    const handleOpen1 = (event) => {
        setOpen(true);
    };

    const handleClose = (event) => {
        setOpen(false);
    };

    return (
        <>
            <LinkChip
                id="explorers_chip"
                aria-owns={open ? "simple-menu" : null}
                aria-haspopup="true"
                onMouseOver={handleOpen}
                onMouseLeave={handleClose}
                style={{ zIndex: open ? 1301:100 }}
                label="Explorers" sx={{pl:0.5,pr:0.5}}
                deleteIcon={<Icon icon={chevronDown} width="16" height="16" style={{ color: theme.palette.primary.main }}/>}
                onDelete={handleClick}
                icon={<Icon icon={zoomIcon} width="16" height="16" />} 
            />
            
            <Menu
                id="simple-menu"
                anchorEl={anchorEl}
                open={open}
                anchorOrigin={{
                    vertical: "bottom",
                    horizontal: "center"
                }}
                transformOrigin={{
                    vertical: "top",
                    horizontal: "center"
                }}
                MenuListProps={{
                    onMouseOver: handleOpen1,
                    onMouseLeave: handleClose
                }}
                // PaperProps={{
                //   sx: { width: 170, maxWidth: '100%' }
                // }}
            >

                
                <Link
                    underline="none"
                    color="inherit"
                    target="_blank"
                    href={issuer==='XRPL'?`https://bithomp.com`:`https://bithomp.com/explorer/${issuer}`}
                    rel="noreferrer noopener nofollow"
                >
                    <MenuItem onClick={() => handleClose()} disableRipple sx={{ color: 'text.secondary' }}>
                        <Avatar alt="Bithomp Explorer" src="/static/bithomp.webp" sx={{ mr:1, width: 24, height: 24 }} />
                        <ListItemText primary="Bithomp" primaryTypographyProps={{ variant: 'subtitle2' }} />
                    </MenuItem>
                </Link>

                <Link
                    underline="none"
                    color="inherit"
                    target="_blank"
                    href={issuer==='XRPL'?`https://xrpscan.com`:`https://xrpscan.com/account/${issuer}`}
                    rel="noreferrer noopener nofollow"
                >
                    <MenuItem onClick={() =>  handleClose()} disableRipple sx={{ color: 'text.secondary' }}>
                        <Avatar alt="XRPScan Explorer" src="/static/xrpscan.webp" sx={{ mr:1, width: 24, height: 24 }} />
                        <ListItemText primary="XRPScan" primaryTypographyProps={{ variant: 'subtitle2' }} />
                    </MenuItem>
                </Link>


                <Link
                    underline="none"
                    color="inherit"
                    target="_blank"
                    href={issuer==='XRPL'?`https://gatehub.net`:`https://gatehub.net/explorer/${issuer}`}
                    rel="noreferrer noopener nofollow"
                >
                    <MenuItem onClick={() => handleClose()} disableRipple sx={{ color: 'text.secondary' }}>
                        <Avatar alt="Gatehub Explorer" src="/static/gatehub.webp" sx={{ mr:1, width: 24, height: 24 }} />
                        <ListItemText primary="GateHub" primaryTypographyProps={{ variant: 'subtitle2' }} />
                    </MenuItem>
                </Link>
                
                {/* https://explorer.xrplf.org/r4sHHquyvSxozK5HgCShR7ZqpZE5wzvjHt
                https://livenet.xrpl.org/accounts/r4sHHquyvSxozK5HgCShR7ZqpZE5wzvjHt
                https://xrplorer.com/account/r4sHHquyvSxozK5HgCShR7ZqpZE5wzvjHt */}


                <Link
                    underline="none"
                    color="inherit"
                    target="_blank"
                    href={issuer==='XRPL'?`https://livenet.xrpl.org`:`https://livenet.xrpl.org/accounts/${issuer}`}
                    rel="noreferrer noopener nofollow"
                >
                    <MenuItem onClick={() => handleClose()} disableRipple sx={{ color: 'text.secondary' }}>
                        <Avatar alt="xrpl.org Explorer" src="/static/xrpl-org.webp" sx={{ mr:1, width: 24, height: 24 }} />
                        <ListItemText primary="XRPL Explorer" primaryTypographyProps={{ variant: 'subtitle2' }} />
                    </MenuItem>
                </Link>



                <Link
                    underline="none"
                    color="inherit"
                    target="_blank"
                    href={issuer==='XRPL'?`https://explorer.xrplf.org`:`https://explorer.xrplf.org/${issuer}`}
                    rel="noreferrer noopener nofollow"
                >
                    <MenuItem onClick={() => handleClose()} disableRipple sx={{ color: 'text.secondary' }}>
                        <Avatar alt="XRPL Foundation Explorer" src="/static/explorerxrplf.svg" sx={{ mr:1, width: 24, height: 24 }} />
                        <ListItemText primary="XRPLF Explorer" primaryTypographyProps={{ variant: 'subtitle2' }} />
                    </MenuItem>
                </Link>
                
                {/*
                <Link
                    underline="none"
                    color="inherit"
                    target="_blank"
                    href={`https://xrplorer.com/account/${issuer}`}
                    rel="noreferrer noopener nofollow"
                >
                    <MenuItem onClick={() => handleClose()} disableRipple sx={{ color: 'text.secondary' }}>
                        <Avatar alt="xumm" src="/static/xrplorer.webp" sx={{ mr:1, width: 24, height: 24 }} />
                        <ListItemText primary="XRPLORER" primaryTypographyProps={{ variant: 'subtitle2' }} />
                    </MenuItem>
                </Link>
                */}
            </Menu>
        </>
    );
}
