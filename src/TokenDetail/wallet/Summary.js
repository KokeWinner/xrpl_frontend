import Decimal from 'decimal.js';
import React, { useState, useContext } from 'react';
import { useSelector } from "react-redux";
import { withStyles } from '@mui/styles';
import { alpha, Grid, Link, Stack, Typography } from '@mui/material';
import { selectMetrics } from "src/redux/statusSlice";
import { fNumber } from 'src/utils/formatNumber';
import WalletCard from './WalletCard';
import { AppContext } from 'src/AppContext';

const ContentTypography = withStyles({
    root: {
        color: alpha('#919EAB', 0.99)
    }
})(Typography);

function Rate(num, exch) {
    if (num === 0 || exch === 0) return 0;
    return fNumber(num / exch);
}

export default function Summary() {
    const [showContent, setShowContent] = useState(false);
    const { darkMode } = useContext(AppContext);

    return (
        <Stack sx={{ pt: 2, pl: 2.5 }}>
            <Typography variant='wallet_h3'>Wallets</Typography>
            <Stack direction="row" sx={{ mt: 1, mb: 6 }}>
                <ContentTypography variant='subtitle1'>
                    We present various wallet provider options, enabling you to make an informed decision on the safest place to store your XRPL tokens and currencies.
                </ContentTypography>
                <Link
                    component="button"
                    underline="always"
                    variant="body2"
                    color="#637381"
                    onClick={() => setShowContent(!showContent)}>
                    <ContentTypography variant='subtitle1' sx={{ ml: 1 }}>
                        {showContent ? 'Read Less' : 'Read More'}
                    </ContentTypography>
                </Link>
            </Stack>

            <div
                style={{
                    display: showContent ? "flex" : "none",
                    flexDirection: "column",
                }}
            >
                <Typography variant='wallet_h2'>Understanding XRP Ledger Wallets: A Brief Overview</Typography>
                <Typography variant='p1'>XRPL wallets are software applications designed to store private and public keys, as well as interact with the XRP Ledger. They enable users to send, receive, and monitor the balance of XRPL currencies, functioning similarly to a bank account for viewing, depositing, and withdrawing funds.</Typography>
                <Typography variant='p1'>XRPL wallets securely store private and public keys, enabling users to send and receive digital currency while monitoring transactions to safeguard against identity theft. The private key authorizes payments, while the public key allows access to received funds.</Typography>
                <Typography variant='p1'>XRPL wallets can be categorized as hot or cold, depending on their connection to the internet. Hot wallets are connected to the internet, while cold wallets remain offline. When choosing between a <Link href="/status/coming-soon" color="primary">hot wallet and a cold wallet</Link>, several factors must be considered: hot wallets are generally more user-friendly but come with a higher risk of fund loss due to their internet connection.</Typography>

                <Typography variant='wallet_h2'>Exploring the Main Types of XRPL Wallets: An Overview</Typography>

                <Typography variant='wallet_h2'><Link href="https://bithomp.com/paperwallet/" color="primary">Paper Wallets</Link></Typography>
                <Typography variant='p1'>XRPL paper wallets offer a secure method for holding your cryptocurrencies, functioning as a safe and accessible storage solution. A paper wallet stores both the public and private keys for your wallet, allowing you to receive currencies from others. Additionally, you can send currency to this address, provided it is generated using a genuine random number generator (RNG).</Typography>
                <Typography variant='p1'>Paper wallets serve as simple, secure, and offline alternatives to digital cryptocurrency wallets. They combine the advantages of traditional paper money with the unique capability to safely cold-store digital currency, eliminating the risk of hackers or malware gaining access to your funds.</Typography>

                <Typography variant='wallet_h2'><Link href="https://gatehub.net/" color="primary">Hot Wallets</Link></Typography>
                <Typography variant='p1'>Currency hot wallets, often referred to as web wallets or online wallets, are ideal for making small, frequent payments with minimal effort from individuals or organizations.</Typography>
                <Typography variant='p1'>Currency hot wallets are a digital wallet used to store cryptocurrency funds. A hot wallet is an online system and can be accessed from anywhere as it does not require any physical access to the unit. For example, <Link href="https://www.uphold.com/" color="primary">Uphold</Link> is a popular exchange platform for buying cryptocurrency in the U.S. and Europe, but they also have a web-based digital wallet which allows users to store <Link href="https://xrpl.to/token/xrp/" color="primary">XRP</Link>, <Link href="https://xrpl.to/token/casinocoin" color="primary">Casino Coin</Link> and <Link href="https://xrpl.to/token/xpunks" color="primary">XPunks</Link>, among other XRPL tokens.</Typography>
                <Typography variant='p1'><Link href="https://gatehub.net/" color="primary">Gatehub</Link> is another popular hot wallet option for storing and managing cryptocurrencies.</Typography>

                <Typography variant='wallet_h2'><Link href="https://xumm.app/" color="primary">Cold Wallets</Link></Typography>
                <Typography variant='p1'>Cold wallets encompass various methods of storing cryptocurrency that keep the private keys of your tokens offline, safeguarding them against hacking, theft, or unauthorized access. Compared to hot storage solutions, paper wallets and other cold wallet options are generally considered more secure due to their offline nature. Ledger Hardware Wallets, such as the Ledger Nano S, serve as an example of a cold wallet, providing a highly secure option for storing your cryptocurrencies offline.</Typography>


                <Typography variant='wallet_h2'>Getting Started with an XRP Wallet: A Step-by-Step Guide</Typography>
                <Typography variant='p1'>1. Choose a wallet: First, decide whether you want a hot or cold wallet for your XRP. Hot wallets like Xaman (XUMM) or Gatehub Wallet are online and easy to access, while cold wallets like Ledger Nano S or paper wallets offer increased security through offline storage.</Typography>
                <Typography variant='p1'>2. Create an account or set up your wallet: For hot wallets, you'll need to sign up for an account with your chosen wallet provider. Provide a valid email address, create a strong password, and follow the account verification process. For cold wallets, follow the setup instructions provided by the manufacturer.</Typography>
                <Typography variant='p1'>3. Generate an XRP address: After setting up your wallet, it will automatically generate an XRP address for you. This address is a unique identifier that you'll use to send, receive, and store XRP tokens.</Typography>
                <Typography variant='p1'>4. Fund your wallet: To add XRP to your wallet, you can either purchase XRP from an exchange or receive it from someone else. When purchasing from an exchange, make sure to withdraw the XRP directly to your wallet's address.</Typography>
                <Typography variant='p1'>5. Send and receive XRP: To send XRP, you'll need the recipient's XRP address. Enter the address and the amount you'd like to send, and confirm the transaction. To receive XRP, simply share your XRP address with the sender.</Typography>
                <Typography variant='p1'>6. Monitor your balance and transactions: Most XRP wallets provide an overview of your balance and transaction history. Keep track of your funds and ensure that all transactions are processed correctly.</Typography>
                <Typography variant='p1'>7. Safeguard your wallet: Always remember to back up your wallet's private key or recovery phrase in a secure location. Additionally, enable two-factor authentication (2FA) for hot wallets to enhance security.</Typography>
                <Typography variant='p1'>XUMM wallet is a prominent XRP Ledger wallet supported by numerous applications. Learn <Link href="https://www.youtube.com/watch?v=dIGDYLffQa8" color="primary">how to use Xaman (XUMM) XRP wallet in this tutorial</Link>.</Typography>

                <Typography variant='para'></Typography>

                <Typography variant='wallet_h2' sx={{mb:5}}>
                    <Link
                        component="button"
                        underline="always"
                        variant="body2"
                        color="#637381"
                        onClick={() => {
                            setShowContent(!showContent);
                        }}
                    >
                        Read Less
                    </Link>
                </Typography>
            </div>

            <Grid container spacing={3} sx={{ p: 0 }}>
                {/* Grid items for WalletCards */}
                {/* Example for one Wallet Card */}
                <Grid item xs={12} md={6} lg={4} sx={{ pl: 0, position: 'relative' }}>
                    <WalletCard name='Xaman' link='https://xumm.app/' imgUrl='/static/xumm.webp'/>
                    <Typography variant='caption' sx={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: 'fit-content',
                        padding: '4px 8px',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        borderRadius: '12px',
                        backgroundColor: darkMode ? 'rgba(0, 123, 85, 0.9)' : 'rgba(85, 105, 255, 0.9)',
                        color: 'white',
                        letterSpacing: 'normal',
                        transition: 'all 0.3s ease-in-out',
                        '&:hover': {
                            backgroundColor: darkMode ? 'rgba(0, 123, 85, 1)' : 'rgba(85, 105, 255, 1)',
                            boxShadow: '0 2px 4px 0 rgba(0,0,0,0.2)',
                        },
                    }}>Recommended</Typography>
                </Grid>
                
                <Grid item xs={12} md={6} lg={4} sx={{pl:0}}>
                    <WalletCard name='GemWallet' link='https://gemwallet.app/' imgUrl='/static/gemwallet.webp'/>
                </Grid>
                <Grid item xs={12} md={6} lg={4} sx={{pl:0}}>
                    <WalletCard name='CROSSMARK' link='https://www.crossmark.io/' imgUrl='/static/crossmark.webp'/>
                </Grid>
                <Grid item xs={12} md={6} lg={4} sx={{pl:0}}>
                    <WalletCard name='SOLO Wallet' link='https://www.sologenic.com/ecosystem/solo-wallet' imgUrl='/static/solo.webp'/>
                </Grid>
                <Grid item xs={12} md={6} lg={4} sx={{pl:0}}>
                    <WalletCard name='Bithomp Paper Wallet' link='https://bithomp.com/paperwallet/' imgUrl='/static/bithomp.webp'/>
                </Grid>
                <Grid item xs={12} md={6} lg={4} sx={{pl:0}}>
                    <WalletCard name='LEDGER' link='https://www.ledger.com/' imgUrl='/static/ledger.svg'/>
                </Grid>
                <Grid item xs={12} md={6} lg={4} sx={{pl:0}}>
                    <WalletCard name="D'CENT" link='https://dcentwallet.com/' imgUrl='/static/dcent.webp'/>
                </Grid>
                <Grid item xs={12} md={6} lg={4} sx={{pl:0}}>
                    <WalletCard name="COBO" link='https://cobo.com/' imgUrl='/static/cobo.webp'/>
                </Grid>
            </Grid>
        </Stack>
    )
}
