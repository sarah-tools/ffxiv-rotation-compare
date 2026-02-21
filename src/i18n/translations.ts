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

  // Zone names
  "zone.AAC Heavyweight": { en: "AAC Heavyweight", ja: "アルカディア零式：ヘヴィウェイト級" },
  "zone.Futures Rewritten": { en: "Futures Rewritten", ja: "絶もうひとつの未来" },

  // Encounter (boss) names
  "enc.Vamp Fatale": { en: "Vamp Fatale", ja: "ヴァンプファタル" },
  "enc.Red Hot and Deep Blue": { en: "Red Hot and Deep Blue", ja: "レッドホット&ディープブルー" },
  "enc.The Tyrant": { en: "The Tyrant", ja: "タイラント" },
  "enc.Lindwurm": { en: "Lindwurm", ja: "リンドヴルム" },
  "enc.Lindwurm II": { en: "Lindwurm II", ja: "リンドヴルムII" },
  "enc.Futures Rewritten": { en: "Futures Rewritten", ja: "絶もうひとつの未来" },

  // Job names
  "job.Paladin": { en: "Paladin", ja: "ナイト" },
  "job.Warrior": { en: "Warrior", ja: "戦士" },
  "job.DarkKnight": { en: "Dark Knight", ja: "暗黒騎士" },
  "job.Gunbreaker": { en: "Gunbreaker", ja: "ガンブレイカー" },
  "job.WhiteMage": { en: "White Mage", ja: "白魔道士" },
  "job.Scholar": { en: "Scholar", ja: "学者" },
  "job.Astrologian": { en: "Astrologian", ja: "占星術師" },
  "job.Sage": { en: "Sage", ja: "賢者" },
  "job.Monk": { en: "Monk", ja: "モンク" },
  "job.Dragoon": { en: "Dragoon", ja: "竜騎士" },
  "job.Ninja": { en: "Ninja", ja: "忍者" },
  "job.Samurai": { en: "Samurai", ja: "侍" },
  "job.Reaper": { en: "Reaper", ja: "リーパー" },
  "job.Viper": { en: "Viper", ja: "ヴァイパー" },
  "job.Bard": { en: "Bard", ja: "吟遊詩人" },
  "job.Machinist": { en: "Machinist", ja: "機工士" },
  "job.Dancer": { en: "Dancer", ja: "踊り子" },
  "job.BlackMage": { en: "Black Mage", ja: "黒魔道士" },
  "job.Summoner": { en: "Summoner", ja: "召喚士" },
  "job.RedMage": { en: "Red Mage", ja: "赤魔道士" },
  "job.Pictomancer": { en: "Pictomancer", ja: "ピクトマンサー" },
};
