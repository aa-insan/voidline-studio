/* =============================================================================
   TIPE DATA GENERATOR

   Semua bentuk data yang dipakai generator dikumpulkan di sini, bukan
   disebarkan di dalam komponen. Alasannya: data ini akan disimpan ke browser
   (IndexedDB), diekspor ke file, dan dibaca lagi — bentuknya harus tetap
   walau komponennya ditulis ulang.

   ATURAN PENTING: semua data di sini harus berupa data biasa (string, angka,
   boolean, array, objek). Tidak boleh berisi `File`, `ImageBitmap`, `Blob`,
   atau fungsi apa pun — benda-benda itu tidak bisa disimpan atau diekspor.

   Gambar trait tetap disimpan sebagai `File` di memori selama proyek dibuka,
   tetapi TIDAK ikut di dalam struktur ini. Lihat catatan `TraitAsset` di
   bawah.
   ============================================================================= */

/** Format berkas yang diterima sebagai trait. */
export const FORMAT_TRAIT = ["image/png", "image/jpeg", "image/webp", "image/gif", "image/svg+xml"] as const;

/** Batas ukuran satu berkas trait (byte). 10 MB. */
export const BATAS_UKURAN_TRAIT = 10 * 1024 * 1024;

/**
 * Satu pilihan gambar di dalam sebuah layer.
 *
 * `weight` adalah bobot rarity, bukan persentase langsung. Bobot 1 dan 1 berarti
 * peluangnya sama; bobot 1 dan 3 berarti yang kedua muncul tiga kali lebih
 * sering. Angka mentah dipilih karena penjung tidak perlu membuat totalnya
 * menjadi 100 — mesin generate yang menormalkan sendiri.
 */
export type Trait = {
  id: string;
  /** Nama yang tampil di antarmuka dan dipakai sebagai nilai di metadata. */
  name: string;
  /** Bobot rarity. 0 atau kurang = trait ini tidak akan pernah dipilih. */
  weight: number;
  /**
   * Trait dimatikan tanpa dihapus. Berguna untuk menyimpan artwork lama yang
   * tidak dipakai pada drop kali ini, tetapi tidak ingin dibuang.
   */
  excluded: boolean;
  /** Nama berkas asli — dipakai di metadata dan untuk mengenali gambar. */
  fileName: string;
};

/**
 * Satu tingkat tumpukan, mis. "Background" atau "Head".
 *
 * Urutan layer ditentukan oleh posisi di array `layers`, BUKAN oleh kolom
 * `order`. Satu sumber kebenaran lebih sulit dibuat tidak sinkron daripada
 * dua. Layer di indeks 0 digambar paling belakang; indeks terakhir paling depan.
 */
export type Layer = {
  id: string;
  /** Nama layer, mis. "Background". Menjadi `trait_type` di metadata. */
  name: string;
  /** Pilihan gambar di dalam layer ini. */
  traits: Trait[];
};

/**
 * Ukuran keluaran yang bisa dipilih.
 *
 * 1000 × 1000 adalah ukuran yang direkomendasikan untuk NFT: tajam di layar
 * retina, berkasnya wajar, dan diterima semua marketplace. Angka lain
 * disediakan untuk kebutuhan khusus — kebanyakan orang tidak perlu menyentuh
 * pilihan ini.
 */
export const UKURAN_KELUARAN = [512, 1000, 1500, 2000] as const;
export type UkuranKeluaran = (typeof UKURAN_KELUARAN)[number];
export const UKURAN_KELUARAN_BAWAAN: UkuranKeluaran = 1000;

/** Pengaturan koleksi yang diisi pengunjung. */
export type CollectionSettings = {
  /** Nama koleksi, dipakai sebagai awalan nama tiap item. */
  name: string;
  /** Berapa banyak NFT yang dibuat. */
  editionSize: number;
  /** Nomor awal saat penamaan — berguna bila melanjutkan drop sebelumnya. */
  startTokenId: number;
  /**
   * Sisi kanvas hasil dalam piksel (persegi). Layer diskalakan agar muat,
   * dengan rasio dipertahankan.
   */
  outputSize: UkuranKeluaran;
};

/**
 * Berkas gambar yang benar-benar dipakai untuk menggambar.
 *
 * Dipisah dari `Trait` karena `Blob`/`File` tidak bisa disimpan atau diekspor
 * sebagai data biasa. Selama proyek terbuka, gambar hidup di peta `id → Blob`
 * di memori. Saat menyimpan ke browser, berkasnya disimpan terpisah; saat
 * mengekspor proyek, berkasnya dimasukkan ke dalam ZIP.
 */
export type TraitAsset = {
  traitId: string;
  blob: Blob;
  /**
   * Ukuran kanvas asli, dibaca sekali saat berkas dimuat. Dipakai untuk
   * memutuskan ukuran kanvas hasil tanpa membuka ulang setiap gambar.
   */
  width: number;
  height: number;
};

/** Seluruh keadaan generator, sebagaimana dilihat antarmuka. */
export type GeneratorState = {
  /** Nama proyek — dipakai sebagai judul dan nama berkas saat diekspor. */
  projectName: string;
  layers: Layer[];
  settings: CollectionSettings;
};

/** Koleksi kosong — keadaan awal saat pengunjung membuka generator. */
export const PENGATURAN_AWAL: CollectionSettings = {
  name: "",
  editionSize: 100,
  startTokenId: 1,
  outputSize: UKURAN_KELUARAN_BAWAAN,
};

export const KEADAAN_AWAL: GeneratorState = {
  projectName: "",
  layers: [],
  settings: PENGATURAN_AWAL,
};
