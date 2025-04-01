const rc4 = require('./rc4魔改')
const base64 = require('./base64魔改')
const tools = require('./tools');
const sm3 = require('./sm3');
const {base64Encode} = require("./base64魔改");

let ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36'
let key = String.fromCharCode.apply(null, [0.00390625, 1, 8]);
let key2 = 'Ó';
let reqParams = "device_platform=webapp&aid=6383&channel=channel_pc_web&search_channel=aweme_user_web&keyword=%E4%BA%8C%E6%88%98&search_source=normal_search&query_correct_type=1&is_filter_search=0&from_group_id=&offset=10&count=10&need_filter_settings=0&list_type=multi&search_id=202504011717414E9FA15E3B12B601BC56&update_version_code=170400&pc_client_type=1&pc_libra_divert=Windows&support_h265=1&support_dash=1&version_code=170400&version_name=17.4.0&cookie_enabled=true&screen_width=1600&screen_height=1000&browser_language=zh-CN&browser_platform=Win32&browser_name=Chrome&browser_version=134.0.0.0&browser_online=true&engine_name=Blink&engine_version=134.0.0.0&os_name=Windows&os_version=10&cpu_core_num=20&device_memory=8&platform=PC&downlink=10&effective_type=4g&round_trip_time=100&webid=7481103752319469119&uifid=29d6bea3e5a6c157a08a212e1912b5e8a78666ece26be56100fa19e58a63a45b7430374aec04099be6c42331d06e5bc0adc5ce0ec014f4da989724f3af5a0acd164bcadf1e1b87ddaf6a61d9f07f94e7e32b7e22c5cd273508899d257064cec330cb14d35d050fd4ff9596013d70b5c125cc212120afe6d0573a29d018f9992ca7328a065ff03c648acbb83985073c84f6d5e32db8b9eea3f6b8542dc3d6fa6a&msToken=kiUUL880TRetYuf4p0789uDsTDU4bfiI5KjSpNKEEbYItMoCxPb4qP9yUD3_reSwHL90VR66ns5y8Q9ayP1nz1BeEYFtiM_nhAPiJXscgSrOMEcUmCHH6hS7mv1BWj4_nURNvgBjshhX0QjxHpjKeqZwXvITdyoB0t47M7be_cr4"

let fixReqParams = "dhzx";


function get_a_bogus() {
    sm3.hasher.write(reqParams + fixReqParams);
    let reqParamsArr = sm3.hasher.sum(null, 'array');
    console.log(reqParamsArr);

    sm3.hasher.write(fixReqParams);
    let dhzxParamsArr = sm3.hasher.sum(null, 'array');
    console.log(dhzxParamsArr);

    let randomPreForBase64 = tools.get_random_pre_for_base64();
    console.log(randomPreForBase64);


    let uaRc4Enc = rc4.rc4(key, ua);
    console.log("ua rc4加密:\n%s", uaRc4Enc);
    let uaBase64Enc = base64.base64Encode(uaRc4Enc);
    console.log("ua base64加密:\n%s", uaBase64Enc);
    sm3.hasher.write(uaBase64Enc);
    let userAgentArr = sm3.hasher.sum(null, 'array')
    console.log("ua sm3加密:\n%s", userAgentArr);

    let pre = tools.get_random_pre_for_base64();
    console.log("pre:", pre)

    let arr1 = tools.get_random_pre_for_rc4_part1()
    let arr2 = tools.get_random_pre_for_rc4_part2()
    let rc4_arr_pre = arr1.concat(arr2)


    let systemParamsArr = tools.getSystemParamsArr()
    let timeArr = tools.getTimeArr()
    let lastNumArr = tools.getLastNumArr(reqParamsArr, dhzxParamsArr, userAgentArr, systemParamsArr, rc4_arr_pre, timeArr)
    let len50Arr = tools.getLen50Arr(reqParamsArr, dhzxParamsArr, userAgentArr, systemParamsArr, timeArr)

    let paramArr = len50Arr.concat(systemParamsArr).concat(timeArr).concat(lastNumArr)

    rc4EncArr = tools.getArr(paramArr);

    let rc4Result = rc4.rc4(key2, String.fromCharCode.apply(null, rc4EncArr));
    let rc4Total = pre + rc4Result
    let a_bogus = base64.base64Encode2(rc4Total)
    console.log("a_bogus:", a_bogus);
    return a_bogus;
}


