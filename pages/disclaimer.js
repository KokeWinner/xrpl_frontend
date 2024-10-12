import React from 'react';
import {
  Box,
  Container,
  Grid,
  Toolbar,
  Typography,
} from '@mui/material';
import axios from 'axios';
import { performance } from 'perf_hooks';
import Topbar from 'src/components/Topbar';
import Header from 'src/components/Header';
import Footer from 'src/components/Footer';

function DisclaimerPage() {
  return (
    <Box>
      <Toolbar id="back-to-top-anchor" />
      <Topbar />
      <Header />

      <Container maxWidth="xl">
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h1" sx={{ my: 4 }}>
              Disclaimer
            </Typography>

            <Box sx={{ mb: 4 }}>
              <Typography variant="body1">
                <Typography variant="h2" sx={{ my: 4 }}>
                  No Investment Advice
                </Typography>
              </Typography>
              <Typography variant="body1">
                The information provided on xrpl.to does not constitute
                investment advice, financial advice, trading advice, or any
                other form of advice, and you should not consider any of the
                website's content as such. Xrpl.to does not recommend that you
                buy, sell, or hold any cryptocurrency. Please conduct your own
                due diligence and consult with a financial advisor before making
                any investment decisions.
              </Typography>
            </Box>

            <Box sx={{ mb: 4 }}>
              <Typography variant="body1">
                <Typography variant="h2" sx={{ my: 4 }}>
                  Accuracy of Information
                </Typography>
              </Typography>
              <Typography variant="body1">
                Xrpl.to strives to ensure the accuracy of the information listed
                on this website; however, it will not be held responsible for any
                missing or incorrect information. Xrpl.to provides all information
                "as is." You understand that you use any and all information available
                on this website at your own risk.
              </Typography>
            </Box>

            <Box sx={{ mb: 4 }}>
              <Typography variant="body1">
                <Typography variant="h2" sx={{ my: 4 }}>
                  Non-Endorsement
                </Typography>
              </Typography>
              <Typography variant="body1">
                The presence of third-party advertisements and hyperlinks on xrpl.to
                does not constitute an endorsement, guarantee, warranty, or recommendation
                by Xrpl.to. Please conduct your own due diligence before deciding to use
                any third-party services.
              </Typography>
            </Box>

            <Box sx={{ mb: 4 }}>
              <Typography variant="body1">
                <Typography variant="h2" sx={{ my: 4 }}>
                  Affiliate Disclosure
                </Typography>
              </Typography>
              <Typography variant="body1">
                Xrpl.to may receive compensation for affiliate links. This compensation
                may be in the form of money or services and could occur without any action
                from a site visitor. By engaging in activities related to an affiliate link,
                you acknowledge and understand that some form of compensation may be provided
                to Xrpl.to. For instance, if you click on an affiliate link, sign up, and trade
                on an exchange, Xrpl.to may receive compensation. Each affiliate link is clearly
                indicated with an icon next to it.
              </Typography>
            </Box>

          </Grid>
        </Grid>
      </Container>

      <Footer />
    </Box>
  );
}

export default DisclaimerPage;

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
        ogp.title = 'Disclaimer';
        ogp.url = 'https://xrpl.to/';
        ogp.imgUrl = 'https://xrpl.to/static/ogp.webp';
        //ogp.desc = 'Meta description here';

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