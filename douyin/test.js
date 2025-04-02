const rc4 = require('./rc4魔改')
const base64 = require('./base64魔改')
const tools = require('./tools');
const sm3 = require('./sm3');
const {base64Encode} = require("./base64魔改");

let ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36'
let key = String.fromCharCode.apply(null, [0.00390625, 1, 8]);
let key2 = 'Ó';
let reqParams = "device_platform=webapp&aid=6383&channel=channel_pc_web&item_id=7488296898260929846&comment_id=7488300788696204089&cut_version=1&cursor=0&count=3&item_type=0&update_version_code=170400&pc_client_type=1&pc_libra_divert=Windows&support_h265=1&support_dash=1&version_code=170400&version_name=17.4.0&cookie_enabled=true&screen_width=1600&screen_height=1000&browser_language=zh-CN&browser_platform=Win32&browser_name=Chrome&browser_version=134.0.0.0&browser_online=true&engine_name=Blink&engine_version=134.0.0.0&os_name=Windows&os_version=10&cpu_core_num=20&device_memory=8&platform=PC&downlink=10&effective_type=4g&round_trip_time=100&webid=7481103752319469119&uifid=29d6bea3e5a6c157a08a212e1912b5e8a78666ece26be56100fa19e58a63a45b7430374aec04099be6c42331d06e5bc0adc5ce0ec014f4da989724f3af5a0acd164bcadf1e1b87ddaf6a61d9f07f94e7e32b7e22c5cd273508899d257064cec330cb14d35d050fd4ff9596013d70b5c125cc212120afe6d0573a29d018f9992ca7328a065ff03c648acbb83985073c84f6d5e32db8b9eea3f6b8542dc3d6fa6a&msToken=jtSWNNv_cI7IbXm1FQhmTEUKQp-7zJxbtK86GwMfFCxap-W295hlMCyVEwcPuE5K2xnAaqdU1ONZ3Pj4uToofaYH0rfM1r8pX3-OWTtNO_TEsM7IWxAGwwkgYJenX3oeAGjvskzxnX_O0rm41FsPALURN7epyjE0k3KxwjtUp_Qg"

let fixReqParams = "dhzx";


function get_a_bogus() {
    sm3.hasher.write(reqParams + fixReqParams);
    let reqParamsArrFirst = sm3.hasher.sum(null, 'array');
    sm3.hasher.write(reqParamsArrFirst);
    let reqParamsArr = sm3.hasher.sum(null, 'array');
    console.log("reqParamsArr SM3", reqParamsArr);

    sm3.hasher.write(fixReqParams);
    let dhzxParamsArrFirst = sm3.hasher.sum(null, 'array');
    sm3.hasher.write(dhzxParamsArrFirst);
    let dhzxParamsArr = sm3.hasher.sum(null, 'array');
    console.log("dhzxParamsArr SM3", dhzxParamsArr);

    let randomPreForBase64 = tools.getRandomPreForBase64();
    console.log(randomPreForBase64);


    let uaRc4Enc = rc4.rc4(key, ua.trim());
    console.log("ua rc4加密:\n%s", uaRc4Enc);
    let uaBase64Enc = base64.base64Encode(uaRc4Enc);
    console.log("ua base64加密:\n%s", uaBase64Enc);
    sm3.hasher.write(uaBase64Enc);
    let userAgentArr = sm3.hasher.sum(null, 'array')
    console.log("ua sm3加密:\n%s", userAgentArr);


    let arr1 = tools.getRandomPreForRc4Part1()
    let arr2 = tools.getRandomPreForRc4Part2()
    let rc4_arr_pre = arr1.concat(arr2)


    let systemParamsArr = tools.getSystemParamsArr()
    let timeArr = tools.getTimeArr()
    let lastNumArr = tools.getLastNumArr(reqParamsArr, dhzxParamsArr, userAgentArr, systemParamsArr, rc4_arr_pre, timeArr)
    let len50Arr = tools.getLen50Arr(reqParamsArr, dhzxParamsArr, userAgentArr, systemParamsArr, timeArr)

    let paramArr = len50Arr.concat(systemParamsArr).concat(timeArr).concat(lastNumArr)
    console.log("paramArr:", paramArr)
    let rc4EncArr = tools.getArr(paramArr);
    let totalEncArr = rc4_arr_pre.concat(rc4EncArr);
    console.log("totalEncArr:", totalEncArr)
    let rc4Result = rc4.rc4(key2, String.fromCharCode.apply(null, totalEncArr));
    console.log("rc4Result:", rc4Result)
    let rc4Total = randomPreForBase64 + rc4Result
    console.log("rc4Total:", rc4Total)
    let a_bogus = base64.base64Encode2(rc4Total)
    console.log("a_bogus:", a_bogus);
    return a_bogus;
}

get_a_bogus()
