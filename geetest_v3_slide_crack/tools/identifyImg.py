from loguru import logger
from PIL import Image
import cv2
import numpy as np


# 将 Image 转换为 Mat，通过 flag 可以控制颜色
def pilImg_to_cv2(img: Image.Image, flag=cv2.COLOR_RGB2BGR):
    return cv2.cvtColor(np.asarray(img), flag)


# 弹窗查看图片
def show_img(bg: cv2.Mat, name='test', delay=0):
    cv2.imshow(name, bg)
    cv2.waitKey(delay)
    cv2.destroyAllWindows()


def getDistance(img: Image.Image, slice_img: Image.Image):
    # 通过 pilImgToCv2 将图片置灰
    # 背景图和滑块图都需要做相同处理
    gray_img = pilImg_to_cv2(img, cv2.COLOR_BGR2GRAY)
    # 可以通过它来看处理后的图片效果
    # show_img(gray_img)
    gray_slice = pilImg_to_cv2(slice_img, cv2.COLOR_BGR2GRAY)
    # 做边缘检测进一步降低干扰，阈值可以自行调整
    gray_img = cv2.Canny(gray_img, 255, 255)
    # 可以通过它来看处理后的图片效果
    # show_img(gray_img)
    gray_slice = cv2.Canny(gray_slice, 255, 255)
    # 可以通过它来看处理后的图片效果
    # show_img(gray_slice)
    # 通过模板匹配两张图片，找出缺口的位置
    result = cv2.matchTemplate(gray_img, gray_slice, cv2.TM_CCOEFF_NORMED)
    max_loc = cv2.minMaxLoc(result)[3]
    # 匹配出来的滑动距离
    distance = max_loc[0]
    # 下面的逻辑是在图片画出一个矩形框来标记匹配到的位置，可以直观的看到匹配结果，去掉也可以的
    slice_height, slice_width = gray_slice.shape[:2]
    # 左上角
    x, y = max_loc
    # 右下角
    x2, y2 = x + slice_width, y + slice_height
    result_bg = pilImg_to_cv2(img, cv2.COLOR_RGB2BGR)
    cv2.rectangle(result_bg, (x, y), (x2, y2), (0, 0, 255), 2)
    # 可以通过它来看处理后的图片效果
    # show_img(result_bg)
    return distance


# slice_img_path = './缺口背景图片.png'
# img_path = './滑块.png'
# getDistance(Image.open(img_path), Image.open(slice_img_path))
