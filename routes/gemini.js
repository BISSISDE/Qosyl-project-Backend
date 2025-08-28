const express = require("express");
const { GEMINI_API_KEY } = require("../config/env");

const router = express.Router();
console.log("Gemini key:", GEMINI_API_KEY);

router.post("/ask", async (req, res) => {
  const { contents } = req.body;

  try {
    const otinish = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents }),
      }
    );

    const malimet = await otinish.json();
    res.json(malimet);
  } catch (err) {
    console.error("Gemini API error:", err);
    res.status(500).json({ error: "Something went wrong" });
  }
});

module.exports = router;
