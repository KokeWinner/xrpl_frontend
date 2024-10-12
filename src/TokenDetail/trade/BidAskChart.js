// Material
import {
    Stack
} from '@mui/material';

// Chart
import { Chart } from 'src/components/Chart';


// Components
import ChartOptions from './ChartOptions';

// Utils
import { fNumber } from 'src/utils/formatNumber';

// ----------------------------------------------------------------------

var triggerFormatting = 0; //adding trimming for very small

function getChartData(offers) {
    let data = [];
    for (var o of offers.slice(0, 30)) {
        data.push([o.price, o.sumAmount]);
        if (!triggerFormatting && o.price < 0.000001 ) {
			triggerFormatting = 1;
		}
    }
    
    return data;
}

export default function BidAskChart({asks, bids}) {
    const CHART_DATA = [
        {
            name: 'BID',
            type: 'area',
            data: getChartData(bids)
        },
        {
            name: 'ASK',
            type: 'area',
            data: getChartData(asks)
        },
    ];

    const CHART_OPTION = ChartOptions(CHART_DATA);
    
    if (triggerFormatting)
		Object.assign(CHART_OPTION, {
			xaxis: {
				type: 'numeric',
				tickAmount: 1,
				axisBorder: { show: false },
				axisTicks: { show: false },
				/* above from ChartOptions */
				labels: { // webxtor too small numbers are shown as 0 fix 
					trim: true,
					/*rotate: -45, //to better fit the screen
					rotateAlways: true,	
					maxHeight: 50,*/
					offsetX: 3,
					formatter: function(val, index) {
						return fNumber(val);
					},
					style: {
						cssClass: 'apexcharts-xaxis-label-infini', // CSS in zMain.css or need to install style-sx
					}
				}
			},
	});
    
    return (
        <Chart series={CHART_DATA} options={CHART_OPTION} height={256} />
    );
}