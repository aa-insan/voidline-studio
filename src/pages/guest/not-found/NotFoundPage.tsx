/* =============================================================================
   HALAMAN 404

   Ditampilkan untuk alamat apa pun yang tidak dikenal — termasuk tautan lama
   yang sudah dipindahkan. Tanpa halaman ini, React Router menampilkan layar
   galat bawaannya yang berbahasa Inggris, bertuliskan "Unexpected Application
   Error", lengkap dengan saran untuk pengembang. Itu terlihat seperti situs
   yang rusak, padahal yang terjadi hanya alamat yang salah.

   WARNA
   Mengikuti pola halaman mint yang tidak ditemukan: angka 404 besar berwarna
   merah redup sebagai latar visual, teks di atasnya, lalu satu jalan keluar.
   ============================================================================= */

import { Link } from "react-router-dom";
import { useLanguage } from "../../../i18n/useLanguage";
import HalamanBerlatar from "../../../components/guest/HalamanBerlatar";

export default function NotFoundPage() {
  const { t } = useLanguage();

  return (
    <HalamanBerlatar>
      {/* min-h supaya hujan mengisi seluruh layar walau isinya pendek: 404 yang
          hanya sepertiga layar akan menyisakan latar kosong di bawahnya. */}
      <section className="mx-auto flex min-h-[70vh] max-w-2xl flex-col justify-center px-5 py-24 text-center">
        <p
          className="font-display text-6xl font-bold leading-none text-void-red/30 sm:text-7xl"
          aria-hidden="true"
        >
          404
        </p>

        <h1 className="mt-6 font-display text-2xl font-bold tracking-tight sm:text-3xl">
          {t("page.notFound.title")}
        </h1>

        <p className="mx-auto mt-4 max-w-md leading-relaxed text-fg-muted">
          {t("page.notFound.body")}
        </p>

        <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            to="/"
            className="inline-flex items-center justify-center rounded-xl bg-void-red px-6 py-3 text-sm font-semibold text-void-white transition-colors hover:bg-void-red-deep"
          >
            {t("page.notFound.home")}
          </Link>
          <Link
            to="/compose"
            className="inline-flex items-center justify-center rounded-xl border border-border-strong px-6 py-3 text-sm font-semibold text-fg transition-colors hover:border-void-red hover:text-void-red"
          >
            {t("page.notFound.generate")}
          </Link>
        </div>
      </section>
    </HalamanBerlatar>
  );
}
