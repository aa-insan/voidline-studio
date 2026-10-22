import { Link } from "react-router-dom";
import { useLanguage } from "../../../i18n/useLanguage";
import AboutLogo from "../../../assets/Logo.gif";
import HalamanBerlatar from "../../../components/guest/HalamanBerlatar";

/* =============================================================================
   HALAMAN STUDIO

   Halaman profil studio. Alurnya dibaca dari atas ke bawah seperti sebuah
   perkenalan: siapa kami → gaya kami → yang kami kerjakan → silakan masuk.

     1. Hero      judul + kalimat pembuka, latar hitam, logo animasi di sisi
     2. Palet     tiga warna brand, dengan contoh rakit titik & garis
     3. Gaya      penjelasan titik dan garis yang hidup
     4. Fokus     GIF animasi looping + NFT
     5. Ajak      "selamat berpetualang di pulau kami" + dua tombol

   WARNA
   Merah, hitam dan putih dipakai apa adanya lewat utilitas void-red /
   void-black / void-white — bukan lewat variabel palet. Alasannya: ketiganya
   adalah identitas studio, jadi tidak boleh ikut berubah mengikuti pilihan
   tampilan apa pun. Hitam tetap hitam, merah tetap merah.

   Karena seluruh situs sudah berlatar hitam, hero dan penutup di halaman ini
   tidak lagi menonjol karena warnanya — keduanya disatukan dengan halaman oleh
   lebar bidangnya dan oleh garis pemisah, bukan oleh perbedaan warna latar.
   Yang tersisa sebagai pembeda justru bagian PALET: tiga bidang penuh merah,
   hitam, putih, satu-satunya tempat di situs ketiga warna itu tampil
   berdampingan dalam ukuran besar.

   FONT
   Judul memakai font-display (Cinzel) — geometris dan tegas, wajah "gothic"
   yang cocok untuk brand ini. Seluruh teks isi memakai font-body (Inter),
   karena Cinzel tidak layak untuk paragraf panjang.

   GAMBAR
   Satu berkas logo di src/assets/:

     Logo.gif   1000x1000, ~20 MB — dipakai di SEMUA tempat: navbar, footer,
                dan bagian hero halaman ini. Tidak ada varian kecil.

   Berkas ini berat karena kanvasnya 1000x1000 dengan animasi penuh; pada
   ukuran ikon 48 px di navbar dan footer, isi kanvas itu tidak terpakai.
   Satu berkas dipakai di mana-mana atas keputusan pemilik brand — bukan
   kelalaian — supaya hanya ada satu sumber logo yang perlu dirawat.
   ============================================================================= */

/** Tiga warna brand, dipakai di bagian palet. */
const SWATCHES = [
  { key: "about.style.swatches.red", kelas: "bg-void-red" },
  { key: "about.style.swatches.black", kelas: "bg-void-black" },
  { key: "about.style.swatches.white", kelas: "bg-void-white" },
] as const;

