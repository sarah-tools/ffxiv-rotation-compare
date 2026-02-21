import { useContext, useCallback } from "react";
import { LanguageContext } from "./LanguageContext";
import { translations } from "./translations";

export function useTranslation() {
  const { locale } = useContext(LanguageContext);

  const t = useCallback(
    (key: string): string => {
      const entry = translations[key];
      if (!entry) return key;
      return entry[locale] ?? entry.en ?? key;
    },
    [locale]
  );

  return { t, locale };
}
