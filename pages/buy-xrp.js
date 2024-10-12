import axios from 'axios'
import { performance } from 'perf_hooks';
import { useState, useEffect } from 'react';

// Material
import {
    styled,
    Box,
    Container,
    Grid
} from '@mui/material';

// Components
import Topbar from 'src/components/Topbar';
import Header from 'src/components/Header';
import Footer from 'src/components/Footer';

import BuyXRP from 'src/BuyXRP';

// const DynamicTokenList = dynamic(() => import('src/TokenList'));

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
    const fiats = data && data.fiats ? data.fiats : [];
    const coins = data && data.coins ? data.coins : [];

    return (
        <OverviewWrapper>
            <Topbar />
            <Header />
            
            <Container maxWidth="sm">
                <BuyXRP
                    fiats={fiats}
                    coins={coins}
                />
                <Grid
                    container
                    direction="row"
                    justifyContent="left"
                    alignItems="stretch"
                    spacing={3}
                >
                    <Grid item xs={12} md={12} lg={12} >
                        
                    </Grid>
                </Grid>
            </Container>

            <Footer />

        </OverviewWrapper>
    );
}

export default Overview;

// This function gets called at build time on server-side.
// It may be called again, on a serverless function, if
// revalidation is enabled and a new request comes in
export async function getStaticProps() {
    // https://api.xrpl.to/api/banxa/currencies
    const BASE_URL = process.env.API_URL;
    let data = null;
    try {
        var t1 = performance.now();

        const res = await axios.get(`${BASE_URL}/banxa/currencies`);

        data = res.data;

        var t2 = performance.now();
        var dt = (t2 - t1).toFixed(2);

        console.log(`2. getStaticProps fiats: ${data.fiats.length} took: ${dt}ms`);
    } catch (e) {
        console.log(e);
    }
    let ret = {};
    if (data) {
        let ogp = {};

        ogp.canonical = 'https://xrpl.to';
        ogp.title = 'Purchasing XRP with Fiat Made Easy, Powered by Banxa';
        ogp.url = 'https://xrpl.to/';
        ogp.imgUrl = 'https://xrpl.to/static/ogp.webp';
        ogp.desc = 'Effortlessly buy XRP using over 25 fiat currencies, including USD, GBP, CAD, EUR, and AUD, through Banxa seamless process.';

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
