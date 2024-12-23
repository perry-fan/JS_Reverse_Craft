import json
import re
import string
from io import BytesIO

from PIL import Image
import requests
from datetime import datetime
import random
from loguru import logger
import subprocess
from functools import partial

# 确保 subprocess.Popen 使用 utf-8 编码
subprocess.Popen = partial(subprocess.Popen, encoding='utf-8')
import execjs

# 配置
CONFIG = {
    "js_enc_path": './tools/enc.js',
    "img_bg_path": './img/乱序缺口背景图.jpg',
    "img_slice_path": './img/滑块.png'
}


# 封装文件读取函数，避免重复代码
def read_js_file(file_path):
    try:
        with open(file_path, "r", encoding="utf-8") as file:
            return file.read()
    except Exception as e:
        logger.error(f"Error reading {file_path}: {e}")
        return None


# 通用函数：调用 JS 文件中的指定函数
def call_js_function(js_file_path, function_name, *args):
    """
    读取指定的 JS 文件并调用其中的函数。

    :param js_file_path: JS 文件路径
    :param function_name: 要调用的 JS 函数名称
    :param args: 传递给 JS 函数的参数
    :return: JS 函数的返回值
    """
    js_code = read_js_file(js_file_path)
    if js_code is None:
        logger.error(f"Failed to read {js_file_path}.")
        return None

    # 编译 JS 代码
    js_ctx = execjs.compile(js_code)

    # 调用 JS 函数并返回结果
    result = js_ctx.call(function_name, *args)
    # logger.info(f"Called {function_name} with arguments {args}, result: {result}")
    return result


def register_slide():
    headers = {
        "accept": "application/json, text/javascript, */*; q=0.01",
        "accept-language": "zh-CN,zh;q=0.9",
        "cache-control": "no-cache",
        "pragma": "no-cache",
        "priority": "u=1, i",
        "referer": "https://www.geetest.com/demo/slide-float.html",
        "sec-ch-ua": "\"Google Chrome\";v=\"131\", \"Chromium\";v=\"131\", \"Not_A Brand\";v=\"24\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        "x-requested-with": "XMLHttpRequest"
    }
    cookies = {
        "sensorsdata2015jssdkcross": "%7B%22distinct_id%22%3A%221916d5ff0b73ec-004de37c3e160da-26001e51-1600000-1916d5ff0b814af%22%2C%22first_id%22%3A%22%22%2C%22props%22%3A%7B%22%24latest_traffic_source_type%22%3A%22%E7%9B%B4%E6%8E%A5%E6%B5%81%E9%87%8F%22%2C%22%24latest_search_keyword%22%3A%22%E6%9C%AA%E5%8F%96%E5%88%B0%E5%80%BC_%E7%9B%B4%E6%8E%A5%E6%89%93%E5%BC%80%22%2C%22%24latest_referrer%22%3A%22%22%2C%22%24latest_landing_page%22%3A%22https%3A%2F%2Fwww.geetest.com%2Fcontact%23report%22%7D%2C%22%24device_id%22%3A%221916d5ff0b73ec-004de37c3e160da-26001e51-1600000-1916d5ff0b814af%22%7D",
        "Hm_lvt_25b04a5e7a64668b9b88e2711fb5f0c4": "1734855808",
        "Hm_lpvt_25b04a5e7a64668b9b88e2711fb5f0c4": "1734855808",
        "HMACCOUNT": "4FB6D0D55FD23D59"
    }
    url = "https://www.geetest.com/demo/gt/register-slide"
    params = {
        "t": get_timestamp()
    }
    response = requests.get(url, headers=headers, cookies=cookies, params=params)
    result = response.json()
    return result


def get_timestamp():
    # 获取当前时间
    now = datetime.now()
    # 获取时间戳（秒）
    timestamp_seconds = now.timestamp()
    # 转换为毫秒
    timestamp_milliseconds = int(timestamp_seconds * 1000)

    # print(f"当前时间戳（毫秒）：{timestamp_milliseconds}")
    return timestamp_milliseconds


