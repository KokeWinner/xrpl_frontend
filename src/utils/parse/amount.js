const { dropsToXrp, normalizeCurrencyCode } = require('./utils');

function parseAmount(amount) {
    if (typeof amount === 'string') {
        return {
            issuer: 'XRPL',
            currency: 'XRP',
            name: 'XRP',
            value: dropsToXrp(amount)
        }
    }
    return {
        issuer: amount.issuer,
        currency: amount.currency,
        name: normalizeCurrencyCode(amount.currency),
        value: amount.value,
    }
}

module.exports = {
    parseAmount
}
