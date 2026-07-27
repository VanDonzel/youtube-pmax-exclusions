import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import * as XLSX from "xlsx";

const CSV_PATH = fileURLToPath(new URL("../output/uitsluitingen.csv", import.meta.url));
const KEPT_PATH = fileURLToPath(new URL("../output/houden.csv", import.meta.url));
const OUT_PATH = fileURLToPath(new URL("../output/uitsluitingen-tabbladen.xlsx", import.meta.url));

const raw = readFileSync(CSV_PATH, "utf-8");
const lines = raw.trim().split("\n");
const header = lines[0];

function parseRow(line) {
  const cols = [];
  let cur = "", inQ = false;
  for (const ch of line) {
    if (ch === '"') { inQ = !inQ; }
    else if (ch === "," && !inQ) { cols.push(cur); cur = ""; }
    else cur += ch;
  }
  cols.push(cur);
  return cols;
}

const headerCols = parseRow(header);
const rows = lines.slice(1).map(parseRow);

function scoreGroup(row) {
  const score = Number(row[7]);
  if (score <= 2) return "Score 1-2 (zeker uitsluiten)";
  if (score <= 4) return "Score 3-4 (waarschijnlijk uitsluiten)";
  if (score <= 6) return "Score 5-6 (twijfelgevallen)";
  return "Score 7+ (houden)";
}

const groups = {
  "Score 1-2 (zeker uitsluiten)": [],
  "Score 3-4 (waarschijnlijk uitsluiten)": [],
  "Score 5-6 (twijfelgevallen)": [],
  "Score 7+ (houden)": [],
};

for (const row of rows) {
  const g = scoreGroup(row);
  groups[g].push(row);
}

// Lees houden.csv als die bestaat
let keptRows = [];
try {
  const keptRaw = readFileSync(KEPT_PATH, "utf-8");
  keptRows = keptRaw.trim().split("\n").slice(1).filter(Boolean).map(parseRow);
} catch {}

const wb = XLSX.utils.book_new();

// Tabblad: Houden (score 7+)
{
  const sheetData = [headerCols, ...keptRows];
  const ws = XLSX.utils.aoa_to_sheet(sheetData);
  ws["!cols"] = headerCols.map((h, i) => {
    const max = Math.max(h.length, ...keptRows.map(r => (r[i] || "").length));
    return { wch: Math.min(max, 80) };
  });
  XLSX.utils.book_append_sheet(wb, ws, "Score 7-10 (houden)");
  console.log(`Score 7-10 (houden): ${keptRows.length} rijen`);
}

for (const [name, data] of Object.entries(groups)) {
  const sheetData = [headerCols, ...data];
  const ws = XLSX.utils.aoa_to_sheet(sheetData);
  ws["!cols"] = headerCols.map((h, i) => {
    const max = Math.max(h.length, ...data.map(r => (r[i] || "").length));
    return { wch: Math.min(max, 80) };
  });
  XLSX.utils.book_append_sheet(wb, ws, name.slice(0, 31));
  console.log(`${name}: ${data.length} rijen`);
}

XLSX.writeFile(wb, OUT_PATH);
console.log(`\nOpgeslagen: ${OUT_PATH}`);
