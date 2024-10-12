import axios from "axios";
import { useEffect, useState } from "react";
import ReactECharts from 'echarts-for-react';

const LoadChart = ({ url }) => {
    const [chartOption, setChartOption] = useState('');

    useEffect(() => {
        if (url) {
            async function getChart() {
                await axios.get(url).then(res => {
                    const { coodinate, chartColor } = res.data;

                    const option = {
                        tooltip: {},
                        xAxis: {
                            show: false
                        },
                        yAxis: {
                            type: 'value',
                            show: false
                        },
                        series: [{
                            data: coodinate,
                            type: 'line',
                            color: chartColor,
                            showSymbol: false,
                            lineStyle: {
                                width: 1.5
                            },
                            smooth: true
                        }]
                    };

                    setChartOption(option);
                }).catch(err => {
                    console.log(err);
                })
            }

            getChart();
        }
    }, [url]);

    return (
        <>
            {chartOption ? (
                <ReactECharts
                    option={chartOption}
                    style={{ height: 80, width: 210 }} // Updated width here
                    opts={{ renderer: "svg" }}
                />
            ) : ""}
        </>
    );
}

export default LoadChart;
