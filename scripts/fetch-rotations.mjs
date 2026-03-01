#!/usr/bin/env node
/**
 * FFLogs Rotation Compare — Data pre-generation script
 *
 * Fetches top 10 rankings + rotation timelines from FFLogs API
 * and saves as static JSON files for GitHub Pages deployment.
 *
 * Usage:
 *   node scripts/fetch-rotations.mjs                          # All target encounters
 *   node scripts/fetch-rotations.mjs --day odd                # Odd day: AAC Heavyweight boss 1-3
 *   node scripts/fetch-rotations.mjs --day even               # Even day: AAC Heavyweight boss 4-5 + FRW
 *   node scripts/fetch-rotations.mjs --encounter 101          # Single encounter
 *   node scripts/fetch-rotations.mjs --encounter 101 --job Samurai  # Single encounter + job
 */

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import { join, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, "..");
const DATA_DIR = join(ROOT, "public", "data");

// ─── Config ───
const FFLOGS_API_URL = "https://www.fflogs.com/api/v2/client";
const ICON_BASE_URL = "https://assets.rpglogs.com/img/ff/abilities";
const FILTERED_ABILITY_IDS = new Set([7, 8, 3]); // Attack, Shot, Sprint

// ─── Target content ───
// AAC Heavyweight (Savage) encounter IDs
const AAC_HEAVYWEIGHT_IDS = [101, 102, 103, 104, 105];
// Futures Rewritten (Ultimate) encounter ID
const FRW_ID = 1079;
// Encounter schedule
const ODD_DAY_ENCOUNTERS = [101, 102, 103];          // Boss 1-3
const EVEN_DAY_ENCOUNTERS = [104, 105, FRW_ID];      // Boss 4-5 + FRW

// ─── Load credentials ───
function loadCredentials() {
  const envPath = join(ROOT, ".env");
  let clientId = process.env.FFLOGS_CLIENT_ID;
  let clientSecret = process.env.FFLOGS_CLIENT_SECRET;

  if (!clientId && existsSync(envPath)) {
    const lines = readFileSync(envPath, "utf-8").split("\n");
    for (const line of lines) {
      const [key, ...rest] = line.split("=");
      const val = rest.join("=").trim();
      if (key.trim() === "FFLOGS_CLIENT_ID") clientId = val;
      if (key.trim() === "FFLOGS_CLIENT_SECRET") clientSecret = val;
    }
  }

  if (!clientId || !clientSecret) {
    throw new Error("FFLOGS_CLIENT_ID and FFLOGS_CLIENT_SECRET must be set in .env or environment");
  }
  return { clientId, clientSecret };
}

// ─── OAuth Token ───
let cachedToken = null;

async function fetchToken(clientId, clientSecret) {
  if (cachedToken && Date.now() < cachedToken.expiresAt - 300_000) {
    return cachedToken.token;
  }

  console.log("  [auth] Fetching new OAuth token...");
  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
  const res = await fetch("https://www.fflogs.com/oauth/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: "grant_type=client_credentials",
  });

  if (!res.ok) throw new Error(`OAuth error: ${res.status} ${await res.text()}`);

  const data = await res.json();
  cachedToken = { token: data.access_token, expiresAt: Date.now() + data.expires_in * 1000 };
  return cachedToken.token;
}

// ─── FFLogs GraphQL ───
let creds;
let apiCallCount = 0;

async function queryFFLogs(query, variables = {}) {
  const token = await fetchToken(creds.clientId, creds.clientSecret);
  apiCallCount++;

  const res = await fetch(FFLOGS_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ query, variables }),
  });

  if (res.status === 429) {
    const retryAfter = parseInt(res.headers.get("retry-after") || "60", 10);
    console.log(`  [rate-limit] 429 — waiting ${retryAfter}s...`);
    await sleep(retryAfter * 1000 + 1000);
    return queryFFLogs(query, variables);
  }

  if (res.status === 401) {
    cachedToken = null;
    return queryFFLogs(query, variables);
  }

  if (!res.ok) throw new Error(`FFLogs API error: ${res.status}`);
  const data = await res.json();
  if (data.errors) throw new Error(data.errors[0].message);
  return data.data;
}

