import axios from 'axios';
import Decimal from 'decimal.js';
import { useState, useEffect } from 'react';

// Material
import { styled, CardHeader, Stack } from '@mui/material';
import { useTheme } from '@mui/material/styles';

// Chart
import { Chart } from 'src/components/Chart';

// ----------------------------------------------------------------------
import StackStyle from 'src/components/StackStyle';

function getSeries(richList) {
    let series = [];
    let sum = 0;
    for (var l of richList) {
        const holding = new Decimal(l.holding).toFixed(2, Decimal.ROUND_DOWN);
        const percent = new Decimal(holding).toNumber();
        sum = Decimal.add(sum, holding);
        series.push(percent);
    }
    const otherPercent = Decimal.sub(100, sum).toNumber();
    series.push(otherPercent);

    return series;
}

export default function Donut({ token }) {
    const theme = useTheme(); // Access the theme object
    const BASE_URL = process.env.API_URL;
    const [richList, setRichList] = useState([]);

    useEffect(() => {
        function getTop10RichList() {
            axios.get(`${BASE_URL}/richlist/${token.md5}?start=0&limit=10&freeze=false`)
                .then(res => {
                    let ret = res.status === 200 ? res.data : undefined;
                    if (ret) {
                        setRichList(ret.richList);
                    }
                }).catch(err => {
                    console.log("Error on getting richlist!", err);
                }).then(function () {
                    // always executed
                });
        }
        getTop10RichList();
    }, [BASE_URL, token.md5]);

    const state = {
        series: getSeries(richList),
        options: {
            plotOptions: {
                pie: {
                    startAngle: -90,
                    endAngle: 270
                }
            },
            dataLabels: {
                enabled: false
            },
            fill: {
                type: 'solid',
                colors: [
                    '#F8693E', '#F6844E', '#F3A15E', '#F1BD6E', '#EED97E', 
                    '#EAE68E', '#E4E79E', '#D8EAAD', '#CCE5BD', '#BFDFCC', theme.palette.primary.main
                ]
            },
            legend: {
                show: false,
                formatter: function(val, opts) {
                    return val + " - " + opts.w.globals.series[opts.seriesIndex]
                }
            },
            tooltip: {
                enabled: true,
                shared: true,
                intersect: false,
                custom: function({ series, seriesIndex, w }) {
                    const value = series[seriesIndex];
                    const color = w.config.fill.colors[seriesIndex];
                    const pos = seriesIndex + 1;
                    const label = pos === 11 ? 'Others' : pos;
                    return `
                        <div style="padding: 5px; color: ${color};">
                            <span style="font-weight: bold; color: ${color};">${label}</span> - ${value} %
                        </div>
                    `;
                },
                style: {
                    fontSize: '18px'
                }
            },
            responsive: [
                {
                    breakpoint: 380,
                    options: {
                        chart: {
                            width: 200,
                            height: 200
                        },
                        legend: {
                            position: 'bottom'
                        }
                    }
                }
            ]
        }
    };

    return (
        <StackStyle>
            <CardHeader title={`Top 10 Holders`} subheader='' sx={{p:2}} />
            <Stack alignItems='center'>
                <Chart options={state.options} series={state.series} type="donut" width={400} height={400} />
            </Stack>
        </StackStyle>
    );
}
