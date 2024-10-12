// Material
import {
    Box,
    Container,
    styled,
    Toolbar
} from '@mui/material';

// Components
import Header from 'src/components/Header';
import Footer from 'src/components/Footer';
import EditProfile from 'src/account/setting';
import ScrollToTop from 'src/components/ScrollToTop';

const OverviewWrapper = styled(Box)(
    ({ theme }) => `
        // overflow: hidden;
        flex: 1;
`
);

export default function Overview({data}) {

    return (
        <OverviewWrapper>
            <Toolbar id="back-to-top-anchor" />

            <Header />

            <Container maxWidth="sm">
                <EditProfile />
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

    ogp.canonical = 'https://xrpl.to/setting';
    ogp.title = 'Setting';
    ogp.url = 'https://xrpl.to/setting';
    ogp.imgUrl = 'https://xrpl.to/static/ogp.webp';
    ogp.desc = 'Customize your profile on our settings page: Edit your profile details, upload a logo and banner image, and update your display name and description with ease.';

    ret = {ogp};

    return {
        props: ret, // will be passed to the page component as props
        // Next.js will attempt to re-generate the page:
        // - When a request comes in
        // - At most once every 10 seconds
        // revalidate: 10, // In seconds
    }
}