def get_random_str():
    str_list = [random.choice(string.digits + string.ascii_letters) for i in range(16)]
    random_str = ''.join(str_list)
    return random_str


def get_rp(plaintext):
    enc_code = read_js_file(CONFIG["js_enc_path"])
    if enc_code is None:
        logger.error("Failed to read full_page.js.")
        return
    enc_ctx = execjs.compile(enc_code)
    rp = enc_ctx.call("md5", plaintext)
    return rp


def geetest_first_get(w, gt, challenge):
    headers = {
        "accept": "*/*",
        "accept-language": "zh-CN,zh;q=0.9",
        "cache-control": "no-cache",
        "pragma": "no-cache",
        "referer": "https://www.geetest.com/",
        "sec-ch-ua": "\"Google Chrome\";v=\"131\", \"Chromium\";v=\"131\", \"Not_A Brand\";v=\"24\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-dest": "script",
        "sec-fetch-mode": "no-cors",
        "sec-fetch-site": "same-site",
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
    }
    cookies = {
        "GeeTestUser": "8efcaad98d7b3bff93f9a91aa6ca0222",
        "GeeTestAjaxUser": "305b5139c8814a63b20d59c0ea445f56",
        "sensorsdata2015jssdkcross": "%7B%22distinct_id%22%3A%221916d5ff0b73ec-004de37c3e160da-26001e51-1600000-1916d5ff0b814af%22%2C%22first_id%22%3A%22%22%2C%22props%22%3A%7B%22%24latest_traffic_source_type%22%3A%22%E7%9B%B4%E6%8E%A5%E6%B5%81%E9%87%8F%22%2C%22%24latest_search_keyword%22%3A%22%E6%9C%AA%E5%8F%96%E5%88%B0%E5%80%BC_%E7%9B%B4%E6%8E%A5%E6%89%93%E5%BC%80%22%2C%22%24latest_referrer%22%3A%22%22%2C%22%24latest_landing_page%22%3A%22https%3A%2F%2Fwww.geetest.com%2Fcontact%23report%22%7D%2C%22%24device_id%22%3A%221916d5ff0b73ec-004de37c3e160da-26001e51-1600000-1916d5ff0b814af%22%7D",
        "Hm_lvt_25b04a5e7a64668b9b88e2711fb5f0c4": "1734855808",
        "Hm_lpvt_25b04a5e7a64668b9b88e2711fb5f0c4": "1734855808",
        "HMACCOUNT": "4FB6D0D55FD23D59"
    }
    url = "https://apiv6.geetest.com/get.php"
    params = {
        "gt": gt,
        "challenge": challenge,
        "lang": "zh-cn",
        "pt": "0",
        "client_type": "web",
        "w": w,
        "callback": "geetest_" + str(get_timestamp()),
    }
    response = requests.get(url, headers=headers, cookies=cookies, params=params)
    # 使用正则表达式提取 JSON 字符串
    json_str = re.search(r'geetest_\d+\((.*)\)', response.text).group(1)

    # 将提取出来的 JSON 字符串解析为 Python 字典
    data = json.loads(json_str)
    return data


def geetest_second_get(gt, challenge):
    headers = {
        "Accept": "*/*",
        "Accept-Language": "zh-CN,zh;q=0.9",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "Pragma": "no-cache",
        "Referer": "https://www.geetest.com/",
        "Sec-Fetch-Dest": "script",
        "Sec-Fetch-Mode": "no-cors",
        "Sec-Fetch-Site": "cross-site",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        "sec-ch-ua": "\"Google Chrome\";v=\"131\", \"Chromium\";v=\"131\", \"Not_A Brand\";v=\"24\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\""
    }
    url = "https://api.geevisit.com/get.php"
    params = {
        "is_next": "true",
        "type": "slide3",
        "gt": gt,
        "challenge": challenge,
        "lang": "zh-cn",
        "https": "true",
        "protocol": "https://",
        "offline": "false",
        "product": "embed",
        "api_server": "api.geevisit.com",
        "isPC": "true",
        "autoReset": "true",
        "width": "100%",
        "callback": "geetest_" + str(get_timestamp()),
    }
    response = requests.get(url, headers=headers, params=params)
    # 使用正则表达式提取 JSON 字符串
    json_str = re.search(r'geetest_\d+\((.*)\)', response.text).group(1)
    # 将提取出来的 JSON 字符串解析为 Python 字典
    data = json.loads(json_str)
    return data


