import Head from 'next/head';
import PropTypes from 'prop-types';
import { useState, useEffect, useRef, useContext } from 'react';
import Accordion from '@mui/material/Accordion';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

// Material
import {
  Box,
  Divider,
  Tab,
  Typography,
  Tabs,
  useTheme,
  useMediaQuery
} from '@mui/material';

// Components
/*import LinkCascade from './LinkCascade';
import Common from './common';
import Overview from './overview';
import Market from './market';
import Trade from './trade';
import Analysis from './analysis';
import History from './history';
import RichList from './richlist';
import Wallet from './wallet';*/
import TokenList from './TokenList';
import GainersLosersTokenList from './GainersLosersTokenList';
import { AppContext } from 'src/AppContext';

// const DynamicOverview = dynamic(() => import('./overview'));
// const DynamicMarket = dynamic(() => import('./market'));
// const DynamicTrade = dynamic(() => import('./trade'));
// const DynamicHistory = dynamic(() => import('./history'));
// const DynamicRichList = dynamic(() => import('./richlist'));
// const DynamicWallet = dynamic(() => import('./wallet'));

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
  'best-tokens',//token-ratings
  'trending-tokens',
  'gainers-losers',
  'most-viewed-tokens',
  'new',
];
const tabLabels = [
  'Spotlight',
  'Trending',
  'Gainers & Losers',
  'Most Viewed',
  'Recently Added',
];

function getTabID(tab) {
  if (!tab) return 0;
  const idx = tabValues.indexOf(tab);
  if (idx < 0) return 0;
  return idx;
}

