/* =============================================================================
   TAUTAN KE HALAMAN COMPOSE

   Generator (/compose) belum siap untuk publikasi. Komponen ini memastikan
   semua tautan ke sana konsisten — baik saat aktif maupun saat dimatikan.

   Saat COMPOSE_TERBUKA = false:
     - Semua tautan ke /compose tampil nonaktif: setengah transparan, tidak
       bisa diklik, dan dibacakan pembaca layar sebagai "tidak tersedia".
     - Mengetik alamat /compose langsung tetap jatuh ke halaman 404, karena
       rutenya tidak terdaftar di router (lihat src/routes/config.tsx).

   Saat generator siap: set COMPOSE_TERBUKA = true di sini dan daftarkan ulang
   rutenya di src/routes/config.tsx — halaman ComposePage tidak dihapus.
   ============================================================================= */

import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../i18n/useLanguage";

/** Hidupkan generator: ubah false → true, lalu hidupkan rute yang dikomentari
 *  di src/routes/config.tsx. */
export const COMPOSE_TERBUKA = false;

type Props = {
  /** Kelas Tailwind yang sama dengan tombol aslinya, supaya wajahnya tidak
   *  berubah antara aktif dan nonaktif. */
  className: string;
  /** Isi tautan: label tombol, bisa teks biasa maupun anak elemen. */
  children: ReactNode;
};

export default function ComposeLink({ className, children }: Props) {
  const { t } = useLanguage();

  if (COMPOSE_TERBUKA) {
    return (
      <Link to="/compose" className={className}>
        {children}
      </Link>
    );
  }

  // `aria-disabled` dipilih, bukan atribut `disabled`: elemen tetap bisa
  // difokus Tab sehingga pengguna keyboard tetap tahu tombol itu ada — dan
  // pembaca layar menyebutnya "tidak tersedia", bukan diam-diam melewatkannya.
  // `pointer-events-none` menutup klik dan hover; opacity menandai nonaktif.
  return (
    <button
      type="button"
      aria-disabled="true"
      title={t("nav.composeComingSoon")}
      className={`${className} cursor-not-allowed opacity-50`}
    >
      {children}
    </button>
  );
}
