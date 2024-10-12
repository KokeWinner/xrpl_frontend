import axios from 'axios';
import { performance } from 'perf_hooks';
import { useState, useEffect } from 'react';
import useWebSocket from "react-use-websocket";

// Material
import {
    styled,
    Box,
    Container,
    Stack,
    Toolbar,
    Typography
} from '@mui/material';

// Context
import { useContext } from 'react';
import { AppContext } from 'src/AppContext'

// Utils
import { XRP_TOKEN, USD_TOKEN } from 'src/utils/constants';

// Components
import Logo from 'src/components/Logo';
import Swap from 'src/swap';

import Topbar from 'src/components/Topbar';
import Header from 'src/components/Header';
import Footer from 'src/components/Footer';
import ScrollToTop from 'src/components/ScrollToTop';

const OverviewWrapper = styled(Box)(
    ({ theme }) => `
        // overflow: auto;
        overflow-x: hidden;
        flex: 1;
        min-height: 100vh;
  `
);

const SwapWrapper = styled(Stack) (
    ({ theme }) => `
        display: flex;
        flex-direction: column;
        height: 100%;
        -webkit-box-align: center;
        align-items: center;

        @media (min-width: 0px) {
            -webkit-box-pack: start;
            justify-content: flex-start;
        }

        @media (min-width: 600px) {
            -webkit-box-pack: center;
            justify-content: center;
        }
   `
);

const ContainerWrapper = styled(Stack) (
    ({ theme }) => `
    width: 100%;
    height: 100%;
    display: -webkit-box;
    display: -webkit-flex;
    display: -ms-flexbox;
    display: flex;
    -webkit-flex-direction: column;
    -ms-flex-direction: column;
    flex-direction: column;
  `
);

const DEFAULT_PAIR = {
    curr1: XRP_TOKEN,
    curr2: USD_TOKEN,

}

function Overview({data}) {
    const WSS_URL = 'wss://ws.xrpl.to';

    const { accountProfile, openSnackbar } = useContext(AppContext);

    const tokens = data && data.tokens ? data.tokens : [];

    const [revert, setRevert] = useState(false);
    const [pair, setPair] = useState(DEFAULT_PAIR);

    const [bids, setBids] = useState([]); // Orderbook Bids
    const [asks, setAsks] = useState([]); // Orderbook Asks

    const [wsReady, setWsReady] = useState(false);
    const { sendJsonMessage/*, getWebSocket*/ } = useWebSocket(WSS_URL, {
        onOpen: () => {setWsReady(true);},
        onClose: () => {setWsReady(false);},
        shouldReconnect: (closeEvent) => true,
        onMessage: (event) => processMessages(event)
    });

    // Orderbook related useEffect - Start
    useEffect(() => {
        let reqID = 1;
        function sendRequest() {
            if (!wsReady) return;
            /*{
                "id":17,
                "command":"book_offers",
                "taker_gets":{
                    "currency":"534F4C4F00000000000000000000000000000000",
                    "issuer":"rsoLo2S1kiGeCcn6hCUXVrCpGMWLrRrLZz"
                },
                "taker_pays":{
                    "currency":"XRP"
                },
                "ledger_index":"validated",
                "limit":200
            }

            {
                "id":20,
                "command":"book_offers",
                "taker_gets":{"currency":"XRP"},
                "taker_pays":{
                    "currency":"534F4C4F00000000000000000000000000000000",
                    "issuer":"rsoLo2S1kiGeCcn6hCUXVrCpGMWLrRrLZz"
                },
                "ledger_index":"validated",
                "limit":200
            }*/

            const curr1 = pair.curr1;
            const curr2 = pair.curr2;

            const cmdAsk = {
                id: reqID,
                command: 'book_offers',
                taker_gets: {
                    currency: curr1.currency,
                    issuer: curr1.currency === 'XRP' ? undefined : curr1.issuer
                },
                taker_pays: {
                    currency: curr2.currency,
                    issuer: curr2.currency === 'XRP' ? undefined : curr2.issuer
                },
                ledger_index: 'validated',
                limit: 60
            }
            const cmdBid = {
                id: reqID+1,
                command: 'book_offers',
                taker_gets: {
                    currency: curr2.currency,
                    issuer: curr2.currency === 'XRP' ? undefined : curr2.issuer
                },
                taker_pays: {
                    currency: curr1.currency,
                    issuer: curr1.currency === 'XRP' ? undefined : curr1.issuer
                },
                ledger_index: 'validated',
                limit: 60
            }
            sendJsonMessage(cmdAsk);
            sendJsonMessage(cmdBid);
            reqID += 2;
        }

        sendRequest();

        const timer = setInterval(() => sendRequest(), 4000);

        return () => {
            clearInterval(timer);
        }

    }, [wsReady, pair, revert, sendJsonMessage]);
    // Orderbook related useEffect - END

    // web socket process messages for orderbook
    const processMessages = (event) => {
        const orderBook = JSON.parse(event.data);

        if (orderBook.hasOwnProperty('result') && orderBook.status === 'success') {
            const req = orderBook.id % 2;
            //console.log(`Received id ${orderBook.id}`)
            if (req === 1) {
                const parsed = formatOrderBook(orderBook.result.offers, ORDER_TYPE_ASKS);
                setAsks(parsed);
            }
            if (req === 0) {
                const parsed = formatOrderBook(orderBook.result.offers, ORDER_TYPE_BIDS);
                setBids(parsed);
            }
        }
    };

    return (
        <OverviewWrapper>
            <Toolbar id="back-to-top-anchor" />
            <Topbar />
            <Header />

            <Container maxWidth="sm">
                <Stack
                    direction="row"
                    justifyContent="center"
                    alignItems={{xs: "flex-start", sm: "center"}}
                    sx={{
                        mt: {xs: 4, sm: -10}
                    }}
                    style={{
                        height: '100%',
                        minHeight: '100vh'
                    }}
                >
                    <Swap tokens={tokens} asks={asks} bids={bids} pair={pair} setPair={setPair} revert={revert} setRevert={setRevert} />
                </Stack>
            </Container>

            <Footer />
        </OverviewWrapper>
    );
}

