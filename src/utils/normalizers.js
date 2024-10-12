import Decimal from 'decimal.js';
const ieee754Float = require('./IEEE754Float');

/*module.exports.isHex = string => {
    return /^[0-9A-Fa-f]*$/.test(string);
}*/

function isHex(string) {
	return /^[0-9A-Fa-f]*$/.test(string);
}

module.exports.currencyCodeUTF8ToHexIfUTF8 = currencyCode => {
    if(currencyCode) {
        if(currencyCode.length === 3)
            return currencyCode;
        else if(currencyCode.length === 40 && isHex(currencyCode))
            return currencyCode;
        else
            return Buffer.from(currencyCode, 'utf-8').toString('hex');
    } else {
        return "";
    }
}

module.exports.currencyCodeHexToUTF8Trimmed = currencyCode => {
        if(currencyCode && currencyCode.length === 40 && isHex(currencyCode)) { //remove trailing zeros
        while(currencyCode.endsWith("00")) {
            currencyCode = currencyCode.substring(0, currencyCode.length-2);
        }
    }

    if(currencyCode) {
        if(currencyCode.length > 3 && isHex(currencyCode)) {
            if(currencyCode.startsWith("01"))
                return convertDemurrageToUTF8(currencyCode);
            else
                return Buffer.from(currencyCode, "hex").toString('utf-8').trim();
        } else {
            return currencyCode;
        }
    } else {
        return "";
    }
}

function convertDemurrageToUTF8(demurrageCode) {

    let bytes = Buffer.from(demurrageCode, "hex")
    let code = String.fromCharCode(bytes[1]) + String.fromCharCode(bytes[2]) + String.fromCharCode(bytes[3]);
    let interest_start = (bytes[4] << 24) + (bytes[5] << 16) + (bytes[6] <<  8) + (bytes[7]);
    let interest_period = ieee754Float.fromBytes(bytes.slice(8, 16));
    const year_seconds = 31536000; // By convention, the XRP Ledger's interest/demurrage rules use a fixed number of seconds per year (31536000), which is not adjusted for leap days or leap seconds
    let interest_after_year = precision(Math.pow(Math.E, (interest_start+year_seconds - interest_start) / interest_period), 14);
    let interest = (interest_after_year * 100) - 100;

    return(`${code} (${interest}% pa)`)
}

function precision(num, precision) {
    return +(Math.round(Number(num + 'e+'+precision))  + 'e-'+precision);
}

module.exports.currencyCodeUTF8ToHex = currencyCode => {
    if(currencyCode && currencyCode.length === 40) { //remove trailing zeros
        while(currencyCode.endsWith("00")) {
            currencyCode = currencyCode.substring(0, currencyCode.length-2);
        }
    }
  
    let output;
    if(currencyCode.length > 3)
        output = Buffer.from(currencyCode.trim(), "utf-8").toString("hex");
    else
        output = currencyCode;

    return output;
}

module.exports.getCurrencyCodeForXRPL = currencyCode => {
    let returnString = "";
    if(currencyCode) {
        let currency = currencyCode.trim();

        if(currency && currency.length > 3) {

            if(!isHex(currency))
                currency = Buffer.from(currency, 'utf-8').toString('hex');

            while(currency.length < 40)
                currency+="0";

            returnString = currency.toUpperCase();

        } else {
            returnString = currency;
        }
    }

    return returnString;
}

module.exports.rippleEpocheTimeToUTC = rippleEpocheTime => {
    return (rippleEpocheTime+946684800)*1000;
}

module.exports.utcToRippleEpocheTime = utcTime => {
    return (utcTime/1000)-946684800
}

module.exports.normalizeCurrencyCodeXummImpl = (currencyCode, maxLength = 20) => {
    if (!currencyCode) return '';

    // Native XRP
    if (currencyCode === 'XRP') {
        return currencyCode;
    }

    // IOU claims as XRP which consider as fake XRP
    if (currencyCode.toLowerCase() === 'xrp') {
        return 'FakeXRP';
    }

    // IOU
    // currency code is hex try to decode it
    if (currencyCode.match(/^[A-F0-9]{40}$/)) {
        let decoded = '';

        //check for demurrage
        if(currencyCode.startsWith('01'))
            decoded = convertDemurrageToUTF8(currencyCode);
        // check for XLS15d
        else if (currencyCode.startsWith('02')) {
            try {
                const binary = HexEncoding.toBinary(currencyCode);
                decoded = binary.slice(8).toString('utf-8');
            } catch {
                decoded = HexEncoding.toString(currencyCode);
            }
        } else {
            decoded = HexEncoding.toString(currencyCode);
        }

        if (decoded) {
            // cleanup break lines and null bytes
            const clean = decoded.replace(/\0/g, '').replace(/(\r\n|\n|\r)/gm, ' ');

            // check if decoded contains xrp
            if (clean.toLowerCase().trim() === 'xrp') {
                return 'FakeXRP';
            }
            return clean;
        }

        // if not decoded then return truncated hex value
        return `${currencyCode.slice(0, 4)}...`;
    }

    return currencyCode;
};

/* Hex Encoding  ==================================================================== */
const HexEncoding = {
    toBinary: (hex) => {
        return hex ? Buffer.from(hex, 'hex') : undefined;
    },

    toString: (hex) => {
        return hex ? Buffer.from(hex, 'hex').toString('utf8') : undefined;
    },

    toHex: (text) => {
        return text ? Buffer.from(text).toString('hex') : undefined;
    },

    toUTF8: (hex) => {
        if (!hex) return undefined;

        const buffer = Buffer.from(hex, 'hex');
        const isValid = Buffer.compare(Buffer.from(buffer.toString(), 'utf8'), buffer) === 0;

        if (isValid) {
            return buffer.toString('utf8');
        }
        return hex;
    },
};

module.exports.normalizeAmount = (Amount) => {
    if (!Amount) return {issuer: '', currency: '', amount: ''};

    let issuer = "XRPL";
    let currency = "XRP";
    let amount = "";
    let name = "XRP";
    if (typeof Amount === 'object') {
        issuer = Amount.issuer;
        currency = Amount.currency;
        amount = new Decimal(Amount.value).toNumber();
        name = normalizeCurrencyCodeXummImpl(currency);
    } else {
        amount = new Decimal(Amount).div(1000000).toNumber();
    }
    return {name, issuer, currency, amount};
}