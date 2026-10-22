/* =============================================================================
   PENYIMPANAN PROYEK — IndexedDB, tanpa pustaka

   Menyimpan satu proyek beserta gambar trait-nya di dalam browser pengunjung.
   Tidak ada server, tidak ada akun, tidak ada data yang keluar dari perangkat.

   ── DUA TOKO ──────────────────────────────────────────────────────────────
   `proyek` menyimpan keadaan proyek (layer, trait, pengaturan) — data kecil,
   satu baris.
   `aset`   menyimpan berkas gambar per trait, kuncinya id trait.

   Dipisah karena gambar bisa ratusan megabita dan tidak perlu ikut dibaca
   setiap kali hanya keadaan proyek yang dibutuhkan. Menyatukan keduanya
   berarti setiap penyimpanan kecil harus menyeret seluruh gambar.

   ── MENGAPA TANPA PUSTAKA ─────────────────────────────────────────────────
   `idb` memang mempermudah, tetapi yang dibutuhkan di sini hanya empat
   operasi: buka, tulis, baca, hapus. Menambah 1 KB kode pihak ketiga untuk
   itu tidak sepadan. API bawaan juga lebih tahan lama daripada pustaka.

   ── PEMAKAIAN MEMORI ──────────────────────────────────────────────────────
   Blob yang dibaca dari IndexedDB adalah Blob asli, bukan salinan di dalam
   JavaScript — browser menyimpannya di luar heap. Jadi memuat proyek dengan
   ratusan gambar tidak meledakkan memori seperti kalau gambarnya dijadikan
   base64.
   ============================================================================= */

import type { GeneratorState, TraitAsset } from "../types";

const NAMA_DB = "voidline-generator";
const VERSI_DB = 1;
const TOKO_PROYEK = "proyek";
const TOKO_ASET = "aset";

/**
 * Kunci baris proyek.
 *
 * Hanya satu proyek yang disimpan: generator ini mengerjakan satu koleksi
 * pada satu waktu. Beberapa proyek tersimpan akan membutuhkan pemilih proyek
 * di antarmuka — fitur tersendiri, bukan sesuatu yang ditambahkan diam-diam.
 */
const KUNCI_PROYEK = "aktif";

/** Keadaan yang disimpan: data proyek murni, tanpa Blob. */
type ProyekTersimpan = {
  kunci: typeof KUNCI_PROYEK;
  /** Versi bentuk data — untuk migrasi bila bentuknya berubah kelak. */
  versi: number;
  disimpanPada: number;
  keadaan: GeneratorState;
};

/** Berkas gambar milik satu trait. */
type AsetTersimpan = {
  traitId: string;
  blob: Blob;
  width: number;
  height: number;
};

/** Membuka database; membuat toko bila belum ada. */
function bukaDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const permintaan = indexedDB.open(NAMA_DB, VERSI_DB);

    permintaan.onupgradeneeded = () => {
      const db = permintaan.result;
      if (!db.objectStoreNames.contains(TOKO_PROYEK)) {
        db.createObjectStore(TOKO_PROYEK, { keyPath: "kunci" });
      }
      if (!db.objectStoreNames.contains(TOKO_ASET)) {
        db.createObjectStore(TOKO_ASET, { keyPath: "traitId" });
      }
    };

    permintaan.onsuccess = () => resolve(permintaan.result);
    permintaan.onerror = () => reject(permintaan.error ?? new Error("Database gagal dibuka"));
  });
}

/** Membungkus permintaan IndexedDB menjadi Promise. */
function tunggu<T>(permintaan: IDBRequest<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    permintaan.onsuccess = () => resolve(permintaan.result);
    permintaan.onerror = () => reject(permintaan.error ?? new Error("Operasi database gagal"));
  });
}

/** Apakah IndexedDB bisa dipakai. */
export function penyimpananTersedia(): boolean {
  try {
    // Mode privat di sebagian browser punya IndexedDB yang gagal dibuka.
    return typeof indexedDB !== "undefined";
  } catch {
    return false;
  }
}

