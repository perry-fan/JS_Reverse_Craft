function rc4(key, data) {
    // Key-Scheduling Algorithm (KSA)
    let S = new Array(256);
    for (let i = 0; i < 256; i++) {
        S[i] = 255 - i;
    }
    let j = 0;
    for (let i = 0; i < 256; i++) {
        j = (j + j * S[i] + key.charCodeAt(i % key.length)) % 256;
        [S[i], S[j]] = [S[j], S[i]]; // 交换
    }

    // Pseudo-Random Generation Algorithm (PRGA)
    let i = 0, k = 0, result = [];
    for (let n = 0; n < data.length; n++) {
        i = (i + 1) % 256;
        k = (k + S[i]) % 256;
        [S[i], S[k]] = [S[k], S[i]]; // 交换

        let rnd = S[(S[i] + S[k]) % 256]; // 生成伪随机字节
        result.push(String.fromCharCode(data.charCodeAt(n) ^ rnd)); // XOR 进行加密/解密
    }

    return result.join("");
}

exports.rc4 = rc4;


