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

   ── SUMBER GAMBAR SAAT INI ─────────────────────────────────────────────────
   Sepuluh baris di bawah memakai GIF yang sudah ada di `src/assets/`, diimpor
   langsung supaya Vite ikut membundelnya (bukan ditaruh di `public/`). Yang
   TIDAK dipakai hanya `Logo.gif` — itu tanda studio, bukan karya.

   ── URUTAN ─────────────────────────────────────────────────────────────────
   Urutan di array = urutan di layar. Taruh yang paling ingin dilihat lebih dulu:
   pengunjung hanya melihat dua-tiga kartu pertama tanpa menggulir ke samping.
   ============================================================================= */

import type { TextKey } from "../i18n/useLanguage";

import blueDarkPurple from "../assets/Blue Dark Purple.gif";
import blueRed from "../assets/Blue Red.gif";
import blueWhite from "../assets/Blue White.gif";
import redBlue from "../assets/Red Blue.gif";
import redDarkGrey from "../assets/Red Dark Grey.gif";
import redWhite from "../assets/Red White.gif";
import whiteBlue from "../assets/White Blue.gif";
import whiteDarkGrey from "../assets/White Dark Grey.gif";
import whiteDarkPurple from "../assets/White Dark Purple.gif";
import whiteRed from "../assets/White Red.gif";

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
 * Sepuluh GIF karya yang tersedia, satu per kartu. Begitu NFTokenID asli
 * tersedia, ganti `gambar` dengan `tokenId` — bentuk barisnya tetap.
 */
export const sorotan: Sorotan[] = [
  { gambar: redDarkGrey, judulKey: "sorotan.1.judul", catatanKey: "sorotan.1.catatan" },
  { gambar: redBlue, judulKey: "sorotan.2.judul", catatanKey: "sorotan.2.catatan" },
  { gambar: blueRed, judulKey: "sorotan.3.judul", catatanKey: "sorotan.3.catatan" },
  { gambar: whiteRed, judulKey: "sorotan.4.judul", catatanKey: "sorotan.4.catatan" },
  { gambar: redWhite, judulKey: "sorotan.5.judul", catatanKey: "sorotan.5.catatan" },
  { gambar: blueWhite, judulKey: "sorotan.6.judul", catatanKey: "sorotan.6.catatan" },
  { gambar: whiteBlue, judulKey: "sorotan.7.judul", catatanKey: "sorotan.7.catatan" },
  { gambar: blueDarkPurple, judulKey: "sorotan.8.judul", catatanKey: "sorotan.8.catatan" },
  { gambar: whiteDarkPurple, judulKey: "sorotan.9.judul", catatanKey: "sorotan.9.catatan" },
  { gambar: whiteDarkGrey, judulKey: "sorotan.10.judul", catatanKey: "sorotan.10.catatan" },
];
