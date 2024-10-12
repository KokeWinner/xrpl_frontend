import { useState } from 'react';

// Material
import {
    styled,
    Chip,
    Link,
    Menu,
    useTheme,
    MenuItem,
    Avatar,
    ListItemText
} from '@mui/material';

// Iconify
import { Icon } from '@iconify/react';
// import personFill from '@iconify/icons-bi/person-fill';
import chevronDown from '@iconify/icons-akar-icons/chevron-down';
import chatIcon from '@iconify/icons-bi/chat';

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


export default function CommunityMenu({token}) {
    const [anchorEl, setAnchorEl] = useState(null);
    const [open, setOpen] = useState(false);
    const theme = useTheme();

    const {
        name,
        user,
        // domain,
        // whitepaper,
        // issuer,
        social,
    } = token;

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
                id="chat_chip"
                aria-owns={open ? "simple-menu" : null}
                aria-haspopup="true"
                onMouseOver={handleOpen}
                onMouseLeave={handleClose}
                style={{ zIndex: open ? 1301:100 }}
                label="Chat" sx={{pl:0.5,pr:0.5}}
                deleteIcon={<Icon icon={chevronDown} width="16" height="16" style={{ color: theme.palette.primary.main }}/>}
                onDelete={handleClick}
                icon={<Icon icon={chatIcon} width="16" height="16" />}
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
                {social && social.telegram && (
                    <Link
                        underline="none"
                        color="inherit"
                        target="_blank"
                        href={`https://t.me/${social.telegram}`}
                        rel="noreferrer noopener nofollow"
                    >
                        <MenuItem onClick={() => handleClose()} disableRipple sx={{ color: 'text.secondary' }}>
                            <Avatar alt={`${user} ${name} Telegram Channel`} src="/static/telegram.webp" sx={{ mr:1, width: 24, height: 24 }} />
                            <ListItemText primary="Telegram" primaryTypographyProps={{ variant: 'subtitle2' }} />
                        </MenuItem>
                    </Link>
                )}
                {social && social.discord && (
                    <Link
                        underline="none"
                        color="inherit"
                        target="_blank"
                        href={`https://discord.gg/${social.discord}`}
                        rel="noreferrer noopener nofollow"
                    >
                        <MenuItem onClick={() => handleClose()} disableRipple sx={{ color: 'text.secondary' }}>
                            <Avatar alt={`${user} ${name} Discord Server`} src="/static/discord.webp" sx={{ mr:1, width: 24, height: 24 }} />
                            <ListItemText primary="Discord" primaryTypographyProps={{ variant: 'subtitle2' }} />
                        </MenuItem>
                    </Link>
                )}
            </Menu>
        </>
    );
}
