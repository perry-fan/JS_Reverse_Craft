from tools.tool import *
from bs4 import BeautifulSoup
import requests

CONFIG = {
    "js_env_path": './tools/env.js',
    "js_pre_path": './tools/pre.js',
}


def get_flight_js():
    headers = {
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "accept-language": "zh-CN,zh;q=0.9",
        "cache-control": "no-cache",
        "pragma": "no-cache",
        "priority": "u=0, i",
        "sec-ch-ua": "\"Not A(Brand\";v=\"8\", \"Chromium\";v=\"132\", \"Google Chrome\";v=\"132\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "same-origin",
        "sec-fetch-user": "?1",
        "upgrade-insecure-requests": "1",
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36"
    }
    cookies = {
        "QN1": "000102802f1069cd64082ba6",
        "QN48": "551e2039-eaf5-42e0-89f2-674df3b68b96",
        "QN300": "organic",
        "ctt_june": "1683616182042##iK3wWSX%3DauPwawPwasWRa%3DXwEP3OERgsWstmWSt%2BWRjnEREDEDiRWSXAXsg%3DiK3siK3saKgsWSj%3DVRawaKv8aUPwaUvt",
        "Alina": "c5d51773-0a0196-11422713-8690e003-558967832681",
        "QN601": "8759d566e70f9da389e00be4a77ba010",
        "quinn": "6ad53805188d57deeab79468313106ae35f17a03bc3c4f57130e50761f4d212cf0fd320009eceffa50fec6929c709cc6",
        "QN621": "fr%3Dtouch_index_search",
        "F235": "1738118404960",
        "QN668": "51%2C57%2C53%2C58%2C51%2C56%2C52%2C52%2C52%2C59%2C50%2C53%2C55",
        "ctf_june": "1683616182042##iK3waS2mWwPwawPwa%3DEGaPGGWsHREPkDEPjsXPGTWS2NWPWGWKfhXKt8asHhiK3siK3saKgsVRDOaS3wVKX%2BaUPwaUvt",
        "cs_june": "42698fa1eded19d7c1c3bd2b58a33a517150cc80a75fc4e541c3b91e58f5fc97b28517b9e90095deb7261a7e6ee1fbe8727a8a22efde110d05bc1541e857487eb17c80df7eee7c02a9c1a6a5b97c1179f1d84112f578a016a66f2167abf97f665a737ae180251ef5be23400b098dd8ca"
    }
    url = "https://m.flight.qunar.com/ncs/page/flightlist"
    params = {
        "depCity": "北京",
        "arrCity": "上海",
        "goDate": "2025-01-30",
        "from": "touch_index_search",
        "child": "0",
        "baby": "0",
        "cabinType": "0",
        "_firstScreen": "1",
        "_gogokid": "12"
    }
    response = requests.get(url, headers=headers, cookies=cookies, params=params)

    html_content = response.text
    # 解析 HTML
    soup = BeautifulSoup(html_content, 'html.parser')

    # 获取所有 <script> 标签的内容（不含 src 的内联脚本）
    scripts = [script.string for script in soup.find_all('script') if script.string]
    js_code = scripts[0]

    pattern = r"(\w+\['test'\]\(\w+\['removeCookie'\]\['toString'\]\(\)\)\s*;?)"
    # 替换匹配到的部分为 `true`
    modified_js = re.sub(pattern, "true;", js_code)
    pattern2 = r"(\w+\['[^']+'\]\(\(\!\!\[\]\s*\+\s*''\)\[0x3\]\))"
    # 替换匹配到的部分为 `3`
    modified_js = re.sub(pattern2, "3", modified_js)

    env_code = read_js_file(CONFIG['js_env_path'])
    modified_js = env_code + '\n' + modified_js + '\n' + 'console.log(window._pt_)'
    write_js_file(CONFIG['js_pre_path'], modified_js)
    # print(modified_js)


if __name__ == '__main__':
    get_flight_js()
