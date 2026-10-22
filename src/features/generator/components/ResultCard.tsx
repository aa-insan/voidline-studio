/* =============================================================================
   KARTU HASIL — satu item koleksi, bisa disunting

   Kartu menampilkan gambar dan nomor. Penyuntingan baru muncul saat kartu
   dibuka: menaruh tombol tukar trait, ker ulang, dan buang di setiap kartu
   sekaligus akan membuat grid seratus item menjadi dinding tombol, dan justru
   menyulitkan menemukan item yang ingin diubah.

   ── CARA MENYUNTING ───────────────────────────────────────────────────────
   Klik gambar → panel terbuka. Di sana setiap layer tampil dengan pilihannya;
   memilih trait lain langsung mengganti gambar kartu. Pilihan yang akan
   membuat item kembar ditandai dan tidak bisa dipilih — jauh lebih jelas
   daripada mengklik lalu mendapat pesan error.

   ── KUNCI ─────────────────────────────────────────────────────────────────
   Item terkunci menampilkan pita merah kecil dan semua tombol suntingnya mati.
   Ikon kunci selalu terlihat, supaya status terkunci bisa dibaca tanpa membuka
   kartu — itu inti gunanya kunci: melihat sekilas mana yang sudah final.
   ============================================================================= */

import { useLanguage } from "../../../i18n/useLanguage";
import type { ItemHasil } from "../lib/generate";
import type { Layer } from "../types";

type Props = {
  item: ItemHasil;
  url: string;
  layers: Layer[];
  /** Sedang dirender ulang — kartu diredupkan dan tombol dimatikan. */
  menyunting: boolean;
  /** Apakah kartu ini sedang terbuka untuk disunting. */
  terbuka: boolean;
  onBuka: () => void;
  onKunci: (dikunci: boolean) => void;
  onGantiTrait: (layerId: string, traitId: string) => void;
  onKerUlang: () => void;
  onBuang: () => void;
  onUnduh: () => void;
  /**
   * Cek apakah memilih trait ini akan menghasilkan kembar.
   * Dihitung pemanggil karena butuh seluruh koleksi, bukan satu kartu.
   */
  akanKembar: (layerId: string, traitId: string) => boolean;
};

