import { useState, useMemo } from "react";
import { useEncounters } from "../hooks/useEncounters";
import { useJobs } from "../hooks/useJobs";
import { useTranslation } from "../i18n/useTranslation";
import { CustomSelect } from "./CustomSelect";
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
        <div className="selector-field">
          <span className="selector-label">{t("selector.zone")}</span>
          <CustomSelect
            value={String(zoneId)}
            options={zones.map((z) => ({ value: String(z.id), label: t("zone." + z.name) }))}
            placeholder={t("selector.select")}
            onChange={(v) => { setZoneId(Number(v) || ""); setEncounterId(""); }}
            disabled={!hasData}
          />
        </div>

        <div className="selector-field">
          <span className="selector-label">{t("selector.encounter")}</span>
          <CustomSelect
            value={String(encounterId)}
            options={encounters.map((enc) => ({ value: String(enc.id), label: t("enc." + enc.name) }))}
            placeholder={t("selector.select")}
            onChange={(v) => setEncounterId(Number(v) || "")}
            disabled={encounters.length === 0}
          />
        </div>

        <div className="selector-field">
          <span className="selector-label">{t("selector.job")}</span>
          <CustomSelect
            value={specName}
            options={jobs.map((job) => ({ value: job, label: t("job." + job) }))}
            placeholder={t("selector.select")}
            onChange={(v) => setSpecName(v)}
          />
        </div>

        <button onClick={handleSearch} disabled={encounterId === "" || !specName || loading || !hasData}>
          {loading ? t("selector.loading") : t("selector.loadRotations")}
        </button>
      </div>
    </div>
  );
}