export default function RankingsTabs({ tab }) {

  const { darkMode } = useContext(AppContext);

  const [tabID, setTabID] = useState(getTabID(tab));
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));


  const ogpTitle = `XRPL Tokens - ${tabLabels[tabID]}`;
  const ogpDescription = `Explore the ${tabLabels[tabID]} on the XRP Ledger.`;
  const ogpImage = `https://xrpl.to/static/ogp.webp`; // URL of the image for the current tab


  const [isFixed, setIsFixed] = useState(false);
  const tabRef = useRef(null);

  const gotoTabView = (event) => {
    const anchor = (event.target.ownerDocument || document).querySelector(
      '#back-to-top-tab-anchor'
    );

    if (anchor) {
      anchor.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  const handleChangeTab = (event, newID) => {
    let url = '';
    if (newID > 0) url = `/${tabValues[newID]}`;
    else url = `/${tabValues[0]}`;
    window.history.pushState({}, null, url);
    setTabID(newID);
    gotoTabView(event);
  };

  useEffect(() => {
    const handleScroll = () => {
      const tableOffsetTop = tabRef?.current?.offsetTop;
      const tableHeight = tabRef?.current?.clientHeight;
      const scrollTop = window.scrollY;
      const anchorTop = tableOffsetTop;
      const anchorBottom = tableOffsetTop + tableHeight;

      if (scrollTop > anchorTop && scrollTop < anchorBottom) {
        setIsFixed(true);
      } else {
        setIsFixed(false);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  return (
    <>
      {/*!isMobile && (
        <LinkCascade token={token} tabID={tabID} tabLabels={tabLabels} />
      )*/}

      {/*<Common token={token} />*/}

      {tabID === 0 && (
        <>
          <Typography variant="h1" sx={{ mt: { xs: 4, md: 4 }, mb: 3 }}>The Best XRPL Tokens Based On The Latest Data</Typography>
          <Typography variant="subtitle1" color="#919EAB" sx={{ mt: { xs: 4, md: 0 }, mb: 3 }}>Our list for XRP Ledger tokens are created using the latest XRPL data, focusing directly on prices and on-chain metrics.</Typography>
        </>
      )}


      {tabID === 1 && (
        <>
          <Typography variant="h1" sx={{ mt: { xs: 4, md: 4 }, mb: 3 }}>What Are The Trending XRPL Tokens</Typography>
          <Typography variant="subtitle1" color="#919EAB" sx={{ mt: { xs: 4, md: 0 }, mb: 3 }}>Here's a compilation of the currently trending XRP Ledger Tokens that are being frequently searched for on xrpl.to.</Typography>
        </>
      )}

      {tabID === 2 && (
        <>
          <Typography variant="h1" sx={{ mt: { xs: 4, md: 4 }, mb: 3 }}>Top XRPL Token Gainers And Losers Today</Typography>
          <Typography variant="subtitle1" color="#919EAB" sx={{ mt: { xs: 4, md: 0 }, mb: 3 }}>Which tokens on the XRP Ledger have experienced the largest gains or declines in the past 24 hours?</Typography>
        </>
      )}

      {tabID === 3 && (
        <>
          <Typography variant="h1" sx={{ mt: { xs: 4, md: 4 }, mb: 3 }}>What Are The Most Viewed Tokens On xrpl.to?</Typography>
          <Typography variant="subtitle1" color="#919EAB" sx={{ mt: { xs: 4, md: 0 }, mb: 3 }}>Find out which tokens are currently the most viewed by visitors on xrpl.to.</Typography>
        </>
      )}


      {tabID === 4 && (
        <>
          <Typography variant="h1" sx={{ mt: { xs: 4, md: 4 }, mb: 3 }}>New XRPL Tokens</Typography>
          <Typography variant="subtitle1" color="#919EAB" sx={{ mt: { xs: 4, md: 0 }, mb: 3 }}>Check out the new tokens added to the XRPL DEX in the last 7 days.</Typography>
        </>
      )}

      {!isMobile && (
        <Divider
          orientation="horizontal"
          sx={{ mt: 2, mb: 2, background: 'inherit' }}
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
          style={
            isFixed
              ? {
                position: 'fixed',
                top: 0,
                zIndex: 1000,
                boxShadow: `5px 2px 5px ${!darkMode ? '#fff' : '#000'}`,
                backgroundColor: !darkMode ? '#fff' : '#000000',
                width: '100%'
              }
              : null
          }
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
          <TokenList sortBy='assessmentScore' />
        </TabPanel>
        {tabID === 0 && (
          <>
            <Typography variant="h2" sx={{ mt: { xs: 4, md: 4 }, mb: 3 }}>Frequently asked questions (FAQs)</Typography>

            <Accordion>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
              >
                <Typography variant="h3">### What is the most popular token right now?</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="subtitle1" color="#919EAB" >
                  The XRPL Tokens ecosystem is expansive and constantly evolving. The most renowned token is the original on the XRP Ledger, a trailblazer in digital currencies. It was the first to introduce a Decentralized Exchange (DEX) and has consistently led in innovation. Yet, in this rapidly changing industry, popularity is not always enduring, and it's vital to stay updated with new trends and technologies.
                  While this token continues to be the most recognized and utilized, other tokens are also gaining momentum. This includes a group of innovative tokens and ecosystem developers, celebrated for their creative concepts.
                  Nonetheless, popularity should not be the only criterion when considering engagement with a token. Understanding its fundamental principles, applications, and growth potential is essential. Always prioritize comprehensive research before making any investment choices.
                </Typography>
              </AccordionDetails>
            </Accordion>
            <Accordion>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel2a-content"
                id="panel2a-header"
              >
                <Typography variant="h3">### Which are the top tokens to watch?</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="subtitle1" color="#919EAB" >
                  In the ever-evolving landscape of XRP Ledger tokens, a few have garnered significant interest from both enthusiasts and investors. One such token stands out for its rapid transaction speeds and scalability, commonly employed in the banking sector and boasting collaborations with several top tech firms.
                  Another token to keep an eye on aims to offer a decentralized environment for developing and executing smart contracts. Its novel approach to addressing the scalability challenges faced by many blockchain platforms has been gaining momentum.
                  Furthermore, there is a token gaining popularity for its emphasis on being an innovator in traditional finance. This token employs an ecosystem of multiple applications, offering a degree of interoperability between traditional assets and currencies. As with any investment, conducting personal research is crucial before engaging with these tokens.
                </Typography>

              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel2a-content"
                id="panel2a-header"
              >
                <Typography variant="h3">### Which tokens have the most potential?</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="subtitle1" color="#919EAB" >
                  Selecting tokens with high potential in the crowded XRPL market can be daunting. Nonetheless, a few tokens have distinguished themselves with their innovative features and technology.
                  One notable token offers a platform for building the internet of value. Celebrated for its scalability and adaptability, it has become a top choice among developers.
                  Another promising token focuses on decentralized stock trading. This token is drawing attention for its ambitious aim and the cutting-edge technology deployed to realize this goal.
                  Additionally, there's a token gaining prominence for its emphasis on interoperability. It seeks to facilitate communication between different blockchain networks, a capability that could be transformative for the industry. As always, thorough personal research is essential before investing in any token.
                </Typography>
              </AccordionDetails>
            </Accordion>


            <Accordion>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel2a-content"
                id="panel2a-header"
              >
                <Typography variant="h3">### What is a good token to buy?</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="subtitle1" color="#919EAB" >
                  When deciding which token to purchase, consider your investment objectives, risk tolerance, and familiarity with the token market. A few tokens on the XRPL have shown consistent potential.
                  One such token, the largest by market cap, is broadly recognized and has a solid track record, making it a popular choice for both beginners and seasoned investors.
                  Another notable token supports the creation of decentralized applications. Its cutting-edge technology and robust developer community have earned it acclaim.
                  Additionally, a token focused on the metaverse has been attracting interest. This token stands out for its unique multi-chain metaverse built on Unreal Engine V. Remember, it's crucial to do your own research before investing in any token.
                </Typography>
              </AccordionDetails>
            </Accordion>

          </>
        )}
        <TabPanel value={tabID} id={1}>
          <TokenList sortBy='trendingScore' />
        </TabPanel>
        {tabID === 1 && (
          <>
            <Typography variant="h2" sx={{ mt: { xs: 4, md: 4 }, mb: 3 }}>Frequently asked questions (FAQs)</Typography>
            <Accordion>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
              >
                <Typography variant="h3">### What are the trending tokens to watch out for?</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="subtitle1" color="#919EAB" >
                  The XRP Ledger token landscape is constantly evolving, making it crucial to keep abreast of the latest trends and changes. At the same time, it's vital to undertake in-depth research and analysis prior to making any investment decisions.
                </Typography>
              </AccordionDetails>
            </Accordion>
            <Accordion>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel2a-content"
                id="panel2a-header"
              >
                <Typography variant="h3">### Which trending tokens are making waves in the market?</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="subtitle1" color="#919EAB" >
                  Many tokens on the XRP Ledger are attracting interest for their distinctive attributes and growth prospects. Understanding the technology underpinning these tokens and their possible applications is essential.
                </Typography>
              </AccordionDetails>
            </Accordion>


            <Accordion>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
              >
                <Typography variant="h3">### What is the most searched token today and why?</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="subtitle1" color="#919EAB" >
                  The most popular XRP Ledger tokens can change daily, influenced by factors like social media trends, market dynamics, news developments, and investor mood. It's important to remember that a token's popularity isn't always a reliable indicator of its profitability or stability.
                </Typography>
              </AccordionDetails>
            </Accordion>
            <Accordion>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
              >
                <Typography variant="h3">### What's trending right now in the world of the XRPL?</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="subtitle1" color="#919EAB" >
                  The XRP Ledger is gaining traction across multiple industries, ranging from finance to the realm of monkey-themed NFTs. This trend demonstrates the increasing adoption of the XRP Ledger and its potential to revolutionize conventional business practices.
                </Typography>
              </AccordionDetails>
            </Accordion>
          </>
        )}
        <TabPanel value={tabID} id={2}>
          <GainersLosersTokenList />
        </TabPanel>
        {tabID === 2 && (
          <>
            <Typography variant="h2" sx={{ mt: { xs: 4, md: 4 }, mb: 3 }}>Frequently asked questions (FAQs)</Typography>

            <Accordion>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
              >
                <Typography variant="h3">### What are the top XRPL token movers today?</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="subtitle1" color="#919EAB" >
                  Today's standout tokens on the XRP Ledger DEX are those that have shown notable price fluctuations over a certain timeframe. These shifts may result from a range of factors, including endorsements by social media influencers, prevailing market trends, investor attitudes, technological progress, or updates in regulations. It's essential to be aware that the token market is characterized by high volatility, with prices capable of quick changes. As such, keeping informed about recent market developments and engaging in extensive research is vital prior to making investment choices.
                </Typography>
              </AccordionDetails>
            </Accordion>
            <Accordion>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel2a-content"
                id="panel2a-header"
              >
                <Typography variant="h3">### Who are the top XRPL token gainers today?</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="subtitle1" color="#919EAB" >
                  Today's leading token gainers in the XRP Ledger DEX are those that have experienced the largest percentage uptick in price over the past 24 hours. This upward movement can stem from several influences, such as encouraging news about the token, promotions by social media influencers, a surge in investor interest, or beneficial market trends. Nonetheless, it's crucial to recognize the high volatility of many of these tokens and understand that previous performance doesn't necessarily predict future outcomes, with prices capable of rapid shifts. Hence, conducting personal research and taking into account various aspects before investing is always advisable.
                </Typography>
              </AccordionDetails>
            </Accordion>
            <Accordion>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel2a-content"
                id="panel2a-header"
              >
                <Typography variant="h3">### Which is the best performing XRPL token today?</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="subtitle1" color="#919EAB" >
                  Today's top-performing XRP Ledger token is distinguished by the greatest percentage rise in its value over a specific timeframe. Its success can be attributed to various elements, such as endorsements by social media influencers, prevailing market attitudes, technological advancements, and broad economic trends. Nevertheless, one must bear in mind the extreme volatility of the token market, where prices can fluctuate swiftly. Therefore, keeping abreast of the latest market movements and engaging in comprehensive research is essential before making any investment decisions.
                </Typography>
              </AccordionDetails>
            </Accordion>
            <Accordion>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel2a-content"
                id="panel2a-header"
              >
                <Typography variant="h3">### Who are the top losers today in the XRPL token market?</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="subtitle1" color="#919EAB" >
                  Today's most notable decliners in the XRP Ledger token market are those that have witnessed the steepest percentage drop in price over the past day. Such downturns can result from diverse causes like adverse news, waning investor enthusiasm, or challenging market dynamics. Nonetheless, it's crucial to acknowledge the inherent volatility of the XRPL token market, where prices can rapidly recover. Consequently, it's advisable to conduct thorough research and weigh various considerations before proceeding with any investment choices.
                </Typography>
              </AccordionDetails>
            </Accordion>
          </>
        )}
        <TabPanel value={tabID} id={3}>
          <TokenList sortBy='nginxScore' />
        </TabPanel>
        {tabID === 3 && (
          <>
            <Typography variant="h2" sx={{ mt: { xs: 4, md: 4 }, mb: 3 }}>Frequently asked questions (FAQs)</Typography>
            <Accordion>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
              >
                <Typography variant="h3">### What is the most popular XRPL token?</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="subtitle1" color="#919EAB" >
                  The XRP Ledger is gaining traction across multiple industries, ranging from finance to the realm of monkey-themed NFTs. This trend demonstrates the increasing adoption of the XRP Ledger and its potential to revolutionize conventional business practices.
                </Typography>
              </AccordionDetails>
            </Accordion>
            <Accordion>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel2a-content"
                id="panel2a-header"
              >
                <Typography variant="h3">### Which XRPL tokens are the most viewed on xrpl.to?</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="subtitle1" color="#919EAB" >
                  xrpl.to is a platform offering real-time information on trading volumes, prices, and market capitalizations of various tokens on the XRP Ledger. The tokens that attract the most views on this platform can shift, influenced by prevailing market trends and investor interest. Typically, these tokens experience substantial trading volumes and notable price fluctuations. However, it's important to understand that a token's high visibility doesn't automatically signify it as an optimal investment choice; it merely indicates that it's garnering significant attention at the moment.
                </Typography>
              </AccordionDetails>
            </Accordion>
            <Accordion>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel2a-content"
                id="panel2a-header"
              >
                <Typography variant="h3">### What are the most popular XRPL tokens right now?</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="subtitle1" color="#919EAB" >
                  In the token market, the popularity of tokens can shift quickly due to influences like market trends, technological developments, and regulatory updates. Currently, the most popular tokens are usually those with large market capitalizations and significant trading volumes. These tokens often enjoy robust community backing and broad acceptance for transactions. Nevertheless, it's crucial to note that a token's popularity doesn't necessarily assure its profitability or stability in the market.
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel2a-content"
                id="panel2a-header"
              >
                <Typography variant="h3">### What are the top searched XRPL tokens?</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="subtitle1" color="#919EAB" >
                  The most frequently searched tokens on the XRP Ledger typically reflect current market trends. These might include newly released tokens, those undergoing notable price changes, or ones announcing significant developments. The search popularity of these tokens can offer a glimpse into the current interests of traders and investors. However, it's crucial to understand that a high search volume doesn't automatically suggest a sound investment. Thorough research is always essential prior to making any investment choices.
                </Typography>
              </AccordionDetails>
            </Accordion>
          </>
        )}
        <TabPanel value={tabID} id={4}>
          <TokenList sortBy='dateon' />
        </TabPanel>

        {tabID === 4 && (
          <>
            <Typography variant="h2" sx={{ mt: { xs: 4, md: 4 }, mb: 3 }}>Frequently asked questions (FAQs)</Typography>
            <Accordion>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel1a-content"
                id="panel1a-header"
              >
                <Typography variant="h3">### What are the new XRPL token listings today?</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="subtitle1" color="#919EAB" >
                  The token landscape within the XRP Ledger is dynamic, frequently enriched by the introduction of new tokens. These additions present diverse possibilities for those engaged in the XRPL arena. However, it's vital to recognize that these new entries, while intriguing, carry specific risks. Like any investment, conducting comprehensive research and grasping the fundamentals of the token's underlying project is essential before committing. Additionally, the value of tokens is subject to high volatility, making it important to brace for potential major price swings.
                </Typography>
              </AccordionDetails>
            </Accordion>
            <Accordion>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel2a-content"
                id="panel2a-header"
              >
                <Typography variant="h3">### What are the new tokens to watch out for?</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="subtitle1" color="#919EAB">
                  The XRP Ledger is continuously seeing the arrival of new tokens. These vary from projects introducing groundbreaking technologies to ones targeting specific challenges in various sectors. Monitoring these new tokens is advisable, as they might present intriguing opportunities. Nonetheless, like any investment, it's vital to conduct your own research and comprehend the project associated with the token before deciding. It's also important to remember that token values can be extremely volatile, necessitating preparedness for potential substantial price changes.
                </Typography>
              </AccordionDetails>
            </Accordion>

            <Accordion>
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                aria-controls="panel2a-content"
                id="panel2a-header"
              >
                <Typography variant="h3">### Which new token should I consider investing in?</Typography>
              </AccordionSummary>
              <AccordionDetails>
                <Typography variant="subtitle1" color="#919EAB" >
                  Regularly, new tokens are added to the XRP Ledger, each offering distinct characteristics and potential advantages. However, it's essential to be aware that investing in any token, whether new or established, carries inherent risks. Token values can fluctuate greatly, and there's also the possibility that the project associated with a token might not be successful. Thus, conducting your own research to fully understand the project behind a token is critical before investing. Additionally, it's wise to align your token investments with your personal risk tolerance and investment objectives.
                </Typography>
              </AccordionDetails>
            </Accordion>
          </>
        )}
        {/*<TabPanel value={tabID} id={5}>
          <RichList token={token} />
        </TabPanel>
        <TabPanel value={tabID} id={6}>
          <Wallet />
        </TabPanel>*/}
      </Box>
      <Head>
        <title>{ogpTitle}</title>
        <meta property="og:title" content={ogpTitle} />
        <meta property="og:description" content={ogpDescription} />
        <meta property="og:image" content={ogpImage} />
        <meta property="og:type" content="website" />
        {/* Add other OGP tags as needed */}
      </Head>
    </>
  );
}
