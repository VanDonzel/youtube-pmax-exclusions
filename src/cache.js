import fs from "node:fs";

const CACHE_PATH = new URL("../cache.json", import.meta.url);

export function loadCache() {
  try {
    return JSON.parse(fs.readFileSync(CACHE_PATH, "utf-8"));
  } catch {
    return {};
  }
}

export function saveCache(cache) {
  fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2));
}

export function cacheKey(placement) {
  return `${placement.youtubeIdType}:${placement.youtubeId}`;
}
