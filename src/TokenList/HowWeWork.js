import { useState, useMemo } from 'react';
// Material
import { withStyles } from '@mui/styles';
import {
    alpha,
    Link,
    Stack,
    Typography
} from '@mui/material';

// Utils
import { fNumber } from 'src/utils/formatNumber';

// CBCCD2
const ContentTypography = withStyles({
    root: {
        color: alpha('#919EAB', 0.99)
    }
})(Typography);

function Rate(num, exch) {
    if (num === 0 || exch === 0)
        return 0;
    return fNumber(num / exch);
}

export default function HowWeWork({data}) {
    const [showContent, setShowContent] = useState(false);

    const content = useMemo(() => (
        <div
            style={{
                display: showContent?"flex":"none",
                flexDirection: "column",
            }}
        >
            <Typography variant='wallet_h2'>XRPL Token Prices Today: Latest Charts and Data Analysis</Typography>
            <Typography variant='p1'>Welcome to XRPL.to - Your XRPL Token Resource</Typography>
            <Typography variant='p1'>Established in November 2021 by <Link href="https://nftlabs.to" color="primary">NFT Labs</Link>, XRPL.to is dedicated to offering the latest XRPL token prices, charts, and data for the emerging XRPL DEX markets. We pride ourselves on delivering accurate, timely, and unbiased information, sourced directly from the XRP Ledger.</Typography>

            <Typography variant='wallet_h2'>Comprehensive XRP Ledger Market Data - All in One Destination</Typography>
            <Typography variant='p1'>At XRPL.to, our mission is to provide all the relevant and <Link href="/status/coming-soon" color="primary">current information</Link> on XRPL tokens, currencies, and assets in a single, easy-to-find location. Our goal from day one has been to become the premier online source for XRP Ledger market data. We strive to empower our users with unbiased, accurate information to make informed decisions.</Typography>

            <Typography variant='wallet_h2'>Access Free Live and Historical XRPL Token Charts</Typography>
            <Typography variant='p1'>Every token data page on our site features a chart displaying both live and historical price information for the respective currency or asset. Generally, the chart begins at the asset's launch, but you can customize it by selecting specific start and end dates. These informative charts are available free of charge for all visitors to our website.</Typography>

            <Typography variant='wallet_h2'>Understanding Our XRPL Token Price Calculation Method</Typography>
            <Typography variant='p1'>Our XRPL token prices are sourced directly from the XRPL DEX, based on respective trading pairs, and displayed in real time without delay. For a detailed explanation of our price calculation method, please visit <Link href="/status/coming-soon" color="primary">here</Link>.</Typography>
            <Typography variant='p1'>Related XRPL Resources and Links</Typography>
            <Typography variant='p1'>New to XRP? <Link href="https://uphold.com/en-us/assets/crypto/buy-xrp" color="primary">Discover how to purchase XRP today</Link>.</Typography>
            <Typography variant='p1'>Eager to learn more? Explore our <Link href="/status/coming-soon" color="primary">XRPL Glossary</Link> and <Link href="/status/coming-soon" color="primary">Educational Hub</Link>.</Typography>
            <Typography variant='p1'>Looking to track a transaction? Check out the <Link href="https://xrpscan.com/" color="primary">XRPScan</Link> Ledger Explorer.</Typography>

            <Typography variant='wallet_h2'>Understanding Our XRPL Token Valuation Method</Typography>
            <Typography variant='p1'>Our XRPL token valuations are determined by multiplying the total circulating supply of an asset by its reference price. For a more in-depth explanation of our valuation method, visit <Link href="/status/coming-soon">here</Link>.</Typography>
            
            <Typography variant='wallet_h2'>Understanding Our Total XRPL Token Market Cap Calculation</Typography>
            <Typography variant='p1'>Our total XRPL token market capitalization is calculated by summing the market cap of all listed tokens on the site.</Typography>

            <Typography variant='wallet_h2'>Does XRPL.to Include All XRPL Tokens?</Typography>
            <Typography variant='p1'>Yes, XRPL.to automatically lists all XRP Ledger tokens. As a company and team, we recognize that not all tokens and projects have good intentions. Although we can't guarantee the legitimacy of any project, we strive to provide valuable information to help users conduct their own research and make informed decisions.</Typography>

            <Typography variant='wallet_h2'>Understanding the Size of the Global XRPL Token Market</Typography>
            <Typography variant='p1'>As of the time of writing, there are approximately 9,752 tokens, currencies, and projects in the global XRPL token market. As previously stated, XRPL.to operates as a fully decentralized system that lists all XRPL tokens, leaving it up to users to conduct their own due diligence.</Typography>

            <Typography variant='wallet_h2'>Understanding XRPL Tokens: What Are They?</Typography>
            <Typography variant='p1'>In the XRP Ledger, all assets other than XRP can be represented as <strong>tokens</strong>. Standard tokens are tracked in relationships called <Link href="https://xrpl.org/trust-lines-and-issuing.html" color="primary">trust lines</Link> between accounts. Any account can issue tokens to other recipients who are willing to hold them, but you cannot unilaterally give tokens away to users who don't want them. Tokens can represent various types of value, including "stablecoins" backed by external assets, digital tokens created specifically on the XRP Ledger, community credit, and more.</Typography>

            <Typography variant='wallet_h2'>Understanding IDOs: What Are They?</Typography>
            <Typography variant='p1'>IDO, or Initial Dex Offering, is a method for smaller XRPL projects, as well as a few larger ones, to raise funds from retail investors worldwide in a crypto-based crowdfunding campaign. Investors typically visit the XRPL DEX to purchase XRPL tokens from the issuer in exchange for XRP, receiving tokens in return.</Typography>

            <Typography variant='wallet_h2'>Understanding Stablecoins: What Are They?</Typography>
            <Typography variant='p1'>In the XRP Ledger, a common model for tokens involves an issuer holding assets of equivalent value outside the ledger and issuing tokens representing that value on the ledger. Such issuers are often called gateways, as currency can move into and out of the XRP Ledger through their service. When the off-ledger assets backing a token have the same amounts and denomination as the on-ledger tokens, these tokens can be considered "stablecoins." In theory, the exchange rate between a stablecoin and its off-ledger representation should be stable at a 1:1 ratio.</Typography>
            <Typography variant='p1'>A stablecoin issuer is expected to provide deposit and withdrawal services, enabling users to exchange tokens for the corresponding currency or asset outside the XRP Ledger.</Typography>
            <Typography variant='p1'>In practice, the XRP Ledger is a computer system that cannot enforce any rules outside of itself, so stablecoins on the XRP Ledger depend on their issuer's integrity. If you can't count on the stablecoins issuer to redeem your tokens for the real thing on demand, then you shouldn't expect the stablecoin to retain its value. As a user, you should be mindful of who's issuing the tokens: are they reliable, lawful, and solvent? If not, it's probably best not to hold those tokens.</Typography>
            
            <Typography variant='wallet_h2'>Understanding In-Game Tokens: What Are They?</Typography>
            <Typography variant='p1'><Link href="/status/coming-soon" color="primary">Play-to-earn</Link> (P2E) games, also known as <Link href="/status/coming-soon" color="primary">GameFi</Link>, have become an increasingly popular category within the XRP Ledger ecosystem. These games combine <Link href="/status/coming-soon" color="primary">non-fungible tokens</Link> (NFTs), in-game crypto tokens, <Link href="/status/coming-soon" color="primary">decentralized finance</Link> (DeFi) elements, and sometimes even metaverse applications. By investing time and occasionally capital, players can generate revenue through participation in these games.</Typography>
            <Typography variant='p1'>Among the most prominent game tokenization projects on the XRPL is <Link href="https://xrpjunkies.club" color="primary">Junkieverse</Link>. Junkieverse offers a unique gaming experience by blending classic hardcore MMO gameplay with social interaction and blockchain technology. Players can shape their own destinies, explore vast worlds spanning the multiverse, confront unprecedented dangers, gather resources, and craft an arsenal to support their adventures.</Typography>

            <Typography variant='wallet_h2'>Determining the Best Token for Investment</Typography>
            <Typography variant='p1'>XRPL.to does not provide financial or investment advice regarding the suitability of specific tokens, currencies, or assets as investments, nor do we offer guidance on the timing of purchases or sales. Our focus is strictly on data.</Typography>
            <Typography variant='p1'>Keep in mind that the prices, yields, and values of financial assets fluctuate, putting your invested capital at risk. We recommend consulting a professional investment advisor for guidance tailored to your specific circumstances.</Typography>

            <Typography variant='wallet_h2'>Investing in XRPL Tokens? XRPL.to Has You Covered</Typography>
            <Typography variant='p1'>With live updates on XRPL.to, you can monitor the value of your investments and assets anytime and from anywhere globally. We look forward to serving you regularly!</Typography>
                
            <Typography variant='p1'></Typography>
            <Typography variant='wallet_h2'></Typography>

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
    ), [showContent]);

    return (
        <Stack sx={{pt:2}}>
            <Stack direction="row" sx={{mt:1, mb:6}}>
                <ContentTypography variant='subtitle1'>Discover our process by clicking here.</ContentTypography>
                <Link
                    component="button"
                    underline="always"
                    variant="body2"
                    color="#637381"
                    onClick={() => setShowContent(!showContent)}
                >
                    <ContentTypography variant='subtitle1' sx={{ml:1}}>
                        {showContent ? 'Read Less' : 'Read More'}
                    </ContentTypography>
                </Link>
            </Stack>

            {content}
        </Stack>
    );
}
