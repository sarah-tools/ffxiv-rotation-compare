export function getIconX(timestampMs: number, pixelsPerSecond: number): number {
  return (timestampMs / 1000) * pixelsPerSecond;
}

export function getTotalWidth(durationMs: number, pixelsPerSecond: number): number {
  return (durationMs / 1000) * pixelsPerSecond;
}

export function formatTime(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

export function getTickInterval(pixelsPerSecond: number): number {
  // Return tick interval in seconds based on zoom level
  if (pixelsPerSecond >= 100) return 1;
  if (pixelsPerSecond >= 40) return 5;
  if (pixelsPerSecond >= 20) return 10;
  return 30;
}

/**
 * Build a data-URI SVG that tiles at `pixelsPerSecond` px wide
 * containing a 1px dotted vertical line on the left edge.
 * Dash = 3px drawn, 3px gap.
 */
export function buildGridSVG(pixelsPerSecond: number): string {
  const w = pixelsPerSecond; // tile width = 1 second
  // SVG with a dashed vertical line at x=0.5
  const svg =
    `<svg xmlns='http://www.w3.org/2000/svg' width='${w}' height='6'>` +
    `<rect x='0' y='0' width='1' height='3' fill='white' fill-opacity='0.06'/>` +
    `</svg>`;
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

