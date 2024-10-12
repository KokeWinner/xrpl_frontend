import axios from 'axios';
import { useState, useEffect } from 'react';

// Material
import {
    Box,
    Stack,
    ToggleButton,
    ToggleButtonGroup,
    Typography,
    useTheme
} from '@mui/material';

// Chart
import { Chart } from 'src/components/Chart';

// Components
import ChartOptions from './ChartOptions';

// ----------------------------------------------------------------------
function extractGraphData(items) {
    // const info = {time, length, top10, top20, top50, top100, active24H};
    const res = [];
    for (var item of items) {
        res.push([item.time, item.length/*, item.active24H*/]);
    }
    return res;
}

export default function RichListChart({ token }) {
    const theme = useTheme();
    const BASE_URL = process.env.API_URL;

    const [range, setRange] = useState('7D');
    const [graphData, setGraphData] = useState([]);

    useEffect(() => {
        function getGraph () {
            // https://api.xrpl.to/api/graphrich/0413ca7cfc258dfaf698c02fe304e607?range=7D
            axios.get(`${BASE_URL}/graphrich/${token.md5}?range=${range}`)
                .then(res => {
                    let ret = res.status === 200 ? res.data : undefined;
                    if (ret) {
                        const items = ret.history;
                        if (items && items.length > 0) {
                            const len = items.length;
                            setGraphData(extractGraphData(items));
                        } else {
                            setGraphData([]);
                        }
                    }
                }).catch(err => {
                    console.log("Error on getting graph data.", err);
                }).then(function () {
                    // always executed
                });
        }

        getGraph();

    }, [range, BASE_URL, token.md5]);

    const handleChange = (event, newRange) => {
        if (newRange)
            setRange(newRange);
    };

    const CHART_DATA1 = [
        {
            name: '',
            type: 'area',
            data: graphData
        }
    ];

    let options1 = ChartOptions(CHART_DATA1);
    options1.colors = [theme.palette.primary.main];  // Set the chart color to the theme's primary color

    return (
        <>
            <Stack direction="row" spacing={2} sx={{mt:0}} alignItems="center">
                <Typography variant="h3" sx={{ml:2, mt:0}}>{`Total Addresses`}</Typography>
                <Box sx={{ flexGrow: 1 }} />
                <ToggleButtonGroup
                    color="primary"
                    value={range}
                    exclusive
                    onChange={handleChange}
                    sx={{pt:2.5,mb:0}}
                >
                    <ToggleButton sx={{pt:0,pb:0}} value="7D">7D</ToggleButton>
                    <ToggleButton sx={{pt:0,pb:0}} value="1M">1M</ToggleButton>
                    <ToggleButton sx={{pt:0,pb:0}} value="3M">3M</ToggleButton>
                    <ToggleButton sx={{pt:0,pb:0}} value="ALL">ALL</ToggleButton>
                </ToggleButtonGroup>
            </Stack>
            <Box sx={{ p: 0, pb: 0 }} dir="ltr">
                <Chart series={CHART_DATA1} options={options1} height={364} />
            </Box>
        </>
    );
}
