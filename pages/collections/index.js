// Material
import {
    styled,
    Box,
    Container,
    Toolbar
} from '@mui/material';

// Components
import Topbar from 'src/components/Topbar';
import Header from 'src/components/Header';
import Footer from 'src/components/Footer';
import AllCollections from 'src/collection/AllCollections';
import ScrollToTop from 'src/components/ScrollToTop';

// overflow: scroll;
// overflow: auto;
// overflow: hidden;

const OverviewWrapper = styled(Box)(
    ({ theme }) => `
        // overflow: hidden;
        flex: 1;
`
);

export default function Overview() {

    return (
        <OverviewWrapper>
            <Toolbar id="back-to-top-anchor" />
            <Topbar />
            <Header />

            <Container maxWidth="xl">
                <AllCollections />
            </Container>

            <ScrollToTop />

            <Footer />

        </OverviewWrapper>
    );
}

// This function gets called at build time on server-side.
// It may be called again, on a serverless function, if
// revalidation is enabled and a new request comes in
export async function getStaticProps() {
    let ret = {};

    const ogp = {};
    ogp.canonical = 'https://xrpnft.com/collections';
    ogp.title = 'Collections';
    ogp.url = 'https://xrpnft.com/collections';
    ogp.imgUrl = 'https://xrpnft.com/static/ogp.png';
    ogp.desc = 'XRPNFT a community-centered marketplace for NFTs and digital collectibles on the XRP Ledger. Trade Non-Fungible Tokens Using XRP and earn rewards.';

    ret = {ogp};

    return {
        props: ret, // will be passed to the page component as props
        // Next.js will attempt to re-generate the page:
        // - When a request comes in
        // - At most once every 10 seconds
        // revalidate: 10, // In seconds
    }
}
