import dynamic from 'next/dynamic';
import PropTypes from 'prop-types';
import { useRouter } from 'next/router';
import { useState, useEffect, useRef, useContext, useMemo, useCallback } from 'react';
import { motion } from 'framer-motion';

// Material
import {
  Box,
  Divider,
  Tab,
  Tabs,
  useTheme,
  useMediaQuery
} from '@mui/material';

// Components
import LinkCascade from './LinkCascade';
import Common from './common';
import { AppContext } from 'src/AppContext';

// Lazy load components
const Overview = dynamic(() => import('./overview'));
const Market = dynamic(() => import('./market'));
const Trade = dynamic(() => import('./trade'));
const Analysis = dynamic(() => import('./analysis'));
const History = dynamic(() => import('./history'));
const RichList = dynamic(() => import('./richlist'));
const Wallet = dynamic(() => import('./wallet'));

// ---------------------------------------------------

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
        <Box
          sx={{
            p: { xs: 0, md: 3 },
            pt: { xs: 3 }
          }}
        >
          {children}
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  id: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`
  };
}

const tabValues = [
  '',
  'markets',
  'trade',
  'onchain-analysis',
  'historical-data',
  'trustlines',
  'wallets'
];
const tabLabels = [
  'Overview',
  'Markets',
  'Trade',
  'Analysis',
  'Historical Data',
  'Trustlines',
  'Wallets'
];

function getTabID(tab) {
  if (!tab) return 0;
  const idx = tabValues.indexOf(tab);
  if (idx < 0) return 0;
  return idx;
}

export default function TokenDetail({ token, tab }) {
  const { darkMode } = useContext(AppContext);

  const [tabID, setTabID] = useState(getTabID(tab));
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const [isFixed, setIsFixed] = useState(false);
  const tabRef = useRef(null);

  const gotoTabView = useCallback((event) => {
    const anchor = (event.target.ownerDocument || document).querySelector(
      '#back-to-top-tab-anchor'
    );

    if (anchor) {
      anchor.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  }, []);

  const handleChangeTab = useCallback((event, newID) => {
    let url = '';
    if (newID > 0) url = `/token/${token.slug}/${tabValues[newID]}`;
    else url = `/token/${token.slug}/`;
    window.history.pushState({}, null, url);
    setTabID(newID);
    gotoTabView(event);
  }, [token.slug, gotoTabView]);

  useEffect(() => {
    const handleScroll = () => {
      if (tabRef.current) {
        const { offsetTop, clientHeight } = tabRef.current;
        const scrollTop = window.scrollY;
        setIsFixed(scrollTop > offsetTop && scrollTop < offsetTop + clientHeight);
      }
    };

    const throttledHandleScroll = throttle(handleScroll, 100);

    window.addEventListener('scroll', throttledHandleScroll);

    return () => {
      window.removeEventListener('scroll', throttledHandleScroll);
    };
  }, []);

  const tabStyle = useMemo(() => 
    isFixed ? {
      position: 'fixed',
      top: 0,
      zIndex: 1000,
      boxShadow: `5px 2px 5px ${!darkMode ? '#fff' : '#000'}`,
      backgroundColor: !darkMode ? '#fff' : '#000000',
      width: '100%'
    } : null
  , [isFixed, darkMode]);

  return (
    <>
      {!isMobile && (
        <LinkCascade token={token} tabID={tabID} tabLabels={tabLabels} />
      )}

      <Common token={token} />

      {!isMobile && (
        <Divider
          orientation="horizontal"
          sx={{ mt: 2, mb: 2 }}
          variant="middle"
          flexItem
        />
      )}

      <div id="back-to-top-tab-anchor" />

      <Box ref={tabRef}>
        <Tabs
          value={tabID}
          onChange={handleChangeTab}
          variant="scrollable"
          scrollButtons="auto"
          aria-label="token-tabs"
          style={tabStyle}
        >
          <Tab value={0} label={tabLabels[0]} {...a11yProps(0)} />
          <Tab value={1} label={tabLabels[1]} {...a11yProps(1)} />
          <Tab value={2} label={tabLabels[2]} {...a11yProps(2)} />
          <Tab value={3} label={tabLabels[3]} {...a11yProps(3)} />
          <Tab value={4} label={tabLabels[4]} {...a11yProps(4)} />
          <Tab value={5} label={tabLabels[5]} {...a11yProps(5)} />
          <Tab value={6} label={tabLabels[6]} {...a11yProps(6)} />
        </Tabs>
        <TabPanel value={tabID} id={0}>
          <Overview token={token} />
        </TabPanel>
        <TabPanel value={tabID} id={1}>
          <Market token={token} />
        </TabPanel>
        <TabPanel value={tabID} id={2}>
          <Trade token={token} />
        </TabPanel>
        <TabPanel value={tabID} id={3}>
          <Analysis token={token} />
        </TabPanel>
        <TabPanel value={tabID} id={4}>
          <History token={token} />
        </TabPanel>
        <TabPanel value={tabID} id={5}>
          <RichList token={token} />
        </TabPanel>
        <TabPanel value={tabID} id={6}>
          <Wallet />
        </TabPanel>
      </Box>
    </>
  );
}

// Utility function for throttling
function throttle(func, limit) {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }
}
