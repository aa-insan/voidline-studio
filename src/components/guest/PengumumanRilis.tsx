/* =============================================================================
   PENGUMUMAN RILIS — satu komponen, dua tempat

   Isi pengumuman (judul, kalimat, jadwal batch) berasal dari
   src/data/rilis.ts. Komponen ini hanya merender; tidak ada teks drop yang
   ditulis di sini.

   DIPAKAI DI:
     · /  (Atrium)      → `ringkas`: judul + GIF + ajakan ke /information
     · /information     → `tanpaJudul`: hanya kalimat pengumuman + jadwal
                          batch, menempel di dalam kepala halaman di bawah
                          judul "Koleksi Terbaru". GIF tidak dipakai di sana
                          karena karya aslinya sudah tampil di grid bawah.

   IRAMA WARNA mengikuti aturan situs: latar hitam, angka dan tanggal merah,
   sisanya putih. GIF hanya sebagai penutup visual, bukan latar.
   ============================================================================= */

import { Link } from "react-router-dom";
import { useLanguage } from "../../i18n/useLanguage";
import { rilis } from "../../data/rilis";
import infMomApe from "../../assets/atrium/hero_section.jpeg";

type Props = {
  /**
   * Varian Atrium: pengingat visual — judul, GIF, lalu satu kalimat dan tombol
   * menuju /information. Rincian batch tidak ikut supaya Atrium tetap ringkas.
   */
  ringkas?: boolean;
  /**
   * Varian /information: tanpa judul dan tanpa GIF. Komponen dipakai di
   * dalam <header> halaman, jadi judul rilis sudah diwakili judul halaman —
   * yang dibutuhkan hanya keterangan dan jadwal batch-nya.
   */
  tanpaJudul?: boolean;
};

export default function PengumumanRilis({ ringkas = false, tanpaJudul = false }: Props) {
  const { t } = useLanguage();

  return (
    <section className={ringkas ? "relative isolate overflow-hidden" : undefined}>
      <div
        className={
          ringkas
            ? "wadah pt-14 pb-6 text-center sm:pt-20 sm:pb-8"
            : "text-left"
        }
      >
        {/* Judul rilis — dilewati saat komponen dipakai di dalam kepala halaman
            yang sudah punya judulnya sendiri. */}
        {!tanpaJudul && (
          <h2 className="font-display font-bold leading-[1.1] tracking-[0.03em] text-void-red [font-size:clamp(1.5rem,1rem+4vw,3rem)]">
            {rilis.judul}
          </h2>
        )}

        {!ringkas && (
          <>
            {/* Label "Information :" — penciri bagian, dicetak merah selaras
                dengan label batch dan rambu situs. */}
            <p className="mt-2 font-semibold uppercase tracking-[0.22em] text-accent-bright [font-size:clamp(0.6rem,0.5rem+0.9vw,0.8rem)] sm:mt-3">
              Information&nbsp;:
            </p>

            {/* Kalimat pengumuman: angka edisi dicetak merah, sejajar kiri
                sama dengan label dan daftar batch di bawahnya. */}
            <p className="mt-2 font-semibold uppercase tracking-[0.2em] text-void-white [font-size:clamp(0.6rem,0.5rem+0.9vw,0.875rem)]">
              {rilis.pengumuman.map((bagian, i) => (
                <span key={i} className={bagian.merah ? "text-void-red" : undefined}>
                  {bagian.teks}
                </span>
              ))}
            </p>

            {/* Batch: label "Batch N :" merah di awal kalimat, isi putih
                mengalir di baris yang sama, baris lanjutan menjorok sejajar
                (indentasi gantung). Jendela waktu ikut mengalir di akhir.
                Batch yang sudah tutup dicoret seluruh barisnya dan agak
                diredupkan — yang tersisa terbaca jelas sebagai satu-satunya
                yang masih bisa diambil. */}
            <ol className="mt-3 max-w-3xl space-y-2 sm:mt-5">
              {rilis.batch.map((batch) => (
                <li
                  key={batch.nomor}
                  className={`flex [font-size:clamp(0.72rem,0.6rem+1.1vw,0.95rem)] leading-relaxed ${
                    batch.tutup ? "text-void-white/50 line-through" : "text-void-white"
                  }`}
                >
                  <span
                    className={`shrink-0 font-semibold uppercase tracking-wider ${
                      batch.tutup ? "text-void-red/60" : "text-void-red"
                    }`}
                  >
                    Batch&nbsp;{batch.nomor}&nbsp;:&nbsp;
                  </span>
                  <span>
                    {batch.keterangan}
                    {batch.jendela && (
                      <span className="tabular-nums"> {batch.jendela}</span>
                    )}
                  </span>
                </li>
              ))}
            </ol>
          </>
        )}

        {/* ── Ajakan ke /information ─────────────────────────────────────
            Hanya di Atrium. Pengunjung melihat judul dan GIF tanpa penjelasan
            bahwa rincian klaim ada di halaman lain — jadi diberi satu kalimat
            pengantar plus tombol yang jelas tujuannya. */}
        {ringkas && (
          <div className="mx-auto mt-5 max-w-xl sm:mt-6">
            <p className="text-sm leading-relaxed text-fg-muted">
              {t("home.rilis.pengantar")}
            </p>
            <Link to="/information" className="tombol tombol-garis mt-5">
              {t("home.rilis.ajakan")}
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
                <path d="M9.47 5.47a.75.75 0 0 1 1.06 0l6 6a.75.75 0 0 1 0 1.06l-6 6a.75.75 0 1 1-1.06-1.06L14.19 12 9.47 7.28a.75.75 0 0 1 0-1.06Z" />
              </svg>
            </Link>
          </div>
        )}
      </div>

      {/* GIF selebar layar — berkasnya sudah dipangkas band hitam kosongnya,
          jadi visualnya langsung menyambung dengan teks di atasnya. */}
      {ringkas && (
        <img
          src={infMomApe}
          alt={rilis.judul}
          width={1184}
          height={241}
          decoding="async"
          loading="lazy"
          className="h-auto w-full"
        />
      )}
    </section>
  );
}