export default Overview;

const ORDER_TYPE_BIDS = 1;
const ORDER_TYPE_ASKS = 2;

const formatOrderBook = (offers, orderType = ORDER_TYPE_BIDS) => {
    // { ASK
    //     "Account": "rsoLoDTcxn9wCEHHBR7enMhzQMThkB2w28",
    //     "BookDirectory": "5C8970D155D65DB8FF49B291D7EFFA4A09F9E8A68D9974B25A1997F7E14CDA39",
    //     "BookNode": "0",
    //     "Expiration": 705140180,
    //     "Flags": 0,
    //     "LedgerEntryType": "Offer",
    //     "OwnerNode": "0",
    //     "PreviousTxnID": "541552841A1ADB8BEA4329DE435F4A9C10C6A0E90626CE1B4AF4D64C8FE26C19",
    //     "PreviousTxnLgrSeq": 71465030,
    //     "Sequence": 67605605,
    //     "TakerGets": {
    //         "currency": "534F4C4F00000000000000000000000000000000",
    //         "issuer": "rsoLo2S1kiGeCcn6hCUXVrCpGMWLrRrLZz",
    //         "value": "124.9311956987916"
    //     },
    //     "TakerPays": "90000000",
    //     "index": "C45796CA3444AB63E507582300662E080E393C40D447C530A435CE8BA86AC6A1",
    //     "owner_funds": "487.6093571004488",
    //     "quality": "720396.5310392889"
    // }

    // { BID
    //     "Account": "rUATLa1awouAR8jS1DwtsXuy8EXCjdktgU",
    //     "BookDirectory": "C73FAC6C294EBA5B9E22A8237AAE80725E85372510A6CA794F04F44BA5C57321",
    //     "BookNode": "0",
    //     "Flags": 131072,
    //     "LedgerEntryType": "Offer",
    //     "OwnerNode": "15",
    //     "PreviousTxnID": "545EB169E174D5BF05F59124B7CCC44BF32BC2DA72A7463459E6CF33121143F0",
    //     "PreviousTxnLgrSeq": 71464668,
    //     "Sequence": 66420966,
    //     "TakerGets": "358550000",
    //     "TakerPays": {
    //         "currency": "534F4C4F00000000000000000000000000000000",
    //         "issuer": "rsoLo2S1kiGeCcn6hCUXVrCpGMWLrRrLZz",
    //         "value": "500"
    //     },
    //     "index": "6857750D3847B6A0D40CCCA1A0FDA609DD54CEECAB088A7A94BD6B65A4834E26",
    //     "owner_funds": "952667088",
    //     "quality": "0.000001394505647747873"
    // }

    if (offers.length < 1) return []

    const getCurrency = offers[0].TakerGets?.currency || 'XRP'
    const payCurrency = offers[0].TakerPays?.currency || 'XRP'
    
    let multiplier = 1
    const isBID = orderType === ORDER_TYPE_BIDS

    // It's the same on each condition?
    if (isBID) {
        if (getCurrency === 'XRP')
            multiplier = 1_000_000
        else if (payCurrency === 'XRP')
            multiplier = 0.000_001
    } else {
        if (getCurrency === 'XRP')
            multiplier = 1_000_000
        else if (payCurrency === 'XRP')
            multiplier = 0.000_001
    }

    // let precision = maxDecimals(isBID ? Math.pow(offers[0].quality * multiplier, -1) : offers[0].quality * multiplier)

    // let index = 0
    const array = []
    let sumAmount = 0;
    let sumValue = 0;

    for (let i = 0; i < offers.length; i++) {
        const offer = offers[i]
        const obj = {
            id: '',
            price: 0,
            amount: 0,
            value: 0,
            sumAmount: 0, // SOLO
            sumValue: 0, // XRP
            avgPrice: 0,
            sumGets: 0,
            sumPays: 0,
            isNew: false
        }

        const id = `${offer.Account}:${offer.Sequence}`;
        const gets = offer.taker_gets_funded || offer.TakerGets;
        const pays = offer.taker_pays_funded || offer.TakerPays;
        // const partial = (offer.taker_gets_funded || offer.taker_pays_funded) ? true: false;

        const takerPays = pays.value || pays;
        const takerGets = gets.value || gets;

        const amount = Number(isBID ? takerPays : takerGets)
        const price = isBID ? Math.pow(offer.quality * multiplier, -1) : offer.quality * multiplier
        const value = amount * price;

        // const quantity = Number(isBID ? (offer.TakerPays?.value || offer.TakerPays) : (offer.TakerGets?.value || offer.TakerGets))
        // const price = round(isBID ? Math.pow(offer.quality * multiplier, -1) : offer.quality * multiplier, precision)

        // if (i === 0) {
        //     obj.price = price
        //     obj.quantity = quantity
        //     obj.total = quantity
        // } else {
        //     if (array[index].price === price) {
        //         array[index].quantity += quantity
        //         array[index].total += quantity
        //         continue
        //     } else {
        //         obj.price = price
        //         obj.quantity = quantity
        //         obj.total = array[index].total + quantity
        //         index++
        //     }
        // }
        sumAmount += amount;
        sumValue += value;
        obj.id = id;
        obj.price = price
        obj.amount = amount // SOLO
        obj.value = value // XRP
        obj.sumAmount = sumAmount
        obj.sumValue = sumValue

        if (sumAmount > 0)
            obj.avgPrice = sumValue / sumAmount
        else
            obj.avgPrice = 0

        //obj.partial = partial

        if (amount > 0)
            array.push(obj)

        // if (i === 0 && isBID)
        //    console.log(offer)

        /*{ BID Offer
            "Account": "rsoLoDTcxn9wCEHHBR7enMhzQMThkB2w28",
            "BookDirectory": "C73FAC6C294EBA5B9E22A8237AAE80725E85372510A6CA794F05DD7327B65E9E",
            "BookNode": "0",
            "Expiration": 705752036,
            "Flags": 0,
            "LedgerEntryType": "Offer",
            "OwnerNode": "0",
            "PreviousTxnID": "8380F74C503D629EE39908E58E702252FE048BFB8FCA3331ED084915EDEB1DDE",
            "PreviousTxnLgrSeq": 71621302,
            "Sequence": 67629249,
            "TakerGets": "90000000",
            "TakerPays": {
                "currency": "534F4C4F00000000000000000000000000000000",
                "issuer": "rsoLo2S1kiGeCcn6hCUXVrCpGMWLrRrLZz",
                "value": "148.5775386714613"
            },
            "index": "862539A8D6773FB25965D788DA7313A11BA2C52535DCA05859149A3A0F8BD565",
            "owner_funds": "524244729",
            "quality": "0.000001650861540794014"
        }*/
    }

    const sortedArrayByPrice = [ ...array ].sort(
        (a, b) => {
            let result = 0;
            if (orderType === ORDER_TYPE_BIDS) {
                result = b.price - a.price;
            } else {
                result = a.price - b.price;
            }
            return result;
        }
    );

    return sortedArrayByPrice;
}

