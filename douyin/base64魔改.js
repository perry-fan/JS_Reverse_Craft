
function base64Encode(input) {
    const base64Chars = 'ckdp1h4ZKsUB80/Mfvw36XIgR25+WQAlEi7NLboqYTOPuzmFjJnryx9HVGDaStCe';

    // 将输入字符串转换为二进制字符串
    let binaryString = '';
    for (let i = 0; i < input.length; i++) {
        binaryString += input.charCodeAt(i).toString(2).padStart(8, '0'); // 每个字符转为8位二进制
    }

    // 按 6 位一组拆分
    const chunks = [];
    for (let i = 0; i < binaryString.length; i += 6) {
        chunks.push(binaryString.slice(i, i + 6));
    }

    // 如果最后一组少于 6 位，进行填充
    if (chunks[chunks.length - 1].length < 6) {
        chunks[chunks.length - 1] = chunks[chunks.length - 1].padEnd(6, '0');
    }

    // 查找对应的 Base64 字符
    let base64Encoded = chunks.map(chunk => {
        const index = parseInt(chunk, 2); // 将二进制转换为数字
        return base64Chars.charAt(index);
    }).join('');

    // 添加填充字符
    while (base64Encoded.length % 4 !== 0) {
        base64Encoded += '=';
    }

    return base64Encoded;
}

function base64Encode2(input) {
    const base64Chars = 'Dkdpgh2ZmsQB80/MfvV36XI1R45-WUAlEixNLwoqYTOPuzKFjJnry79HbGcaStCe';

    // 将输入字符串转换为二进制字符串
    let binaryString = '';
    for (let i = 0; i < input.length; i++) {
        binaryString += input.charCodeAt(i).toString(2).padStart(8, '0'); // 每个字符转为8位二进制
    }

    // 按 6 位一组拆分
    const chunks = [];
    for (let i = 0; i < binaryString.length; i += 6) {
        chunks.push(binaryString.slice(i, i + 6));
    }

    // 如果最后一组少于 6 位，进行填充
    if (chunks[chunks.length - 1].length < 6) {
        chunks[chunks.length - 1] = chunks[chunks.length - 1].padEnd(6, '0');
    }

    // 查找对应的 Base64 字符
    let base64Encoded = chunks.map(chunk => {
        const index = parseInt(chunk, 2); // 将二进制转换为数字
        return base64Chars.charAt(index);
    }).join('');

    // 添加填充字符
    while (base64Encoded.length % 4 !== 0) {
        base64Encoded += '=';
    }

    return base64Encoded;
}

function base64Decode(encoded) {
    const base64Chars = 'ckdp1h4ZKsUB80/Mfvw36XIgR25+WQAlEi7NLboqYTOPuzmFjJnryx9HVGDaStCe';

    // 去除填充字符 '='
    let sanitizedInput = encoded.replace(/=/g, '');

    // 将 Base64 字符转换回 6 位二进制字符串
    let binaryString = '';
    for (let i = 0; i < sanitizedInput.length; i++) {
        let index = base64Chars.indexOf(sanitizedInput[i]);
        if (index === -1) {
            throw new Error(`Invalid character found in input: ${sanitizedInput[i]}`);
        }
        binaryString += index.toString(2).padStart(6, '0');
    }

    // 按 8 位一组拆分
    let decodedString = '';
    for (let i = 0; i < binaryString.length; i += 8) {
        let byte = binaryString.slice(i, i + 8);
        if (byte.length === 8) { // 忽略不足 8 位的部分（可能是填充导致）
            decodedString += String.fromCharCode(parseInt(byte, 2));
        }
    }

    return decodedString;
}

function base64Decode2(encoded) {
    const base64Chars = 'Dkdpgh2ZmsQB80/MfvV36XI1R45-WUAlEixNLwoqYTOPuzKFjJnry79HbGcaStCe';

    // 去除填充字符 '='
    let sanitizedInput = encoded.replace(/=/g, '');

    // 将 Base64 字符转换回 6 位二进制字符串
    let binaryString = '';
    for (let i = 0; i < sanitizedInput.length; i++) {
        let index = base64Chars.indexOf(sanitizedInput[i]);
        if (index === -1) {
            throw new Error(`Invalid character found in input: ${sanitizedInput[i]}`);
        }
        binaryString += index.toString(2).padStart(6, '0');
    }

    // 按 8 位一组拆分
    let decodedString = '';
    for (let i = 0; i < binaryString.length; i += 8) {
        let byte = binaryString.slice(i, i + 8);
        if (byte.length === 8) { // 忽略不足 8 位的部分（可能是填充导致）
            decodedString += String.fromCharCode(parseInt(byte, 2));
        }
    }

    return decodedString;
}



exports.base64Encode=base64Encode
exports.base64Encode2=base64Encode2
exports.base64Decode=base64Decode
exports.base64Decode2=base64Decode2