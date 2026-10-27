/* =============================================================================
   PENGUMUMAN RILIS — JADWAL DROP KOLEKSI TERBARU

   Satu tempat untuk seluruh isi pengumuman di halaman atrium: judul, kalimat
   pembuka, dan jadwal batch. Halaman / hanya merender; tidak ada teks drop yang
   ditulis di dalam komponen.

   ── MENGISI DROP BERIKUTNYA ────────────────────────────────────────────────
   Ganti `judul`, `pengumuman`, dan isi `batch`. `jendela` boleh dikosongkan
   untuk batch tanpa jendela waktu (mis. Public Mint) — tanda kurung waktunya
   otomatis tidak dirender. `tutup: true` mencoret batch yang masa klaimnya
   sudah lewat; hapus penanda itu (atau biarkan kosong) untuk batch yang masih
   terbuka — hanya batch terbuka yang tampil normal tanpa coret.

   ── CATATAN TANGGAL & JAM ──────────────────────────────────────────────────
   Jadwal dengan tanggal dan jam cepat basi begitu hari-H lewat, sementara
   drop sendiri bisa berjalan lebih lama dari rencana. Karena itu pengumuman
   ditulis TANPA tanggal dan batch TANPA jendela jam — pembaca cukup tahu apa
   yang didapat dan siapa yang berhak. Kalau drop berikutnya punya jadwal
   pasti, tambahkan kembali `jendela` per batch dan tanggal di `pengumuman`.
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
  /**
   * Batch sudah ditutup (masa klaimnya lewat) → dicoret di layar.
   * Hanya batch yang masih terbuka yang tidak dicoret.
   */
  tutup?: boolean;
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
    { teks: " ANIMATED VOIDLINE GIF ART — " },
    { teks: "LIVE NOW", merah: true },
  ],
  batch: [
    {
      nomor: 1,
      keterangan:
        "2 Freemints for all holders of my work in the Jajang Voidline album",
      tutup: true,
    },
    {
      nomor: 2,
      keterangan:
        "1 Freemint for 30 top holders of my work in the Apes Voidline album",
      tutup: true,
    },
    {
      nomor: 3,
      keterangan: "50% off for all top holders of my art in the Apes Voidline album",
      tutup: true,
    },
    {
      nomor: 4,
      keterangan: "Public Mint",
    },
  ],
};
