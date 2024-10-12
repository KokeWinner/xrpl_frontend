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

// Components
import Topbar from 'src/components/Topbar';
import Header from 'src/components/Header';
import Footer from 'src/components/Footer';
import ScrollToTop from 'src/components/ScrollToTop';

import TokenList from 'src/TokenList';
import SummaryTag from 'src/TokenList/SummaryTag';


// overflow: scroll;
// overflow: auto;
// overflow: hidden;
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

function Overview({data}) {
    const [tokens, setTokens] = useState(() => getInitialTokens(data));

    const tMap = new Map();
    for (var t of tokens) {
        tMap.set(t.md5, t);
    }

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
                        <SummaryTag tagName={data.tagName}/>
                    </Grid>
                    <Grid item xs={12} md={12} lg={12} >
                        <TokenList
                            tag={data.tag}
                            tagName={data.tagName}
                            tags={data.tags}
                            tokens={tokens}
                            tMap={tMap}
                            setTokens={setTokens}
                        />
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

export async function getServerSideProps(ctx) {
    // https://api.xrpl.to/api/tokens?tag=collectables-and-nfts&start=0&limit=20&sortBy=vol24hxrp&sortType=desc&filter=
    let data = null;
    try {
        const tag = ctx.params.tag;

        var t1 = performance.now();

        const res = await axios.get(`${BASE_URL}/tokens?tag=${tag}&start=0&limit=100&sortBy=vol24hxrp&sortType=desc&filter=&tags=yes`);

        data = res.data;

        data.tag = tag;

        const time = Date.now();
        for (var token of data.tokens) {
            token.bearbull = token.pro24h < 0 ? -1:1;
            token.time = time;
        }

        var t2 = performance.now();
        var dt = (t2 - t1).toFixed(2);

        console.log(`5. getStaticProps tokensbytag: ${data.tokens.length} took: ${dt}ms`);
    } catch (e) {
        console.log(e);
    }
    let ret = {};
    if (data) {
        let ogp = {};

        ogp.canonical = 'https://xrpl.to';
        ogp.title = `Discover the Most Traded ${data.tagName} XRPL Tokens by Volume`;
        ogp.url = 'https://xrpl.to/';
        ogp.imgUrl = 'https://xrpl.to/static/ogp.webp';
        ogp.desc = `Access today's ${data.tagName} token prices ranked by volume, featuring 24-hour price changes, trading volume, and much more for an insightful overview.`;

        ret = {data, ogp};
    }

    return {
        props: ret, // will be passed to the page component as props
    }
}

// export async function getServerSideProps(ctx) {
//     // https://api.xrpl.to/api/tokens?start=0&limit=20&sortBy=vol24hxrp&sortType=desc&filter=&showNew=false&showSlug=false
//     let data = null;
//     try {
//         var t1 = performance.now();

//         const res = await axios.get(`${BASE_URL}/tokens?start=0&limit=100&sortBy=vol24hxrp&sortType=desc&filter=&showNew=false&showSlug=false`);

//         data = res.data;

//         var t2 = performance.now();
//         var dt = (t2 - t1).toFixed(2);

//         console.log(`1. getServerSideProps tokens: ${data.tokens.length} took: ${dt}ms`);
//     } catch (e) {
//         console.log(e);
//     }
//     let ret = {};
//     if (data) {
//         let ogp = {};

//         ogp.title = 'XRPL Token Prices, Charts, Market Volume And Activity';
//         ogp.url = 'https://xrpl.to/';
//         ogp.imgUrl = 'https://xrpl.to/static/ogp.webp';
//         ogp.desc = 'Top XRPL DEX tokens prices and charts, listed by 24h volume. Access to current and historic data for XRP ecosystem. All XRPL tokens automatically listed.';

//         ret = {data, ogp};
//     }

//     return {
//         props: ret, // will be passed to the page component as props
//     }
// }
