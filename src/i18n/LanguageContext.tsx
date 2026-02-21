import { createContext, useState, useCallback, type ReactNode } from "react";
import type { Locale } from "./translations";

interface LanguageContextValue {
  locale: Locale;
  toggleLocale: () => void;
}

export const LanguageContext = createContext<LanguageContextValue>({
  locale: "ja",
  toggleLocale: () => {},
});

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>(() => {
    const saved = localStorage.getItem("fflogs-rc-lang");
    if (saved === "en" || saved === "ja") return saved;
    return "ja";
  });

  const toggleLocale = useCallback(() => {
    setLocale((prev) => {
      const next = prev === "en" ? "ja" : "en";
      localStorage.setItem("fflogs-rc-lang", next);
      return next;
    });
  }, []);

  return (
    <LanguageContext.Provider value={{ locale, toggleLocale }}>
      {children}
    </LanguageContext.Provider>
  );
}
