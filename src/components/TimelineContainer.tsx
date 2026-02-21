import { useState, useRef, useCallback, useMemo } from "react";
import type { PlayerTimeline } from "../api/types";
import { DEFAULT_PIXELS_PER_SECOND, MIN_PIXELS_PER_SECOND, MAX_PIXELS_PER_SECOND } from "../utils/constants";
import { getIconX, getTotalWidth } from "../utils/timeline";
import { useTranslation } from "../i18n/useTranslation";
import { TimeRuler } from "./TimeRuler";
import { TimelineRow } from "./TimelineRow";
import { ZoomControls } from "./ZoomControls";
import { AbilityFilter } from "./AbilityFilter";

interface Props {
  timelines: PlayerTimeline[];
  loading?: boolean;
}

export function TimelineContainer({ timelines, loading = false }: Props) {
  const { t } = useTranslation();
  const [pixelsPerSecond, setPixelsPerSecond] = useState(DEFAULT_PIXELS_PER_SECOND);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Feature 7: Player visibility
  const [hiddenRanks, setHiddenRanks] = useState<Set<number>>(new Set());

  // Feature 6: Ability filter
  const [hiddenAbilityIds, setHiddenAbilityIds] = useState<Set<number>>(new Set());

  // Feature 3: Ability highlight
  const [highlightedAbilityId, setHighlightedAbilityId] = useState<number | null>(null);

  // Feature 4: Vertical markers
  const [markers, setMarkers] = useState<number[]>([]);

  // --- Derived data ---

  const maxDuration = useMemo(
    () => Math.max(...timelines.map((t) => t.duration), 0),
    [timelines]
  );

  const totalWidth = useMemo(
    () => getTotalWidth(maxDuration, pixelsPerSecond),
    [maxDuration, pixelsPerSecond]
  );

  // Feature 7: visible timelines
  const visibleTimelines = useMemo(
    () => timelines.filter((t) => !hiddenRanks.has(t.rank)),
    [timelines, hiddenRanks]
  );

  // Feature 6: unique abilities list (from all timelines, not just visible)
  const uniqueAbilities = useMemo(() => {
    const map = new Map<number, { id: number; name: string; iconUrl: string; count: number }>();
    for (const player of timelines) {
      for (const entry of player.entries) {
        const existing = map.get(entry.abilityId);
        if (existing) {
          existing.count++;
        } else {
          map.set(entry.abilityId, {
            id: entry.abilityId,
            name: entry.abilityName,
            iconUrl: entry.iconUrl,
            count: 1,
          });
        }
      }
    }
    return Array.from(map.values()).sort((a, b) => b.count - a.count);
  }, [timelines]);

  // Feature 6: filtered timelines
  const filteredTimelines = useMemo(() => {
    if (hiddenAbilityIds.size === 0) return visibleTimelines;
    return visibleTimelines.map((player) => ({
      ...player,
      entries: player.entries.filter((e) => !hiddenAbilityIds.has(e.abilityId)),
    }));
  }, [visibleTimelines, hiddenAbilityIds]);

  // --- Callbacks ---

  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      if (e.ctrlKey || e.metaKey) {
        e.preventDefault();
        const delta = e.deltaY > 0 ? -5 : 5;
        setPixelsPerSecond((prev) =>
          Math.min(MAX_PIXELS_PER_SECOND, Math.max(MIN_PIXELS_PER_SECOND, prev + delta))
        );
      }
    },
    []
  );

  // Feature 7
  const handleHidePlayer = useCallback((rank: number) => {
    setHiddenRanks((prev) => new Set([...prev, rank]));
  }, []);

  const handleShowAll = useCallback(() => {
    setHiddenRanks(new Set());
  }, []);

  // Feature 6
  const handleToggleAbility = useCallback((abilityId: number) => {
    setHiddenAbilityIds((prev) => {
      const next = new Set(prev);
      if (next.has(abilityId)) {
        next.delete(abilityId);
      } else {
        next.add(abilityId);
      }
      return next;
    });
  }, []);

  const handleShowAllAbilities = useCallback(() => {
    setHiddenAbilityIds(new Set());
  }, []);

  const handleHideAllAbilities = useCallback(() => {
    setHiddenAbilityIds(new Set(uniqueAbilities.map((a) => a.id)));
  }, [uniqueAbilities]);

  // Feature 3
  const handleAbilityClick = useCallback((abilityId: number) => {
    setHighlightedAbilityId((prev) => (prev === abilityId ? null : abilityId));
  }, []);

  // Feature 4
  const handleAddMarker = useCallback((timestampMs: number) => {
    setMarkers((prev) => [...prev, timestampMs]);
  }, []);

  const handleRemoveMarker = useCallback((index: number) => {
    setMarkers((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleClearMarkers = useCallback(() => {
    setMarkers([]);
  }, []);

  if (timelines.length === 0 && !loading) return null;

  // Show skeleton while loading with no timelines yet
  if (timelines.length === 0 && loading) {
    return (
      <div className="timeline-wrapper">
        <div className="timeline-container" style={{ borderRadius: "var(--radius)" }}>
          <div className="timeline-scroll-area">
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} className="timeline-row skeleton-timeline-row">
                <div className="player-info">
                  <div className="player-info-top">
                    <span className="skeleton-bar" style={{ width: 24 }} />
                    <span className="skeleton-bar" style={{ width: 80 }} />
                  </div>
                  <div className="player-info-bottom">
                    <span className="skeleton-bar" style={{ width: 60 }} />
                    <span className="skeleton-bar" style={{ width: 40 }} />
                  </div>
                </div>
                <div className="skill-lane" style={{ position: "relative", height: 58, width: "100%" }}>
                  <div className="skeleton-skill-lane">
                    {Array.from({ length: 20 }, (_, j) => (
                      <span key={j} className="skeleton-skill-icon" style={{ left: j * 38 }} />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="timeline-wrapper">
      <ZoomControls pixelsPerSecond={pixelsPerSecond} onChange={setPixelsPerSecond} />

      {/* Toolbar */}
      <div className="timeline-toolbar">
        {hiddenRanks.size > 0 && (
          <button className="toolbar-btn" onClick={handleShowAll}>
            {t("toolbar.showAll")} ({hiddenRanks.size} {t("toolbar.hidden")})
          </button>
        )}
        <AbilityFilter
          abilities={uniqueAbilities}
          hiddenAbilityIds={hiddenAbilityIds}
          onToggle={handleToggleAbility}
          onShowAll={handleShowAllAbilities}
          onHideAll={handleHideAllAbilities}
        />
        {markers.length > 0 && (
          <button className="toolbar-btn" onClick={handleClearMarkers}>
            {t("toolbar.clearMarkers")} ({markers.length})
          </button>
        )}
        {highlightedAbilityId !== null && (
          <button className="toolbar-btn" onClick={() => setHighlightedAbilityId(null)}>
            {t("toolbar.clearHighlight")}
          </button>
        )}
      </div>

      <div
        className="timeline-container"
        ref={scrollRef}
        onWheel={handleWheel}
      >
        <div className="timeline-scroll-area">
          <div className="ruler-row">
            <div className="player-info-placeholder" />
            <TimeRuler
              durationMs={maxDuration}
              pixelsPerSecond={pixelsPerSecond}
              onAddMarker={handleAddMarker}
            />
          </div>

          {filteredTimelines.map((player) => (
            <TimelineRow
              key={player.rank}
              player={player}
              pixelsPerSecond={pixelsPerSecond}
              totalDurationMs={maxDuration}
              onHide={() => handleHidePlayer(player.rank)}
              highlightedAbilityId={highlightedAbilityId}
              onAbilityClick={handleAbilityClick}
            />
          ))}

          {/* Feature 4: Marker overlay */}
          {markers.length > 0 && (
            <div
              className="marker-overlay"
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: totalWidth + 220,
                height: "100%",
                pointerEvents: "none",
                zIndex: 15,
              }}
            >
              {markers.map((ts, i) => (
                <div
                  key={`marker-${i}`}
                  className="marker-line"
                  style={{
                    position: "absolute",
                    left: getIconX(ts, pixelsPerSecond) + 220,
                    top: 0,
                    bottom: 0,
                  }}
                >
                  <div
                    className="marker-handle"
                    style={{ pointerEvents: "auto" }}
                    onClick={() => handleRemoveMarker(i)}
                    title={`Remove marker (${Math.round(ts / 1000)}s)`}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
