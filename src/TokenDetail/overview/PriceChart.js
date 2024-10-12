import axios from 'axios';
import { useState, useEffect, useContext } from 'react';
import csvDownload from 'json-to-csv-export';
import createMedianFilter from 'moving-median';
import ShowChartIcon from '@mui/icons-material/ShowChart';
import CandlestickChartIcon from '@mui/icons-material/CandlestickChart';

// Material
import {
  useTheme,
  Grid,
  IconButton,
  Stack,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
  Paper,
  toggleButtonGroupClasses,
  styled
} from '@mui/material';
import DownloadIcon from '@mui/icons-material/Download';

// Context
import { AppContext } from 'src/AppContext';

import { useRouter } from 'next/router';
import { currencySymbols } from 'src/utils/constants';

// import Highcharts from 'highcharts'
import Highcharts from 'highcharts/highstock';
import HighchartsReact from 'highcharts-react-official'
import moment from 'moment';
import { fCurrency5 } from 'src/utils/formatNumber';
// ----------------------------------------------------------------------

const fiatMapping = {
  USD: 'USD',
  EUR: 'EUR',
  JPY: 'JPY',
  CNY: 'CNH',
  XRP: 'XRP',
};

const StyledToggleButtonGroup = styled(ToggleButtonGroup)(({ theme }) => ({
  [`& .${toggleButtonGroupClasses.grouped}`]: {
    margin: theme.spacing(0.5),
    border: 0,
    borderRadius: theme.shape.borderRadius,
    [`&.${toggleButtonGroupClasses.disabled}`]: {
      border: 0,
    },
  },
  [`& .${toggleButtonGroupClasses.middleButton},& .${toggleButtonGroupClasses.lastButton}`]:
  {
    marginLeft: -1,
    borderLeft: '1px solid transparent',
  },
}));

