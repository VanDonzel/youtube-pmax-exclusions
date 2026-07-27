const API_BASE = "https://www.googleapis.com/youtube/v3";

function chunk(arr, size) {
  const out = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

async function fetchBatch(endpoint, ids, apiKey) {
  const url = `${API_BASE}/${endpoint}?part=snippet&id=${ids.join(",")}&key=${apiKey}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`YouTube API ${endpoint} fout: ${res.status} ${await res.text()}`);
  }
  const data = await res.json();
  return data.items || [];
}

/**
 * Verrijkt placements met video- en kanaalmetadata via YouTube Data API v3.
 * Batcht in groepen van 50 ID's per categorie om quota te sparen.
 */
export async function enrichPlacements(placements, apiKey) {
  const videoIds = [...new Set(
    placements.filter((p) => p.youtubeIdType === "YOUTUBE_VIDEO" && p.youtubeId).map((p) => p.youtubeId)
  )];
  const channelIds = [...new Set(
    placements.filter((p) => p.youtubeIdType === "YOUTUBE_CHANNEL" && p.youtubeId).map((p) => p.youtubeId)
  )];

  const videoMeta = new Map();
  for (const batch of chunk(videoIds, 50)) {
    const items = await fetchBatch("videos", batch, apiKey);
    for (const item of items) {
      videoMeta.set(item.id, {
        title: item.snippet?.title,
        channelTitle: item.snippet?.channelTitle,
        channelId: item.snippet?.channelId,
        description: item.snippet?.description,
        categoryId: item.snippet?.categoryId,
        defaultLanguage: item.snippet?.defaultLanguage,
      });
    }
  }

  const channelIdsToFetch = new Set(channelIds);
  for (const meta of videoMeta.values()) {
    if (meta.channelId) channelIdsToFetch.add(meta.channelId);
  }

  const channelMeta = new Map();
  for (const batch of chunk([...channelIdsToFetch], 50)) {
    const items = await fetchBatch("channels", batch, apiKey);
    for (const item of items) {
      channelMeta.set(item.id, {
        title: item.snippet?.title,
        description: item.snippet?.description,
        country: item.snippet?.country,
        customUrl: item.snippet?.customUrl,
      });
    }
  }

  return placements.map((p) => {
    if (p.youtubeIdType === "YOUTUBE_VIDEO" && videoMeta.has(p.youtubeId)) {
      const v = videoMeta.get(p.youtubeId);
      const c = v.channelId ? channelMeta.get(v.channelId) : null;
      return {
        ...p,
        video: v,
        channel: c
          ? { id: v.channelId, ...c }
          : null,
      };
    }
    if (p.youtubeIdType === "YOUTUBE_CHANNEL" && channelMeta.has(p.youtubeId)) {
      return {
        ...p,
        video: null,
        channel: { id: p.youtubeId, ...channelMeta.get(p.youtubeId) },
      };
    }
    return { ...p, video: null, channel: null };
  });
}
