import { useState, useCallback } from 'react';
import {
    Box,
    Typography,
    Hidden,
    Container,
    Button,
    Grid,
    styled
} from '@mui/material';

import Head from 'next/head';
import RefreshTwoToneIcon from '@mui/icons-material/RefreshTwoTone';
import LoadingButton from '@mui/lab/LoadingButton';

const GridWrapper = styled(Grid) (
    ({ theme }) => `
        background: ${theme.colors.gradients.blue5};
    `
);

const MainContent = styled(Box)(
    () => `
        height: 100%;
        display: flex;
        flex: 1;
        overflow: auto;
        flex-direction: column;
        align-items: center;
        justify-content: center;
    `
);

const TypographyPrimary = styled(Typography)(
    ({ theme }) => `
        color: ${theme.colors.alpha.white[100]};
    `
);

const TypographySecondary = styled(Typography)(
    ({ theme }) => `
        color: ${theme.colors.alpha.white[70]};
    `
);

export default function Status500() {
    const [pending, setPending] = useState(false);
    
    const handleClick = useCallback(() => {
        setPending(true);
    }, []);

    return (
        <>
            <Head>
                <title>Status - 500</title>
            </Head>
            <MainContent>
                <Grid
                    container
                    sx={{ height: '100%' }}
                    alignItems="stretch"
                    spacing={0}
                >
                    <Grid
                      xs={12}
                      md={6}
                      alignItems="center"
                      display="flex"
                      justifyContent="center"
                      item
                    >
                        <Container maxWidth="sm">
                            <Box textAlign="center">
                            <img
                                alt="500"
                                height={260}
                                src="/static/status/500.svg"
                            />
                            <Typography variant="h2" sx={{ my: 2 }}>
                                There was an error, please try again later
                            </Typography>
                            <Typography
                                variant="h4"
                                color="text.secondary"
                                fontWeight="normal"
                                sx={{ mb: 4 }}
                            >
                                The server encountered an internal error and was not able to complete your request
                            </Typography>
                            <LoadingButton
                                onClick={handleClick}
                                loading={pending}
                                variant="outlined"
                                color="primary"
                                startIcon={<RefreshTwoToneIcon />}
                            >
                                Refresh view
                            </LoadingButton>
                            <Button href="/" variant="contained" sx={{ ml: 1 }}>
                                Go back
                            </Button>
                            </Box>
                        </Container>
                    </Grid>
                    <Hidden mdDown>
                        <GridWrapper
                            xs={12}
                            md={6}
                            alignItems="center"
                            display="flex"
                            justifyContent="center"
                            item
                        >
                            <Container maxWidth="sm">
                                <Box textAlign="center">
                                    <TypographyPrimary variant="h1" sx={{ my: 2 }}>
                                    XRPL Token Prices: Charts, Market Volume, and Activity Insights
                                    </TypographyPrimary>
                                    <TypographySecondary
                                        variant="h4"
                                        fontWeight="normal"
                                        sx={{ mb: 4 }}
                                    >
                                        Top XRPL DEX tokens prices and charts, listed by 24h volume. Access to current and historic data for XRP ecosystem. All XRPL tokens automatically listed.
                                    </TypographySecondary>
                                    <Button href="/" size="large" variant="contained">
                                        View
                                    </Button>
                                </Box>
                            </Container>
                        </GridWrapper>
                    </Hidden>
                </Grid>
            </MainContent>
        </>
    );
}
