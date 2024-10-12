import {
  alpha,
  Box,
  Chip,
  Container,
  IconButton,
  Link,
  Snackbar,
  Stack,
  useMediaQuery,
  useTheme
} from '@mui/material';
import { styled } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import MenuIcon from '@mui/icons-material/Menu';
import StarOutlineIcon from '@mui/icons-material/StarOutline';
import TroubleshootIcon from '@mui/icons-material/Troubleshoot';
import { useTranslation } from 'react-i18next';
import { useState, useContext, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
// import sdk from "@crossmarkio/sdk";
import { AppContext } from 'src/AppContext';
import Logo from 'src/components/Logo';
import NavSearchBar from './NavSearchBar';
import SidebarDrawer from './SidebarDrawer';
import DropDownMenu from './DropDownMenu';
import WalletConnectModal from './WalletConnectModal';
import { selectProcess, updateProcess } from 'src/redux/transactionSlice';

const HeaderWrapper = styled(Box)(
  ({ theme }) => `
    width: 100%;
    display: flex;
    align-items: center;
    height: ${theme.spacing(10)};
    margin-bottom: ${theme.spacing(0)};
    border-radius: 0px;
    border-bottom: 1px solid ${alpha('#CBCCD2', 0.2)};
`
);

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

const MenuContainer = styled('div')({
  position: 'relative',
  display: 'inline-block' // Make sure this is an inline-block to properly wrap content
});

export default function Header(props) {
  const { t } = useTranslation(); // set translation const
  const theme = useTheme();
  const dispatch = useDispatch();
  const isProcessing = useSelector(selectProcess);
  const isDesktop = useMediaQuery(theme.breakpoints.up('lg'));
  const isTabletOrMobile = useMediaQuery(theme.breakpoints.down('lg'));
  const [fullSearch, setFullSearch] = useState(false);
  const [openDrawer, setOpenDrawer] = useState(false);
  const [isClosed, setClosed] = useState(false);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const {
    darkMode,
    setDarkMode,
  } = useContext(AppContext);

  const handleFullSearch = (e) => {
    setFullSearch(true);
  };

  const toggleDrawer = (isOpen = true) => {
    setOpenDrawer(isOpen);
  };

  const openSnackbar = (message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleSnackbarClose = () => {
    setSnackbarOpen(false);
  };

  // Dropdown menu state and functions
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  useEffect(() => {
    if (isProcessing === 1 && isClosed) {
      dispatch(updateProcess(3));
    }

    if (isClosed) {
      setClosed(false);
    }
  }, [isProcessing, isClosed])

  useEffect(() => {
    let isMounted = true;
    
    const initializeCrossmark = async () => {
      if (isDesktop && typeof window !== 'undefined') {
        try {
          // Dynamically import the SDK
          const { default: CrossmarkSDK } = await import('@crossmarkio/sdk');
          
          if (isMounted && CrossmarkSDK && typeof CrossmarkSDK.on === 'function') {
            const handleClose = () => {
              if (isMounted) {
                setClosed(true);
              }
            };

            CrossmarkSDK.on("close", handleClose);

            return () => {
              if (CrossmarkSDK && typeof CrossmarkSDK.off === 'function') {
                CrossmarkSDK.off("close", handleClose);
              }
            };
          }
        } catch (error) {
          console.error('Failed to load Crossmark SDK:', error);
        }
      }
    };

    initializeCrossmark();

    return () => {
      isMounted = false;
    };
  }, [isDesktop])

  return (
    <HeaderWrapper>
      <Container maxWidth={false}>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          flex={2}
          sx={{ pl: 0, pr: 0 }}
        >
          <Box
            id="logo-container-laptop"
            sx={{
              mr: 2,
              display: { xs: 'none', sm: 'flex' },
              alignItems: 'center'
            }}
          >
            <Logo alt="xrpl.to Logo" style={{ marginRight: 25 }} />

            {isDesktop && (
              <>
                <MenuContainer>
                  <DropDownMenu />
                </MenuContainer>
                <StyledLink
                  underline="none"
                  color={darkMode ? 'white' : 'black'}
                  sx={{
                    '&:hover': {
                      color: darkMode
                        ? '#22B14C !important'
                        : '#3366FF !important'
                    }
                  }}
                  href="/swap"
                >
                  {t('Swap')}
                </StyledLink>
                <StyledLink
                  underline="none"
                  color={darkMode ? 'white' : 'black'}
                  sx={{
                    '&:hover': {
                      color: darkMode
                        ? '#22B14C !important'
                        : '#3366FF !important'
                    }
                  }}
                  href="/buy-xrp"
                >
                  {t('Fiat')}
                </StyledLink>
              </>
            )}

            <WalletConnectModal />

          </Box>

          {fullSearch && (
            <NavSearchBar
              id="id_search_tokens"
              placeholder="Search XRPL Tokens"
              fullSearch={fullSearch}
              setFullSearch={setFullSearch}
            />

          )}

          {!fullSearch && (
            <Box
              id="logo-container-mobile"
              sx={{
                mr: 2,
                display: { xs: 'flex', sm: 'none' }
              }}
            >
              <Logo alt="xrpl.to Logo" />
            </Box>
          )}

          <Box
            sx={{
              flexGrow: 1,
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center'
            }}
          >
            {!fullSearch && isDesktop && (
              <Stack mr={2}>
                <NavSearchBar
                  id="id_search_tokens"
                  placeholder="Search XRPL Tokens"
                  fullSearch={fullSearch}
                  setFullSearch={setFullSearch}
                />

              </Stack>
            )}

            {!fullSearch && isTabletOrMobile && (
              <IconButton aria-label="search" onClick={handleFullSearch}>
                <SearchIcon />
              </IconButton>
            )}

            {!fullSearch && (
              <Stack
                direction="row"
                alignItems="center"
                spacing={0.5}
                sx={{ display: { xs: 'none', md: 'flex' }, mr: 0 }}
              >
                <Link
                  underline="none"
                  color="inherit"
                  href={`/watchlist`}
                  rel="noreferrer noopener nofollow"
                >
                  <Chip
                    variant={'outlined'}
                    icon={<StarOutlineIcon fontSize="small" />}
                    label={'Watchlist'}
                    onClick={() => { }}
                    sx={{
                      borderRadius: '8px'
                    }}
                  />
                </Link>

                <Chip
                  variant={'outlined'}
                  icon={<TroubleshootIcon fontSize="small" />}
                  label={'Portfolio'}
                  onClick={() => {
                    openSnackbar('Coming soon!', 'success');
                  }}
                  sx={{
                    borderRadius: '8px'
                  }}
                />

              </Stack>
            )}

            {isTabletOrMobile && !fullSearch && (
              <IconButton onClick={() => toggleDrawer(true)}>
                <MenuIcon />
              </IconButton>
            )}

            <SidebarDrawer toggleDrawer={toggleDrawer} isOpen={openDrawer} />
          </Box>
        </Box>
      </Container>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
        severity={snackbarSeverity}
      />
    </HeaderWrapper>
  );
}
