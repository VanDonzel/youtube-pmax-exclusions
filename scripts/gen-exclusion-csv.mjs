import "dotenv/config";
import { readFileSync, writeFileSync } from "fs";

const CUSTOMER_ID = process.env.GOOGLE_ADS_CUSTOMER_ID;
if (!CUSTOMER_ID) {
  console.error("Zet GOOGLE_ADS_CUSTOMER_ID in .env voordat je dit script draait.");
  process.exit(1);
}

const lines = readFileSync("output/uitsluitingen.csv", "utf8").trim().split("\n");
// Columns: source,campaign_id,campaign_name,placement_type,placement,display_name,impressions,score,reason,category
const seen = new Set();
const header = "Row Type,Action,Customer ID,Placement Exclusion List ID,Placement Exclusion List Name,Placement Exclusion";
const rows = [];

for (let i = 1; i < lines.length; i++) {
  const line = lines[i];
  const cols = [];
  let cur = "", inQuote = false;
  for (const c of line) {
    if (c === '"') { inQuote = !inQuote; }
    else if (c === "," && !inQuote) { cols.push(cur); cur = ""; }
    else { cur += c; }
  }
  cols.push(cur);

  const placementType = cols[3];
  const placementId = cols[4];
  if (!placementId) continue;

  let url;
  if (placementType === "YOUTUBE_VIDEO") {
    url = "https://www.youtube.com/watch?v=" + placementId;
  } else if (placementType === "YOUTUBE_CHANNEL") {
    url = "https://www.youtube.com/channel/" + placementId;
  } else {
    url = placementId;
  }

  if (!seen.has(url)) {
    seen.add(url);
    rows.push(`Negative Placement,Add,${CUSTOMER_ID},,YouTube Uitsluitingen Juli 2026,` + url);
  }
}

const out = header + "\n" + rows.join("\n");
writeFileSync("output/google-ads-uitsluitingen.csv", out);
console.log("Unieke uitsluitingen:", rows.length);
console.log("Eerste 3 URLs:");
rows.slice(0, 3).forEach((r) => console.log(r.split(",").pop()));
