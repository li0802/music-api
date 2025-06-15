const express = require("express");
const router = express.Router();

const bingSearch = require("../sources/bing");
const ddgSearch = require("../sources/duckduckgo");

router.get("/search", async (req, res) => {
  const query = req.query.q;
  const format = req.query.format || "flat";

  if (!query) {
    return res.status(400).json({ success: false, message: "缺少参数 q" });
  }

  try {
    // 修复：解构出 baidu、bing、duck
    const [bing, duck] = await Promise.all([
      bingSearch(query),
      ddgSearch(query)
    ]);

    let response;
    if (format === "grouped") {
      response = {
        success: true,
        query,
        sources: {
          bing,
          duckduckgo: duck
        }
      };
    } else {
      response = {
        success: true,
        query,
        results: [...bing, ...duck]
      };
    }

    res.json(response);
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
});

module.exports = router;
