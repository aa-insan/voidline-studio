/* =============================================================================
   KARTU LAYER

   Satu kartu = satu tingkat tumpukan. Isinya:
     - nama layer (bisa diganti)
     - tombol urutan: naik/turun, hapus
     - daftar trait beserta bobot rarity-nya
     - kotak untuk menambah gambar

   URUTAN
   Layer di daftar PALING ATAS digambar paling depan, meniru cara kerja alat
   desain (Photoshop, Figma). Ini kebalikan dari urutan data di dalam proyek,
   di mana indeks 0 adalah yang paling belakang. Konversinya dilakukan di sini
   saja, sehingga pengunjung melihat satu aturan: "atas = depan".

   BOBOT RARITY
   Bobot ditampilkan sebagai angka, bukan persentase, karena persentase
   bergantung pada bobot trait LAIN di layer yang sama — angka itu akan berubah
   setiap kali trait baru ditambahkan, dan terlihat seperti bug. Angka bobot
   stabil; persentasenya bisa ditampilkan terpisah saat analitik dibangun.
   ============================================================================= */

import { useState } from "react";
import { useLanguage } from "../../../i18n/useLanguage";
import type { Layer } from "../types";
import Dropzone from "./Dropzone";
import { FORMAT_TRAIT } from "../types";

type Props = {
  layer: Layer;
  /** Posisi di dalam array data (0 = paling belakang). */
  indeks: number;
  totalLayer: number;
  /** Layer ini digambar paling depan? */
  palingDepan: boolean;
  onGantiNama: (nama: string) => void;
  onHapus: () => void;
  onPindah: (arah: -1 | 1) => void;
  onTambahBerkas: (berkas: File[]) => void | Promise<void>;
  onGantiNamaTrait: (traitId: string, nama: string) => void;
  onUbahBobot: (traitId: string, bobot: number) => void;
  onBolakBalikTrait: (traitId: string) => void;
  onHapusTrait: (traitId: string) => void;
};

