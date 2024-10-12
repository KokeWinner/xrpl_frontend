import Decimal from "decimal.js";
import { encodeAccountID } from 'ripple-address-codec';

const lodash = require("lodash");
const BigNumber = require('bignumber.js');
const {deriveKeypair} = require('ripple-keypairs');
const {xAddressToClassicAddress} = require('ripple-address-codec');

const txFlags = require('./txflags');

const dropsInXRP = 1000000;

// https://xrpl.org/accounts.html#special-addresses
const BLACKHOLE_ACCOUNTS = [
  "rrrrrrrrrrrrrrrrrrrrrhoLvTp",
  "rrrrrrrrrrrrrrrrrrrrBZbvji",
  "rrrrrrrrrrrrrrrrrNAMEtxvNvQ",
  "rrrrrrrrrrrrrrrrrrrn5RM1rHd",
];

function adjustQualityForXRP(
    quality,
    takerGetsCurrency,
    takerPaysCurrency
) {
    // quality = takerPays.value/takerGets.value
    // using drops (1e-6 XRP) for XRP values
    const numeratorShift = takerPaysCurrency === 'XRP' ? -6 : 0
    const denominatorShift = takerGetsCurrency === 'XRP' ? -6 : 0
    const shift = numeratorShift - denominatorShift
    return shift === 0
        ? quality
        : new BigNumber(quality).shiftedBy(shift).toString()
}

function parseQuality(quality) {
    if (typeof quality !== 'number') {
        return undefined
    }
    return new BigNumber(quality).shiftedBy(-9).toNumber()
}

function parseTimestamp(rippleTime) {
    if (typeof rippleTime !== 'number') {
        return undefined
    }
    return rippleTimeToISO8601(rippleTime)
}

function isPartialPayment(tx) {
    // tslint:disable-next-line:no-bitwise
    return (tx.Flags & txFlags.Payment.PartialPayment) !== 0
}

function hexToString(hex) {
    return hex ? Buffer.from(hex, 'hex').toString('utf-8') : undefined
}

function isValidSecret(secret) {
    try {
        deriveKeypair(secret)
        return true
    } catch (err) {
        return false
    }
}

function dropsToXrp(drops) {
    if (typeof drops === 'string') {
        if (!drops.match(/^-?[0-9]*\.?[0-9]*$/)) {
            console.error(
                `dropsToXrp: invalid value '${drops}',` +
                ` should be a number matching (^-?[0-9]*\\.?[0-9]*$).`
            )
        } else if (drops === '.') {
            console.error(
                `dropsToXrp: invalid value '${drops}',` +
                ` should be a BigNumber or string-encoded number.`
            )
        }
    }

    // Converting to BigNumber and then back to string should remove any
    // decimal point followed by zeros, e.g. '1.00'.
    // Important: specify base 10 to avoid exponential notation, e.g. '1e-7'.
    drops = new BigNumber(drops).toString(10)

    // drops are only whole units
    if (drops.includes('.')) {
        console.error(
            `dropsToXrp: value '${drops}' has` + ` too many decimal places.`
        )
    }

    // This should never happen; the value has already been
    // validated above. This just ensures BigNumber did not do
    // something unexpected.
    if (!drops.match(/^-?[0-9]+$/)) {
        console.error(
            `dropsToXrp: failed sanity check -` +
            ` value '${drops}',` +
            ` does not match (^-?[0-9]+$).`
        )
    }

    return new BigNumber(drops).dividedBy(1000000.0).toString(10)
}

