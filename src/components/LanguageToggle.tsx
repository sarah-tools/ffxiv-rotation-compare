import { useContext } from "react";
import { LanguageContext } from "../i18n/LanguageContext";

export function LanguageToggle() {
  const { locale, toggleLocale } = useContext(LanguageContext);

  return (
    <button
      className="language-toggle"
      onClick={toggleLocale}
      aria-label="Toggle language"
    >
      {locale === "ja" ? "EN" : "JP"}
    </button>
  );
}
