import "dotenv/config";
import { fileURLToPath } from "node:url";
import { fetchPlacements } from "./src/googleAds.js";
import { enrichPlacements } from "./src/youtubeData.js";
import { classifyPlacement, buildAnthropicClient } from "./src/classify.js";
import { loadCache, saveCache, cacheKey } from "./src/cache.js";
import { writeReport } from "./src/report.js";

const LOOKBACK_DAYS = Number(process.env.LOOKBACK_DAYS || 30);
const IMPRESSION_THRESHOLD = Number(process.env.IMPRESSION_THRESHOLD || 50);
const OUT_DIR = fileURLToPath(new URL("./output/", import.meta.url));

let googleAdsCalls = 0;
let youtubeCalls = 0;
let claudeCalls = 0;

async function main() {
  console.log(`Plaatsingen ophalen (account ${process.env.GOOGLE_ADS_CUSTOMER_ID} via manager ${process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID}, laatste ${LOOKBACK_DAYS} dagen)...`);
  const allPlacements = await fetchPlacements({ lookbackDays: LOOKBACK_DAYS });
  googleAdsCalls += 2; // pmax query + video query
  console.log(`${allPlacements.length} ruwe plaatsingen gevonden (PMax + video-campagnes).`);

  const filtered = allPlacements.filter(
    (p) => p.impressions > IMPRESSION_THRESHOLD && p.youtubeId
  );
  console.log(`${filtered.length} plaatsingen boven drempel (${IMPRESSION_THRESHOLD} impressies) met geldig YouTube-ID.`);

  const cache = loadCache();
  const toProcess = filtered.filter((p) => !cache[cacheKey(p)]);
  const alreadyCached = filtered.filter((p) => cache[cacheKey(p)]);
  console.log(`${toProcess.length} nieuw te beoordelen, ${alreadyCached.length} al in cache.`);

  let enriched = [];
  if (toProcess.length > 0) {
    enriched = await enrichPlacements(toProcess, process.env.YOUTUBE_API_KEY);
    youtubeCalls += Math.ceil(toProcess.length / 50) * 2;
  }

  const anthropic = buildAnthropicClient();
  const newResults = [];
  for (const placement of enriched) {
    let classification;
    try {
      classification = await classifyPlacement(placement, anthropic);
    } catch (e) {
      console.warn(`Classificatie overgeslagen voor ${placement.youtubeId}: ${e.message}`);
      classification = { relevant: false, score: 1, reason: "Classificatiefout — veiligheidshalve uitgesloten", category: "onbekend" };
    }
    claudeCalls += 1;
    const result = { ...placement, classification };
    newResults.push(result);
    cache[cacheKey(placement)] = {
      classification,
      classifiedAt: new Date().toISOString(),
      displayName: placement.displayName,
      placement: placement.placement,
      placementType: placement.placementType,
      source: placement.source,
      campaignId: placement.campaignId,
      campaignName: placement.campaignName,
      impressions: placement.impressions,
    };
  }
  saveCache(cache);

  const cachedResults = alreadyCached.map((p) => ({
    ...p,
    classification: cache[cacheKey(p)].classification,
  }));

  const allResults = [...newResults, ...cachedResults];

  const { csvPath, summaryPath, excludedCount, keptCount } = writeReport(allResults, { outDir: OUT_DIR });

  console.log(`\nKlaar. ${excludedCount} voorgesteld om uit te sluiten, ${keptCount} gehouden.`);
  console.log(`CSV: ${csvPath}`);
  console.log(`Rapport: ${summaryPath}`);
  console.log(`\nAPI-calls deze run: Google Ads=${googleAdsCalls}, YouTube=${youtubeCalls}, Claude=${claudeCalls}`);
}

main().catch((err) => {
  console.error("Fout tijdens uitvoering:", err);
  process.exit(1);
});
