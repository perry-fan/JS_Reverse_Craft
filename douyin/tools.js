const timestamp = Date.now();
fixArr = [20, 1, 1, 0, 1, null, 4, 175, 11881, 6383, "1.0.1.19-fix.01"]//鼠标轨迹
let fixArr2 = [145, 110, 66, 189, 44, 211, 0]

function get_random_pre_for_base64() {
    let a = Math.random();
    let b = a * 65535;
    let seed1 = b & 255;

    let a2 = Math.random();
    let b2 = a2 * 40;
    let seed2 = b2 >> 0;
    let temp = [3, 82]

    let t1 = seed1 & 170
    let t2 = temp[0] & 85;
    let t3 = t1 | t2;
    let t4 = seed1 & 85;
    let t5 = temp[0] & 170;
    let t6 = t4 | t5;
    let t7 = seed2 & 170;
    let t8 = temp[1] & 85;
    let t9 = t7 | t8;
    let t10 = seed2 & 85;
    let t11 = temp[1] & 170;
    let t12 = t10 | t11;
    let result = [t3, t6, t9, t12]
    console.log("result pre:", result);
    return String.fromCharCode.apply(null, result);
}

let getSystemParamsArr = function getSystemParamsArr() {
    let systemParamsArr = [];
    let win = '1707|791|1707|912|1707|912|1707|960|Win32';
    for (let i = 0; i < win.length; i++) {
        systemParamsArr.push(win.charCodeAt(i));
    }
    console.log("systemParamsArr:", systemParamsArr);
    return systemParamsArr;
}

let getTimeArr = function getTimeArr() {
    let timeArr = [];
    let my_time = ((timestamp + 3) & 255) + ',';
    for (let i = 0; i < my_time.length; i++) {
        let timeCharCode = my_time.charCodeAt(i);
        timeArr.push(timeCharCode);
    }
    console.log("timeCharCode:", timeArr);
    return timeArr;
}

function get_random_pre_for_rc4_part1() {

    let temp = [1, 0];
    let a = Math.random();
    let b = a * 65535;
    let seed1 = b & 255;
    let seed2 = b >> 8;

    let t1 = seed1 & 170
    let t2 = temp[0] & 85;
    let t3 = t1 | t2;
    let t4 = seed1 & 85;
    let t5 = temp[0] & 170;
    let t6 = t4 | t5;
    let t7 = seed2 & 170;
    let t8 = temp[1] & 85;
    let t9 = t7 | t8;
    let t10 = seed2 & 85;
    let t11 = temp[1] & 170;
    let t12 = t10 | t11;
    let result = [t3, t6, t9, t12]
    console.log("result part1:", result);
    return result;
}

function get_random_pre_for_rc4_part2() {

    let temp = [1, 0];
    let a = Math.random();
    let b = a * 255;
    let c = b >> 0;
    let d = c & 77;
    let e = d | (1 << 1);
    let f = e | (1 << 4);
    let g = f | (1 << 5);
    let h = g | (1 << 7);

    let a1 = Math.random();
    let b1 = a1 * 240;
    let c1 = b1 >> 0;
    let d1 = c1 % 2;
    let e1 = c1 + d1 * 2;
    let f2 = e1 & 170;
    let g2 = temp[0] & 85;
    let h2 = f2 | g2;
    let i2 = c1 & 85;
    let j2 = temp[0] & 170;
    let k2 = i2 | j2;
    let l2 = h & 170;
    let m2 = temp[1] & 85;
    let n2 = l2 | m2;
    let o2 = h & 85;
    let p2 = temp[1] & 170;
    let r2 = o2 | p2;


    let result = [h2, k2, n2, r2];
    console.log("result part2:", result);
    return result;
}

