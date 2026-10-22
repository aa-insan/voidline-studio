import { useEffect, useState, type ReactNode } from "react";
import { LanguageContext } from "./language-context";
import {
  DEFAULT_LANGUAGE,
  LANGUAGE_STORAGE_KEY,
  translations,
  type Language,
} from "./translations";

/**
 * Menentukan bahasa awal: pilihan tersimpan kalau ada, kalau tidak pakai
 * bahasa default. Selalu divalidasi supaya nilai lama/asing tidak membuat
 * situs jatuh.
 */
const getInitialLanguage = (): Language => {
  const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  return saved && saved in translations ? (saved as Language) : DEFAULT_LANGUAGE;
};

/**
 * Sumber kebenaran bahasa seluruh situs.
 *
 * Pilihan disimpan di localStorage supaya bertahan setelah refresh, dan
 * atribut lang pada <html> diperbarui agar pembaca layar serta mesin pencari
 * tahu bahasa yang sedang tampil.
 */
export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>(getInitialLanguage);

  useEffect(() => {
    document.documentElement.lang = language;
    localStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  }, [language]);

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}
