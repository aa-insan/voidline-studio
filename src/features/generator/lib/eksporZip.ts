/* =============================================================================
   EKSPOR ZIP — semua gambar beserta metadatanya dalam satu berkas

   Dipanggil lewat tombol "Unduh ZIP" di grid hasil. Satu ZIP berisi:
     imaget/<nomor>.png        gambar jadi
     metadata/<nomor>.json     metadata NFT untuk berkas dengan nomor sama

   ── BENTUK METADATA ───────────────────────────────────────────────────────
   Pakai bentuk yang dibaca xrp.cafe dan pasar NFT umumnya:
     name        : "Nama Koleksi #101"
     image       : "images/101.png"        (jalur relatif di dalam ZIP)
     attributes  : daftar { trait_type, value } — trait_type = nama layer,
                   value = nama trait, ditulis dari layer paling belakang.

   ── KOMPRESI ──────────────────────────────────────────────────────────────
   ZIP disusun tanpa kompresi (STORE). PNG sudah terkompresi di dalamnya —
   memampatkan ulang hanya memperlambat dan tidak mengecilkan hasil. JSON
   memang lebih besar secara mentah, tetapi ukurannya pikulan dibanding PNG.

   ── IMPOR DIALOG ──────────────────────────────────────────────────────────
   JSZip diimpor dinamis (`import("jszip")`), bukan di atas berkas. Tanpa itu
   seluruh pengunjung situs ikut menanggung ~95 kB pustaka arsip setiap kali
   membuka halaman, walau hanya sedikit yang pernah mengekspor. Dengan impor
   dinamis, pustaka itu hanya dimuat pada klik pertama tombol unduh.
   ============================================================================= */

import type { HasilKoleksi } from "../hooks/useKoleksi";
import { namaBerkasAman } from "./unduh";

/** Metadata satu item NFT — cukup untuk XLS-20 dan pasar yang membacanya. */
function metadataItem(
  item: HasilKoleksi["item"][number]["item"],
): Record<string, unknown> {
  return {
    name: item.nama,
    image: `images/${item.nomor}.png`,
    attributes: item.pilihan.map((p) => ({
      trait_type: p.layerNama,
      value: p.trait.name,
    })),
  };
}

/**
 * Menyusun ZIP dari hasil generate dan mengembalikannya sebagai Blob.
 *
 * Semua sumber data sudah ada di memori (blob PNG hasil render), jadi tidak
 * ada pembacaan ulang berkas — menyusun seratus item hanya butuh detik.
 */
export async function buatZip(hasil: HasilKoleksi): Promise<Blob> {
  const JSZip = (await import("jszip")).default;
  const zip = new JSZip();

  // Folder dibuat lewat nama berkas; JSZip menambahkan entri foldernya sendiri.
  for (const h of hasil.item) {
    const nomor = h.item.nomor;
    zip.file(`images/${nomor}.png`, h.blob);
    zip.file(`metadata/${nomor}.json`, JSON.stringify(metadataItem(h.item), null, 2));
  }

  const blob = await zip.generateAsync({
    type: "blob",
    // PNG harus tetap utuh tanpa pemampatan ulang — lihat catatan di atas.
    compression: "STORE",
  });

  // Nama berkas ZIP mengikuti nama koleksi, bukan nama proyek, supaya sama
  // dengan nama NFT di dalamnya.
  return blob;
}

/** Nama berkas ZIP yang diunduh, dari nama koleksi yang diisi pengunjung. */
export function namaZip(namaKoleksi: string): string {
  return `${namaBerkasAman(namaKoleksi || "collection")}.zip`;
}
