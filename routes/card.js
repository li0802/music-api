const express = require("express");
const puppeteer = require("puppeteer");
const fs = require("fs");
const path = require("path");

const router = express.Router();

// 可根据你的实际路径调整
const IMAGE_DIR = '/usr/share/caddy/img';
const IMAGE_BASE_URL = 'http://limc.fun/img';

router.get("/generate-card", async (req, res) => {
  const {
    title = '默认标题',
    author = '未知作者',
    platform = '未知平台',
    platformIcon = 'https://picsum.photos/20/20',
    coverImage = 'https://picsum.photos/100/100'
  } = req.query;

  try {
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.setViewport({ width: 500, height: 120 });

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <script src="https://cdn.tailwindcss.com"></script>
      <style>
        body { font-family: 'Noto Sans SC', 'Microsoft YaHei', sans-serif; }
      </style>
    </head>
    <body class="bg-white p-4">
      <div class="flex items-center justify-between bg-gray-50 rounded-xl p-4 shadow w-full max-w-md">
        <div>
          <div class="text-lg font-bold text-gray-900">${title}</div>
          <div class="text-sm text-gray-500">${author}</div>
          <div class="mt-1.5 flex items-center">
            <img src="${platformIcon}" alt="${platform}" class="h-4 mr-1.5">
            <span class="text-green-600 text-sm">${platform}</span>
          </div>
        </div>
        <img src="${coverImage}" alt="封面" class="h-16 w-16 object-cover rounded-lg">
      </div>
    </body>
    </html>
    `;

    await page.setContent(html);
    await page.waitForSelector('div.flex');

    const fileName = `card_${Date.now()}.png`;
    const filePath = path.join(IMAGE_DIR, fileName);
    const imageUrl = `${IMAGE_BASE_URL}/${fileName}`;

    const buffer = await page.screenshot({
      type: 'png',
      fullPage: false,
      clip: { x: 0, y: 10, width: 480, height: 120 }
    });

    await browser.close();
    fs.writeFileSync(filePath, buffer);

    res.json({
      success: true,
      message: '图片生成成功',
      imageUrl
    });
  } catch (error) {
    console.error('生成卡片时出错:', error);
    res.status(500).json({ success: false, message: '生成卡片失败', error: error.message });
  }
});

module.exports = router;
