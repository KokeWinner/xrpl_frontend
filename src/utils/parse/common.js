const lodash = require("lodash");

function removeUndefined(obj) {
    return lodash.omitBy(obj, value => value == null)
}

function hexToString(hex) {
    return hex ? Buffer.from(hex, 'hex').toString('utf-8') : undefined
}
  
module.exports = {
    removeUndefined,
    hexToString
}