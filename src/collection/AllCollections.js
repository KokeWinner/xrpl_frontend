import React, { useState, useEffect } from 'react';
import {
    Stack,
    Typography,
    Box,
    Paper,
    Grid,
    IconButton,
    Tooltip,
    Tabs,
    Tab
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import { Line, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, Title, Tooltip as ChartTooltip, Legend } from 'chart.js';
import CollectionList from './CollectionList';
import { CollectionListType } from 'src/utils/constants';
import { withStyles } from '@mui/styles';
import { alpha } from '@mui/material/styles';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    ChartTooltip,
    Legend
);

const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
        legend: {
            position: 'top',
            labels: {
                font: {
                    size: 14,
                },
                color: '#333'
            }
        },
        tooltip: {
            titleFont: { size: 16 },
            bodyFont: { size: 14 },
        }
    },
    scales: {
        x: {
            ticks: {
                font: {
                    size: 12,
                },
                color: '#666'
            }
        },
        y: {
            ticks: {
                font: {
                    size: 12,
                },
                color: '#666'
            }
        }
    }
};

const ContentTypography = withStyles({
    root: {
        color: alpha('#919EAB', 0.99),
        display: 'inline', // Ensure it's displayed inline
        verticalAlign: 'middle' // Align vertically with surrounding text
    }
})(Typography);

