//  ivData，最好自己跟代码练习找下，我这里直接贴出来了
const ivData = {
    "words": [808464432, 808464432, 808464432, 808464432],
    "sigBytes": 16
};

// 将 `words` 转换为字节数组
let byteArray = [];
for (let i = 0; i < ivData.words.length; i++) {
    let word = ivData.words[i];
    byteArray.push((word >> 24) & 0xFF);  // 获取字节
    byteArray.push((word >> 16) & 0xFF);
    byteArray.push((word >> 8) & 0xFF);
    byteArray.push(word & 0xFF);
}

// 将字节数组转换为字符串
let ivString = String.fromCharCode.apply(null, byteArray);

console.log("IV as String:", ivString);


