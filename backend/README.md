# TravelMate 国内后端

本服务把千问、高德密钥保存在服务端，GitHub Pages 前端只访问本服务。

1. 复制根目录 `.env.example` 为 `backend/.env` 并填写密钥。
2. 在 `backend` 安装：`python -m pip install -r requirements.txt`
3. 启动：`python -m uvicorn app.main:app --reload --port 8000`
4. 打开 `http://localhost:8000/health` 检查配置。

不要提交 `.env`。生产环境需部署到中国大陆可访问的 Python 服务。

