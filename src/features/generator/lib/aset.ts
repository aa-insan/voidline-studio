/* =============================================================================
   LEMARI ASET — peta id trait ke berkas gambarnya

   Berkas gambar TIDAK menyatu di struktur proyek. Kalau menyatu, menyimpan
   atau mengekspor proyek berarti ikut menyeret blob — sesuatu yang mustahil
   dibuat sebagai data biasa.

   Jadi pemisahannya begini:
   - Struktur proyek (layer, trait, pengaturan) = data murni. Bisa disimpan,
     diekspor, dan dibaca ulang.
   - Lemari aset = kopi yang hanya hidup selama tab terbuka. Trait dihapus
     dari proyek → gambarnya dibuang dari lemari.

   LEMARI DIDESAIN UNTUK DIGANTI, BUKAN MENGHINDAR.
   Suatu saat proyek akan disimpan ke IndexedDB beserta gambarnya. Lemari ini
   cukup disembunyikan di belakang satu objek dengan tiga metode — pasang,
   ambil, buang — sehingga menggantinya tidak membongkar komponen yang
   memakainya.
   ============================================================================= */

import type { TraitAsset } from "../types";

/**
 * Penyimpanan aset yang sedang berjalan. Kunci = trait.id.
 *
 * Satu instance saja untuk seluruh tab — generator hanya membuka satu proyek
 * dalam satu waktu.
 */
class LemariAset {
  private pemetaan = new Map<string, TraitAsset>();

  /** Menyimpan atau mengganti gambar sebuah trait. */
  pasang(traitId: string, aset: TraitAsset): void {
    this.pemetaan.set(traitId, aset);
  }

  /** Mengambil gambar trait. `undefined` bila berkasnya belum dimuat/hilang. */
  ambil(traitId: string): TraitAsset | undefined {
    return this.pemetaan.get(traitId);
  }

  /** Membuang gambar satu trait. */
  buang(traitId: string): void {
    this.pemetaan.delete(traitId);
  }

  /** Membuang semua gambar trait milik satu layer. */
  buangLayer(traitIds: string[]): void {
    for (const id of traitIds) this.pemetaan.delete(id);
  }

  /** Mengosongkan seluruh lemari — dipakai saat membuka proyek baru. */
  kosongkan(): void {
    this.pemetaan.clear();
  }

  /**
   * Mengembalikan seluruh isi lemari sebagai peta baru.
   *
   * Dipakai penyimpanan: yang perlu ditulis ke IndexedDB adalah isi lemari
   * saat ini, dan salinan dangkal (bukan referensi ke Map asli) mencegah
   * pemanggil mengubah lemari tanpa sengaja.
   */
  isi(): Map<string, TraitAsset> {
    return new Map(this.pemetaan);
  }

  /**
   * Menyisihkan gambar trait yang tidak lagi dipakai proyek.
   *
   * Dipanggil setiap kali proyek berubah supaya memori tidak menumpuk gambar
   * milik trait yang sudah dihapus. Untuk 500 trait, loop ini murah.
   */
  sisihkan(idYangDipakai: Set<string>): void {
    for (const id of this.pemetaan.keys()) {
      if (!idYangDipakai.has(id)) this.pemetaan.delete(id);
    }
  }
}

/** Instance tunggal. Komponen tidak perlu tahu cara kerjanya. */
export const lemariAset = new LemariAset();

/**
 * Menghapus gambar trait milik satu layer dari lemari.
 * Dipakai saat layer dihapus dari proyek.
 */
export function buangAsetLayer(layer: { traits: { id: string }[] }): void {
  lemariAset.buangLayer(layer.traits.map((t) => t.id));
}