function xrpToDrops(xrp) {
    if (typeof xrp === 'string') {
        if (!xrp.match(/^-?[0-9]*\.?[0-9]*$/)) {
            console.error(
                `xrpToDrops: invalid value '${xrp}',` +
                ` should be a number matching (^-?[0-9]*\\.?[0-9]*$).`
            )
        } else if (xrp === '.') {
            console.error(
                `xrpToDrops: invalid value '${xrp}',` +
                ` should be a BigNumber or string-encoded number.`
            )
        }
    }

    // Important: specify base 10 to avoid exponential notation, e.g. '1e-7'.
    xrp = new BigNumber(xrp).toString(10)

    // This should never happen; the value has already been
    // validated above. This just ensures BigNumber did not do
    // something unexpected.
    if (!xrp.match(/^-?[0-9.]+$/)) {
        console.error(
            `xrpToDrops: failed sanity check -` +
            ` value '${xrp}',` +
            ` does not match (^-?[0-9.]+$).`
        )
    }

    const components = xrp.split('.')
    if (components.length > 2) {
        console.error(
          `xrpToDrops: failed sanity check -` +
            ` value '${xrp}' has` +
            ` too many decimal points.`
        )
    }

    const fraction = components[1] || '0'
    if (fraction.length > 6) {
        console.error(
            `xrpToDrops: value '${xrp}' has` + ` too many decimal places.`
        )
    }

    return new BigNumber(xrp)
      .times(1000000.0)
      .integerValue(BigNumber.ROUND_FLOOR)
      .toString(10)
}

function toRippledAmount(amount) {
    if (typeof amount === 'string')
        return amount;

    if (amount.currency === 'XRP') {
        return xrpToDrops(amount.value)
    }
    if (amount.currency === 'drops') {
        return amount.value
    }

    let issuer = amount.counterparty || amount.issuer
    let tag = false;

    try {
        ({classicAddress: issuer, tag} = xAddressToClassicAddress(issuer))
    } catch (e) { /* not an X-address */ }
    
    if (tag !== false) {
        console.error("Issuer X-address includes a tag")
    }

    return {
        currency: amount.currency,
        issuer,
        value: amount.value
    }
}

function removeUndefined(obj) {
    return lodash.omitBy(obj, value => value == null)
}

/**
 * @param {Number} rpepoch (seconds since 1/1/2000 GMT)
 * @return {Number} s since unix epoch
 */
function rippleToUnixTime(rpepoch) {
    return (rpepoch + 0x386d4380);
}

/**
 * @param {Number} rpepoch (seconds since 1/1/2000 GMT)
 * @return {Number} ms since unix epoch
 */
function rippleToUnixTimestamp(rpepoch) {
    return rippleToUnixTime(rpepoch) * 1000;
}

/**
 * @param {Number|Date} timestamp (ms since unix epoch)
 * @return {Number} seconds since ripple epoch (1/1/2000 GMT)
 */
function unixToRippleTimestamp(timestamp) {
    return Math.round(timestamp / 1000) - 0x386d4380
}

function rippleTimeToISO8601(rippleTime) {
    return new Date(rippleToUnixTimestamp(rippleTime)).toISOString()
}

/**
 * @param {string} iso8601 international standard date format
 * @return {number} seconds since ripple epoch (1/1/2000 GMT)
 */
function iso8601ToRippleTime(iso8601) {
    return unixToRippleTimestamp(Date.parse(iso8601))
}

function normalizeNode(affectedNode) {
    const diffType = Object.keys(affectedNode)[0]
    const node = affectedNode[diffType]
    return Object.assign({}, node, {
        diffType,
        entryType: node.LedgerEntryType,
        ledgerIndex: node.LedgerIndex,
        newFields: node.NewFields || {},
        finalFields: node.FinalFields || {},
        previousFields: node.PreviousFields || {}
    })
}

function normalizeNodes(metadata) {
    if (!metadata.AffectedNodes) {
        return []
    }
    return metadata.AffectedNodes.map(normalizeNode)
}

/**
 * IEEE 754 floating-point.
 *
 * Supports single- or double-precision
 */

var allZeros = /^0+$/;
var allOnes = /^1+$/;

