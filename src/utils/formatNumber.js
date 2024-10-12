import BigNumber from 'bignumber.js'; // maybe change to smaller big.js+toFormat from the same family
import Decimal from 'decimal.js';

export function fNumber(num, flag = false) {
  //console.log('fNumber... ', num);
  if (!num) return 0;

  const strNum = num.toString().trim();
  const intNum = num - (num % 1);

  if (strNum.includes('e')) {
    if (num < 1) {
      return trimDecimal(num); //webxtor: no more exponential
    }

    if (flag)
      return trimDecimal(BigNumber(strNum).toFixed());
    else {
      const splitNum = strNum.split("e");
      const result = <span>{Number(splitNum[0]).toFixed(2)} x 10<sup>{Number(splitNum[1])}</sup></span>;
      return result;
    }

    // // Seems like never used at e is always with <1 so far, probably pass to currency (now with trimDecimal)
  }
  return fCurrency5(num);
}

export function fNumberWithCurreny(num, exchRate) {

  if(!num || !exchRate) return 0

  return fCurrency5(Decimal.div(num,exchRate).toNumber());
}

// Trims x numbers after zeroes, ie from 456.000000000027213246546 to 456.00000000002721 when the threshold is 4
// TODO: Make round, not trim
const trimDecimal = (num, threshold = 4) => {
  // former f, fp
  //console.log('trimDecimal-ninit', num, typeof num, isNaN(num));
  num = typeof num == 'string' ? num : num.toString();
  //console.log('trimDecimal-string', num, typeof num);
  num = num.includes('e') ? BigNumber(num).toFixed() : num;
  //console.log('trimDecimal', num, typeof num);
  let match = num.match(new RegExp(`^[^.]+\.[0]*[1-9][0-9]{${threshold - 1}}`)); // TODO: Make round, not trim
  //console.log('match', match);
  let ret = match ? match[0] : num;
  //console.log('trimDecimal--', ret);
  return ret;
};

export function fIntNumber(number) {
  return BigNumber(number).toFormat(0); //former numeral()
}

export function fCurrency(number) {
  return BigNumber(number).toFormat(Number.isInteger(number) ? 0 : 2); //former numeral()
}

export function fCurrency3(number) {
  // option: Intl.NumberFormat but up to 20 minimumFractionDigits
  return BigNumber(number).toFormat(Number.isInteger(number) ? 0 : 3); //former numeral()
}

export function fCurrency5(number) {
  if (number < 1) return trimDecimal(number); //f(number);
  else {
    const res = BigNumber(number).toFormat(Number.isInteger(number) ? 0 : 2); //former numeral()
    if (res === 'NaN') return 0; // not sure about BigNumber's NaN
    return res;
  }
}

export function fPercent(number) {
  if (number < 1) return trimDecimal(number, 2);
  //number.toFixed(2); //webxtor: as in other places//fp(number);
  else {
    const res = BigNumber(number).toFormat(Number.isInteger(number) ? 0 : 1); //former numeral() // Maybe change to 2 for percents?
    if (res === 'NaN') return 0; // not sure about BigNumber's NaN
    return res;
  }
}

export function fNumberWithSuffix(number) {
  let suffix = '';
  let formattedNumber = '';

  if (typeof number === 'number' && !isNaN(number)) {
    if (Math.abs(number) >= 1e12) {
      // Trillion
      suffix = 'T';
      formattedNumber = (number / 1e12).toFixed(0); //toFixed(2);
    } else if (Math.abs(number) >= 1e9) {
      // Billion
      suffix = 'B';
      formattedNumber = (number / 1e9).toFixed(0); //toFixed(2);
    } else if (Math.abs(number) >= 1e6) {
      // Million
      suffix = 'M';
      formattedNumber = (number / 1e6).toFixed(0); //toFixed(2);
    } else if (Math.abs(number) >= 1e3) {
      // Thousand
      suffix = 'K';
      formattedNumber = (number / 1e3).toFixed(0); //toFixed(2);
    } else {
      // Less than 1000
      formattedNumber = number.toFixed(0); //toFixed(2);
    }
    /**/
  } else {
    // Handle the case when 'number' is not a valid number
    formattedNumber = number; //'0';
  } /**/

  return formattedNumber + suffix;
}

export function fVolume(vol) {
  let volume = new Decimal(vol).toNumber();
  if (volume > 1) {
      volume = new Decimal(volume).toDP(0, Decimal.ROUND_DOWN).toNumber();
      if (volume > 1000000) {
          volume = new Decimal(volume).div(1000000).toDP(2, Decimal.ROUND_DOWN).toString() + "M";
      } else if (volume > 1000) {
          volume = new Decimal(volume).div(1000).toDP(2, Decimal.ROUND_DOWN).toString() + "K";
      } else {
          volume = fIntNumber(volume);
      }
  } else {
      volume = fNumber(volume);
  }
  return volume;
}


// ----------------------------------------------------------------------
/*function processBigNumber(number, language, currency = undefined) {
    const { num, unit } = formatLargeNumber(Number(number), 2);
    let numberString = unit ? `${num} ${unit}` : `${num}`;
    if (number.toString().includes('e')) {
        numberString = Number(number)
            .toExponential(2)
            .toString();
    }
    if (currency)
        return `${getLocalizedCurrencySymbol(language, currency)} ${numberString}`;
    return numberString;
}* /
export function limitNumber(number) { // seems like NOT USED!
        const res = numeral(number).format(Number.isInteger(number) ? '0,0' : '0,0.00');
        if (res === 'NaN')
            return 0;
        return number;
}
export function fData(number) { // seems like NOT USED!
    return numeral(number).format('0.0 b');
}*/

//module.exports = { Number, ...module.exports } // Not detected by graph visualiser
