// === FFLogs API Response Types ===

// characterRankings returns a JSON scalar with this structure
export interface CharacterRankingsResponse {
  page: number;
  hasMorePages: boolean;
  count: number;
  rankings: RankingEntry[];
}

export interface RankingEntry {
  name: string;
  amount: number; // DPS value (rDPS)
  aDPS?: number; // aDPS value (merged from separate query)
  nDPS?: number; // nDPS value (merged from separate query)
  duration: number; // Fight duration in ms
  class: string;
  spec: string;
  report: {
    code: string;
    fightID: number;
    startTime: number;
  };
  guild?: { name: string };
  server?: { name: string; region: string };
}

// Cast event from reportData.report.events
// Note: FFLogs events.data is a JSON scalar - events do NOT have a nested "ability" object.
// Ability info must be looked up from masterData.abilities using abilityGameID.
export interface CastEvent {
  timestamp: number;
  type: "cast" | "begincast";
  sourceID: number;
  targetID: number;
  abilityGameID: number;
  fight: number;
}

// Ability info from masterData.abilities
export interface AbilityInfo {
  gameID: number;
  name: string;
  icon: string; // e.g. "003000-003158.png"
  type: string;
}

export interface EventsResponse {
  data: CastEvent[];
  nextPageTimestamp: number | null;
}

// Fight info
export interface FightInfo {
  id: number;
  startTime: number;
  endTime: number;
  name: string;
  friendlyPlayers: number[]; // Actor IDs of players in this fight
}

// Player actor
export interface Actor {
  id: number;
  name: string;
  type: string;
  subType: string;
  server?: string;
}

// Zone/Encounter hierarchy
export interface Expansion {
  id: number;
  name: string;
  zones: Zone[];
}

export interface Zone {
  id: number;
  name: string;
  difficulties: { id: number; name: string }[];
  encounters: Encounter[];
}

export interface Encounter {
  id: number;
  name: string;
}

// Job class/spec
export interface GameClass {
  id: number;
  name: string;
  specs: GameSpec[];
}

export interface GameSpec {
  id: number;
  name: string;
}

// === Processed Timeline Types ===

export type SkillType = "weaponskill" | "spell" | "ability";

export interface TimelineEntry {
  timestamp: number; // Relative time from fight start (ms)
  abilityId: number;
  abilityName: string;
  iconUrl: string;
  isGCD: boolean;
  skillType: SkillType;
}

export interface PlayerTimeline {
  rank: number;
  name: string;
  server: string;
  job: string;
  rDPS: number;
  aDPS?: number;
  nDPS?: number;
  dpsGiven?: number; // Synergy DPS Given (rDPS contributed to others via buffs)
  dpsTaken?: number; // Synergy DPS Taken (rDPS received from others' buffs)
  duration: number; // ms
  reportUrl: string; // FFLogs report URL
  party: string[]; // Job names of party members
  entries: TimelineEntry[];
}

// === Static JSON Data Types (pre-generated) ===

export interface StaticTimelineEntry {
  t: number;    // Relative time from fight start (ms)
  id: number;   // Ability game ID
  name: string; // Ability name
  icon: string; // Full icon URL
  gcd: boolean; // Whether it's a GCD skill
  type: SkillType; // weaponskill / spell / ability
}

export interface StaticRanking {
  rank: number;
  name: string;
  server: string;
  rDPS: number;
  aDPS?: number;
  nDPS?: number;
  duration: number;
  reportCode: string;
  fightID: number;
  dpsGiven?: number;
  dpsTaken?: number;
  party: string[];
  timeline: StaticTimelineEntry[];
}

export interface StaticRotationData {
  encounterId: number;
  job: string;
  lastUpdated: string;
  rankings: StaticRanking[];
}
