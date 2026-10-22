import { useContext } from "react";
import { LanguageContext, type LanguageContextValue } from "./language-context";
import { translations } from "./translations";

/**
 * Menghasilkan tipe jalur bertitik dari kamus, mis. "nav.home" atau
 * "page.home.title". Dengan ini TypeScript menolak kunci yang salah tulis saat
 * build, bukan membiarkannya lolos menjadi teks kosong di browser.
 */
type Join<K, P> = K extends string
  ? P extends string
    ? `${K}.${P}`
    : never
  : never;

type Paths<T> = {
  [K in keyof T]: T[K] extends string ? K : Join<K, Paths<T[K]>>;
}[keyof T];

export type TextKey = Paths<typeof translations.en>;

/** Mengambil nilai dari objek bersarang memakai jalur "a.b.c". */
const resolve = (source: object, path: string): string | undefined => {
  const value = path
    .split(".")
    .reduce<unknown>(
      (accumulator, part) =>
        accumulator && typeof accumulator === "object"
          ? (accumulator as Record<string, unknown>)[part]
          : undefined,
      source,
    );
  return typeof value === "string" ? value : undefined;
};

/**
 * Mengambil teks dari kamus berdasarkan bahasa yang sedang aktif.
 *
 * Pemakaian:
 *   const { t, language, setLanguage } = useLanguage()
 *   t("nav.home")
 *
 * Bila kunci tidak ada, kunci itu sendiri dikembalikan supaya teks yang belum
 * diterjemahkan terlihat jelas saat pengembangan, bukan menghilang tanpa jejak.
 *
 * Nilai bisa disisipkan ke dalam teks dengan {nama}:
 *   t("collection.count", { count: 3 })
 * dengan kamus berbunyi "3 collections". Dipakai supaya angka tidak perlu
 * dirangkai dari potongan teks di dalam komponen — susunan kalimat tetap
 * ditentukan kamus, bukan kode.
 */
export function useLanguage(): LanguageContextValue & {
  t: (key: TextKey, values?: Record<string, string | number>) => string;
} {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage harus dipakai di dalam <LanguageProvider>");
  }

  const t = (key: TextKey, values?: Record<string, string | number>) => {
    const text = resolve(translations[context.language], key) ?? key;
    if (!values) return text;

    // Ganti setiap {nama} dengan nilainya. Bagian yang tidak punya pasangan
    // dibiarkan apa adanya, supaya salah tulis nama kunci terlihat di layar
    // alih-alih menjadi kata yang hilang.
    return text.replace(/\{(\w+)\}/g, (match, name: string) =>
      name in values ? String(values[name]) : match,
    );
  };

  return { ...context, t };
}