let getLastNumArr = function getLastNumArr(reqParamsArr, dhzxParamsArr, userAgentArr, systemParamsArr, preArr,timeArr) {
    let startNum = preArr[0]
    for (let i = 1; i < preArr.length; i++) {
        let temp = preArr[i];
        startNum = startNum ^ temp;
    }
    startNum = startNum ^ 41;
    startNum = startNum ^ calculateDateTime();
    startNum = startNum ^ 6;
    startNum = startNum ^ timestamp - timestamp + 3 & 255;
    startNum = startNum ^ timestamp & 255;
    startNum = startNum ^ timestamp >> 8 & 255;
    startNum = startNum ^ timestamp >> 16 & 255;
    startNum = startNum ^ timestamp >> 24 & 255;
    startNum = startNum ^ ((timestamp - 1) / 256 / 256 / 256 / 256) & 255
    startNum = startNum ^ ((timestamp - 1) / 256 / 256 / 256 / 256 / 256) & 255
    startNum = startNum ^ ((1 | +false << 6 | 0) % 256) & 255
    startNum = startNum ^ ((1 | +false << 6 | 0) / 256) & 255
    startNum = startNum ^ fixArr.slice(0, 5)[4] & 255
    startNum = startNum ^ fixArr.slice(0, 5)[4] >> 8 & 255
    startNum = startNum ^ fixArr.slice(0, 5)[0]
    startNum = startNum ^ fixArr.slice(0, 5)[1]
    startNum = startNum ^ fixArr.slice(0, 5)[2]
    startNum = startNum ^ fixArr.slice(0, 5)[3]
    startNum = startNum ^ (1 << 3 | 8) & 255
    startNum = startNum ^ (1 << 3 | 8 & 255) >> 16 & 255
    startNum = startNum ^ (1 << 3 | 8) >> 24 & 255
    startNum = startNum ^ reqParamsArr[9]
    startNum = startNum ^ reqParamsArr[18]
    startNum = startNum ^ reqParamsArr[3]
    startNum = startNum ^ dhzxParamsArr[10]
    startNum = startNum ^ dhzxParamsArr[19]
    startNum = startNum ^ dhzxParamsArr[4]
    startNum = startNum ^ userAgentArr[11]
    startNum = startNum ^ userAgentArr[21]
    startNum = startNum ^ userAgentArr[5]
    startNum = startNum ^ (timestamp - 1) & 255
    startNum = startNum ^ (timestamp - 1) >> 8 & 255
    startNum = startNum ^ (timestamp - 1) >> 16 & 255
    startNum = startNum ^ (timestamp - 1) >> 24 & 255
    startNum = startNum ^ ((timestamp - 1) / 256 / 256 / 256 / 256) & 255
    startNum = startNum ^ ((timestamp - 1) / 256 / 256 / 256 / 256 / 256) & 255
    startNum = startNum ^ 3
    startNum = startNum ^ 11881 & 255
    startNum = startNum ^ 11881 >> 8 & 255
    startNum = startNum ^ 11881 >> 16 & 255
    startNum = startNum ^ 11881 >> 24 & 255
    startNum = startNum ^ 6383 & 255
    startNum = startNum ^ 6383 >> 8 & 255
    startNum = startNum ^ 6383 >> 16 & 255
    startNum = startNum ^ 6383 >> 24 & 255
    startNum = startNum ^ systemParamsArr.length & 255
    startNum = startNum ^ systemParamsArr.length >> 8 & 255
    startNum = startNum ^ timeArr.length & 255
    startNum = startNum ^ timeArr.length >> 8 & 255
    console.log("lastNumArr:", [startNum]);
    return [startNum]
}


let getLen50Arr = function getLen50Arr(reqParamsArr, dhzxParamsArr, userAgentArr, systemParamsArr,timeArr) {
    let arr = [];
    arr[0] = (timestamp / 256 / 256 / 256 / 256 / 256) & 255
    arr[1] = (1 << 3 | 8) & 255
    arr[2] = userAgentArr[11]
    arr[3] = (timestamp - 1) >> 8 & 255 //U[61]
    arr[4] = 6383 >> 16 & 255 //U[73]
    arr[5] = timestamp & 255    //U[29]
    arr[6] = 11881 >> 24 & 255 //U[70]
    arr[7] = (1 << 3 | 8) >> 8 & 255 //U[45]
    arr[8] = (1 % 256) & 255//U[35]
    arr[9] = reqParamsArr[18] //U[49]
    arr[10] = fixArr.slice(0, 5)[4] & 255 //U[38]
    arr[11] = 3
    arr[12] = reqParamsArr[3]
    arr[13] = 11881 >> 8 & 255
    arr[14] = timestamp - timestamp + 3 & 255
    arr[15] = reqParamsArr[9]
    arr[16] = ((timestamp - 1) / 256 / 256 / 256 / 256) & 255
    arr[17] = (1 << 3 | 8 & 255) >> 24 & 255
    arr[18] = timestamp >> 8 & 255
    arr[19] = 6383 & 255
    arr[20] = calculateDateTime()
    arr[21] = dhzxParamsArr[4]
    arr[22] = timestamp >> 24 & 255
    arr[23] = 11881 >> 16 & 255
    arr[24] = userAgentArr[5]
    arr[25] = fixArr.slice(0, 5)[0]
    arr[26] = (timestamp - 1) >> 16 & 255
    arr[27] = (timestamp - 1) >> 24 & 255
    arr[28] = 6
    arr[29] = 6383 >> 8 & 255
    arr[30] = fixArr.slice(0, 5)[1]
    arr[31] = 6383 >> 24 & 255
    arr[32] = userAgentArr[21]
    arr[33] = dhzxParamsArr[10]
    // 34再确认下
    arr[34] = fixArr.slice(0, 5)[2]
    arr[35] = fixArr.slice(0, 5)[4] >> 8 & 255
    arr[36] = ((timestamp) / 256 / 256 / 256 / 256) & 255
    arr[37] = 11881 >> 0 & 255
    arr[38] = dhzxParamsArr[19]
    arr[39] = fixArr.slice(0, 5)[3]
    arr[40] = ((timestamp - 1) / 256 / 256 / 256 / 256 / 256) & 255
    arr[41] = (1 << 3 | 8 & 255) >> 16 & 255
    // 42再确认下
    arr[42] = (+false << 6 | 0 / 256) & 255
    arr[43] = 41
    arr[44] = (timestamp - 1) & 255
    arr[45] = timestamp >> 24 & 255
    arr[46] = systemParamsArr.length & 255
    arr[47] = systemParamsArr.length >> 8 & 255
    arr[48] = timeArr.length & 255
    arr[49] = timeArr.length >> 8 & 255 - 1
    console.log("len50Arr:", arr);
    return arr;
}

