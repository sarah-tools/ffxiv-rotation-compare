import { useState, useMemo } from "react";
import { useEncounters } from "../hooks/useEncounters";
import { useJobs } from "../hooks/useJobs";
import type { Zone, Encounter } from "../api/types";

interface Props {
  onSearch: (encounterId: number, specName: string, difficulty: number, encounterName: string) => void;
  loading: boolean;
}

export function SelectorPanel({ onSearch, loading }: Props) {
  const { expansions, loading: loadingEnc, error: encError } = useEncounters();
  const { jobs, loading: loadingJobs, error: jobsError } = useJobs();

  const [expansionId, setExpansionId] = useState<number | "">("");
  const [zoneId, setZoneId] = useState<number | "">("");
  const [encounterId, setEncounterId] = useState<number | "">("");
  const [specName, setSpecName] = useState("");

  const zones: Zone[] = useMemo(() => {
    if (expansionId === "") return [];
    const exp = expansions.find((e) => e.id === expansionId);
    return exp?.zones ?? [];
  }, [expansions, expansionId]);

  const encounters: Encounter[] = useMemo(() => {
    if (zoneId === "") return [];
    const zone = zones.find((z) => z.id === zoneId);
    return zone?.encounters ?? [];
  }, [zones, zoneId]);

  // Auto-select difficulty: prefer Savage (101), fallback to first available
  const difficulty = useMemo(() => {
    if (zoneId === "") return 101;
    const zone = zones.find((z) => z.id === zoneId);
    const diffs = zone?.difficulties ?? [];
    const savage = diffs.find((d) => d.name === "Savage");
    if (savage) return savage.id;
    return diffs[0]?.id ?? 100;
  }, [zones, zoneId]);

  const selectedEncounterName = useMemo(() => {
    if (encounterId === "") return "";
    return encounters.find((e) => e.id === encounterId)?.name ?? "";
  }, [encounters, encounterId]);

  const handleSearch = () => {
    if (encounterId === "" || !specName) return;
    onSearch(encounterId, specName, difficulty, selectedEncounterName);
  };

  const dataError = encError || jobsError;
  const isDataLoading = loadingEnc || loadingJobs;
  const hasData = expansions.length > 0;

  return (
    <div className="selector-panel">
      {dataError && (
        <div className="selector-error">
          <p>Failed to load game data: {dataError}</p>
        </div>
      )}
      {isDataLoading && <div className="selector-loading">Loading game data...</div>}
      <div className="selector-row">
        <label>
          Expansion
          <select
            value={expansionId}
            onChange={(e) => {
              setExpansionId(Number(e.target.value) || "");
              setZoneId("");
              setEncounterId("");
            }}
            disabled={!hasData}
          >
            <option value="">-- Select --</option>
            {expansions.map((exp) => (
              <option key={exp.id} value={exp.id}>{exp.name}</option>
            ))}
          </select>
        </label>

        <label>
          Zone
          <select
            value={zoneId}
            onChange={(e) => {
              setZoneId(Number(e.target.value) || "");
              setEncounterId("");
            }}
            disabled={zones.length === 0}
          >
            <option value="">-- Select --</option>
            {zones.map((z) => (
              <option key={z.id} value={z.id}>{z.name}</option>
            ))}
          </select>
        </label>

        <label>
          Encounter
          <select
            value={encounterId}
            onChange={(e) => setEncounterId(Number(e.target.value) || "")}
            disabled={encounters.length === 0}
          >
            <option value="">-- Select --</option>
            {encounters.map((enc) => (
              <option key={enc.id} value={enc.id}>{enc.name}</option>
            ))}
          </select>
        </label>

        <label>
          Job
          <select
            value={specName}
            onChange={(e) => setSpecName(e.target.value)}
          >
            <option value="">-- Select --</option>
            {jobs.map((job) => (
              <option key={job} value={job}>{job}</option>
            ))}
          </select>
        </label>

        <button onClick={handleSearch} disabled={encounterId === "" || !specName || loading || !hasData}>
          {loading ? "Loading..." : "Load Rotations"}
        </button>
      </div>
    </div>
  );
}
