import re

import execjs

with open('dec.js', 'r', encoding='utf-8') as f:
    JS = execjs.compile(f.read())
    res = JS.call("_0x5a69", "0x0")
    print(res)

with open("dec1.js", 'r', encoding='utf-8') as f1, open("dec3.js", 'w', encoding='utf-8') as f2:
    for line in f1:
        match_list = re.findall(r"_0x5a69\(.*?\)", line)
        if not match_list:
            f2.write(line)
            continue
        for mt_str in match_list:
            try:
                # arg = str(re.findall(r"\('(.*?)'\)", mt_str)[0])
                arg = mt_str[9: -2]
                line = line.replace(mt_str, f'"{JS.call("_0x5a69", arg)}"')
            except Exception as e:
                pass

        f2.write(line)
        print(line.strip())

