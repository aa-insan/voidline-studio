import { Link, useParams } from "react-router-dom";
import { useLanguage } from "../../../i18n/useLanguage";
import { findCollection } from "../../../data/collections";
import MintEmbed from "../../../components/guest/MintEmbed";
import HalamanBerlatar from "../../../components/guest/HalamanBerlatar";

/**
 * Halaman mint untuk satu koleksi.
 *
 * Alamatnya /collections/mint/:slug — satu halaman per koleksi, dipisah dari
 * halaman daftar supaya pengunjung bisa fokus menyelesaikan mint tanpa
 * terganggu grid karya lain.
 *
 * Koleksi dicari dari slug di alamat. Bila slug tidak dikenal, halaman
 * menampilkan pesan dan jalan kembali, bukan layar kosong — supaya pengunjung
 * tidak buntu saat salah ketik atau mengikuti tautan lama.
 *
 * WARNA
 * Kepala halaman tidak lagi memakai bidang hitam tersendiri: seluruh halaman
 * sudah hitam, jadi yang membedakannya cukup garis pemisah dan jalur merah
 * tipis. Perhatian justru diarahkan ke panel putih kotak mint di bawahnya —
 * satu-satunya benda terang di halaman ini.
 */
export default function MintPage() {
  const { t } = useLanguage();
  const { slug } = useParams();
  const collection = findCollection(slug);

  if (!collection) {
    return (
      <section className="mx-auto max-w-2xl px-5 py-20 text-center">
        <p className="font-display text-5xl font-bold leading-none text-void-red/30" aria-hidden="true">
          404
        </p>
        <h1 className="mt-6 font-display text-2xl font-bold tracking-tight sm:text-3xl">
          {t("collection.notFound.title")}
        </h1>
        <p className="mt-4 leading-relaxed text-fg-muted">
          {t("collection.notFound.subtitle")}
        </p>
        <Link
          to="/collections"
          className="mt-8 inline-block rounded-xl bg-void-red px-6 py-3 text-sm font-semibold text-void-white shadow-brand-md transition-opacity hover:opacity-90"
        >
          {t("collection.back")}
        </Link>
      </section>
    );
  }

  return (
    <HalamanBerlatar>
      {/* Kepala halaman — sekaligus jalan kembali ke daftar. */}
      <section className="relative overflow-hidden border-b border-border">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.16]">
          <div className="absolute -right-1/4 top-0 h-full w-1/2 -rotate-12 bg-linear-to-l from-void-red to-transparent" />
        </div>

        <div className="relative mx-auto max-w-2xl px-5 pb-12 pt-10">
          {/* Jalan kembali — pengunjung yang datang dari daftar koleksi perlu
              bisa mundur tanpa bergantung pada tombol browser. */}
          <Link
            to="/collections"
            className="inline-flex items-center gap-1.5 text-sm text-fg-muted transition-colors hover:text-void-red"
          >
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
              <path d="M15.41 7.41 14 6l-6 6 6 6 1.41-1.41L10.83 12z" />
            </svg>
            {t("collection.back")}
          </Link>

          <p className="mt-8 inline-flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.28em] text-void-red">
            <span className="h-px w-8 bg-void-red" aria-hidden="true" />
            {t("collection.mintLabel")}
          </p>

          <h1 className="mt-4 font-display text-2xl font-bold tracking-tight sm:text-3xl">
            {t(collection.titleKey)}
          </h1>
          <p className="mt-3 leading-relaxed text-fg-muted">
            {t(collection.subtitleKey)}
          </p>
        </div>
      </section>

      {/* Kotak mint milik xrp.cafe — panel putih, satu-satunya benda terang di
          halaman ini. Ditarik sedikit ke atas supaya terasa menempel pada
          kepala halaman, bukan mengambang terpisah. */}
      <section className="mx-auto -mt-6 max-w-2xl px-5 pb-16">
        <MintEmbed collection={collection} />
      </section>
    </HalamanBerlatar>
  );
}
