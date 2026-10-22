/* =============================================================================
   GRID HASIL — koleksi yang sudah jadi, bisa disunting

   Menampilkan setiap item sebagai kartu. Penyuntingan terjadi di dalam kartu
   (lihat ResultCard); komponen ini menyediakan dua hal yang butuh pandangan
   seluruh koleksi:
     1. Pemeriksaan kembar — menentukan pilihan trait mana yang akan membuat
        item kembar, supaya tombolnya bisa dimatikan lebih dulu.
     2. Aksi massal — kunci semua, buka semua, dan nomori ulang.

   ── KENAPA PEMERIKSAAN KEMBAR ADA DI SINI ─────────────────────────────────
   Satu kartu tidak tahu isi kartu lain. Tanpa pemeriksaan di tingkat koleksi,
   pengunjung baru tahu pilihannya akan membuat kembar setelah mengklik, lewat
   pesan galat. Menghitung sidik semua item sekali per render jauh lebih murah
   daripada itu — dan jauh lebih enak dipakai.

   ── NOMORI ULANG ──────────────────────────────────────────────────────────
   Tombol ini tidak mengubah gambar apa pun, hanya nomor dan nama. Gunanya:
   setelah beberapa item dibuang dan diisi ulang, atau saat ingin memulai
   penomoran dari nomor awal yang baru.
   ============================================================================= */

import { useMemo, useState } from "react";
import { useLanguage } from "../../../i18n/useLanguage";
import type { HasilKoleksi } from "../hooks/useKoleksi";
import { sidikItem } from "../lib/sunting";
import type { Layer } from "../types";
import ResultCard from "./ResultCard";

type Props = {
  hasil: HasilKoleksi;
  layers: Layer[];
  /** Indeks item yang gambarnya sedang dirender ulang. */
  menyunting: number | null;
  onUnduh: (itemIndeks: number) => void;
  /** Menyusun dan mengunduh semua gambar + metadata sebagai satu ZIP. */
  onUnduhZip: () => void;
  /** ZIP sedang disusun — tombol dikunci agar tidak klik ganda. */
  mengepak: boolean;
  onKunci: (indeks: number, dikunci: boolean) => void;
  onKunciSemua: (dikunci: boolean) => void;
  onGantiTrait: (indeks: number, layerId: string, traitId: string) => void;
  onKerUlang: (indeks: number) => void;
  onBuang: (indeks: number) => void;
  onNomoriUlang: () => void;
};

