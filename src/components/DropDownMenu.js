import { Link as MuiLink } from '@mui/material';
import {
  styled,
  Menu,
  useTheme,
  MenuItem
} from '@mui/material';
// Icon Imports
import BarChartIcon from '@mui/icons-material/BarChart';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import WhatshotIcon from '@mui/icons-material/Whatshot'; // Gainers & Losers
import VisibilityIcon from '@mui/icons-material/Visibility'; // Most Viewed
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline'; // Recently Added
import StarIcon from '@mui/icons-material/Star'; // Spotlight
import { useContext } from 'react';
import { AppContext } from 'src/AppContext';
import { useTranslation } from 'react-i18next';

const StyledLink = styled("div")(
  () => `
      font-weight: 700;
      margin-right: 27px;
      padding: 8px 10px; // Increased padding
      border-radius: 8px;
      transition: background-color 0.3s;
      display: inline-block; // Ensure it's not inline
      cursor: pointer;
  `
);


const DropDownMenu = () => {
  const { t } = useTranslation();
  const theme = useTheme();
  const { darkMode } = useContext(AppContext);

  return (
    <>
      <ul id="dropdown_menu">
        <li>
          <StyledLink
            sx={{
              color: darkMode ? 'white' : 'black',
              '&:hover': {
                color: darkMode ? '#22B14C' : '#3366FF'
              }
            }}
          >
            {t('Tokens')}

            <ul id="dropItems" style={{
              background: darkMode ? 'rgb(23, 23, 26)' : 'rgb(244, 245, 251)',
              border: darkMode ? '1px solid rgb(33, 37, 43)' : '1px solid rgb(220, 220, 220)',
              color: darkMode ? 'white' : '#343434',
            }}>
              <li id={darkMode ? 'darkItem' : 'lightItem'}>
                <MuiLink
                  href="/"
                  color="inherit"
                  underline="none"
                  sx={{ display: 'flex', alignItems: 'center' }}
                >
                  <BarChartIcon sx={{ marginRight: theme.spacing(1) }} />
                  Ranking
                </MuiLink>
              </li>
              <li id={darkMode ? 'darkItem' : 'lightItem'}>
                <MuiLink
                  href="/new"
                  color="inherit"
                  underline="none"
                  sx={{ display: 'flex', alignItems: 'center' }}
                >
                  <AddCircleOutlineIcon
                    sx={{ marginRight: theme.spacing(1) }}
                  />
                  Recently Added
                </MuiLink>
              </li>
              <li id={darkMode ? 'darkItem' : 'lightItem'}>
                <MuiLink
                  href="/best-tokens"
                  color="inherit"
                  underline="none"
                  sx={{ display: 'flex', alignItems: 'center' }}
                >
                  <StarIcon sx={{ marginRight: theme.spacing(1) }} />
                  Spotlight
                </MuiLink>
              </li>
              <li id={darkMode ? 'darkItem' : 'lightItem'}>
                <MuiLink
                  href="/trending-tokens"
                  color="inherit"
                  underline="none"
                  sx={{ display: 'flex', alignItems: 'center' }}
                >
                  <TrendingUpIcon sx={{ marginRight: theme.spacing(1) }} />
                  Trending
                </MuiLink>
              </li>
              <li id={darkMode ? 'darkItem' : 'lightItem'}>
                <MuiLink
                  href="/gainers-losers"
                  color="inherit"
                  underline="none"
                  sx={{ display: 'flex', alignItems: 'center' }}
                >
                  <WhatshotIcon sx={{ marginRight: theme.spacing(1) }} />
                  Gainers & Losers
                </MuiLink>
              </li>
              <li id={darkMode ? 'darkItem' : 'lightItem'}>
                <MuiLink
                  href="/most-viewed-tokens"
                  color="inherit"
                  underline="none"
                  sx={{ display: 'flex', alignItems: 'center' }}
                >
                  <VisibilityIcon sx={{ marginRight: theme.spacing(1) }} />
                  Most Viewed
                </MuiLink>
              </li>
            </ul>
          </StyledLink>
        </li>
      </ul>
    </>
  );
};

export default DropDownMenu;
