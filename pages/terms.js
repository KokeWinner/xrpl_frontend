import React from 'react';
import { Box, Container, Grid, Toolbar, Typography } from '@mui/material';
import axios from 'axios';
import { performance } from 'perf_hooks';
import Topbar from 'src/components/Topbar';
import Header from 'src/components/Header';
import Footer from 'src/components/Footer';

function TermsPage() {
  return (
    <Box>
      <Toolbar id="back-to-top-anchor" />
      <Topbar />
      <Header />

      <Container maxWidth="xl">
    <Grid container spacing={3}>
      <Grid item xs={12}>
        <Typography variant="h1" sx={{ my: 4 }}>
          Terms and Conditions of xrpl.to
        </Typography>
        <Typography variant="subtitle1" sx={{ mb: 4 }}>
          Last updated: May 27, 2023.
        </Typography>

        <Box sx={{ mb: 4 }}>
          <Typography variant="body1">
            <Typography variant="h2" sx={{ my: 4 }}>Acceptance of Terms</Typography>
          </Typography>
          <Typography variant="body1">
            By accessing or using xrpl.to, you affirm that you have read, understood, and agreed to be bound by this Agreement, as well as any additional terms and conditions and policies referenced herein. If you do not agree to this Agreement, you may not access or use xrpl.to.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="body1">
            <Typography variant="h2" sx={{ my: 4 }}>Modification of Agreement</Typography>
          </Typography>
          <Typography variant="body1">
            We reserve the right to modify, amend, or replace this Agreement at any time, at our sole discretion. Any changes to this Agreement will be effective immediately upon posting the modified version on xrpl.to. It is your responsibility to review this Agreement periodically to ensure that you are aware of any modifications. Your continued use of xrpl.to after the modifications constitutes your acceptance of the updated Agreement.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="body1">
            <Typography variant="h2" sx={{ my: 4 }}>Use of xrpl.to</Typography>
          </Typography>
          <Typography variant="body1">
            a. Eligibility: To access and use xrpl.to, you must be at least 18 years old or of legal age in your jurisdiction. By using xrpl.to, you represent and warrant that you meet the eligibility requirements.
          </Typography>
          <Typography variant="body1">
            b. Compliance with Applicable Laws: You agree to comply with all applicable laws, regulations, and third-party rights while using xrpl.to. You are solely responsible for ensuring that your use of xrpl.to is in compliance with all applicable laws and regulations.
          </Typography>
          <Typography variant="body1">
            c. Account Registration: Certain features of xrpl.to may require you to create an account. However, xrpl.to primarily relies on Web3 login, such as XUMM Wallet, where users do not have to register accounts. When using Web3 login, you will be prompted to connect your XUMM Wallet or other compatible Web3 wallet to access the features of xrpl.to. It is important to note that xrpl.to does not collect or store any account credentials. The authentication and authorization process is handled securely through the Web3 login interface. You are responsible for ensuring the security and confidentiality of your Web3 wallet and for all activities that occur under your account. You agree to take appropriate measures to protect your wallet.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="body1">
            <Typography variant="h2" sx={{ my: 4 }}>Intellectual Property Rights</Typography>
          </Typography>
          <Typography variant="body1">
            a. Ownership: xrpl.to and all associated intellectual property rights are owned by us or our licensors. This Agreement does not grant you any rights to use our trademarks, logos, or other proprietary materials.
          </Typography>
          <Typography variant="body1">
            b. License: Subject to your compliance with this Agreement, we grant you a limited, non-exclusive, non-transferable, revocable license to use xrpl.to for personal, non-commercial purposes.
          </Typography>
          <Typography variant="body1">
            c. Restrictions: You may not copy, modify, distribute, sell, lease, reverse engineer, or create derivative works based on xrpl.to or any part thereof unless expressly authorized by us in writing.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="body1">
            <Typography variant="h2" sx={{ my: 4 }}>Disclaimer of Warranty</Typography>
          </Typography>
          <Typography variant="body1">
            a. xrpl.to is provided on an "as is" and "as available" basis without warranties of any kind, whether express or implied. We do not guarantee that xrpl.to will be uninterrupted, error-free, or secure. Your use of xrpl.to is at your own risk.
          </Typography>
          <Typography variant="body1">
            b. We disclaim all warranties, whether express or implied, including but not limited to warranties of merchantability, fitness for a particular purpose, non-infringement, and any warranties arising out of the course of dealing or usage of trade.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="body1">
            <Typography variant="h2" sx={{ my: 4 }}>Limitation of Liability</Typography>
          </Typography>
          <Typography variant="body1">
            a. To the maximum extent permitted by applicable law, we shall not be liable for any indirect, incidental, special, consequential, or exemplary damages, including but not limited to damages for loss of profits, goodwill, use, data, or other intangible losses, arising out of or in connection with your use of xrpl.to.
          </Typography>
          <Typography variant="body1">
            b. In no event shall our aggregate liability for any claims arising out of or relating to this Agreement or your use of xrpl.to exceed the amount you paid, if any, to us for using xrpl.to.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="body1">
            <Typography variant="h2" sx={{ my: 4 }}>Indemnification</Typography>
          </Typography>
          <Typography variant="body1">
            You agree to indemnify, defend, and hold harmless xrpl.to and its affiliates, directors, officers, employees, agents, and licensors from and against any claims, liabilities, damages, losses, costs, or expenses (including reasonable attorneys' fees) arising out of or related to your breach of this Agreement, your use of xrpl.to, or any violation of applicable laws or third-party rights.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="body1">
            <Typography variant="h2" sx={{ my: 4 }}>Third-Party Websites and Services</Typography>
          </Typography>
          <Typography variant="body1">
            xrpl.to may contain links to third-party websites or services that are not owned or controlled by us. We do not endorse or assume any responsibility for the content, privacy policies, or practices of any third-party websites or services. You acknowledge and agree that we shall not be responsible or liable, directly or indirectly, for any damage or loss caused or alleged to be caused by or in connection with the use of or reliance on any such content, goods, or services available on or through any third-party websites or services.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="body1">
            <Typography variant="h2" sx={{ my: 4 }}>Termination</Typography>
          </Typography>
          <Typography variant="body1">
            We may, at our sole discretion, terminate or suspend your access to xrpl.to without prior notice or liability, for any reason whatsoever, including but not limited to a breach of this Agreement. Upon termination, your right to use xrpl.to will immediately cease, and any provisions of this Agreement that are intended to survive termination shall continue to apply.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="body1">
            <Typography variant="h2" sx={{ my: 4 }}>Governing Law and Jurisdiction</Typography>
          </Typography>
          <Typography variant="body1">
            This Agreement shall be governed by and construed in accordance with the laws of [Jurisdiction]. Any dispute arising out of or in connection with this Agreement shall be subject to the exclusive jurisdiction of the courts of [Jurisdiction].
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="body1">
            <Typography variant="h2" sx={{ my: 4 }}>Severability</Typography>
          </Typography>
          <Typography variant="body1">
            If any provision of this Agreement is held to be invalid, illegal, or unenforceable under any applicable law, such provision shall be deemed modified to the extent necessary to make it valid, legal, and enforceable. If it cannot be so modified, the provision shall be severed from this Agreement, and the remaining provisions shall remain in full force and effect.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="body1">
            <Typography variant="h2" sx={{ my: 4 }}>Disclaimer and Limitation of Liability</Typography>
          </Typography>
          <Typography variant="body1">
            a. Informational Purposes: The content on xrpl.to is strictly for informational purposes only. Nothing on or in the service shall constitute or be construed as an offering of any currency, security, or any financial instrument or as investment advice or investment recommendations. xrpl.to does not provide recommendations as to whether to purchase a currency, security, or instrument or offer investment strategies. The content on this service should not be considered as sufficient information upon which to base an investment strategy. No content on xrpl.to is tailored to the specific needs of any individual, entity, or group of individuals. xrpl.to expresses no opinion as to the future or expected value of any currency, security, or other interest.
          </Typography>
          <Typography variant="body1">
            b. No Investment Recommendations: xrpl.to does not explicitly or implicitly recommend or suggest any investment strategy of any kind. The content on the service is not intended to be used as a basis for any financial product or other product without the express prior written consent of xrpl.to.
          </Typography>
          <Typography variant="body1">
            c. Use at Your Own Risk: Your use of xrpl.to is at your sole risk. The service is provided on an "as is" and "as available" basis. xrpl.to expressly disclaims all warranties of any kind, whether express, implied, or statutory, including but not limited to the implied warranties of merchantability, fitness for a particular purpose, and non-infringement.
          </Typography>
          <Typography variant="body1">
            d. No Liability for Loss: xrpl.to shall not be liable for any direct, indirect, incidental, special, consequential, or exemplary damages, including but not limited to damages for loss of profits, goodwill, use, data, or other intangible losses resulting from the use of or inability to use the service or from any content posted on the service, whether based on warranty, contract, tort (including negligence), or any other legal theory, and whether or not xrpl.to has been informed of the possibility of such damage, even if a limited remedy set forth herein is found to have failed its essential purpose.
          </Typography>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Typography variant="body1">
            <Typography variant="h2" sx={{ my: 4 }}>Contact Us</Typography>
          </Typography>
          <Typography variant="body1">
            If you have any questions about this Agreement, please contact us at [hello@xrpl.to].
          </Typography>
        </Box>
      </Grid>
    </Grid>
  </Container>

  <Footer />
</Box>
  );
}

export default TermsPage;

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
        ogp.title = 'Terms of use';
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