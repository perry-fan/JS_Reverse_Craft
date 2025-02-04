from get_shirley import *
from tools.tool import *

# 配置
CONFIG = {
    "get_bella_path": './get_bella.js',
}


def start():
    shirley, api_token = get_shirley()
    print(shirley, api_token)
    bella = call_js_function(CONFIG["get_bella_path"], "get_bella", shirley)
    print(bella)


if __name__ == "__main__":
    start()
