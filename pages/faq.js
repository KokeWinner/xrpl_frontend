import React from 'react';
import { Box, Container, Grid, Toolbar, Typography } from '@mui/material';
import axios from 'axios';
import { performance } from 'perf_hooks';
import Topbar from 'src/components/Topbar';
import Header from 'src/components/Header';
import Footer from 'src/components/Footer';

function FAQPage() {
  return (
    <Box>
      <Toolbar id="back-to-top-anchor" />
      <Topbar />
      <Header />

      <Container maxWidth="xl">
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Typography variant="h1" sx={{ my: 4 }}>Frequently Asked Questions</Typography>

            <Box sx={{ mb: 4 }}>
              <Typography variant="h3" sx={{ mb: 2 }}>How are the prices calculated for the various cryptocurrencies on xrpl.to?</Typography>
              <Typography variant="body1">
                The prices of cryptocurrencies on xrpl.to are determined by the market dynamics of the XRP Ledger decentralized exchange (DEX). The prices are based on the supply and demand of the tokens traded on the XRPL, taking into account the latest executed trades and order book data.
              </Typography>
            </Box>

            <Box sx={{ mb: 4 }}>
              <Typography variant="h3" sx={{ mb: 2 }}>What is the XRPL?</Typography>
              <Typography variant="body1">
                The XRPL, or XRP Ledger, is an open-source blockchain and decentralized digital asset platform. It serves as the underlying technology for the XRP cryptocurrency and provides a secure and efficient infrastructure for issuing, transferring, and trading tokens.
              </Typography>
            </Box>

            <Box sx={{ mb: 4 }}>
              <Typography variant="h3" sx={{ mb: 2 }}>How do I trade on xrpl.to?</Typography>
              <Typography variant="body1">
                To trade on xrpl.to, you need to connect your XRP Ledger-compatible wallet to the DEX. You can use wallets such as XUMM, XRPL Wallet, or XRP Toolkit. Once connected, you can browse the available tokens, place buy or sell orders, and execute trades directly on the XRPL.
              </Typography>
            </Box>

            <Box sx={{ mb: 4 }}>
              <Typography variant="h3" sx={{ mb: 2 }}>What is the difference between a decentralized exchange (DEX) and a centralized exchange?</Typography>
              <Typography variant="body1">
                A decentralized exchange (DEX), like xrpl.to, operates on a blockchain network and allows users to trade cryptocurrencies directly from their wallets without relying on a centralized intermediary. In contrast, a centralized exchange (CEX) functions as a third-party platform that holds users' funds and facilitates trading on their behalf.
              </Typography>
            </Box>

            <Box sx={{ mb: 4 }}>
              <Typography variant="h3" sx={{ mb: 2 }}>How secure is xrpl.to?</Typography>
              <Typography variant="body1">
                Xrpl.to leverages the security and immutability of the XRP Ledger, which is a decentralized and well-established blockchain network. As a non-custodial DEX, xrpl.to does not hold users' funds, minimizing the risk of centralized hacks or theft. However, it's important to ensure the security of your own wallet and exercise caution when interacting with any online platform.
              </Typography>
            </Box>

            <Box sx={{ mb: 4 }}>
              <Typography variant="h3" sx={{ mb: 2 }}>What are the fees for trading on xrpl.to?</Typography>
              <Typography variant="body1">
                Xrpl.to operates with a fee structure that is typically lower compared to many centralized exchanges. The fees vary depending on the specific trade and the network congestion at the time. The fees primarily cover the transaction costs on the XRP Ledger, including network fees and ledger reserves.
              </Typography>
            </Box>

            <Box sx={{ mb: 4 }}>
              <Typography variant="h3" sx={{ mb: 2 }}>How do I list my token on xrpl.to?</Typography>
              <Typography variant="body1">
                To list your token on xrpl.to, you need to ensure that your token is compatible with the XRP Ledger and meets the necessary technical requirements. You can reach out to the xrpl.to team or follow the guidelines provided on the platform to initiate the listing process. Please note that listing decisions are subject to evaluation and compliance checks.
              </Typography>
            </Box>

            <Box sx={{ mb: 4 }}>
              <Typography variant="h3" sx={{ mb: 2 }}>Can I participate in token sales or initial coin offerings (ICOs) on xrpl.to?</Typography>
              <Typography variant="body1">
                Xrpl.to is primarily a decentralized exchange for trading existing tokens on the XRP Ledger. It does not directly facilitate token sales or ICOs. However, if a token sale is conducted using the XRP Ledger's decentralized issuance capabilities, you may be able to participate in such sales through compatible wallets.
              </Typography>
            </Box>

            <Box sx={{ mb: 4 }}>
              <Typography variant="h3" sx={{ mb: 2 }}>What is the difference between XRPL and XRP?</Typography>
              <Typography variant="body1">
                XRPL stands for XRP Ledger, which is the underlying technology and blockchain network that powers the XRP cryptocurrency. XRP is the native digital asset of the XRP Ledger and serves as a bridge currency for facilitating fast and low-cost transactions between different currencies.
              </Typography>
            </Box>

            <Box sx={{ mb: 4 }}>
              <Typography variant="h3" sx={{ mb: 2 }}>Is xrpl.to available in my country?</Typography>
              <Typography variant="body1">
                Xrpl.to is accessible to users worldwide, as long as they have an internet connection and a compatible XRP Ledger wallet. However, it's important to comply with the local regulations and legal requirements regarding cryptocurrency trading in your country.
              </Typography>
            </Box>

            <Box sx={{ mb: 4 }}>
              <Typography variant="h3" sx={{ mb: 2 }}>Is there customer support available for xrpl.to?</Typography>
              <Typography variant="body1">
                Xrpl.to provides customer support through various channels, including email and community forums. You can reach out to the xrpl.to support team for assistance with any platform-related inquiries, technical issues, or general feedback.
              </Typography>
            </Box>

          </Grid>
        </Grid>
      </Container>

      <Footer />
    </Box>
  );
}

export default FAQPage;

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
        ogp.title = 'FAQ';
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