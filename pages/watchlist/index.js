import axios from 'axios'
import { performance } from 'perf_hooks';
import { useState, useEffect } from 'react';

// Material
import {
    Box,
    Container,
    Grid,
    styled,
    Toolbar
} from '@mui/material';

// Context
import { useContext } from 'react';
import { AppContext } from 'src/AppContext';

// Components
import Topbar from 'src/components/Topbar';
import Header from 'src/components/Header';
import Footer from 'src/components/Footer';
import ScrollToTop from 'src/components/ScrollToTop';

import TokenList from 'src/TokenList';
import SummaryWatchList from 'src/TokenList/SummaryWatchList';


// overflow: scroll;
// overflow: auto;
// overflow: hidden;
const OverviewWrapper = styled(Box)(
  ({ theme }) => `
    overflow: hidden;
    flex: 1;
`
);

function Overview({data}) {
    const [tokens, setTokens] = useState([]);

    const tMap = new Map();
    for (var t of tokens) {
        tMap.set(t.md5, t);
    }

    const { accountProfile, openSnackbar, setLoading } = useContext(AppContext);

    const account = accountProfile?.account;

    return (
        <OverviewWrapper>
            <Toolbar id="back-to-top-anchor" />
            <Topbar />
            <Header />
            
            <Container maxWidth="xl">
                <Grid
                    container
                    direction="row"
                    justifyContent="left"
                    alignItems="stretch"
                    spacing={3}
                >
                    <Grid item xs={12} md={12} lg={8} >
                        <SummaryWatchList />
                    </Grid>
                    <Grid item xs={12} md={12} lg={12} >
                        {account &&
                            <TokenList
                                showWatchList={true}
                                tags={data.tags}
                                tokens={tokens}
                                tMap={tMap}
                                setTokens={setTokens}
                            />
                        }
                    </Grid>
                </Grid>
            </Container>

            <ScrollToTop />

            <Footer />

        </OverviewWrapper>
    );
}

export default Overview;

const BASE_URL = process.env.API_URL;

// This function gets called at build time on server-side.
// It may be called again, on a serverless function, if
// revalidation is enabled and a new request comes in
export async function getStaticProps() {
    // https://api.xrpl.to/api/tags
    
    let data = null;
    try {
        var t1 = performance.now();

        const res = await axios.get(`${BASE_URL}/tags`);

        data = res.data;

        var t2 = performance.now();
        var dt = (t2 - t1).toFixed(2);

        console.log(`1. getStaticProps tags: ${data.tags.length} took: ${dt}ms`);
    } catch (e) {
        console.log(e);
    }
    let ret = {};
    if (data) {
        let ogp = {};

        ogp.canonical = 'https://xrpl.to';
        ogp.title = 'Create a Watchlist: Track Your Favorite XRPL Tokens with Ease';
        ogp.url = 'https://xrpl.to/';
        ogp.imgUrl = 'https://xrpl.to/static/ogp.webp';
        ogp.desc = 'Create a custom XRPL token watchlist: Choose from all XRP Ledger tokens, track the latest prices, and stay updated on popular tokens like SOLO, CORE, CSC, and xSPECTAR.';

        ret = {data, ogp};
    }

    return {
        props: ret, // will be passed to the page component as props
        // Next.js will attempt to re-generate the page:
        // - When a request comes in
        // - At most once every 10 seconds
        revalidate: 10, // In seconds
    }
}