function PriceChart({ token }) {
  const BASE_URL = process.env.API_URL;
  const theme = useTheme();

  const [data, setData] = useState([]);
  const [dataOHLC, setDataOHLC] = useState([]);
  const [chartType, setChartType] = useState(0);

  const [range, setRange] = useState('1D');

  const [minTime, setMinTime] = useState(0);
  const [maxTime, setMaxTime] = useState(0);

  const [mediumValue, setMediumValue] = useState(null);

  const { accountProfile, activeFiatCurrency, darkMode } = useContext(AppContext);
  const isAdmin =
    accountProfile && accountProfile.account && accountProfile.admin;

  const router = useRouter();
  const fromSearch = router.query.fromSearch ? '&fromSearch=1' : '';

  const [chartControls, setChartControls] = useState({
    animationsEnabled: false,
    brushEnabled: true,
    autoScaleYaxis: true,
    selectionEnabled: true,
    selectionFill: theme.palette.chartFill,
    selectionStroke: {
      width: 1,
      dashArray: 3,
      color: theme.palette.divider1,
      opacity: 0.8
    },
    selectionXaxis: {
      min: minTime || 0,
      max: maxTime || 0
    }
  });

  useEffect(() => {
    function getGraph() {
      // https://api.xrpl.to/api/graph/0527842b8550fce65ff44e913a720037?range=1D
      axios
        .get(
          `${BASE_URL}/graph-with-metrics/${token.md5}?range=${range}&vs_currency=${fiatMapping[activeFiatCurrency]}${fromSearch}`
        )
        .then((res) => {
          let ret = res.status === 200 ? res.data : undefined;
          if (ret) {
            const items = ret.history;

            if (items && items.length > 0) {
              setMinTime(items[0][0]);
              setMaxTime(items[items.length - 1][0]);
            }

            setData(items);
          }
        })
        .catch((err) => {
          console.log('Error on getting graph data.', err);
        })
        .then(function () {
          // always executed
        });

      axios
        .get(
          `${BASE_URL}/graph-ohlc-with-metrics/${token.md5}?range=${range}&vs_currency=${fiatMapping[activeFiatCurrency]}${fromSearch}`
        )
        .then((res) => {
          let ret = res.status === 200 ? res.data : undefined;
          if (ret) {
            const items = ret.history;

            if (items && items.length > 0) {
              setMinTime(items[0][0]);
              setMaxTime(items[items.length - 1][0]);
            }

            setDataOHLC(items);
          }
        })
        .catch((err) => {
          console.log('Error on getting graph data.', err);
        })
        .then(function () {
          // always executed
        });
    }

    getGraph();
  }, [range, activeFiatCurrency, token.md5, BASE_URL, fromSearch]);

  let user = token.user;
  if (!user) user = token.name;
  let name = token.name;

  // let options1 = ChartOptions();

  // Object.assign(options1, {
  //   chart: {
  //     id: 'chart2',
  //     animations: { enabled: false },
  //     foreColor: theme.palette.text.primary,
  //     fontFamily: theme.typography.fontFamily,
  //     redrawOnParentResize: true,
  //     toolbar: {
  //       autoSelected: 'pan',
  //       show: false
  //     },
  //     zoom: {
  //       type: 'y',
  //       enabled: true,
  //       autoScaleYaxis: true
  //     }
  //   },

  //   series: [
  //     {
  //       name: 'XRP',
  //       type: 'area',
  //       data: data
  //     },
  //     {
  //       //name: 'XRP',
  //       type: 'line',
  //       data: data
  //     }
  //   ],
  //   stroke: {
  //     width: [0, 2.5]
  //   },
  //   // Grid
  //   grid: {
  //     strokeDashArray: 3,
  //     borderColor: theme.palette.divider
  //   },
  //   colors: [theme.palette.primary.light], // Set the primary color from the theme

  //   // Fill
  //   fill: {
  //     type: 'gradient',
  //     opacity: 1,
  //     gradient: {
  //       inverseColors: false,
  //       type: 'vertical',
  //       shadeIntensity: 0,
  //       opacityFrom: [0.6, 1],
  //       opacityTo: [0.4, 1],
  //       gradientToColors: ['#B72136', '#B72136'],
  //       stops: [50, 70]
  //     }
  //   },
  //   legend: { show: false },

  //   // X Axis
  //   xaxis: {
  //     type: 'datetime',
  //     axisBorder: { show: true },
  //     axisTicks: { show: false }
  //   },
  //   // Y Axis
  //   yaxis: {
  //     show: true,
  //     tickAmount: 6,
  //     labels: {
  //       formatter: function (val, index) {
  //         return fNumber(val);
  //       }
  //     }
  //   },

  //   // Tooltip
  //   tooltip: {
  //     shared: true,
  //     intersect: false,
  //     theme: 'dark',
  //     style: {
  //       fontSize: '16px',
  //       fontFamily: undefined
  //     },
  //     x: {
  //       show: false,
  //       format: 'MM/dd/yyyy, h:mm:ss TT'
  //     },
  //     y: {
  //       formatter: function (
  //         value,
  //         { series, seriesIndex, dataPointIndex, w }
  //       ) {
  //         return `${activeFiatCurrency} ${fCurrency5(value)}`;
  //       },
  //       title: {
  //         formatter: (seriesName) => {
  //           return '';
  //         }
  //       }
  //     },
  //     marker: {
  //       show: true
  //     },
  //     enabledOnSeries: [0]
  //   }
  // });

  useEffect(() => {
    // Update the selectionXaxis when minTime or maxTime change
    setChartControls((prevControls) => ({
      ...prevControls,
      selectionXaxis: {
        min: minTime || 0,
        max: maxTime || 0
      }
    }));
  }, [minTime, maxTime]);
  console.log("data", data)

  // const options2 = {
  //   chart: {
  //     id: 'chart1',
  //     animations: { enabled: chartControls.animationsEnabled },
  //     foreColor: theme.palette.text.disabled,
  //     fontFamily: theme.typography.fontFamily,
  //     brush: {
  //       target: 'chart2',
  //       enabled: chartControls.brushEnabled,
  //       autoScaleYaxis: chartControls.autoScaleYaxis
  //     },
  //     selection: {
  //       enabled: chartControls.selectionEnabled,
  //       fill: {
  //         color: chartControls.selectionFill,
  //         opacity: 0.05
  //       },
  //       stroke: {
  //         width: 1,
  //         dashArray: 3,
  //         color: chartControls.selectionStroke.color,
  //         opacity: chartControls.selectionStroke.opacity
  //       },
  //       xaxis: {
  //         min: chartControls.selectionXaxis.min,
  //         max: chartControls.selectionXaxis.max
  //       }
  //     }
  //   },

  //   series: [
  //     {
  //       name: '',
  //       type: 'area',
  //       data: data
  //     }
  //   ],

  //   colors: ['#008FFB'],
  //   fill: {
  //     type: 'gradient',
  //     gradient: {
  //       type: 'vertical',
  //       opacityFrom: 0.91,
  //       opacityTo: 0.1
  //     }
  //   },

  //   // Grid
  //   grid: {
  //     show: false,
  //     strokeDashArray: 0,
  //     borderColor: theme.palette.divider,
  //     xaxis: {
  //       lines: {
  //         show: false
  //       }
  //     },
  //     yaxis: {
  //       lines: {
  //         show: false
  //       }
  //     }
  //   },

  //   xaxis: {
  //     type: 'datetime',
  //     tooltip: {
  //       enabled: false
  //     }
  //   },
  //   yaxis: {
  //     show: true,
  //     tickAmount: 2,
  //     labels: {
  //       style: {
  //         colors: ['#008FFB00']
  //       },
  //       formatter: function (val, index) {
  //         return fNumber(val);
  //       }
  //     }
  //   }
  // };

  const handleChange = (event, newRange) => {
    if (newRange) setRange(newRange);
  };

  const handleDownloadCSV = (event) => {
    const median1 = createMedianFilter(2);
    const median2 = createMedianFilter(3);
    const csvData = [];
    for (const p of data) {
      const val = p[1];
      const row = {};

      row.original = val;
      row.median1 = median1(val);
      row.median2 = median2(val);
      row.time = p[0];
      csvData.push(row);
    }

    const dataToConvert = {
      data: csvData,
      filename: 'filter_report',
      delimiter: ',',
      headers: ['Original', 'Median_1', 'Median_2', 'Time']
    };
    csvDownload(dataToConvert);
  };

  const handleAfterSetExtremes = (e) => {
    if (e.dataMin && e.dataMax) {
      setMediumValue((e.dataMin + e.dataMax) / 2);
    }
  };

  const options1 = {
    title: {
      text: null // Remove y-axis title
    },
    chart: {
      backgroundColor: "transparent",
      type: "areaspline",
      height: "500px",
      events: {
        render: function () {
          const chart = this;
          const imgUrl = darkMode ? '/logo/xrpl-to-logo-white.svg' : '/logo/xrpl-to-logo-black.svg';
          const imgWidth = "50";
          const imgHeight = "15";

          if (chart.watermark) {
            chart.watermark.destroy();
          }

          const xPos = chart.plotWidth - imgWidth - 10; // 10px margin from right edge
          const yPos = chart.plotHeight - imgHeight - 10; // 10px margin from bottom edge

          // Add watermark as an SVG image
          chart.watermark = chart.renderer.image(imgUrl, xPos, yPos, imgWidth, imgHeight)
            .attr({
              zIndex: 5, // Ensure it's above other elements
              opacity: 0.6, // Adjust the opacity as needed
              width: "100px",
            })
            .add();
        }
      }
    },
    legend: { enabled: false },
    credits: {
      text: ""
    },
    xAxis: {
      type: "datetime",
      crosshair: {
        width: 1,
        dashStyle: "Dot"
      }
    },
    yAxis: {
      title: {
        text: null // Remove y-axis title
      },
      tickAmount: 8,
      tickWidth: 1,
      gridLineColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)', // Grid line color
      events: {
        afterSetExtremes: handleAfterSetExtremes,
        setExtremes() {
          console.log("setExtremes", range)
        }
      },
      plotLines: [{
        width: 1, // Width of the median line
        value: mediumValue, // Set the median value
        dashStyle: "Dot"
      }],
      crosshair: {
        width: 1,
        dashStyle: "Dot"
      }
    },
    plotOptions: {
      areaspline: {
        marker: {
          enabled: false,
        },
        zoneAxis: 'y'
      },
      series: {
        states: {
          inactive: {
            opacity: 1,
          },
        },
        zones: [
          {
            value: mediumValue,
            color: '#ff6968',
            fillColor: {
              linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
              stops: [
                [0, "rgba(255, 0, 0, 0)"],
                [1, "rgba(255, 0, 0, 0.6)"],
              ],
            },
            threshold: Infinity,
          },
          {
            color: '#94caae',
            width: 1,
            fillColor: {
              linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
              stops: [
                [0, "rgba(0, 255, 0, 0.6)"],
                [1, "rgba(0, 255, 0, 0)"],
              ],
            },
          }
        ]
      },
    },
    series: [
      {
        data: data,
        threshold: mediumValue,
        lineWidth: 1.25
      },
    ],
    tooltip: {
      backgroundColor: '#3333338f',
      borderRadius: 5,
      borderWidth: 0,
      style: {
        color: '#FFF',
        fontSize: '16px',
        fontWeight: 'bold'
      },
      formatter: function () {
        return `<div>
          <div style="display: flex; justify-content: space-between; gap: 10px;">
            <span style="font-size: 12px;">${moment(this.x).format("MM/DD/YYYY")}</span>
            <span style="font-size: 12px;">${moment(this.x).format("hh:mm:ss A")}</span>
          </div>
          <p>Price: ${currencySymbols[activeFiatCurrency]} ${fCurrency5(this.y)}</p>
        </div>`
      },
      shared: true,
      split: false,
      useHTML: true
    }
  };

  const options2 = {
    plotOptions: {
      candlestick: {
        color: 'red',
        lineColor: 'red',
        upColor: 'green',
        upLineColor: 'green'
      }
    },
    rangeSelector: {
      selected: 1
    },
    title: {
      text: null
    },
    chart: {
      backgroundColor: "transparent",
      height: "500px",
      events: {
        render: function () {
          const chart = this;
          const imgUrl = darkMode ? '/logo/xrpl-to-logo-white.svg' : '/logo/xrpl-to-logo-black.svg';
          const imgWidth = "50";
          const imgHeight = "15";

          if (chart.watermark) {
            chart.watermark.destroy();
          }

          const xPos = chart.plotWidth - imgWidth - 10; // 10px margin from right edge
          const yPos = chart.plotHeight - imgHeight - 10; // 10px margin from bottom edge

          // Add watermark as an SVG image
          chart.watermark = chart.renderer.image(imgUrl, xPos, yPos, imgWidth, imgHeight)
            .attr({
              zIndex: 5, // Ensure it's above other elements
              opacity: 0.6, // Adjust the opacity as needed
              width: "100px",
            })
            .add();
        }
      }
    },
    legend: { enabled: false },
    credits: {
      enabled: false
    },
    xAxis: {
      type: "datetime",
      crosshair: {
        width: 1,
        dashStyle: "Dot"
      }
    },
    yAxis: {
      crosshair: {
        width: 1,
        dashStyle: "Dot"
      },
      title: {
        text: null // Remove y-axis title
      },
      gridLineColor: darkMode ? 'rgba(255, 255, 255, 0.1)' : 'rgba(0, 0, 0, 0.1)', // Grid line color
    },
    series: [{
      type: 'candlestick',
      name: 'USD to EUR',
      data: dataOHLC
    }],
    tooltip: {
      backgroundColor: '#3333338f',
      borderRadius: 5,
      borderWidth: 0,
      style: {
        color: '#FFF',
        fontSize: '16px',
        fontWeight: 'bold'
      },
      formatter: function () {
        return `<div>
          <div style="display: flex; justify-content: space-between; gap: 10px;">
            <span style="font-size: 12px;">${moment(this.x).format("MM/DD/YYYY")}</span>
            <span style="font-size: 12px;">${moment(this.x).format("hh:mm:ss A")}</span>
          </div>
          <p style="font-size: 11px;">Open: ${fCurrency5(this.point.open)}</p>
          <p style="font-size: 11px;">High: ${fCurrency5(this.point.high)}</p>
          <p style="font-size: 11px;">Low: ${fCurrency5(this.point.low)}</p>
          <p style="font-size: 11px;">Close: ${fCurrency5(this.point.close)}</p>
        </div>`
      },
      shared: true,
      split: false,
      useHTML: true
    }
  };

  return (
    <>
      <Grid container rowSpacing={2} alignItems="center" sx={{ mt: 0 }}>
        <Grid container item xs={12} md={6}>
          <Stack direction="row" spacing={2} alignItems="center">
            <Typography variant="h3">{`${user} ${name} to ${activeFiatCurrency}(${currencySymbols[activeFiatCurrency]}) Chart`}</Typography>
            {isAdmin && range !== 'OHLC' && (
              <IconButton onClick={handleDownloadCSV}>
                <DownloadIcon fontSize="small" />
              </IconButton>
            )}
            <Paper
              elevation={0}
              sx={{
                display: 'flex',
                border: (theme) => `1px solid ${theme.palette.divider}`,
                flexWrap: 'wrap',
              }}
            >
              <StyledToggleButtonGroup
                size="small"
                value={chartType}
                exclusive
                onChange={(e, newType) => setChartType(newType)}
                aria-label="text alignment"
              >
                <ToggleButton value={0} sx={{ pt: 0.25, pb: 0.25 }} aria-label="left aligned">
                  <ShowChartIcon />
                </ToggleButton>
                <ToggleButton value={1} sx={{ pt: 0.25, pb: 0.25 }} aria-label="centered">
                  <CandlestickChartIcon />
                </ToggleButton>
              </StyledToggleButtonGroup>
            </Paper>
          </Stack>
        </Grid>
        <Grid container item xs={12} md={6} justifyContent="flex-end">
          <ToggleButtonGroup
            color="primary"
            value={range}
            exclusive
            onChange={handleChange}
          >
            <ToggleButton sx={{ pt: 0, pb: 0 }} value="1D">
              1D
            </ToggleButton>
            <ToggleButton sx={{ pt: 0, pb: 0 }} value="7D">
              7D
            </ToggleButton>
            <ToggleButton sx={{ pt: 0, pb: 0 }} value="1M">
              1M
            </ToggleButton>
            <ToggleButton sx={{ pt: 0, pb: 0 }} value="3M">
              3M
            </ToggleButton>
            <ToggleButton sx={{ pt: 0, pb: 0 }} value="1Y">
              1Y
            </ToggleButton>
            <ToggleButton sx={{ pt: 0, pb: 0 }} value="ALL">
              ALL
            </ToggleButton>
          </ToggleButtonGroup>
        </Grid>
      </Grid>
      <Stack display={!chartType ? "flex" : "none"}>
        <HighchartsReact
          highcharts={Highcharts}
          options={options1}
          allowChartUpdate={true}
        />
      </Stack>
      <Stack display={chartType ? "flex" : "none"}>
        <HighchartsReact
          highcharts={Highcharts}
          options={options2}
          allowChartUpdate={true}
        />
      </Stack>
      {/* <Box sx={{ p: 0, pb: 0 }} dir="ltr">
        <Chart series={options1.series} options={options1} height={364} />
      </Box>
      <Box sx={{ mt: -5, pb: 1 }} dir="ltr">
        <Chart series={options2.series} options={options2} height={130} />
      </Box> */}
    </>
  );
}

export default PriceChart;