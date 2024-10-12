import React from 'react';
import { useTranslation } from 'react-i18next';
import { useContext } from 'react';
import { Link as MuiLink } from '@mui/material';
import BarChartIcon from '@mui/icons-material/BarChart';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WhatshotIcon from '@mui/icons-material/Whatshot'; // Gainers & Losers
import VisibilityIcon from '@mui/icons-material/Visibility'; // Most Viewed
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'; // Recently Added
import StarIcon from '@mui/icons-material/Star'; // Spotlight
import { AppContext } from 'src/AppContext';
import { styled, Link, Menu, useTheme, MenuItem } from '@mui/material';



const PhoneDropDown = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { darkMode } = useContext(AppContext);
  const StyledLink = styled('li')(
    ({ darkMode }) => `
    margin-top: 10px
  `
  );
  return (
    <>
      <ul
        style={{
          background: darkMode ? 'rgb(23, 23, 26)' : 'rgb(244, 245, 251)',
          color: darkMode ? 'white' : '#343434',
          listStyle: 'none',
          margin: 0,
          paddingLeft: '2.5rem',
          paddingBottom: '10px'
        }}
      >
        <StyledLink id={darkMode ? 'darkItem' : 'lightItem'}>
          <MuiLink
            href="/"
            color="inherit"
            underline="none"
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <BarChartIcon sx={{ marginRight: theme.spacing(1) }} />
            Ranking
          </MuiLink>
        </StyledLink>
        <StyledLink id={darkMode ? 'darkItem' : 'lightItem'}>
          <MuiLink
            href="/new"
            color="inherit"
            underline="none"
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <AddCircleOutlineIcon sx={{ marginRight: theme.spacing(1) }} />
            Recently Added
          </MuiLink>
        </StyledLink>
        <StyledLink id={darkMode ? 'darkItem' : 'lightItem'}>
          <MuiLink
            href="/best-tokens"
            color="inherit"
            underline="none"
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <StarIcon sx={{ marginRight: theme.spacing(1) }} />
            Spotlight
          </MuiLink>
        </StyledLink>
        <StyledLink id={darkMode ? 'darkItem' : 'lightItem'}>
          <MuiLink
            href="/trending-tokens"
            color="inherit"
            underline="none"
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <TrendingUpIcon sx={{ marginRight: theme.spacing(1) }} />
            Trending
          </MuiLink>
        </StyledLink>
        <StyledLink id={darkMode ? 'darkItem' : 'lightItem'}>
          <MuiLink
            href="/gainers-losers"
            color="inherit"
            underline="none"
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <WhatshotIcon sx={{ marginRight: theme.spacing(1) }} />
            Gainers & Losers
          </MuiLink>
        </StyledLink>
        <StyledLink id={darkMode ? 'darkItem' : 'lightItem'}>
          <MuiLink
            href="/most-viewed-tokens"
            color="inherit"
            underline="none"
            sx={{ display: 'flex', alignItems: 'center' }}
          >
            <VisibilityIcon sx={{ marginRight: theme.spacing(1) }} />
            Most Viewed
          </MuiLink>
        </StyledLink>
      </ul>
    </>
  );
};

export default PhoneDropDown;
