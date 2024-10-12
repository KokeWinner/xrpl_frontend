import axios from 'axios'
import { performance } from 'perf_hooks';
import { useState } from 'react';
import {
    Box,
    Container,
    Grid,
    styled,
    Toolbar,
    useMediaQuery
} from '@mui/material';
import Topbar from 'src/components/Topbar';
import Header from 'src/components/Header';
import Footer from 'src/components/Footer';
import TokenList from 'src/TokenList';
import ScrollToTop from 'src/components/ScrollToTop';
import AppMenu from 'src/components/AppMenu';
import Summary from 'src/TokenList/Summary';
import HowWeWork from 'src/TokenList/HowWeWork';

// import i18n (needs to be bundled ;))
import 'src/utils/i18n';

const OverviewWrapper = styled(Box)(
  ({ theme }) => `
    overflow: hidden;
    flex: 1;
`
);

function getInitialTokens(data) {
    if (data)
        return data.tokens;
    return [];
}

function Overview({ data }) {
    const [tokens, setTokens] = useState(() => getInitialTokens(data));
    const tMap = new Map();
    const isMobile = useMediaQuery('(max-width:600px)');
  
    for (var t of tokens) {
      tMap.set(t.md5, t);
    }
  
    return (
      <OverviewWrapper>
        <Toolbar id="back-to-top-anchor" />
        {!isMobile ? <Topbar /> : ""}
        <Header />
        { isMobile ? <Topbar /> : "" }
  
        <Container maxWidth="xl">
          <Grid
            container
            direction="row"
            justifyContent="left"
            alignItems="stretch"
            spacing={3}
          >
            <Grid item xs={12} md={12} lg={8}>
              <Summary />
            </Grid>
            <Grid item xs={12} md={12} lg={12}>
              {data && data.tags ? ( 
                <>
                  <TokenList
                    tags={data.tags}
                    tokens={tokens}
                    tMap={tMap}
                    setTokens={setTokens}
                  />
                  {/* <CryptoHeatmap
                    tokens={tokens}
                  /> */}
                </>
              ) : (
                <>
                
                
                
                </>
              )}
            </Grid>
            <Grid item xs={12} md={12} lg={12}>
              <HowWeWork />
            </Grid>
          </Grid>
        </Container>
  
        <ScrollToTop />
        { isMobile ? <AppMenu/> : "" }
        <Footer />
      </OverviewWrapper>
    );
  }
  
export default Overview;

export async function getStaticProps() {
    const BASE_URL = process.env.API_URL;
    let data = null;
    try {
        var t1 = performance.now();

        const res = await axios.get(`${BASE_URL}/tokens?start=1&limit=100&sortBy=vol24hxrp&sortType=desc&filter=&tags=yes&showNew=false&showSlug=false`);

        data = res.data;
        //console.log('Response from API:', data);

        const time = Date.now();
        for (var token of data.tokens) {
            token.bearbull = token.pro24h < 0 ? -1:1;
            token.time = time;
        }

        var t2 = performance.now();
        var dt = (t2 - t1).toFixed(2);

        console.log(`1. getStaticProps tokens: ${data.tokens.length} took: ${dt}ms`);
    } catch (e) {
        console.error('Error fetching data:', e);
    }
    let ret = {};
    if (data) {
        let ogp = {};

        ogp.canonical = 'https://xrpl.to';
        ogp.title = 'XRPL Token Prices: Charts, Market Volume, and Activity Insights';
        ogp.url = 'https://xrpl.to/';
        ogp.imgUrl = 'https://xrpl.to/static/ogp.webp';
        ogp.desc = 'Discover the latest XRPL DEX token prices and charts, ranked by 24-hour trading volume. Access real-time and historical data for the XRP ecosystem. Browse a comprehensive list of all XRPL tokens, updated automatically.';

        ret = {data, ogp};
    }

    return {
        props: ret,
        revalidate: 10, 
    }
}