import { Link } from "react-router-dom";
import { useLanguage } from "../../../i18n/useLanguage";
import { collections } from "../../../data/collections";
import HalamanBerlatar from "../../../components/guest/HalamanBerlatar";

/**
 * Halaman daftar koleksi.
 *
 * Menampilkan setiap koleksi sebagai kartu dengan tombol menuju halaman
 * mint-nya. Daftarnya dibaca dari src/data/collections.ts, jadi menambah
 * koleksi baru tidak perlu menyentuh file ini.
 *
 * WARNA
 * Halaman berlatar hitam seperti seluruh situs. Yang menonjol adalah kartu:
 * panel PUTIH dengan teks gelap di dalamnya. Karena itu seluruh teks di dalam
 * kartu memakai keluarga panel-* — bukan fg / fg-muted yang putih dan tidak
 * akan terbaca di atas kertas putih.
 *
 * Kartu tidak bergaris saat diam, lalu bergaris MERAH saat disorot. Pada
 * halaman yang isinya berulang seperti ini, perubahan garis itulah yang
 * menunjukkan kartu mana yang sedang aktif — bukan warnanya.
 *
 * Grid masih berisi teks, bukan gambar karya: gambar NFT belum tersedia.
 * Setelah gambarnya ada, cukup tambahkan satu kolom di data koleksi dan kartu
 * ini menampilkannya.
 */
export default function CollectionPage() {
  const { t } = useLanguage();

  return (
    <HalamanBerlatar>
      <section className="relative mx-auto max-w-6xl px-5 pb-16 pt-14 sm:pb-20 sm:pt-16">
        <header className="max-w-2xl">
          <p className="inline-flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.28em] text-void-red">
            <span className="h-px w-8 bg-void-red" aria-hidden="true" />
            {t("collection.count", { count: collections.length })}
          </p>
          <h1 className="mt-4 font-display text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            {t("page.collection.title")}
          </h1>
          <p className="mt-4 leading-relaxed text-fg-muted">
            {t("page.collection.subtitle")}
          </p>
        </header>

        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {collections.map((collection) => (
            <article
              key={collection.slug}
              className="group flex flex-col overflow-hidden rounded-2xl border-2 border-transparent bg-panel shadow-brand-md transition-colors hover:border-accent"
            >
              {/* Ruang gambar karya — diisi setelah NFT-nya tersedia.
                  Di dalam panel putih, ruang kosong ini dibuat hitam supaya
                  tetap terbaca sebagai "gambar belum ada", bukan sebagai
                  bagian dari kertasnya. */}
              <div className="relative grid aspect-4/3 place-items-center overflow-hidden bg-void-black">
                <div
                  aria-hidden="true"
                  className="absolute -left-1/4 top-0 h-full w-1/2 rotate-12 bg-linear-to-r from-void-red/25 to-transparent"
                />
                <span className="relative text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-void-white/60">
                  {t("collection.imageSoon")}
                </span>
              </div>

              <div className="flex flex-1 flex-col p-5">
                <h2 className="font-display text-lg font-semibold tracking-tight text-panel-fg">
                  {t(collection.titleKey)}
                </h2>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-panel-fg-muted">
                  {t(collection.subtitleKey)}
                </p>

                <Link
                  to={`/collections/mint/${collection.slug}`}
                  className="mt-5 inline-block rounded-xl bg-void-red px-5 py-2.5 text-center text-sm font-semibold text-void-white transition-opacity hover:opacity-90"
                >
                  {t("collection.mintNow")}
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      {/* Catatan standar. Dulunya blok hitam; sekarang tidak perlu bidang
          sendiri karena latarnya sudah hitam — cukup dipisahkan oleh garis. */}
      <section className="relative border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-4 px-5 py-10 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-display text-xs font-semibold uppercase tracking-[0.24em] text-void-red">
              {t("collection.standardLabel")}
            </p>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-fg-muted">
              {t("collection.standardNote")}
            </p>
          </div>
          <Link
            to="/about-us"
            className="inline-flex items-center gap-1.5 whitespace-nowrap text-sm font-semibold text-void-red underline-offset-4 hover:underline"
          >
            {t("collection.standardCta")}
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
              <path d="M9.47 5.47a.75.75 0 0 1 1.06 0l6 6a.75.75 0 0 1 0 1.06l-6 6a.75.75 0 1 1-1.06-1.06L14.19 12 9.47 7.28a.75.75 0 0 1 0-1.06Z" />
            </svg>
          </Link>
        </div>
      </section>
    </HalamanBerlatar>
  );
}
