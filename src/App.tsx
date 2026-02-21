import { useMemo } from "react";
import { useRotationData } from "./hooks/useRotationData";
import { useDataIndex } from "./hooks/useDataIndex";
import { useTranslation } from "./i18n/useTranslation";
import { SelectorPanel } from "./components/SelectorPanel";
import { TimelineContainer } from "./components/TimelineContainer";
import { LanguageToggle } from "./components/LanguageToggle";
import { JOB_ICONS } from "./utils/jobIcons";
import "./styles/timeline.css";

export default function App() {
  const { timelines, encounterName, loading, error, fetchData } = useRotationData();
  const { lastUpdated } = useDataIndex();
  const { t, locale } = useTranslation();

  const lastUpdatedDisplay = useMemo(() => {
    if (!lastUpdated) return null;
    const d = new Date(lastUpdated);
    return d.toLocaleString(locale === "ja" ? "ja-JP" : "en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      timeZone: "Asia/Tokyo",
    });
  }, [lastUpdated, locale]);

  const partyByRank = useMemo(() => {
    const map = new Map<number, string[]>();
    for (const tl of timelines) {
      map.set(tl.rank, tl.party);
    }
    return map;
  }, [timelines]);

  const synergyByRank = useMemo(() => {
    const map = new Map<number, { given?: number; taken?: number }>();
    for (const tl of timelines) {
      map.set(tl.rank, { given: tl.dpsGiven, taken: tl.dpsTaken });
    }
    return map;
  }, [timelines]);

  const handleSearch = (encounterId: number, specName: string, difficulty: number, encName: string) => {
    fetchData(encounterId, specName, difficulty, encName);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>{t("app.title")}</h1>
        <p>{t("app.subtitle")}</p>
        <LanguageToggle />
      </header>

      <SelectorPanel onSearch={handleSearch} loading={loading} />

      {loading && (
        <div className="rankings-section">
          <div className="rankings-header">
            <h2>{t("rankings.loading")}</h2>
          </div>
          <div className="rankings-list">
            {Array.from({ length: 10 }, (_, i) => (
              <div key={i} className="ranking-item skeleton-item">
                <span className="skeleton-bar" style={{ width: 32 }} />
                <span className="skeleton-bar" style={{ width: 100 }} />
                <span className="skeleton-bar" style={{ width: 70 }} />
                <span className="skeleton-bar" style={{ width: 100 }} />
                <span className="skeleton-bar skeleton-dps" />
              </div>
            ))}
          </div>
        </div>
      )}

      {error && (
        <div className="app-status error">
          <p>{t(error)}</p>
        </div>
      )}

      {timelines.length > 0 && (
        <div className="rankings-section">
          <div className="rankings-header">
            <h2>{t("enc." + encounterName)} - {t("job." + timelines[0]?.job)} {t("rankings.top")} {timelines.length}</h2>
          </div>
          <div className="rankings-list">
            {timelines.map((tl) => {
              const party = partyByRank.get(tl.rank);
              const synergy = synergyByRank.get(tl.rank);
              return (
                <div key={tl.rank} className="ranking-item">
                  <span className={`rank${tl.rank === 1 ? " rank-1" : ""}`}>#{tl.rank}</span>
                  <span className="name">{tl.name}</span>
                  <span className="server">{tl.server}</span>
                  {party ? (
                    <span className="party-comp">
                      {party.map((job, j) => (
                        <img
                          key={j}
                          src={JOB_ICONS[job] ?? ""}
                          alt={job}
                          title={job}
                          className="party-job-icon"
                        />
                      ))}
                    </span>
                  ) : (
                    <span className="spec">{tl.job}</span>
                  )}
                  <span className="dps-row">
                    <span className="dps-val rdps">{tl.rDPS.toLocaleString()}</span>
                    <span className="dps-label rdps"> rDPS</span>
                    {tl.aDPS != null && <>
                      <span className="dps-sep">/</span>
                      <span className="dps-val adps">{tl.aDPS.toLocaleString()}</span>
                      <span className="dps-label adps"> aDPS</span>
                    </>}
                    {tl.nDPS != null && <>
                      <span className="dps-sep">/</span>
                      <span className="dps-val ndps">{tl.nDPS.toLocaleString()}</span>
                      <span className="dps-label ndps"> nDPS</span>
                    </>}
                    {synergy && <>
                      <span className="dps-sep">/</span>
                      <span className="dps-val synergy-given">{synergy.given?.toLocaleString() ?? "-"}</span>
                      <span className="dps-label synergy-given"> Given</span>
                      <span className="dps-sep">/</span>
                      <span className="dps-val synergy-taken">{synergy.taken?.toLocaleString() ?? "-"}</span>
                      <span className="dps-label synergy-taken"> Taken</span>
                    </>}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <TimelineContainer timelines={timelines} loading={loading} />

      <footer className="app-footer">
        <div className="footer-info">
          {lastUpdatedDisplay && (
            <span className="footer-updated">{t("footer.lastUpdated")}: {lastUpdatedDisplay} (JST)</span>
          )}
          <span className="footer-schedule">
            {t("footer.schedule")}
          </span>
        </div>
      </footer>
    </div>
  );
}
