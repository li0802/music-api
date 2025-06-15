const express = require('express');
const router = express.Router();
const https = require('https');
const iconv = require('iconv-lite');

// 支持动态ID参数的音乐API代理接口
router.get('/music', (req, res) => {
  // 从查询参数中获取ID
  const musicId = req.query.id;
  
  if (!musicId) {
    return res.status(400).json({ error: '缺少必要参数: id' });
  }
  
  const targetUrl = `https://fancraft.co/api/music?platform=netease&id=${musicId}`;
  
  https.get(targetUrl, (apiRes) => {
    // 处理响应编码
    const chunks = [];
    let responseEncoding = apiRes.headers['content-encoding'] || 'utf8';
    
    apiRes.on('data', (chunk) => {
      chunks.push(chunk);
    });
    
    apiRes.on('end', () => {
      try {
        // 合并Buffer并处理编码
        const buffer = Buffer.concat(chunks);
        let decodedData;
        
        // 尝试按UTF-8解码，如果失败则使用iconv-lite处理其他编码
        try {
          decodedData = buffer.toString('utf8');
        } catch (e) {
          // 尝试使用GBK解码（处理中文乱码常见情况）
          decodedData = iconv.decode(buffer, 'gbk');
        }
        
        // 解析JSON
        const jsonData = JSON.parse(decodedData);
        
        // 设置正确的响应头
        res.setHeader('Content-Type', 'application/json; charset=utf-8');
        res.json(jsonData);
      } catch (parseError) {
        console.error('JSON解析错误:', parseError);
        // 返回原始数据（带错误提示）
        res.setHeader('Content-Type', 'text/plain; charset=utf-8');
        res.status(500).send(`JSON解析错误: ${parseError.message}\n原始数据: ${decodedData}`);
      }
    });
    
  }).on('error', (err) => {
    console.error('代理请求出错:', err);
    res.status(500).json({ error: '代理服务器内部错误' });
  });
});

module.exports = router;