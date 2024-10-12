import React, { useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import {
  Avatar,
  Box,
  Divider,
  IconButton,
  Link,
  Stack,
  Tab,
  Tabs,
  Tooltip,
  Typography,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import ListIcon from '@mui/icons-material/List';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import NearbyErrorIcon from '@mui/icons-material/NearbyError';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';

import { AppContext } from 'src/AppContext';
import { getHashIcon } from 'src/utils/extra';
import SeeMoreTypography from 'src/components/SeeMoreTypography';
import TradeList from './TradeList';
import OfferList from './OfferList';
import TrustList from './TrustList';
import ActivityList from './ActivityList';

function TabPanel(props) {
  const { children, value, id, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== id}
      id={`simple-tabpanel-${id}`}
      aria-labelledby={`simple-tab-${id}`}
      {...other}
    >
      {value === id && (
        <Box sx={{}}>
          {children}
        </Box>
      )}
    </div>
  );
}

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

const tabValues = ['', 'trustlines', 'activity'];
const tabLabels = ['Offers', 'TrustLines', 'Activity'];

function getTabID(tab) {
  if (!tab) return 0;

  const idx = tabValues.indexOf(tab);
  if (idx < 0) return 0;
  return idx;
}

export default function Account({ profile, setProfile, tab }) {
  const BASE_URL = process.env.API_URL;
  const { accountProfile, openSnackbar, sync } = useContext(AppContext);
  const accountLogin = accountProfile?.account;

  const [tabID, setTabID] = useState(getTabID(tab));
  const [isFirstLoad, setFirstLoad] = useState(true);

  const {
    account,
    name,
    logo,
    banner,
    description,
    minterWallet
  } = profile;

  const logoImage = logo ? `https://s1.xrpl.to/profile/${logo}` : getHashIcon(account);

  useEffect(() => {
    if (!isFirstLoad && accountProfile && accountProfile.account) {
      setProfile(accountProfile);
      const url = `/account/${accountProfile.account}/${tabValues[tabID]}`;
      window.history.pushState({}, null, url);
    }
    setFirstLoad(false);
  }, [accountProfile]);

  const gotoTabView = () => {
    const anchor = document.querySelector('#back-to-top-tab-anchor');

    if (anchor) {
      anchor.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }
  };

  const handleChangeTab = (event, newID) => {
    let url = '';
    if (newID > 0) url = `/account/${account}/${tabValues[newID]}`;
    else url = `/account/${account}/`;
    window.history.pushState({}, null, url);
    setTabID(newID);
    gotoTabView();
  };

  return (
    <>
      <Box
        sx={{
          display: 'flex',
          gap: 3,
          alignItems: 'center',
          my: 2,
          mt: { md: -5, xs: -4 },
        }}
      >
        <Avatar
          variant={logo ? "circular" : "square"}
          sx={{
            width: { md: 90, xs: 50 },
            height: { md: 90, xs: 50 },
            backgroundColor: '#00000000',
          }}
        >
          <img src={logoImage}   alt={`${name} Avatar`} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          {accountLogin === account && (
            <Link href={`/setting`} underline='none'>
              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  opacity: 0,
                  zIndex: 1,
                }}
              >
                <EditIcon fontSize="large" />
              </Box>
              <div
                className="MuiImageBackdrop-root"
                style={{
                  position: 'absolute',
                  left: 0,
                  right: 0,
                  top: 0,
                  bottom: 0,
                  backgroundColor: '#000000',
                  opacity: 0,
                  transition: 'opacity 0.2s',
                }}
              />
            </Link>
          )}
        </Avatar>
        <Box position={'relative'}>
          <Typography variant='h3'>{name || account?.toString().slice(0, 5)}</Typography>
          <Box display='flex' alignItems={'center'}>
            <Typography style={{ wordWrap: "break-word" }} variant="d3">
              {account.slice(0, 4) + '...' + account.slice(-4)}
            </Typography>
            <CopyToClipboard text={account} onCopy={() => { openSnackbar("Copied!", "success") }}>
              <Tooltip title='Click to copy'>
                <IconButton>
                  <ContentCopyIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </CopyToClipboard>
            <Link
              color="inherit"
              target="_blank"
              href={`https://bithomp.com/explorer/${account}`}
              rel="noreferrer noopener nofollow"
            >
              <IconButton>
                <OpenInNewIcon />
              </IconButton>
            </Link>
          </Box>
        </Box>
      </Box>

      <SeeMoreTypography
        variant="d3"
        text={description}
      />

      <Box
        sx={{
          mt: 2,
          display: "flex",
          gap: 1,
          py: 1,
          overflow: "auto",
          width: "100%",
          "& > *": {
            scrollSnapAlign: "center",
          },
          "::-webkit-scrollbar": { display: "none" },
        }}
      >
        <Tabs
          value={tabID}
          onChange={handleChangeTab}
          aria-label="token-tabs"
          sx={{"& .MuiTabs-scroller": {overflow: "visible !important"}}}
        >
          {tabLabels.map((label, index) => (
            <Tab key={index} value={index} label={label} {...a11yProps(index)} />
          ))}
        </Tabs>
      </Box>
      <Box sx={{ my: 1 }}>
        {tabValues.map((tabValue, index) => (
          <TabPanel key={index} value={tabID} id={index}>
            <Stack sx={{ minHeight: '20vh' }}>
              {index === 0 && <OfferList account={account} />}
              {index === 1 && <TrustList account={account} />}
              {index === 2 && <ActivityList account={account} />}
            </Stack>
          </TabPanel>
        ))}
      </Box>
    </>
  );
}
