import React from 'react';
import { Box, Container, Grid, Toolbar, Typography } from '@mui/material';
import axios from 'axios';
import { performance } from 'perf_hooks';
import Topbar from 'src/components/Topbar';
import Header from 'src/components/Header';
import Footer from 'src/components/Footer';

function CommunityRulesPage() {
  return (
    <Box>
      <Toolbar id="back-to-top-anchor" />
      <Topbar />
      <Header />

      <Container maxWidth="xl">
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h1" sx={{ my: 4 }}>Community Rules</Typography>

            <Box sx={{ mb: 4 }}>
              <Typography variant="body1">
                xrpl.to is dedicated to creating a vibrant and respectful community where users can freely engage and exchange ideas related to the XRP Ledger. To ensure a positive and safe environment for all users, we have established the following community rules. By participating in our community, you agree to abide by these guidelines.
              </Typography>
            </Box>

            <Box sx={{ mb: 4 }}>
              <Typography variant="h2">Respect and Inclusivity</Typography>
              <Typography variant="body1">
                <ul>
                  <li>Treat all community members with respect, regardless of their background, language, religion, culture, or beliefs.</li>
                  <li>Avoid personal attacks, insults, or harassment towards individuals or groups.</li>
                  <li>Do not engage in discrimination, including but not limited to, based on sex, race, gender identification, age, occupation, religion, national origins, disability, marital status, crypto beliefs, or political beliefs.</li>
                  <li>Refrain from engaging in any form of hate speech or posting content that promotes violence or harm to others.</li>
                </ul>
              </Typography>
            </Box>

            <Box sx={{ mb: 4 }}>
              <Typography variant="h2">Relevant and Constructive Discussions</Typography>
              <Typography variant="body1">
                <ul>
                  <li>Stay on topic and contribute to meaningful discussions related to the XRP Ledger and associated technologies.</li>
                  <li>Provide insightful and informative thoughts that add value to the community.</li>
                  <li>Avoid posting repetitive or unrelated content that may disrupt the flow of discussions.</li>
                  <li>Do not engage in spamming or use the platform solely for self-promotion.</li>
                </ul>
              </Typography>
            </Box>

            <Box sx={{ mb: 4 }}>
              <Typography variant="h2">Privacy and Security</Typography>
              <Typography variant="body1">
                <ul>
                  <li>Respect the privacy of individuals and do not share personal information of yourself or others, such as email addresses, wallet addresses, or phone numbers.</li>
                  <li>Report any potential security vulnerabilities or suspicious activities to the platform administrators promptly.</li>
                </ul>
              </Typography>
            </Box>

            <Box sx={{ mb: 4 }}>
              <Typography variant="h2">Integrity and Authenticity</Typography>
              <Typography variant="body1">
                <ul>
                  <li>Share accurate and reliable information related to the XRP Ledger, cryptocurrencies, and associated projects.</li>
                  <li>Refrain from spreading false rumors, manipulating opinions, or engaging in deceptive practices.</li>
                  <li>Do not create multiple accounts to manipulate discussions or deceive other community members.</li>
                </ul>
              </Typography>
            </Box>

            <Box sx={{ mb: 4 }}>
              <Typography variant="h2">Legal Compliance</Typography>
              <Typography variant="body1">
                <ul>
                  <li>Do not engage in any illegal activities or promote unlawful actions on the platform.</li>
                  <li>Avoid posting information about buying or selling illegal goods or services.</li>
                  <li>Respect intellectual property rights and do not plagiarize or infringe upon the work of others without proper attribution.</li>
                </ul>
              </Typography>
            </Box>

            <Box sx={{ mb: 4 }}>
              <Typography variant="h2">Bots and Automation</Typography>
              <Typography variant="body1">
                <ul>
                  <li>Do not use automated services or bots to post spam messages or images.</li>
                  <li>Refrain from attempting to disrupt or crash the platform with malicious intent.</li>
                </ul>
              </Typography>
            </Box>

            <Box sx={{ mb: 4 }}>
              <Typography variant="body1">
                Failure to adhere to these community rules may result in the removal of your messages and, if necessary, temporary or permanent suspension from accessing certain features of the xrpl.to platform. We aim to foster a welcoming and collaborative community, and we appreciate your cooperation in maintaining a positive environment for all users.
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Container>

      <Footer />
    </Box>
  );
}

export default CommunityRulesPage;

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
        ogp.title = 'Community Rules';
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