const CryptoJS = require("crypto-js");

function md5(plaintext){
    return CryptoJS.MD5(plaintext).toString();
}
