/* =============================================================================
   PEMBANTU UMUM GENERATOR
   ============================================================================= */

/**
 * Membuat id unik untuk layer, trait, dan proyek.
 *
 * `crypto.randomUUID` tidak tersedia di semua browser lama dan hanya berjalan
 * pada konteks aman (https atau localhost). Bila tidak ada, dipakai gabungan
 * waktu + angka acak — cukup unik untuk data yang hanya hidup di satu browser.
 */
export function buatId(awalan: string): string {
  const acak =
    typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);

  return `${awalan}_${acak}`;
}

/**
 * Mengubah nama berkas menjadi nama yang layak tampil.
 *
 *   "Head_Blue-01.png"  →  "Head Blue 01"
 *
 * Tanda hubung dan garis bawah diubah menjadi spasi, ekstensi dibuang, lalu
 * huruf pertama tiap kata dijadikan kapital. Nama berkas trait biasanya sudah
 * ditulis sesuai keinginan pemiliknya ("Blue", "Red Hat"), jadi yang dilakukan
 * hanya merapikan, bukan mengubah arti.
 */
export function namaDariBerkas(namaBerkas: string): string {
  const tanpaEkstensi = namaBerkas.replace(/\.[^.]+$/, "");
  const rapi = tanpaEkstensi.replace(/[_-]+/g, " ").replace(/\s+/g, " ").trim();

  if (!rapi) return "Trait";

  return rapi
    .split(" ")
    .map((kata) => kata.charAt(0).toUpperCase() + kata.slice(1))
    .join(" ");
}

/**
 * Nama satu item koleksi pada nomor tertentu.
 *
 *   ("Mom Apes", 3, 1)  →  "Mom Apes #3"
 *
 * Nomor awal memungkinkan melanjutkan penomoran drop sebelumnya.
 */
export function namaItem(namaKoleksi: string, indeks: number, nomorAwal: number): string {
  const judul = namaKoleksi.trim() || "Untitled";
  return `${judul} #${nomorAwal + indeks}`;
}

/** Apakah berkas ini boleh dipakai sebagai trait. */
export function berkasTraitSah(berkas: File, formatSah: readonly string[], batasUkuran: number): boolean {
  return formatSah.includes(berkas.type) && berkas.size <= batasUkuran;
}

/**
 * Membaca ukuran gambar dari sebuah Blob.
 *
 * `createImageBitmap` paling cepat tetapi tidak ada di semua browser untuk
 * SVG. Karena itu dibuka lewat elemen <img> dengan object URL — cara yang
 * berjalan di mana-mana, termasuk SVG.
 *
 * Object URL SELALU dicabut kembali, termasuk saat gagal, supaya blob tidak
 * tertahan di memori selama tab terbuka.
 */
export function bacaUkuranGambar(blob: Blob): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.naturalWidth, height: img.naturalHeight });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Gambar tidak bisa dibaca"));
    };

    img.src = url;
  });
}
