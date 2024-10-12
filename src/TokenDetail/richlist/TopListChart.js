import axios from 'axios';
import { useState, useEffect } from 'react';

// Material
import {
    Box,
    Stack,
    ToggleButton,
    ToggleButtonGroup,
    Typography
} from '@mui/material';

// Chart
import { Chart } from 'src/components/Chart';

// Components
import ChartOptions2 from './ChartOptions2';

// Utils
import { fCurrency5, fNumber } from 'src/utils/formatNumber';
// ----------------------------------------------------------------------
function extractGraphData(items) {
    const res1 = [];
    const res2 = [];
    const res3 = [];
    const res4 = [];
    for (var item of items) {
        res1.push([item.time, item.top100]);
        res2.push([item.time, item.top50]);
        res3.push([item.time, item.top20]);
        res4.push([item.time, item.top10]);
    }
    return [res1, res2, res3, res4];
}

export default function TopListChart({ token }) {
    const BASE_URL = process.env.API_URL;

    const [range, setRange] = useState('7D');
    const [graphData1, setGraphData1] = useState([]); // Top 100
    const [graphData2, setGraphData2] = useState([]); // Top 50
    const [graphData3, setGraphData3] = useState([]); // Top 20
    const [graphData4, setGraphData4] = useState([]); // Top 10

    useEffect(() => {
        function getGraph () {
            // https://api.xrpl.to/api/graphrich/c9ac9a6c44763c1bd9ccc6e47572fd26?range=ALL
            // https://api.xrpl.to/api/graphrich/84e5efeb89c4eae8f68188982dc290d8?range=ALL
            axios.get(`${BASE_URL}/graphrich/${token.md5}?range=${range}`)
                .then(res => {
                    let ret = res.status === 200 ? res.data : undefined;
                    if (ret) {
                        const items = ret.history;
                        if (items && items.length > 0) {
                            const len = items.length;
                            const data = extractGraphData(items);
                            setGraphData1(data[0]);
                            setGraphData2(data[1]);
                            setGraphData3(data[2]);
                            setGraphData4(data[3]);
                        } else {
                            setGraphData1([]);
                            setGraphData2([]);
                            setGraphData3([]);
                            setGraphData4([]);
                        }
                    }
                }).catch(err => {
                    console.log("Error on getting graph data.", err);
                }).then(function () {
                    // always executed
                });
        }

        getGraph();

    }, [range]);

    const handleChange = (event, newRange) => {
        if (newRange)
            setRange(newRange);
    };

    const CHART_DATA = [
        {
            name: 'Top 100 Holders',
            type: 'area',
            data: graphData1
        },
        {
            name: 'Top 50 Holders',
            type: 'area',
            data: graphData2
        },
        {
            name: 'Top 20 Holders',
            type: 'area',
            data: graphData3
        },
        {
            name: 'Top 10 Holders',
            type: 'area',
            data: graphData4
        },
    ];

    let options = ChartOptions2(CHART_DATA);

    return (
        <>
            <Stack direction="row" spacing={2} sx={{mt:0}} alignItems="center">
                <Typography variant="h3" sx={{ml:2, mt:0}}>{`Top ${token.name} addresses by balance`}</Typography>
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
                <Chart series={CHART_DATA} options={options} height={364} />
            </Box>
        </>
    );
}
