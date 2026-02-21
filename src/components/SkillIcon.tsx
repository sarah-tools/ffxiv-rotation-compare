import { useState } from "react";
import { createPortal } from "react-dom";
import type { TimelineEntry } from "../api/types";
import { getIconX } from "../utils/timeline";

interface Props {
  entry: TimelineEntry;
  pixelsPerSecond: number;
  isHighlighted?: boolean;
  isDimmed?: boolean;
  onClick?: () => void;
}

const ICON_SIZE = 28;

const SKILL_TYPE_LABELS: Record<string, { label: string; className: string }> = {
  weaponskill: { label: "ウェポンスキル", className: "tooltip-ws" },
  spell: { label: "魔法", className: "tooltip-spell" },
  ability: { label: "アビリティ", className: "tooltip-ability" },
};

/** Format timestamp in M:SS.mmm (millisecond precision) */
function formatTimePrecise(ms: number): string {
  const totalSeconds = ms / 1000;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toFixed(3).padStart(6, "0")}`;
}

export function SkillIcon({ entry, pixelsPerSecond, isHighlighted = false, isDimmed = false, onClick }: Props) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const x = getIconX(entry.timestamp, pixelsPerSecond);
  // GCD: top row (0), oGCD: bottom row (30) — tightly packed
  const top = entry.isGCD ? 0 : 30;

  const classNames = [
    "skill-icon",
    entry.isGCD ? "gcd" : "ogcd",
    isHighlighted ? "highlighted" : "",
    isDimmed ? "dimmed" : "",
  ].filter(Boolean).join(" ");

  const typeInfo = SKILL_TYPE_LABELS[entry.skillType] ?? SKILL_TYPE_LABELS.ability;

  const handleMouseEnter = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
    setShowTooltip(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePos({ x: e.clientX, y: e.clientY });
  };

  return (
    <div
      className={classNames}
      style={{
        position: "absolute",
        left: x,
        top,
        width: ICON_SIZE,
        height: ICON_SIZE,
      }}
      onMouseEnter={handleMouseEnter}
      onMouseMove={handleMouseMove}
      onMouseLeave={() => setShowTooltip(false)}
      onClick={onClick}
    >
      {imgError ? (
        <div
          className="skill-icon-fallback"
          style={{ width: ICON_SIZE, height: ICON_SIZE }}
          title={entry.abilityName}
        >
          {entry.abilityName.charAt(0)}
        </div>
      ) : (
        <img
          src={entry.iconUrl}
          alt={entry.abilityName}
          width={ICON_SIZE}
          height={ICON_SIZE}
          loading="lazy"
          draggable={false}
          onError={() => setImgError(true)}
        />
      )}
      {showTooltip &&
        createPortal(
          <div
            className="tooltip"
            style={{
              left: mousePos.x + 12,
              top: mousePos.y - 50,
            }}
          >
            <strong>{entry.abilityName}</strong>
            <br />
            {formatTimePrecise(entry.timestamp)}
            <br />
            <span className={typeInfo.className}>
              {typeInfo.label}
            </span>
          </div>,
          document.body
        )}
    </div>
  );
}
