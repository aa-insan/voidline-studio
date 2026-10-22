/* =============================================================================
   PENYUNTINGAN HASIL — mengubah item satu per satu setelah generate

   Empat tindakan, semuanya bekerja pada satu item tanpa menyentuh yang lain:
     kunci     tandai item agar tidak ikut berubah
     tukar     ganti trait pada satu layer di satu item
     ker ulang acak ulang satu item
     buang     keluarkan item, lalu isi celahnya dengan kombinasi baru

   ── ATURAN KEUNIKAN ADALAH TANGGUNG JAWAB BAGIAN INI ──────────────────────
   Mengganti trait bisa membuat item menjadi kembar dengan item lain — mis.
   #12 diubah menjadi Head "Round" yang sudah dipakai #7 dengan background dan
   body yang sama persis. Koleksi NFT dengan dua item identik tidak sah, dan
   kalau lolos sampai mint, kerusakannya tidak bisa ditarik kembali.

   Karena itu setiap tindakan yang menghasilkan kombinasi baru WAJIB memeriksa
   sidiknya terhadap sisa koleksi lebih dulu, dan menolak bila kembar. Menolak
   dengan pesan jauh lebih baik daripada membiarkan pengunjung menemukan item
   kembar saat sudah diunggah.

   ── PAKAI ULANG, BUKAN SALIN ──────────────────────────────────────────────
   Pemilihan berbobot dan pembuatan sidik diambil dari modul generate. Kalau
   disalin ke sini, dua salinan itu akan menyimpang perlahan dan trait langka
   di hasil suntingan tidak lagi sesederhana di hasil generate.

   ── SEMUA FUNGSI MENGEMBALIKAN DATA BARU ──────────────────────────────────
   Tidak ada yang mengubah array masukan. Dengan begitu React melihat referensi
   baru dan menggambar ulang.
   ============================================================================= */

import { acakKombinasi, buatSidik, type ItemHasil, type Pilihan } from "./generate";
import type { Layer, Trait } from "../types";

/** Hasil satu tindakan penyuntingan. */
export type AlasanSunting = "kembar" | "terkunci" | "tidakAda" | "kombinasiHabis";

export type HasilSunting =
  | { sukses: true; item: ItemHasil }
  | { sukses: false; alasan: AlasanSunting };

/** Sidik sebuah item. */
export const sidikItem = (item: ItemHasil): string =>
  buatSidik(item.pilihan.map((p) => p.trait.id));

/** Nama dasar koleksi dari nama item — "X #12" → "X". */
function namaDasarDari(nama: string): string {
  const pisah = nama.lastIndexOf(" #");
  return pisah > 0 ? nama.slice(0, pisah) : nama;
}

/** Nama item untuk sebuah nomor. */
const beriNama = (namaDasar: string, nomor: number): string => `${namaDasar} #${nomor}`;

/** Trait aktif di tiap layer, urut sesuai urutan layer. */
function traitPerLayer(layers: Layer[]): Trait[][] {
  return layers.map((l) => l.traits.filter((t) => !t.excluded && t.weight > 0));
}

/**
 * Apakah satu kombinasi sudah dipakai item lain.
 *
 * `kecuali` adalah indeks item yang sedang diubah — item itu sendiri tidak
 * boleh dihitung sebagai bentrokan.
 */
function bentrok(sidik: string, semua: ItemHasil[], kecuali?: number): boolean {
  return semua.some((it) => it.indeks !== kecuali && sidikItem(it) === sidik);
}

// ── Kunci ────────────────────────────────────────────────────────────────────

/** Membuka/menutup kunci satu item. */
export function ubahKunci(item: ItemHasil, dikunci: boolean): ItemHasil {
  return { ...item, dikunci };
}

/** Menandai semua item terkunci atau semuanya terbuka sekaligus. */
export function kunciSemua(semua: ItemHasil[], dikunci: boolean): ItemHasil[] {
  return semua.map((it) => ({ ...it, dikunci }));
}

// ── Tukar trait ──────────────────────────────────────────────────────────────

/**
 * Mengganti trait pada satu layer di satu item.
 *
 * Ditolak bila menghasilkan kombinasi yang sudah dipakai item lain. Tanpa
 * pemeriksaan ini, penyuntingan tangan menjadi jalan masuk utama item kembar —
 * justru karena pengunjung mengganti ke trait yang "kelihatan untuk item ini"
 * padahal kombinasinya sudah ada di tempat lain.
 */
