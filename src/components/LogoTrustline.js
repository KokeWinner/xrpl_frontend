import React, { useContext } from 'react';
import { AppContext } from 'src/AppContext';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import { useTheme } from '@mui/material/styles';

const LogoTrustline = () => {
    const { darkMode } = useContext(AppContext);
    const theme = useTheme();

    // Define the image paths for both dark and light themes
    const imgPaths = {
        dark: "/logo/xrpl-to-logo-white.svg",
        light: "/logo/xrpl-to-logo-black.svg",
    };

    // Use the current theme to select the appropriate image path
    const img = darkMode ? imgPaths.dark : imgPaths.light;

    return (
        <Link
            href="/"
            sx={{ pl: 0, pr: 0, display: 'inline-flex' }}
            underline="none"
            rel="noreferrer noopener nofollow"
        >
            <LazyLoadImage
                src={img}
                width={125}
                height={46}
            />
        </Link>
    );
};

export default LogoTrustline;
