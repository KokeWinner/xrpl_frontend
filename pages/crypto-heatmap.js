import { useContext } from "react";
import { useSelector } from "react-redux";
import { AppContext } from 'src/AppContext';
import { selectMetrics } from 'src/redux/statusSlice';
import { Box, Container, Grid, styled, Toolbar, useMediaQuery } from "@mui/material";
import CryptoHeatmap from "src/components/CryptoHeatmap";
import Topbar from 'src/components/Topbar';
import Header from 'src/components/Header';
import Footer from 'src/components/Footer';
import Summary from 'src/TokenList/Summary';

const OverviewWrapper = styled(Box)(
    ({ theme }) => `
      overflow: hidden;
      flex: 1;
  `
);

const CryptoHeatmapPage = () => {

    const isMobile = useMediaQuery('(max-width:600px)');
    const { activeFiatCurrency } = useContext(AppContext);
    const metrics = useSelector(selectMetrics);
    const exchRate = metrics[activeFiatCurrency];

    return (
        <OverviewWrapper>
            <Toolbar id="back-to-top-anchor" />
            {!isMobile ? <Topbar /> : ""}
            <Header />
            {isMobile ? <Topbar /> : ""}

            <Container maxWidth="xl">
                <Grid
                    container
                    direction="row"
                    justifyContent="left"
                    alignItems="stretch"
                    spacing={3}
                >
                    <Grid item xs={12} md={12} lg={8}>
                        <Summary />
                    </Grid>
                    <Grid item xs={12} md={12} lg={12}>
                        <CryptoHeatmap exchRate={exchRate} />
                    </Grid>
                </Grid>
            </Container>
            <Footer/>
        </OverviewWrapper>
    )

}

export default CryptoHeatmapPage;