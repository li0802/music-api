const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');

const router = express.Router();

router.get('/', async (req, res) => {
    const keyword = req.query.q || '海阔天空';
    const url = `https://pinkamuz.pro/search/${encodeURIComponent(keyword)}`;

    try {
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0',
            },
        });

        const $ = cheerio.load(response.data);
        const result = [];

        $('.track').slice(0, 3).each((_, el) => {
            const artist = $(el).find('.artist a').text().trim();
            const title = $(el).find('.title').text().trim();
            let downloadUrl = $(el).find('.play-download a.link').attr('href');

            if (downloadUrl && downloadUrl.startsWith('//')) {
                downloadUrl = 'https:' + downloadUrl;
            }

            if (artist && title && downloadUrl) {
                result.push({ artist, title, downloadUrl });
            }
        });

        res.json(result);
    } catch (err) {
        console.error('抓取失败:', err.message);
        res.status(500).json({ error: '爬取失败' });
    }
});

module.exports = router;
