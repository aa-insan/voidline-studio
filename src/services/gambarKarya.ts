/* =============================================================================
   ALAMAT GAMBAR KARYA

   Satu tempat untuk menerjemahkan `ipfs://…` menjadi alamat yang bisa dibuka
   peramban, dengan daftar gateway cadangan.

   ── KENAPA BERANTAI, BUKAN SATU GATEWAY ────────────────────────────────────
   Tidak ada gateway IPFS yang selalu hidup. Filebase paling longgar, Pinata
   paling lengkap tapi membalas 429 kalau diminta beruntun, ipfs.io paling
   lambat tapi paling jarang mati. Dipakai berurutan: yang gagal dilewati,
   yang berhasil dipakai.

   Dipakai bersama oleh kartu di grid dan halaman detail karya — dulu logika ini
   hanya ada di dalam kartu, sehingga halaman detail harus menyalinnya.
   ============================================================================= */

/** Gateway cadangan, dicoba berurutan. */
export const GATEWAY = [
  "https://ipfs.filebase.io/ipfs/",
  "https://gateway.pinata.cloud/ipfs/",
  "https://ipfs.io/ipfs/",
] as const;

/** Mengubah ipfs://… menjadi daftar URL yang bisa dicoba. */
export function daftarAlamat(uri: string): string[] {
  if (!uri.startsWith("ipfs://")) return [uri];
  const path = uri.slice(7);
  return GATEWAY.map((gw) => `${gw}${path}`);
}
