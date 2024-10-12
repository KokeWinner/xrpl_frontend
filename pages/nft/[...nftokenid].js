import axios from 'axios'
import dynamic from 'next/dynamic';

// Material
import {
    Box,
    Container,
    styled,
    Toolbar
} from '@mui/material';

// Utils
import { getNftCoverUrl } from 'src/utils/parse/utils';

// Components
import Topbar from 'src/components/Topbar';
import Header from 'src/components/Header'
import Footer from 'src/components/Footer';
import ScrollToTop from 'src/components/ScrollToTop';
import { useContext } from 'react';
import TokenDetail from 'src/nft';

// const DynamicTokenDetail = dynamic(() => import('src/detail'));
import { AppContext } from "src/AppContext";

const OverviewWrapper = styled(Box)(
    ({ theme }) => `
        // overflow: hidden;
        flex: 1;
`
);

export default function Overview({ nft }) {

    const { darkMode } = useContext(AppContext);

    return (
        <OverviewWrapper>
            <Toolbar id="back-to-top-anchor" />
            <Topbar />
            <Header />

            <Container maxWidth="xl">
                <TokenDetail nft={nft.nft} />
            </Container>

            <ScrollToTop />

            <Footer />

        </OverviewWrapper>
    );
}

export async function getServerSideProps(ctx) {
    const BASE_URL = 'https://api.xrpnft.com/api';

    let data = null;
    try {

        const params = ctx.params.nftokenid;

        const NFTokenID = params[0];

        // Self: true  https://api.xrpnft.com/api/nft/00081388A47691FB124F91B5FF0F5246AED2B5275385689F9494918200001FE8
        // Self: false https://api.xrpnft.com/api/nft/00081388C182B4F213B82CCFA4C6F59AD76F0AFCFBDF04D5048B654B00000070
        const res = await axios.get(`${BASE_URL}/nft/${NFTokenID}`);

        data = res.data;

    } catch (e) {
        console.log(e);
    }
    let ret = {};
    const nft = data?.nft
    if (nft) {
        const {
            NFTokenID,
            meta,
            dfile,
            collection
        } = nft;

        const name = meta?.name || nft.meta?.Name || "No Name";
        const description = meta?.description;
        const cname = collection || "";

        let ogp = {};
        ogp.canonical = `https://xrpnft.com/nft/${NFTokenID}`;
        ogp.title = cname ? `${name} - ${cname}` : `${name}`;
        ogp.url = `https://xrpnft.com/nft/${NFTokenID}`;
        ogp.imgUrl = getNftCoverUrl(nft, '', 'image') || getNftCoverUrl(nft, '', 'animation'); // (NFTokenID, meta, dfile, 48)
        ogp.videoUrl = getNftCoverUrl(nft, '', 'video');
        ogp.desc = description ? description : `XRPL's largest NFT marketplace: Buy, sell, mint with ease. Experience exclusive NFT creation and trade.`;
        ogp.isVideo = meta?.video ? true : false;

        ret = { nft: data, ogp };
    } else {
        return {
            redirect: {
                permanent: false,
                destination: '/404'
            }
        }
    }

    return {
        props: ret, // will be passed to the page component as props
    }
}