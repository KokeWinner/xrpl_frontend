import axios from 'axios';
import { performance } from 'perf_hooks';

const TradeToken = () => {};

export default TradeToken;

export async function getServerSideProps(ctx) {
    const BASE_URL = process.env.API_URL;

    let data = null;
    try {
        const md5 = ctx.params.md5;
        var t1 = performance.now();

        // https://api.xrpl.to/api/token/0413ca7cfc258dfaf698c02fe304e607
        const res = await axios.get(`${BASE_URL}/token/${md5}`);

        data = res.data;

        var t2 = performance.now();
        var dt = (t2 - t1).toFixed(2);

        console.log(`9. getServerSideProps(trade redirect) md5: ${md5} took: ${dt}ms`);
    } catch (e) {
        console.log(e);
    }
    let ret = {};
    if (data && data.token) {
        let ogp = {};
        const token = data.token;
        const {
            name,
            ext,
            md5,
            slug
        } = token;

        let user = token.user;
        if (!user) user = name;

        // https://xrpl.to/token/sologenic-solo/trade
        ogp.canonical = `https://xrpl.to/token/${slug}/trade`;
        ogp.title = `Trade ${name} Seamlessly on the XRP Ledger`;
        ogp.url = `https://xrpl.to/token/${slug}/trade`;
        // ogp.imgUrl = `https://xrpl.to/static/tokens/${md5}.${ext}`;
        ogp.imgUrl = `https://s1.xrpl.to/token/${md5}`;
        ogp.desc = `Effortlessly trade ${name} on the XRPL.to platform for a seamless trading experience.`;

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