export function tukarTrait(
  semua: ItemHasil[],
  indeksItem: number,
  layerId: string,
  traitBaru: Trait,
): HasilSunting {
  const target = semua.find((it) => it.indeks === indeksItem);
  if (!target) return { sukses: false, alasan: "tidakAda" };
  if (target.dikunci) return { sukses: false, alasan: "terkunci" };

  // Layer yang tidak ada di item ini berarti permintaannya keliru — tolak,
  // daripada diam-diam menambahkan pilihan yang tidak dikenal.
  if (!target.pilihan.some((p) => p.layerId === layerId)) {
    return { sukses: false, alasan: "tidakAda" };
  }

  const pilihanBaru: Pilihan[] = target.pilihan.map((p) =>
    p.layerId === layerId ? { ...p, trait: traitBaru } : p,
  );

  // Trait yang sama: tidak ada perubahan, tidak perlu diperiksa.
  const sidik = buatSidik(pilihanBaru.map((p) => p.trait.id));
  if (sidik === target.sidik) return { sukses: true, item: target };

  if (bentrok(sidik, semua, target.indeks)) return { sukses: false, alasan: "kembar" };

  return { sukses: true, item: { ...target, pilihan: pilihanBaru, sidik } };
}

// ── Ker ulang ────────────────────────────────────────────────────────────────

/**
 * Mengacak ulang satu item sampai mendapat kombinasi yang belum dipakai.
 *
 * Pemilihan berbobot, sama seperti mesin generate — trait langka tetap langka
 * setelah diacak. Bila seluruh ruang kombinasi sudah terpakai, tindakan gagal
 * dengan alasan `kombinasiHabis`.
 */
export function kerUlangItem(
  semua: ItemHasil[],
  indeksItem: number,
  layers: Layer[],
  acak: () => number = Math.random,
): HasilSunting {
  const target = semua.find((it) => it.indeks === indeksItem);
  if (!target) return { sukses: false, alasan: "tidakAda" };
  if (target.dikunci) return { sukses: false, alasan: "terkunci" };

  const aktif = traitPerLayer(layers);
  if (aktif.some((d) => d.length === 0)) return { sukses: false, alasan: "kombinasiHabis" };

  for (let coba = 0; coba < 200; coba++) {
    const pilihan = acakKombinasi(layers, aktif, acak);
    const sidik = buatSidik(pilihan.map((p) => p.trait.id));

    // Kombinasi lama bukan tujuan mengacak — pengunjung menekan "ker ulang"
    // karena ingin hasil yang berbeda.
    if (sidik === target.sidik) continue;
    if (bentrok(sidik, semua, target.indeks)) continue;

    return { sukses: true, item: { ...target, pilihan, sidik } };
  }

  return { sukses: false, alasan: "kombinasiHabis" };
}

// ── Buang item ───────────────────────────────────────────────────────────────

/**
 * Membuang satu item lalu mengisi celahnya dengan kombinasi baru.
 *
 * Nomor tidak bergeser: celah diisi kombinasi baru dengan nomor yang sama,
 * sehingga penomoran tetap rapat dan urutan unduhan tidak berubah. Menggeser
 * semua nomor setelah celah akan mengubah nama NFT yang mungkin sudah dikirim
 * ke calon pembeli.
 *
 * Pengunjung yang ingin benar-benar mengurangi jumlah item mengubah jumlah
 * edition lalu generate ulang — itu keputusan yang lebih jelas daripada
 * "buang" yang diam-diam memperpendek koleksi.
 */
export function buangDanIsi(
  semua: ItemHasil[],
  indeksItem: number,
  layers: Layer[],
  acak: () => number = Math.random,
):
  | { sukses: true; semua: ItemHasil[] }
  | { sukses: false; alasan: "terkunci" | "tidakAda" | "kombinasiHabis" } {
  const target = semua.find((it) => it.indeks === indeksItem);
  if (!target) return { sukses: false, alasan: "tidakAda" };
  if (target.dikunci) return { sukses: false, alasan: "terkunci" };

  const lain = semua.filter((it) => it.indeks !== indeksItem);
  const aktif = traitPerLayer(layers);
  if (aktif.some((d) => d.length === 0)) return { sukses: false, alasan: "kombinasiHabis" };

  for (let coba = 0; coba < 200; coba++) {
    const pilihan = acakKombinasi(layers, aktif, acak);
    const sidik = buatSidik(pilihan.map((p) => p.trait.id));
    if (bentrok(sidik, lain)) continue;

    const pengganti: ItemHasil = {
      indeks: target.indeks,
      nomor: target.nomor,
      nama: beriNama(namaDasarDari(target.nama), target.nomor),
      pilihan,
      sidik,
      dikunci: false,
    };

    return {
      sukses: true,
      semua: semua.map((it) => (it.indeks === indeksItem ? pengganti : it)),
    };
  }

  return { sukses: false, alasan: "kombinasiHabis" };
}

// ── Penomoran ulang ──────────────────────────────────────────────────────────

/**
 * Memberi nomor baru mulai dari `nomorAwal`, berurutan sesuai urutan koleksi.
 *
 * Nama ikut diperbarui karena nama memuat nomor. Item yang dikunci tetap
 * dinomori ulang — nomor adalah urutan koleksi, bukan pilihan artistik.
 */
export function nomorUlang(semua: ItemHasil[], nomorAwal: number): ItemHasil[] {
  return semua.map((it, i) => {
    const nomor = nomorAwal + i;
    return { ...it, nomor, nama: beriNama(namaDasarDari(it.nama), nomor) };
  });
}
