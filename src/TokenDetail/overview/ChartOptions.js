// Material
import {
    /*alpha,*/
    useTheme,
    Typography
} from '@mui/material';

// Iconify Icons
import { Icon } from '@iconify/react';


// Utils
import { fCurrency5/*, fNumber*/ } from 'src/utils/formatNumber';
// ----------------------------------------------------------------------

export default function ChartOptions() {
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

    const CHART_COLORS = {
        violet: ['#826AF9', '#9E86FF', '#D0AEFF', '#F7D2FF'],
        blue: ['#2D99FF', '#83CFFF', '#A5F3FF', '#CCFAFF'],
        green: ['#2CD9C5', '#60F1C8', '#A4F7CC', '#C0F2DC'],
        yellow: ['#FFE700', '#FFEF5A', '#FFF7AE', '#FFF3D6'],
        red: ['#FF6C40', '#FF8F6D', '#FFBD98', '#FFF2D4']
    };

    const PRIMARY = {
        lighter: '#C8FACD',
        light: '#5BE584',
        main: '#00AB55',
        dark: '#007B55',
        darker: '#005249',
        contrastText: '#fff'
    };

    return {
        // Colors
        colors: [
            PRIMARY.primary,
            CHART_COLORS.yellow[0],
            CHART_COLORS.blue[0],
            CHART_COLORS.violet[0],
            CHART_COLORS.green[0],
            CHART_COLORS.red[0]
        ],

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

        // Legend
        legend: {
            show: true,
            fontSize: 14,
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
