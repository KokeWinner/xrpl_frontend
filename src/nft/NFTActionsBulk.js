import axios from 'axios';
import React, { useEffect, useState, createRef } from "react";

// Material
import {
    Backdrop,
    Button,
    Grid,
    Paper,
    Stack,
    Typography
} from '@mui/material';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import StorefrontIcon from '@mui/icons-material/Storefront';

// Loader
import { PuffLoader } from "react-spinners";
import { ProgressBar, Discuss } from 'react-loader-spinner';

// Utils
import { NFToken } from "src/utils/constants";

// Context
import { useContext } from 'react';
import { AppContext } from 'src/AppContext';

// Components

export default function NFTActionsBulk({ nft }) {
    const BASE_URL = 'https://api.xrpnft.com/api';

    const { accountProfile, openSnackbar } = useContext(AppContext);
    const accountLogin = accountProfile?.account;
    const accountToken = accountProfile?.token;

    const [bought, setBought] = useState(false);
    const [loading, setLoading] = useState(false);

    const [openBuyMint, setOpenBuyMint] = useState(false);

    const [mints, setMints] = useState(0);

    const [xrpBalance, setXrpBalance] = useState(0);

    const [pendingNfts, setPendingNfts] = useState(0);

    const {
        uuid,
        NFTokenID,
        name,
        cid,
        collection,
        flag,
        status,
        destination,
        account,
        minter,
        issuer,
        date,
        meta,
        URI,
        royalty,
        taxon,
        costs
    } = nft;

    useEffect(() => {
        function getMints() {
            if (!accountLogin || !accountToken) {
                openSnackbar('Please login', 'error');
                setMints(0);
                setXrpBalance(0);
                return;
            }

            // https://api.xrpnft.com/api/spin/count?account=rhhh
            axios.get(`${BASE_URL}/spin/count?account=${accountLogin}&cid=${cid}`, { headers: { 'x-access-token': accountToken } })
                .then(res => {
                    let ret = res.status === 200 ? res.data : undefined;
                    if (ret) {
                        // console.log(`Mints: ${ret.mints}`);
                        setMints(ret.mints);
                        setXrpBalance(ret.xrpBalance);
                        setPendingNfts(ret.pendingNfts);
                    }
                }).catch(err => {
                    console.log("Error on getting mint count!!!", err);
                }).then(function () {
                    // always executed
                });
        }
        getMints();
    }, [accountLogin, accountToken]);

    const buyBulkNFT = () => {
        if (loading) return;

        if (!accountLogin || !accountToken) {
            openSnackbar('Please login', 'error');
            return;
        }

        setLoading(true);
        // setNft(null);

        const body = { account: accountLogin, cid, NFTokenID };

        axios.post(`${BASE_URL}/spin/buybulknft`, body, { headers: { 'x-access-token': accountToken } })
            .then(res => {
                let ret = res.status === 200 ? res.data : undefined;
                if (ret) {
                    const status = ret.status;
                    if (status) {
                        openSnackbar('Buy NFT successful!', 'success');
                        window.location.href = `/congrats/buyassets/${NFTokenID}`;
                    } else {
                        openSnackbar(ret.error, 'error');
                    }

                    // setBought(true);
                }
            }).catch(err => {
                console.log("Error on choosing NFT!!!", err);
            }).then(function () {
                // always executed
                setLoading(false);
            });
    }

    return (
        <>
            <Backdrop
                sx={{ color: "#000", zIndex: (theme) => theme.zIndex.drawer + 1 }}
                open={loading}
            >
                <Stack>
                    <Discuss
                        visible={true}
                        height="80"
                        width="80"
                        ariaLabel="comment-loading"
                        wrapperStyle={{}}
                        wrapperClass="comment-wrapper"
                        color="#fff"
                        backgroundColor="#F4442E"
                    />

                    <ProgressBar
                        height="80"
                        width="80"
                        ariaLabel="progress-bar-loading"
                        wrapperStyle={{}}
                        wrapperClass="progress-bar-wrapper"
                        borderColor='#F4442E'
                        barColor='#51E5FF'
                    />
                </Stack>
            </Backdrop>

            <Stack spacing={2} sx={{ mt: 2 }}>
                {/* <Link underline='none' color={'text.primary'}>
                    Name
                </Link> */}
                <Typography variant='subtitle' gutterBottom fontSize={30} overflow='hidden' fontWeight={600}>
                    {name}
                </Typography>
                <Paper sx={{
                    padding: 2,
                }}>
                    <Stack spacing={2}>
                        <Typography variant="p5">You can only buy this NFT with a Mint and there are currently {pendingNfts} NFTs that can be bought with Mints.</Typography>
                        <Typography variant="p5">You currently have <Typography variant="s5" color="#33C2FF">{mints} Mints</Typography> available and <Typography variant="s5" color="#33C2FF">{xrpBalance} XRP</Typography> tokens in your wallet.</Typography>
                        <Stack direction="row" spacing={2}>
                            <Button
                                sx={{ borderRadius: 10 }}
                                disabled={!accountLogin || status != NFToken.SELL_WITH_MINT_BULK}
                                variant='contained'
                                onClick={() => buyBulkNFT()}
                                startIcon={<LocalOfferIcon />}
                            >
                                Buy Now
                            </Button>
                            <Button
                                sx={{ borderRadius: 10 }}
                                variant='outlined'
                                onClick={() => setOpenBuyMint(true)}
                                startIcon={<StorefrontIcon />}
                            >
                                Buy Mints
                            </Button>
                        </Stack>
                    </Stack>
                </Paper>
            </Stack>
        </>
    );

}
