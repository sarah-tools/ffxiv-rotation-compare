import type { CastEvent, TimelineEntry, AbilityInfo, SkillType } from "../api/types";
import { FILTERED_ABILITY_IDS, ICON_BASE_URL } from "./constants";

/** Build a lookup map from masterData.abilities */
export function buildAbilityMap(abilities: AbilityInfo[]): Map<number, AbilityInfo> {
  const map = new Map<number, AbilityInfo>();
  for (const a of abilities) {
    map.set(a.gameID, a);
  }
  return map;
}

interface ActionCategoryInfo {
  isGCD: boolean;
  skillType: SkillType;
}

/**
 * Fetch ActionCategory from XIVAPI for a list of ability IDs.
 * Returns a Map of ability ID → { isGCD, skillType }.
 *
 * ActionCategory row_id:
 *   2 = Spell (魔法) → GCD
 *   3 = Weaponskill (ウェポンスキル) → GCD
 *   4 = Ability (アビリティ) → oGCD
 *   1 = Auto-attack → oGCD
 *
 * Uses a shared cache to avoid redundant API calls across players.
 */
export async function fetchGCDSet(
  abilityIds: number[],
  cache: Map<number, ActionCategoryInfo>
): Promise<Map<number, ActionCategoryInfo>> {
  const resultMap = new Map<number, ActionCategoryInfo>();

  // Apply cached results and find uncached IDs
  const uncachedIds: number[] = [];
  for (const id of abilityIds) {
    if (cache.has(id)) {
      resultMap.set(id, cache.get(id)!);
    } else {
      uncachedIds.push(id);
    }
  }

  if (uncachedIds.length === 0) return resultMap;

  // Fetch uncached IDs in parallel batches of 10
  const batchSize = 10;
  for (let i = 0; i < uncachedIds.length; i += batchSize) {
    const batch = uncachedIds.slice(i, i + batchSize);
    const results = await Promise.allSettled(
      batch.map(async (id) => {
        try {
          const res = await fetch(
            `https://beta.xivapi.com/api/1/sheet/Action/${id}?fields=ActionCategory`
          );
          if (!res.ok) {
            const info: ActionCategoryInfo = { isGCD: false, skillType: "ability" };
            cache.set(id, info);
            return { id, info };
          }
          const data = await res.json();
          const categoryId = data?.fields?.ActionCategory?.row_id;
          let info: ActionCategoryInfo;
          if (categoryId === 3) {
            info = { isGCD: true, skillType: "weaponskill" };
          } else if (categoryId === 2) {
            info = { isGCD: true, skillType: "spell" };
          } else {
            info = { isGCD: false, skillType: "ability" };
          }
          cache.set(id, info);
          return { id, info };
        } catch (err) {
          console.warn(`[XIVAPI] Failed to fetch action category for ability ${id}:`, err);
          const info: ActionCategoryInfo = { isGCD: false, skillType: "ability" };
          cache.set(id, info);
          return { id, info };
        }
      })
    );

    for (const result of results) {
      if (result.status === "fulfilled") {
        resultMap.set(result.value.id, result.value.info);
      }
    }
  }

  return resultMap;
}

/**
 * GCD/oGCD classification using XIVAPI ActionCategory data.
 *
 * - Uses the categoryMap (from XIVAPI) for definitive classification.
 * - Falls back to begincast + gap heuristic for abilities not found in XIVAPI
 *   (e.g. potion items with very high IDs).
 */
export function processEvents(
  events: CastEvent[],
  fightStartTime: number,
  abilityMap: Map<number, AbilityInfo>,
  categoryMap: Map<number, ActionCategoryInfo>
): TimelineEntry[] {
  // Fallback: Collect begincast IDs for abilities not in XIVAPI
  const begincastIDs = new Set<number>();
  for (const e of events) {
    if (e.type === "begincast") {
      begincastIDs.add(e.abilityGameID);
    }
  }

  // Filter to only "cast" events, remove auto-attacks etc.
  const casts = events.filter(
    (e) => e.type === "cast" && !FILTERED_ABILITY_IDS.has(e.abilityGameID)
  );

  const entries: TimelineEntry[] = [];

  for (let i = 0; i < casts.length; i++) {
    const event = casts[i];
    const relativeTime = event.timestamp - fightStartTime;

    const catInfo = categoryMap.get(event.abilityGameID);
    let isGCD: boolean;
    let skillType: SkillType;

    if (catInfo) {
      // Definitive: XIVAPI data available
      isGCD = catInfo.isGCD;
      skillType = catInfo.skillType;
    } else if (categoryMap.size > 0) {
      // XIVAPI data available for other abilities, this one not found → treat as ability
      isGCD = false;
      skillType = "ability";
    } else {
      // Fallback if XIVAPI fetch failed entirely: use begincast + gap heuristic
      if (i === 0) {
        isGCD = true;
        skillType = "weaponskill";
      } else if (begincastIDs.has(event.abilityGameID)) {
        isGCD = true;
        skillType = "spell";
      } else {
        const gap = event.timestamp - casts[i - 1].timestamp;
        isGCD = gap >= 1200;
        skillType = isGCD ? "weaponskill" : "ability";
      }
    }

    const ability = abilityMap.get(event.abilityGameID);
    const iconPath = ability?.icon ?? "000000-000405.png";

    entries.push({
      timestamp: relativeTime,
      abilityId: event.abilityGameID,
      abilityName: ability?.name ?? `Unknown (${event.abilityGameID})`,
      iconUrl: `${ICON_BASE_URL}/${iconPath}`,
      isGCD,
      skillType,
    });
  }

  return entries;
}