// ─── GraphQL Queries ───
const GET_ENCOUNTERS = `
  query GetEncounters {
    worldData {
      expansions {
        id name
        zones { id name difficulties { id name } encounters { id name } }
      }
    }
  }
`;

const GET_JOBS = `
  query GetJobs {
    gameData { classes { id name specs { id name } } }
  }
`;

const GET_RANKINGS = `
  query GetRankings($encounterId: Int!, $specName: String, $metric: CharacterRankingMetricType, $difficulty: Int, $page: Int) {
    worldData {
      encounter(id: $encounterId) {
        name
        characterRankings(specName: $specName, metric: $metric, difficulty: $difficulty, page: $page)
      }
    }
  }
`;

const GET_FIGHT_AND_ACTORS = `
  query GetFightAndActors($reportCode: String!, $fightIDs: [Int!]) {
    reportData {
      report(code: $reportCode) {
        fights(fightIDs: $fightIDs) { id startTime endTime name friendlyPlayers }
        masterData {
          actors(type: "Player") { id name type subType server }
          abilities { gameID name icon type }
        }
      }
    }
  }
`;

const GET_EVENTS = `
  query GetEvents($reportCode: String!, $fightIDs: [Int!], $startTime: Float!, $endTime: Float!, $sourceID: Int!) {
    reportData {
      report(code: $reportCode) {
        events(dataType: Casts, fightIDs: $fightIDs, startTime: $startTime, endTime: $endTime, sourceID: $sourceID, limit: 10000) {
          data nextPageTimestamp
        }
      }
    }
  }
`;

const GET_DAMAGE_TABLE = `
  query GetDamageTable($reportCode: String!, $fightIDs: [Int!]!) {
    reportData {
      report(code: $reportCode) {
        table(dataType: DamageDone, fightIDs: $fightIDs)
      }
    }
  }
`;

const GET_EVENTS_SAMPLE = `
  query GetEventsSample($reportCode: String!, $fightIDs: [Int!], $startTime: Float!, $endTime: Float!) {
    reportData {
      report(code: $reportCode) {
        events(dataType: Casts, fightIDs: $fightIDs, startTime: $startTime, endTime: $endTime, limit: 500) { data }
      }
    }
  }
`;

// ─── Helpers ───
function sleep(ms) { return new Promise((r) => setTimeout(r, ms)); }

function writeJSON(path, data) {
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, JSON.stringify(data, null, 2));
}

// ─── XIVAPI cache ───
const xivapiCache = new Map();

async function fetchGCDInfo(abilityIds) {
  const resultMap = new Map();
  const uncached = [];

  for (const id of abilityIds) {
    if (xivapiCache.has(id)) {
      resultMap.set(id, xivapiCache.get(id));
    } else {
      uncached.push(id);
    }
  }

  for (let i = 0; i < uncached.length; i += 10) {
    const batch = uncached.slice(i, i + 10);
    const results = await Promise.allSettled(
      batch.map(async (id) => {
        try {
          const res = await fetch(`https://beta.xivapi.com/api/1/sheet/Action/${id}?fields=ActionCategory`);
          if (!res.ok) {
            const info = { isGCD: false, skillType: "ability" };
            xivapiCache.set(id, info);
            return { id, info };
          }
          const data = await res.json();
          const catId = data?.fields?.ActionCategory?.row_id;
          const info = catId === 3 ? { isGCD: true, skillType: "weaponskill" }
            : catId === 2 ? { isGCD: true, skillType: "spell" }
            : { isGCD: false, skillType: "ability" };
          xivapiCache.set(id, info);
          return { id, info };
        } catch {
          const info = { isGCD: false, skillType: "ability" };
          xivapiCache.set(id, info);
          return { id, info };
        }
      })
    );
    for (const r of results) {
      if (r.status === "fulfilled") resultMap.set(r.value.id, r.value.info);
    }
  }
  return resultMap;
}

