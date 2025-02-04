const CryptoJS = require("crypto-js");
function hmacMD5(plaintext, key) {
    return CryptoJS.HmacMD5(plaintext, key).toString();
}
function md5(plaintext) {
    return CryptoJS.MD5(plaintext).toString();
}
function sha1(plaintext) {
    const hash = CryptoJS.SHA1(plaintext);
    return hash.toString(CryptoJS.enc.Hex)
}

function hmacSHA1(plaintext, key) {
    const hash = CryptoJS.HmacSHA1(plaintext, key);
    return hash.toString(CryptoJS.enc.Hex)
}
module.exports.hmacMD5 = hmacMD5;
module.exports.md5 = md5;
module.exports.sha1 = sha1;
module.exports.hmacSHA1 = hmacSHA1;


