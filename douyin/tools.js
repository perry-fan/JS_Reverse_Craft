// Date.now = function now() {
//     return 1743601971840
// };
// Date.parse = function () {
//     return 1743601971840
// };
// Date.prototype.valueOf = function () {
//     return 1743601971840
// };
// Date.prototype.getTime = function () {
//     return 1743601971840
// };
// Date.prototype.toString = function () {
//     return 1743601971840
// };
// Performance.prototype.now = function now() {
//     return Number('1743601971840'.slice(8))
// }
// Math.random = function random() {
//     return 0.30596978909993866
// };

const timestamp = Date.now();

const mouseTrackArr = [126, 0, 2, 0, 1, null, 4, 117, 6241, 6383, "1.0.1.19-fix.01"];
const mixSeedArr = [145, 110, 66, 189, 44, 211, 0];

function getRandomByte(max = 255) {
    return (Math.random() * max) >> 0;
}

function getMixedBits(value, ref) {
    var result1 = (value & 170) | (ref & 85);
    var result2 = (value & 85) | (ref & 170);
    return [result1, result2];
}

function getRandomPreForBase64() {
    var seed1 = getRandomByte(255);
    var seed2 = getRandomByte(40);
    var part1 = getMixedBits(seed1, 3);
    var part2 = getMixedBits(seed2, 82);
    var result = part1.concat(part2);
    // var result = [35, 19, 112, 6]
    console.log("result pre:", result);
    return String.fromCharCode.apply(null, result);
}

function getSystemParamsArr() {
    var systemStr = '1707|791|1707|912|1707|912|1707|960|Win32';
    var arr = [];
    for (var i = 0; i < systemStr.length; i++) {
        arr.push(systemStr.charCodeAt(i));
    }
    console.log("systemParamsArr:", arr);
    return arr;
}

function getTimeArr() {
    var timeStr = ((timestamp + 3) & 255) + ',';
    var arr = [];
    for (var i = 0; i < timeStr.length; i++) {
        arr.push(timeStr.charCodeAt(i));
    }
    console.log("timeCharCode:", arr);
    return arr;
}

function calculateDateTime() {
    return ((timestamp - 1721836800000) / 1000 / 60 / 60 / 24 / 14) >> 0;
}

function getRandomPreForRc4Part1() {
    var rand = Math.random() * 65535;
    var seed1 = rand & 255;
    var seed2 = rand >> 8;

    var result = getMixedBits(seed1, 1).concat(getMixedBits(seed2, 0));
    console.log("result part1:", result);
    return result;
}

function getRandomPreForRc4Part2() {
    var byte = getRandomByte() & 77;
    var modified = byte | (1 << 1) | (1 << 4) | (1 << 5) | (1 << 7);

    var rand = getRandomByte(240);
    var adjusted = rand + (rand % 2) * 2;

    var result = getMixedBits(adjusted, 1).concat(getMixedBits(modified, 0));
    console.log("result part2:", result);
    return result;
}

function getLastNumArr(reqParamsArr, dhzxParamsArr, userAgentArr, systemParamsArr, preArr, timeArr) {
    var xorValue = preArr[0];
    for (var i = 1; i < preArr.length; i++) {
        xorValue ^= preArr[i];
    }

    xorValue ^= 41;
    xorValue ^= calculateDateTime();
    xorValue ^= 6;
    xorValue ^= ((timestamp - timestamp + 3) & 255);
    xorValue ^= (timestamp & 255);
    xorValue ^= (timestamp >> 8 & 255);
    xorValue ^= (timestamp >> 16 & 255);
    xorValue ^= (timestamp >> 24 & 255);
    xorValue ^= (((timestamp - 1) / 256 / 256 / 256 / 256) & 255);
    xorValue ^= (((timestamp - 1) / 256 / 256 / 256 / 256 / 256) & 255);
    xorValue ^= ((1 | +false << 6 | 0) % 256) & 255;
    xorValue ^= ((1 | +false << 6 | 0) / 256) & 255;

    var fixSlice = mouseTrackArr.slice(0, 5);
    xorValue ^= fixSlice[4] & 255;
    xorValue ^= fixSlice[4] >> 8 & 255;
    xorValue ^= fixSlice[0];
    xorValue ^= fixSlice[1];
    xorValue ^= fixSlice[2];
    xorValue ^= fixSlice[3];

    xorValue ^= (0 | 1 << 2) | (1 << 3) & 255;
    xorValue ^= ((0 | 1 << 2) | (1 << 3) & 255) >> 8 & 255;
    xorValue ^= ((0 | 1 << 2) | (1 << 3) & 255) >> 16 & 255;
    xorValue ^= ((0 | 1 << 2) | (1 << 3) & 255) >> 24 & 255;

    xorValue ^= reqParamsArr[9];
    xorValue ^= reqParamsArr[18];
    xorValue ^= reqParamsArr[3];

    xorValue ^= dhzxParamsArr[10];
    xorValue ^= dhzxParamsArr[19];
    xorValue ^= dhzxParamsArr[4];

    xorValue ^= userAgentArr[11];
    xorValue ^= userAgentArr[21];
    xorValue ^= userAgentArr[5];

    var tsMinus1 = timestamp - 1;
    xorValue ^= tsMinus1 & 255;
    xorValue ^= tsMinus1 >> 8 & 255;
    xorValue ^= tsMinus1 >> 16 & 255;
    xorValue ^= tsMinus1 >> 24 & 255;
    xorValue ^= ((tsMinus1 / 256 / 256 / 256 / 256) & 255);
    xorValue ^= ((tsMinus1 / 256 / 256 / 256 / 256 / 256) & 255);

    xorValue ^= 3;

    var val1 = mouseTrackArr[8];
    xorValue ^= val1 & 255;
    xorValue ^= val1 >> 8 & 255;
    xorValue ^= val1 >> 16 & 255;
    xorValue ^= val1 >> 24 & 255;

    var val2 = mouseTrackArr[9];
    xorValue ^= val2 & 255;
    xorValue ^= val2 >> 8 & 255;
    xorValue ^= val2 >> 16 & 255;
    xorValue ^= val2 >> 24 & 255;

    xorValue ^= systemParamsArr.length & 255;
    xorValue ^= systemParamsArr.length >> 8 & 255;
    xorValue ^= timeArr.length & 255;
    xorValue ^= timeArr.length >> 8 & 255;

    console.log("lastNumArr:", [xorValue]);
    return [xorValue];
}