export default function LayerCard({
  layer,
  indeks,
  totalLayer,
  palingDepan,
  onGantiNama,
  onHapus,
  onPindah,
  onTambahBerkas,
  onGantiNamaTrait,
  onUbahBobot,
  onBolakBalikTrait,
  onHapusTrait,
}: Props) {
  const { t } = useLanguage();
  const [terbuka, setTerbuka] = useState(true);

  const traitAktif = layer.traits.filter((tr) => !tr.excluded).length;

  return (
    <section className="overflow-hidden rounded-xl border border-border bg-surface">
      {/* ── Kepala kartu ─────────────────────────────────────────────────── */}
      <div className="flex items-center gap-2 px-3 py-2.5">
        <button
          type="button"
          onClick={() => setTerbuka((v) => !v)}
          aria-expanded={terbuka}
          aria-label={terbuka ? t("page.generator.layer.collapse") : t("page.generator.layer.expand")}
          className="grid h-7 w-7 shrink-0 place-items-center rounded text-fg-muted transition-colors hover:bg-surface-muted hover:text-fg"
        >
          <svg
            viewBox="0 0 24 24"
            className={`h-3.5 w-3.5 fill-none stroke-current transition-transform ${terbuka ? "rotate-90" : ""}`}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="m9 6 6 6-6 6" />
          </svg>
        </button>

        <input
          value={layer.name}
          onChange={(e) => onGantiNama(e.target.value)}
          aria-label={t("page.generator.layer.nameLabel")}
          className="min-w-0 flex-1 rounded border border-transparent bg-transparent px-1.5 py-1 text-sm font-semibold text-fg outline-none transition-colors hover:border-border focus:border-accent focus:bg-bg"
        />

        <span className="shrink-0 rounded-full bg-surface-muted px-2 py-0.5 text-[10px] font-medium text-fg-muted">
          {traitAktif}/{layer.traits.length}
        </span>

        {/* Urutan: atas = paling depan. Tombol "naik" menggeser layer ini ke
            depan, jadi di dalam data indeksnya BERTAMBAH. */}
        <div className="flex shrink-0 items-center">
          <button
            type="button"
            onClick={() => onPindah(1)}
            disabled={palingDepan}
            title={t("page.generator.layer.moveForward")}
            aria-label={t("page.generator.layer.moveForward")}
            className="grid h-7 w-6 place-items-center rounded text-fg-muted transition-colors hover:bg-surface-muted hover:text-fg disabled:cursor-not-allowed disabled:opacity-30"
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-current" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m6 15 6-6 6 6" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => onPindah(-1)}
            disabled={indeks === 0}
            title={t("page.generator.layer.moveBackward")}
            aria-label={t("page.generator.layer.moveBackward")}
            className="grid h-7 w-6 place-items-center rounded text-fg-muted transition-colors hover:bg-surface-muted hover:text-fg disabled:cursor-not-allowed disabled:opacity-30"
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-current" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="m6 9 6 6 6-6" />
            </svg>
          </button>
        </div>

        <button
          type="button"
          onClick={onHapus}
          title={t("page.generator.layer.delete")}
          aria-label={t("page.generator.layer.delete")}
          className="grid h-7 w-7 shrink-0 place-items-center rounded text-fg-muted transition-colors hover:bg-accent-soft hover:text-accent"
        >
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-none stroke-current" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
          </svg>
        </button>
      </div>

      {terbuka && (
        <div className="border-t border-border px-3 pb-3 pt-3">
          {layer.traits.length === 0 ? (
            <Dropzone
              terima={FORMAT_TRAIT}
              onBerkas={onTambahBerkas}
              judul={t("page.generator.layer.emptyTitle")}
              keterangan={t("page.generator.layer.emptyBody")}
              ringkas
            />
          ) : (
            <>
              <ul className="flex flex-col gap-1.5">
                {layer.traits.map((trait) => (
                  <li
                    key={trait.id}
                    className={`flex items-center gap-2 rounded-lg border px-2 py-1.5 transition-colors ${
                      trait.excluded
                        ? "border-transparent bg-transparent opacity-45"
                        : "border-border bg-bg/40"
                    }`}
                  >
                    <button
                      type="button"
                      onClick={() => onBolakBalikTrait(trait.id)}
                      title={
                        trait.excluded
                          ? t("page.generator.trait.include")
                          : t("page.generator.trait.exclude")
                      }
                      aria-label={
                        trait.excluded
                          ? t("page.generator.trait.include")
                          : t("page.generator.trait.exclude")
                      }
                      aria-pressed={!trait.excluded}
                      className={`grid h-5 w-5 shrink-0 place-items-center rounded border transition-colors ${
                        trait.excluded
                          ? "border-border-strong text-transparent hover:border-accent"
                          : "border-accent bg-accent text-accent-fg"
                      }`}
                    >
                      <svg viewBox="0 0 24 24" className="h-3 w-3 fill-none stroke-current" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="m5 12.5 4.5 4.5L19 6.5" />
                      </svg>
                    </button>

                    <input
                      value={trait.name}
                      onChange={(e) => onGantiNamaTrait(trait.id, e.target.value)}
                      aria-label={t("page.generator.trait.nameLabel")}
                      className="min-w-0 flex-1 rounded border border-transparent bg-transparent px-1 py-0.5 text-xs text-fg outline-none transition-colors hover:border-border focus:border-accent focus:bg-bg"
                    />

                    <label className="flex shrink-0 items-center gap-1" title={t("page.generator.trait.weightHint")}>
                      <span className="sr-only">{t("page.generator.trait.weightLabel")}</span>
                      <input
                        type="number"
                        min={0}
                        step={1}
                        value={trait.weight}
                        onChange={(e) => onUbahBobot(trait.id, Number(e.target.value))}
                        className="w-12 rounded border border-border bg-bg px-1.5 py-0.5 text-right text-xs tabular-nums text-fg outline-none focus:border-accent"
                      />
                    </label>

                    <button
                      type="button"
                      onClick={() => onHapusTrait(trait.id)}
                      title={t("page.generator.trait.delete")}
                      aria-label={t("page.generator.trait.delete")}
                      className="grid h-5 w-5 shrink-0 place-items-center rounded text-fg-muted transition-colors hover:text-accent"
                    >
                      <svg viewBox="0 0 24 24" className="h-3 w-3 fill-none stroke-current" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                        <path d="M6 6l12 12M18 6L6 18" />
                      </svg>
                    </button>
                  </li>
                ))}
              </ul>

              <div className="mt-2">
                <Dropzone
                  terima={FORMAT_TRAIT}
                  onBerkas={onTambahBerkas}
                  judul={t("page.generator.layer.addMore")}
                  ringkas
                />
              </div>
            </>
          )}
        </div>
      )}

      {/* Nomor urut di tepi kanan bawah: satu-satunya penanda posisi tumpukan
          di dalam data. Berguna saat memeriksa hasil ekspor. */}
      <span className="sr-only">
        {t("page.generator.layer.position", { posisi: totalLayer - indeks, total: totalLayer })}
      </span>
    </section>
  );
}
