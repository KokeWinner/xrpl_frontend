import React, { useState, useEffect } from "react";
import {
    useTheme,
    Box,
    Container,
    Stack,
    Grid,
    Card,
    CardContent,
    Tabs,
    Tab,
    Chip,
    Avatar,
    Typography,
    Button,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Paper,
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import { Verified as VerifiedIcon } from '@mui/icons-material';
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import styled from '@emotion/styled';
import { getHashIcon } from 'src/utils/extra';
import TrustLines from "./TrustLines";
import Offer from "./Offer";
import { TabContext, TabPanel } from "@mui/lab";
import NFTs from "./NFTs";
import History from "./History";
import { alpha } from '@mui/material/styles';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import Ranks from "./Ranks";
import { activeRankColors, rankGlowEffect } from 'src/components/Chatbox/RankStyles';
import axios from 'axios';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const OverviewWrapper = styled(Box)(({ theme }) => `
    flex: 1;
`);

const Balance = styled("div")(({ theme, sx }) => ({
    fontSize: '20px',
    color: '#fff',
    ...sx
}));

const ButtonSend = styled(Button)(({ theme }) => ({
    backgroundColor: alpha(theme.palette.primary.main, 0.1),
    color: theme.palette.primary.main,
    '&:hover': {
        backgroundColor: alpha(theme.palette.primary.main, 0.2),
    }
}));

const ButtonReceive = styled(Button)(({ theme }) => ({
    backgroundColor: alpha(theme.palette.secondary.main, 0.1),
    color: theme.palette.secondary.main,
    '&:hover': {
        backgroundColor: alpha(theme.palette.secondary.main, 0.2),
    }
}));

const tradesData = [
    { id: 1, type: 'Swap', asset: 'XRP/ETH', amount: '100 XRP', date: '2024-06-01', hash: 'abcdef1234567890' },
    { id: 2, type: 'Buy NFT', asset: 'Dragon NFT', amount: '200 XRP', date: '2024-06-02', hash: '1234567890abcdef' },
    { id: 3, type: 'Swap', asset: 'XRP/BTC', amount: '50 XRP', date: '2024-06-03', hash: '0987654321fedcba' },
    { id: 4, type: 'Buy NFT', asset: 'Space NFT', amount: '150 XRP', date: '2024-06-04', hash: 'fedcba0987654321' },
    { id: 5, type: 'Swap', asset: 'XRP/USDT', amount: '300 XRP', date: '2024-06-05', hash: '0abcdef123456789' }
];

const volumeData = {
    labels: ['Jun 1', 'Jun 8', 'Jun 15', 'Jun 22', 'Jun 29', 'Jul 6', 'Jul 13'],
    datasets: [
        {
            label: 'Portfolio Worth',
            data: [5000, 5200, 5300, 15400, 15500, 15600, 15700],
            fill: false,
            backgroundColor: 'rgba(75,192,192,0.2)',
            borderColor: 'rgba(75,192,192,1)',
            tension: 0.4,
            yAxisID: 'y',
        },
        {
            label: 'Token Volume',
            data: [100, 150, 200, 250, 300, 350, 400],
            fill: false,
            backgroundColor: 'rgba(255,99,132,0.2)',
            borderColor: 'rgba(255,99,132,1)',
            tension: 0.4,
            yAxisID: 'y1',
        },
        {
            label: 'NFT Volume',
            data: [50, 400, 1500, 20, 2500, 300, 350],
            fill: false,
            backgroundColor: 'rgba(153,102,255,0.2)',
            borderColor: 'rgba(153,102,255,1)',
            tension: 0.4,
            yAxisID: 'y1',
        },
    ],
};

export default function Portfolio({ account, limit, collection, type }) {
    const theme = useTheme();
    const [activeRanks, setActiveRanks] = useState({});

    // Fallback value for theme.palette.divider
    const dividerColor = theme?.palette?.divider || '#ccc';

    const [activeTab, setActiveTab] = useState(collection ? "1" : "0");
    const [filter, setFilter] = useState('All');

    const handleChange = (_, newValue) => {
        setActiveTab(newValue);
    };

    const volumeOptions = {
        responsive: true,
        maintainAspectRatio: false, // Add this line
        interaction: {
            mode: 'index',
            intersect: false,
        },
        stacked: false,
        plugins: {
            title: {
                display: true,
                text: 'Portfolio Performance',
                color: theme.palette.text.primary,
            },
            legend: {
                position: 'bottom',
                labels: {
                    color: theme.palette.text.primary,
                },
            },
            tooltip: {
                mode: 'index',
            },
        },
        scales: {
            x: {
                grid: {
                    display: false,
                },
                ticks: {
                    color: theme.palette.text.secondary,
                },
            },
            y: {
                type: 'linear',
                display: true,
                position: 'left',
                title: {
                    display: true,
                    text: 'Portfolio Worth ($)',
                    color: theme.palette.text.secondary,
                },
                ticks: {
                    color: theme.palette.text.secondary,
                    callback: (value) => `$${value.toLocaleString()}`,
                },
            },
            y1: {
                type: 'linear',
                display: true,
                position: 'right',
                title: {
                    display: true,
                    text: 'Volume',
                    color: theme.palette.text.secondary,
                },
                ticks: {
                    color: theme.palette.text.secondary,
                },
                grid: {
                    drawOnChartArea: false,
                },
            },
        },
    };

    const OuterBorderContainer = styled(Box)(({ theme }) => ({
        padding: '16px',
        borderRadius: '10px',
        border: `1px solid ${dividerColor}`,
        marginBottom: '16px',
    }));

    const nftIcons = [
        // Add your icon URLs or paths here
        "/icons/nft1.png",
        "/icons/nft2.png",
        "/icons/nft3.png",
        "/icons/nft4.png",
        "/icons/nft5.png",
        "/icons/nft6.png",
        "/icons/nft7.png",
        "/icons/nft8.png",
        "/icons/nft9.png",
        "/icons/nft10.png",
        "/icons/nft11.png",
        "/icons/nft12.png",
        "/icons/nft13.png",
        "/icons/nft14.png",
        "/icons/nft15.png",
        "/icons/nft16.png"
    ];

    useEffect(() => {
        async function fetchActiveRanks() {
            try {
                const res = await axios.get('http://65.108.136.237:5000/api/fetch-active-ranks');
                setActiveRanks(res.data);
            } catch (error) {
                console.error('Error fetching active ranks:', error);
            }
        }

        fetchActiveRanks();
    }, []);

    return (
        <OverviewWrapper>
            <Container maxWidth="xl" sx={{ mt: 4 }}>
                <Grid container spacing={3}>
                    <Grid item md={4} xs={12}>
                        <OuterBorderContainer>
                            <Stack sx={{ height: "100%", justifyContent: "space-between" }}>
                                <Stack
                                    sx={{
                                        borderRadius: "10px",
                                        p: 2,
                                        color: theme.palette.text.primary,
                                        flex: "1 1 auto",
                                        mb: 2
                                    }}
                                    spacing={2}
                                >
                                    <Box
                                        sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between',
                                            p: 1,
                                            borderRadius: '8px',
                                            border: `1px solid ${dividerColor}`
                                        }}
                                    >
                                        <Chip
                                            avatar={
                                                <Avatar
                                                    src={getHashIcon(account)}
                                                    sx={{
                                                        border: `3px solid ${activeRankColors[activeRanks[account]] || '#808080'}`,
                                                        boxShadow: `0 0 15px ${activeRankColors[activeRanks[account]] || '#808080'}`,
                                                    }}
                                                />
                                            }
                                            label={
                                                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                    {account}
                                                    {activeRanks[account] === 'verified' && (
                                                        <VerifiedIcon
                                                            sx={{
                                                                fontSize: '1.2rem',
                                                                ml: 0.5,
                                                                color: '#1DA1F2', // Twitter blue color for verified icon
                                                            }}
                                                        />
                                                    )}
                                                </Box>
                                            }
                                            sx={{
                                                fontSize: "1rem",
                                                color: activeRankColors[activeRanks[account]] || '#808080',
                                                bgcolor: 'transparent',
                                                '& .MuiChip-label': {
                                                    color: activeRankColors[activeRanks[account]] || '#808080',
                                                },
                                            }}
                                        />
                                    </Box>

                                    <Box sx={{ textAlign: 'center', my: 3 }}>
                                        <Typography sx={{ color: theme.palette.text.secondary, mb: 1 }} variant="h6">Total Balance</Typography>
                                        <Balance sx={{ color: theme.palette.primary.main, mb: 1, fontWeight: 'bold' }}>
                                            215,438.97897 <span style={{ fontSize: '0.8em' }}>XRP</span>
                                        </Balance>
                                        <Typography sx={{ color: theme.palette.success.main, mt: 1 }} variant="h4">$109,325.8132</Typography>
                                    </Box>

                                    <Box sx={{ mt: 2, mb: 3, height: 300 }}> {/* Adjust height as needed */}
                                        <Line data={volumeData} options={volumeOptions} />
                                    </Box>

                                    <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
                                        <ButtonSend variant="contained" fullWidth startIcon={<SwapHorizIcon />}>
                                            Send
                                        </ButtonSend>
                                        <ButtonReceive variant="contained" fullWidth startIcon={<AccountBalanceWalletIcon />}>
                                            Receive
                                        </ButtonReceive>
                                    </Stack>

                                    <Box sx={{ mt: 2 }}>
                                        <Grid container spacing={0} sx={{ maxWidth: 400 }}>
                                            {nftIcons.map((icon, index) => (
                                                <Grid item key={index} sx={{ p: '4px', flexBasis: '10%', maxWidth: '10%' }}>
                                                    <Avatar src={icon} variant="rounded" sx={{ width: 28, height: 28 }} />
                                                </Grid>
                                            ))}
                                        </Grid>
                                    </Box>
                                </Stack>

                                <Accordion
                                    sx={{
                                        borderRadius: "10px",
                                        '&.Mui-expanded': {
                                            mt: 3
                                        },
                                        flex: "0 0 auto",
                                        color: theme.palette.text.primary,
                                        border: `1px solid ${dividerColor}`
                                    }}
                                >
                                    <AccordionSummary
                                        expandIcon={<ExpandMoreIcon sx={{ color: theme.palette.text.primary }} />}
                                        aria-controls="panel1d-content" id="panel1d-header"
                                        sx={{ fontWeight: "bold", color: theme.palette.text.primary }}
                                    >
                                        WatchList
                                    </AccordionSummary>
                                    <AccordionDetails sx={{ color: theme.palette.text.primary }}>

                                    </AccordionDetails>
                                </Accordion>

                                <Offer account={account} />
                            </Stack>
                        </OuterBorderContainer>
                    </Grid>

                    <Grid item md={8} xs={12}>
                        <Grid container spacing={3}>
                            <Grid item xs={4}>
                                <Card elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                    <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                        <Typography sx={{ color: theme.palette.text.secondary }} variant="subtitle2">1W PnL Beta</Typography>
                                        <Box sx={{ mt: 2, display: 'flex', alignItems: 'center' }}>
                                            <TrendingUpIcon sx={{ color: theme.palette.success.main, mr: 1 }} />
                                            <Typography sx={{ color: theme.palette.success.main, fontWeight: 'bold' }} variant="h5">+$7,436.57</Typography>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={4}>
                                <Card elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                    <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                        <Typography sx={{ color: theme.palette.text.secondary }} variant="subtitle2">1W Volume</Typography>
                                        <Box sx={{ mt: 2 }}>
                                            <Typography sx={{ color: theme.palette.text.primary, fontWeight: 'bold' }} variant="h5">$304,889.84</Typography>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                            <Grid item xs={4}>
                                <Card elevation={3} sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                                    <CardContent sx={{ flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                                        <Typography sx={{ color: theme.palette.text.secondary }} variant="subtitle2">1W Trades</Typography>
                                        <Box sx={{ mt: 2 }}>
                                            <Typography sx={{ color: theme.palette.text.primary, fontWeight: 'bold' }} variant="h5">126</Typography>
                                        </Box>
                                    </CardContent>
                                </Card>
                            </Grid>
                        </Grid>

                        <Card sx={{ flex: 1, mt: 3, mb: 2, color: theme.palette.text.primary }}>
                            <CardContent sx={{ px: 0 }}>
                                <TabContext value={activeTab}>
                                    <Box>
                                        <Tabs value={activeTab} onChange={handleChange} aria-label="wrapped label tabs example">
                                            <Tab label="Tokens" value="0" />
                                            <Tab label="NFTs" value="1" />
                                            <Tab label="Ranks" value="2" />
                                        </Tabs>
                                    </Box>

                                    <TabPanel sx={{ p: 0 }} value="0">
                                        <Paper sx={{ width: '100%', overflow: 'hidden', color: theme.palette.text.primary }}>
                                            <TrustLines account={account} />
                                            {/* <Table>
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell sx={{ color: theme.palette.text.primary }}>Asset</TableCell>
                                                        <TableCell sx={{ color: theme.palette.text.primary }}>Amount</TableCell>
                                                        <TableCell sx={{ color: theme.palette.text.primary }}>Estimated Value</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    <TableRow>
                                                        <TableCell sx={{ color: theme.palette.text.primary, width: '160%' }} colSpan={4}>
                                                            <TrustLines account={account} />
                                                        </TableCell>
                                                    </TableRow>
                                                </TableBody>
                                            </Table> */}
                                        </Paper>
                                    </TabPanel>
                                    <TabPanel sx={{ p: 0 }} value="1">
                                        <Paper sx={{ width: '100%', overflow: 'hidden', color: theme.palette.text.primary }}>
                                            <Table>
                                                <TableHead>
                                                    <TableRow>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    <TableRow>
                                                        <TableCell sx={{ width: '100%' }} colSpan={4}>
                                                            <NFTs account={account} limit={limit} collection={collection} type={type} />
                                                        </TableCell>
                                                    </TableRow>
                                                </TableBody>
                                            </Table>
                                        </Paper>
                                    </TabPanel>
                                    <TabPanel sx={{ p: 0 }} value="2">
                                        <Ranks profileAccount={account}/>
                                    </TabPanel>
                                </TabContext>
                            </CardContent>
                        </Card>
                        <History account={account}/>
                    </Grid>
                </Grid>
            </Container>
        </OverviewWrapper>
    );
}
