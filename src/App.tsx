import { useMemo } from "react";
import { useRotationData } from "./hooks/useRotationData";
import { SelectorPanel } from "./components/SelectorPanel";
import { TimelineContainer } from "./components/TimelineContainer";
import { JOB_ICONS } from "./utils/jobIcons";
import "./styles/timeline.css";

export default function App() {
  const { timelines, encounterName, loading, error, fetchData } = useRotationData();

  const partyByRank = useMemo(() => {
    const map = new Map<number, string[]>();
    for (const t of timelines) {
      map.set(t.rank, t.party);
    }
    return map;
  }, [timelines]);

  const synergyByRank = useMemo(() => {
    const map = new Map<number, { given?: number; taken?: number }>();
    for (const t of timelines) {
      map.set(t.rank, { given: t.dpsGiven, taken: t.dpsTaken });
    }
    return map;
  }, [timelines]);

  const handleSearch = (encounterId: number, specName: string, difficulty: number, encName: string) => {
    fetchData(encounterId, specName, difficulty, encName);
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>FFLogs Rotation Compare</h1>
        <p>Compare top 10 skill rotations side by side</p>
      </header>

      <SelectorPanel onSearch={handleSearch} loading={loading} />

      {loading && (
        <div className="rankings-section">
          <div className="rankings-header">
            <h2>Loading...</h2>
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
          <p>{error}</p>
        </div>
      )}

      {timelines.length > 0 && (
        <div className="rankings-section">
          <div className="rankings-header">
            <h2>{encounterName} - {timelines[0]?.job} Top {timelines.length}</h2>
          </div>
          <div className="rankings-list">
            {timelines.map((t) => {
              const party = partyByRank.get(t.rank);
              const synergy = synergyByRank.get(t.rank);
              return (
                <div key={t.rank} className="ranking-item">
                  <span className={`rank${t.rank === 1 ? " rank-1" : ""}`}>#{t.rank}</span>
                  <span className="name">{t.name}</span>
                  <span className="server">{t.server}</span>
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
                    <span className="spec">{t.job}</span>
                  )}
                  <span className="dps-row">
                    <span className="dps-val rdps">{t.rDPS.toLocaleString()}</span>
                    <span className="dps-label rdps"> rDPS</span>
                    {t.aDPS != null && <>
                      <span className="dps-sep">/</span>
                      <span className="dps-val adps">{t.aDPS.toLocaleString()}</span>
                      <span className="dps-label adps"> aDPS</span>
                    </>}
                    {t.nDPS != null && <>
                      <span className="dps-sep">/</span>
                      <span className="dps-val ndps">{t.nDPS.toLocaleString()}</span>
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
    </div>
  );
}