const LatestNFTActivity = ({ title, tooltipText, chartData, chartType, amount24h, amount7d, amount30d, amountAll }) => {
    const [tab, setTab] = useState('24h');

    const handleTabChange = (event, newValue) => {
        setTab(newValue);
    };

    let displayedAmount = amount24h;
    switch (tab) {
        case '7d':
            displayedAmount = amount7d;
            break;
        case '30d':
            displayedAmount = amount30d;
            break;
        case 'all':
            displayedAmount = amountAll;
            break;
        default:
            displayedAmount = amount24h;
    }

    return (
        <Paper sx={{ padding: 2, marginBottom: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography variant="h6" sx={{ mb: 1, color: '#444' }}>{title}</Typography>
                    <Tooltip title={tooltipText}>
                        <IconButton size="small" sx={{ ml: 1 }}>
                            <InfoIcon fontSize="small" />
                        </IconButton>
                    </Tooltip>
                </Box>
                <Typography variant="h6" sx={{ mb: 1, color: '#444' }}>{displayedAmount}</Typography>
            </Box>
            <Tabs value={tab} onChange={handleTabChange} aria-label="chart tabs">
                <Tab label="24h" value="24h" />
                <Tab label="7d" value="7d" />
                <Tab label="30d" value="30d" />
                <Tab label="All" value="all" />
            </Tabs>
            <Box sx={{ height: 300 }}>
                {chartType === 'line' ? (
                    <Line data={chartData} options={chartOptions} />
                ) : (
                    <Bar data={chartData} options={chartOptions} />
                )}
            </Box>
        </Paper>
    );
};

export default function Collections() {
    const [marketCap, setMarketCap] = useState(null);
    const [salesVolume, setSalesVolume] = useState(null);
    const [totalSales, setTotalSales] = useState(null);

    useEffect(() => {
        // Simulating data fetch with filler data
        const fetchData = () => {
            const marketCapData = {
                labels: ['08:00 PM', '10:00 PM', '12:00 AM', '02:00 AM', '04:00 AM', '06:00 AM', '08:00 AM'],
                datasets: [{
                    label: 'Market Cap',
                    data: [3000000000, 3200000000, 3100000000, 3300000000, 3400000000, 3200000000, 3000000000],
                    borderColor: 'rgba(75, 192, 192, 1)',
                    backgroundColor: 'rgba(75, 192, 192, 0.2)',
                    tension: 0.4
                }],
            };
            setMarketCap(marketCapData);

            const salesVolumeData = {
                labels: ['08:00 PM', '10:00 PM', '12:00 AM', '02:00 AM', '04:00 AM', '06:00 AM', '08:00 AM'],
                datasets: [
                    {
                        label: 'xrp.cafe',
                        data: [200000, 300000, 250000, 200000, 250000, 350000, 300000],
                        backgroundColor: 'rgba(54, 162, 235, 0.2)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 1,
                        borderRadius: 4,
                        barThickness: 12,
                    },
                    {
                        label: 'onxrp',
                        data: [100000, 200000, 300000, 200000, 300000, 200000, 400000],
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1,
                        borderRadius: 4,
                        barThickness: 12,
                    },
                    {
                        label: 'P2P',
                        data: [200000, 200000, 250000, 200000, 150000, 350000, 100000],
                        backgroundColor: 'rgba(255, 99, 132, 0.2)',
                        borderColor: 'rgba(255, 99, 132, 1)',
                        borderWidth: 1,
                        borderRadius: 4,
                        barThickness: 12,
                    },
                ],
            };
            setSalesVolume(salesVolumeData);

            const totalSalesData = {
                labels: ['08:00 PM', '10:00 PM', '12:00 AM', '02:00 AM', '04:00 AM', '06:00 AM', '08:00 AM'],
                datasets: [
                    {
                        label: 'xrp.cafe',
                        data: [400, 600, 500, 400, 500, 700, 600],
                        backgroundColor: 'rgba(54, 162, 235, 0.2)',
                        borderColor: 'rgba(54, 162, 235, 1)',
                        borderWidth: 1,
                        borderRadius: 4,
                        barThickness: 12,
                    },
                    {
                        label: 'onxrp',
                        data: [200, 400, 600, 400, 600, 400, 800],
                        backgroundColor: 'rgba(75, 192, 192, 0.2)',
                        borderColor: 'rgba(75, 192, 192, 1)',
                        borderWidth: 1,
                        borderRadius: 4,
                        barThickness: 12,
                    },
                    {
                        label: 'P2P',
                        data: [400, 400, 500, 400, 300, 700, 200],
                        backgroundColor: 'rgba(255, 99, 132, 0.2)',
                        borderColor: 'rgba(255, 99, 132, 1)',
                        borderWidth: 1,
                        borderRadius: 4,
                        barThickness: 12,
                    },
                ],
            };
            setTotalSales(totalSalesData);
        };

        fetchData();
    }, []);

    if (!marketCap || !salesVolume || !totalSales) {
        return <div>Loading...</div>;
    }

    return (
        <>
            <Box sx={{ mt: 5 }}>
                <Typography variant="h1" sx={{ mb: 2 }}>Highest Price NFT Stats</Typography>
                <ContentTypography variant="subtitle1" sx={{ mb: 2 }}>
                    Listed below are the stats for NFT collections and individual assets that have sold for the highest prices. We list the data in descending order. Data can <br></br> be reordered by clicking on the column title. Only collections with a transaction in the last 30 days are included.
                </ContentTypography>
                <Box sx={{ mb: 6 }} /> {/* Add this Box component to create space */}
                <Grid container spacing={3}>
                    <Grid item xs={12} md={4}>
                        <LatestNFTActivity 
                            title="Market Cap" 
                            tooltipText="This number indicates the current NFT market cap. The graph shows its movement over the selected time period." 
                            chartData={marketCap} 
                            chartType="line"
                            amount24h="$3,202,679,424.63"
                            amount7d="$20,202,679,424.63"
                            amount30d="$90,202,679,424.63"
                            amountAll="$300,202,679,424.63"
                        />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <LatestNFTActivity 
                            title="Sales Volume (24h)" 
                            tooltipText="The number indicates the total value of NFT transactions over the past 24 hours. The graph shows the sales volume value on an hourly basis." 
                            chartData={salesVolume} 
                            chartType="bar"
                            amount24h="$11,519,888.57"
                            amount7d="$71,519,888.57"
                            amount30d="$211,519,888.57"
                            amountAll="$511,519,888.57"
                        />
                    </Grid>
                    <Grid item xs={12} md={4}>
                        <LatestNFTActivity 
                            title="Total Sales (24h)" 
                            tooltipText="The number indicates the total sales of NFTs in the past 24 hours. The graph shows the sales figures on an hourly basis." 
                            chartData={totalSales} 
                            chartType="bar"
                            amount24h="44,413"
                            amount7d="144,413"
                            amount30d="344,413"
                            amountAll="744,413"
                        />
                    </Grid>
                </Grid>
            </Box>

            <Stack sx={{ mt: 5, minHeight: '50vh' }}>
                <CollectionList type={CollectionListType.ALL} />
            </Stack>
        </>
    );
}
