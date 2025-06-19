const express = require("express");
const fetch = require("node-fetch");
const app = express();

const CLIENT_ID = process.env.CLIENT_ID;
const CLIENT_SECRET = process.env.CLIENT_SECRET;
const BROADCASTER_ID = process.env.BROADCASTER_ID;

let accessToken = null;

async function getAccessToken() {
  const res = await fetch("https://id.twitch.tv/oauth2/token", {
    method: "POST",
    body: new URLSearchParams({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: "client_credentials",
    }),
  });

  const data = await res.json();
  accessToken = data.access_token;
}

async function getSubCount() {
  if (!accessToken) await getAccessToken();

  const res = await fetch(
    \`https://api.twitch.tv/helix/subscriptions?broadcaster_id=\${BROADCASTER_ID}\`,
    {
      headers: {
        "Client-ID": CLIENT_ID,
        Authorization: \`Bearer \${accessToken}\`,
      },
    }
  );

  if (res.status === 401) {
    accessToken = null;
    return getSubCount();
  }

  const data = await res.json();
  return data.total || 0;
}

app.get("/subcount", async (req, res) => {
  try {
    const subs = await getSubCount();
    res.json({ count: subs });
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch subscriber count." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(\`Listening on port \${PORT}\`));
