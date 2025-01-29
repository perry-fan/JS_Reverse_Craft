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


def write_js_file(file_path, source_code):
    try:
        with open(file_path, "w", encoding="utf-8") as file:
            return file.write(source_code)
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
