/* =============================================================================
   PEMISAH SAAT HALAMAN DIUNDUH

   Halaman dimuat lewat React.lazy, dan selama berkasnya masih diunduh React
   butuh sesuatu untuk ditampilkan. Komponen ini yang mengisi waktu itu.

   Sengaja satu baris teks, tanpa spinner: transisi antarhalaman biasanya
   berlangsung di bawah sepersekian detik. Animasi yang berkedip sepersekian
   detik itu terasa seperti kedipan rusak; kalimat pendek justru terasa seperti
   halaman yang tenang.

   Latar mengikuti dinding situs supaya pergantian halaman tidak terlihat
   sebagai kedipan warna.
   ============================================================================= */

/**
 * Fallback Suspense. Kata sambutannya tidak lewat kamus bahasa: komponen ini
 * tampil sebelum LanguageProvider sempat membaca pilihan bahasa pada
 * kunjungan pertama, dan teks default situs adalah Inggris.
 */
export default function HalamanMemuat() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <p className="sr-only">Loading…</p>
      <span
        aria-hidden="true"
        className="h-6 w-6 animate-spin rounded-full border-2 border-border-strong border-t-accent"
      />
    </div>
  );
}
