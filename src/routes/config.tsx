import type { RouteObject } from "react-router-dom";
import GuestLayout from "../layouts/GuestLayout";
import HomePage from "../pages/guest/home/HomePage";
import CollectionPage from "../pages/guest/collection/CollectionPage";
import MintPage from "../pages/guest/collection/MintPage";
import GeneratePage from "../pages/guest/generate/GeneratePage";
import AboutUsPage from "../pages/guest/about-us/AboutUsPage";
import ContactUsPage from "../pages/guest/contact-us/ContactUsPage";
import NotFoundPage from "../pages/guest/not-found/NotFoundPage";

/**
 * Daftar rute situs.
 *
 * Struktur bersarang (nested route): halaman-halaman berada di dalam
 * `children` sebuah layout, sehingga otomatis memakai kerangka layout tersebut
 * tanpa perlu menulis navbar/footer di setiap halaman.
 *
 * Alamat memakai bahasa Inggris (/collections, bukan /koleksi) supaya sama
 * dengan label menunya. Alamat yang terlihat pengunjung sebaiknya satu bahasa,
 * apa pun bahasa yang sedang dipilih.
 *
 * Menambah halaman baru: tambahkan satu objek di `children` layout yang sesuai.
 * Layout client dan backoffice ditambahkan setelah sistem akun tersedia.
 */
export const routes: RouteObject[] = [
  {
    path: "/",
    element: <GuestLayout />,
    children: [
      { index: true, element: <HomePage /> },
      { path: "collections", element: <CollectionPage /> },
      { path: "collections/mint/:slug", element: <MintPage /> },
      { path: "generate", element: <GeneratePage /> },
      { path: "about-us", element: <AboutUsPage /> },
      { path: "contact-us", element: <ContactUsPage /> },
      // Rute penangkap: alamat apa pun yang tidak dikenal tetap memakai navbar
      // dan footer situs, bukan layar galat bawaan React Router.
      { path: "*", element: <NotFoundPage /> },
    ],
  },
];
