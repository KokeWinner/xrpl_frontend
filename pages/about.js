import React from 'react';
import { Box, Container, Grid, Toolbar, Typography, Table, TableBody, TableCell, TableContainer, TableRow } from '@mui/material';
import axios from 'axios';
import { performance } from 'perf_hooks';
import Topbar from 'src/components/Topbar';
import Header from 'src/components/Header';
import Footer from 'src/components/Footer';

function AboutPage() {
  return (
    <Box>
      <Toolbar id="back-to-top-anchor" />
      <Topbar />
      <Header />

      <Container maxWidth="xl">
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h1" sx={{ my: 4 }}>About xrpl.to</Typography>

        <Box sx={{ mb: 4 }}>
          <Typography variant="body1">
            <b>
            At XRPL.to, we are the largest price-tracking onchain app for
            tokenized assets on the XRPL ecosystem. Our mission is to make
            XRPL tokens discoverable and efficient globally by empowering
            retail users with unbiased, high-quality, and accurate
            information. With a commitment to becoming the premier online
            source for XRP Ledger market data, we strive to provide all the
            relevant and current information on XRPL tokens, currencies,
            and assets in a single, easy-to-find location. Our goal is to
            empower users to draw their own informed conclusions by
            offering them unbiased and accurate data for making informed
            decisions.
            </b>
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="body1">
            Founded in November 2021 by NFT Labs, XRPL.to is a dedicated
            platform providing up-to-date XRPL token prices, charts, and
            data specifically for the emerging XRPL DEX markets. Our
            commitment lies in delivering accurate, timely, and unbiased
            information, sourced directly from the XRP Ledger itself. Our
            efforts have been recognized and acknowledged by reputable
            media publications, including Bloomberg, New York Times, and
            Digital Trends. We take pride in being a trusted source for
            comprehensive XRPL market insights, enabling users to stay
            informed and make informed decisions.
          </Typography>
        </Box>

        <Box>
          <TableContainer>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell>November 2021</TableCell>
                  <TableCell>XRPL.to Launches</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>December 2021</TableCell>
                  <TableCell>xrpl.to concludes the year with a monthly page view count of 55,000.</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>July 2022</TableCell>
                  <TableCell>XRPL Grants Wave 3 Recipient</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>August 2022</TableCell>
                  <TableCell>On-Ramp Fiat Integration</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>October 2022</TableCell>
                  <TableCell>XRPL.to introduces a weighted market cap for tokens with low liquidity.</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>February 2023</TableCell>
                  <TableCell>Full XRPL History Implemented</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell>April 2023</TableCell>
                  <TableCell>Public API Documentation Released</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <Box sx={{ mt: 4 }}>
        <Typography variant="body1">
  To understand the process of listing tokens projects and exchanges on xrpl.to, a Web3 app on the XRP ledger, please refer to our listing policy and frequently asked questions.
  <br /><br />
  xrpl.to attracts a significant user base, reaching millions of users annually through its web-based application on the XRP ledger. Users can access the app via the website, mobile platforms, and other communication channels such as newsletters, blogs, and social media platforms including Twitter, Telegram, Facebook, and Instagram. Additionally, xrpl.to hosts Twitter spaces.
  <br /><br />
  For a comprehensive list of our writers and contributors, please click here.
  <br /><br />
  If you are interested in advertising opportunities with xrpl.to or wish to explore our product offerings for companies, please contact us at hello@xrpl.to. For editorial partnerships related to our blog, please reach out to us at hello@xrpl.to.
  <br /><br />
  To discover potential job openings at xrpl.to, please visit our careers page for more information.
</Typography>

        </Box>
      </Grid>
    </Grid>
  </Container>

  <Footer />
</Box>
  );
}

export default AboutPage;

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
        ogp.title = 'About us';
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