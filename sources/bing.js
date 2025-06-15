const axios = require("axios");
const cheerio = require("cheerio");

module.exports = async function bingSearch(query) {
  const res = await axios.get("https://www.bing.com/search", {
    params: { q: query },
    headers: { "User-Agent": "Mozilla/5.0" }
  });

  const $ = cheerio.load(res.data);
  const results = [];

  $(".b_algo").each((i, el) => {
    const title = $(el).find("h2").text().trim();
    const url = $(el).find("h2 a").attr("href");
    const snippet = $(el).find(".b_caption p").text().trim();
    if (title && url) {
      results.push({ source: "Bing", title, url, snippet });
    }
  });

  return results;
};
