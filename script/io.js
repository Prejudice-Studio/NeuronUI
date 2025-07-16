
function StringToUTF8Bytes(str) {
    const utf8Bytes = [];
    for (let i = 0; i < str.length; i++) {
        const codePoint = str.codePointAt(i); // 获取完整的 Unicode 代码点
        if (codePoint <= 0x7f) {
            // 单字节字符（0-127）
            utf8Bytes.push(codePoint);
        } else if (codePoint <= 0x7ff) {
            // 双字节字符（128-2047）
            utf8Bytes.push(0xc0 | (codePoint >> 6));
            utf8Bytes.push(0x80 | (codePoint & 0x3f));
        } else if (codePoint <= 0xffff) {
            // 三字节字符（2048-65535）
            utf8Bytes.push(0xe0 | (codePoint >> 12));
            utf8Bytes.push(0x80 | ((codePoint >> 6) & 0x3f));
            utf8Bytes.push(0x80 | (codePoint & 0x3f));
        } else {
            // 四字节字符（65536-1114111）
            utf8Bytes.push(0xf0 | (codePoint >> 18));
            utf8Bytes.push(0x80 | ((codePoint >> 12) & 0x3f));
            utf8Bytes.push(0x80 | ((codePoint >> 6) & 0x3f));
            utf8Bytes.push(0x80 | (codePoint & 0x3f));
        }
    }
    utf8Bytes.push(0); // 字符串结束标志
    return new Uint8Array(utf8Bytes);
}

function UTF8BytesToString(utf8Bytes) {
    let str = "";
    for (let i = 0; i < utf8Bytes.length; ) {
        let byte1 = utf8Bytes[i++];
        if (byte1 === 0) break; // 遇到字符串结束标志

        if (byte1 <= 0x7f) {
            // 单字节字符
            str += String.fromCharCode(byte1);
        } else if (byte1 >> 5 === 0b110) {
            // 双字节字符 (110xxxxx 10xxxxxx)
            let byte2 = utf8Bytes[i++];
            str += String.fromCharCode(((byte1 & 0x1f) << 6) | (byte2 & 0x3f));
        } else if (byte1 >> 4 === 0b1110) {
            // 三字节字符 (1110xxxx 10xxxxxx 10xxxxxx)
            let byte2 = utf8Bytes[i++];
            let byte3 = utf8Bytes[i++];
            str += String.fromCharCode(
                ((byte1 & 0x0f) << 12) | ((byte2 & 0x3f) << 6) | (byte3 & 0x3f)
            );
        } else if (byte1 >> 3 === 0b11110) {
            // 四字节字符 (11110xxx 10xxxxxx 10xxxxxx 10xxxxxx)
            let byte2 = utf8Bytes[i++];
            let byte3 = utf8Bytes[i++];
            let byte4 = utf8Bytes[i++];
            let codePoint =
                ((byte1 & 0x07) << 18) |
                ((byte2 & 0x3f) << 12) |
                ((byte3 & 0x3f) << 6) |
                (byte4 & 0x3f);
            str += String.fromCodePoint(codePoint);
        }
    }
    return str;
}

function malloc(size) {
    return System.syscall('libc.so','malloc', size)
}

function mallocString(str) {
    const bin = StringToUTF8Bytes(str)
    const ptr = malloc(bin.length)
    System.writeAddress(ptr,bin.length,bin.buffer)
    return ptr;
}

function free(ptr) {
    System.syscall('libc.so', 'free', ptr)
}

function fopen(path, mode) {
    return System.syscall('libc.so', 'fopen', path, mode)
}

function fread(ptr, size, count, stream) {
    return Number(System.syscall('libc.so', 'fread', ptr, size, count, stream))
}

function fwrite(ptr, size, count, stream) {
    return Number(System.syscall('libc.so', 'fwrite', ptr, size, count, stream))
}

function fclose(stream) {
    System.syscall('libc.so', 'fclose', stream)
}

function main() {
    const res = getResource('ui')
    const path = mallocString(res + '/ui_main.json');
    const mode = mallocString('r');
    const stream = fopen(path, mode);
    if (stream === 0) {
        console.log('open file failed');
        return
    }
    const readSize = 1024;
    const buffer = malloc(readSize);
    let content = '';
    while (true) {
        const size = fread(buffer, 1, readSize, stream);
        if (size === 0) break;
        const result = System.readAddress(buffer, size)
        content += UTF8BytesToString(new Uint8Array(result));
    }
    console.log(content);
    fclose(stream);
    free(buffer);
    free(path)
    free(mode)
}
