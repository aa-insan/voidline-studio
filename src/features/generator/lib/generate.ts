/* =============================================================================
   MESIN GENERATE — memilih trait untuk setiap item koleksi

   Tugasnya satu: menentukan, untuk sejumlah edition, trait mana yang dipakai di
   setiap layer — tanpa pernah menghasilkan dua kombinasi yang sama.

   ── PEMILIHAN BERBOBOT ────────────────────────────────────────────────────
   Tiap trait punya bobot. Peluang terpilih = bobotnya dibagi total bobot trait
   aktif di layer yang sama. Bobot 1 dan 3 berarti yang kedua muncul tiga kali
   lebih sering. Pengunjung tidak perlu membuat totalnya 100 — normalisasi
   terjadi di sini.

   ── KOMBINASI KEMBAR ──────────────────────────────────────────────────────
   Setiap kombinasi dicatat sebagai "sidik" — daftar id trait yang diurutkan,
   sehingga urutan layer yang berbeda tidak membuat sidik yang sama dianggap
   berbeda. Sidik yang sudah dipakai ditolak.

   DUA CARA MEMILIH, DIPAKAI BERGANTIAN
   1. Undian berulang (cara utama). Cepat dan menghasilkan distribusi yang
      mengikuti bobot. Cocok selama ruang kombinasi masih jauh lebih besar
      daripada jumlah edition.
   2. Enumerasi sisa kombinasi (cadangan). Dipakai hanya ketika undian gagal
      berkali-kali — tanda bahwa hampir semua kombinasi sudah terpakai, mis.
      edition 98 dari 100 kombinasi. Undian murni di titik ini bisa gagal
      walaupun kombinasi yang tersisa ada, karena peluang menebak yang belum
      dipakai mengecil. Enumerasi menghitung sisanya secara pasti.

   MENGAPA TIDAK MEMAKSA
   Bila kombinasi benar-benar tidak cukup, mesin berhenti dan melapor. Koleksi
   dengan item kembar secara teknis masih bisa di-mint, tetapi nilainya rusak
   dan baru ketahuan setelah terunggah ke rantai. Lebih baik gagal di sini —
   sebelum ada yang dibayar.
   ============================================================================= */

import type { Layer, Trait } from "../types";

/** Satu pilihan pada satu layer untuk satu item. */
export type Pilihan = {
  layerId: string;
  /** Nama layer — nanti menjadi `trait_type` di metadata. */
  layerNama: string;
  trait: Trait;
};

/** Satu item koleksi yang sudah tersusun. */
export type ItemHasil = {
  /** Indeks 0..n-1 di dalam koleksi. */
  indeks: number;
  /** Nomor token yang tampil di nama, sudah termasuk nomor awal. */
  nomor: number;
  nama: string;
  /** Pilihan per layer, urut dari paling belakang ke paling depan. */
  pilihan: Pilihan[];
  /** Sidik kombinasi — dipakai untuk mendeteksi kembar. */
  sidik: string;
  /**
   * Item dikunci: tidak ikut berubah saat item lain diacak ulang.
   *
   * Disimpan di item, bukan di daftar terpisah, supaya tidak ada dua catatan
   * yang bisa berselisih — item terkunci yang tidak ada di daftar kunci akan
   * menjadi bug yang sulit dilacak.
   */
  dikunci: boolean;
};

/** Hasil generate: daftar item, atau alasan gagal. */
export type HasilGenerate =
  | { sukses: true; item: ItemHasil[] }
  | { sukses: false; alasan: "kombinasiKurang"; tersedia: number; diminta: number };

/**
 * Berapa kali undian diulang sebelum beralih ke enumerasi.
 *
 * 40 cukup untuk kasus normal (ruang kombinasi jauh lebih besar), dan cukup
 * kecil untuk tidak membuang waktu saat ruangnya sempit — enumerasi yang
 * mengambil alih.
 */
const MAKS_UNDIAN = 40;

/**
 * Batas ukuran ruang kombinasi yang boleh dienumerasi.
 *
 * Enumerasi hanya dipakai saat hampir semua kombinasi terpakai, jadi ruangnya
 * pasti tidak jauh lebih besar dari jumlah edition. Batas ini menjaga agar
 * tidak ada loop raksasa bila asumsi itu keliru.
 */
const BATAS_ENUMERASI = 200_000;

/** Trait yang ikut diundi: tidak dikecualikan dan bobotnya positif. */
const traitAktif = (traits: Trait[]): Trait[] =>
  traits.filter((t) => !t.excluded && t.weight > 0);

/**
 * Memilih satu trait berdasarkan bobot.
 *
 * Dipisah supaya mudah diuji. Bila total bobot nol (seharusnya tidak terjadi —
 * daftar sudah disaring), fungsi memilih acak seragam agar tidak macet di satu
 * trait yang sama terus.
 */
export function pilihBerbobot(daftar: Trait[], acak: () => number): Trait {
  const total = daftar.reduce((s, t) => s + t.weight, 0);
  if (total <= 0) return daftar[Math.floor(acak() * daftar.length)] ?? daftar[0];

  let sisa = acak() * total;
  for (const trait of daftar) {
    sisa -= trait.weight;
    if (sisa < 0) return trait;
  }
  // Pembulatan floating point bisa menyisakan sisa ≈ 0 di trait terakhir.
  return daftar[daftar.length - 1];
}

/** Sidik kombinasi — urutan pilihan tidak memengaruhi. */
export const buatSidik = (traitIds: string[]): string => [...traitIds].sort().join("|");

