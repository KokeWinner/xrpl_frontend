// Material
import {
    /*alpha,*/
    useTheme
} from '@mui/material';

// Utils
import { fNumber, fPercent } from 'src/utils/formatNumber';

// ----------------------------------------------------------------------
export default function ChartOptions2(series) {
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
        colors: [
            '#00AB55',
            '#BFDFCC',
            '#F1BD6E',
            '#F8693E',
        ],

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
            x: {
                show: false,
                format: 'MM/dd/yyyy, h:mm:ss TT',
            },
            y: {
                formatter: (y) => {
                    if (typeof y !== 'undefined') {
                        return `${fPercent(y)}%`;
                    }
                    return y;
                },
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
            position: 'bottom',
            horizontalAlign: 'center',
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
                        value: {
                            offsetY: 8,
                            color: theme.palette.text.primary,
                            ...theme.typography.h3
                        },
                        total: {
                            show: true,
                            label: 'Total',
                            color: theme.palette.text.secondary,
                            ...theme.typography.subtitle2
                        }
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
                value: {
                    offsetY: 8,
                    color: theme.palette.text.primary,
                    ...theme.typography.h3
                },
                total: {
                    show: true,
                    label: 'Total',
                    color: theme.palette.text.secondary,
                    ...theme.typography.subtitle2
                }
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
