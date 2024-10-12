// Material
import {
    useTheme
} from '@mui/material';

// Utils
import { fCurrency5, fNumber, fNumberWithSuffix } from 'src/utils/formatNumber';

// Memoize the formatter functions
const memoizedFNumber = memoize(fNumber);
const memoizedFNumberWithSuffix = memoize(fNumberWithSuffix);
const memoizedFCurrency5 = memoize(fCurrency5);

export default function ChartOptions(series) {
    const theme = useTheme();

    const LABEL_TOTAL = {
        show: true,
        label: 'Total',
        color: theme.palette.text.secondary,
        ...theme.typography.subtitle2
    };

    const LABEL_VALUE = {
        offsetY: 8,
        color: theme.palette.text.primary,
        ...theme.typography.h3
    };

    return {
        chart: {
            id: 'bid-ask-chart',
            animations: { enabled: true },
            foreColor: theme.palette.text.primary,
            fontFamily: theme.typography.fontFamily,
            redrawOnParentResize: true,
            toolbar: {
                autoSelected: 'pan',
                show: false
            },
            zoom: {
                type: 'y',
                enabled: false,
                autoScaleYaxis: false
            }
        },

        series: series,

        // Grid
        grid: {
            strokeDashArray: 2,
            borderColor: theme.palette.divider
        },

        // Colors for BID and ASK
        colors: ['#007B55', '#B72136'],

        

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
        // X Axis
        xaxis: {
            type: 'numeric',
            tickAmount: 1,
            axisBorder: { show: false },
            axisTicks: { show: false },
			labels: { // webxtor adding formatting for the labels
				formatter: memoizedFNumber,
			}
        },
        // Y Axis
        yaxis: {
            show: true,
            tickAmount: 3,
            labels: {
                /**
                * Allows users to apply a custom formatter function to yaxis labels.
                *
                * @param { String } val - The generated value of the y-axis tick
                * @param { index } index of the tick / currently executing iteration in yaxis labels array
                */
                formatter: function(val) {
                    return val > 1000 ? memoizedFNumberWithSuffix(val) : memoizedFNumber(val);
                }
            }
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

        // Tooltip
        tooltip: {
            shared: true,
            intersect: false,
            theme: 'dark',
            x: {
                show: false,
                format: '',
            },
            y: {
                formatter: memoizedFCurrency5,
                title: {
                    formatter: (seriesName) => {
                        return seriesName;
                    }
                }
            },
            marker: {
                show: true,
            },
        },

        // Legend
        legend: {
            show: true,
            fontSize: 13,
            position: 'top',
            horizontalAlign: 'right',
            markers: {
                radius: 12
            },
            fontWeight: 500,
            itemMargin: { horizontal: 12 },
            labels: {
                colors: theme.palette.text.primary
            }
        },

        // plotOptions
        plotOptions: {
            // Bar
            bar: {
                columnWidth: '11%',
                borderRadius: 4
            },
            // Pie + Donut
            pie: {
                donut: {
                    labels: {
                        show: true,
                        value: LABEL_VALUE,
                        total: LABEL_TOTAL
                    }
                }
            },
            // Radialbar
            radialBar: {
                track: {
                    strokeWidth: '100%',
                    background: theme.palette.grey[500_16]
                },
                dataLabels: {
                    value: LABEL_VALUE,
                    total: LABEL_TOTAL
                }
            },
            // Radar
            radar: {
                polygons: {
                    fill: { colors: ['transparent'] },
                    strokeColors: theme.palette.divider,
                    connectorColors: theme.palette.divider
                }
            },
            // polarArea
            polarArea: {
                rings: {
                    strokeColor: theme.palette.divider
                },
                spokes: {
                    connectorColors: theme.palette.divider
                }
            }
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

// Memoization helper function
function memoize(fn) {
    const cache = new Map();
    return function(...args) {
        const key = args.join(',');
        if (cache.has(key)) {
            return cache.get(key);
        }
        const result = fn.apply(this, args);
        cache.set(key, result);
        return result;
    };
}
