const CryptoJS = require("crypto-js");

function md5(plaintext){
    let ciphertext = CryptoJS.MD5(plaintext).toString();
    return ciphertext;
}
