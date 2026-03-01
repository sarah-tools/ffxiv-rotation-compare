import type { PlayerTimeline } from "../api/types";
import { getTotalWidth, formatTime, buildGridSVG } from "../utils/timeline";
import { useTranslation } from "../i18n/useTranslation";
import { SkillIcon } from "./SkillIcon";

interface Props {
  player: PlayerTimeline;
  pixelsPerSecond: number;
  totalDurationMs: number;
  onHide?: () => void;
  highlightedAbilityId?: number | null;
  onAbilityClick?: (abilityId: number) => void;
}

export function TimelineRow({
  player,
  pixelsPerSecond,
  totalDurationMs,
  onHide,
  highlightedAbilityId = null,
  onAbilityClick,
}: Props) {
  const { t } = useTranslation();
  const totalWidth = getTotalWidth(totalDurationMs, pixelsPerSecond);
  const killTime = formatTime(player.duration);
  const gridSVG = buildGridSVG(pixelsPerSecond);

  return (
    <div className="timeline-row">
      <div className="player-info">
        {onHide && (
          <button className="player-hide-btn" onClick={onHide} title={t("timeline.hidePlayer")}>
            ✕
          </button>
        )}
        <div className="player-info-top">
          <span className={`rank${player.rank === 1 ? " rank-1" : ""}`}>#{player.rank}</span>
          <span className="name">{player.name}</span>
          <a
            className="report-link"
            href={player.reportUrl}
            target="_blank"
            rel="noopener noreferrer"
            title={t("timeline.openReport")}
          >
            Report
          </a>
        </div>
        <div className="player-info-bottom">
          <span className="dps">{player.rDPS.toLocaleString()} rDPS</span>
          <span className="kill-time">({killTime})</span>
        </div>
      </div>
      <div
        className="skill-lane"
        style={{
          width: totalWidth,
          position: "relative",
          height: 58,
          ["--grid-5s-size" as string]: `${pixelsPerSecond * 5}px`,
          backgroundImage: `${gridSVG}, repeating-linear-gradient(90deg, var(--grid-5s) 0 1px, transparent 1px 100%)`,
          backgroundSize: `${pixelsPerSecond}px 6px, ${pixelsPerSecond * 5}px 100%`,
        }}
      >
        {player.entries.map((entry, i) => (
          <SkillIcon
            key={i}
            entry={entry}
            pixelsPerSecond={pixelsPerSecond}
            isHighlighted={highlightedAbilityId !== null && entry.abilityId === highlightedAbilityId}
            isDimmed={highlightedAbilityId !== null && entry.abilityId !== highlightedAbilityId}
            onClick={onAbilityClick ? () => onAbilityClick(entry.abilityId) : undefined}
          />
        ))}
      </div>
    </div>
  );
}
