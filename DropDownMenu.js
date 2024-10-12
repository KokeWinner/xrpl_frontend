import React, { useContext, useMemo } from 'react';
import { Link as MuiLink, styled, Link, useTheme } from '@mui/material';
// Icon Imports
import BarChartIcon from '@mui/icons-material/BarChart';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import StarIcon from '@mui/icons-material/Star';
import { AppContext } from 'src/AppContext';
import { useTranslation } from 'react-i18next';

const StyledLink = styled(Link)(
  ({ darkMode }) => `
      font-weight: 700;
      margin-right: 27px;
      padding: 8px 10px; // Increased padding
      border-radius: 8px;
      transition: background-color 0.3s;
      display: inline-block; // Ensure it's not inline
      &:hover {
        color: ${darkMode ? '#005E46' : '#4455CC'};
        cursor: pointer;
      }
  `
);

const DropDownMenu = React.memo(({ handleMenuOpen, handleMenuClose, anchorEl, open }) => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { darkMode } = useContext(AppContext);

  const menuItems = useMemo(() => [
    { href: '/', icon: BarChartIcon, label: 'Ranking' },
    { href: '/new', icon: AddCircleOutlineIcon, label: 'Recently Added' },
    { href: '/best-tokens', icon: StarIcon, label: 'Spotlight' },
    { href: '/trending-tokens', icon: TrendingUpIcon, label: 'Trending' },
    { href: '/gainers-losers', icon: WhatshotIcon, label: 'Gainers & Losers' },
    { href: '/most-viewed-tokens', icon: VisibilityIcon, label: 'Most Viewed' },
  ], []);

  return (
    <ul id="dropdown_menu">
      <li>
        <StyledLink
          underline="none"
          color={darkMode ? 'white' : 'black'}
          sx={{
            '&:hover': {
              color: darkMode ? '#22B14C !important' : '#3366FF !important'
            }
          }}
          href="/"
        >
          {t('Tokens')}
          <ul id="dropItems" style={{
            background: darkMode ? 'rgb(23, 23, 26)' : 'rgb(244, 245, 251)',
            border: darkMode ? '1px solid rgb(33, 37, 43)' : '1px solid rgb(220, 220, 220)',
            color: darkMode ? 'white' : '#343434',
          }}>
            {menuItems.map(({ href, icon: Icon, label }) => (
              <li key={href} id={darkMode ? 'darkItem' : 'lightItem'}>
                <MuiLink 
                  href={href}
                  color="inherit"
                  underline="none"
                  sx={{ display: 'flex', alignItems: 'center' }}
                >
                  <Icon sx={{ marginRight: theme.spacing(1) }} />
                  {label}
                </MuiLink>
              </li>
            ))}
          </ul>
        </StyledLink>
      </li>
    </ul>
  );
});

export default DropDownMenu;