/**
 * Menyimpan keadaan proyek beserta semua aset gambar yang masih dipakai.
 *
 * Aset yang tidak lagi dipakai trait dibuang dalam transaksi yang sama, supaya
 * menghapus layer juga membebaskan gambarnya di penyimpanan — bukan hanya di
 * memori. Tanpa itu, database tumbuh tanpa batas walau proyeknya mengecil.
 */
export async function simpanProyek(
  keadaan: GeneratorState,
  aset: Map<string, TraitAsset>,
): Promise<void> {
  const db = await bukaDb();

  try {
    const tx = db.transaction([TOKO_PROYEK, TOKO_ASET], "readwrite");
    const tokoProyek = tx.objectStore(TOKO_PROYEK);
    const tokoAset = tx.objectStore(TOKO_ASET);

    const baris: ProyekTersimpan = {
      kunci: KUNCI_PROYEK,
      versi: VERSI_DB,
      disimpanPada: Date.now(),
      keadaan,
    };

    tokoProyek.put(baris);

    // Tulis aset yang masih hidup.
    const idDipakai = new Set(keadaan.layers.flatMap((l) => l.traits.map((t) => t.id)));
    for (const [traitId, a] of aset) {
      if (!idDipakai.has(traitId)) continue;
      const tersimpan: AsetTersimpan = {
        traitId,
        blob: a.blob,
        width: a.width,
        height: a.height,
      };
      tokoAset.put(tersimpan);
    }

    // Buang aset yatim. Daftar kunci dibaca lebih dulu, lalu dihapus di
    // transaksi yang sama — supaya tidak ada jendela waktu di mana proyek
    // menunjuk trait yang gambarnya sudah hilang.
    const kunciTersimpan = await tunggu(tokoAset.getAllKeys());
    for (const kunci of kunciTersimpan) {
      if (typeof kunci === "string" && !idDipakai.has(kunci)) tokoAset.delete(kunci);
    }

    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error ?? new Error("Penyimpanan gagal"));
      tx.onabort = () => reject(tx.error ?? new Error("Penyimpanan dibatalkan"));
    });
  } finally {
    db.close();
  }
}

/** Memuat proyek tersimpan, atau `null` bila belum pernah disimpan. */
export async function muatProyek(): Promise<{
  keadaan: GeneratorState;
  aset: TraitAsset[];
  disimpanPada: number;
} | null> {
  const db = await bukaDb();

  try {
    const tx = db.transaction([TOKO_PROYEK, TOKO_ASET], "readonly");
    const baris = await tunggu<ProyekTersimpan | undefined>(
      tx.objectStore(TOKO_PROYEK).get(KUNCI_PROYEK),
    );

    if (!baris) return null;

    const tersimpan = await tunggu<AsetTersimpan[]>(tx.objectStore(TOKO_ASET).getAll());

    // Aset dipetakan ulang ke bentuk yang dipakai generator. Berkas yang
    // tercatat tetapi trait-nya sudah tidak ada diabaikan — data bisa saja
    // ditulis versi lama yang belum membersihkan yatim.
    const idDipakai = new Set(baris.keadaan.layers.flatMap((l) => l.traits.map((t) => t.id)));
    const aset: TraitAsset[] = tersimpan
      .filter((a) => idDipakai.has(a.traitId))
      .map((a) => ({ traitId: a.traitId, blob: a.blob, width: a.width, height: a.height }));

    return { keadaan: baris.keadaan, aset, disimpanPada: baris.disimpanPada };
  } finally {
    db.close();
  }
}

/** Menghapus proyek tersimpan beserta seluruh gambarnya. */
export async function hapusProyek(): Promise<void> {
  const db = await bukaDb();
  try {
    const tx = db.transaction([TOKO_PROYEK, TOKO_ASET], "readwrite");
    tx.objectStore(TOKO_PROYEK).delete(KUNCI_PROYEK);
    tx.objectStore(TOKO_ASET).clear();
    await new Promise<void>((resolve, reject) => {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error ?? new Error("Penghapusan gagal"));
    });
  } finally {
    db.close();
  }
}
