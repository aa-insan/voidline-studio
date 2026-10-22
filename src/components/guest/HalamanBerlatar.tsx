/* =============================================================================
   HALAMAN BERLATAR — PEMBUNGKUS SATU HALAMAN YANG DIBERI HUJAN GARIS

   Hujan garis adalah latar milik situs, jadi ia harus dipasang dengan cara yang
   sama di setiap halaman — bukan disalin-tempel per halaman. Kalau tiap halaman
   mengurus sendiri, cepat atau lambat ada yang lupa memasang pembungkus
   `relative isolate overflow-hidden`, dan hujannya menembus navbar atau
   memaksa munculnya batang gulir.

   Komponen ini melakukan tiga hal saja:

     1. Membuat kotak relatif yang menahan latar di dalam halaman itu.
     2. Menaruh <LatarHujan /> sebagai lapisan paling belakang.
     3. Menaruh isi halaman di atasnya.

   `overflow-hidden` wajib: hujan menggambar garis sampai ke tepi, dan tanpa
   pemotongan, garis yang keluar dari tepi kanan akan memperlebar halaman dan
   memunculkan batang gulir mendatar.
   ============================================================================= */

import type { ReactNode } from "react";
import LatarHujan from "./LatarHujan";

export default function HalamanBerlatar({ children }: { children: ReactNode }) {
  return (
    // `flex-1` supaya pembungkus ini ikut mengisi sisa tinggi layar. Tanpa itu,
    // halaman yang isinya pendek (Contact Us, 404) berhenti sebelum footer dan
    // hujannya ikut berhenti — menyisakan bidang hitam kosong di bawahnya.
    <div className="relative isolate flex flex-1 flex-col overflow-hidden">
      <LatarHujan />
      {children}
    </div>
  );
}
