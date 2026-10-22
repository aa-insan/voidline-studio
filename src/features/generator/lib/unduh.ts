/* =============================================================================
   UNDUHAN BERKAS

   Satu tempat untuk memicu unduhan dari data yang sudah ada di memori.
   Dipisah dari komponen supaya logikanya tidak terduplikasi saat nanti ada
   unduhan ZIP atau metadata.
   ============================================================================= */

/** Membersihkan nama untuk dipakai sebagai nama berkas. */
export function namaBerkasAman(nama: string): string {
  return (
    nama
      .trim()
      .replace(/[\\/:*?"<>|]+/g, "-")
      .replace(/\s+/g, "-")
      // Titik di depan bisa membuat berkas tersembunyi di sebagian sistem.
      .replace(/^\.+/, "")
      .slice(0, 80) || "item"
  );
}

/**
 * Mengunduh satu Blob.
 *
 * Object URL dibuat lalu langsung dicabut lagi setelah klik. Pencabutan tidak
 * memotong unduhan yang sedang berjalan — browser sudah memegang rujukannya.
 */
export function unduhBlob(blob: Blob, namaBerkas: string): void {
  const url = URL.createObjectURL(blob);
  const tautan = document.createElement("a");
  tautan.href = url;
  tautan.download = namaBerkas;
  document.body.appendChild(tautan);
  tautan.click();
  tautan.remove();
  URL.revokeObjectURL(url);
}
