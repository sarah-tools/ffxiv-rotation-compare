export const FFLOGS_API_URL = "https://www.fflogs.com/api/v2/client";
// Empty string = use Vite proxy (same origin /api/token)
export const TOKEN_SERVER_URL = "";
export const ICON_BASE_URL = "https://assets.rpglogs.com/img/ff/abilities";

// Ability IDs to filter out from timeline
export const FILTERED_ABILITY_IDS = new Set([
  7,  // Attack (auto-attack)
  8,  // Shot (auto-attack ranged)
  3,  // Sprint
]);

// Default timeline settings
export const DEFAULT_PIXELS_PER_SECOND = 40;
export const MIN_PIXELS_PER_SECOND = 20;
export const MAX_PIXELS_PER_SECOND = 60;
