
import { Box, styled, Stack, Toolbar, Container, useTheme } from "@mui/material";
import Topbar from 'src/components/Topbar';
import Header from 'src/components/Header';
import Footer from 'src/components/Footer';
import ScrollToTop from 'src/components/ScrollToTop';
import Portfolio from "src/portfolio";
import { isValidClassicAddress } from 'ripple-address-codec';

const OverviewWrapper = styled(Box)(
    ({ theme }) => `
        // overflow: hidden;
        flex: 1;
    `
);

const OverView = ({ account, limit, collection, type }) => {

    return (
        <OverviewWrapper>
            <Toolbar id="back-to-top-anchor" />
            <Topbar />
            <Header />
            <Container maxWidth="xl">
                <Stack
                    direction="row"
                    justifyContent="center"
                    // sx={{
                    //     mt: {xs: 4, sm: -10}
                    // }}
                    style={{
                        height: '100%',
                        minHeight: '100vh'
                    }}
                >
                    <Portfolio account={account} limit={limit} collection={collection} type={type} />
                </Stack>
            </Container>

            <ScrollToTop />
            <Footer />

        </OverviewWrapper>
    )
}

export default OverView;

export function getServerSideProps(ctx) {

    try {

        let data = {};
        const params = ctx.params.acct;
        const account = params[0];
        const tab = params[1];

        const isValid = isValidClassicAddress(account);
        data.account = account;
        if (tab) data.tab = tab;

        if (tab?.includes('collection')) {
            data.collection = params[2];
            data.type = tab.replace('collection', '').toLowerCase();
        }

        data.limit = 32;
        if (isValid) {
            return {
                props: data
            }
        } else {
            return {
                redirect: {
                    destination: "/404",
                    permanent: false
                }
            }
        }

    } catch (err) {
        console.log(err);
        return {
            redirect: {
                destination: "/404",
                permanent: false
            }
        }
    }

}