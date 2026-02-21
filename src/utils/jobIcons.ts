// FFLogs spec name → XIVAPI game icon URL
// Format: https://xivapi.com/i/062000/062{3-digit id}.png
const BASE = "https://xivapi.com/i/062000";

export const JOB_ICONS: Record<string, string> = {
  // Tanks
  Paladin: `${BASE}/062119.png`,
  Warrior: `${BASE}/062121.png`,
  DarkKnight: `${BASE}/062132.png`,
  Gunbreaker: `${BASE}/062137.png`,
  // Healers
  WhiteMage: `${BASE}/062124.png`,
  Scholar: `${BASE}/062128.png`,
  Astrologian: `${BASE}/062133.png`,
  Sage: `${BASE}/062140.png`,
  // Melee DPS
  Monk: `${BASE}/062120.png`,
  Dragoon: `${BASE}/062122.png`,
  Ninja: `${BASE}/062130.png`,
  Samurai: `${BASE}/062134.png`,
  Reaper: `${BASE}/062139.png`,
  Viper: `${BASE}/062141.png`,
  // Physical Ranged DPS
  Bard: `${BASE}/062123.png`,
  Machinist: `${BASE}/062131.png`,
  Dancer: `${BASE}/062138.png`,
  // Magical Ranged DPS
  BlackMage: `${BASE}/062125.png`,
  Summoner: `${BASE}/062127.png`,
  RedMage: `${BASE}/062135.png`,
  Pictomancer: `${BASE}/062142.png`,
  BlueMage: `${BASE}/062136.png`,
};
