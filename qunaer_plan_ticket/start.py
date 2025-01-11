import requests
import json


headers = {
    "accept": "application/json, text/javascript",
    "accept-language": "zh-CN,zh;q=0.9",
    "b30cd2": "23e94822e1912bd883921d020e6984dcfcecee09",
    "cache-control": "no-cache",
    "content-type": "application/json",
    "csht;": "",
    "origin": "https://m.flight.qunar.com",
    "pragma": "no-cache",
    "pre": "b9d6302e-f9e516-9344e864-82b92c90-5d4c70fb5853",
    "priority": "u=1, i",
    "referer": "https://m.flight.qunar.com/ncs/page/flightlist?depCity=%E5%8C%97%E4%BA%AC&arrCity=%E4%B8%8A%E6%B5%B7&goDate=2025-01-06&from=touch_index_search&child=0&baby=0&cabinType=0",
    "sec-fetch-dest": "empty",
    "sec-fetch-mode": "cors",
    "sec-fetch-site": "same-origin",
    "user-agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Mobile/15E148 Safari/604.1",
    "wps": "21",
    "x-requested-with": "XMLHttpRequest"
}
cookies = {
    "QN1": "00014880306c69887fd89081",
    "QN99": "3356",
    "QN205": "s%3Dbaidu",
    "QunarGlobal": "10.80.148.213_-310e495_1942bd1aa31_-5f80|1736083976718",
    "QN269": "92D175A2CB6911EFB7B1B27797673177",
    "fid": "402ca3b5-53f1-4d84-be9d-3334724517cf",
    "QN48": "tc_c4221e8d2333f66e_19436ab5493_aa57",
    "QN601": "b3ead768643cdae4a2052405f500165b",
    "quinn": "18a02bf6edef77e8d485d25690e8487889495f21eb6b5d31b42b69dd537d3aee8977d11930cf5d56d536f23a75247718",
    "ariaDefaultTheme": "null",
    "QN100": "WyLpqazmnaXopb%2Fkupp85YyX5LqsIl0%3D",
    "QN277": "organic",
    "QN162": "%E5%8C%97%E4%BA%AC",
    "QN243": "77",
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
    "_vi": "pa_bCyX6jB-WPn1biyWjsq6NVv100bq2PeOmJt4p7Dy-SYCyYwKfgi2TkoPimCIaarWACg1mW4O02b-_R5lq-2cbNYnRN6fj0mPAU7Fnn5PzsW9_SAff4o01lkQCc80aD8D-Rf-j3XkvVEhYIP3f7J6huavpoeM-rvK_cE6IsI9u",
    "11344": "1722403391463##iK3wWR2nWwPwawPwasiRasvAXSfGaS0GXPPNXsvNVDXnE2jOW%3DGDX2ihERiIiK3siK3saKgsWSvmWKtnWSa8ahPwaUvt",
    "11536": "1722403391463##iK3wVRj%3DWwPwawPwasv8asPwWRDwESkIVPD%3DaRjnW2EDERfDWPjsa2XsVR3NiK3siK3saKgsWSvmWRv8VK2%2BaUPwaUvt",
    "QN621": "1490067914133%2Ctestssong%3DDEFAULT%26fr%3Dtouch_index_search",
    "QN668": "51%2C57%2C53%2C56%2C51%2C57%2C54%2C58%2C54%2C57%2C50%2C59%2C59",
    "ctf_june": "1683616182042##iK3wWRD%3DauPwawPwasGRXPEGESkhaPWTXPiIEKHGX%3DiIERoTERtwVPXAastOiK3siK3saKgsWSD%2BWRt%3DWsaNawPwaUvt",
    "cs_june": "693aedc26a7f0b0f8b0422f4dc958d3b9163debd791e4115d85693880fe73993e307578405e70322e1f73468b1b9503c0a0ca753080fdbf662d79e82b3d8d200b17c80df7eee7c02a9c1a6a5b97c117995de49933abca9dfe76911d92c2d01185a737ae180251ef5be23400b098dd8ca",
    "F235": "1736174869348"
}
url = "https://m.flight.qunar.com/flight/api/touchInnerList"
data = {
    "arrCity": "上海",
    "baby": "0",
    "cabinType": "0",
    "child": "0",
    "depCity": "北京",
    "from": "touch_index_search",
    "goDate": "2025-01-12",
    "firstRequest": False,
    "startNum": 0,
    "sort": 5,
    "r": 1736174869708,
    "_v": 2,
    "underageOption": "",
    "st": 1736174848186,
    "more": 1,
    "backDate": None,
    "isChangeDate": True,
    "Bella": "1683616182042##fbb257548f5066f1d57136883b46a8e2a577146f##iKohiK3wgMkMf-i0gUPwaUPsXuPwaUPwaUPwXwPwa5TQjOWxcI10aS30a=D0aS3wWsamiK3siK3saPGhWKXwERoTWsiDVRvNXUPwawPwasD+asjnWsXmWS2+aKD0aS30a2a0aSisyI0wcIkNiK3wiKWTiK3wW9D=WIEMaRP+fK2mWI3NjKHMj9Dwa9XsjOPnf9Dna930aS30a2a0aSi=y-ELfuPwaUPsXuPwaUkGWuPmEukhXUkGWuPNawkTXukGWuPmWhkhEUkGWwkhEhPNaukGWUPNXwkhXukGWwkTWukTVhkGWUPNXwPmEhkGWuPmXukTauPwaUPwXwPwaMe0d-oxgMEsiK3wiKWTiK3wiKiRiPPAiKHGiPihiPPNiKtwiPDsiPPAiKt=iPiIiKiRiPPmiKtmiPGTiPP+iKHIiPGDiPPOiK0IiPDAiPPmiPGIiPDwiKiRiK3wiKiRiK3wfIksj+iQgCEQcOm0aS30a=D0aS30EKP0VDP0X230EKP0VKa0XPD0EKP0VRX0X2jpP-kbj-3bjOFeJukGVukTawPNEukGWUPNXwkhXukGWwkTWukTVhPwXwkGWwPmVukhVukGWhkhXUkhWwPwaUPwXwPwaMHxg+X0aS30a=D0aSieqMfLy9opohNno9NHgUNScO=0aS30a2a0aSisj+iQgCEKgMa0aS30a=D0WP30aSi+f9iwf-Wxo-iSfuNSq9W=iK3wiKiRiK3wjOFec9Fbq5GAcMGwd5pbjwPwaUPAEhP+Ehvt##pYuREBTxZGhlDTI2Cf7yT##arrCity,baby,cabinType,child,depCity,from,goDate,firstRequest,startNum,sort,r,_v,underageOption,st,more,backDate,isChangeDate",
    "__m__": "d2715c9f5c6e0189bf16ec07507ee6e0"
}
data = json.dumps(data, separators=(',', ':'))
response = requests.post(url, headers=headers, cookies=cookies, data=data)

print(response.text)
print(response)