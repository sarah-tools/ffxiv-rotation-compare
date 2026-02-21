import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config({ path: "../.env" });

const app = express();
app.use(cors({ origin: "http://localhost:5173" }));
app.use(express.json());

const CLIENT_ID = process.env.FFLOGS_CLIENT_ID ?? "";
const CLIENT_SECRET = process.env.FFLOGS_CLIENT_SECRET ?? "";

let cachedToken: { token: string; expiresAt: number } | null = null;

app.post("/api/token", async (_req, res) => {
  if (!CLIENT_ID || !CLIENT_SECRET) {
    res.status(500).json({ error: "FFLOGS_CLIENT_ID and FFLOGS_CLIENT_SECRET must be set in .env" });
    return;
  }

  // Return cached token if still valid (with 5 min buffer)
  if (cachedToken && Date.now() < cachedToken.expiresAt - 300_000) {
    res.json({ access_token: cachedToken.token });
    return;
  }

  try {
    const credentials = Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64");
    const response = await fetch("https://www.fflogs.com/oauth/token", {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: "grant_type=client_credentials",
    });

    if (!response.ok) {
      const text = await response.text();
      res.status(response.status).json({ error: `FFLogs OAuth error: ${text}` });
      return;
    }

    const data = await response.json() as { access_token: string; expires_in: number };
    cachedToken = {
      token: data.access_token,
      expiresAt: Date.now() + data.expires_in * 1000,
    };

    res.json({ access_token: data.access_token });
  } catch (err) {
    res.status(500).json({ error: `Token fetch failed: ${err}` });
  }
});

const PORT = process.env.PORT ?? 3002;
app.listen(PORT, () => {
  console.log(`Token server running on http://localhost:${PORT}`);
});
