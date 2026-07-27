import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import OpenAI from "openai";

const PROFILE_PATH = fileURLToPath(new URL("../business-profile.md", import.meta.url));

function loadBusinessProfile() {
  try {
    return readFileSync(PROFILE_PATH, "utf-8").trim();
  } catch {
    throw new Error(
      `Geen bedrijfsprofiel gevonden op ${PROFILE_PATH}.\n` +
        `Kopieer business-profile.example.md naar business-profile.md en vul je eigen bedrijf, doelgroep en scope in ` +
        `(welke YouTube-content relevant is om te houden, welke uitgesloten moet worden).`
    );
  }
}

const BUSINESS_PROFILE = loadBusinessProfile();

const TOOL_SCHEMA = {
  name: "classify_placement",
  description: "Beoordeel relevantie van een YouTube-video/kanaal voor de advertenties van dit bedrijf.",
  input_schema: {
    type: "object",
    properties: {
      relevant: { type: "boolean" },
      score: { type: "integer", minimum: 1, maximum: 10 },
      reason: { type: "string" },
      category: { type: "string" },
    },
    required: ["relevant", "score", "reason", "category"],
  },
};

function sanitize(str) {
  return (str || "").replace(/[ -]/g, " ").replace(/\\/g, "\\\\").trim();
}

function buildPrompt(placement) {
  const title = sanitize(placement.video?.title || placement.channel?.title || placement.displayName || "(onbekend)");
  const channelTitle = sanitize(placement.channel?.title || placement.video?.channelTitle || "(onbekend)");
  const description = sanitize((placement.video?.description || placement.channel?.description || "").slice(0, 500));
  return `Beoordeel deze YouTube-plaatsing:
Titel/kanaal: ${title}
Kanaalnaam: ${channelTitle}
Beschrijving: ${description || "(geen beschrijving)"}
Plaatsingstype: ${placement.youtubeIdType}`;
}

export async function classifyPlacement(placement, client) {
  const response = await client.chat.completions.create({
    model: "gpt-4o-mini",
    max_tokens: 512,
    messages: [
      { role: "system", content: BUSINESS_PROFILE },
      { role: "user", content: buildPrompt(placement) },
    ],
    tools: [
      {
        type: "function",
        function: {
          name: "classify_placement",
          description: TOOL_SCHEMA.description,
          parameters: TOOL_SCHEMA.input_schema,
        },
      },
    ],
    tool_choice: { type: "function", function: { name: "classify_placement" } },
  });

  const toolCall = response.choices[0]?.message?.tool_calls?.[0];
  if (!toolCall) {
    throw new Error("Geen function call ontvangen van OpenAI voor classificatie.");
  }
  try {
    return JSON.parse(toolCall.function.arguments);
  } catch {
    // Fallback bij malformed JSON: als uitsluiten markeren
    return { relevant: false, score: 1, reason: "JSON parse fout — veiligheidshalve uitgesloten", category: "onbekend" };
  }
}

export function buildAnthropicClient() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}