// This function gets called at build time on server-side.
// It may be called again, on a serverless function, if
// revalidation is enabled and a new request comes in
export async function getStaticProps() {
    const BASE_URL = process.env.API_URL;

    // https://api.xrpl.to/api/simple/tokens?start=0&limit=20&sortBy=vol24hxrp&sortType=desc&filter=
    let data = null;
    try {
        var t1 = performance.now();

        const res = await axios.get(`${BASE_URL}/simple/tokens?start=0&limit=100&sortBy=vol24hxrp&sortType=desc&filter=`);

        data = res.data;

        const time = Date.now();
        for (var token of data.tokens) {
            token.bearbull = token.pro24h < 0 ? -1:1;
            token.time = time;
        }

        var t2 = performance.now();
        var dt = (t2 - t1).toFixed(2);

        console.log(`1. getStaticProps tokens: ${data.tokens.length} took: ${dt}ms`);
    } catch (e) {
        console.log(e);
    }
    let ret = {};
    if (data) {
        let ogp = {};

        ogp.canonical = 'https://xrpl.to';
        ogp.title = 'Easily Swap XRP for Any Token on the XRPL.';
        ogp.url = 'https://xrpl.to/';
        ogp.imgUrl = 'https://xrpl.to/static/ogp.webp';
        ogp.desc = 'Effortlessly Exchange Tokens on the XRP Ledger with Our Seamless Swap Tool.';

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
