import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

let cache = {};
let lastFetch = {};
const CACHE_DURATION = 1000 * 60 * 60 * 6;

app.post("/matches", async (req, res) => {

  const { date, prompt } = req.body;

  if (cache[date] && Date.now() - lastFetch[date] < CACHE_DURATION) {
    return res.json(cache[date]);
  }

  try {

    const response = await fetch(
      "https://api.anthropic.com/v1/messages",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": process.env.ANTHROPIC_API_KEY,
          "anthropic-version": "2023-06-01"
        },
        body: JSON.stringify({
          model: "claude-sonnet-4-20250514",
          max_tokens: 2000,
          tools: [{ type: "web_search_20250305", name: "web_search" }],
          messages: [{ role: "user", content: prompt }]
        })
      }
    );

    const data = await response.json();

    cache[date] = data;
    lastFetch[date] = Date.now();

    res.json(data);

  } catch (e) {
    res.status(500).json({ error: "Erreur Claude" });
  }
});

app.listen(process.env.PORT || 3000);