def get_slice_png(slice_url):
    headers = {
        "accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
        "accept-language": "zh-CN,zh;q=0.9",
        "cache-control": "no-cache",
        "origin": "https://www.geetest.com",
        "pragma": "no-cache",
        "priority": "i",
        "referer": "https://www.geetest.com/",
        "sec-ch-ua": "\"Google Chrome\";v=\"131\", \"Chromium\";v=\"131\", \"Not_A Brand\";v=\"24\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-dest": "image",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site",
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
    }
    url = "https://static.geetest.com/" + slice_url
    response = requests.get(url, headers=headers)
    image = Image.open(BytesIO(response.content))
    image.save(CONFIG["img_slice_path"], 'PNG')


def get_bg_png(bg_url):
    headers = {
        "accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
        "accept-language": "zh-CN,zh;q=0.9",
        "cache-control": "no-cache",
        "origin": "https://www.geetest.com",
        "pragma": "no-cache",
        "priority": "i",
        "referer": "https://www.geetest.com/",
        "sec-ch-ua": "\"Google Chrome\";v=\"131\", \"Chromium\";v=\"131\", \"Not_A Brand\";v=\"24\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-dest": "image",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site",
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
    }
    url = "https://static.geetest.com/" + bg_url
    response = requests.get(url, headers=headers)
    image = Image.open(BytesIO(response.content))
    image.save(CONFIG["img_bg_path"], 'jpeg')
    restore_picture()


def get_full_bg_png(full_bg_url):
    headers = {
        "accept": "image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8",
        "accept-language": "zh-CN,zh;q=0.9",
        "cache-control": "no-cache",
        "origin": "https://www.geetest.com",
        "pragma": "no-cache",
        "priority": "i",
        "referer": "https://www.geetest.com/",
        "sec-ch-ua": "\"Google Chrome\";v=\"131\", \"Chromium\";v=\"131\", \"Not_A Brand\";v=\"24\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-dest": "image",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-site",
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"
    }
    url = "https://static.geetest.com/" + full_bg_url
    response = requests.get(url, headers=headers)
    image = Image.open(BytesIO(response.content))
    image.save('./img/乱序背景图.jpg', 'jpeg')
    restore_picture()


def geetest_first_ajax(gt, challenge, w2):
    headers = {
        "Accept": "*/*",
        "Accept-Language": "zh-CN,zh;q=0.9",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "Pragma": "no-cache",
        "Referer": "https://www.geetest.com/",
        "Sec-Fetch-Dest": "script",
        "Sec-Fetch-Mode": "no-cors",
        "Sec-Fetch-Site": "cross-site",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        "sec-ch-ua": "\"Google Chrome\";v=\"131\", \"Chromium\";v=\"131\", \"Not_A Brand\";v=\"24\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\""
    }
    url = "https://api.geevisit.com/ajax.php"
    params = {
        "gt": gt,
        "challenge": challenge,
        "lang": "zh-cn",
        "pt": "0",
        "client_type": "web",
        "w": w2,
        "callback": "geetest_" + str(get_timestamp()),
    }
    response = requests.get(url, headers=headers, params=params)
    return response


