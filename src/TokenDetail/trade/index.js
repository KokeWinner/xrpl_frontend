
import { useState, useEffect } from 'react';
import useWebSocket from "react-use-websocket";
import {MD5} from "crypto-js";

// Material
import {
    styled,
    Grid,
    Stack
} from '@mui/material';

// Components
import OrderBook from "./OrderBook";
import ExchHistory from './ExchHistory';
import PairsSelect from './PairsSelect';
import TradePanel from './TradePanel';
import BidAskChart from './BidAskChart';
import Account from './account';

// Utils
import Decimal from 'decimal.js';

// ----------------------------------------------------------------------
const StackDexStyle = styled(Stack)(({ theme }) => ({
    width: '100%',
    display: 'inline-block',
    color: '#C4CDD5',
    fontSize: '11px',
    fontWeight: '500',
    lineHeight: '18px',
    // backgroundColor: '#7A0C2E',
    borderRadius: '8px',
    border: `1px solid ${theme.palette.divider}`,
    padding: '0px 12px'
}));

function getXRPPair(issuer, currency) {
    //MD5('undefined_XRP').toString();
    const t1 = 'XRPL_XRP'
    const t2 = issuer  + '_' +  currency;
    let pair = t1 + t2;
    if (t1.localeCompare(t2) > 0)
        pair = t2 + t1;
    return MD5(pair).toString();
}

function getInitPair(token) {
    // const pair = {
    //     "pair": "fa99aff608a10186d3b1ff33b5cd665f",
    //     "curr1": {
    //         "currency": "534F4C4F00000000000000000000000000000000",
    //         "issuer": "rsoLo2S1kiGeCcn6hCUXVrCpGMWLrRrLZz",
    //         "value": 1170095.762918316,
    //         "md5": "0413ca7cfc258dfaf698c02fe304e607",
    //         "name": "SOLO"
    //     },
    //     "curr2": {
    //         "currency": "XRP",
    //         "issuer": "XRPL",
    //         "value": 873555.2630949989,
    //         "md5": "84e5efeb89c4eae8f68188982dc290d8",
    //         "name": "XRP"
    //     },
    //     "count": 2678,
    //     "id": 1
    // }

    const issuer = token.issuer;
    const currency = token.currency;
    const name = token.name;
    const pairMD5 = getXRPPair(issuer, currency);
    const curr1 = {currency, name, issuer, value: 0, ...token};
    const curr2 = {currency:'XRP', issuer: "XRPL", name: 'XRP', value: 0, md5: '84e5efeb89c4eae8f68188982dc290d8'};
    const pair = {id: 1, pair: pairMD5, curr1, curr2, count: 0};

    return pair;
}

const ORDER_TYPE_BIDS = 1;
const ORDER_TYPE_ASKS = 2;

export default function Trade({token}) {
    const WSS_URL = 'wss://ws.xrpl.to';
    const BASE_URL = process.env.API_URL;

    const [pair, setPair] = useState(getInitPair(token));

    const [bids, setBids] = useState([]); // Orderbook Bids
    const [asks, setAsks] = useState([]); // Orderbook Asks

    const [bidId, setBidId] = useState(-1); // Bid click Id
    const [askId, setAskId] = useState(-1); // Ask click Id

    const [clearNewFlag, setClearNewFlag] = useState(false);

    const [wsReady, setWsReady] = useState(false);
    const { sendJsonMessage/*, getWebSocket*/ } = useWebSocket(WSS_URL, {
        onOpen: () => {setWsReady(true);},
        onClose: () => {setWsReady(false);},
        shouldReconnect: (closeEvent) => true,
        onMessage: (event) => processMessages(event)
    });

    useEffect(() => {
        let arr = [];
        if (clearNewFlag) {
            setClearNewFlag(false);
            for (let o of asks) {
                o.isNew = false;
                arr.push(o);
            }
            setAsks(arr);

            arr = [];
            for (let o of bids) {
                o.isNew = false;
                arr.push(o);
            }
            setBids(arr);
        }
    }, [clearNewFlag, asks, bids]);

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

    }, [wsReady, pair, sendJsonMessage]);
    // Orderbook related useEffect - END

    // web socket process messages for orderbook
    const processMessages = (event) => {
        const orderBook = JSON.parse(event.data);

        if (orderBook.hasOwnProperty('result') && orderBook.status === 'success') {
            const req = orderBook.id % 2;
            //console.log(`Received id ${orderBook.id}`)
            if (req === 1) {
                const parsed = formatOrderBook(orderBook.result.offers, ORDER_TYPE_ASKS, asks);
                setAsks(parsed);
            }
            if (req === 0) {
                const parsed = formatOrderBook(orderBook.result.offers, ORDER_TYPE_BIDS, bids);
                setBids(parsed);
                setTimeout(() => {
                    setClearNewFlag(true);
                }, 2000);
            }
        }
    };

    const onBidClick = (e, idx) => {
        setBidId(idx);
    }

    const onAskClick = (e, idx) => {
        setAskId(idx);
    }

    // https://mui.com/system/display/

    return (
        <Grid container spacing={2} sx={{p:0}}>
            <Grid item xs={12} md={12} lg={12} >
                <PairsSelect token={token} pair={pair} setPair={setPair} />
            </Grid>

            <Grid item xs={12} md={9.5} lg={9.5} >
                <Grid container spacing={3} sx={{p:0}}>
                    <Grid item xs={12} md={4} lg={4} sx={{ display: { xs: 'none', sm: 'none', md: 'block' } }}>
                        <ExchHistory pair={pair} md5={token.md5} />
                    </Grid>
                    <Grid item xs={12} md={8} lg={8}>
                        <OrderBook pair={pair} asks={asks} bids={bids} onBidClick={onBidClick} onAskClick={onAskClick}/>
                    </Grid>
                </Grid>
            </Grid>
            
            <Grid item xs={12} md={2.5} lg={2.5}>
                <TradePanel pair={pair} asks={asks} bids={bids} bidId={bidId} askId={askId}/>

                <StackDexStyle spacing={0} sx={{ mt:4, mb:3, pt:2, pb:0, pl:0 }}>
                    <BidAskChart bids={bids} asks={asks} />
                </StackDexStyle>
            </Grid>

            <Grid item xs={12}>
                <Account token={token} pair={pair} />
            </Grid>
        </Grid>
    );
}

const formatOrderBook = (offers, orderType = ORDER_TYPE_BIDS, arrOffers) => {
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

    let mapOldOffers = new Map();
    for (var offer of arrOffers) {
        mapOldOffers.set(offer.id, true);
    }

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

        obj.isNew = !mapOldOffers.has(id)
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

// const round = (value, decimals) => {
//     value = Number(value)
//     if(value < 1) return value.toPrecision(decimals)
//     const integerLength = (value.toFixed(0)).length
//     return value.toPrecision(decimals + integerLength)
//     // return Number(Math.round(value+'e'+decimals)+'e-'+decimals)
// }

// const maxDecimals = (float) => {
//     const value = Math.trunc(float)
//     const length = value.toString().length
//     if(length > 1) {
//         return 2
//     } else {
//         if(value < 1) {
//             return 4
//         } else {
//             return 3
//         }
//     }
// }