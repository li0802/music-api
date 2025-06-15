# 👑 朕的 Music API

一个简洁、实用、多功能的音乐 API 接口项目，支持音乐搜索、播放、下载、卡片生成、海报生成等功能。

## 📦 功能接口

| 功能            | 路径示例                               | 描述                         |
| --------------- | -------------------------------------- | ---------------------------- |
| 🎵 音乐海报生成  | `/api/generate-phone-poster?title=xxx` | 生成手机 UI 风格的音乐封面图 |
| 🔍 多源搜索      | `/search?q=关键词`                     | 支持多个音乐平台搜索         |
| 🃏 卡片生成      | `/generate-card`                       | 生成带有歌曲信息的分享卡片   |
| 🎧 音乐 API 代理 | `/api/music?id=xxxxxx`                 | 获取音乐播放链接             |
| ⬇️ 音乐下载      | `/download?q=关键词或ID`               | 获取可用的下载链接           |

## 🛠️ 使用方法

### 1. 克隆项目

```bash
git clone https://github.com/yourname/music-api.git
cd music-api
```

### 2. 安装依赖

```bash
npm install
```

### 3. 启动服务

```bash
node index.js
```

## 📁 项目结构

```
music-api/
├── api/                  # 所有 API 路由
├── public/               # 静态资源（图片、样式）
├── views/                # 模板文件（可选）
├── index.js              # 主入口
└── README.md             # 项目说明
```
