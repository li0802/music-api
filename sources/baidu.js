const axios = require("axios");
const cheerio = require("cheerio");

module.exports = async function baiduSearch(query) {
  const res = await axios.get("https://www.baidu.com/s", {
    params: { wd: query },
    headers: { "User-Agent": "Mozilla/5.0" }
  });

  const $ = cheerio.load(res.data);
  const results = [];

  $(".result").each((i, el) => {
    const title = $(el).find("h3").text().trim();
    const url = $(el).find("a").attr("href");
    const snippet = $(el).find(".c-abstract").text().trim();
    if (title && url) {
      results.push({ source: "Baidu", title, url, snippet });
    }
  });

  return results;
};
