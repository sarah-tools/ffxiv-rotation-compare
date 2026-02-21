export type Locale = "en" | "ja";

export const translations: Record<string, Record<Locale, string>> = {
  // App header
  "app.title": {
    en: "FFLogs Rotation Compare",
    ja: "FFLogs スキル回し比較",
  },
  "app.subtitle": {
    en: "Compare top 10 skill rotations side by side",
    ja: "トップ10のスキル回しを並べて比較",
  },

  // SelectorPanel
  "selector.zone": { en: "Zone", ja: "コンテンツ" },
  "selector.encounter": { en: "Encounter", ja: "ボス" },
  "selector.job": { en: "Job", ja: "ジョブ" },
  "selector.select": { en: "-- Select --", ja: "-- 選択 --" },
  "selector.loadRotations": { en: "Load Rotations", ja: "読み込み" },
  "selector.loading": { en: "Loading...", ja: "読み込み中..." },
  "selector.loadingGameData": {
    en: "Loading game data...",
    ja: "ゲームデータ読み込み中...",
  },
  "selector.failedToLoad": {
    en: "Failed to load game data: ",
    ja: "ゲームデータの読み込みに失敗: ",
  },

  // Rankings section
  "rankings.loading": { en: "Loading...", ja: "読み込み中..." },
  "rankings.top": { en: "Top", ja: "トップ" },

  // Timeline toolbar
  "toolbar.showAll": { en: "Show All", ja: "すべて表示" },
  "toolbar.hidden": { en: "hidden", ja: "件非表示" },
  "toolbar.clearMarkers": { en: "Clear Markers", ja: "マーカーを消す" },
  "toolbar.clearHighlight": {
    en: "Clear Highlight",
    ja: "ハイライトを解除",
  },

  // AbilityFilter
  "filter.filter": { en: "Filter", ja: "フィルター" },
  "filter.showAll": { en: "Show All", ja: "すべて表示" },
  "filter.hideAll": { en: "Hide All", ja: "すべて非表示" },

  // TimelineRow
  "timeline.hidePlayer": { en: "Hide player", ja: "非表示" },
  "timeline.openReport": {
    en: "Open FFLogs report",
    ja: "FFLogsのレポートを開く",
  },

  // Footer
  "footer.lastUpdated": { en: "Last Updated", ja: "最終更新" },
  "footer.schedule": {
    en: "Data is collected daily at 10:00 JST — Odd days: M1S / M2S / M3S, Even days: M4S / M5S / FRW",
    ja: "毎日 JST 10:00 にデータ収集 — 奇数日: M1S / M2S / M3S, 偶数日: M4S / M5S / FRW",
  },

  // Error messages (used as keys in useRotationData, translated in App.tsx)
  "error.noData": {
    en: "No ranking data found for this encounter/job combination.",
    ja: "このボス・ジョブの組み合わせのランキングデータが見つかりません。",
  },
  "error.notGenerated": {
    en: "Data not available for this encounter/job. Data may not have been generated yet.",
    ja: "このボス・ジョブのデータはまだ生成されていません。",
  },
};