function calculateDateTime() {
    return (parseFloat(timestamp) - 1721836800000) / 1000 / 60 / 60 / 24 / 14 >> 0;
}

let getArr = function getArr(paramArr) {
    let resArr = [];
    for (let i = 2; i < paramArr.length; i = (i + 1) % 3 === 0 ? i + 3 : i + (i + 1) % 3) {
        let r
        let random = Math.random() * 1000 & 255 //228
        let seed = random & fixArr2[0];//128
        let temp1 = paramArr[i - 2];
        r = seed | temp1 & fixArr2[1]
        resArr.push(r);

        let seed2 = random & fixArr2[2]//64
        let temp2 = paramArr[i - 1];//8
        r = seed2 | temp2 & fixArr2[3]
        resArr.push(r);

        let seed3 = random & fixArr2[4]//36
        let temp3 = paramArr[i];
        r = seed3 & fixArr2[4] | temp3 & fixArr2[5]
        resArr.push(r);

        let seed4 = temp1 & fixArr2[0]
        let temp4 = seed4 | paramArr[i - 1] & fixArr2[2];
        r = temp4 | temp3 & fixArr2[4]
        resArr.push(r);
    }
    console.log("resArr:", resArr)
    return resArr;
}

exports.get_random_pre_for_base64 = get_random_pre_for_base64;
exports.getSystemParamsArr = getSystemParamsArr;
exports.getTimeArr = getTimeArr;
exports.get_random_pre_for_rc4_part1 = get_random_pre_for_rc4_part1;
exports.get_random_pre_for_rc4_part2 = get_random_pre_for_rc4_part2;
exports.getLastNumArr = getLastNumArr;
exports.getLen50Arr = getLen50Arr;
exports.getArr = getArr;


// let arr1 = get_random_pre_for_rc4_part1()
// let arr2 = get_random_pre_for_rc4_part2()
// let rc4_arr_pre = arr1.concat(arr2)
//
// console.log("rc4_arr_pre",rc4_arr_pre)

// let systemParamsArr = getSystemParamsArr()
// let timeArr = getTimeArr()
// let lastNumArr = getLastNumArr(reqParamsArr, dhzxParamsArr, userAgentArr, systemParamsArr)
// let len50Arr = getLen50Arr(reqParamsArr, dhzxParamsArr, userAgentArr, systemParamsArr)
//
// let paramArr = len50Arr.concat(systemParamsArr).concat(timeArr).concat(lastNumArr)


// rc4EncArr=getArr(paramArr);


// [1,8,80,248,0,3,0,0,1,193,1,3,60,46,3,117,149,0,248,239,17,44,224,0,168,20,224,230,6,24,1,0,54,82,1,0,149,105,177,0,1,0,0,41,2,230,41,0,2,0].concat([[49,55,48,55,124,55,57,49,124,49,55,48,55,124,57,49,50,124,49,55,48,55,124,57,49,50,124,49,55,48,55,124,57,54,48,124,87,105,110,51,50],[54,44],[174]])


// 合并的数组是90多位，%3取余 每3个一组操作生成4位数组，最后生成的数组+余数push=120多位数组，是后半段

// [131,4,8,80,171,21,170,84,128,72,116,1,249,2,3,144,145,64,13,0,80,65,15,129,44,110,43,18,228,215,8,17,121,173,61,210,61,160,36,64,169,22,236,160,247,70,56,138,128,2,62,37,67,1,0,16,21,105,177,241,128,65,4,0,1,105,6,0,103,41,0,128,18,2,49,32,183,48,51,53,108,55,53,58,177,62,25,113,182,50,31,53,237,123,61,48,51,60,53,112,183,114,27,53,109,121,21,48,163,60,61,112,183,50,23,53,253,57,62,52,160,60,119,84,105,108,23,99,179,52,44,62,174]


