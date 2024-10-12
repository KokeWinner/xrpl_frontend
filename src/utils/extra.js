import hashicon from 'hashicon';

const Activity = { // 04:12 PM 03/26/2023
    LOGIN: 1,
    LOGOUT: 2,
    UPDATE_PROFILE: 3,
  
    // Tx parse section
    CREATE_OFFER: 21,
    CANCEL_OFFER: 23,

    CREATE_TRUSTLINE: 25,
    REMOVE_TRUSTLINE: 27,

    TRADE_EXCHANGE: 29
}

function getHashIcon(account) {
    let url = '/static/account_logo.webp';
    try {
        const icon = hashicon(account);
        url = icon.toDataURL();
    } catch (e) {
    }
    return url;
}

export function checkExpiration(expiration) {
    if (expiration) {
        const now = Date.now();
        const expire = (expiration > 946684800 ? expiration : expiration + 946684800) * 1000;

        if (expire < now)
            return true
    } else {
        return false
    }
}module.exports = {
    Activity,
    getHashIcon,
    checkExpiration
}