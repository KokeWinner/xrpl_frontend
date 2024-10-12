import { useContext } from 'react';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import { Box, Link } from '@mui/material';

import { AppContext } from 'src/AppContext';

function Logo({ style }) {
  const { darkMode } = useContext(AppContext);

  const img_black = "/logo/xrpl-to-logo-black.svg";
  const img_white = "/logo/xrpl-to-logo-white.svg";
  const img = darkMode ? img_white : img_black;

  const logoStyle = {
    paddingLeft: 0,
    paddingRight: 0,
    paddingTop: 3,
    display: 'inline-flex',
    transition: 'opacity 0.3s', // Add a transition for smooth theme change
    ...style,
  };

  return (
    <Link
      href="/"
      style={logoStyle}
      underline="none"
      rel="noreferrer noopener nofollow"
    >
      <LazyLoadImage src={img} width={125} height={46} />
    </Link>
  );
}

export default Logo;
