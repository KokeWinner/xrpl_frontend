import axios from 'axios';
import { performance } from 'perf_hooks';
import { useState } from 'react';

// Material
import {
    Box,
    Container,
    styled,
    Toolbar
} from '@mui/material';

// Components
import Topbar from 'src/components/Topbar';
import Header from 'src/components/Header'
import Footer from 'src/components/Footer';
import ScrollToTop from 'src/components/ScrollToTop';

import RankingsTabs from 'src/Rankings';


// overflow: hidden;
const OverviewWrapper = styled(Box)(
    ({ theme }) => `
    overflow: hidden;
    flex: 1;
`
);

function Rankings({data}) {
    const [type, setType] = useState(data.type);
    
    /*const [token, setToken] = useState(data.token);
    const WSS_FEED_URL = `wss://api.xrpl.to/ws/token/${token.md5}`;

    const { sendJsonMessage, getWebSocket } = useWebSocket(WSS_FEED_URL, {
        onOpen: () => {},
        onClose: () => {},
        shouldReconnect: (closeEvent) => true,
        onMessage: (event) =>  processMessages(event),
        // reconnectAttempts: 10,
        // reconnectInterval: 3000,
    });

    const processMessages = (event) => {
        try {
            var t1 = Date.now();

            const json = JSON.parse(event.data);

            dispatch(update_metrics(json));

            setToken({...token, ...json.token});

            var t2 = Date.now();
            var dt = (t2 - t1).toFixed(2);

            // console.log(`${dt} ms`);
        } catch(err) {
            console.error(err);
        }
    };*/

    return (
        <OverviewWrapper>
            <Toolbar id="back-to-top-anchor" />
            <Topbar />
            <Header />

            <Container maxWidth="xl">
                <RankingsTabs tab={type} />
            </Container>

            <ScrollToTop />

            <Footer />

        </OverviewWrapper>
    );
}

export default Rankings;

export async function getServerSideProps(ctx) {
    const BASE_URL = process.env.API_URL;

    let type = null;
    let data = null;
    try {

        type = ctx.params.type;

        var t1 = performance.now();

        // https://api.xrpl.to/api/token/bitstamp-usd
        const res = await axios.get(`${BASE_URL}/banxa/currencies`);

        data = res.data;

        var t2 = performance.now();
        var dt = (t2 - t1).toFixed(2);

        console.log(`2. getServerSideProps Rankings: ${type} took: ${dt}ms`);
    } catch (e) {
        console.log(e);
    }
    let ret = {};
    if (type) {
		data.type = type;
		
        let ogp = {};
        /*const token = data.token;
        const {
            name,
            ext,
            md5,
            slug
        } = token;

        let user = token.user;
        if (!user) user = name;*/

        ogp.canonical = `https://xrpl.to/${type}`;
        ogp.title = `XRPL tokens rankings: ${type}`;
        ogp.url = `https://xrpl.to/${type}`;
        // ogp.imgUrl = `https://xrpl.to/static/tokens/${md5}.${ext}`;
        //ogp.imgUrl = `https://s1.xrpl.to/token/${md5}`;
        ogp.desc = `Access up-to-date XRPL ${type} rankings`;

        ret = {data, ogp};
        return {
            props: ret, // will be passed to the page component as props
        }
    } else {
        return {
            redirect: {
                permanent: false,
                destination: '/404'
            }
        }
    }
}

// This function gets called at build time
// export async function getStaticPaths() {
//     // Call an external API endpoint to get posts
//     const res = await fetch('https://.../posts')
//     const posts = await res.json()
  
//     // Get the paths we want to pre-render based on posts
//     const paths = posts.map((post) => ({
//       params: { id: post.id },
//     }))
  
//     // We'll pre-render only these paths at build time.
//     // { fallback: false } means other routes should 404.
//     return { paths, fallback: false }
// }
