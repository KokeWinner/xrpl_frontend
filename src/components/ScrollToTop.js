import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import Box from '@mui/material/Box';
import Fab from '@mui/material/Fab';
import Zoom from '@mui/material/Zoom';
import useScrollTrigger from '@mui/material/useScrollTrigger';
import PropTypes from 'prop-types';
import { useContext } from 'react';
import { alpha, styled } from '@mui/system';
import { AppContext } from 'src/AppContext';


const FabStyle = styled(Fab)(({ theme, darkMode }) => ({
    boxShadow: 'none',
    backdropFilter: 'blur(2px)',
    WebkitBackdropFilter: 'blur(2px)', // Fix on Mobile
    backgroundColor: darkMode ? 'rgb(114, 114, 114)' : 'rgba(23, 24, 27, 0.85)',
    '&:hover': {
      backgroundColor: 'rgb(41, 41, 41)',
    },
    '& .MuiSvgIcon-root': {
        color: darkMode ? 'black' : 'white', // Customize the arrow color based on darkMode
    },
  }));
  

  ScrollToTop.propTypes = {
    window: PropTypes.func,
  };
  

  export default function ScrollToTop(props) {
    const { window } = props;
    // Note that you normally won't need to set the window ref as useScrollTrigger
    // will default to window.
    // This is only being set here because the demo is in an iframe.
    const trigger = useScrollTrigger({
        target: window ? window() : undefined,
        disableHysteresis: true,
        threshold: 100,
    });

    const handleClick = (event) => {
      const anchor = (event.target.ownerDocument || document).querySelector(
        '#back-to-top-anchor',
      );
  
      if (anchor) {
        anchor.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
        });
      }
    };
  
    return (
        <Zoom in={trigger}>
            <Box
                onClick={handleClick}
                role="presentation"
                sx={{ position: 'fixed', bottom: 16, right: 16 }}
            >
                <FabStyle size="small" aria-label="scroll back to top">
                    <KeyboardArrowUpIcon />
                </FabStyle>
            </Box>
        </Zoom>
    );
}