def geetest_second_ajax(gt2, challenge2, w3):
    headers = {
        "Accept": "*/*",
        "Accept-Language": "zh-CN,zh;q=0.9",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "Pragma": "no-cache",
        "Referer": "https://www.geetest.com/",
        "Sec-Fetch-Dest": "script",
        "Sec-Fetch-Mode": "no-cors",
        "Sec-Fetch-Site": "cross-site",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
        "sec-ch-ua": "\"Google Chrome\";v=\"131\", \"Chromium\";v=\"131\", \"Not_A Brand\";v=\"24\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\""
    }
    url = "https://api.geevisit.com/ajax.php"
    params = {
        "gt": gt2,
        "challenge": challenge2,
        "lang": "zh-cn",
        "%24_BCN": "0",
        "client_type": "web",
        "w": w3,
        "callback": "geetest_" + str(get_timestamp()),
    }
    response = requests.get(url, headers=headers, params=params)
    json_str = re.search(r'geetest_\d+\((.*)\)', response.text).group(1)
    data = json.loads(json_str)
    return data


def login(challenge, validate):
    """模拟用户登录"""
    try:
        headers = {
            "accept": "application/json, text/javascript, */*; q=0.01",
            "accept-language": "zh-CN,zh;q=0.9",
            "cache-control": "no-cache",
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            "origin": "https://www.geetest.com",
            "pragma": "no-cache",
            "priority": "u=1, i",
            "referer": "https://www.geetest.com/demo/slide-float.html",
            "sec-ch-ua": "\"Google Chrome\";v=\"131\", \"Chromium\";v=\"131\", \"Not_A Brand\";v=\"24\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"Windows\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36",
            "x-requested-with": "XMLHttpRequest"
        }
        cookies = {
            "sensorsdata2015jssdkcross": "%7B%22distinct_id%22%3A%221916d5ff0b73ec-004de37c3e160da-26001e51-1600000-1916d5ff0b814af%22%2C%22first_id%22%3A%22%22%2C%22props%22%3A%7B%22%24latest_traffic_source_type%22%3A%22%E7%9B%B4%E6%8E%A5%E6%B5%81%E9%87%8F%22%2C%22%24latest_search_keyword%22%3A%22%E6%9C%AA%E5%8F%96%E5%88%B0%E5%80%BC_%E7%9B%B4%E6%8E%A5%E6%89%93%E5%BC%80%22%2C%22%24latest_referrer%22%3A%22%22%2C%22%24latest_landing_page%22%3A%22https%3A%2F%2Fwww.geetest.com%2Fcontact%23report%22%7D%2C%22%24device_id%22%3A%221916d5ff0b73ec-004de37c3e160da-26001e51-1600000-1916d5ff0b814af%22%7D",
            "Hm_lvt_25b04a5e7a64668b9b88e2711fb5f0c4": "1734855808",
            "Hm_lpvt_25b04a5e7a64668b9b88e2711fb5f0c4": "1734855808",
            "HMACCOUNT": "4FB6D0D55FD23D59"
        }
        url = "https://www.geetest.com/demo/gt/validate-slide"
        data = {
            "geetest_challenge": challenge,
            "geetest_validate": validate,
            "geetest_seccode": validate + "|jordan",
        }
        response = requests.post(url, headers=headers, cookies=cookies, data=data)
        logger.info(f"Login response: {response.json()}")
        return response.json()
    except Exception as e:
        logger.error(f"Error in login: {e}")
        raise


def restore_picture():
    img_list = ["./img/乱序缺口背景图.jpg", "./img/乱序背景图.jpg"]
    for index, img in enumerate(img_list):
        image = Image.open(img)
        s = Image.new("RGBA", (260, 160))
        ut = [39, 38, 48, 49, 41, 40, 46, 47, 35, 34, 50, 51, 33, 32, 28, 29, 27, 26, 36, 37, 31, 30, 44, 45, 43, 42,
              12, 13, 23, 22, 14, 15, 21, 20, 8, 9, 25, 24, 6, 7, 3, 2, 0, 1, 11, 10, 4, 5, 19, 18, 16, 17]
        height_half = 80
        for inx in range(52):
            c = ut[inx] % 26 * 12 + 1
            u = height_half if ut[inx] > 25 else 0
            l_ = image.crop(box=(c, u, c + 10, u + 80))
            s.paste(l_, box=(inx % 26 * 10, 80 if inx > 25 else 0))

        if index == 0:
            s.save("./img/缺口背景图片.png")

        else:
            s.save("./img/背景图片.png")

# restore_picture()
