import { useState, useMemo } from "react";
import { useEncounters } from "../hooks/useEncounters";
import { useJobs } from "../hooks/useJobs";
import { useTranslation } from "../i18n/useTranslation";
import type { Zone, Encounter } from "../api/types";

interface Props {
  onSearch: (encounterId: number, specName: string, difficulty: number, encounterName: string) => void;
  loading: boolean;
}

export function SelectorPanel({ onSearch, loading }: Props) {
  const { expansions, loading: loadingEnc, error: encError } = useEncounters();
  const { jobs, loading: loadingJobs, error: jobsError } = useJobs();
  const { t } = useTranslation();

  const [zoneId, setZoneId] = useState<number | "">("");
  const [encounterId, setEncounterId] = useState<number | "">("");
  const [specName, setSpecName] = useState("");

  // Flatten all zones from all expansions
  const zones: Zone[] = useMemo(() => {
    return expansions.flatMap((exp) => exp.zones);
  }, [expansions]);

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
  const hasData = zones.length > 0;

  return (
    <div className="selector-panel">
      {dataError && (
        <div className="selector-error">
          <p>{t("selector.failedToLoad")}{dataError}</p>
        </div>
      )}
      {isDataLoading && <div className="selector-loading">{t("selector.loadingGameData")}</div>}
      <div className="selector-row">
        <label>
          {t("selector.zone")}
          <select
            value={zoneId}
            onChange={(e) => {
              setZoneId(Number(e.target.value) || "");
              setEncounterId("");
            }}
            disabled={!hasData}
          >
            <option value="">{t("selector.select")}</option>
            {zones.map((z) => (
              <option key={z.id} value={z.id}>{t("zone." + z.name)}</option>
            ))}
          </select>
        </label>

        <label>
          {t("selector.encounter")}
          <select
            value={encounterId}
            onChange={(e) => setEncounterId(Number(e.target.value) || "")}
            disabled={encounters.length === 0}
          >
            <option value="">{t("selector.select")}</option>
            {encounters.map((enc) => (
              <option key={enc.id} value={enc.id}>{t("enc." + enc.name)}</option>
            ))}
          </select>
        </label>

        <label>
          {t("selector.job")}
          <select
            value={specName}
            onChange={(e) => setSpecName(e.target.value)}
          >
            <option value="">{t("selector.select")}</option>
            {jobs.map((job) => (
              <option key={job} value={job}>{t("job." + job)}</option>
            ))}
          </select>
        </label>

        <button onClick={handleSearch} disabled={encounterId === "" || !specName || loading || !hasData}>
          {loading ? t("selector.loading") : t("selector.loadRotations")}
        </button>
      </div>
    </div>
  );
}