export default function ResultCard({
  item,
  url,
  layers,
  menyunting,
  terbuka,
  onBuka,
  onKunci,
  onGantiTrait,
  onKerUlang,
  onBuang,
  onUnduh,
  akanKembar,
}: Props) {
  const { t } = useLanguage();
  const nonaktif = item.dikunci || menyunting;

  return (
    <li
      className={`overflow-hidden rounded-xl border bg-surface transition-colors ${
        item.dikunci ? "border-accent/50" : "border-border hover:border-accent/40"
      } ${menyunting ? "opacity-60" : ""}`}
    >
      {/* Gambar — juga tombol untuk membuka penyuntingan. */}
      <button
        type="button"
        onClick={onBuka}
        aria-expanded={terbuka}
        aria-label={t("page.generator.results.editItem", { nama: item.nama })}
        className="group relative block aspect-square w-full bg-panel"
      >
        <img
          src={url}
          alt={item.nama}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-contain"
        />

        {item.dikunci && (
          <span className="absolute left-1.5 top-1.5 inline-flex items-center gap-1 rounded bg-void-red px-1.5 py-0.5 text-[10px] font-semibold text-void-white">
            <svg
              viewBox="0 0 24 24"
              className="h-2.5 w-2.5 fill-current"
              aria-hidden="true"
            >
              <path d="M12 2a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V7a5 5 0 0 0-5-5Zm-3 8V7a3 3 0 1 1 6 0v3H9Z" />
            </svg>
            {t("page.generator.results.locked")}
          </span>
        )}

        <span className="pointer-events-none absolute inset-x-0 bottom-0 flex items-end justify-between bg-linear-to-t from-black/70 to-transparent px-2 pb-1.5 pt-6 opacity-0 transition-opacity group-hover:opacity-100">
          <span className="font-display text-[11px] font-semibold tabular-nums text-void-white">
            #{item.nomor}
          </span>
          <span className="text-[10px] font-medium text-void-white/80">
            {t("page.generator.results.edit")}
          </span>
        </span>
      </button>

      {/* Baris bawah: nomor + kunci + unduh. */}
      <div className="flex items-center gap-1 px-2 py-1.5">
        <span className="min-w-0 flex-1 truncate font-display text-[11px] font-semibold tabular-nums text-fg">
          #{item.nomor}
        </span>

        <button
          type="button"
          onClick={() => onKunci(!item.dikunci)}
          aria-pressed={item.dikunci}
          aria-label={
            item.dikunci ? t("page.generator.results.unlock") : t("page.generator.results.lock")
          }
          title={item.dikunci ? t("page.generator.results.unlock") : t("page.generator.results.lock")}
          className={`grid h-7 w-7 shrink-0 place-items-center rounded-md border transition-colors ${
            item.dikunci
              ? "border-void-red text-void-red"
              : "border-border text-fg-muted hover:border-void-red hover:text-void-red"
          }`}
        >
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current" aria-hidden="true">
            {item.dikunci ? (
              <path d="M12 2a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V7a5 5 0 0 0-5-5Zm-3 8V7a3 3 0 1 1 6 0v3H9Z" />
            ) : (
              <path d="M17 9V7a5 5 0 0 0-9.6-2l1.9.7A3 3 0 0 1 15 7v2H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1Z" />
            )}
          </svg>
        </button>

        <button
          type="button"
          onClick={onUnduh}
          aria-label={t("page.generator.results.downloadOne", { nama: item.nama })}
          title={t("page.generator.results.downloadOne", { nama: item.nama })}
          className="grid h-7 w-7 shrink-0 place-items-center rounded-md border border-border text-fg-muted transition-colors hover:border-void-red hover:text-void-red"
        >
          <svg
            viewBox="0 0 24 24"
            className="h-3.5 w-3.5 fill-none stroke-current"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <path d="M12 3v12m0 0 4-4m-4 4-4-4M4 17v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
          </svg>
        </button>
      </div>

      {/* Panel penyuntingan */}
      {terbuka && (
        <div className="border-t border-border px-2.5 py-2.5">
          <div className="flex gap-1.5">
            <button
              type="button"
              onClick={onKerUlang}
              disabled={nonaktif}
              className="flex-1 rounded-lg border border-border px-2 py-1.5 text-[11px] font-medium text-fg transition-colors hover:border-void-red hover:text-void-red disabled:cursor-not-allowed disabled:opacity-40"
            >
              {t("page.generator.results.reroll")}
            </button>
            <button
              type="button"
              onClick={onBuang}
              disabled={nonaktif}
              className="flex-1 rounded-lg border border-border px-2 py-1.5 text-[11px] font-medium text-fg-muted transition-colors hover:border-void-red hover:text-void-red disabled:cursor-not-allowed disabled:opacity-40"
            >
              {t("page.generator.results.remove")}
            </button>
          </div>

          <div className="mt-2 flex flex-col gap-2">
            {layers.map((layer) => {
              const terpilih = item.pilihan.find((p) => p.layerId === layer.id);
              if (!terpilih) return null;

              return (
                <fieldset key={layer.id} disabled={nonaktif} className="min-w-0">
                  <legend className="mb-1 text-[10px] font-medium uppercase tracking-wider text-fg-muted">
                    {layer.name}
                  </legend>
                  <div className="flex flex-wrap gap-1">
                    {layer.traits
                      .filter((tr) => !tr.excluded && tr.weight > 0)
                      .map((tr) => {
                        const aktif = tr.id === terpilih.trait.id;
                        // Pilihan yang akan membuat item kembar tidak bisa
                        // diklik — mencegah kesalahan sebelum terjadi.
                        const kembar = !aktif && akanKembar(layer.id, tr.id);

                        return (
                          <button
                            key={tr.id}
                            type="button"
                            onClick={() => onGantiTrait(layer.id, tr.id)}
                            disabled={aktif || kembar || nonaktif}
                            title={kembar ? t("page.generator.results.wouldDuplicate") : tr.name}
                            className={`rounded border px-1.5 py-0.5 text-[10px] transition-colors ${
                              aktif
                                ? "border-accent bg-accent text-accent-fg"
                                : kembar
                                  ? "cursor-not-allowed border-border text-fg-muted/40 line-through"
                                  : "border-border text-fg-muted hover:border-accent hover:text-fg"
                            }`}
                          >
                            {tr.name}
                          </button>
                        );
                      })}
                  </div>
                </fieldset>
              );
            })}
          </div>
        </div>
      )}
    </li>
  );
}