const IEEE754_fromBytes = bytes => {
   // Render in binary.  Hackish.
   var b = "";
   for (var i = 0, n = bytes.length; i < n; i++) {
       var bits = (bytes[i] & 0xff).toString(2);
       while (bits.length < 8) bits = "0" + bits;
       b += bits;
   }
   
   // Determine configuration.  This could have all been precomputed but it is fast enough.
   var exponentBits = bytes.length === 4 ? 4 : 11;
   var mantissaBits = (bytes.length * 8) - exponentBits - 1;
   var bias = Math.pow(2, exponentBits - 1) - 1;
   var minExponent = 1 - bias - mantissaBits;
   
   // Break up the binary representation into its pieces for easier processing.
   var s = b[0];
   var e = b.substring(1, exponentBits + 1);
   var m = b.substring(exponentBits + 1);
   
   var value = 0;
   var multiplier = (s === "0" ? 1 : -1);
   
   if (allZeros.test(e)) {
       // Zero or denormalized
       if (allZeros.test(m)) {
       // Value is zero
       } else {
       value = parseInt(m, 2) * Math.pow(2, minExponent);
       }
   } else if (allOnes.test(e)) {
       // Infinity or NaN
       if (allZeros.test(m)) {
       value = Infinity;
       } else {
       value = NaN;
       }
   } else {
       // Normalized
       var exponent = parseInt(e, 2) - bias;
       var mantissa = parseInt(m, 2);
       value = (1 + (mantissa * Math.pow(2, -mantissaBits))) * Math.pow(2, exponent);
   }
   
   return value * multiplier;
};

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

function convertDemurrageToUTF8(demurrageCode) {
    let bytes = Buffer.from(demurrageCode, "hex")
    let code = String.fromCharCode(bytes[1]) + String.fromCharCode(bytes[2]) + String.fromCharCode(bytes[3]);
    let interest_start = (bytes[4] << 24) + (bytes[5] << 16) + (bytes[6] <<  8) + (bytes[7]);
    let interest_period = IEEE754_fromBytes(bytes.slice(8, 16));
    const year_seconds = 31536000; // By convention, the XRP Ledger's interest/demurrage rules use a fixed number of seconds per year (31536000), which is not adjusted for leap days or leap seconds
    let interest_after_year = precision(Math.pow(Math.E, (interest_start+year_seconds - interest_start) / interest_period), 14);
    let interest = (interest_after_year * 100) - 100;

    return(`${code} (${interest}% pa)`)
}

function precision(num, precision) {
    return +(Math.round(Number(num + 'e+'+precision))  + 'e-'+precision);
}

