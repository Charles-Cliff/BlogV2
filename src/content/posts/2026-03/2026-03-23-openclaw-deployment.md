---
title: OpenClaw 部署完整指南
published: 2026-03-23T20:34:00
updated: 2026-03-23T20:34:00
description: 详细记录OpenClaw AI助手的部署流程，涵盖环境配置、安装步骤、插件安装、Telegram机器人配置等核心内容
image: ""
tags:
  - OpenClaw
  - AI助手
  - 部署
  - Telegram
  - Bot
category: 技术教程
lang: ""
pinned: false
draft: false
prerenderAll: true
---

## 前言

OpenClaw是一个强大的AI助手框架，支持多种聊天平台（Telegram、Discord、Signal等）。本文记录完整的OpenClaw部署流程，帮助你快速搭建自己的AI助手。

---

## 环境要求

### 硬件
- 内存：4GB RAM以上
- 硬盘：10GB可用空间
- 网络：稳定的互联网连接

### 软件
- Node.js 18+
- npm 或 pnpm
- Git

---

## 安装Node.js

### Windows

1. 访问 [Node.js官网](https://nodejs.org/)
2. 下载LTS版本（18.x或更高）
3. 运行安装程序
4. 验证安装：
```bash
node --version
npm --version
```

### Linux (Ubuntu/Debian)

```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

---

## 安装OpenClaw

### 全局安装CLI

```bash
npm install -g openclaw
```

### 创建新项目

```bash
openclaw create my-bot
cd my-bot
```

### 目录结构

```
my-bot/
├── config.yaml          # 主配置文件
├── skills/             # 技能文件夹
├── memory/             # 记忆存储
├── workspace/          # 工作区
└── package.json
```

---

## 配置文件详解

### config.yaml

```yaml
# 机器人名称
name: "My Bot"

# 运行端口
port: 18789

# Telegram配置
telegram:
  enabled: true
  botToken: "你的BotToken"
  allowedUsers:
    - 用户ID1
    - 用户ID2

# AI模型配置
models:
  default: "minimax/MiniMax-M2.7"
  providers:
    minimax:
      apiKey: "你的API密钥"
      baseUrl: "https://api.minimax.chat"

# 日志配置
logging:
  level: "info"
  file: "openclaw.log"
```

### 获取Telegram Bot Token

1. 在Telegram搜索 @BotFather
2. 发送 `/newbot`
3. 输入机器人名称
4. 获取Token

### 获取用户ID

1. 在Telegram搜索 @userinfobot
2. 发送任意消息
3. 获取数字ID

---

## 启动机器人

### 开发模式

```bash
npm run dev
```

### 生产模式

```bash
npm run build
npm start
```

### 系统服务（Linux）

创建systemd服务文件：

```ini
[Unit]
Description=OpenClaw Bot
After=network.target

[Service]
Type=simple
User=your-user
WorkingDirectory=/path/to/my-bot
ExecStart=/usr/bin/npm start
Restart=on-failure

[Install]
WantedBy=multi-user.target
```

启用服务：

```bash
sudo systemctl enable openclaw
sudo systemctl start openclaw
sudo systemctl status openclaw
```

---

## 技能系统

### 安装技能

```bash
openclaw skill install <skill-name>
```

### 常用技能

| 技能 | 说明 |
|------|------|
| clawhub | 技能市场 |
| github | GitHub集成 |
| weather | 天气查询 |
| summarize | 内容总结 |

### 常用命令

| 命令 | 说明 |
|------|------|
| `/help` | 显示帮助信息 |
| `/status` | 显示状态 |
| `/skills` | 列出已安装技能 |
| `/reload` | 重载配置 |

---

## Docker部署

### Dockerfile

```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 18789

CMD ["npm", "start"]
```

### docker-compose.yml

```yaml
version: '3.8'
services:
  openclaw:
    build: .
    container_name: openclaw-bot
    restart: unless-stopped
    ports:
      - "18789:18789"
    environment:
      - TZ=Asia/Shanghai
    volumes:
      - ./config.yaml:/app/config.yaml:ro
      - ./data:/app/data
```

启动：

```bash
docker-compose up -d
```

---

## Nginx反向代理

### 配置SSL证书

```nginx
server {
    listen 443 ssl;
    server_name your-domain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    location / {
        proxy_pass http://127.0.0.1:18789;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

重启Nginx：

```bash
sudo systemctl restart nginx
```

---

## 常见问题

### Q: 启动失败，提示端口被占用？
A: 检查端口是否被其他程序占用：
```bash
lsof -i :18789
netstat -tlnp | grep 18789
```

### Q: Telegram无法连接？
A: 检查：
1. Bot Token是否正确
2. 网络能否访问Telegram API
3. allowedUsers是否包含你的ID

### Q: AI模型调用失败？
A: 检查：
1. API Key是否有效
2. API额度是否充足
3. 网络是否能访问模型API

### Q: 如何更新OpenClaw？
```bash
npm update -g openclaw
```

---

## 总结

OpenClaw部署要点：

1. **环境准备** — Node.js 18+
2. **安装启动** — npm install -g openclaw
3. **配置** — config.yaml填写正确信息
4. **启动** — npm start 或 Docker
5. **代理** — Nginx配置SSL

祝你部署成功！

---

## 参考资源

- [OpenClaw官网](https://openclaw.ai)
- [OpenClaw文档](https://docs.openclaw.ai)
- [ClawHub技能市场](https://clawhub.ai)

---

🎉 **恭喜！** 你的OpenClaw机器人已准备就绪！