// ─── Report caches ───
const fightActorsCache = new Map();
const damageTableCache = new Map();

async function getCachedFightActors(reportCode, fightID) {
  const key = `${reportCode}:${fightID}`;
  if (fightActorsCache.has(key)) return fightActorsCache.get(key);
  const promise = queryFFLogs(GET_FIGHT_AND_ACTORS, { reportCode, fightIDs: [fightID] });
  fightActorsCache.set(key, promise);
  return promise;
}

async function getCachedDamageTable(reportCode, fightID) {
  const key = `${reportCode}:${fightID}`;
  if (damageTableCache.has(key)) return damageTableCache.get(key);
  const promise = queryFFLogs(GET_DAMAGE_TABLE, { reportCode, fightIDs: [fightID] });
  damageTableCache.set(key, promise);
  return promise;
}

// ─── Actor detection ───
function findActor(actors, ranking) {
  const byNameAndSpec = actors.find((a) => a.name === ranking.name && a.subType === ranking.spec);
  if (byNameAndSpec) return byNameAndSpec;
  const byNameWithJob = actors.find((a) => a.name === ranking.name && a.subType !== "Unknown");
  if (byNameWithJob) return byNameWithJob;
  const nameParts = ranking.name.split(" ");
  const byPartial = actors.find((a) => a.subType === ranking.spec && nameParts.some((p) => p.length > 1 && a.name.includes(p)));
  if (byPartial) return byPartial;
  return actors.find((a) => a.name === ranking.name);
}

async function findActorFromEvents(reportCode, fightID, startTime, endTime, actors, spec) {
  try {
    const sampleEnd = Math.min(startTime + 15000, endTime);
    const data = await queryFFLogs(GET_EVENTS_SAMPLE, { reportCode, fightIDs: [fightID], startTime, endTime: sampleEnd });
    const events = data.reportData.report.events.data;
    const activeIDs = new Set(events.map((e) => e.sourceID));
    const candidates = actors.filter((a) => a.subType === spec && activeIDs.has(a.id));
    if (candidates.length === 1) return candidates[0];
    if (candidates.length > 1) {
      let best = candidates[0], bestCount = 0;
      for (const c of candidates) {
        const count = events.filter((e) => e.sourceID === c.id).length;
        if (count > bestCount) { best = c; bestCount = count; }
      }
      return best;
    }
    return undefined;
  } catch { return undefined; }
}

// ─── Event processing ───
async function fetchAllEvents(reportCode, fightID, startTime, endTime, sourceID) {
  const allEvents = [];
  let currentStart = startTime;
  while (true) {
    const data = await queryFFLogs(GET_EVENTS, { reportCode, fightIDs: [fightID], startTime: currentStart, endTime, sourceID });
    const events = data.reportData.report.events;
    allEvents.push(...events.data);
    if (!events.nextPageTimestamp) break;
    currentStart = events.nextPageTimestamp;
  }
  return allEvents;
}

function processEvents(events, fightStartTime, abilityMap, categoryMap) {
  const casts = events.filter((e) => e.type === "cast" && !FILTERED_ABILITY_IDS.has(e.abilityGameID));
  const entries = [];

  for (const event of casts) {
    const catInfo = categoryMap.get(event.abilityGameID);
    const isGCD = catInfo ? catInfo.isGCD : false;
    const skillType = catInfo ? catInfo.skillType : "ability";
    const ability = abilityMap.get(event.abilityGameID);
    const iconPath = ability?.icon ?? "000000-000405.png";

    entries.push({
      t: event.timestamp - fightStartTime,
      id: event.abilityGameID,
      name: ability?.name ?? `Unknown (${event.abilityGameID})`,
      icon: `${ICON_BASE_URL}/${iconPath}`,
      gcd: isGCD,
      type: skillType,
    });
  }
  return entries;
}

