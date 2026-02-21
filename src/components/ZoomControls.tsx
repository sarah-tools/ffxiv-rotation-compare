import { MIN_PIXELS_PER_SECOND, MAX_PIXELS_PER_SECOND } from "../utils/constants";

interface Props {
  pixelsPerSecond: number;
  onChange: (value: number) => void;
}

export function ZoomControls({ pixelsPerSecond, onChange }: Props) {
  return (
    <div className="zoom-controls">
      <button
        onClick={() => onChange(Math.max(MIN_PIXELS_PER_SECOND, pixelsPerSecond - 10))}
        disabled={pixelsPerSecond <= MIN_PIXELS_PER_SECOND}
      >
        -
      </button>
      <input
        type="range"
        min={MIN_PIXELS_PER_SECOND}
        max={MAX_PIXELS_PER_SECOND}
        value={pixelsPerSecond}
        onChange={(e) => onChange(Number(e.target.value))}
      />
      <button
        onClick={() => onChange(Math.min(MAX_PIXELS_PER_SECOND, pixelsPerSecond + 10))}
        disabled={pixelsPerSecond >= MAX_PIXELS_PER_SECOND}
      >
        +
      </button>
      <span className="zoom-label">{pixelsPerSecond} px/s</span>
    </div>
  );
}
