const CryptoJS = require('crypto-js');
const { removeUndefined } = require("./common");
const { rippleToUnixTimestamp } = require("./utils");
const { parseAmount } = require('./amount');

let tx;
let hash;
let time;
let changes = [];

module.exports.parseOfferChanges = (paramTx, close_time) => {
    tx = paramTx;

    changes = [];

    if (hasAffectedNodes() === false) {
        return [];
    }

    hash = tx.hash || tx.transaction?.hash || tx.tx?.hash;
    time = rippleToUnixTimestamp(close_time);
    
    parseAffectedNode();

    return changes;
}

function hasAffectedNodes() {
    if (!tx) return false;

    const meta = tx.meta || tx.metaData;

    if (!meta) return false;

    if (meta.AffectedNodes === undefined) {
        return false;
    }

    if (meta.AffectedNodes?.length === 0) {
        return false;
    }

    return true;
}

function parseAffectedNode() {
    const meta = tx.meta || tx.metaData;

    for (const affectedNode of meta.AffectedNodes) {
        if (isCreateOfferNode(affectedNode)) {
            parseCreateOfferNode(affectedNode);
        } else if (isModifyOfferNode(affectedNode)) {
            parseModifyOfferNode(affectedNode);
        } else if (isDeleteOfferNode(affectedNode)) {
            parseDeleteOfferNode(affectedNode);
        }
    }
}

function isCreateOfferNode(affectedNode) {
    return affectedNode.CreatedNode?.LedgerEntryType === "Offer" && affectedNode.CreatedNode?.NewFields;
}

function isModifyOfferNode(affectedNode) {
    return affectedNode.ModifiedNode?.LedgerEntryType === "Offer" && affectedNode.ModifiedNode?.FinalFields;
  }

function isDeleteOfferNode(affectedNode) {
  return affectedNode.DeletedNode?.LedgerEntryType === "Offer" && affectedNode.DeletedNode?.FinalFields;
}

function getPair(gets, pays) {
    const t1 = gets.issuer + '_' + gets.currency;
    const t2 = pays.issuer  + '_' +  pays.currency;
    let pair = t1 + t2;    
    if (t1.localeCompare(t2) > 0)
        pair = t2 + t1;
    return CryptoJS.MD5(pair).toString();
}

function parseCreateOfferNode(affectedNode) {
    /*
    "NewFields": {
        "Account": "rhsxg4xH8FtYc3eR53XDSjTGfKQsaAGaqm",
        "BookDirectory": "9EFFE903B4EBB13D25595E207F5CB85AD10FE98F13AD63544D04F832D05B740F",
        "OwnerNode": "14",
        "Sequence": 69324742,
        "TakerGets": "71490000",
        "TakerPays": {
            "currency": "5041524300000000000000000000000000000000",
            "issuer": "rE42R1mbjGtMzzFTL5aqpbTrj3TDVq71jo",
            "value": "1"
        }
    }
    */
    const field = affectedNode.CreatedNode.NewFields;
    const data = {
        status: "created",
        account: field.Account,
        // bookDir: field.BookDirectory,
        // ownerNode: field.OwnerNode,
        seq: field.Sequence,
        flags: field.Flags || 0,
        gets: parseAmount(field.TakerGets),
        pays: parseAmount(field.TakerPays),
    };

    data.pair = getPair(data.gets, data.pays);

    if (typeof field.Expiration === "number") {
        data.expire = rippleToUnixTimestamp(field.Expiration);
    }

    data.chash = hash;
    data.ctime = time;

    changes.push(data);
}

function parseModifyOfferNode(affectedNode) {
     /*
    "FinalFields": {
        "Account": "rL2frVHCoogYoD3oFVTd7hADQaHKRbt2L7",
        "BookDirectory": "176870FA38EE64D85778DB7E1295577D98FA8F421331B7524E05113D5820C944",
        "BookNode": "0",
        "Flags": 131072,
        "OwnerNode": "2c",
        "Sequence": 69208631,
        "TakerGets": "14034115",
        "TakerPays": {
            "currency": "4C656467657250756E6B73000000000000000000",
            "issuer": "rLpunkscgfzS8so59bUCJBVqZ3eHZue64r",
            "value": "2.001728037990774"
        }
    },
    */
    const field = affectedNode.ModifiedNode.FinalFields;
    const data = {
        status: "modified",
        account: field.Account,
        // bookDir: field.BookDirectory,
        // ownerNode: field.OwnerNode,
        seq: field.Sequence,
        flags: field.Flags || 0,
        gets: parseAmount(field.TakerGets),
        pays: parseAmount(field.TakerPays)
    };

    data.pair = getPair(data.gets, data.pays);

    if (typeof field.Expiration === "number") {
        data.expire = rippleToUnixTimestamp(field.Expiration);
    }

    data.mhash = hash;
    data.mtime = time;

    changes.push(data);
}

function parseDeleteOfferNode(affectedNode) {
     /*
    "FinalFields": {
        "Account": "rL2frVHCoogYoD3oFVTd7hADQaHKRbt2L7",
        "BookDirectory": "176870FA38EE64D85778DB7E1295577D98FA8F421331B7524E050F939563B2B0",
        "BookNode": "0",
        "Flags": 131072,
        "OwnerNode": "2d",
        "PreviousTxnID": "B351AA58E6BF4BF488FE273C9800C01049AE0445E99FA803462B14681B119145",
        "PreviousTxnLgrSeq": 78384953,
        "Sequence": 69208768,
        "TakerGets": "0",
        "TakerPays": {
            "currency": "4C656467657250756E6B73000000000000000000",
            "issuer": "rLpunkscgfzS8so59bUCJBVqZ3eHZue64r",
            "value": "0"
        }
    },
    */
    const field = affectedNode.DeletedNode.FinalFields;

    const data = {
        status: "deleted",
        account: field.Account,
        seq: field.Sequence
    }

    data.dhash = hash;
    data.dtime = time;

    changes.push(data);
}

function convertStringToHex(string) {
    let ret = "";
    try {
        ret = Buffer.from(string, "utf8").toString("hex").toUpperCase();
    } catch (err) { }
    return ret;
}

function configureMemos(type, format, data) {
    /*
    
      [
          {
            type: 'XRPL.to-accept-offer',
            data: 'https://xrpl.to'
          }
      ]
    
      */

    const Memo = {};

    if (type) Memo.MemoType = convertStringToHex(type);
    if (format) Memo.MemoFormat = convertStringToHex(format);
    if (data) Memo.MemoData = convertStringToHex(data);

    const Memos = [
        {
            Memo,
        },
    ];

    return Memos;
}

module.exports.configureMemos = configureMemos;