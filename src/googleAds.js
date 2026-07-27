import { GoogleAdsApi } from "google-ads-api";

function buildClient() {
  return new GoogleAdsApi({
    client_id: process.env.GOOGLE_ADS_CLIENT_ID,
    client_secret: process.env.GOOGLE_ADS_CLIENT_SECRET,
    developer_token: process.env.GOOGLE_ADS_DEVELOPER_TOKEN,
  });
}

function buildCustomer(client) {
  return client.Customer({
    customer_id: process.env.GOOGLE_ADS_CUSTOMER_ID,
    login_customer_id: process.env.GOOGLE_ADS_LOGIN_CUSTOMER_ID,
    refresh_token: process.env.GOOGLE_ADS_REFRESH_TOKEN,
  });
}

const PLACEMENT_TYPE_MAP = {
  5: "YOUTUBE_VIDEO",
  YOUTUBE_VIDEO: "YOUTUBE_VIDEO",
  6: "YOUTUBE_CHANNEL",
  YOUTUBE_CHANNEL: "YOUTUBE_CHANNEL",
};

function normalizePlacementType(placementType) {
  return PLACEMENT_TYPE_MAP[placementType] || placementType;
}

function placementIdFromUrl(url) {
  if (!url) return null;
  const videoMatch = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (videoMatch) return { type: "YOUTUBE_VIDEO", id: videoMatch[1] };
  const channelMatch = url.match(/channel\/(UC[a-zA-Z0-9_-]+)/);
  if (channelMatch) return { type: "YOUTUBE_CHANNEL", id: channelMatch[1] };
  return null;
}

/**
 * Haalt YouTube-plaatsingen op uit zowel PMax- als losse video-campagnes
 * voor het klant-account, bevraagd via het manager-account.
 */
export async function fetchPlacements({ lookbackDays }) {
  const client = buildClient();
  const customer = buildCustomer(client);
  const results = [];

  const pmaxRows = await customer.query(`
    SELECT
      performance_max_placement_view.display_name,
      performance_max_placement_view.placement,
      performance_max_placement_view.placement_type,
      campaign.id,
      campaign.name,
      metrics.impressions
    FROM performance_max_placement_view
    WHERE segments.date DURING LAST_${lookbackDays}_DAYS
      AND performance_max_placement_view.placement_type IN ('YOUTUBE_VIDEO', 'YOUTUBE_CHANNEL')
  `);

  for (const row of pmaxRows) {
    const view = row.performance_max_placement_view;
    const placementType = normalizePlacementType(view.placement_type);
    const parsed = placementIdFromUrl(view.placement) || {
      type: placementType,
      id: view.placement,
    };
    results.push({
      source: "pmax",
      campaignId: row.campaign?.id,
      campaignName: row.campaign?.name,
      placementType,
      placement: view.placement,
      displayName: view.display_name,
      impressions: Number(row.metrics?.impressions || 0),
      youtubeId: parsed?.id || null,
      youtubeIdType: normalizePlacementType(parsed?.type) || null,
    });
  }

  const videoRows = await customer.query(`
    SELECT
      detail_placement_view.display_name,
      detail_placement_view.placement,
      detail_placement_view.placement_type,
      detail_placement_view.group_placement_target_url,
      campaign.id,
      campaign.name,
      campaign.advertising_channel_type,
      metrics.impressions
    FROM detail_placement_view
    WHERE segments.date DURING LAST_${lookbackDays}_DAYS
      AND campaign.advertising_channel_type = 'VIDEO'
      AND detail_placement_view.placement_type IN ('YOUTUBE_VIDEO', 'YOUTUBE_CHANNEL')
  `);

  for (const row of videoRows) {
    const view = row.detail_placement_view;
    const placementType = normalizePlacementType(view.placement_type);
    const parsed = placementIdFromUrl(view.placement) || {
      type: placementType,
      id: view.placement,
    };
    results.push({
      source: "video",
      campaignId: row.campaign?.id,
      campaignName: row.campaign?.name,
      placementType,
      placement: view.placement,
      displayName: view.display_name,
      impressions: Number(row.metrics?.impressions || 0),
      youtubeId: parsed?.id || null,
      youtubeIdType: normalizePlacementType(parsed?.type) || null,
    });
  }

  return results;
}
