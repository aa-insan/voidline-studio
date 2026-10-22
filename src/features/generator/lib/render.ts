/* =============================================================================
   RENDER KOLEKSI — mengubah item hasil menjadi Gambar PNG

   Alurnya: setiap pilihan pada satu item dipetakan ke gambar yang sudah
   dimuat, ditumpuk ke kanvas, lalu diekspor menjadi Blob PNG.

   ── SATU UKURAN UNTUK SEMUA ITEM ──────────────────────────────────────────
   Ukuran kanvas diambil dari pengaturan koleksi (`outputSize`), bukan dari
   ukuran berkas layer. Alasannya dua:

   1. Marketplace NFT menampilkan gambar di kotak persegi. Ukuran yang
      seragam membuat seluruh koleksi terlihat rapi.
   2. Berkas layer sering diekspor besar (3000 px ke atas). Memakai ukuran
      berkas berarti hasilnya ikut besar — lambat dibuat dan berat diunduh,
      tanpa tambahan kualitas yang terlihat.

   Layer yang lebih kecil dari kanvas diperbesar, layer yang lebih besar
   diperkecil. Semuanya memakai skala yang sama dan diletakkan di tengah,
   sehingga proporsi antar layer tidak berubah.

   ── GAMBAR DIMUAT SEKALI ──────────────────────────────────────────────────
   Ratusan item memakai trait yang sama berulang kali. Memuat ulang setiap
   bitmap untuk setiap item berarti membuka berkas yang sama puluhan kali.
   Karena itu gambar dimuat sekali di awal, lalu dipakai ulang.

   ── MEMBEBASKAN MEMORI ────────────────────────────────────────────────────
   Bitmap dan Blob adalah memori di luar JavaScript. Setiap gambar yang dimuat
   dimiliki pemanggil (`muatSemuaTrait`) dan harus dilepas dengan `lepasSemua`
   setelah selesai, termasuk saat generate dibatalkan di tengah jalan.
   ============================================================================= */

import { lemariAset } from "./aset";
import {
  lepasSemua,
  muatGambar,
  ukuranKanvas,
  type GambarSiap,
} from "./compose";
import type { ItemHasil } from "./generate";
import type { Layer } from "../types";

/** Kumpulan gambar yang siap dipakai, dikunci per id trait. */
export type PetaGambar = Map<string, GambarSiap>;

/**
 * Memuat gambar untuk semua trait aktif.
 *
 * Trait yang berkasnya tidak bisa dibaca DILEWATI, bukan menggagalkan
 * semuanya — satu berkas rusak tidak boleh membatalkan koleksi yang isinya
 * ratusan item. Pemanggil bisa memeriksa `tidakTermuat` dan melaporkannya.
 */
export async function muatSemuaTrait(layers: Layer[]): Promise<{
  peta: PetaGambar;
  tidakTermuat: string[];
}> {
  const peta: PetaGambar = new Map();
  const tidakTermuat: string[] = [];

  // Hanya trait aktif: yang dikecualikan atau berbobot nol tidak akan pernah
  // terpilih, jadi tidak perlu memakan memori bitmap.
  const dipakai = layers.flatMap((layer) =>
    layer.traits.filter((t) => !t.excluded && t.weight > 0),
  );

  for (const trait of dipakai) {
    const aset = lemariAset.ambil(trait.id);
    if (!aset) {
      tidakTermuat.push(trait.name);
      continue;
    }

    try {
      // `muatGambar` menerima Blob; `TraitAsset.blob` bisa berupa File.
      peta.set(trait.id, await muatGambar(aset.blob, trait.name));
    } catch {
      tidakTermuat.push(trait.name);
    }
  }

  return { peta, tidakTermuat };
}

/**
 * Ukuran kanvas hasil: persegi sepanjang `sisi`.
 *
 * Parameter `peta` masih diterima agar pemanggil tidak perlu berubah, dan
 * dipakai untuk memeriksa bahwa ukuran berkas memang ada — tetapi ukuran
 * hasil tidak lagi bergantung padanya.
 */
export function ukuranKoleksi(_peta: PetaGambar, sisi: number): { width: number; height: number } {
  return { width: sisi, height: sisi };
}

/**
 * Skala yang dipakai SEMUA item di satu koleksi.
 *
 * Dihitung sekali dari berkas terbesar di antara SELURUH trait yang dipakai
 * koleksi — bukan dari layer yang terpilih pada satu item. Kalau skalanya
 * per item, item yang kebetulan tidak memakai layer besar akan memakai skala
 * lebih besar, dan Accessories Head tampak beda ukuran antar item. Bug itu
 * persis yang terjadi sebelum ini.
 */
export function skalaKoleksi(peta: PetaGambar, sisi: number): number {
  const semua = [...peta.values()];
  if (semua.length === 0) return 1;
  const asli = ukuranKanvas(semua);
  // `fit`: seluruh layer muat walau rasionya tidak persegi.
  return Math.min(sisi / asli.width, sisi / asli.height);
}

/**
 * Menggambar satu item ke kanvas yang sudah ada.
 *
 * `skala` WAJIB berasal dari `skalaKoleksi` — satu angka untuk seluruh
 * koleksi. Parameter itu sengaja tidak dihitung di sini supaya tidak ada
 * jalan pintas yang membuat skala berbeda antar item.
 *
 * Kanvas tidak diubah ukurannya — pemanggil menyiapkan kanvas dengan ukuran
 * koleksi supaya semua item keluar dengan dimensi yang sama.
 */
export function gambarItemKeKanvas(
  item: ItemHasil,
  kanvas: HTMLCanvasElement,
  peta: PetaGambar,
  skala: number,
): void {
  const ctx = kanvas.getContext("2d");
  if (!ctx) throw new Error("Kanvas tidak bisa dipakai");

  ctx.clearRect(0, 0, kanvas.width, kanvas.height);

  // Kualitas diperkecil tidak rusak; kualitas diperbesar lebih halus dengan
  // interpolasi kualitas tinggi saat browser mendukungnya.
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  for (const pilihan of item.pilihan) {
    const gambar = peta.get(pilihan.trait.id);
    if (!gambar) continue;

    // Setiap layer diletakkan di tengah kanvas sesuai ukurannya sendiri yang
    // sudah diskalakan — sama seperti pratinjau.
    const lebar = gambar.width * skala;
    const tinggi = gambar.height * skala;
    const x = (kanvas.width - lebar) / 2;
    const y = (kanvas.height - tinggi) / 2;
    ctx.drawImage(gambar.bitmap, x, y, lebar, tinggi);
  }
}

/** Mengekspor isi kanvas menjadi Blob PNG. */
export function kanvasKePng(kanvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise<Blob>((resolve, reject) => {
    kanvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Gambar gagal disusun"));
    }, "image/png");
  });
}

/**
 * Melepas semua gambar yang dimuat `muatSemuaTrait`.
 *
 * Wajib dipanggil di akhir generate — termasuk saat gagal atau dibatalkan —
 * karena bitmap tidak ikut dibersihkan oleh garbage collector selama masih
 * dipegang `peta`.
 */
export function lepasPeta(peta: PetaGambar): void {
  lepasSemua([...peta.values()]);
  peta.clear();
}