function getLen50Arr(reqParamsArr, dhzxParamsArr, userAgentArr, systemParamsArr, timeArr) {
    var arr = [];
    var fixSlice = mouseTrackArr.slice(0, 5);

    arr[0] = (timestamp / 256 / 256 / 256 / 256 / 256) & 255;
    arr[1] = (0 | 1 << 2 | 1 << 3) & 255;
    arr[2] = userAgentArr[11];
    arr[3] = (timestamp - 1) >> 8 & 255;
    arr[4] = mouseTrackArr[9] >> 16 & 255;
    arr[5] = timestamp & 255;
    arr[6] = 11881 >> 24 & 255;
    arr[7] = (1 << 3 | 8) >> 8 & 255;
    arr[8] = 1 % 256;
    arr[9] = reqParamsArr[18];
    arr[10] = fixSlice[4] & 255;
    arr[11] = 3;
    arr[12] = reqParamsArr[3];
    arr[13] = mouseTrackArr[8] >> 8 & 255;
    arr[14] = (timestamp - timestamp + 3) & 255;
    arr[15] = reqParamsArr[9];
    arr[16] = (timestamp - 1) / 256 / 256 / 256 / 256 & 255;
    arr[17] = (1 << 3 | 8 & 255) >> 24 & 255;
    arr[18] = timestamp >> 8 & 255;
    arr[19] = 6383 & 255;
    arr[20] = calculateDateTime();
    arr[21] = dhzxParamsArr[4];
    arr[22] = timestamp >> 16 & 255;
    arr[23] = mouseTrackArr[8] >> 16 & 255;
    arr[24] = userAgentArr[5];
    arr[25] = fixSlice[0];
    arr[26] = (timestamp - 1) >> 16 & 255;
    arr[27] = (timestamp - 1) >> 24 & 255;
    arr[28] = 6;
    arr[29] = mouseTrackArr[9] >> 8 & 255;
    arr[30] = fixSlice[1];
    arr[31] = mouseTrackArr[9] >> 24 & 255;
    arr[32] = userAgentArr[21];
    arr[33] = dhzxParamsArr[10];
    arr[34] = fixSlice[2];
    arr[35] = fixSlice[4] >> 8 & 255;
    arr[36] = timestamp / 256 / 256 / 256 / 256 & 255;
    arr[37] = mouseTrackArr[8] & 255;
    arr[38] = dhzxParamsArr[19];
    arr[39] = fixSlice[3];
    arr[40] = ((timestamp - 1) / 256 / 256 / 256 / 256 / 256) & 255;
    arr[41] = (1 << 3 | 8 & 255) >> 16 & 255;
    arr[42] = (+false << 6 | 0 / 256) & 255;
    arr[43] = 41;
    arr[44] = (timestamp - 1) & 255;
    arr[45] = timestamp >> 24 & 255;
    arr[46] = systemParamsArr.length & 255;
    arr[47] = systemParamsArr.length >> 8 & 255;
    arr[48] = timeArr.length & 255;
    arr[49] = timeArr.length >> 8 & 255 - 1;

    console.log("len50Arr:", arr);
    return arr;
}

function getArr(inputArr) {
    var result = [];

    for (var i = 2; i < inputArr.length; i += (i + 1) % 3 === 0 ? 3 : (i + 1) % 3) {
        var rand = getRandomByte(1000) & 255;

        var seed1 = rand & mixSeedArr[0];
        var r1 = seed1 | inputArr[i - 2] & mixSeedArr[1];
        result.push(r1);

        var seed2 = rand & mixSeedArr[2];
        var r2 = seed2 | inputArr[i - 1] & mixSeedArr[3];
        result.push(r2);

        var seed3 = rand & mixSeedArr[4];
        var r3 = seed3 & mixSeedArr[4] | inputArr[i] & mixSeedArr[5];
        result.push(r3);

        var seed4 = inputArr[i - 2] & mixSeedArr[0];
        var r4 = seed4 | inputArr[i - 1] & mixSeedArr[2] | inputArr[i] & mixSeedArr[4];
        result.push(r4);
    }

    var remaining = inputArr.length % 3;
    if (remaining > 0) {
        var startIndex = inputArr.length - remaining;
        for (var j = startIndex; j < inputArr.length; j++) {
            result.push(inputArr[j]);
        }
    }

    console.log("resArr:\n%s\nlen:%s", result, result.length);
    return result;
}

// 模块导出
exports.getRandomPreForBase64 = getRandomPreForBase64;
exports.getSystemParamsArr = getSystemParamsArr;
exports.getTimeArr = getTimeArr;
exports.getRandomPreForRc4Part1 = getRandomPreForRc4Part1;
exports.getRandomPreForRc4Part2 = getRandomPreForRc4Part2;
exports.getLastNumArr = getLastNumArr;
exports.getLen50Arr = getLen50Arr;
exports.getArr = getArr;