// ─── Job order ───
const JOB_ORDER = {
  Paladin: 0, Warrior: 1, DarkKnight: 2, Gunbreaker: 3,
  WhiteMage: 10, Scholar: 11, Astrologian: 12, Sage: 13,
  Monk: 20, Dragoon: 21, Ninja: 22, Samurai: 23, Reaper: 24, Viper: 25,
  Bard: 30, Machinist: 31, Dancer: 32,
  BlackMage: 40, Summoner: 41, RedMage: 42, Pictomancer: 43,
};

// ─── Ranking DPS merge ───
function buildDpsMap(rankings) {
  const map = new Map();
  for (const r of rankings) {
    map.set(`${r.report.code}:${r.report.fightID}:${r.name}`, r.amount);
    if (!map.has(`name:${r.name}`)) map.set(`name:${r.name}`, r.amount);
  }
  return map;
}

function lookupDps(map, r) {
  return map.get(`${r.report.code}:${r.report.fightID}:${r.name}`) ?? map.get(`name:${r.name}`);
}

async function fetchMetricRankings(commonVars, metric) {
  const [p1, p2] = await Promise.all([
    queryFFLogs(GET_RANKINGS, { ...commonVars, metric, page: 1 }),
    queryFFLogs(GET_RANKINGS, { ...commonVars, metric, page: 2 }),
  ]);
  const r1 = p1.worldData.encounter.characterRankings?.rankings ?? [];
  const r2 = p2.worldData.encounter.characterRankings?.rankings ?? [];
  return [...r1, ...r2];
}

// ─── Fetch single player timeline ───
async function fetchPlayerTimeline(ranking, rank) {
  try {
    const { code, fightID } = ranking.report;
    const fightData = await getCachedFightActors(code, fightID);
    const fight = fightData.reportData.report.fights[0];
    if (!fight) return null;

    const actors = fightData.reportData.report.masterData.actors;
    const abilities = fightData.reportData.report.masterData.abilities;
    const abilityMap = new Map(abilities.map((a) => [a.gameID, a]));

    let actor = findActor(actors, ranking);
    let events = [];
    if (actor) {
      events = await fetchAllEvents(code, fightID, fight.startTime, fight.endTime, actor.id);
    }
    if (!actor || events.length === 0) {
      const eventActor = await findActorFromEvents(code, fightID, fight.startTime, fight.endTime, actors, ranking.spec);
      if (eventActor && eventActor.id !== actor?.id) {
        actor = eventActor;
        events = await fetchAllEvents(code, fightID, fight.startTime, fight.endTime, actor.id);
      }
    }
    if (!actor || events.length === 0) return null;

    // Synergy DPS
    let dpsGiven, dpsTaken;
    try {
      const tableData = await getCachedDamageTable(code, fightID);
      const tableInfo = tableData.reportData.report.table.data;
      const entry = tableInfo.entries.find((e) => e.id === actor.id);
      if (entry && tableInfo.totalTime > 0) {
        const sec = tableInfo.totalTime / 1000;
        dpsGiven = Math.round(entry.totalRDPSGiven / sec);
        dpsTaken = Math.round(entry.totalRDPSTaken / sec);
      }
    } catch {}

    // GCD/oGCD classification
    const uniqueIds = [...new Set(events.filter((e) => e.type === "cast" && e.abilityGameID < 100000).map((e) => e.abilityGameID))];
    const categoryMap = await fetchGCDInfo(uniqueIds);
    const timeline = processEvents(events, fight.startTime, abilityMap, categoryMap);

    // Party composition
    const fightPlayerIds = new Set(fight.friendlyPlayers ?? []);
    const party = actors
      .filter((a) => fightPlayerIds.has(a.id) && a.subType !== "Unknown" && a.subType !== "LimitBreak")
      .map((a) => a.subType)
      .sort((a, b) => (JOB_ORDER[a] ?? 99) - (JOB_ORDER[b] ?? 99));

    return {
      rank,
      name: ranking.name,
      server: ranking.server ? `${ranking.server.name} ${ranking.server.region}` : "",
      rDPS: Math.round(ranking.amount),
      aDPS: ranking.aDPS ? Math.round(ranking.aDPS) : undefined,
      nDPS: ranking.nDPS ? Math.round(ranking.nDPS) : undefined,
      duration: fight.endTime - fight.startTime,
      reportCode: code,
      fightID,
      dpsGiven,
      dpsTaken,
      party,
      timeline,
    };
  } catch (err) {
    console.warn(`    [Rank #${rank}] Failed: ${ranking.name} — ${err.message}`);
    return null;
  }
}

