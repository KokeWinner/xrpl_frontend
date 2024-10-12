// Material
import {
    /*alpha,*/
    useTheme
} from '@mui/material';

// Utils
import { fCurrency5, fNumber, fIntNumber } from 'src/utils/formatNumber';

// ----------------------------------------------------------------------
export default function ChartOptions(series) {
    const theme = useTheme();

    return {
        chart: {
            id: 'chart2',
            animations: { enabled: true },
            redrawOnParentResize: true,
            toolbar: {
                autoSelected: 'pan',
                show: false
            },
            zoom: {
                type: 'y',
                enabled: true,
                autoScaleYaxis: true
            }
        },
        series: series,
        // Grid
        grid: {
            strokeDashArray: 3,
            borderColor: theme.palette.divider
        },
        // Colors
        colors: ['#00AB55'],
        // colors: [
        //     '#00AB55',
        //     '#FFE700',
        //     '#2D99FF',
        //     '#826AF9',
        //     '#2CD9C5',
        //     '#FF6C40',
        //     '#B72136'
        // ],

        // Fill
        fill: {
            type: 'gradient',
            opacity: 1,
            gradient: {
                type: 'vertical',
                shadeIntensity: 0,
                opacityFrom: 0.4,
                opacityTo: 0,
                stops: [0, 100]
            },
        },
        // States
        states: {
            hover: {
                filter: {
                    type: 'lighten',
                    value: 0.04
                }
            },
            active: {
                filter: {
                    type: 'darken',
                    value: 0.88
                }
            }
        },

        // Datalabels
        dataLabels: { enabled: false },

        // Stroke
        stroke: {
            width: 2,
            curve: 'smooth',
            lineCap: 'round'
        },

        // Markers
        markers: {
            size: 0,
            strokeColors: theme.palette.background.paper
        },

        // X Axis
        xaxis: {
            type: 'datetime',
            axisBorder: { show: true },
            axisTicks: { show: false }
        },
        // Y Axis
        yaxis: {
            show: true,
            tickAmount: 6,
            labels: {
                /**
                * Allows users to apply a custom formatter function to yaxis labels.
                *
                * @param { String } value - The generated value of the y-axis tick
                * @param { index } index of the tick / currently executing iteration in yaxis labels array
                */
                formatter: function(val, index) {
                    return fNumber(val);
                }
            }
        },

        // Tooltip
        tooltip: {
            shared: true,
            intersect: false,
            theme: 'dark',
            style: {
                fontSize: '14px',
                fontFamily: undefined
            },
            x: {
                show: false,
                format: 'MM/dd/yyyy, h:mm:ss TT',
            },
            y: {
                formatter: (y) => {
                    if (typeof y !== 'undefined') {
                        return `Trustlines: ${fIntNumber(y)}`;
                    }
                    return y;
                },
                title: {
                    formatter: (seriesName) => {
                      return seriesName;
                    }
                }
            },
            /*z: {
                formatter: (z) => {
                    if (typeof z !== 'undefined') {
                        return `Active Addresses: ${fIntNumber(z)}`;
                    }
                    return z;
                },
                title: ''
            },*/
            marker: {
                show: true,
            },
        },

        // plotOptions
        plotOptions: {
            // Bar
            bar: {
                columnWidth: '50%',
                borderRadius: 0
            },
        },

        // Responsive
        responsive: [
            {
                // sm
                breakpoint: theme.breakpoints.values.sm,
                options: {
                    plotOptions: { bar: { columnWidth: '40%' } }
                }
            },
            {
                // md
                breakpoint: theme.breakpoints.values.md,
                options: {
                    plotOptions: { bar: { columnWidth: '32%' } }
                }
            }
        ]
    };
}
