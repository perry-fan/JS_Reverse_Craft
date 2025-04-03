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

    headers = {
        "accept": "application/json, text/plain, */*",
        "accept-language": "zh-CN,zh;q=0.9",
        "bd-ticket-guard-iteration-version": "1",
        "bd-ticket-guard-ree-public-key": "BDx5mI9Unbs/hQspHmO1vSjuaIk/B/EYreSQWacbspA6ECnNQQhXuYkP2oLzvOOd/c6sNaNyrvmapaOegOAVJa8=",
        "bd-ticket-guard-version": "2",
        "bd-ticket-guard-web-sign-type": "0",
        "bd-ticket-guard-web-version": "2",
        "cache-control": "no-cache",
        "pragma": "no-cache",
        "priority": "u=1, i",
        "referer": "https://www.douyin.com/",
        "sec-ch-ua": "\"Not)A;Brand\";v=\"99\", \"Google Chrome\";v=\"127\", \"Chromium\";v=\"127\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-dest": "empty",
        "sec-fetch-mode": "cors",
        "sec-fetch-site": "same-origin",
        "uifid": "973a3fd64dcc46a3490fd9b60d4a8e663b34df4ccc4bbcf97643172fb712d8b05c8207ab7a0402be2f993623172fba41ff6cc39877dd02cf23ff682b5895c2b0273435ccd10f5501764f37d4bc40c7592e612a1ff5bb2c598051d2da4e46f92708353aecd8e8a1d4ead44c99718738b075e07b51e2402a7f6f93b3f2b6428dea89519908ac39c9037c192cfad8c8351a6c6b7eef867964390d9c142d2e8b28bc",
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36"
    }
    cookies = {
        "ttwid": "1%7C9H-xKuZyvz-w1isUfmzBG8AcRvE3IbCce-m_Syxusqw%7C1735963660%7C8f8309b6e9ddfcce345a20d72345821d65f9c45e0ed1a117665f591979e9d563",
        "UIFID_TEMP": "973a3fd64dcc46a3490fd9b60d4a8e663b34df4ccc4bbcf97643172fb712d8b015c42ff69c6cd73bfc6e323973bf4f140da0674da37b957fa7349f6462a714d3fd8bbe408fdc23b9d0ac0c5e4fd69201",
        "hevc_supported": "true",
        "fpk1": "U2FsdGVkX1+zkQZ7YEL71neTlMQTUeUUSWOwXcLG7StYqbrO1URgLjXeE21Sc3NFjP5j2DG6VO2zNNMWsTQXgQ==",
        "fpk2": "362d7fe3d8b2581bffa359f0eeda7106",
        "bd_ticket_guard_client_web_domain": "2",
        "UIFID": "973a3fd64dcc46a3490fd9b60d4a8e663b34df4ccc4bbcf97643172fb712d8b05c8207ab7a0402be2f993623172fba41ff6cc39877dd02cf23ff682b5895c2b0273435ccd10f5501764f37d4bc40c7592e612a1ff5bb2c598051d2da4e46f92708353aecd8e8a1d4ead44c99718738b075e07b51e2402a7f6f93b3f2b6428dea89519908ac39c9037c192cfad8c8351a6c6b7eef867964390d9c142d2e8b28bc",
        "dy_swidth": "1707",
        "dy_sheight": "960",
        "xgplayer_user_id": "991479553896",
        "__security_mc_1_s_sdk_crypt_sdk": "d0875be7-4799-8753",
        "__security_mc_1_s_sdk_cert_key": "26c74925-425a-98d5",
        "__security_mc_1_s_sdk_sign_data_key_web_protect": "ac321add-4e83-a7a8",
        "__security_mc_1_s_sdk_sign_data_key_sso": "65782b97-417d-8131",
        "is_dash_user": "1",
        "odin_tt": "28280fa1a380fa40de0324648a32e0bf942e4baa9895fd9b7d675a1d33f78eb31df8d15b63755c9c067e3aed55383c31a8ec1e65afdbf6935da5388267a898b5c3d47b9d1d5990b375cc03334d10a4f9",
        "live_use_vvc": "%22false%22",
        "FORCE_LOGIN": "%7B%22videoConsumedRemainSeconds%22%3A180%2C%22isForcePopClose%22%3A1%7D",
        "upgrade_tag": "1",
        "s_v_web_id": "verify_m7vvlf05_WaaFwxuX_50fS_4LkU_BAZC_1FWEg7RPoUrR",
        "passport_csrf_token": "a8379600bba4b84995c540700984dd3c",
        "passport_csrf_token_default": "a8379600bba4b84995c540700984dd3c",
        "xgplayer_device_id": "45071593489",
        "SearchMultiColumnLandingAbVer": "1",
        "SEARCH_RESULT_LIST_TYPE": "%22multi%22",
        "volume_info": "%7B%22isUserMute%22%3Afalse%2C%22isMute%22%3Atrue%2C%22volume%22%3A0.5%7D",
        "stream_recommend_feed_params": "%22%7B%5C%22cookie_enabled%5C%22%3Atrue%2C%5C%22screen_width%5C%22%3A1707%2C%5C%22screen_height%5C%22%3A960%2C%5C%22browser_online%5C%22%3Atrue%2C%5C%22cpu_core_num%5C%22%3A16%2C%5C%22device_memory%5C%22%3A8%2C%5C%22downlink%5C%22%3A10%2C%5C%22effective_type%5C%22%3A%5C%224g%5C%22%2C%5C%22round_trip_time%5C%22%3A50%7D%22",
        "WallpaperGuide": "%7B%22showTime%22%3A1743265250383%2C%22closeTime%22%3A0%2C%22showCount%22%3A2%2C%22cursor1%22%3A41%2C%22cursor2%22%3A12%7D",
        "SearchColumnSwitchLog": "%5B%7B%22date%22%3A%222025-03-30%22%2C%22latestColumnType%22%3A%22multi%22%7D%2C%7B%22date%22%3A%222025-03-31%22%2C%22latestColumnType%22%3A%22multi%22%7D%2C%7B%22date%22%3A%222025-04-01%22%2C%22latestColumnType%22%3A%22multi%22%7D%5D",
        "download_guide": "%223%2F20250401%2F0%22",
        "__ac_signature": "_02B4Z6wo00f01GoJLEQAAIDBtnCz8oZcnaRqKSjAAH1x41",
        "__live_version__": "%221.1.3.161%22",
        "live_can_add_dy_2_desktop": "%220%22",
        "douyin.com": "",
        "device_web_cpu_core": "16",
        "device_web_memory_size": "8",
        "architecture": "amd64",
        "strategyABtestKey": "%221743601826.746%22",
        "sdk_source_info": "7e276470716a68645a606960273f276364697660272927676c715a6d6069756077273f276364697660272927666d776a68605a607d71606b766c6a6b5a7666776c7571273f275e58272927666a6b766a69605a696c6061273f27636469766027292762696a6764695a7364776c6467696076273f275e5827292771273f2736323d3d373d34353336313234272927676c715a75776a716a666a69273f2763646976602778",
        "bit_env": "pDF-UXmraZsqJNRclzbcU99JbIBBrbnBfdEHxiSSwcs7uUqQ7dgQTT43u1DZAhCdbwh1lIS5w1lqf9WsFByUfa5GocU1PJrUp5WWUJDprXZLhUJjhIeuP50GT3kXSW9SuIv45yB337u_RJGlj1B-Hxahx1vMnfB0EMkkaAAmGjiuDsmBZnvsJESyKaLmiDCaATUQc9pSCAlV9kHMMJbNjqxm-9gPYc-axW5xFKsXWEMUoQOKWYmoNlwz0nroBVeT5qjIDUIxlqBUyQ0cjxqHRCSsDBdM4sYsDVUxI4ZodQNjBVEar8gIWgYpPqhOIdoZWGDceTt9IuoYKYA7ZCzVV5PzRN5pQ2TNy7RwvALkDgd3H5pbkhNOZvEMOlqw-ll6UOzYww62qoWnhj03RzUnXu9QYcwBiZgLbEXSdlKv8qf8G4twT68Ef9d25u6T8gwzPAJI5ZJzQGLRqWz4WMBbSHEBYQlQazfDy4pWGl-prtyXYp50hFRxVi0QOAvpT2Is",
        "gulu_source_res": "eyJwX2luIjoiMmQ5MTFmM2RkNDk5NGRjZTY2ODA4ZjlkNGE3MzBkYWRjOGM3ZjBlYTZhNmVkODY3N2U4ZDcwOGExYWMwMzA5MSJ9",
        "passport_auth_mix_state": "pqh36wrjnquwpw3gkrmb85hvhayl0x83",
        "xg_device_score": "7.562538484225193",
        "IsDouyinActive": "true",
        "stream_player_status_params": "%22%7B%5C%22is_auto_play%5C%22%3A0%2C%5C%22is_full_screen%5C%22%3A0%2C%5C%22is_full_webscreen%5C%22%3A0%2C%5C%22is_mute%5C%22%3A1%2C%5C%22is_speed%5C%22%3A1%2C%5C%22is_visible%5C%22%3A1%7D%22",
        "home_can_add_dy_2_desktop": "%221%22",
        "biz_trace_id": "ffa8aa4f",
        "bd_ticket_guard_client_data": "eyJiZC10aWNrZXQtZ3VhcmQtdmVyc2lvbiI6MiwiYmQtdGlja2V0LWd1YXJkLWl0ZXJhdGlvbi12ZXJzaW9uIjoxLCJiZC10aWNrZXQtZ3VhcmQtcmVlLXB1YmxpYy1rZXkiOiJCRHg1bUk5VW5icy9oUXNwSG1PMXZTanVhSWsvQi9FWXJlU1FXYWNic3BBNkVDbk5RUWhYdVlrUDJvTHp2T09kL2M2c05hTnlydm1hcGFPZWdPQVZKYTg9IiwiYmQtdGlja2V0LWd1YXJkLXdlYi12ZXJzaW9uIjoyfQ%3D%3D"
    }
    url = "https://www.douyin.com/aweme/v1/web/comment/list/reply/"
    params = {
        "device_platform": "webapp",
        "aid": "6383",
        "channel": "channel_pc_web",
        "item_id": "7460087437860097339",
        "comment_id": "7460714787208250172",
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
        "screen_width": "1707",
        "screen_height": "960",
        "browser_language": "zh-CN",
        "browser_platform": "Win32",
        "browser_name": "Chrome",
        "browser_version": "127.0.0.0",
        "browser_online": "true",
        "engine_name": "Blink",
        "engine_version": "127.0.0.0",
        "os_name": "Windows",
        "os_version": "10",
        "cpu_core_num": "16",
        "device_memory": "8",
        "platform": "PC",
        "downlink": "10",
        "effective_type": "4g",
        "round_trip_time": "50",
        "webid": "7455907028960364086",
        "uifid": "973a3fd64dcc46a3490fd9b60d4a8e663b34df4ccc4bbcf97643172fb712d8b05c8207ab7a0402be2f993623172fba41ff6cc39877dd02cf23ff682b5895c2b0273435ccd10f5501764f37d4bc40c7592e612a1ff5bb2c598051d2da4e46f92708353aecd8e8a1d4ead44c99718738b075e07b51e2402a7f6f93b3f2b6428dea89519908ac39c9037c192cfad8c8351a6c6b7eef867964390d9c142d2e8b28bc",
        "msToken": "MViRgqsO6-oyAy1uuEQj2QSZ7caFiqwWANrgU-w_c7OYyTnr9wQZg0mgVC1IQHfUK_6WvJp86402LOo5PQj8bGWwk9d4Sar41uZ3kf3q3ITLjxrgwjnv7nb2Eco6-YKWx7iiB5WsMIyXneF_qvVKQoalB903-PSZMlxeWqKEQKFSRlgLuv23Jg==",
        # "a_bogus": "mJ0jkq6LxdRnKV/SuCnXHI2l4Cy/NPuy6-ixSGPTtxY9TXlTXRP7pxeqcxzp28UPqRBsk9I7uEF/YExbOUXzZF9kompkuxhWi02Vng8oMqw1TMU8LHmmSg8zLwMu0bXia5cji1U51sMjIdo59qADAQ1GC5zw5Y62bNMIp/YyGDS8pT6Tnx2eecyAlqg="
        "a_bogus":a_bogus
    }
    response = requests.get(url, headers=headers, cookies=cookies, params=params)

    print(response.text)
    print(response)


if __name__ == "__main__":
    req()
