const CryptoJS = require("crypto-js");

function get_rp(gt, challenge, pass_time) {
    let rp = CryptoJS.MD5(gt + challenge + pass_time).toString();
    return rp;
}



