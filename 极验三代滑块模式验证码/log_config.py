import sys

from loguru import logger

logger.remove()
# 配置日志
logger.add(sys.stderr, format="<green>{time:YYYY-MM-DD HH:mm:ss}</green> | <level>{message}</level>", level="INFO")