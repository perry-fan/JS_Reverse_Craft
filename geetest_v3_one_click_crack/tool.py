import json
import re
import string
import random
import requests
from datetime import datetime
from loguru import logger


def get_headers(base_type="default"):
    """生成请求头"""
    default_headers = {
        "accept": "*/*",
        "accept-language": "zh-CN,zh;q=0.9",
        "cache-control": "no-cache",
        "pragma": "no-cache",
        "user-agent": (
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
            "(KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36"
        ),
    }
    specific_headers = {
        "register": {
            "referer": "https://www.geetest.com/demo/fullpage.html",
            "x-requested-with": "XMLHttpRequest",
        },
        "geetest": {
            "referer": "https://www.geetest.com/",
        },
        "validate": {
            "content-type": "application/x-www-form-urlencoded; charset=UTF-8",
            "origin": "https://www.geetest.com",
        },
    }
    headers = default_headers.copy()
    if base_type in specific_headers:
        headers.update(specific_headers[base_type])
    return headers


def get_cookies():
    """生成请求的 cookies"""
    return {
        "sensorsdata2015jssdkcross": (
            "%7B%22distinct_id%22%3A%221916d5ff0b73ec-004de37c3e160da-26001e51-1600000"
            "-1916d5ff0b814af%22%2C%22first_id%22%3A%22%22%2C%22props%22%3A%7B%22%24"
            "latest_traffic_source_type%22%3A%22%E8%87%AA%E7%84%B6%E6%90%9C%E7%B4%A2"
            "%E6%B5%81%E9%87%8F%22%2C%22%24latest_search_keyword%22%3A%22%E6%9C%AA%"
            "E5%8F%96%E5%88%B0%E5%80%BC%22%2C%22%24latest_referrer%22%3A%22https%3A%"
            "2F%2Fwww.baidu.com%2Flink%22%2C%22%24latest_landing_page%22%3A%22https%"
            "3A%2F%2Fwww2.geetest.com%2F%22%7D%2C%22%24device_id%22%3A%221916d5ff0b7"
            "3ec-004de37c3e160da-26001e51-1600000-1916d5ff0b814af%22%7D"
        ),
    }


def register_full_page():
    """注册全页面"""
    try:
        url = "https://demos.geetest.com/gt/register-fullpage"
        params = {"t": get_timestamp()}
        response = requests.get(url, headers=get_headers("register"), cookies=get_cookies(), params=params)
        response.raise_for_status()
        result = response.json()
        logger.info(f"Register response: {result}")
        return result
    except Exception as e:
        logger.error(f"Error in register_full_page: {e}")
        raise


def geetest_get(w, gt, challenge):
    """获取 Geetest 验证数据"""
    try:
        url = "https://apiv6.geetest.com/get.php"
        params = {
            "gt": gt,
            "challenge": challenge,
            "lang": "zh-cn",
            "pt": 0,
            "client_type": "web",
            "w": w,
            "callback": f"geetest_{get_timestamp()}",
        }
        response = requests.get(url, headers=get_headers("geetest"), cookies=get_cookies(), params=params)
        response.raise_for_status()
        json_str = re.search(r'geetest_\d+\((.*)\)', response.text).group(1)
        data = json.loads(json_str)
        logger.info(f"Geetest data: {data}")
        return data
    except Exception as e:
        logger.error(f"Error in geetest_get: {e}")
        raise


def valid(gt, challenge, w):
    """验证用户数据"""
    try:
        url = "https://api.geevisit.com/ajax.php"
        params = {
            "gt": gt,
            "challenge": challenge,
            "lang": "zh-cn",
            "pt": "0",
            "client_type": "web",
            "w": w,
            "callback": f"geetest_{get_timestamp()}",
        }
        response = requests.get(url, headers=get_headers("default"), params=params)
        response.raise_for_status()
        json_str = re.search(r'geetest_\d+\((.*)\)', response.text).group(1)
        data = json.loads(json_str)
        logger.info(f"Validation result: {data}")
        return data
    except Exception as e:
        logger.error(f"Error in valid: {e}")
        raise


def login(challenge, validate):
    """模拟用户登录"""
    try:
        url = "https://demos.geetest.com/gt/validate-fullpage"
        data = {
            "geetest_challenge": challenge,
            "geetest_validate": validate,
            "geetest_seccode": validate + "|jordan",
        }
        response = requests.post(url, headers=get_headers("validate"), cookies=get_cookies(), data=data)
        response.raise_for_status()
        logger.info(f"Login response: {response.json()}")
        return response.json()
    except Exception as e:
        logger.error(f"Error in login: {e}")
        raise


def get_timestamp():
    """获取当前时间戳（毫秒）"""
    timestamp = int(datetime.now().timestamp() * 1000)
    logger.debug(f"Timestamp: {timestamp}")
    return timestamp


def get_random_str(length=16):
    """生成随机字符串"""
    random_str = ''.join(random.choices(string.ascii_letters + string.digits, k=length))
    logger.debug(f"Random string: {random_str}")
    return random_str
