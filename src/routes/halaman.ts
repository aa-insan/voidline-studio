import { lazy } from "react";

/* =============================================================================
   HALAMAN YANG DIMUAT TERLAMBAT

   Setiap halaman punya berkas JavaScript sendiri dan baru diunduh saat pertama
   kali dibuka. Tanpa pemisahan ini, seluruh situs — termasuk generator yang
   besarnya melebihi semua halaman lain digabung — dimuat utuh oleh pengunjung
   yang hanya mampir ke beranda.

   Dipisah dari routes/config.tsx dalam berkas sendiri karena berkas itu juga
   mengekspor `routes` (data, bukan komponen). Mencampur ekspor komponen dan
   data dalam satu berkas mematikan Fast Refresh saat pengembangan — Vite
   me-reload seluruh halaman alih-alih menyegarkan komponen yang berubah.
   ============================================================================= */

const HomePage = lazy(() => import("../pages/guest/home/HomePage"));
const CollectionPage = lazy(() => import("../pages/guest/collection/CollectionPage"));
const NewCollectionPage = lazy(() => import("../pages/guest/collection/NewCollectionPage"));
const KaryaPage = lazy(() => import("../pages/guest/collection/KaryaPage"));
const MintPage = lazy(() => import("../pages/guest/collection/MintPage"));
const StudioPage = lazy(() => import("../pages/guest/studio/StudioPage"));
const ReachPage = lazy(() => import("../pages/guest/reach/ReachPage"));
const NotFoundPage = lazy(() => import("../pages/guest/not-found/NotFoundPage"));

/* ComposePage sengaja TIDAK diimpor selama rutenya dimatikan. Impor di sini
   akan tetap membundel seluruh generator (63 kB + JSZip 96 kB) sebagai chunk
   yang tidak pernah diminta siapa pun. Saat generator dibuka: tambahkan kembali
   baris lazy untuk ComposePage di sini, ekspornya, dan rutenya di config.tsx. */

export { HomePage, CollectionPage, NewCollectionPage, KaryaPage, MintPage, StudioPage, ReachPage, NotFoundPage };

