import { Outlet, useRouteError, isRouteErrorResponse } from "react-router-dom";
import NavbarGuest from "../components/guest/NavbarGuest";
import Footer from "../components/Footer";
import { useLanguage } from "../i18n/useLanguage";
import { useDocumentMeta } from "../i18n/useDocumentMeta";

/* =============================================================================
   LAYOUT PENGUNJUNG

   Kerangka semua halaman publik: navbar di atas, isi halaman di tengah, footer
   di bawah. Halaman dirender lewat <Outlet />, jadi navbar dan footer tidak
   perlu ditulis ulang di setiap halaman.

   #main-content dijadikan wadah berkolom flex supaya halaman yang isinya lebih
   panjang dari layar tetap mendorong footer turun dengan benar.

   SKIP-LINK — tautan "lompat ke isi" adalah elemen pertama di halaman. Tanpa
   ini, pengguna keyboard harus menekan Tab melewati logo, pemilih bahasa, lima
   menu, dan tombol Custom Order di SETIAP halaman sebelum sampai ke isi. Tautan itu
   disembunyikan dengan `sr-only` dan baru muncul saat menerima fokus, jadi
   tidak mengubah tampilan.
   ============================================================================= */

export default function GuestLayout() {
  const { t } = useLanguage();
  useDocumentMeta();

  return (
    <div className="flex min-h-screen flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-3 focus:top-3 focus:z-50 focus:rounded-lg focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-accent-fg"
      >
        {t("nav.skipToContent")}
      </a>
      <NavbarGuest />
      <main id="main-content" className="flex flex-1 flex-col">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

/**
 * Halaman galat saat render melempar.
 *
 * Tanpa `errorElement`, React Router menampilkan layar bawaannya: "Unexpected
 * Application Error" berbahasa Inggris, lengkap dengan stack trace dan saran
 * untuk pengembang. Itu membuat situs tampak rusak dan membocorkan nama berkas
 * internal ke pengunjung. Halaman ini menutup keduanya.
 *
 * Rincian galat sengaja hanya dicatat ke konsol, tidak ditampilkan — pesan asli
 * React bisa memuat potongan data atau jalur berkas.
 */
export function GuestErrorPage() {
  const galat = useRouteError();
  const { t } = useLanguage();

  // 404 yang dilempar loader berakhir di sini juga; pesannya dibedakan supaya
  // pengunjung tidak melihat "terjadi kesalahan" untuk alamat yang salah ketik.
  const tidakDitemukan = isRouteErrorResponse(galat) && galat.status === 404;

  console.error("[Voidline] render gagal:", galat);

  return (
    <div className="flex min-h-screen flex-col">
      <NavbarGuest />
      <main id="main-content" className="wadah flex flex-1 flex-col justify-center py-24 text-center">
        <p className="font-display text-6xl font-bold leading-none text-void-red/30 sm:text-7xl" aria-hidden="true">
          {tidakDitemukan ? "404" : "!"}
        </p>
        <h1 className="judul-bagian mt-6">
          {tidakDitemukan ? t("page.notFound.title") : t("page.error.title")}
        </h1>
        <p className="mx-auto mt-4 max-w-md leading-relaxed text-fg-muted">
          {tidakDitemukan ? t("page.notFound.body") : t("page.error.body")}
        </p>
        <div className="mt-8 flex justify-center">
          <a href="/" className="tombol tombol-merah">
            {t("page.error.home")}
          </a>
        </div>
      </main>
      <Footer />
    </div>
  );
}
