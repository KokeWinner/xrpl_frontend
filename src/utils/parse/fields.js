const lodash = require('lodash');
const BigNumber = require('bignumber.js');
const { AccountFields } = require('./constants');

function parseField(info, value) {
  if (info.encoding === 'hex' && !info.length) {
    // e.g. "domain"
    return Buffer.from(value, 'hex').toString('ascii')
  }
  if (info.shift) {
    return new BigNumber(value).shiftedBy(-info.shift).toNumber()
  }
  return value
}

function parseFields(data) {
  const settings = {}
  // tslint:disable-next-line:forin
  for (const fieldName in AccountFields) {
    const fieldValue = data[fieldName]
    if (fieldValue != null) {
      const info = AccountFields[fieldName]
      settings[info.name] = parseField(info, fieldValue)
    }
  }

  if (data.RegularKey) {
    settings.regularKey = data.RegularKey
  }

  if (data.NFTokenMinter) {
    settings.nftokenMinter = data.NFTokenMinter;
  }

  // Since an account can own at most one SignerList,
  // this array must have exactly one member if it is present.
  if (data.signer_lists && data.signer_lists.length === 1) {
    settings.signers = {}
    if (data.signer_lists[0].SignerQuorum) {
      settings.signers.threshold = data.signer_lists[0].SignerQuorum
    }
    if (data.signer_lists[0].SignerEntries) {
      settings.signers.weights = data.signer_lists[0].SignerEntries.map((entry) => {
          return {
            address: entry.SignerEntry.Account,
            weight: entry.SignerEntry.SignerWeight
          }
        }
      )
    }
  }
  return settings
}

module.exports = {
  parseFields
}
