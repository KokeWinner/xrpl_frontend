import React, { useMemo } from 'react';
// Material UI components
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

// Iconify for icons
import { Icon } from '@iconify/react';
import infoFilled from '@iconify/icons-ep/info-filled';

// Function to format numbers in 'en-US' locale
const formatNumber = (number) => new Intl.NumberFormat('en-US').format(number);

const Spread = ({ bids, asks }) => {
    const { spreadAmount, spreadPercentage } = useMemo(() => {
        const getHighestBid = (bids) => Math.max(...bids.map(bid => bid.price));
        const getLowestAsk = (asks) => Math.min(...asks.map(ask => ask.price));
        const highestBid = getHighestBid(bids);
        const lowestAsk = getLowestAsk(asks);
        const spreadAmount = Math.abs(highestBid - lowestAsk);
        const spreadPercentage = `(${((spreadAmount / highestBid) * 100).toFixed(2)}%)`;
        return { spreadAmount, spreadPercentage };
    }, [bids, asks]);

    return (
        <>
            <Typography variant='subtitle1' sx={{ color: '#9E86FF', ml: 0, mt: 2, mb: 1 }}>
                Spread: {formatNumber(spreadAmount)} {spreadPercentage}
            </Typography>
            <Tooltip title={
                <Typography variant="body2">
                    The bid-ask spread, also known as bid-offer or bid/ask (and buy/sell when referring to a market maker),
                    represents the difference between the quoted prices for an immediate sale (ask) and an immediate purchase (bid)
                    of financial instruments such as stocks, futures contracts, options, or currency pairs.
                    These prices can be quoted by a single market maker or found in a limit order book.
                </Typography>
            }>
                <Icon icon={infoFilled} />
            </Tooltip>
        </>
    );
};

export default React.memo(Spread);
