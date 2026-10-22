import { useLanguage } from "../../i18n/useLanguage";
import { type Language } from "../../i18n/translations";

/**
 * Pemilih bahasa berbentuk dua tombol teks: "IND | ENG".
 *
 * Kedua bahasa selalu terlihat sekaligus, dengan bahasa yang sedang aktif
 * ditandai merah dan tebal. Ini menggantikan bentuk bendera sebelumnya: bendera
 * hanya menunjukkan SATU bahasa aktif, sehingga pengunjung harus menebak bahwa
 * ikon itu bisa diklik. Dua kode bahasa yang berdampingan membuka pilihannya
 * secara langsung — tidak ada yang perlu ditebak.
 *
 * Kata "IND" dan "ENG" ditulis tetap di sini, bukan lewat kamus bahasa.
 * Alasannya: keduanya adalah NAMA bahasa dalam bentuk kodenya sendiri, dan
 * justru harus tetap sama walau situs sedang berbahasa apa pun. Kalau mengikuti
 * kamus, saat situs berbahasa Indonesia pilihannya akan berbunyi
 * "Indonesia | Inggris" — tombol yang tujuannya justru berbahasa Inggris tidak
 * boleh ikut diterjemahkan ke bahasa yang sedang dipakai.
 *
 * Tombol yang tidak aktif tetap bisa diklik (untuk berpindah), tetapi warnanya
 * lebih redup. Tombol yang aktif ditandai `aria-current` supaya pembaca layar
 * tahu bahasa mana yang sedang berlaku.
 *
 * Bahasa yang aktif TIDAK diberi onClick: menekan bahasa yang sudah aktif tidak
 * boleh melakukan apa pun, jadi lebih jujur bila tidak ada aksi sama sekali.
 */
const KODE: Record<Language, string> = {
  id: "IND",
  en: "ENG",
};

const NAMA: Record<Language, string> = {
  id: "Bahasa Indonesia",
  en: "English",
};

/** Urutan tampil: IND lebih dulu, lalu ENG — sesuai "IND | ENG". */
const URUTAN: Language[] = ["id", "en"];

export default function LanguageSwitch() {
  const { language, setLanguage } = useLanguage();

  return (
    <div
      role="group"
      aria-label="Language"
      className="flex shrink-0 items-center gap-0.5 rounded-lg px-1"
    >
      {URUTAN.map((kode, index) => {
        const aktif = language === kode;

        return (
          <div key={kode} className="flex items-center">
            {/* Pemisah tipis di antara kedua pilihan — hanya visual. */}
            {index > 0 && (
              <span className="mx-0.5 h-3.5 w-px bg-border-strong" aria-hidden="true" />
            )}

            <button
              type="button"
              onClick={aktif ? undefined : () => setLanguage(kode)}
              aria-current={aktif ? "true" : undefined}
              aria-label={NAMA[kode]}
              title={NAMA[kode]}
              className={`cursor-pointer rounded px-1.5 py-1 text-xs font-semibold tracking-wide transition-colors ${
                aktif
                  ? "text-accent"
                  : "text-fg-muted hover:text-fg"
              }`}
            >
              {KODE[kode]}
            </button>
          </div>
        );
      })}
    </div>
  );
}
