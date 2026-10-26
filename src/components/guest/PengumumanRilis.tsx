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

import { rilis } from "../../data/rilis";
import infMomApe from "../../assets/Inf-MomApe.gif";

type Props = {
  /** Dipakai sebagai hero /new-collection: judul <h1> dan jarak kepala halaman. */
  utama?: boolean;
};

export default function PengumumanRilis({ utama = false }: Props) {
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

        {/* Kalimat pengumuman: angka edisi dan tanggal dicetak merah. */}
        <p className="mt-2 font-semibold uppercase tracking-[0.2em] text-void-white [font-size:clamp(0.6rem,0.5rem+0.9vw,0.875rem)] sm:mt-3">
          {rilis.pengumuman.map((bagian, i) => (
            <span key={i} className={bagian.merah ? "text-void-red" : undefined}>
              {bagian.teks}
            </span>
          ))}
        </p>

        {/* Batch: label "Batch N :" merah di awal kalimat, isi putih mengalir
            di baris yang sama, baris lanjutan menjorok sejajar (indentasi
            gantung). Jendela waktu ikut mengalir di akhir kalimat. */}
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
