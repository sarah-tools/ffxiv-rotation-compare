import { useState, useCallback } from "react";
import { fetchJSON } from "../api/client";
import type { StaticRotationData, PlayerTimeline, TimelineEntry } from "../api/types";

/**
 * Combined hook that fetches pre-generated rotation data (rankings + timelines)
 * from a single static JSON file per encounter/job combination.
 */
export function useRotationData() {
  const [timelines, setTimelines] = useState<PlayerTimeline[]>([]);
  const [encounterName, setEncounterName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(
    async (encounterId: number, specName: string, _difficulty: number, encounterLabel?: string) => {
      setLoading(true);
      setError(null);
      setTimelines([]);
      setEncounterName(encounterLabel ?? "");

      try {
        const jobName = specName.replace(/\s/g, "");
        const data = await fetchJSON<StaticRotationData>(
          `rotations/${encounterId}/${jobName}.json`
        );

        if (!data.rankings || data.rankings.length === 0) {
          setError("No ranking data found for this encounter/job combination.");
          return;
        }

        // Convert static JSON format to PlayerTimeline format
        const converted: PlayerTimeline[] = data.rankings.map((r) => {
          const entries: TimelineEntry[] = r.timeline.map((t) => ({
            timestamp: t.t,
            abilityId: t.id,
            abilityName: t.name,
            iconUrl: t.icon,
            isGCD: t.gcd,
            skillType: t.type,
          }));

          const reportUrl = `https://www.fflogs.com/reports/${r.reportCode}#fight=${r.fightID}`;

          return {
            rank: r.rank,
            name: r.name,
            server: r.server,
            job: data.job,
            rDPS: r.rDPS,
            aDPS: r.aDPS,
            nDPS: r.nDPS,
            dpsGiven: r.dpsGiven,
            dpsTaken: r.dpsTaken,
            duration: r.duration,
            reportUrl,
            party: r.party,
            entries,
          };
        });

        setTimelines(converted);
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        if (msg.includes("not found") || msg.includes("404")) {
          setError(`Data not available for this encounter/job. Data may not have been generated yet.`);
        } else {
          setError(msg);
        }
      } finally {
        setLoading(false);
      }
    },
    []
  );

  return { timelines, encounterName, loading, error, fetchData };
}
