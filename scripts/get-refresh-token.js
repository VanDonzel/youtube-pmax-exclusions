import "dotenv/config";
import { createServer } from "http";
import { OAuth2Client } from "google-auth-library";
import { exec } from "child_process";

const client = new OAuth2Client(
  process.env.GOOGLE_ADS_CLIENT_ID,
  process.env.GOOGLE_ADS_CLIENT_SECRET,
  "http://localhost:3000/callback"
);

const url = client.generateAuthUrl({
  access_type: "offline",
  prompt: "consent",
  scope: ["https://www.googleapis.com/auth/adwords"],
});

console.log("\nOpening browser for Google authorization...");
console.log("If the browser doesn't open, visit:\n" + url + "\n");

exec(`start "" "${url}"`);

const server = createServer(async (req, res) => {
  const urlObj = new URL(req.url, "http://localhost:3000");
  const code = urlObj.searchParams.get("code");
  if (!code) {
    res.end("No code found.");
    return;
  }
  res.end("<h2>Done! Check your terminal for the refresh token.</h2>");
  server.close();

  const { tokens } = await client.getToken(code);
  console.log("\n✅ Nieuw refresh token:\n");
  console.log(tokens.refresh_token);
  console.log("\nKopieer dit en plak het in je .env als:");
  console.log("GOOGLE_ADS_REFRESH_TOKEN=" + tokens.refresh_token + "\n");
});

server.listen(3000, () => {
  console.log("Wachten op callback op http://localhost:3000/callback ...");
});
