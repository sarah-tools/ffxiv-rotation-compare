import { useState } from "react";
import { useTranslation } from "../i18n/useTranslation";

interface AbilityInfo {
  id: number;
  name: string;
  iconUrl: string;
  count: number;
}

interface Props {
  abilities: AbilityInfo[];
  hiddenAbilityIds: Set<number>;
  onToggle: (abilityId: number) => void;
  onShowAll: () => void;
  onHideAll: () => void;
}

export function AbilityFilter({ abilities, hiddenAbilityIds, onToggle, onShowAll, onHideAll }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();

  const hiddenCount = hiddenAbilityIds.size;

  return (
    <div className="ability-filter">
      <button
        className={`toolbar-btn ${isOpen ? "active" : ""}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        {t("filter.filter")}{hiddenCount > 0 ? ` (${hiddenCount} ${t("toolbar.hidden")})` : ""}
      </button>
      {isOpen && (
        <div className="ability-filter-panel">
          <div className="ability-filter-actions">
            <button className="ability-filter-action-btn" onClick={onShowAll}>
              {t("filter.showAll")}
            </button>
            <button className="ability-filter-action-btn" onClick={onHideAll}>
              {t("filter.hideAll")}
            </button>
          </div>
          <div className="ability-filter-list">
            {abilities.map((ability) => {
              const isVisible = !hiddenAbilityIds.has(ability.id);
              return (
                <label
                  key={ability.id}
                  className={`ability-filter-item ${isVisible ? "" : "hidden-ability"}`}
                >
                  <input
                    type="checkbox"
                    checked={isVisible}
                    onChange={() => onToggle(ability.id)}
                  />
                  <img
                    src={ability.iconUrl}
                    alt={ability.name}
                    width={20}
                    height={20}
                    loading="lazy"
                  />
                  <span className="ability-filter-name">{ability.name}</span>
                  <span className="ability-filter-count">{ability.count}</span>
                </label>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
