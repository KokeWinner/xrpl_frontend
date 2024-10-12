import {
    Box,
    Typography,
    Container,
    Divider,
    IconButton,
    Tooltip,
    styled
} from '@mui/material';

import Logo from 'src/components/Logo';

import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';

const MainContent = styled(Box)(
    () => `
        height: 100%;
        display: flex;
        flex: 1;
        flex-direction: column;
`
);

const TopWrapper = styled(Box)(
    ({ theme }) => `
        display: flex;
        width: 100%;
        flex: 1;
        align-items: center;
        justify-content: center;
        padding: ${theme.spacing(6)};
`
);

export default function StatusMaintenance() {
    return (
        <>
            <MainContent>
                <TopWrapper>
                    <Container maxWidth="md">
                        <Logo />
                        <Box textAlign="center">
                            <Container maxWidth="xs">
                                <Typography variant="h2" sx={{ mt: 4, mb: 2 }}>
                                Site Temporarily Unavailable Due to Maintenance.
                                </Typography>
                                <Typography
                                    variant="h3"
                                    color="text.secondary"
                                    fontWeight="normal"
                                    sx={{ mb: 4 }}
                                >
                                    We Apologize for Any Inconvenience Caused.
                                </Typography>
                            </Container>
                            <img
                                alt="Maintenance"
                                height={250}
                                src="/static/status/maintenance.svg"
                            />
                        </Box>
                        <Divider sx={{ my: 4 }} />
                        <Box
                            display="flex"
                            alignItems="center"
                            justifyContent="space-between"
                        >
                            <Box>
                                <Typography component="span" variant="subtitle1">
                                    Be back soon. Follow us on social media.
                                </Typography>
                            </Box>
                            <Box>
                                <a href="https://www.facebook.com/xrpl.to">
                                    <Tooltip arrow placement="top" title="Facebook">
                                        <IconButton color="primary">
                                            <FacebookIcon />
                                        </IconButton>
                                    </Tooltip>
                                </a>
                                <a href="https://twitter.com/xrplto">
                                    <Tooltip arrow placement="top" title="Twitter">
                                        <IconButton color="primary">
                                            <TwitterIcon />
                                        </IconButton>
                                    </Tooltip>
                                </a>
                                <a href="https://www.instagram.com/xrpl.to/">
                                    <Tooltip arrow placement="top" title="Instagram">
                                        <IconButton color="primary">
                                            <InstagramIcon />
                                        </IconButton>
                                    </Tooltip>
                                </a>
                            </Box>
                        </Box>
                    </Container>
                </TopWrapper>
            </MainContent>
        </>
    );
}

// This function gets called at build time on server-side.
// It may be called again, on a serverless function, if
// revalidation is enabled and a new request comes in
export async function getStaticProps() {
    let ret = {};

    const ogp = {};
    ogp.canonical = 'https://xrpl.to';
    ogp.title = 'XRPL Token Prices, Charts, Market Volume, and Activity | XRPL.to';
    ogp.url = 'https://xrpl.to/';
    ogp.imgUrl = 'https://xrpl.to/static/ogp.webp';
    ogp.desc = 'Find top XRPL DEX token prices and charts, ranked by 24-hour trading volume. Get access to current and historical data for the XRP ecosystem. All XRPL tokens are automatically listed on XRPL.to.';

    ret = {ogp};

    return {
        props: ret, // will be passed to the page component as props
        // Next.js will attempt to re-generate the page:
        // - When a request comes in
        // - At most once every 10 seconds
        revalidate: 10, // In seconds
    }
}