export default function ResultGrid({
  hasil,
  layers,
  menyunting,
  onUnduh,
  onUnduhZip,
  mengepak,
  onKunci,
  onKunciSemua,
  onGantiTrait,
  onKerUlang,
  onBuang,
  onNomoriUlang,
}: Props) {
  const { t } = useLanguage();
  /** Indeks kartu yang panel suntingnya terbuka. Hanya satu pada satu waktu. */
  const [terbuka, setTerbuka] = useState<number | null>(null);

  /**
   * Sidik semua item, dikunci per indeks.
   *
   * Dibangun ulang setiap koleksi berubah. Biayanya O(n) string — untuk
   * seribu item masih jauh di bawah satu frame, jadi tidak perlu di-cache.
   */
  const petaSidik = useMemo(() => {
    const peta = new Map<number, string>();
    for (const h of hasil.item) peta.set(h.item.indeks, sidikItem(h.item));
    return peta;
  }, [hasil]);

  /** Menghitung sidik bila satu layer diganti — tanpa mengubah data. */
  const akanKembar = (indeks: number, layerId: string, traitId: string): boolean => {
    const h = hasil.item.find((x) => x.item.indeks === indeks);
    if (!h) return false;

    const sidikBaru = sidikItem({
      ...h.item,
      pilihan: h.item.pilihan.map((p) =>
        p.layerId === layerId ? { ...p, trait: { ...p.trait, id: traitId } } : p,
      ),
    });

    for (const [lainnya, sidik] of petaSidik) {
      if (lainnya !== indeks && sidik === sidikBaru) return true;
    }
    return false;
  };

  const jumlahTerkunci = hasil.item.filter((h) => h.item.dikunci).length;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="inline-flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.28em] text-void-red">
            <span className="h-px w-8 bg-void-red" aria-hidden="true" />
            {t("page.generator.results.kicker")}
          </p>
          <h2 className="mt-2 font-display text-xl font-bold tracking-tight">
            {t("page.generator.results.title")}
          </h2>
          <p className="mt-1 text-xs text-fg-muted">
            {t("page.generator.results.summary", {
              jumlah: new Intl.NumberFormat().format(hasil.item.length),
              lebar: String(hasil.width),
              tinggi: String(hasil.height),
            })}
          </p>
        </div>

        {/* Aksi utama: satu ZIP berisi gambar + metadata. */}
        <button
          type="button"
          onClick={onUnduhZip}
          disabled={mengepak}
          className={`inline-flex shrink-0 items-center gap-2 rounded-xl bg-void-red px-5 py-2.5 text-sm font-semibold text-void-white transition-colors ${
            mengepak ? "cursor-progress opacity-70" : "hover:bg-void-red-deep"
          }`}
        >
          <svg
            viewBox="0 0 24 24"
            className="h-4 w-4 fill-none stroke-current"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12 3v12m0 0 4-4m-4 4-4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
          </svg>
          {mengepak ? t("page.generator.results.zipping") : t("page.generator.results.downloadZip")}
        </button>
      </div>

      {/* Aksi massal. Teks status di kiri menjawab "berapa yang sudah final?" —
          pertanyaan yang muncul terus saat menyunting koleksi besar. */}
      <div className="mt-4 flex flex-wrap items-center gap-2 border-y border-border py-2">
        <span className="text-[11px] text-fg-muted">
          {t("page.generator.results.lockedCount", {
            terkunci: String(jumlahTerkunci),
            total: String(hasil.item.length),
          })}
        </span>

        <div className="ml-auto flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => onKunciSemua(true)}
            className="rounded-lg border border-border px-2.5 py-1 text-[11px] font-medium text-fg-muted transition-colors hover:border-void-red hover:text-void-red"
          >
            {t("page.generator.results.lockAll")}
          </button>
          <button
            type="button"
            onClick={() => onKunciSemua(false)}
            className="rounded-lg border border-border px-2.5 py-1 text-[11px] font-medium text-fg-muted transition-colors hover:border-void-red hover:text-void-red"
          >
            {t("page.generator.results.unlockAll")}
          </button>
          <button
            type="button"
            onClick={onNomoriUlang}
            title={t("page.generator.results.renumberHint")}
            className="rounded-lg border border-border px-2.5 py-1 text-[11px] font-medium text-fg-muted transition-colors hover:border-void-red hover:text-void-red"
          >
            {t("page.generator.results.renumber")}
          </button>
        </div>
      </div>

      <ul className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {hasil.item.map(({ item, url }) => (
          <ResultCard
            key={item.indeks}
            item={item}
            url={url}
            layers={layers}
            menyunting={menyunting === item.indeks}
            terbuka={terbuka === item.indeks}
            onBuka={() => setTerbuka((k) => (k === item.indeks ? null : item.indeks))}
            onKunci={(dikunci) => onKunci(item.indeks, dikunci)}
            onGantiTrait={(layerId, traitId) => onGantiTrait(item.indeks, layerId, traitId)}
            onKerUlang={() => onKerUlang(item.indeks)}
            onBuang={() => onBuang(item.indeks)}
            onUnduh={() => onUnduh(item.indeks)}
            akanKembar={(layerId, traitId) => akanKembar(item.indeks, layerId, traitId)}
          />
        ))}
      </ul>
    </div>
  );
}