// ─── Process one job for one encounter ───
async function processJob(encounterId, specName, difficulty) {
  console.log(`  [${specName}] Fetching rankings...`);

  const commonVars = { encounterId, specName: specName.replace(/\s/g, ""), difficulty };

  // Fetch rDPS (page 1) + aDPS/nDPS (pages 1-2)
  let rdpsData, adpsRankings, ndpsRankings;
  try {
    [rdpsData, adpsRankings, ndpsRankings] = await Promise.all([
      queryFFLogs(GET_RANKINGS, { ...commonVars, metric: "rdps", page: 1 }),
      fetchMetricRankings(commonVars, "dps"),
      fetchMetricRankings(commonVars, "ndps"),
    ]);
  } catch (err) {
    console.warn(`  [${specName}] Rankings fetch failed: ${err.message}`);
    return null;
  }

  const list = rdpsData.worldData.encounter.characterRankings?.rankings;
  if (!list || list.length === 0) {
    console.log(`  [${specName}] No rankings found, skipping`);
    return null;
  }

  const adpsMap = buildDpsMap(adpsRankings);
  const ndpsMap = buildDpsMap(ndpsRankings);
  const top10 = list.slice(0, 10).map((r) => ({
    ...r,
    aDPS: lookupDps(adpsMap, r),
    nDPS: lookupDps(ndpsMap, r),
  }));

  console.log(`  [${specName}] Got ${top10.length} rankings, fetching timelines...`);

  // Fetch timelines in batches of 3
  const results = [];
  for (let i = 0; i < top10.length; i += 3) {
    const batch = top10.slice(i, i + 3);
    const batchResults = await Promise.all(
      batch.map((r, j) => fetchPlayerTimeline(r, i + j + 1))
    );
    for (const r of batchResults) {
      if (r) results.push(r);
    }
    console.log(`    Progress: ${Math.min(i + 3, top10.length)}/${top10.length} players`);
  }

  // Clear report caches between jobs
  fightActorsCache.clear();
  damageTableCache.clear();

  console.log(`  [${specName}] Done — ${results.length} timelines`);
  return {
    encounterId,
    job: specName,
    lastUpdated: new Date().toISOString(),
    rankings: results,
  };
}

// ─── Resolve difficulty for an encounter ───
function getDifficulty(encounterId, allZones) {
  // Ultimates have no difficulty parameter (use default 100)
  if (encounterId === FRW_ID) return 100;
  // Savage encounters use Savage difficulty
  for (const zone of allZones) {
    const hasEnc = zone.encounters.some((e) => e.id === encounterId);
    if (hasEnc) {
      const savage = zone.difficulties.find((d) => d.name === "Savage");
      return savage?.id ?? 101;
    }
  }
  return 101;
}

