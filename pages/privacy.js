import React from 'react';
import { Box, Container, Grid, Toolbar, Typography, Table, TableBody, TableCell, TableContainer, TableRow } from '@mui/material';
import axios from 'axios';
import { performance } from 'perf_hooks';
import Topbar from 'src/components/Topbar';
import Header from 'src/components/Header';
import Footer from 'src/components/Footer';

function PrivacyPage() {
  return (
    <Box>
      <Toolbar id="back-to-top-anchor" />
      <Topbar />
      <Header />

      <Container maxWidth="xl">
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h1" sx={{ my: 4 }}>Privacy Policy</Typography>

            <Box sx={{ mb: 4 }}>
              
              <Typography variant="subtitle1" sx={{ mb: 4 }}>
                Effective Date: May 27, 2023.
              </Typography>
              <Typography variant="body1">
                At xrpl.to, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, and disclose information when you access or use our web application on the XRP Ledger ("xrpl.to" or the "App"). By using xrpl.to, you consent to the practices described in this Privacy Policy.
              </Typography>
              <br />
              <Typography variant="body1">
                <Typography variant="h2" sx={{ my: 4 }}>
                  Information We Collect:
                </Typography>
              </Typography>
              <br />
              <Typography variant="body1">
                1.1 Personal Information:
                We may collect certain personal information from you when you use xrpl.to, such as your XRP Ledger address, transaction history, and account information. We only collect personal information that is necessary for the operation and functionality of the App.
              </Typography>
              <Typography variant="body1">
                1.2 Non-Personal Information:
                We may also collect non-personal information, such as your device information, IP address, browser type, and operating system, in order to improve the App and provide a better user experience.
              </Typography>
              <br />
              <Typography variant="body1">
                <Typography variant="h2" sx={{ my: 4 }}>
                  How We Use Your Information:
                </Typography>
              </Typography>
              <br />
              <Typography variant="body1">
                2.1 Provision of Services:
                We use the information we collect to provide and improve the services offered by xrpl.to. This includes processing transactions, facilitating XRP Ledger functionalities, and ensuring the security and integrity of the App.
              </Typography>
              <Typography variant="body1">
                2.2 Communication:
                We may use your personal information to communicate with you, respond to your inquiries, and provide you with updates or information related to xrpl.to.
              </Typography>
              <Typography variant="body1">
                2.3 Statistical Analysis:
                We may aggregate and anonymize non-personal information for statistical analysis and research purposes to improve our services, enhance user experience, and develop new features.
              </Typography>
              <br />
              <Typography variant="body1">
                <Typography variant="h2" sx={{ my: 4 }}>
                  Information Sharing and Disclosure:
                </Typography>
              </Typography>
              <br />
              <Typography variant="body1">
                3.1 Service Providers:
                We may engage third-party service providers to assist us in operating and maintaining xrpl.to. These service providers may have access to your personal information only to perform tasks on our behalf and are obligated not to disclose or use it for any other purpose.
              </Typography>
              <Typography variant="body1">
                3.2 Legal Requirements:
                We may disclose your information if required by law, regulation, or legal process, or if we believe it is necessary to protect the rights, property, or safety of xrpl.to, its users, or others.
              </Typography>
              <Typography variant="body1">
                3.3 Business Transfers:
                In the event of a merger, acquisition, or sale of all or a portion of our assets, your personal information may be transferred or disclosed as part of the transaction. We will take steps to ensure the confidentiality of your personal information is maintained.
              </Typography>
              <br />
              <Typography variant="body1">
                <Typography variant="h2" sx={{ my: 4 }}>
                  Data Security:
                </Typography>
              </Typography>
              <br />
              <Typography variant="body1">
                We implement appropriate security measures to protect the information we collect from unauthorized access, disclosure, alteration, or destruction. However, no method of transmission over the Internet or electronic storage is 100% secure, and we cannot guarantee absolute security.
              </Typography>
              <br />
              <Typography variant="body1">
                <Typography variant="h2" sx={{ my: 4 }}>
                  Third-Party Links:
                </Typography>
              </Typography>
              <br />
              <Typography variant="body1">
                xrpl.to may contain links to third-party websites or services. We are not responsible for the privacy practices or content of these third-party sites. We encourage you to review the privacy policies of those sites before providing any personal information.
              </Typography>
              <br />
              <Typography variant="body1">
                <Typography variant="h2" sx={{ my: 4 }}>
                  Children's Privacy:
                </Typography>
              </Typography>
              <br />
              <Typography variant="body1">
                xrpl.to is not intended for use by individuals under the age of 18. We do not knowingly collect personal information from children. If we become aware that we have inadvertently collected personal information from a child, we will promptly delete it from our records.
              </Typography>
              <br />
              <Typography variant="body1">
                <Typography variant="h2" sx={{ my: 4 }}>
                  Changes to this Privacy Policy:
                </Typography>
              </Typography>
              <br />
              <Typography variant="body1">
                We reserve the right to modify this Privacy Policy at any time. If we make material changes, we will notify you by posting the updated Privacy Policy on xrpl.to. Your continued use of the App after the changes have been made constitutes your acceptance of the revised Privacy Policy.
              </Typography>
              <br />
              <Typography variant="body1">
                <Typography variant="h2" sx={{ my: 4 }}>
                  Contact Us:
                </Typography>
              </Typography>
              <br />
              <Typography variant="body1">
                If you have any questions, concerns, or requests regarding this Privacy Policy or the privacy practices of xrpl.to, please contact us at [Insert Contact Information].
              </Typography>
              <br />
              <Typography variant="body1">
                Please note that this Privacy Policy applies only to the use of xrpl.to and does not extend to any other websites, platforms, or services that may be linked or integrated with xrpl.to.
              </Typography>
            </Box>

            <Box>
              <TableContainer>
                <Table>
                  <TableBody>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Event</TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>May 27, 2023.</TableCell>
                      <TableCell>Privacy Policy Creation</TableCell>
                    </TableRow>
                  
                    {/* Add more rows for your privacy policy timeline */}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Grid>
        </Grid>
      </Container>

      <Footer />
    </Box>
  );
}

export default PrivacyPage;

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
        ogp.title = 'Privacy Policy';
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