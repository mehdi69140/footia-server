import express from "express";
import fetch from "node-fetch";
import cors from "cors";

const app = express();
app.use(cors());
app.use(express.json());

let cache = {};
let lastFetch = {};
const CACHE_DURATION = 1000 * 60 * 60 * 6; // 6 heures

app.post("/matches", async (req, res) => {
  const { date, prompt } = req.body;

  if (cache[date] && Date.now() - lastFetch[date] < CACHE_DURATION) {
    return res.json(cache[date]);
  }

  try {
    const response = await fetch("https://mlvoca.com/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "tinyllama",
        prompt: prompt
      })
    });

    const data = await response.json();

    cache[date] = data;
    lastFetch[date] = Date.now();

    res.json(data);

  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Erreur API gratuite" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