// ─── Main ───
async function main() {
  const args = process.argv.slice(2);
  const encArg = args.indexOf("--encounter");
  const jobArg = args.indexOf("--job");
  const dayArg = args.indexOf("--day");
  const targetEncounter = encArg >= 0 ? parseInt(args[encArg + 1], 10) : null;
  const targetJob = jobArg >= 0 ? args[jobArg + 1] : null;
  const dayMode = dayArg >= 0 ? args[dayArg + 1] : null; // "odd" or "even"

  creds = loadCredentials();

  console.log("=== FFLogs Rotation Compare — Data Fetch ===");
  console.log(`  Started at: ${new Date().toLocaleString()}`);
  if (dayMode) console.log(`  Day mode: ${dayMode}`);

  // 1. Fetch encounters from API
  console.log("\n[1/3] Fetching encounters...");
  const encData = await queryFFLogs(GET_ENCOUNTERS);

  // Find AAC Heavyweight and Futures Rewritten zones
  const allZones = encData.worldData.expansions.flatMap((exp) => exp.zones);

  // Build limited encounters list for the frontend (AAC Heavyweight + FRW only)
  const targetZoneNames = ["AAC Heavyweight", "Futures Rewritten"];
  const limitedExpansions = encData.worldData.expansions
    .filter((exp) => exp.id >= 5)
    .sort((a, b) => b.id - a.id)
    .map((exp) => ({
      ...exp,
      zones: exp.zones.filter((z) => targetZoneNames.some((n) => z.name.includes(n))),
    }))
    .filter((exp) => exp.zones.length > 0);

  writeJSON(join(DATA_DIR, "encounters.json"), limitedExpansions);
  console.log(`  Saved encounters.json (limited to AAC Heavyweight + FRW)`);

  // Collect all target encounters with their info
  const allTargetEncounters = [];
  for (const exp of limitedExpansions) {
    for (const zone of exp.zones) {
      for (const enc of zone.encounters) {
        allTargetEncounters.push({
          id: enc.id,
          name: enc.name,
          zoneName: zone.name,
          difficulty: getDifficulty(enc.id, allZones),
        });
      }
    }
  }

  console.log(`  Target encounters: ${allTargetEncounters.map((e) => `${e.name}(${e.id})`).join(", ")}`);

  // 2. Fetch jobs
  console.log("\n[2/3] Fetching jobs...");
  const jobData = await queryFFLogs(GET_JOBS);
  const allSpecs = jobData.gameData.classes.flatMap((c) => c.specs.map((s) => s.name));
  const combatJobs = allSpecs
    .map((s) => s.replace(/\s/g, ""))
    .filter((s) => JOB_ORDER[s] !== undefined);
  writeJSON(join(DATA_DIR, "jobs.json"), combatJobs);
  console.log(`  Saved jobs.json (${combatJobs.length} jobs)`);

  // 3. Determine which encounters to fetch
  let encountersToFetch;

  if (targetEncounter) {
    // Single encounter mode (--encounter)
    encountersToFetch = allTargetEncounters.filter((e) => e.id === targetEncounter);
  } else if (dayMode === "odd") {
    encountersToFetch = allTargetEncounters.filter((e) => ODD_DAY_ENCOUNTERS.includes(e.id));
  } else if (dayMode === "even") {
    encountersToFetch = allTargetEncounters.filter((e) => EVEN_DAY_ENCOUNTERS.includes(e.id));
  } else {
    encountersToFetch = allTargetEncounters;
  }

  const jobsToFetch = targetJob ? [targetJob] : combatJobs;

  console.log(`\n[3/3] Fetching rotation data...`);
  console.log(`  Encounters: ${encountersToFetch.map((e) => e.name).join(", ")}`);
  console.log(`  Jobs: ${jobsToFetch.length}`);
  console.log(`  Total patterns: ${encountersToFetch.length * jobsToFetch.length}`);

  for (const enc of encountersToFetch) {
    console.log(`\n=== Encounter: ${enc.name} (id: ${enc.id}, difficulty: ${enc.difficulty}) ===`);

    for (let j = 0; j < jobsToFetch.length; j++) {
      const job = jobsToFetch[j];
      const result = await processJob(enc.id, job, enc.difficulty);
      if (result && result.rankings.length > 0) {
        const outPath = join(DATA_DIR, "rotations", String(enc.id), `${job}.json`);
        writeJSON(outPath, result);
        console.log(`  Saved ${job}.json (${result.rankings.length} players)`);
      }

      // Rate limit pause between jobs (15s)
      if (j < jobsToFetch.length - 1) {
        console.log("  Waiting 15s before next job...");
        await sleep(15000);
      }
    }
  }

  // Save index (always includes all target encounters)
  const index = {
    lastUpdated: new Date().toISOString(),
    encounters: allTargetEncounters.map((e) => ({ id: e.id, name: e.name, zone: e.zoneName })),
  };
  writeJSON(join(DATA_DIR, "index.json"), index);

  console.log(`\n=== Done! Total API calls: ${apiCallCount} ===`);
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
