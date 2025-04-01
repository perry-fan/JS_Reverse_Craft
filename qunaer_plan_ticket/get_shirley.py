import re

import requests


def get_shirley():
    headers = {
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "accept-language": "zh-CN,zh;q=0.9",
        "cache-control": "no-cache",
        "pragma": "no-cache",
        "priority": "u=0, i",
        "sec-ch-ua": "\"Not)A;Brand\";v=\"99\", \"Google Chrome\";v=\"127\", \"Chromium\";v=\"127\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "same-origin",
        "sec-fetch-user": "?1",
        "upgrade-insecure-requests": "1",
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/127.0.0.0 Safari/537.36"
    }
    cookies = {
        "QN1": "00014880306c69887fd89081",
        "QN99": "3356",
        "QunarGlobal": "10.80.148.213_-310e495_1942bd1aa31_-5f80|1736083976718",
        "QN269": "92D175A2CB6911EFB7B1B27797673177",
        "fid": "402ca3b5-53f1-4d84-be9d-3334724517cf",
        "QN48": "tc_c4221e8d2333f66e_19436ab5493_aa57",
        "QN601": "b3ead768643cdae4a2052405f500165b",
        "quinn": "18a02bf6edef77e8d485d25690e8487889495f21eb6b5d31b42b69dd537d3aee8977d11930cf5d56d536f23a75247718",
        "QN100": "WyLpqazmnaXopb%2Fkupp85YyX5LqsIl0%3D",
        "QN162": "%E5%8C%97%E4%BA%AC",
        "ctt_june": "1683616182042##iK3waKj%2BahPwawPwa%3DPOasHhaKkDWsvAXPaOEKgnE2PsED3NWRX8WR0GW%3DX%2BiK3siK3saKgsWSvmWRa%3DaKa%2BahPwaUvt",
        "QN300": "wx",
        "Alina": "90c4e48d-58fd70-694edd65-33b98271-528c677a8d6c",
        "QN271AC": "register_pc",
        "QN271SL": "4d109f4265fe440c9b79a32263f79db1",
        "QN271RC": "4d109f4265fe440c9b79a32263f79db1",
        "_q": "U.qpxouyq4959",
        "csrfToken": "PkSBxPgRAjwdnikjVnvwlcregL0nsyqa",
        "_s": "s_5L35DLNNNHGBVYPVN7CVOOAL5M",
        "_t": "29044203",
        "_v": "VCIfGO5215-8YAQSt056SQN17HHd9PdZUSA0602iXVriNAKoP3AykdThITirpc65FNKknj-Ui2OB5nuDvJrNuceXdjyS7Bl3s2WN86FVXJc2EUTAX8Wy0jqJKMdmBHN9TsTI_1-1PN0JnBiPw3Y7L5qxrTcDkzq0vzRqGhJ9mj_K",
        "QN43": "\"\"",
        "QN42": "%E5%8E%BB%E5%93%AA%E5%84%BF%E7%94%A8%E6%88%B7",
        "_i": "DFiEZn8JNdfDWCHL_LEmmxpzEMUw",
        "_vi": "xeMxzg8pMaKplDcqEW_GyXjb1gB8p9egynHy8ia_o9QBmHiG82CBBuYT9MeEheD4WtbibwuEESvzDNW-sjvesX1fb9kR8ToThRanMCXjMmpzNFDckmIaLcPlNvGOobo2OWmNdpH3DUq5HWgITrvcYBLZOV1aCmf8b4y81icD1oDy",
        "11344": "1722403391463##iK3wWs2sVuPwawPwasWIEKWTa2fREKEDVRHGWsjNEKjwVRPAW2EhEPana2X%2BiK3siK3saKgsWSD%2BWSv8VKgAWhPwaUvt",
        "11536": "1722403391463##iK3wVRj%3DWwPwawPwasv8asPwWRDwESkIVPD%3DaRjnW2EDERfDWPjsa2XsVR3NiK3siK3saKgsWSvmWRv8VK2%2BaUPwaUvt",
        "QN621": "1490067914133%2Ctestssong%3DDEFAULT%26fr%3Dtouch_index_search",
        "F235": "1737168763453",
        "QN668": "51%2C57%2C53%2C57%2C51%2C59%2C51%2C58%2C59%2C57%2C56%2C51%2C52",
        "ctf_june": "1683616182042##iK3wWRtmWwPwawPwasP%3DaPXAWsD8WPPsX%3DGIVKtsaKvNXsTDEDEIa%3DjOW2D8iK3siK3saKgsWsDNaK28aRjNVhPwaUvt",
        "cs_june": "22eef72cd875acd234069f84e073a13d5e797c460bdef3a8819a1f6184fd75f77b07f969038b7c3c8a130d059a16cefc58762a43c47c777f9296c839891da305b17c80df7eee7c02a9c1a6a5b97c11793aacf127bdbb1cb21b0e9a8fd24280c65a737ae180251ef5be23400b098dd8ca"
    }
    url = "https://m.flight.qunar.com/ncs/page/flightlist"
    params = {
        "depCity": "北京",
        "arrCity": "上海",
        "goDate": "2025-01-20",
        "from": "touch_index_search",
        "child": "0",
        "baby": "0",
        "cabinType": "0",
        "_firstScreen": "1",
        "_gogokid": "12"
    }
    response = requests.get(url, headers=headers, cookies=cookies, params=params)
    shirley_pattern = r'([a-f0-9]{32})'
    shirley_match = re.search(shirley_pattern, response.text)
    api_token_pattern = r'id="qunar_api_token"[^>]*>([a-zA-Z0-9_]+)<\/div>'
    api_token_match = re.search(api_token_pattern, response.text)
    return shirley_match.group(1), api_token_match.group(1)

