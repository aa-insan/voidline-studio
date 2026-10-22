import { createContext } from "react";
import type { Language } from "./translations";

export type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
};

/**
 * Dipisah dari provider supaya file provider hanya mengekspor komponen.
 * React Fast Refresh bekerja paling baik bila satu file berisi komponen saja.
 */
export const LanguageContext = createContext<LanguageContextValue | null>(null);
