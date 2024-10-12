
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
import { useState } from 'react';
import personFill from '@iconify/icons-bi/person-fill';
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


export default function CommunityMenu({token}) {
    const [anchorEl, setAnchorEl] = useState(null);
    const [open, setOpen] = useState(false);
    const theme = useTheme();

    const {
        name,
        user,
        // domain,
        // whitepaper,
        social,
        // issuer,
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
                id="community_chip"
                aria-owns={open ? "simple-menu" : null}
                aria-haspopup="true"
                onMouseOver={handleOpen}
                onMouseLeave={handleClose}
                style={{ zIndex: open ? 1301:100 }}
                label="Community" sx={{pl:0.5,pr:0.5}}
                deleteIcon={<Icon icon={chevronDown} width="16" height="16" style={{ color: theme.palette.primary.main }}/>}
                onDelete={handleClick}
                icon={<Icon icon={personFill} width="16" height="16" />}
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
                {social && social.twitter && (
                    <Link
                        underline="none"
                        color="inherit"
                        target="_blank"
                        href={`https://twitter.com/${social.twitter}`}
                        rel="noreferrer noopener nofollow"
                    >
                        <MenuItem onClick={() => handleClose()} disableRipple sx={{ color: 'text.secondary' }}>
                            <Avatar alt={`${user} ${name} Twitter Profile`} src="/static/twitter.webp" sx={{ mr:1, width: 24, height: 24 }} />
                            <ListItemText primary="Twitter" primaryTypographyProps={{ variant: 'subtitle2' }} />
                        </MenuItem>
                    </Link>
                )}
                {social && social.facebook && (
                    <Link
                        underline="none"
                        color="inherit"
                        target="_blank"
                        href={`https://facebook.com/${social.facebook}`}
                        rel="noreferrer noopener nofollow"
                    >
                        <MenuItem onClick={() => handleClose()} disableRipple sx={{ color: 'text.secondary' }}>
                            <Avatar alt={`${user} ${name} Facebook Page`} src="/static/facebook.webp" sx={{ mr:1, width: 24, height: 24 }} />
                            <ListItemText primary="Facebook" primaryTypographyProps={{ variant: 'subtitle2' }} />
                        </MenuItem>
                    </Link>
                )}
                {social && social.linkedin && (
                    <Link
                        underline="none"
                        color="inherit"
                        target="_blank"
                        href={`https://linkedin.com/${social.linkedin}`}
                        rel="noreferrer noopener nofollow"
                    >
                        <MenuItem onClick={() => handleClose()} disableRipple sx={{ color: 'text.secondary' }}>
                            <Avatar alt={`${user} ${name} LinkedIn Profile`} src="/static/linkedin.webp" sx={{ mr:1, width: 24, height: 24 }} />
                            <ListItemText primary="LinkedIn" primaryTypographyProps={{ variant: 'subtitle2' }} />
                        </MenuItem>
                    </Link>
                )}
                {social && social.instagram && (
                    <Link
                        underline="none"
                        color="inherit"
                        target="_blank"
                        href={`https://instagram.com/${social.instagram}`}
                        rel="noreferrer noopener nofollow"
                    >
                        <MenuItem onClick={() => handleClose()} disableRipple sx={{ color: 'text.secondary' }}>
                            <Avatar alt={`${user} ${name} Instagram Profile`} src="/static/instagram.webp" sx={{ mr:1, width: 24, height: 24 }} />
                            <ListItemText primary="Instagram" primaryTypographyProps={{ variant: 'subtitle2' }} />
                        </MenuItem>
                    </Link>
                )}
                {social && social.youtube && (
                    <Link
                        underline="none"
                        color="inherit"
                        target="_blank"
                        href={`https://youtube.com/${social.youtube}`}
                        rel="noreferrer noopener nofollow"
                    >
                        <MenuItem onClick={() => handleClose()} disableRipple sx={{ color: 'text.secondary' }}>
                            <Avatar alt={`${user} ${name} Youtube Channel`} src="/static/youtube.webp" sx={{ mr:1, width: 24, height: 24 }} />
                            <ListItemText primary="Youtube" primaryTypographyProps={{ variant: 'subtitle2' }} />
                        </MenuItem>
                    </Link>
                )}
                {social && social.medium && (
                    <Link
                        underline="none"
                        color="inherit"
                        target="_blank"
                        href={`https://medium.com/${social.medium}`}
                        rel="noreferrer noopener nofollow"
                    >
                        <MenuItem onClick={() => handleClose()} disableRipple sx={{ color: 'text.secondary' }}>
                            <Avatar alt={`${user} ${name} Medium Publication`} src="/static/medium.webp" sx={{ mr:1, width: 24, height: 24 }} />
                            <ListItemText primary="Medium" primaryTypographyProps={{ variant: 'subtitle2' }} />
                        </MenuItem>
                    </Link>
                )}
                {social && social.twitch && (
                    <Link
                        underline="none"
                        color="inherit"
                        target="_blank"
                        href={`https://twitch.tv/${social.twitch}`}
                        rel="noreferrer noopener nofollow"
                    >
                        <MenuItem onClick={() => handleClose()} disableRipple sx={{ color: 'text.secondary' }}>
                            <Avatar alt={`${user} ${name} Twitch Channel`} src="/static/twitch.webp" sx={{ mr:1, width: 24, height: 24 }} />
                            <ListItemText primary="Twitch" primaryTypographyProps={{ variant: 'subtitle2' }} />
                        </MenuItem>
                    </Link>
                )}
                {social && social.tiktok && (
                    <Link
                        underline="none"
                        color="inherit"
                        target="_blank"
                        href={`https://tiktok.com/${social.tiktok}`}
                        rel="noreferrer noopener nofollow"
                    >
                        <MenuItem onClick={() => handleClose()} disableRipple sx={{ color: 'text.secondary' }}>
                            <Avatar alt={`${user} ${name} Tiktok Profile`} src="/static/tiktok.webp" sx={{ mr:1, width: 24, height: 24 }} />
                            <ListItemText primary="Tiktok" primaryTypographyProps={{ variant: 'subtitle2' }} />
                        </MenuItem>
                    </Link>
                )}
                {social && social.reddit && (
                    <Link
                        underline="none"
                        color="inherit"
                        target="_blank"
                        href={`https://www.reddit.com/${social.reddit}`}
                        rel="noreferrer noopener nofollow"
                    >
                        <MenuItem onClick={() => handleClose()} disableRipple sx={{ color: 'text.secondary' }}>
                            <Avatar alt={`${user} ${name} Reddit Community`} src="/static/reddit.svg" sx={{ mr:1, width: 24, height: 24 }} />
                            <ListItemText primary="Reddit" primaryTypographyProps={{ variant: 'subtitle2' }} />
                        </MenuItem>
                    </Link>
                )}
                <Link
                    underline="none"
                    color="inherit"
                    target="_blank"
                    href={`https://www.xrpchat.com/`}
                    rel="noreferrer noopener nofollow"
                >
                    <MenuItem onClick={() => handleClose()} disableRipple sx={{ color: 'text.secondary' }}>
                        <Avatar alt="XRP Chat Forum" src="/static/xrpchat.webp" sx={{ mr:1, width: 24, height: 24 }} />
                        <ListItemText primary="XRP Chat" primaryTypographyProps={{ variant: 'subtitle2' }} />
                    </MenuItem>
                </Link>
            </Menu>
        </>
    );
}
