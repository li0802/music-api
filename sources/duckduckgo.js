const axios = require("axios");
const cheerio = require("cheerio");

module.exports = async function ddgSearch(query) {
  const res = await axios.get("https://html.duckduckgo.com/html/", {
    params: { q: query },
    headers: { "User-Agent": "Mozilla/5.0" }
  });

  const $ = cheerio.load(res.data);
  const results = [];

  $(".result").each((i, el) => {
    const title = $(el).find(".result__title").text().trim();
    const url = $(el).find(".result__url").attr("href");
    const snippet = $(el).find(".result__snippet").text().trim();
    if (title && url) {
      results.push({ source: "DuckDuckGo", title, url, snippet });
    }
  });

  return results;
};
