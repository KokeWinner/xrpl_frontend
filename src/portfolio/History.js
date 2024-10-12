import {
    useTheme,
    Box,
    Typography,
    Paper,
    ToggleButton,
    ToggleButtonGroup,
} from '@mui/material';
import DeFiHistory from './history/DeFi';
import NFTHistory from './history/NFT';
import { useState } from 'react';

const History = ({ account }) => {

    const theme = useTheme();
    const [filter, setFilter] = useState("token");

    const handleFilterChange = (e) => {
        setFilter(e.target.value);
    }

    return (
        <Box sx={{ bgcolor: theme.palette.background.paper, p: 3, borderRadius: 2 }}>
            <Typography sx={{ color: theme.palette.text.primary, mb: 3 }} variant="h5">Historical Trades</Typography>
            <ToggleButtonGroup
                value={filter}
                exclusive
                onChange={(e, newFilter) => newFilter && setFilter(newFilter)}
                sx={{ mb: 3 }}
            >
                <ToggleButton value="token" sx={{ px: 3 }}>Tokens</ToggleButton>
                <ToggleButton value="nft" sx={{ px: 3 }}>NFTs</ToggleButton>
            </ToggleButtonGroup>
            <Paper sx={{
                width: '100%',
                overflow: 'auto',
                maxHeight: "475px",
                color: theme.palette.text.primary,
                bgcolor: theme.palette.background.default,
                boxShadow: 3,
                "&::-webkit-scrollbar": {
                    width: "8px"
                },
                "&::-webkit-scrollbar-thumb": {
                    backgroundColor: theme.palette.primary.main,
                    borderRadius: "4px",
                },
            }}>
                {filter === "token" ? <DeFiHistory account={account} /> : <NFTHistory account={account} />}
            </Paper>
        </Box>
    )
}

export default History;