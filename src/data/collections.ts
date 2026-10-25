/* =============================================================================
   DAFTAR KOLEKSI

   Satu sumber kebenaran untuk semua koleksi NFT Voidline Iceland. Setiap koleksi
   punya kolom di halaman /collection dan halaman mint-nya sendiri di
   /collection/mint/:slug.

   Menambah koleksi baru: tambahkan satu objek di array ini. Judul dan deskripsi
   diambil dari kamus bahasa lewat `titleKey` / `subtitleKey`, jadi tidak ada teks
   yang ditulis di dalam file ini.

   VANITY — bagian paling penting:
   Vanity adalah bagian terakhir dari alamat koleksi di xrp.cafe. Widget mint
   menolak render kalau nilainya tidak cocok PERSIS dengan yang ada di sana.

     https://xrp.cafe/id/collection/apesvoidline-jajangosle
                                 ^^^^^^^^^^^^^^^^^^^^^^^

   Salin apa adanya — huruf kecil, tanda hubung, semuanya. Nilainya juga
   tertulis di dashboard launchpad xrp.cafe.

   `slug` dipakai di alamat situs kita sendiri dan bebas ditentukan; `vanity`
   harus milik xrp.cafe. Keduanya sengaja dipisah supaya alamat situs kita rapi
   tanpa perlu menyamai alamat xrp.cafe.
   ============================================================================= */

import type { TextKey } from "../i18n/useLanguage";

export type Collection = {
  /** Alamat halaman mint di situs kita: /collection/mint/:slug */
  slug: string;
  /** Vanity di xrp.cafe — harus sama persis, kalau tidak widget tidak muncul. */
  vanity: string;
  /** Kunci judul di kamus bahasa. */
  titleKey: TextKey;
  /** Kunci deskripsi di kamus bahasa. */
  subtitleKey: TextKey;
  /**
   * NFTokenTaxon koleksi ini di XRP Ledger — angka "kelompok" yang dipakai
   * ledger untuk menandai NFT dari penerbitan yang sama.
   *
   * Dipakai untuk menghitung berapa yang sudah terjual: situs membandingkan
   * jumlah NFT bertaxon ini yang PERNAH diterbitkan dengan yang MASIH dipegang
   * wallet penerbit. Selisihnya = sudah pindah tangan.
   *
   * Kosongkan kalau tidak diketahui — kartu lalu menampilkan jumlah karya saja
   * tanpa status terjual, bukan angka yang salah.
   */
  taxon?: number;
  /**
   * Jumlah karya asli saat rilis. Dipakai sebagai cadangan bila pembacaan
   * ledger gagal, supaya kartu tidak berubah dari "42 karya" menjadi kosong.
   */
  editionSize?: number;
  /** Rilis terbaru? Menentukan urutan tampil: yang terbaru di atas. */
  rilisTerbaru?: boolean;
};

export const collections: Collection[] = [
  {
    slug: "apesvoidline",
    vanity: "apesvoidline-jajangosle",
    titleKey: "collection.apes.title",
    subtitleKey: "collection.apes.subtitle",
    taxon: 3,
    editionSize: 302,
  },
  {
    slug: "jajangvoidline",
    vanity: "jajangvoidline",
    titleKey: "collection.jajang.title",
    subtitleKey: "collection.jajang.subtitle",
    taxon: 5,
    editionSize: 253,
  },
  {
    slug: "fine-art-voidline",
    vanity: "fine-art-voidline",
    titleKey: "collection.fineart.title",
    subtitleKey: "collection.fineart.subtitle",
    taxon: 9,
    editionSize: 42,
  },
];

/** Mencari koleksi berdasarkan alamat situsnya. */
export const findCollection = (slug: string | undefined): Collection | undefined =>
  collections.find((collection) => collection.slug === slug);