function normalizeCurrencyCode(currencyCode, maxLength = 20) {
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

function parseFlags(value, keys, options = {}) {
    const flags = {};
    for (const flagName in keys) {
        // tslint:disable-next-line:no-bitwise
        if (value & keys[flagName]) {
            flags[flagName] = true;
        } else {
            if (!options.excludeFalse) {
                flags[flagName] = false;
            }
        }
    }
    return flags;
}

export const getNftCoverUrl = (nft, size = 'big', type = '') => {
    if (!nft) return '';
    
    const fileTypes = type ? [type] : ['video', 'animation', 'image']; // order is important
    const files = nft.files?.filter(file => fileTypes.includes(file.type)/* && file.thumbnail?.[size]*/);
    
    if (files?.length) {
        for (const type of fileTypes) {
            const file = files.find(f => f.type === type);
            if (file) {
                // return big thumbnail if requied size fail
                const thumbnail = file.thumbnail?.[size] || file.thumbnail?.big || file.convertedFile || ((!file.isIPFS && file.dfile) ? file.dfile : '');
                if (thumbnail) {
                    return `https://s2.xrpnft.com/d1/${thumbnail}`
                } else if (file.dfile && file.isIPFS && file.IPFSPath){
                    return `https://gateway.xrpnft.com/ipfs/${file.IPFSPath}`
                }
            }
        }
    }

    // type is usually requested at page for og:*, so if no type requested showing no image
    if (!type) {
        return '/static/nft_no_image.webp';
    }
    
    return '';
}

export const getNftFilesUrls = (nft, type = 'image') => {
    if (!nft) return '';
    const files = nft.files?.filter(file => file.type === type);
    if (files?.length) {
        for (const file of files) {
            // Now serving convertedFile whever possible
            if (!file.isIPFS && file.dfile) {
                const fileName = file.convertedFile ?? file.dfile;
                file.cachedUrl = `https://s2.xrpnft.com/d1/${fileName}`;
            } else if (file.isIPFS && file.IPFSPath) {
                file.cachedUrl = file.convertedFile ? `https://s2.xrpnft.com/d1/${file.convertedFile}` : `https://gateway.xrpnft.com/ipfs/${file.IPFSPath}`;
            } else {
                file.cachedUrl = null;
            }
        }
        return files;
    }
}

export function convertHexToString(hex, encoding = 'utf8') {
    let ret = '';
    try {
        ret = Buffer.from(hex, 'hex').toString(encoding);
    } catch (err) {
    }
    return ret;
}

export function cipheredTaxon(tokenSeq, taxon) {
    // An issuer may issue several NFTs with the same taxon; to ensure that NFTs
    // are spread across multiple pages we lightly mix the taxon up by using the
    // sequence (which is not under the issuer's direct control) as the seed for
    // a simple linear congruential generator.
    //
    // From the Hull-Dobell theorem we know that f(x)=(m*x+c) mod n will yield a
    // permutation of [0, n) when n is a power of 2 if m is congruent to 1 mod 4
    // and c is odd.
    //
    // Here we use m = 384160001 and c = 2459. The modulo is implicit because we
    // use 2^32 for n and the arithmetic gives it to us for "free".
    //
    // Note that the scramble value we calculate is not cryptographically secure
    // but that's fine since all we're looking for is some dispersion.
    //
    // **IMPORTANT** Changing these numbers would be a breaking change requiring
    //               an amendment along with a way to distinguish token IDs that
    //               were generated with the old code.
    // tslint:disable-next-line:no-bitwise
    return taxon ^ (384160001 * tokenSeq + 2459);
}

export function parseNFTokenID(NFTokenID) {
    //   A   B                      C                        D        E
    // 0008 1388 2177B00DF84CA4B8DD59778594F472EF0F56E435 99AE2184 00000DEA
    if (!NFTokenID || NFTokenID.length !== 64) return { flag: 0, royalty: 0, issuer: '', taxon: 0 };
    const flag = new Decimal('0x' + NFTokenID.slice(0, 4)).toNumber();
    const royalty = new Decimal('0x' + NFTokenID.slice(4, 8)).toNumber();
    const issuer = encodeAccountID(Buffer.from(NFTokenID.slice(8, 48), "hex"));
    const scrambledTaxon = new Decimal('0x' + NFTokenID.slice(48, 56)).toNumber();
    const tokenSeq = new Decimal('0x' + NFTokenID.slice(56, 64)).toNumber();

    const taxon = cipheredTaxon(tokenSeq, scrambledTaxon);

    let transferFee = 0;
    try {
        if (royalty)
            transferFee = Decimal.div(royalty, '1000').toDP(3, Decimal.ROUND_DOWN).toNumber();
    } catch (e) { }

    return { flag, royalty, issuer, taxon, transferFee };
}


module.exports = {
  parseQuality,
  hexToString,
  parseTimestamp,
  adjustQualityForXRP,
  isPartialPayment,
  dropsToXrp,
  xrpToDrops,
  toRippledAmount,
  removeUndefined,
  rippleToUnixTime,
  rippleToUnixTimestamp,
  rippleTimeToISO8601,
  iso8601ToRippleTime,
  isValidSecret,
  normalizeNodes,
  normalizeCurrencyCode,
  parseFlags,
  BLACKHOLE_ACCOUNTS,
  getNftCoverUrl,
  getNftFilesUrls,
  convertHexToString,
  parseNFTokenID
}
