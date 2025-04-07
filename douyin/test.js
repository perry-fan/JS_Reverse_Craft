const rc4 = require('./rc4魔改')
const base64 = require('./base64魔改')
const tools = require('./tools');
const sm3 = require('./sm3');
const {base64Encode, base64Decode} = require("./base64魔改");

let ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36'
let key = String.fromCharCode.apply(null, [0.00390625, 1, 12]);
let key2 = 'Ó';
let reqParams = "device_platform=webapp&aid=6383&channel=channel_pc_web&item_id=7470358942426729769&comment_id=7488481029427643194&cut_version=1&cursor=0&count=3&item_type=0&update_version_code=170400&pc_client_type=1&pc_libra_divert=Windows&support_h265=1&support_dash=1&version_code=170400&version_name=17.4.0&cookie_enabled=true&screen_width=1707&screen_height=960&browser_language=zh-CN&browser_platform=Win32&browser_name=Chrome&browser_version=127.0.0.0&browser_online=true&engine_name=Blink&engine_version=127.0.0.0&os_name=Windows&os_version=10&cpu_core_num=16&device_memory=8&platform=PC&downlink=4.35&effective_type=4g&round_trip_time=50&webid=7455907028960364086&uifid=973a3fd64dcc46a3490fd9b60d4a8e663b34df4ccc4bbcf97643172fb712d8b05c8207ab7a0402be2f993623172fba41ff6cc39877dd02cf23ff682b5895c2b0273435ccd10f5501764f37d4bc40c7592e612a1ff5bb2c598051d2da4e46f92708353aecd8e8a1d4ead44c99718738b075e07b51e2402a7f6f93b3f2b6428dea89519908ac39c9037c192cfad8c8351a6c6b7eef867964390d9c142d2e8b28bc&msToken=Fq_O2gMSnb3GpDCkILKu13W5-F6tOJEnY6mbs-zW_xkEODBUQgMX-c6sJKJf5K0nTMGXKhjC-XTw9gNmrWSui00xXPpZHROvFHfvcXRoovxNWC8cf0AzCI1F6o6-BUe9m_AGd9RHmMuUplnns8DbFjupphDGs-iaiZVt2CWkmdx5yVJqESL-BA%3D%3D"

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
    // let rc4_arr_pre=[9,4,168,65,11,16,170,17]

    let systemParamsArr = tools.getSystemParamsArr()
    let timeArr = tools.getTimeArr()
    let lastNumArr = tools.getLastNumArr(reqParamsArr, dhzxParamsArr, userAgentArr, systemParamsArr, rc4_arr_pre, timeArr)
    let len50Arr = tools.getLen50Arr(reqParamsArr, dhzxParamsArr, userAgentArr, systemParamsArr, timeArr)

    let paramArr = len50Arr.concat(systemParamsArr).concat(timeArr).concat(lastNumArr)//96位数组
    console.log("paramArr:", paramArr)

    let rc4EncArr = tools.getArr(paramArr);//128位数组
    let totalEncArr = rc4_arr_pre.concat(rc4EncArr);//136位数组
    console.log("totalEncArr:%s\nLen:%s", totalEncArr,totalEncArr.length)

    let rc4Result = rc4.rc4(key2, String.fromCharCode.apply(null, totalEncArr));
    console.log("rc4Result:", rc4Result)

    let rc4Total = randomPreForBase64 + rc4Result
    console.log("rc4Total:", rc4Total)

    let a_bogus = base64.base64Encode2(rc4Total)
    console.log("a_bogus:", a_bogus);
    return a_bogus;
}

get_a_bogus()