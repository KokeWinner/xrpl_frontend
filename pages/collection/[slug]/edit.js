import axios from 'axios'
import { useState, useEffect, useRef } from 'react';
import { performance } from 'perf_hooks';

// Material
import {
    styled,
    Box,
    Container,
    Stack,
    Toolbar
} from '@mui/material';

// Context
import { useContext } from 'react';
import { AppContext } from 'src/AppContext';

// Components
import Header from 'src/components/Header';
import Footer from 'src/components/Footer';
import EditCollection from 'src/collection/edit';
import ScrollToTop from 'src/components/ScrollToTop';

const OverviewWrapper = styled(Box)(
    ({ theme }) => `
        // overflow: hidden;
        flex: 1;
`
);

export default function Overview({data}) {
    const BASE_URL = 'https://api.xrpnft.com/api';
    const { darkMode, accountProfile, openSnackbar } = useContext(AppContext);

    const accountLogin = accountProfile?.account;
    const accountToken = accountProfile?.token;

    const [collection, setCollection] = useState(null);

    const slug = data?.collection?.slug;

    useEffect(() => {
        function getCollection() {
            if (!accountLogin || !accountToken) {
                openSnackbar('Please login', 'error');
                return;
            }

            // https://api.xrpnft.com/api/collection/test1
            axios.get(`${BASE_URL}/collection/${slug}?account=${accountLogin}`, {headers: {'x-access-token': accountToken}})
                .then(res => {
                    let ret = res.status === 200 ? res.data : undefined;
                    if (ret) {
                        setCollection(ret.collection);
                    }
                }).catch(err => {
                    console.log("Error on getting a collection!!!", err);
                }).then(function () {
                    // always executed
                });
        }

        if (slug)
            getCollection();

    }, [accountLogin, accountToken, slug]);


    return (
        <OverviewWrapper>
            <Toolbar id="back-to-top-anchor" />

            <Header />

            <Container maxWidth="sm">
                {collection ? (
                    <EditCollection collection={collection}/>
                ):(
                    <Stack sx={{mt:5, minHeight: '50vh'}}/>
                )
                }
            </Container>

            <ScrollToTop />

            <Footer />

        </OverviewWrapper>
    );
}

export async function getServerSideProps(ctx) {
    const BASE_URL = 'http://65.109.54.46/api';

    let data = null;
    try {

        const slug = ctx.params.slug;

        var t1 = performance.now();

        // https://api.xrpnft.com/api/collection/test1
        const res = await axios.get(`${BASE_URL}/collection/${slug}`);

        data = res.data;

        var t2 = performance.now();
        var dt = (t2 - t1).toFixed(2);

        console.log(`4. getServerSideProps(collection/edit) slug: ${slug} took: ${dt}ms`);
    } catch (e) {
        console.log(e);
    }
    let ret = {};
    if (data && data.collection) {
        /*{
            "result": "success",
            "took": "1.02",
            "slug": "collection-1",
            "collection": {
                "_id": "6310c27cf81fe46884ef89ba",
                "account": "rpcmZhxthTeWoLMpro5dfRAsAmwZCrsxGK",
                "name": "collection1",
                "slug": "collection-1",
                "description": "",
                "logoImage": "1662042748001_12e8a38273134f0e87f1039958d5b132.png",
                "featuredImage": "1662042748001_70910cc4c6134845bf84cf262e696d05.png",
                "bannerImage": "1662042748002_b32b442dea454998aa29ab61c8fa0887.jpg",
                "created": 1662042748016,
                "creator": "xrpnft.com",
                "uuid": "bc80f29343bb43f09f73d8e5e290ee4a"
            }
        } */

        const {
            name,
            featuredImage,
            logoImage,
            bannerImage,
            slug,
            uuid,
            description
        } = data.collection;

        let ogp = {};
        ogp.canonical = `https://xrpnft.com/collection/${slug}`;
        ogp.title = `${name} - Collection`;
        ogp.url = `https://xrpnft.com/collection/${slug}`;
        ogp.imgUrl = `https://s1.xrpnft.com/collection/${logoImage}`;
        ogp.desc = description?description:`XRPL's largest NFT marketplace: Buy, sell, mint with ease. Experience exclusive NFT creation and trade.`;

        return {
            props: {data, ogp}, // will be passed to the page component as props
        }
    } else {
        return {
            redirect: {
                permanent: false,
                destination: '/404'
            }
        }
    }
}