export default function StudioPage() {
  const { t } = useLanguage();

  return (
    <HalamanBerlatar>
      {/* ── 1. HERO ─────────────────────────────────────────────────────────
          Border pemisah di bawah, karena latarnya kini sama dengan halaman.
          Sisi kanan diisi logo animasi yang dibingkai bulat — sama bentuknya
          dengan logo di navbar, supaya terasa satu keluarga. */}
      <section className="relative overflow-hidden border-b border-border">
        {/* Jalur dekoratif: garis-garis miring merah, mengacu pada "garis yang
            hidup" yang dibahas di halaman ini. Ditaruh sebagai lapisan latar
            tanpa teks, jadi tidak mengganggu pembacaan. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.18]"
        >
          <div className="absolute -left-1/4 top-0 h-full w-1/2 rotate-12 bg-linear-to-r from-void-red to-transparent" />
          <div className="absolute right-0 top-1/4 h-full w-1/3 -rotate-12 bg-linear-to-l from-void-red to-transparent" />
        </div>

        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 py-20 lg:grid-cols-[1.15fr_1fr] lg:py-28">
          <div>
            <p className="inline-flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.28em] text-void-red">
              <span className="h-px w-8 bg-void-red" aria-hidden="true" />
              {t("about.hero.kicker")}
            </p>

            <h1 className="mt-6 font-display text-4xl font-bold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
              {t("about.hero.title")}
            </h1>

            <p className="mt-7 max-w-xl text-base leading-relaxed text-fg-muted sm:text-lg">
              {t("about.hero.lead")}
            </p>
          </div>

          {/* Logo animasi — bingkai bulat, ukuran dibatasi supaya berkas 20 MB
              tidak dirender lebih besar dari perlunya. */}
          <div className="flex justify-center lg:justify-end">
            <div className="relative">
              {/* Cincin merah sebagai penegas, memakai warna brand. */}
              <div
                aria-hidden="true"
                className="absolute -inset-4 rounded-full border border-void-red/30"
              />
              <img
                src={AboutLogo}
                alt="Voidline Studio"
                fetchPriority="high"
                decoding="async"
                className="relative h-56 w-56 rounded-full object-cover ring-4 ring-void-red/60 sm:h-64 sm:w-64 lg:h-80 lg:w-80"
              />
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. PALET ────────────────────────────────────────────────────────
          Tiga warna brand ditampilkan sebagai bidang penuh lebar — bukan
          bulatan kecil — supaya terasa seperti pernyataan, bukan pelengkap.
          Setiap bidang diberi label dan kode warnanya. */}
      <section className="border-b border-border">
        <div className="grid grid-cols-3">
          {SWATCHES.map((swatch) => (
            <div key={swatch.key} className={`${swatch.kelas} group relative`}>
              <div className="flex h-32 flex-col items-center justify-center gap-1 sm:h-44">
                <span
                  className={`font-display text-sm font-semibold uppercase tracking-[0.2em] sm:text-base ${
                    swatch.key.endsWith("white") ? "text-void-black" : "text-void-white"
                  }`}
                >
                  {t(swatch.key)}
                </span>
              </div>
            </div>
          ))}
        </div>
        <div className="mx-auto max-w-6xl px-5 py-4">
          <p className="text-center text-xs uppercase tracking-[0.22em] text-fg-muted">
            {t("about.style.note")}
          </p>
        </div>
      </section>

      {/* ── 3 & 4. GAYA + FOKUS ─────────────────────────────────────────────
          Dua bagian berdampingan di layar lebar: "titik dan garis" di kiri,
          "GIF looping" di kanan. Di layar sempit menumpuk. */}
      <section className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
          <article>
            {/* Nomor besar sebagai penanda urutan — pengganti garis pemisah,
                sekaligus mengulang bahasa visual "garis". Di atas hitam,
                merah pekat terbaca penuh; transparansinya diturunkan supaya
                tetap berperan sebagai latar angka, bukan sebagai isi. */}
            <p
              aria-hidden="true"
              className="font-display text-5xl font-bold leading-none text-void-red/40 sm:text-6xl"
            >
              01
            </p>
            <h2 className="mt-4 font-display text-2xl font-bold tracking-tight sm:text-3xl">
              {t("about.style.title")}
            </h2>
            <p className="mt-5 leading-relaxed text-fg-muted">
              {t("about.style.body")}
            </p>
          </article>

          <article>
            <p
              aria-hidden="true"
              className="font-display text-5xl font-bold leading-none text-void-red/40 sm:text-6xl"
            >
              02
            </p>
            <h2 className="mt-4 font-display text-2xl font-bold tracking-tight sm:text-3xl">
              {t("about.focus.title")}
            </h2>
            <p className="mt-5 leading-relaxed text-fg-muted">
              {t("about.focus.body")}
            </p>
            <p className="mt-4 leading-relaxed text-fg-muted">
              {t("about.focus.body2")}
            </p>
          </article>
        </div>
      </section>

      {/* ── 5. AJAKAN ───────────────────────────────────────────────────────
          Penutup halaman. Latarnya sama dengan halaman; yang menandainya
          adalah garis pemisah di atas, jalur merah tipis, dan logo besar yang
          jadi titik henti. */}
      <section className="relative overflow-hidden border-t border-border">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.18]"
        >
          <div className="absolute -right-1/4 bottom-0 h-full w-1/2 -rotate-12 bg-linear-to-l from-void-red to-transparent" />
        </div>

        <div className="relative mx-auto max-w-6xl px-5 py-20 text-center sm:py-24">
          {/* Logo kecil sebagai jangkar visual — berkas yang sama dengan
              navbar dan footer, dipakai apa adanya. */}
          <img
            src={AboutLogo}
            alt=""
            aria-hidden="true"
            loading="lazy"
            decoding="async"
            className="mx-auto h-20 w-20 rounded-full object-cover ring-2 ring-void-red/50 sm:h-24 sm:w-24"
          />

          <h2 className="mt-8 font-display text-2xl font-bold tracking-tight sm:text-4xl">
            {t("about.invitation.title")}
          </h2>
          <p className="mx-auto mt-5 max-w-xl leading-relaxed text-fg-muted">
            {t("about.invitation.body")}
          </p>

          <div className="mt-9 flex flex-col justify-center gap-3 sm:flex-row">
            <Link
              to="/collection"
              className="inline-flex items-center justify-center rounded-xl bg-void-red px-6 py-3 text-sm font-semibold text-void-white transition-opacity hover:opacity-90"
            >
              {t("about.invitation.ctaCollections")}
            </Link>
            <Link
              to="/compose"
              className="inline-flex items-center justify-center rounded-xl border border-border-strong px-6 py-3 text-sm font-semibold text-fg transition-colors hover:border-void-red hover:text-void-red"
            >
              {t("about.invitation.ctaGenerate")}
            </Link>
          </div>
        </div>
      </section>
    </HalamanBerlatar>
  );
}
