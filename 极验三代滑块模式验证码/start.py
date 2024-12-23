from 极验三代滑块模式验证码.tools.TrajectorySimulation import *
from 极验三代滑块模式验证码.tools.identifyImg import *
from 极验三代滑块模式验证码.tools.tool import *

# 配置
CONFIG = {
    "slice_img_path": './img/缺口背景图片.png',
    "img_path": './img/滑块.png',
    "js_full_page_path": "./full_page.js",
    "js_slide_path": "./slide.7.9.2.js",
    "pass_time": "2766"
}


# 工具函数
def log_step(step_num, message):
    logger.info(f"Step {step_num}: {message}")


# 第一步，注册滑动验证码
def register_captcha():
    result = register_slide()
    gt = result['gt']
    challenge = result['challenge']
    random_str = get_random_str()
    log_step(1, f"调用register-slide result: \n{result}")
    return {"gt": gt, "challenge": challenge, "random_str": random_str}


# 第二步，获取 w1 并执行首次请求
def get_w1_and_request(context):
    w1 = call_js_function(CONFIG["js_full_page_path"], "get_w1", context["gt"], context["challenge"],
                          context["random_str"])
    if w1:
        result = geetest_first_get(w1, context["gt"], context["challenge"])
        log_step(2, f"第一次调用get.php result: \n{result['data']}")
        return result
    return None


# 第三步，生成 rp
def generate_rp(gt, challenge, pass_time):
    plaintext = gt + challenge + pass_time
    rp = get_rp(plaintext)
    log_step(3, f"Generated rp: {rp}")
    return rp


# 第四步，获取 w2
def get_w2(rp, random_str):
    w2 = call_js_function(CONFIG["js_full_page_path"], "get_w2", rp, random_str)
    log_step(4, f"Generated w2: {w2}")
    return w2


# 第五步，执行 geetest 第一次 ajax 请求
def first_ajax(gt, challenge, w2):
    result = geetest_first_ajax(gt, challenge, w2)
    logger.info(f"第一次调用ajax.php: \n{result.text}")


# 第六步，获取图片和相关参数
def get_captcha_images(context):
    result = geetest_second_get(context["gt"], context["challenge"])
    log_step(6, f"第二次调用get.php result: \n{result}")
    get_slice_png(result['slice'])
    get_bg_png(result['bg'])
    get_full_bg_png(result['fullbg'])
    return {
        "gt": result['gt'],
        "challenge": result['challenge'],
        "c": result['c'],
        "s": result['s']
    }


# 第七步，生成第二个 rp
def generate_rp2(context, pass_time):
    plaintext = context["gt"] + context["challenge"][:32] + pass_time
    rp2 = get_rp(plaintext)
    log_step(7, f"Generated rp2: {rp2}")
    return rp2


# 第八步，计算滑动距离和轨迹
def calculate_slide_track():
    distance = getDistance(Image.open(CONFIG["img_path"]), Image.open(CONFIG["slice_img_path"]))
    slide_track, slide_time = get_slide_track(distance)
    log_step(8, f"滑动距离: {distance}, 滑动时间: {slide_time}ms, Slide track calculated.")
    return distance, slide_track, slide_time


# 第九步，执行最终请求
def final_request(context, distance, pass_time, trace, rp2):
    w3 = call_js_function(CONFIG["js_slide_path"], "get_w3", context["gt"],
                          context["challenge"], context["random_str"], distance, pass_time,
                          trace, context["c"], context["s"], rp2)
    if w3:
        result = geetest_second_ajax(context["gt"], context["challenge"], w3)
        log_step(9, f"第二次调用ajax.php: \n{result}")
        return result
    return None


# 主流程
def main():
    for i in range(1):
        context = register_captcha()
        pass_time = CONFIG["pass_time"]
        get_w1_and_request(context)

        rp = generate_rp(context["gt"], context["challenge"], pass_time)
        w2 = get_w2(rp, context["random_str"])
        first_ajax(context["gt"], context["challenge"], w2)

        updated_context = get_captcha_images(context)
        context.update(updated_context)

        rp2 = generate_rp2(context, pass_time)
        distance, slide_track, slide_time = calculate_slide_track()
        valid_result = final_request(context, distance, slide_time, slide_track, rp2)

        validate = valid_result['validate']
        login(context["challenge"], validate)


if __name__ == "__main__":
    main()
