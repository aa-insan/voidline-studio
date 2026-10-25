/* =============================================================================
   PENGUMUMAN RILIS — JADWAL DROP KOLEKSI TERBARU

   Satu tempat untuk seluruh isi pengumuman di halaman atrium: judul, kalimat
   pembuka, dan jadwal batch. Halaman / hanya merender; tidak ada teks drop yang
   ditulis di dalam komponen.

   ── MENGAPA DI BERKAS DATA, BUKAN DI KAMUS BAHASA ──────────────────────────
   Syarat dan jendela klaim ("3:00 - 5:00 UTC") adalah ketentuan resmi drop —
   pembeli membacanya sebagai istilah, bukan sebagai narasi situs. Karena itu
   teksnya dibiarkan apa adanya dalam bahasa aslinya, dan tidak ikut berubah
   saat pengunjung mengganti bahasa antarmuka.

   ── PENANDAAN WARNA ────────────────────────────────────────────────────────
   `pengumuman` dipecah menjadi beberapa potongan. Potongan bertanda `merah`
   dicetak merah; sisanya putih. Dengan cara ini angka dan tanggal penting bisa
   ditonjolkan tanpa menulis HTML di dalam data.

   ── MENGISI DROP BERIKUTNYA ────────────────────────────────────────────────
   Ganti `judul`, `pengumuman`, dan isi `batch`. `jendela` boleh dikosongkan
   untuk batch tanpa jendela waktu (mis. Public Mint) — tanda kurung waktunya
   otomatis tidak dirender.
   ============================================================================= */

/** Satu potongan kalimat; `merah` membuatnya dicetak dengan warna aksen. */
export type Potongan = { teks: string; merah?: boolean };

export type BatchRilis = {
  /** Nomor urut batch — dirender sebagai "Batch 1", "Batch 2", … */
  nomor: number;
  /** Isi batch — apa yang didapat dan siapa yang berhak. */
  keterangan: string;
  /** Jendela klaim dalam UTC. Kosongkan bila batch tidak berjendela. */
  jendela?: string;
};

export const rilis: {
  judul: string;
  pengumuman: readonly Potongan[];
  batch: readonly BatchRilis[];
} = {
  judul: "Mom Apes Voidline",
  pengumuman: [
    { teks: "DROPPING " },
    { teks: "567", merah: true },
    { teks: " ANIMATED VOIDLINE GIF ART ON " },
    { teks: "OCT 25 (UTC)", merah: true },
  ],
  batch: [
    {
      nomor: 1,
      keterangan:
        "2 Freemints for all holders of my work in the Jajang Voidline album",
      jendela: "3:00 – 5:00 UTC",
    },
    {
      nomor: 2,
      keterangan:
        "1 Freemint for 30 top holders of my work in the Apes Voidline album",
      jendela: "5:00 – 6:00 UTC",
    },
    {
      nomor: 3,
      keterangan:
        "50% off for all top holders of my art in the Apes Voidline album",
      jendela: "6:00 – 7:00 UTC",
    },
    {
      nomor: 4,
      keterangan: "Public Mint",
    },
  ],
};
