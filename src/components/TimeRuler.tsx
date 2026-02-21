import { getIconX, formatTime, getTickInterval, getTotalWidth, buildGridSVG } from "../utils/timeline";

interface Props {
  durationMs: number;
  pixelsPerSecond: number;
  onAddMarker?: (timestampMs: number) => void;
}

export function TimeRuler({ durationMs, pixelsPerSecond, onAddMarker }: Props) {
  const totalWidth = getTotalWidth(durationMs, pixelsPerSecond);
  const gridSVG = buildGridSVG(pixelsPerSecond);
  const tickIntervalSec = getTickInterval(pixelsPerSecond);
  const totalSeconds = Math.ceil(durationMs / 1000);

  const ticks: { x: number; label: string }[] = [];
  for (let sec = tickIntervalSec; sec <= totalSeconds; sec += tickIntervalSec) {
    ticks.push({
      x: getIconX(sec * 1000, pixelsPerSecond),
      label: formatTime(sec * 1000),
    });
  }

  const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!onAddMarker) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const timestampMs = (clickX / pixelsPerSecond) * 1000;
    onAddMarker(Math.max(0, timestampMs));
  };

  return (
    <div
      className="time-ruler"
      style={{
        width: totalWidth,
        position: "relative",
        height: 28,
        cursor: onAddMarker ? "crosshair" : undefined,
        backgroundImage: `${gridSVG}, repeating-linear-gradient(90deg, var(--grid-5s) 0 1px, transparent 1px 100%)`,
        backgroundSize: `${pixelsPerSecond}px 6px, ${pixelsPerSecond * 5}px 100%`,
      }}
      onClick={handleClick}
    >
      {ticks.map((tick) => (
        <div
          key={tick.x}
          className="tick"
          style={{ position: "absolute", left: tick.x }}
        >
          <div className="tick-line" />
          <span className="tick-label">{tick.label}</span>
        </div>
      ))}
    </div>
  );
}