/**
 * Berapa banyak kombinasi unik yang mungkin dari susunan layer.
 *
 * Produk dari jumlah trait aktif per layer, dibatasi MAX_SAFE_INTEGER supaya
 * tidak menjadi Infinity. Layer tanpa trait aktif membuat hasilnya 0.
 */
export function hitungKombinasi(layers: Layer[]): number {
  let total = 1;
  for (const layer of layers) {
    const jumlah = traitAktif(layer.traits).length;
    if (jumlah === 0) return 0;
    total = Math.min(total * jumlah, Number.MAX_SAFE_INTEGER);
  }
  return total;
}

/**
 * Menyusun satu kombinasi acak berbobot dari susunan layer.
 *
 * Dipakai mesin generate DAN penyuntingan hasil (`ker ulang`, `buang item`),
 * supaya trait langka tetap langka di semua jalur — bukan hanya saat pertama
 * kali di-generate.
 */
export function acakKombinasi(layers: Layer[], aktif: Trait[][], acak: () => number): Pilihan[] {
  return aktif.map((daftar, i) => ({
    layerId: layers[i].id,
    layerNama: layers[i].name,
    trait: pilihBerbobot(daftar, acak),
  }));
}

/** Menyusun satu kombinasi dari indeks bilangan campuran. */
function kombinasiDariIndeks(aktif: Trait[][], indeks: number): Trait[] {
  // Bobot posisi: layer terakhir paling cepat berubah.
  const hasil: Trait[] = new Array(aktif.length);
  let sisa = indeks;
  for (let i = aktif.length - 1; i >= 0; i--) {
    const n = aktif[i].length;
    hasil[i] = aktif[i][sisa % n];
    sisa = Math.floor(sisa / n);
  }
  return hasil;
}

/**
 * Mencari kombinasi yang belum dipakai dengan menghitung seluruh ruang.
 *
 * Urutan acak dipakai supaya item terakhir tetap terasa acak, bukan selalu
 * kombinasi sisa di ujung perhitungan. Mengembalikan `null` bila ruangnya
 * terlalu besar untuk dienumerasi atau memang sudah habis.
 */
function cariMelaluiEnumerasi(
  aktif: Trait[][],
  dipakai: Set<string>,
  acak: () => number,
): Trait[] | null {
  const ukuran = aktif.reduce((s, daftar) => s * daftar.length, 1);
  if (ukuran > BATAS_ENUMERASI) return null;

  const urutan = Array.from({ length: ukuran }, (_, i) => i);
  // Fisher–Yates: tanpa ini, sisa kombinasi selalu yang di ujung atas.
  for (let i = urutan.length - 1; i > 0; i--) {
    const j = Math.floor(acak() * (i + 1));
    [urutan[i], urutan[j]] = [urutan[j], urutan[i]];
  }

  for (const indeks of urutan) {
    const kombinasi = kombinasiDariIndeks(aktif, indeks);
    if (!dipakai.has(buatSidik(kombinasi.map((t) => t.id)))) return kombinasi;
  }
  return null;
}

/**
 * Menyusun koleksi.
 *
 * `layers` dipakai apa adanya — trait yang dikecualikan atau berbobot nol
 * disaring di dalam, sehingga pemanggil tidak perlu menyiapkan dua daftar.
 *
 * `acak` bisa diganti agar hasilnya bisa diulang saat pengujian.
 */
export function susunKoleksi(
  layers: Layer[],
  jumlahEdition: number,
  nomorAwal: number,
  namaKoleksi: string,
  acak: () => number = Math.random,
): HasilGenerate {
  const aktif = layers.map((layer) => traitAktif(layer.traits));
  const tersedia = hitungKombinasi(layers);

  // Layer tanpa trait aktif, atau kombinasi lebih sedikit dari edition yang
  // diminta. Keduanya berarti permintaan tidak bisa dipenuhi.
  if (aktif.some((daftar) => daftar.length === 0) || tersedia < jumlahEdition) {
    return { sukses: false, alasan: "kombinasiKurang", tersedia, diminta: jumlahEdition };
  }

  const dipakai = new Set<string>();
  const item: ItemHasil[] = [];
  const namaDasar = namaKoleksi.trim() || "Untitled";

  for (let i = 0; i < jumlahEdition; i++) {
    let kombinasi: Trait[] | null = null;
    let sidik = "";

    for (let undian = 0; undian < MAKS_UNDIAN; undian++) {
      const calon = aktif.map((daftar) => pilihBerbobot(daftar, acak));
      const calonSidik = buatSidik(calon.map((t) => t.id));
      if (!dipakai.has(calonSidik)) {
        kombinasi = calon;
        sidik = calonSidik;
        break;
      }
    }

    // Undian gagal berkali-kali: ruang kombinasi hampir habis. Hitung sisanya.
    if (!kombinasi) {
      kombinasi = cariMelaluiEnumerasi(aktif, dipakai, acak);
      if (kombinasi) sidik = buatSidik(kombinasi.map((t) => t.id));
    }

    if (!kombinasi) {
      return { sukses: false, alasan: "kombinasiKurang", tersedia, diminta: jumlahEdition };
    }

    dipakai.add(sidik);
    const nomor = nomorAwal + i;
    item.push({
      indeks: i,
      nomor,
      nama: `${namaDasar} #${nomor}`,
      pilihan: kombinasi.map((trait, indeksLayer) => ({
        layerId: layers[indeksLayer].id,
        layerNama: layers[indeksLayer].name,
        trait,
      })),
      sidik,
      dikunci: false,
    });
  }

  return { sukses: true, item };
}
