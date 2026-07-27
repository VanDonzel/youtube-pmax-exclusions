import fs from "node:fs";
import path from "node:path";

function csvEscape(value) {
  const str = String(value ?? "");
  if (/[",\n]/.test(str)) return `"${str.replace(/"/g, '""')}"`;
  return str;
}

export function writeReport(results, { outDir }) {
  fs.mkdirSync(outDir, { recursive: true });

  const excluded = results.filter((r) => !r.classification.relevant);
  const kept = results.filter((r) => r.classification.relevant);

  const csvHeader = "source,campaign_id,campaign_name,placement_type,placement,display_name,impressions,score,reason,category\n";
  const csvRows = excluded
    .map((r) =>
      [
        r.source,
        r.campaignId,
        r.campaignName,
        r.placementType,
        r.placement,
        r.displayName,
        r.impressions,
        r.classification.score,
        r.classification.reason,
        r.classification.category,
      ]
        .map(csvEscape)
        .join(",")
    )
    .join("\n");

  const csvPath = path.join(outDir, "uitsluitingen.csv");
  fs.writeFileSync(csvPath, csvHeader + csvRows + "\n");

  const keptRows = kept
    .map((r) =>
      [
        r.source,
        r.campaignId,
        r.campaignName,
        r.placementType,
        r.placement,
        r.displayName,
        r.impressions,
        r.classification.score,
        r.classification.reason,
        r.classification.category,
      ]
        .map(csvEscape)
        .join(",")
    )
    .join("\n");
  const keptPath = path.join(outDir, "houden.csv");
  const existing = fs.existsSync(keptPath) ? fs.readFileSync(keptPath, "utf-8") : csvHeader;
  const existingIds = new Set(existing.split("\n").slice(1).map((l) => l.split(",")[4]));
  const newKeptRows = kept.filter((r) => !existingIds.has(r.placement));
  if (newKeptRows.length > 0) {
    const newRows = newKeptRows.map((r) =>
      [r.source, r.campaignId, r.campaignName, r.placementType, r.placement, r.displayName, r.impressions, r.classification.score, r.classification.reason, r.classification.category]
        .map(csvEscape).join(",")
    ).join("\n");
    fs.appendFileSync(keptPath, (existing.endsWith("\n") ? "" : "\n") + newRows + "\n");
  } else if (!fs.existsSync(keptPath)) {
    fs.writeFileSync(keptPath, csvHeader + "\n");
  }

  const bySource = (rows) =>
    rows.reduce((acc, r) => {
      acc[r.source] = (acc[r.source] || 0) + 1;
      return acc;
    }, {});

  const summary = `# YouTube-plaatsingen rapport

Datum: ${new Date().toISOString()}

- Totaal beoordeeld: ${results.length}
- Voorgesteld uit te sluiten: ${excluded.length} (${JSON.stringify(bySource(excluded))})
- Gehouden (relevant): ${kept.length} (${JSON.stringify(bySource(kept))})

## Top redenen voor uitsluiting
${excluded
  .slice(0, 10)
  .map((r) => `- [${r.classification.score}/10] ${r.displayName || r.placement}: ${r.classification.reason}`)
  .join("\n") || "(geen)"}

CSV met uitsluitingen: ${csvPath}
`;

  const summaryPath = path.join(outDir, "rapport.md");
  fs.writeFileSync(summaryPath, summary);

  return { csvPath, summaryPath, excludedCount: excluded.length, keptCount: kept.length };
}
