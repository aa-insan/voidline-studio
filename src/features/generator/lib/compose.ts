/* =============================================================================
   MESIN GAMBAR — menyusun beberapa gambar jadi satu NFT

   Inti dari generator ada di sini. Semua layer ditumpuk berurutan ke satu
   kanvas, layer pertama di paling belakang. Hasilnya satu gambar jadi.

   ATURAN UKURAN KANVAS
   Ukuran kanvas diambil dari gambar TERBESAR di dalam proyek, bukan dari
   layer pertama. Alasannya: berkas layer sering diekspor dengan ukuran kanvas
   yang sama tetapi ada juga yang hanya memuat potongan gambarnya saja. Memakai
   yang terbesar menjamin tidak ada layer yang terpotong, dan layer yang lebih
   kecil diletakkan di tengah kanvas.

   PENEMPATAN
   Semua gambar yang ukurannya lebih kecil dari kanvas diletakkan di TENGAH,
   bukan di kiri atas. Ini sesuai cara kerja art layer NFT: setiap layer dibuat
   dengan kanvas yang sama dan posisi yang sudah pas, lalu diekspor. Kalau
   ukurannya berbeda karena kesalahan ekspor, tengah adalah titik yang paling
   kecil kemungkinan salahnya.

   YANG TIDAK DILAKUKAN
   Mesin ini tidak mengubah warna, tidak memotong, tidak menambah efek. Ia
   hanya menumpuk. Semua perubahan visual adalah tanggung jawab berkas layer.
   ============================================================================= */

/** Gambar yang siap digambar ke kanvas. */
export type GambarSiap = {
  /** Nama trait, untuk keperluan debug dan pesan galat. */
  nama: string;
  /** Bitmap gambar. ImageBitmap jika didukung; HTMLImageElement sebagai jatuh
   * bangun untuk Safari lama. Keduanya diterima drawImage. */
  bitmap: CanvasImageSource;
  width: number;
  height: number;
};

/**
 * Memuat Blob menjadi ImageBitmap.
 *
 * ImageBitmap jauh lebih cepat digambar berulang kali dibanding elemen <img>,
 * dan inilah yang membuat generate ratusan item tetap wajar. Bila browser
 * tidak mendukungnya, jatuh ke elemen <img> biasa.
 */
export async function muatGambar(blob: Blob, nama: string): Promise<GambarSiap> {
  if (typeof createImageBitmap === "function") {
    const bitmap = await createImageBitmap(blob);
    return { nama, bitmap, width: bitmap.width, height: bitmap.height };
  }

  const url = URL.createObjectURL(blob);
  try {
    const img = await new Promise<HTMLImageElement>((resolve, reject) => {
      const el = new Image();
      el.onload = () => resolve(el);
      el.onerror = () => reject(new Error(`Gambar tidak bisa dibaca: ${nama}`));
      el.src = url;
    });
    // Elemen gambar tetap hidup karena object URL belum dicabut; pemanggil
    // bertanggung jawab mencabutnya lewat `lepasGambar`.
    return { nama, bitmap: img, width: img.naturalWidth || 1, height: img.naturalHeight || 1 };
  } finally {
    // Object URL tetap dicabut setelah gambar termuat: gambar sudah memegang
    // datanya sendiri dan tidak butuh URL lagi.
    URL.revokeObjectURL(url);
  }
}

/** Menghitung ukuran kanvas dari sekumpulan gambar. */
export function ukuranKanvas(gambar: GambarSiap[]): { width: number; height: number } {
  let width = 0;
  let height = 0;
  for (const g of gambar) {
    if (g.width > width) width = g.width;
    if (g.height > height) height = g.height;
  }
  // Jaring pengaman: kanvas 0 × 0 tidak bisa digambar.
  return { width: Math.max(1, width), height: Math.max(1, height) };
}

/**
 * Menggambar satu tumpukan layer ke kanvas lalu mengembalikannya sebagai PNG
 * dalam bentuk Promise<Blob>.
 *
 * Kanvas dibuat sekecil mungkin lalu dibuang. Satu kanvas per item lebih mahal
 * daripada memakai ulang satu kanvas, tetapi jauh lebih sederhana dan tidak
 * menyimpan hasil kotor antar item.
 */
export async function susunKeKanvas(
  gambar: GambarSiap[],
  kanvas?: HTMLCanvasElement,
): Promise<Blob> {
  const { width, height } = ukuranKanvas(gambar);
  const target = kanvas ?? document.createElement("canvas");
  target.width = width;
  target.height = height;

  const ctx = target.getContext("2d");
  if (!ctx) throw new Error("Kanvas tidak bisa dipakai");

  ctx.clearRect(0, 0, width, height);

  for (const g of gambar) {
    const x = Math.round((width - g.width) / 2);
    const y = Math.round((height - g.height) / 2);
    ctx.drawImage(g.bitmap, x, y, g.width, g.height);
  }

  return await new Promise<Blob>((resolve, reject) => {
    target.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error("Gambar gagal disusun"));
    }, "image/png");
  });
}

/**
 * Menggambar tumpukan ke kanvas yang SUDAH ADA tanpa mengubah ukurannya.
 *
 * Dipakai pratinjau langsung: kanvas pratinjau punya ukuran tetap di layar,
 * sedangkan ukuran kanvas hasil ditentukan proyek. Dengan memisahkan kedua
 * jalur ini, pratinjau bisa kecil tanpa memaksa hasil akhir ikut kecil.
 */
export function susunKeKanvasTetap(
  gambar: GambarSiap[],
  kanvas: HTMLCanvasElement,
): void {
  const ctx = kanvas.getContext("2d");
  if (!ctx) return;

  ctx.clearRect(0, 0, kanvas.width, kanvas.height);

  // Skala mengikuti gambar terbesar, lalu semua layer memakai skala yang sama
  // supaya proporsinya tidak berubah.
  const asli = ukuranKanvas(gambar);
  const skala = Math.min(kanvas.width / asli.width, kanvas.height / asli.height);
  const lebar = asli.width * skala;
  const tinggi = asli.height * skala;
  const geserX = (kanvas.width - lebar) / 2;
  const geserY = (kanvas.height - tinggi) / 2;

  for (const g of gambar) {
    const x = geserX + (lebar - g.width * skala) / 2;
    const y = geserY + (tinggi - g.height * skala) / 2;
    ctx.drawImage(g.bitmap, x, y, g.width * skala, g.height * skala);
  }
}

/** Melepas memori sebuah gambar hasil muat.
 *
 * Hanya ImageBitmap yang punya `close()`. Elemen <img> dari jalur jatuh bangun
 * tidak menyimpan memori bitmap terpisah, jadi cukup dilewati — pemeriksaan
 * `in` di bawah membuat cast tidak diperlukan sama sekali.
 */
export function lepasGambar(g: GambarSiap | undefined): void {
  if (!g) return;
  const { bitmap } = g;
  if ("close" in bitmap && typeof bitmap.close === "function") {
    bitmap.close();
  }
}

/** Melepas banyak gambar sekaligus. */
export function lepasSemua(gambar: GambarSiap[]): void {
  for (const g of gambar) lepasGambar(g);
}
