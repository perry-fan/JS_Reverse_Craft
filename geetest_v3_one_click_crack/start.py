from tool import register_full_page, geetest_get, valid, login, get_random_str
from loguru import logger
import subprocess
from functools import partial
import execjs

# 设置默认编码
subprocess.Popen = partial(subprocess.Popen, encoding='utf-8')


# 工具函数：加载 JS 文件
def load_js_file(file_path):
    try:
        with open(file_path, "r", encoding="utf-8") as f:
            return f.read()
    except Exception as e:
        logger.error(f"Failed to load JS file: {file_path}, Error: {e}")
        raise


# 获取 w1
def get_w1(gt, challenge, random_str, main_ctx):
    try:
        return main_ctx.call("get_w1", gt, challenge, random_str)
    except Exception as e:
        logger.error(f"Failed to generate w1: {e}")
        raise


# 获取 rp
def get_rp(gt, challenge, enc_ctx):
    try:
        return enc_ctx.call("get_rp", gt, challenge, 3023)
    except Exception as e:
        logger.error(f"Failed to generate rp: {e}")
        raise


# 获取 w2
def get_w2(rp, random_str, main_ctx):
    try:
        return main_ctx.call("get_w2", rp, random_str)
    except Exception as e:
        logger.error(f"Failed to generate w2: {e}")
        raise


# 主流程
def main():
    # 注册页面
    logger.info("Step 1: Registering full page...")
    result = register_full_page()
    gt = result['gt']
    challenge = result['challenge']

    # 随机字符串生成
    logger.info("Step 2: Generating random string...")
    random_str = get_random_str()

    # 加载主 JS 文件
    logger.info("Step 3: Loading main JS...")
    main_code = load_js_file("./demo.js")
    main_ctx = execjs.compile(main_code)

    # 获取 w1
    logger.info("Step 4: Generating w1...")
    w1 = get_w1(gt, challenge, random_str, main_ctx)
    logger.info(f"w1: \n{w1}")

    # 获取 geetest 数据
    logger.info("Step 5: Fetching geetest data...")
    geetest_result = geetest_get(w1, gt, challenge)
    s = geetest_result['data']['s']
    c = geetest_result['data']['c']
    logger.info(f"s: {s}, c: {c}")

    # 加载加密 JS 文件
    logger.info("Step 6: Loading encryption JS...")
    enc_code = load_js_file("./enc.js")
    enc_ctx = execjs.compile(enc_code)

    # 获取 rp
    logger.info("Step 7: Generating rp...")
    rp = get_rp(gt, challenge, enc_ctx)
    logger.info(f"rp: {rp}")

    # 获取 w2
    logger.info("Step 8: Generating w2...")
    w2 = get_w2(rp, random_str, main_ctx)
    logger.info(f"w2: {w2}")

    # 验证
    logger.info("Step 9: Validating...")
    valid_result = valid(gt, challenge, w2)
    validate = valid_result['data']['validate']
    logger.info(f"validate: {validate}")

    # 登录
    logger.info("Step 10: Logging in...")
    login(challenge, validate)


if __name__ == "__main__":
    main()
