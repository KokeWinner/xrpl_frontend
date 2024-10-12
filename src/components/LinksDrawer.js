import React, { useContext } from 'react';
import { useMediaQuery } from '@mui/material';

// Material
import {
  Box,
  Chip,
  Link,
  Typography,
  MenuItem,
  Divider,
  Avatar
} from '@mui/material';

// Iconify
import { Icon } from '@iconify/react';
import link45deg from '@iconify/icons-bi/link-45deg';
import linkExternal from '@iconify/icons-charm/link-external';
import paperIcon from '@iconify/icons-charm/link-external';
import chatIcon from '@iconify/icons-bi/chat';
import zoomIcon from '@iconify/icons-cil/zoom';
import personFill from '@iconify/icons-bi/person-fill';

import Drawer from './Drawer';
import { AppContext } from 'src/AppContext';

const socialMediaIcons = {
  twitter: { alt: 'twitter', src: '/static/twitter.webp' },
  facebook: { alt: 'facebook', src: '/static/facebook.webp' },
  linkedin: { alt: 'linkedin', src: '/static/linkedin.webp' },
  instagram: { alt: 'instagram', src: '/static/instagram.webp' },
  youtube: { alt: 'youtube', src: '/static/youtube.webp' },
  medium: { alt: 'medium', src: '/static/medium.webp' },
  twitch: { alt: 'twitch', src: '/static/twitch.webp' },
  tiktok: { alt: 'tiktok', src: '/static/tiktok.webp' },
  reddit: { alt: 'reddit', src: '/static/reddit.svg' },
  telegram: { alt: 'telegram', src: '/static/telegram.webp' },
  discord: { alt: 'discord', src: '/static/discord.webp' },
  xrpchat: { alt: 'xrpchat', src: '/static/xrpchat.webp' }
};

export default function LinksDrawer({ isOpen, toggleDrawer, token }) {
  const { darkMode } = useContext(AppContext);
  const { issuer, domain, whitepaper, social } = token;
  const isChat = social && (social.telegram || social.discord);

  // Use Media Query for responsive design
  const isMobile = useMediaQuery('(max-width:600px)');
  const iconSize = isMobile ? 24 : 16; // larger icons for mobile
  const iconSpacing = isMobile ? '10px' : '5px'; // more spacing for mobile

  const renderLinkItem = (title, icon, link, index) => (
    <Link
      underline="none"
      color="inherit"
      target="_blank"
      href={link}
      rel="noreferrer noopener nofollow"
      key={index}
    >
      <MenuItem divider={true} sx={{ py: 1, px: 2 }}>
        <Avatar
          alt={icon.alt}
          src={icon.src}
          sx={{ mr: iconSpacing, width: iconSize, height: iconSize }}
        />
        <Typography variant="caption">{title}</Typography>
      </MenuItem>
    </Link>
  );

  const renderIconItem = (title, icon) => (
    <MenuItem divider={true} sx={{ py: 1, px: 2 }}>
      <Icon
        icon={icon}
        width={iconSize}
        height={iconSize}
        style={{ marginRight: iconSpacing }}
      />
      <Typography variant="caption">{title}</Typography>
    </MenuItem>
  );

  return (
    <Drawer
      headerStyle={{
        paddingTop: '10px',
        paddingBottom: '10px'
      }}
      isOpen={isOpen}
      toggleDrawer={toggleDrawer}
      title={
        <>
          <Box></Box>
          <Typography variant="h2">Links</Typography>
        </>
      }
    >
      <Box>
        {(domain || whitepaper) && (
          <>
            <Typography
              variant="h6"
              color="textPrimary"
              sx={{ mt: 2, ml: 2, mb: 1 }}
            >
              Links
            </Typography>
            {domain &&
              renderLinkItem('Website', link45deg, `https://${domain}`)}
            {whitepaper &&
              renderLinkItem('Whitepaper', paperIcon, whitepaper)}
            <Divider sx={{ my: 2 }} />
          </>
        )}

        {isChat && (
          <>
            <Typography
              variant="h6"
              color="textPrimary"
              sx={{ mt: 2, ml: 2, mb: 1 }}
            >
              Chat
            </Typography>
            {social.telegram &&
              renderLinkItem('Telegram', chatIcon, social.telegram)}
            {social.discord &&
              renderLinkItem('Discord', chatIcon, social.discord)}
            <Divider sx={{ my: 2 }} />
          </>
        )}

        {social && (
          <>
            <Typography
              variant="h6"
              color="textPrimary"
              sx={{ mt: 2, ml: 2, mb: 1 }}
            >
              Social Media
            </Typography>
            {Object.entries(social).map(([platform, handle], index) => {
              if (handle && socialMediaIcons[platform]) {
                return renderLinkItem(
                  platform.charAt(0).toUpperCase() + platform.slice(1),
                  socialMediaIcons[platform],
                  `https://${platform}.com/${handle}`,
                  index
                );
              }
              return null;
            })}
            <Divider sx={{ my: 2 }} />
          </>
        )}

        {issuer && (
          <>
            <Typography
              variant="h6"
              color="textPrimary"
              sx={{ mt: 2, ml: 2, mb: 1 }}
            >
              Issuer
            </Typography>
            {renderLinkItem('Website', linkExternal, issuer)}
            <Divider sx={{ my: 2 }} />
          </>
        )}

        <Typography
          variant="h6"
          color="textPrimary"
          sx={{ mt: 2, ml: 2, mb: 1 }}
        >
          Additional Resources
        </Typography>
        {renderIconItem('Explorer', zoomIcon)}
        <Divider sx={{ my: 2 }} />

        <Typography
          variant="h6"
          color="textPrimary"
          sx={{ mt: 2, ml: 2, mb: 1 }}
        >
          Community
        </Typography>
        {renderIconItem('XRPChat', personFill)}
      </Box>
    </Drawer>
  );
}
