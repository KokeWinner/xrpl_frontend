import { Tooltip } from '@mui/material';
// Utils
import { fNumber } from 'src/utils/formatNumber';

export default function NumberTooltip({ number, prepend = '', append = '', pos = 'top' }) {
    let numberTrim = number;
    if (numberTrim < 1 && numberTrim.toString().length > 10 && !numberTrim.toString().includes('e')) {
        numberTrim = fNumber(number);
        if (numberTrim < 1 && numberTrim.toString().length > 10) {
            //console.log('NumberTooltip', number);
            numberTrim = '0.0...' + number.toString().slice(-4);
        }
    } else if(numberTrim > 1 && numberTrim.toString().split('.')[0].length > 10 && !numberTrim.toString().includes('e')) {
        let numberString = number.toString();
        numberTrim = numberString.slice(0, 2) + '...' + numberString.slice(-4);
    } else {
        if (!number.toString().match(/,/)) {
            number = fNumber(number);
        }
        return prepend + " " + number + append; // if small enough return untrimmed
    }
    return (
        <Tooltip title={prepend + fNumber(number) + append} placement={pos} arrow>
            <span>{prepend}{numberTrim}{append}</span>
        </Tooltip>
    );
}
