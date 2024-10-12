import axios from 'axios';
import { performance } from 'perf_hooks';
import { useState, useEffect } from 'react';

// Material
import {
    styled,
    Box,
    Container,
    Toolbar
} from '@mui/material';

// Context
import { useContext } from 'react';
import { AppContext } from 'src/AppContext';

// Components
import Topbar from 'src/components/Topbar';
import Header from 'src/components/Header';
import Footer from 'src/components/Footer';
import Account from 'src/account';
import ScrollToTop from 'src/components/ScrollToTop';

const OverviewWrapper = styled(Box)(
    ({ theme }) => `
        // overflow: hidden;
        flex: 1;
`
);

const BannerWrapper = styled('div')(
    ({ theme }) => `
    position: relative;
    max-height: 320px;
    overflow: hidden;
`
);

const BannerImage = styled('img')(
    ({ theme }) => `
    position: absolute;
    top:0;
    left:0;
    bottom:0;
    right:0;
    inset: 0px;
    box-sizing: border-box;
    padding: 0px;
    border: none;
    margin: auto;
    display: block;
    width: 0px; height: 0px;
    min-width: 100%;
    max-width: 100%;
    min-height: 100%;
    max-height: 100%;
    object-fit: cover;
  `
);

export default function Overview({data}) {
    const { darkMode, accountProfile } = useContext(AppContext);

    const [profile, setProfile] = useState(data.profile);
    

    let default_banner = darkMode?'/static/banner_black.webp':'/static/banner_white.webp';

    const bannerImage = profile.banner?`https://s1.xrpl.to/profile/${profile.banner}`:default_banner;

    return (
        <OverviewWrapper>
            <Toolbar id="back-to-top-anchor" />
            <Topbar />
            <Header />

            <BannerWrapper>
                <div style={{
                    height: 0,
                    paddingBottom: '10%',
                }}
                >
                    <BannerImage
                        alt=''
                        src={bannerImage}
                        decoding="async"
                    />
                </div>
            </BannerWrapper>

            <Container maxWidth="xl">
                <Account profile={profile} setProfile={setProfile} tab={data.tab} />
            </Container>

            <ScrollToTop />

            <Footer />

        </OverviewWrapper>
    );
}

export async function getServerSideProps(ctx) {
    const BASE_URL = process.env.API_URL;

    let data = {};
    const params = ctx.params.acct;
    const acct = params[0];
    const tab = params[1];

    try {
        var t1 = performance.now();

        // https://api.xrpl.to/api/account/profile/r22G1hNbxBVapj2zSmvjdXyKcedpSDKsm
        const res = await axios.get(`${BASE_URL}/account/profile/${acct}`);

        data = res.data;

        var t2 = performance.now();
        var dt = (t2 - t1).toFixed(2);

        // console.log(`3. getServerSideProps(profile) account: ${acct} took: ${dt}ms`);
    } catch (e) {
        console.log(e);
    }

    if (!data) data = {};

    if (!data.profile) {
        data.profile = {account: acct};
    }

    if (tab)
        data.tab = tab;

    const {
        account,
        name,
        logo,
        banner,
        description
    } = data.profile;

    const imgUrl = banner?`https://s1.xrpl.to/profile/${banner}`:'https://xrpl.to/static/webp.png';

    let ogp = {};
    ogp.canonical = `https://xrpl.to/account/${account}`;
    ogp.title = name || account;
    ogp.url = `https://xrpl.to/account/${account}`;
    ogp.imgUrl = imgUrl;
    ogp.desc = description?description:'Manage your XRPL account with ease: Create and modify offers, establish trustlines, and gain insights into your account activity on our user-friendly platform.';

    return {
        props: {data, ogp}, // will be passed to the page component as props
    }
}
