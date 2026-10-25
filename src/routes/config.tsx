import { Suspense } from "react";
import type { ReactNode } from "react";
import type { RouteObject } from "react-router-dom";
import GuestLayout, { GuestErrorPage } from "../layouts/GuestLayout";
import HalamanMemuat from "../pages/HalamanMemuat";
import {
  HomePage,
  CollectionPage,
  NewCollectionPage,
  KaryaPage,
  MintPage,
  StudioPage,
  ReachPage,
  NotFoundPage,
} from "./halaman";

/** Pembungkus kecil: pengganti halaman selama berkasnya masih diunduh. */
const beriFallback = (elemen: ReactNode) => (
  <Suspense fallback={<HalamanMemuat />}>{elemen}</Suspense>
);

/**
 * Daftar rute situs.
 *
 * Struktur bersarang (nested route): halaman-halaman berada di dalam
 * `children` sebuah layout, sehingga otomatis memakai kerangka layout tersebut
 * tanpa perlu menulis navbar/footer di setiap halaman.
 *
 * Alamat memakai bahasa Inggris (/collection, bukan /koleksi) supaya sama
 * dengan label menunya. Alamat yang terlihat pengunjung sebaiknya satu bahasa,
 * apa pun bahasa yang sedang dipilih.
 *
 * Menambah halaman baru: tambahkan satu objek di `children` layout yang sesuai.
 * Layout client dan backoffice ditambahkan setelah sistem akun tersedia.
 *
 * ── /compose SENGAJA DIMATIKAN ─────────────────────────────────────────────
 * Rute Compose tidak didaftarkan, sehingga alamat /compose jatuh ke rute
 * penangkap di bawah dan menampilkan halaman 404. Generator belum siap dilihat
 * publik; mematikannya di sini — satu baris — lebih aman daripada menyembunyikan
 * tautannya saja, karena pengunjung yang mengetik alamat langsung tetap melihat
 * halaman 404, bukan generator setengah jadi.
 *
 * Tautan ke /compose di navbar dan halaman lain sudah berubah menjadi elemen
 * nonaktif (lihat COMPOSE_TERBUKA di src/components/ComposeLink.tsx).
 * Saat generator siap: batalkan komentar satu baris di bawah, dan ubah
 * COMPOSE_TERBUKA menjadi true. Halaman ComposePage masih utuh di src/ —
 * tidak ada yang dihapus.
 *
 * `errorElement` dipasang di root: bila satu halaman melempar galat saat
 * render, yang runtuh hanya isi halaman — navbar dan footer tetap, dan
 * pengunjung melihat halaman galat buatan sendiri, bukan layar bawaan React
 * Router yang menampilkan stack trace.
 */
export const routes: RouteObject[] = [
  {
    path: "/",
    element: <GuestLayout />,
    errorElement: <GuestErrorPage />,
    children: [
      { index: true, element: beriFallback(<HomePage />) },
      { path: "collection", element: beriFallback(<CollectionPage />) },
      // Koleksi terbaru: taxon yang belum terdaftar. Kosong → tombol ke /collection.
      { path: "new-collection", element: beriFallback(<NewCollectionPage />) },
      // Halaman detail satu karya. Alamatnya NFTokenID, bukan nomor edisi —
      // nomor bisa berulang, NFTokenID tidak (lihat KaryaPage.tsx).
      { path: "collection/work/:nftId", element: beriFallback(<KaryaPage />) },
      { path: "collection/mint/:slug", element: beriFallback(<MintPage />) },
      // { path: "compose", element: beriFallback(<ComposePage />) },
      { path: "studio", element: beriFallback(<StudioPage />) },
      { path: "reach", element: beriFallback(<ReachPage />) },
      // Rute penangkap: alamat apa pun yang tidak dikenal tetap memakai navbar
      // dan footer situs, bukan layar galat bawaan React Router.
      { path: "*", element: beriFallback(<NotFoundPage />) },
    ],
  },
];
