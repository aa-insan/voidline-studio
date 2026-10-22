/* =============================================================================
   SOROTAN — KARYA PILIHAN YANG TAMPIL DI HALAMAN ATRIUM

   Satu album bisa berisi ratusan karya, tapi yang dipajang di beranda hanya
   beberapa. Daftar inilah yang menentukan mana yang tampil.

   ── YANG DISIMPAN HANYA IDENTITAS, BUKAN GAMBAR ─────────────────────────────
   Tiap baris cukup menyimpan `tokenId` (NFTokenID dari XRP Ledger) atau `gambar`
   (alamat gambar). Gambar aslinya TIDAK ikut masuk ke situs — kalau semua karya
   disalin ke sini, halaman beranda berubah menjadi album foto dan beratnya
   meledak.

   Dengan `tokenId`, gambar diambil dari metadata NFT itu sendiri di ledger, jadi
   yang tersimpan di sini hanya beberapa puluh karakter per karya.

   ── CARA MENGISI SAAT ALBUM SUDAH RILIS ────────────────────────────────────
     1. Buka NFT-nya di xrp.cafe, salin NFTokenID (64 karakter heksadesimal).
     2. Ganti nilai `tokenId` di bawah. Biarkan `gambar` kosong.
     3. Simpan. Tidak ada kode lain yang perlu disentuh.

   Selama `gambar` masih berisi alamat, situs memakai gambar itu — berguna
   sebelum album rilis, atau untuk pratinjau karya yang belum di-mint.

   ── URUTAN ─────────────────────────────────────────────────────────────────
   Urutan di array = urutan di layar. Taruh yang paling ingin dilihat lebih dulu:
   pengunjung hanya melihat dua-tiga kartu pertama tanpa menggulir ke samping.

   ── MENGAPA `sorotan` DIISI CONTOH ────────────────────────────────────────
   Album baru rilis hari Minggu, jadi belum ada NFTokenID yang bisa dipakai.
   Sepuluh baris di bawah adalah contoh bentuk data — ganti seluruhnya begitu
   ID asli tersedia. Tidak ada yang menandai ini sebagai contoh di layar, jadi
   jangan rilis situs dengan data contoh masih terpasang.
   ============================================================================= */

import type { TextKey } from "../i18n/useLanguage";

export type Sorotan = {
  /** NFTokenID (64 heksadesimal). Kosongkan kalau karya belum di-mint. */
  tokenId?: string;
  /** Alamat gambar. Dipakai selama `tokenId` belum ada. */
  gambar?: string;
  /** Kunci judul di kamus bahasa. */
  judulKey: TextKey;
  /** Kunci keterangan singkat — mis. "1 of 1", "Legendary". */
  catatanKey: TextKey;
};

/**
 * Karya yang dipajang di beranda.
 *
 * CATATAN: isi saat ini adalah contoh. Lihat komentar di atas.
 */
export const sorotan: Sorotan[] = [
  { gambar: "contoh-1", judulKey: "sorotan.1.judul", catatanKey: "sorotan.1.catatan" },
  { gambar: "contoh-2", judulKey: "sorotan.2.judul", catatanKey: "sorotan.2.catatan" },
  { gambar: "contoh-3", judulKey: "sorotan.3.judul", catatanKey: "sorotan.3.catatan" },
  { gambar: "contoh-4", judulKey: "sorotan.4.judul", catatanKey: "sorotan.4.catatan" },
  { gambar: "contoh-5", judulKey: "sorotan.5.judul", catatanKey: "sorotan.5.catatan" },
  { gambar: "contoh-6", judulKey: "sorotan.6.judul", catatanKey: "sorotan.6.catatan" },
  { gambar: "contoh-7", judulKey: "sorotan.7.judul", catatanKey: "sorotan.7.catatan" },
  { gambar: "contoh-8", judulKey: "sorotan.8.judul", catatanKey: "sorotan.8.catatan" },
];
