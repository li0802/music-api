const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = 8080; // 选择一个端口，避免冲突

// 导入路由
const musicPosterRouter = require('./routes/musicPoster');
const searchRoutes = require('./routes/search');
const cardRoutes = require('./routes/card');
const musicRoutes = require('./routes/music');
const downloadhRoutes = require('./routes/download');

// 中间件
app.use(cors());
app.use(express.static('public'));
app.use('/templates', express.static(path.join(__dirname, 'public/templates')));

// 使用路由
app.use('/api', musicPosterRouter);
app.use('/api', musicRoutes);
app.use(searchRoutes);
app.use(cardRoutes);
app.use('/download', downloadhRoutes);

// 根路径
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="zh">
    <head>
      <meta charset="UTF-8" />
      <title>朕的Music API</title>
      <style>
        body {
          margin: 0;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          background: linear-gradient(to right, #2c3e50, #3498db);
          color: #fff;
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100vh;
        }
        .container {
          background-color: rgba(0, 0, 0, 0.5);
          padding: 40px;
          border-radius: 16px;
          box-shadow: 0 0 30px rgba(0, 0, 0, 0.4);
          max-width: 600px;
          text-align: center;
        }
        h1 {
          font-size: 2em;
          margin-bottom: 20px;
          color: #f1c40f;
        }
        p {
          margin: 10px 0;
          font-size: 1.1em;
        }
        code {
          background: #34495e;
          padding: 2px 6px;
          border-radius: 4px;
        }
        a {
          color: #1abc9c;
          text-decoration: none;
        }
        a:hover {
          text-decoration: underline;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>欢迎使用朕的 Music API 👑</h1>
        <p>🎵 音乐海报生成 API：<code>/api/generate-phone-poster</code></p>
        <p>🔍 多源搜索 API：<code>/search?q=xxx</code></p>
        <p>🃏 卡片生成接口：<code>/generate-card</code></p>
        <p>🎧 音乐 API 代理：<code>/api/music?id=xxxxxx</code></p>
        <p>⬇️ 音乐下载链接：<code>/download?q=xxxx</code></p>
        <p style="margin-top: 20px;">更多内容请查看 <a href="https://github.com/li0802">项目文档</a></p>
      </div>
    </body>
    </html>
  `);
});


// 启动服务器
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🎵 欢迎使用音乐海报生成API 🎵 http://localhost:${PORT}/api/generate-phone-poster?`);
  console.log(`✅ 多源搜索 API：http://localhost:${PORT}/search?q=xxx`);
  console.log(`🎵 卡片生成接口：http://localhost:${PORT}/generate-card`);
  console.log(`🎵 音乐API代理：http://localhost:${PORT}/api/music?id=xxxxxx`);
  console.log(`🎵 音乐下载链接：http://localhost:${PORT}/download?q=xxx`);
});