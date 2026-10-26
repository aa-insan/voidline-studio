/* =============================================================================
   PENGUMUMAN RILIS — satu komponen, dua tempat

   Isi pengumuman (judul, kalimat, jadwal batch) berasal dari
   src/data/rilis.ts. Komponen ini hanya merender; tidak ada teks drop yang
   ditulis di sini.

   DIPAKAI DI:
     · /new-collection  → `utama` (hero halaman: <h1>, judul besar)
     · /  (Atrium)      → tanpa `utama` (blok pengingat di atas penutup)

   Varian `utama` memakai <h1> karena di halaman itu pengumuman inilah judul
   utamanya. Varian biasa memakai <h2> supaya tidak ada dua <h1> dalam satu
   halaman — Atrium sudah punya <h1> sendiri di bagian hero.

   IRAMA WARNA mengikuti aturan situs: latar hitam, angka dan tanggal merah,
   sisanya putih. GIF hanya sebagai penutup visual, bukan latar.
   ============================================================================= */

import { Link } from "react-router-dom";
import { useLanguage } from "../../i18n/useLanguage";
import { rilis } from "../../data/rilis";
import infMomApe from "../../assets/Inf-MomApe.gif";

type Props = {
  /** Dipakai sebagai hero /new-collection: judul <h1> dan jarak kepala halaman. */
  utama?: boolean;
  /**
   * Hanya judul + GIF. Dipakai di Atrium, tempat pengumuman hanya pengingat —
   * rincian jadwal dan batch sengaja tidak diulang di sana supaya tidak
   * bersaing dengan hero studio. Rincian lengkap tetap ada di /new-collection.
   */
  ringkas?: boolean;
};

export default function PengumumanRilis({ utama = false, ringkas = false }: Props) {
  const { t } = useLanguage();
  const Judul = utama ? "h1" : "h2";

  return (
    <section className="relative isolate overflow-hidden">
      {/* Teks di atas gambar, tanpa latar sendiri — mengikuti latar halaman. */}
      <div
        className={`wadah pb-6 text-center sm:pb-8 ${
          utama ? "bagian-kepala-halaman" : "pt-14 sm:pt-20"
        }`}
      >
        <Judul
          className={
            utama
              ? "judul-halaman text-void-red"
              : "font-display font-bold leading-[1.1] tracking-[0.03em] text-void-red [font-size:clamp(1.5rem,1rem+4vw,3rem)]"
          }
        >
          {rilis.judul}
        </Judul>

        {!ringkas && (
          <>
            {/* Kalimat pengumuman: angka edisi dan tanggal dicetak merah. */}
            <p className="mt-2 font-semibold uppercase tracking-[0.2em] text-void-white [font-size:clamp(0.6rem,0.5rem+0.9vw,0.875rem)] sm:mt-3">
              {rilis.pengumuman.map((bagian, i) => (
                <span key={i} className={bagian.merah ? "text-void-red" : undefined}>
                  {bagian.teks}
                </span>
              ))}
            </p>

            {/* Batch: label "Batch N :" merah di awal kalimat, isi putih
                mengalir di baris yang sama, baris lanjutan menjorok sejajar
                (indentasi gantung). Jendela waktu ikut mengalir di akhir. */}
            <ol className="mx-auto mt-3 max-w-3xl space-y-2 text-left sm:mt-5">
              {rilis.batch.map((batch) => (
                <li
                  key={batch.nomor}
                  className="flex text-void-white [font-size:clamp(0.72rem,0.6rem+1.1vw,0.95rem)] leading-relaxed"
                >
                  <span className="shrink-0 font-semibold uppercase tracking-wider text-void-red">
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

        {/* ── Ajakan ke /new-collection ────────────────────────────────
            Hanya di Atrium. Pengunjung melihat judul dan GIF, tapi tanpa satu
            kalimat pun yang menjelaskan bahwa rincian klaim ada di halaman
            lain — jadi diberikan satu kalimat pengantar plus tombol yang jelas
            tujuannya. Di /new-collection blok ini tidak perlu: pengunjung
            sudah berada di halaman tujuannya. */}
        {ringkas && (
          <div className="mx-auto mt-5 max-w-xl sm:mt-6">
            <p className="text-sm leading-relaxed text-fg-muted">
              {t("home.rilis.pengantar")}
            </p>
            <Link to="/new-collection" className="tombol tombol-garis mt-5">
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
      <img
        src={infMomApe}
        alt={rilis.judul}
        width={1184}
        height={241}
        decoding="async"
        loading={utama ? "eager" : "lazy"}
        fetchPriority={utama ? "high" : "auto"}
        className="h-auto w-full"
      />
    </section>
  );
}
