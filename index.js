const express = require("express");
const fetch = require("node-fetch");
const app = express();

// Environment variables
const CLIENT_ID = process.env.CLIENT_ID;
const BROADCASTER_ID = process.env.BROADCASTER_ID;
const USER_ACCESS_TOKEN = process.env.USER_ACCESS_TOKEN;

// Main function to fetch sub count
async function getSubCount() {
  const res = await fetch(
    `https://api.twitch.tv/helix/subscriptions?broadcaster_id=${BROADCASTER_ID}`,
    {
      headers: {
        "Client-ID": CLIENT_ID,
        Authorization: `Bearer ${USER_ACCESS_TOKEN}`,
      },
    }
  );

  if (!res.ok) {
    const error = await res.text();
    console.error("Twitch API error:", error);
    throw new Error("Failed to fetch sub count.");
  }

  const data = await res.json();
  return data.total || 0;
}

// API endpoint
app.get("/subcount", async (req, res) => {
  try {
    const subs = await getSubCount();
    res.json({ count: subs });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch subscriber count." });
  }
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () =>
  console.log(`✅ Server live! Listening on port ${PORT}`)
);
