/* =============================================================================
   DAFTAR KOLEKSI

   Satu sumber kebenaran untuk semua koleksi NFT Voidline Studio. Setiap koleksi
   punya kolom di halaman /collections dan halaman mint-nya sendiri di
   /collections/mint/:slug.

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
  /** Alamat halaman mint di situs kita: /collections/mint/:slug */
  slug: string;
  /** Vanity di xrp.cafe — harus sama persis, kalau tidak widget tidak muncul. */
  vanity: string;
  /** Kunci judul di kamus bahasa. */
  titleKey: TextKey;
  /** Kunci deskripsi di kamus bahasa. */
  subtitleKey: TextKey;
};

export const collections: Collection[] = [
  {
    slug: "apesvoidline",
    vanity: "apesvoidline-jajangosle",
    titleKey: "collection.apes.title",
    subtitleKey: "collection.apes.subtitle",
  },
  {
    slug: "jajangvoidline",
    vanity: "jajangvoidline",
    titleKey: "collection.jajang.title",
    subtitleKey: "collection.jajang.subtitle",
  },
  {
    slug: "fine-art-voidline",
    vanity: "fine-art-voidline",
    titleKey: "collection.fineart.title",
    subtitleKey: "collection.fineart.subtitle",
  },
];

/** Mencari koleksi berdasarkan alamat situsnya. */
export const findCollection = (slug: string | undefined): Collection | undefined =>
  collections.find((collection) => collection.slug === slug);
