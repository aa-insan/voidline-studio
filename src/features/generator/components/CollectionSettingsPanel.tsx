/* =============================================================================
   PENGATURAN KOLEKSI

   Nama koleksi, jumlah edition, dan nomor awal. Ketiganya memengaruhi
   penamaan item dan isi metadata, jadi ditampilkan bersamaan di satu tempat
   agar pengunjung melihat akibatnya sekaligus.

   NOMOR AWAL
   Nomor awal ada karena drop sering dibuat bertahap: drop pertama #1–#100,
   drop kedua mulai #101. Tanpa kolom ini, setiap kali melanjutkan drop,
   penomoran dimulai dari 1 lagi dan nama NFT jadi kembar.

   BATAS EDITION
   Input dibatasi angka positif. Batas atas tidak dikunci — mesin generate
   akan memberi peringatan sendiri untuk jumlah besar, karena batas yang
   terlalu rendah menghalangi koleksi besar, sedangkan batas yang terlalu
   tinggi bisa membuat tab macet tanpa penjelasan.
   ============================================================================= */

import { useLanguage } from "../../../i18n/useLanguage";
import { UKURAN_KELUARAN, type CollectionSettings, type UkuranKeluaran } from "../types";

type Props = {
  pengaturan: CollectionSettings;
  /** Jumlah trait aktif per layer, untuk menghitung kombinasi yang mungkin. */
  traitPerLayer: number[];
  onUbah: (perubahan: Partial<CollectionSettings>) => void;
};

export default function CollectionSettingsPanel({ pengaturan, traitPerLayer, onUbah }: Props) {
  const { t } = useLanguage();

  return (
    <section className="rounded-xl border border-border bg-surface p-4">
      <h2 className="font-display text-sm font-semibold tracking-tight text-fg">
        {t("page.generator.settings.title")}
      </h2>

      <div className="mt-4 flex flex-col gap-3.5">
        <label className="flex flex-col gap-1.5">          <span className="text-[11px] font-medium uppercase tracking-wider text-fg-muted">
            {t("page.generator.settings.collectionName")}
          </span>
          <input
            value={pengaturan.name}
            onChange={(e) => onUbah({ name: e.target.value })}
            placeholder={t("page.generator.settings.collectionNamePlaceholder")}
            className="rounded-lg border border-border bg-bg px-3 py-2 text-sm text-fg outline-none transition-colors placeholder:text-fg-muted/60 focus:border-accent"
          />
          <span className="text-[11px] text-fg-muted">
            {t("page.generator.settings.namePreview", {
              contoh: `${pengaturan.name.trim() || t("page.generator.settings.untitled")} #${pengaturan.startTokenId}`,
            })}
          </span>
        </label>

        <div className="grid grid-cols-2 gap-3">
          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] font-medium uppercase tracking-wider text-fg-muted">
              {t("page.generator.settings.editionSize")}
            </span>
            <input
              type="number"
              min={1}
              max={100000}
              value={pengaturan.editionSize}
              onChange={(e) => {
                const angka = Number(e.target.value);
                onUbah({ editionSize: Number.isFinite(angka) ? Math.max(1, Math.min(100000, Math.round(angka))) : 1 });
              }}
              className="rounded-lg border border-border bg-bg px-3 py-2 text-sm tabular-nums text-fg outline-none transition-colors focus:border-accent"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-[11px] font-medium uppercase tracking-wider text-fg-muted">
              {t("page.generator.settings.startTokenId")}
            </span>
            <input
              type="number"
              min={1}
              max={1000000}
              value={pengaturan.startTokenId}
              onChange={(e) => {
                const angka = Number(e.target.value);
                onUbah({ startTokenId: Number.isFinite(angka) ? Math.max(1, Math.min(1000000, Math.round(angka))) : 1 });
              }}
              className="rounded-lg border border-border bg-bg px-3 py-2 text-sm tabular-nums text-fg outline-none transition-colors focus:border-accent"
            />
          </label>
        </div>

        {/* ── Ukuran keluaran ─────────────────────────────────────────────
            Empat tombol, bukan kotak angka bebas. Ukuran NFT yang aneh (mis.
            837 px) tidak berguna — marketplace menampilkannya di kotak
            persegi tetap — jadi pilihan dikunci ke ukuran yang memang lazim
            dipakai. */}
        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] font-medium uppercase tracking-wider text-fg-muted">
            {t("page.generator.settings.outputSize")}
          </span>

          <div className="grid grid-cols-4 gap-1.5" role="group" aria-label={t("page.generator.settings.outputSize")}>
            {UKURAN_KELUARAN.map((sisi) => {
              const aktif = pengaturan.outputSize === sisi;
              return (
                <button
                  key={sisi}
                  type="button"
                  aria-pressed={aktif}
                  onClick={() => onUbah({ outputSize: sisi as UkuranKeluaran })}
                  className={`rounded-lg border px-1 py-1.5 text-xs font-medium tabular-nums transition-colors ${
                    aktif
                      ? "border-accent bg-accent-soft text-fg"
                      : "border-border bg-bg text-fg-muted hover:border-border-strong hover:text-fg"
                  }`}
                >
                  {sisi}
                </button>
              );
            })}
          </div>

          <span className="text-[11px] text-fg-muted">
            {t("page.generator.settings.outputSizeHint", {
              sisi: String(pengaturan.outputSize),
            })}
          </span>
        </div>

        <CombinasiInfo
          traitPerLayer={traitPerLayer}
          editionSize={pengaturan.editionSize}
        />
      </div>
    </section>
  );
}

/**
 * Menghitung dan menampilkan jumlah kombinasi unik yang mungkin.
 *
 * Perkalian jumlah trait aktif per layer. Hasilnya dihitung dengan Batas
 * `Number.MAX_SAFE_INTEGER` supaya tidak meluap menjadi Infinity saat
 * layer-nya banyak — angka tak hingga tidak berguna untuk dibandingkan.
 */
function CombinasiInfo({
  traitPerLayer,
  editionSize,
}: {
  traitPerLayer: number[];
  editionSize: number;
}) {
  const { t } = useLanguage();

  if (traitPerLayer.length === 0) {
    return (
      <p className="rounded-lg border border-border px-3 py-2 text-[11px] leading-relaxed text-fg-muted">
        {t("page.generator.settings.noLayers")}
      </p>
    );
  }

  if (traitPerLayer.some((n) => n === 0)) {
    return (
      <p className="rounded-lg border border-accent/40 bg-accent-soft px-3 py-2 text-[11px] leading-relaxed text-fg">
        {t("page.generator.settings.layerEmpty")}
      </p>
    );
  }

  const kombinasi = traitPerLayer.reduce(
    (hasil, n) => Math.min(hasil * n, Number.MAX_SAFE_INTEGER),
    1,
  );

  const TAMPIL = new Intl.NumberFormat();

  // Cukup untuk semua edition?
  const cukup = kombinasi >= editionSize;

  return (
    <p
      className={`rounded-lg border px-3 py-2 text-[11px] leading-relaxed ${
        cukup
          ? "border-border text-fg-muted"
          : "border-accent/40 bg-accent-soft text-fg"
      }`}
    >
      {cukup
        ? t("page.generator.settings.combinations", { jumlah: TAMPIL.format(kombinasi) })
        : t("page.generator.settings.combinationsShort", { jumlah: TAMPIL.format(kombinasi) })}
    </p>
  );
}
