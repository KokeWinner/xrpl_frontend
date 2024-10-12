import axios from 'axios';
import { useState, useEffect, useContext } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';

// Material
import {
    useTheme,
    useMediaQuery,
    Box,
    Grid,
    IconButton,
    Typography,
    Container,
    Toolbar,
    styled,
    Stack,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/KeyboardBackspace';

// Components
import Topbar from 'src/components/Topbar';
import Header from 'src/components/Header'
import Footer from 'src/components/Footer';
import ScrollToTop from 'src/components/ScrollToTop';
import NFTCard from 'src/portfolio/NFTCard';
import CollectionCard from 'src/portfolio/CollectionCard';
import FilterDetail from 'src/portfolio/FilterDetail';

// Loader
import { PulseLoader } from "react-spinners";

//Context
import { AppContext } from "src/AppContext";

const OverviewWrapper = styled(Box)(
    ({ theme }) => `
    overflow: hidden;
    flex: 1;
`
);

export default function CollectedCreatedNFTs({ type, account, limit, collection }) {
    const BASE_URL = 'https://api.xrpnft.com/api';

    const { darkMode } = useContext(AppContext);
    const theme = useTheme();
    const fullScreen = useMediaQuery(theme.breakpoints.down('md'));

    const [nfts, setNfts] = useState([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [flag, setFlag] = useState(0);

    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);

    const [showFilter, setShowFilter] = useState(collection ? true : false);
    // const [filter, setFilter] = useState(collection?.imported === 'yes' ? 0 : 4);
    const [filter, setFilter] = useState(0);

    const [subFilter, setSubFilter] = useState('pricexrpasc');

    const [onSaleCount, setOnSaleCount] = useState(0);

    const [sync, setSync] = useState(0);

    const fetchNfts = () => {
        setLoading(true);

        //const limit = 20;

        // const body = { page, limit, flag, cid: collection?.uuid, search, filter, subFilter };

        const body = { type, account, page, limit, search, filter, subFilter, collection };

        axios
            .post(`${BASE_URL}/account/collectedCreated`, body)
            .then((res) => {
                const newNfts = res.data.nfts;
                const length = newNfts.length;
                if (length < limit) {
                    setHasMore(false);
                } else {
                    setHasMore(true);
                }
                if (length > 0) {
                    setNfts([...nfts, ...newNfts]);
                }
            })
            .catch((err) => {
                console.log('Error on getting nfts!', err);
            })
            .then(function () {
                // always executed
                setLoading(false);
            });
    };

    const resetNfts = () => {
        setNfts([]);
        setPage(0);
        setHasMore(true);
    }
    useEffect(() => { // seems like useless, so created resetNfts() to be used in like handleChangeSearch()
        resetNfts(); // doesn't seem to reset anything but keeping
        //setSync(sync + 1); // webxtor: disable duplicate loading on start
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [flag, search, filter, subFilter]);

    useEffect(() => {
        fetchNfts();
    }, [sync, flag, search, filter, subFilter]);

    useEffect(() => {
        if (fullScreen) setShowFilter(false);
    }, [fullScreen]);

    const handleChangeSearch = (e) => {
        resetNfts();
        setSearch(e.target.value);
    };

    const handleShowFilter = (e) => {
        setShowFilter(!showFilter);
    };

    const handleBack = () => {
        window.location.href = `/portfolio`;
    };

    const nftItems = () => (
        <Grid container spacing={1}>
            {nfts.map((nft, index) => (
                <Grid
                    item
                    xs={6}
                    sm={4}
                    md={3}
                    lg={2.4}
                    xl={1.5}
                    key={index}
                >
                    {collection ? (
                        <NFTCard nft={nft} />
                    ) : (
                        <CollectionCard collectionData={nft} type={type} account={account} />
                    )}
                </Grid>
            ))}
        </Grid>
    );

    return (
        <OverviewWrapper>
            <Toolbar id="back-to-top-anchor" />
            <Topbar />
            <Header />
            <Container maxWidth="xl">
                {collection && (
                    <Box display="flex" justifyContent="start" mt={4}>
                        <IconButton onClick={handleBack}>
                            <ArrowBackIcon fontSize="large" />
                            <Typography variant="s3" fontSize="medium">Go back</Typography>
                        </IconButton>
                    </Box>
                )}
                <Grid container spacing={1} justifyContent="space-between" mt={1}>
                    {showFilter && (
                        <Grid item xs={12} md={3} xl={2} pt={0.5}>
                            <FilterDetail
                                onSaleCount={onSaleCount}
                                filter={filter}
                                setFilter={setFilter}
                                subFilter={subFilter}
                                setSubFilter={setSubFilter}
                                setPage={setPage}
                            />
                        </Grid>
                    )}
                    <Grid
                        item
                        xs={12}
                        md={showFilter ? 9 : 12}
                        xl={showFilter ? 10 : 12}
                    >
                        {
                            loading &&
                            <Stack alignItems="center">
                                <PulseLoader color={darkMode ? '#007B55' : '#5569ff'} size={10} />
                            </Stack>
                        }
                        {collection && collection !== '' ? (
                            <InfiniteScroll
                                dataLength={nfts.length}
                                next={() => {
                                    setPage(page + 1);
                                    setSync(sync + 1);
                                }}
                                hasMore={hasMore}
                                scrollThreshold={0.6}
                            >
                                {nftItems()}
                            </InfiniteScroll>
                        ) : nftItems()}
                    </Grid>
                </Grid>
            </Container>

            <ScrollToTop />

            <Footer />
        </OverviewWrapper>
    );
}

export async function getServerSideProps(ctx) {

    let data = {};
    const params = ctx.params.acct;
    const acct = params[0];
    const tab = params[1];

    data.account = acct;
    if (tab) data.tab = tab;

    if (tab?.includes('collection')) {
        data.collection = params[2];
        data.type = tab.replace('collection', '').toLowerCase();
    }

    data.limit = 32;

    return {
        props: data
    }
}