const express = require("express");
const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");
const router = express.Router();

// 确保图片目录存在
const IMAGE_DIR = '/usr/share/caddy/img';
const IMAGE_BASE_URL = "http://limc.fun/img";

// 创建图片目录（如果不存在）
if (!fs.existsSync(IMAGE_DIR)) {
  fs.mkdirSync(IMAGE_DIR, { recursive: true });
}

// 默认主题配置
const phoneTheme = {
  id: "phone",
  name: "手机风格",
  background: "/templates/phone.png",
  backgroundType: "image",
  text: "#ffffff",
  secondary: "#cccccc",
};

// 海报元素配置 - 修复文字偏移问题
const posterConfig = {
  cover: { x: 0.1, y: 0.04, scale: 1, visible: true }, 
  title: { x: 0.12, y: 0.62, scale: 1.1, visible: true }, 
  artist: { x: 0.12, y: 0.68, scale: 0.9, visible: true }, 
  lyrics: { x: 0.12, y: 0.74, scale: 0.85, visible: true }, 
  duration: { x: 0.87, y: 0.72, scale: 0.9, visible: true }, 
  startTime: { x: 0.13, y: 0.72, scale: 0.9, visible: true }, // 新增开始时间位置
};

// 格式化时长为mm:ss
function formatDuration(seconds) {
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

// 处理歌词，提取指定行数
function processLyrics(rawLyrics, lines = 1) {
  if (!rawLyrics) return "";
  
  // 处理LRC格式歌词
  if (rawLyrics.includes("[") && rawLyrics.includes("]")) {
    const lyricsLines = rawLyrics.split("\n");
    const textLines = lyricsLines
      .filter(line => line.includes("]"))
      .map(line => line.substring(line.indexOf("]") + 1).trim())
      .filter(line => line.length > 0);
    
    return textLines.slice(0, lines).join("\n");
  }
  
  // 普通文本歌词
  return rawLyrics.split("\n").slice(0, lines).join("\n");
}

router.get("/generate-phone-poster", async (req, res) => {
  const {
    title = "默认标题",
    artist = "默认艺术家",
    coverUrl = "https://picsum.photos/400/400",
    lyrics = "",
    duration = 320,
    startTime = 30,       // 开始时间（秒）
    useGradient = false, // 默认启用渐变
    blur = 0, // 默认背景模糊度
    opacity = 1, // 默认背景不透明度
    backgroundImage = "",
  } = req.query;

  try {
    // 启动浏览器
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 1000, height: 1500 });

    // 处理歌词
    const processedLyrics = processLyrics(lyrics, 1);
    
    // 动态构建完整的背景图片URL，确保Puppeteer能正确加载
    const defaultBgUrl = `${req.protocol}://${req.get('host')}/templates/phone.png`;
    
    // 构建海报HTML
    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>音乐海报</title>
      <script src="https://cdn.tailwindcss.com"></script>
      <link href="https://cdn.jsdelivr.net/npm/font-awesome@4.7.0/css/font-awesome.min.css" rel="stylesheet">
      <style>
        body {
          margin: 0;
          padding: 0;
          font-family: 'Noto Sans SC', 'Microsoft YaHei', sans-serif;
        }
        .poster-container {
          position: relative;
          width: 1000px;
          height: 1500px;
          background-color: #000;
        }
        .poster-background {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          /* 使用完整URL引用背景图片，确保Puppeteer能正确加载 */
          background-image: url('${backgroundImage || defaultBgUrl}');
          background-size: cover;
          background-position: center;
          ${blur > 0 ? `filter: blur(${blur}px);` : ''}
          opacity: ${opacity};
        }
        .poster-gradient {
          position: absolute;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: linear-gradient(180deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 100%);
          ${useGradient ? '' : 'display: none;'}
        }
        .poster-content {
          position: relative;
          width: 100%;
          height: 100%;
          padding: 40px;
          box-sizing: border-box;
        }
        .poster-cover {
          position: absolute;
          top: ${posterConfig.cover.y * 100}%;
          left: ${posterConfig.cover.x * 100}%;
          width: 800px;
          height: 800px;
          border-radius: 20px;
          overflow: hidden;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        }
        .poster-cover img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        .poster-title {
          position: absolute;
          top: ${posterConfig.title.y * 100}%;
          left: ${posterConfig.title.x * 100}%;
          width: 80%;
          color: ${phoneTheme.text};
          font-size: ${48 * posterConfig.title.scale}px;
          font-weight: bold;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .poster-artist {
          position: absolute;
          top: ${posterConfig.artist.y * 100}%;
          left: ${posterConfig.artist.x * 100}%;
          width: 80%;
          color: ${phoneTheme.secondary};
          font-size: ${48 * posterConfig.artist.scale}px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .poster-lyrics {
          position: absolute;
          top: ${posterConfig.lyrics.y * 100}%;
          left: ${posterConfig.lyrics.x * 100}%;
          width: 80%;
          color: ${phoneTheme.text};
          font-size: ${50 * posterConfig.lyrics.scale}px;
          text-align: center;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .poster-duration {
          position: absolute;
          top: ${posterConfig.duration.y * 100}%;
          right: ${(1 - posterConfig.duration.x) * 100}%;
          color: ${phoneTheme.secondary};
          font-size: ${28 * posterConfig.duration.scale}px;
        }
      </style>
    </head>
    <body>
      <div class="poster-container">
        <div class="poster-background"></div>
        <div class="poster-gradient"></div>
        <div class="poster-content">
          <div class="poster-cover">
            <img src="${coverUrl}" alt="封面图片">
          </div>
          <div class="poster-title">${title}</div>
          <div class="poster-artist">${artist}</div>
          <div class="poster-lyrics">${processedLyrics}</div>
          <div class="poster-duration">${formatDuration(parseInt(duration))}</div>



           <!-- 修改时间显示部分 -->
          <div class="poster-time">
            <span class="start-time" style="
              position: absolute;
              top: ${posterConfig.startTime.y * 100}%;
              left: ${posterConfig.startTime.x * 100}%;
              color: ${phoneTheme.secondary};
              font-size: ${28 * posterConfig.startTime.scale}px;
            ">${formatDuration(parseInt(startTime))}</span>
            
            <span class="duration-divider" style="
              position: absolute;
              top: ${posterConfig.duration.y * 100}%;
              left: 50%;
              transform: translateX(-50%);
              color: ${phoneTheme.secondary};
              font-size: ${28 * posterConfig.duration.scale}px;
            ">/</span>
            
            <span class="total-duration" style="
              position: absolute;
              top: ${posterConfig.duration.y * 100}%;
              right: ${(1 - posterConfig.duration.x) * 100}%;
              color: ${phoneTheme.secondary};
              font-size: ${28 * posterConfig.duration.scale}px;
            ">${formatDuration(parseInt(duration))}</span>
          </div>




        </div>
      </div>
    </body>
    </html>
    `;

    // 设置页面内容
    await page.setContent(html);
    await page.waitForSelector('.poster-container');

    const fileName = `poster_${Date.now()}.jpg`; // 修改文件扩展名为jpg
    const filePath = path.join(IMAGE_DIR, fileName);
    const imageUrl = `${IMAGE_BASE_URL}/${fileName}`;

    const buffer = await page.screenshot({
      type: 'jpeg', // 修改截图类型为jpeg
      quality: 90,  // 设置JPG质量（0-100）
      fullPage: true
    });

    // 保存图片
    fs.writeFileSync(filePath, buffer);
    
    // 关闭浏览器
    await browser.close();

    // 返回结果
    res.json({
      success: true,
      message: '海报生成成功',
      imageUrl
    });
  } catch (error) {
    console.error('生成海报时出错:', error);
    res.status(500).json({ success: false, message: '生成海报失败', error: error.message });
  }
});

module.exports = router;