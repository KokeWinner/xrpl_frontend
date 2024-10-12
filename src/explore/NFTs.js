import axios from 'axios';
import React, { useState, useEffect, useContext, useCallback, useMemo } from 'react';
import InfiniteScroll from 'react-infinite-scroll-component';
import { LazyLoadImage } from 'react-lazy-load-image-component';
import debounce from 'lodash.debounce';
import { alpha } from '@mui/material/styles';

// Material
import {
    useTheme,
    useMediaQuery,
    Box,
    Grid,
    IconButton,
    InputAdornment,
    TextField
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import FilterListIcon from '@mui/icons-material/FilterList';

// Loader
import { ClipLoader } from 'react-spinners';

// Components
import NFTCard from './NFTCard';
import FilterDetail from './FilterDetail';
import { AppContext } from 'src/AppContext';

const MemoizedNFTCard = React.memo(NFTCard);

export default function NFTs({ collection }) {
    const BASE_URL = 'https://api.xrpnft.com/api';

    const theme = useTheme();
    const { setDeletingNfts } = useContext(AppContext);

    const [nfts, setNfts] = useState([]);
    const [page, setPage] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [flag, setFlag] = useState(0);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [showFilter, setShowFilter] = useState(false);
    const [filter, setFilter] = useState(0);
    const [subFilter, setSubFilter] = useState(0);
    const [filterAttrs, setFilterAttrs] = useState([]);
    const [sync, setSync] = useState(0);
    const [attrSync, setAttrSync] = useState(0);

    const fetchNfts = useCallback(() => {
        setLoading(true);
        const limit = 32;
        const body = {
            page,
            limit,
            flag,
            cid: collection?.uuid,
            search,
            filter,
            subFilter,
            filterAttrs
        };

        axios
            .post(`${BASE_URL}/nfts`, body)
            .then((res) => {
                const newNfts = res.data.nfts;
                const length = newNfts.length;
                setHasMore(length === limit);
                setNfts((prevNfts) => [...prevNfts, ...newNfts]);
                setDeletingNfts((prevNfts) => [...prevNfts, ...newNfts]);
            })
            .catch((err) => {
                console.log('Error on getting nfts!', err);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [page, flag, search, filter, subFilter, filterAttrs, collection?.uuid, setDeletingNfts]);

    useEffect(() => {
        setNfts([]);
        setDeletingNfts([]);
        setPage(0);
        setHasMore(true);
    }, [flag, search, filter, subFilter, attrSync, filterAttrs, setDeletingNfts]);

    useEffect(() => {
        fetchNfts();
    }, [fetchNfts]);

    const debouncedSearch = useMemo(
        () => debounce((value) => setSearch(value), 300),
        []
    );

    const handleChangeSearch = useCallback((e) => {
        debouncedSearch(e.target.value);
    }, [debouncedSearch]);

    const handleShowFilter = useCallback(() => {
        setShowFilter((prevShow) => !prevShow);
    }, []);

    const handleRemove = useCallback((NFTokenID) => {
        setLoading(true);
        axios
            .delete(`${BASE_URL}/nfts`, {
                data: {
                    issuer: collection?.account,
                    taxon: collection?.taxon,
                    cid: collection?.uuid,
                    idsToDelete: NFTokenID
                }
            })
            .then(() => {
                location.reload();
            })
            .catch((err) => {
                console.log('Error on removing nfts!', err);
            })
            .finally(() => {
                setLoading(false);
            });
    }, [collection]);

    // useMemo to avoid unnecessary re-renders
    const inputProps = useMemo(
        () => ({
            startAdornment: (
                <InputAdornment position="start" sx={{ mr: 0.7 }}>
                    <SearchIcon color="primary" />
                </InputAdornment>
            ),
            endAdornment: (
                <InputAdornment position="end">
                    {loading && <ClipLoader color={theme.palette.primary.main} size={15} />}
                </InputAdornment>
            )
        }),
        [loading, theme.palette.primary.main]
    );

    const loadMore = useCallback(() => {
        setPage((prevPage) => prevPage + 1);
        setSync((prevSync) => prevSync + 1);
    }, []);

    return (
        <Box sx={{ p: 3, backgroundColor: alpha(theme.palette.background.paper, 0.8) }}>
            <Box display="flex" alignItems="center" mb={3}>
                <IconButton 
                    aria-label="filter" 
                    onClick={handleShowFilter}
                    sx={{ 
                        mr: 2, 
                        backgroundColor: theme.palette.primary.main,
                        color: theme.palette.primary.contrastText,
                        '&:hover': {
                            backgroundColor: theme.palette.primary.dark,
                        }
                    }}
                >
                    <FilterListIcon />
                </IconButton>
                <TextField
                    id="textFilter"
                    fullWidth
                    variant="outlined"
                    placeholder="Search by name or attribute"
                    onChange={handleChangeSearch}
                    autoComplete="off"
                    value={search}
                    onFocus={(event) => event.target.select()}
                    onKeyDown={(e) => e.stopPropagation()}
                    InputProps={inputProps}
                    sx={{
                        '& .MuiOutlinedInput-root': {
                            borderRadius: 2,
                            backgroundColor: theme.palette.background.paper,
                            transition: theme.transitions.create(['box-shadow']),
                            '&:hover': {
                                boxShadow: `0 0 0 2px ${alpha(theme.palette.primary.main, 0.2)}`,
                            },
                            '&.Mui-focused': {
                                boxShadow: `0 0 0 2px ${theme.palette.primary.main}`,
                            },
                        },
                    }}
                />
            </Box>
            <Grid container spacing={3} justifyContent="space-between">
                {showFilter && (
                    <Grid item xs={12} md={3} xl={2}>
                        <FilterDetail
                            collection={collection}
                            filter={filter}
                            setFilter={setFilter}
                            subFilter={subFilter}
                            setSubFilter={setSubFilter}
                            setFilterAttrs={setFilterAttrs}
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
                    <InfiniteScroll
                        dataLength={nfts.length}
                        next={loadMore}
                        hasMore={hasMore}
                        scrollThreshold={0.9}
                        loader={
                            <Box display="flex" justifyContent="center" my={4}>
                                <ClipLoader color={theme.palette.primary.main} size={30} />
                            </Box>
                        }
                    >
                        <Grid container spacing={3}>
                            {nfts.map((nft, index) => (
                                <Grid
                                    item
                                    xs={6}
                                    sm={4}
                                    md={3}
                                    lg={2.4}
                                    xl={2}
                                    key={nft.id || index}
                                >
                                    <MemoizedNFTCard
                                        nft={nft}
                                        handleRemove={handleRemove}
                                        imageComponent={
                                            <LazyLoadImage
                                                src={nft.imageUrl}
                                                alt={nft.name}
                                                effect="blur"
                                                width="100%"
                                                height="auto"
                                            />
                                        }
                                    />
                                </Grid>
                            ))}
                        </Grid>
                    </InfiniteScroll>
                </Grid>
            </Grid>
        </Box>
    );
}
