import requests
import subprocess
from functools import partial

from loguru import logger

# 确保 subprocess.Popen 使用 utf-8 编码
subprocess.Popen = partial(subprocess.Popen, encoding='utf-8')
import execjs

CONFIG = {
    "js_enc_path": './test.js',
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


def req():
    a_bogus = call_js_function(CONFIG["js_enc_path"], "get_a_bogus")
    logger.info(a_bogus)
    import requests

    import requests

    headers = {
        "accept": "application/json, text/plain, */*",
        "accept-language": "zh-CN,zh;q=0.9",
        "cache-control": "no-cache",
        "pragma": "no-cache",
        "priority": "u=1, i",
        "referer": "https://www.douyin.com/search/%E4%BA%8C%E6%88%98?modal_id=7488296898260929846&type=video",
        "sec-ch-ua": "\"Chromium\";v=\"134\", \"Not:A-Brand\";v=\"24\", \"Google Chrome\";v=\"134\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "uifid": "29d6bea3e5a6c157a08a212e1912b5e8a78666ece26be56100fa19e58a63a45b7430374aec04099be6c42331d06e5bc0adc5ce0ec014f4da989724f3af5a0acd164bcadf1e1b87ddaf6a61d9f07f94e7e32b7e22c5cd273508899d257064cec330cb14d35d050fd4ff9596013d70b5c125cc212120afe6d0573a29d018f9992ca7328a065ff03c648acbb83985073c84f6d5e32db8b9eea3f6b8542dc3d6fa6a",
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/134.0.0.0 Safari/537.36"
    }
    cookies = {
        "bd_ticket_guard_client_web_domain": "2",
        "__51vcke__3HVlmB9e1VFRstol": "94de78d5-389b-5e6f-b7ad-4ca246901351",
        "__51vuft__3HVlmB9e1VFRstol": "1715411683474",
        "UIFID_TEMP": "29d6bea3e5a6c157a08a212e1912b5e8a78666ece26be56100fa19e58a63a45b75b5e624fe7718b5f9976d6de167f9d782506f33097bc6d95da478fce94b4c53c43fc9a8e3fc45400610be2b699a0af8",
        "fpk1": "U2FsdGVkX19H1oXon7bBQpiRPITQOYXKzZhXRD631gbHlF6pr02DJ46SJewfi+XRGmj1z+fVYZKEL41DZs5elw==",
        "fpk2": "c92baae71318dc81de51a663df2f8b4f",
        "UIFID": "29d6bea3e5a6c157a08a212e1912b5e8a78666ece26be56100fa19e58a63a45b7430374aec04099be6c42331d06e5bc0adc5ce0ec014f4da989724f3af5a0acd164bcadf1e1b87ddaf6a61d9f07f94e7e32b7e22c5cd273508899d257064cec330cb14d35d050fd4ff9596013d70b5c125cc212120afe6d0573a29d018f9992ca7328a065ff03c648acbb83985073c84f6d5e32db8b9eea3f6b8542dc3d6fa6a",
        "__51uvsct__3HVlmB9e1VFRstol": "375",
        "hevc_supported": "true",
        "n_mh": "M1qoBvW8dNZM-Cn_G5hY1crp6j40D7qhCkN3Z1Slaw4",
        "SelfTabRedDotControl": "%5B%5D",
        "store-region": "cn-bj",
        "store-region-src": "uid",
        "volume_info": "%7B%22isUserMute%22%3Afalse%2C%22isMute%22%3Atrue%2C%22volume%22%3A0.5%7D",
        "ttwid": "1%7CctDeIFiNU5bwf6qBAZmNOZZbg5Ls-vimGQ8R4H7HGyQ%7C1741830223%7C73ca6670d3d91ff5c05f1b622bf0c3ecf2550475e9a409eba4ed7ec13668288e",
        "s_v_web_id": "verify_m8cnk94t_xuuyL0Al_ontk_4rsS_95m7_WdpfKi2G4a9H",
        "dy_swidth": "1600",
        "dy_sheight": "1000",
        "is_dash_user": "1",
        "publish_badge_show_info": "%220%2C0%2C0%2C1742962420971%22",
        "FOLLOW_NUMBER_YELLOW_POINT_INFO": "%22MS4wLjABAAAA6h8gKJWMsFsvHl_U3_P6imwEZi47OQz0guzJ5NcCfqaU6Amzpl7lZqo3r54VhX8l%2F1743004800000%2F1742962424620%2F1742962419320%2F0%22",
        "my_rd": "2",
        "login_time": "1742962436920",
        "FORCE_LOGIN": "%7B%22videoConsumedRemainSeconds%22%3A180%7D",
        "SearchMultiColumnLandingAbVer": "1",
        "SEARCH_RESULT_LIST_TYPE": "%22multi%22",
        "SearchSingleColumnExitCount": "0",
        "download_guide": "%223%2F20250326%2F0%22",
        "xgplayer_user_id": "110869007922",
        "odin_tt": "1b6a3b11a2cc9183c5a6c27384e4fb86063624d7debb03e9fdb636491c413d69ffcd9b2c17028215204eaa19a35b87cd27aa253db6075e95142f7e046bb0a3c7e97ad826a509080324cd7bbf29c531c5",
        "passport_csrf_token": "cb14655a9b1769d8e27b52dc2ca3ddb7",
        "passport_csrf_token_default": "cb14655a9b1769d8e27b52dc2ca3ddb7",
        "__security_mc_1_s_sdk_crypt_sdk": "5aba16f1-414a-84e1",
        "__security_mc_1_s_sdk_cert_key": "ffa96e58-4df8-8164",
        "__security_mc_1_s_sdk_sign_data_key_web_protect": "9a5b4a80-455a-b6e9",
        "stream_recommend_feed_params": "%22%7B%5C%22cookie_enabled%5C%22%3Atrue%2C%5C%22screen_width%5C%22%3A1600%2C%5C%22screen_height%5C%22%3A1000%2C%5C%22browser_online%5C%22%3Atrue%2C%5C%22cpu_core_num%5C%22%3A20%2C%5C%22device_memory%5C%22%3A8%2C%5C%22downlink%5C%22%3A10%2C%5C%22effective_type%5C%22%3A%5C%224g%5C%22%2C%5C%22round_trip_time%5C%22%3A50%7D%22",
        "stream_player_status_params": "%22%7B%5C%22is_auto_play%5C%22%3A0%2C%5C%22is_full_screen%5C%22%3A0%2C%5C%22is_full_webscreen%5C%22%3A0%2C%5C%22is_mute%5C%22%3A1%2C%5C%22is_speed%5C%22%3A1%2C%5C%22is_visible%5C%22%3A0%7D%22",
        "__ac_nonce": "067ec99b300be15fad648",
        "__ac_signature": "_02B4Z6wo00f01XEEZFQAAIDArl-XG8Kqnr1xJGDAADuxl50DyzbT5Lhaa6xMKRc8l.D6DQUPTDcnFnl6OS1ltUKHprfh8UooLLTq.ZfnW12k.r098LAkENEACH37nZ3gYmbOR.m3nWc4NcYY1c",
        "csrf_session_id": "4d250da97586c216d692fa6f71a230ce",
        "strategyABtestKey": "%221743559787.209%22",
        "home_can_add_dy_2_desktop": "%221%22",
        "bd_ticket_guard_client_data": "eyJiZC10aWNrZXQtZ3VhcmQtdmVyc2lvbiI6MiwiYmQtdGlja2V0LWd1YXJkLWl0ZXJhdGlvbi12ZXJzaW9uIjoxLCJiZC10aWNrZXQtZ3VhcmQtcmVlLXB1YmxpYy1rZXkiOiJCSUNWc1VGR1l2NWY5QkVXbEU0QkNaV2J6amFOMjZKYmtEWHplNnNDajd5U1Mwbi9xbjc2UHhobUZYR0lpdzlhZGVvWDkrOTdZT1lmeWZ5TWFnU1RVaTQ9IiwiYmQtdGlja2V0LWd1YXJkLXdlYi12ZXJzaW9uIjoyfQ%3D%3D",
        "biz_trace_id": "05d5751d",
        "sdk_source_info": "7e276470716a68645a606960273f276364697660272927676c715a6d6069756077273f276364697660272927666d776a68605a607d71606b766c6a6b5a7666776c7571273f275e58272927666a6b766a69605a696c6061273f27636469766027292762696a6764695a7364776c6467696076273f275e5827292771273f27333d303d3d323c303036313234272927676c715a75776a716a666a69273f2763646976602778",
        "bit_env": "cnmyeGALr6lTDJd6eAFouQI7ClhXvnfqM2UL5g4kVix4yKywwA4frJHxzYTguqRCLVXhrf-aZI9Hk3JrSOIgV9kTxI7_k0Jr5S2OPFBmTCpjtSa0CFTXtl4jzd6SZb1tR3weSmRI5ZJcP62pBE-gaXtWYUxhA7WPQFRfGFZWCm-L3JnbbrvBoVbJoJrtW4-CAEBQDbMpi_Y9kEbUXncdvKQft5YDlO2SHtdVAmtmRFoduQUTaLP-vDyDCj7NDqiX6eixRNcI5cxcJacJhGVqQL2Is-v-7I6N9yulC1-ZBuXV23HCYrbsielwHFUSH6uoMNHwrKTiMqetsPGVDys9RK9MzziSORl2Basxh00XNIrlwGXlEXTZB7no8PPn9-09SJxW30GVOlgGF_Uqsck0Ws7SOZDTvpqovTKnaNKOPVH5KHo9tzz8Q2XaMeRgrKho7tt0DC1w6epMwLpn70w_fJEVQwoHja0NYjYiaAe3uP9QloWYl-nav3lSomwpLf6i",
        "gulu_source_res": "eyJwX2luIjoiNzgwNzcyZGRkZDY4NTA5YTVhNDk1YTg5YmU1OTY4ODNlOWM3YzhjYzUyZjA0NTIyNzBhNjc3YTRjMWNlOTgzYiJ9",
        "passport_auth_mix_state": "tigd1k5ijxs2ntfbek0cuwbkps4yhipmhteytdh1si95btab",
        "IsDouyinActive": "true"
    }
    url = "https://www.douyin.com/aweme/v1/web/comment/list/reply/"
    params = {
        "device_platform": "webapp",
        "aid": "6383",
        "channel": "channel_pc_web",
        "item_id": "7488296898260929846",
        "comment_id": "7488300788696204089",
        "cut_version": "1",
        "cursor": "0",
        "count": "3",
        "item_type": "0",
        "update_version_code": "170400",
        "pc_client_type": "1",
        "pc_libra_divert": "Windows",
        "support_h265": "1",
        "support_dash": "1",
        "version_code": "170400",
        "version_name": "17.4.0",
        "cookie_enabled": "true",
        "screen_width": "1600",
        "screen_height": "1000",
        "browser_language": "zh-CN",
        "browser_platform": "Win32",
        "browser_name": "Chrome",
        "browser_version": "134.0.0.0",
        "browser_online": "true",
        "engine_name": "Blink",
        "engine_version": "134.0.0.0",
        "os_name": "Windows",
        "os_version": "10",
        "cpu_core_num": "20",
        "device_memory": "8",
        "platform": "PC",
        "downlink": "10",
        "effective_type": "4g",
        "round_trip_time": "100",
        "webid": "7481103752319469119",
        "uifid": "29d6bea3e5a6c157a08a212e1912b5e8a78666ece26be56100fa19e58a63a45b7430374aec04099be6c42331d06e5bc0adc5ce0ec014f4da989724f3af5a0acd164bcadf1e1b87ddaf6a61d9f07f94e7e32b7e22c5cd273508899d257064cec330cb14d35d050fd4ff9596013d70b5c125cc212120afe6d0573a29d018f9992ca7328a065ff03c648acbb83985073c84f6d5e32db8b9eea3f6b8542dc3d6fa6a",
        "msToken": "jtSWNNv_cI7IbXm1FQhmTEUKQp-7zJxbtK86GwMfFCxap-W295hlMCyVEwcPuE5K2xnAaqdU1ONZ3Pj4uToofaYH0rfM1r8pX3-OWTtNO_TEsM7IWxAGwwkgYJenX3oeAGjvskzxnX_O0rm41FsPALURN7epyjE0k3KxwjtUp_Qg",
        # "a_bogus": "x64VgHtyOoQcadMb8CYOSXrlm9gArTuylBixSx5UyNLTGXUbARPGNNGEGxKpK2YSNYpTkeV7lDT/bVdbKU7zZonpomkvSPwbwTdAnwsohqqZGFksDHyOCLTzKwMSURTLa/crE1X5AsMi2dOlnNAplBlG95zwQmRpWrFydZzca9WNdADHI9dceQyhwh5L"
        "a_bogus":a_bogus
    }
    response = requests.get(url, headers=headers, cookies=cookies, params=params)

    print(response.text)
    print(response)


if __name__ == "__main__":
    req()
