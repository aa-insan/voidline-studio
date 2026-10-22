import { Link } from "react-router-dom";
import { useLanguage } from "../../../i18n/useLanguage";
import HalamanBerlatar from "../../../components/guest/HalamanBerlatar";
import SorotanKarya from "../../../components/guest/SorotanKarya";
import { collections } from "../../../data/collections";

/* =============================================================================
   HALAMAN HOME

   Halaman ini adalah wajah studio untuk pengunjung yang belum login. Tugasnya
   dua: memperkenalkan studio, dan mengarahkan pengunjung ke dua pintu utama —
   mengoleksi karya (Collections) atau membuat koleksi sendiri (Generate).

   Susunan bagian:

     1. Hero        kalimat pembuka + dua tombol utama
     2. Sorotan      tiga angka singkat tentang studio — papan merah
     3. Koleksi      pratinjau tiga koleksi sebagai kartu PUTIH
     4. Generate     penjelasan singkat cara kerja generator
     5. Penutup      ajakan mengoleksi

   IRAMA WARNA
   Seluruh halaman berlatar HITAM — itulah dindingnya. Yang membedakan satu
   bagian dari bagian lain bukanlah warna latarnya (semuanya hitam), melainkan
   apa yang ditempel di atasnya:

     · kartu koleksi, panel, dan kotak adalah PUTIH — benda yang menonjol
     · angka dan garis pemandu adalah MERAH
     · jalur merah tipis di hero memberi kedalaman tanpa menambah warna

   Karena latarnya sudah hitam, bagian yang dulunya "blok hitam penekan" tidak
   perlu apa-apa lagi — ia cukup dibiarkan kosong. Yang perlu ditandai justru
   kebalikannya: papan merah di bagian Sorotan, satu-satunya bidang penuh warna
   di situs.

   SEMUA teks diambil dari kamus bahasa lewat t("..."), tidak ada satu pun yang
   ditulis langsung di sini. Menambah bahasa baru cukup dari kamus.

   Gambar karya belum tersedia, jadi kartu koleksi memakai tempat kosong yang
   sama dengan halaman /collection. Begitu gambar ada, ubah di satu tempat:
   src/data/collections.ts.
   ============================================================================= */

/** Langkah-langkah cara kerja generator, dipakai di bagian Generate. */
const GENERATE_STEPS = [
  "home.generate.steps.upload",
  "home.generate.steps.set",
  "home.generate.steps.done",
] as const;

export default function HomePage() {
  const { t } = useLanguage();

  // Tiga koleksi pertama dianggap unggulan. Halaman /collection tetap
  // menampilkan daftar lengkapnya.
  const featured = collections.slice(0, 3);

  return (
    /* Pembungkus halaman: satu-satunya tempat hujan dipasang. `flex-1` membuat
       halaman pendek tetap mengisi sampai footer, dan `relative isolate`
       menahan latar di dalam halaman ini saja. */
    <HalamanBerlatar>

      {/* ── 1. HERO ───────────────────────────────────────────────────────
          Dibuka dengan garis aksen merah setebal 4px di tepi atas — penanda
          "halaman dimulai di sini", mengulang garis yang sama di bawah navbar.
          Kedalaman bidang hitam kini datang dari lapisan asap di pembungkus
          halaman, bukan dari jalur garis miring di dalam section ini. */}
      <section className="relative border-t-4 border-accent">
        <div className="relative mx-auto max-w-6xl px-5 pb-16 pt-16 sm:pb-24 sm:pt-24">
          <div className="max-w-3xl">
            {/* Penanda atas: garis merah + label renggang, sama bentuknya
                dengan kicker di halaman About Us. */}
            <p className="inline-flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.28em] text-void-red">
              <span className="h-px w-8 bg-void-red" aria-hidden="true" />
              {t("home.hero.badge")}
            </p>

            <h1 className="mt-6 font-display text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl lg:text-6xl">
              {t("home.hero.title")}
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-relaxed text-fg-muted sm:text-lg">
              {t("home.hero.subtitle")}
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/collection"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-void-red px-6 py-3 text-sm font-semibold text-void-white transition-opacity hover:opacity-90"
              >
                {t("home.hero.ctaCollections")}
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
                  <path d="M12.97 5.47a.75.75 0 0 1 1.06 0l6 6a.75.75 0 0 1 0 1.06l-6 6a.75.75 0 1 1-1.06-1.06l4.72-4.72H4.75a.75.75 0 0 1 0-1.5h12.94l-4.72-4.72a.75.75 0 0 1 0-1.06Z" />
                </svg>
              </Link>

              <Link
                to="/compose"
                className="inline-flex items-center justify-center rounded-xl border border-border px-6 py-3 text-sm font-semibold text-fg transition-colors hover:border-void-red hover:text-void-red"
              >
                {t("home.hero.ctaGenerate")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. KARYA PILIHAN ─────────────────────────────────────────────
          Ditaruh tepat setelah hero: pengunjung baru mendarat, dan yang
          pertama dicari adalah bukti bahwa studio ini punya karya. Daftar
          koleksi (bagian 4) memberi nama koleksi; bagian ini memberi karya. */}
      <SorotanKarya />

      {/* ── 3. ANGKA ──────────────────────────────────────────────────────
          Satu-satunya bidang merah penuh di situs. Ditaruh di sini karena
          angkanya sedikit dan besar — cocok dibaca di atas merah. Tiga angka
          memakai Cinzel, sama seperti nomor "01 / 02" di halaman About Us. */}
      <section className="bg-void-red text-void-white">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-px sm:grid-cols-3">
          <div className="px-5 py-8 text-center sm:text-left">
            <p className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              {collections.length}
            </p>
            <p className="mt-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-void-white/75">
              {t("home.stats.collections")}
            </p>
          </div>
          {/* Jumlah karya belum tetap: karya per koleksi belum didefinisikan. */}
          <div className="px-5 py-8 text-center sm:text-left">
            <p className="font-display text-3xl font-bold tracking-tight sm:text-4xl">—</p>
            <p className="mt-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-void-white/75">
              {t("home.stats.artworks")}
            </p>
          </div>
          <div className="px-5 py-8 text-center sm:text-left">
            <p className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              {t("home.stats.standardValue")}
            </p>
            <p className="mt-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-void-white/75">
              {t("home.stats.standard")}
            </p>
          </div>
        </div>
      </section>

      {/* ── 3. KOLEKSI UNGGULAN ─────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
        <header className="max-w-2xl">
          <p className="inline-flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.28em] text-void-red">
            <span className="h-px w-8 bg-void-red" aria-hidden="true" />
            {t("home.collections.kicker")}
          </p>
          <h2 className="mt-4 font-display text-2xl font-bold tracking-tight sm:text-3xl">
            {t("home.collections.title")}
          </h2>
          <p className="mt-3 leading-relaxed text-fg-muted">
            {t("home.collections.subtitle")}
          </p>
        </header>

        {/* Kartu PUTIH di atas dinding hitam. Karena panelnya kini berwarna
            terang, seluruh teks di dalamnya memakai keluarga panel-* —
            bukan fg / fg-muted yang putih dan tidak akan terbaca di sini. */}
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {featured.map((collection) => (
            <article
              key={collection.slug}
              className="group flex flex-col overflow-hidden rounded-2xl border-2 border-transparent bg-panel shadow-brand-md transition-colors hover:border-accent"
            >
              {/* Ruang gambar karya — diisi setelah NFT-nya tersedia.
                  Di dalam panel putih, ruang kosong ini dibuat hitam supaya
                  tetap terbaca sebagai "gambar belum ada", bukan sebagai
                  bagian dari kertasnya. */}
              <div className="relative grid aspect-4/3 place-items-center overflow-hidden bg-void-black">
                <div
                  aria-hidden="true"
                  className="absolute -left-1/4 top-0 h-full w-1/2 rotate-12 bg-linear-to-r from-void-red/25 to-transparent"
                />
                <span className="relative text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-void-white/60">
                  {t("collection.imageSoon")}
                </span>
              </div>

              <div className="flex flex-1 flex-col p-5">
                <h3 className="font-display text-lg font-semibold tracking-tight text-panel-fg">
                  {t(collection.titleKey)}
                </h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-panel-fg-muted">
                  {t(collection.subtitleKey)}
                </p>

                <Link
                  to={`/collection/mint/${collection.slug}`}
                  className="mt-5 inline-block rounded-xl bg-void-red px-5 py-2.5 text-center text-sm font-semibold text-void-white transition-opacity hover:opacity-90"
                >
                  {t("collection.mintNow")}
                </Link>
              </div>
            </article>
          ))}
        </div>

        <div className="mt-8">
          <Link
            to="/collection"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-void-red underline-offset-4 hover:underline"
          >
            {t("home.collections.viewAll")}
            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
              <path d="M9.47 5.47a.75.75 0 0 1 1.06 0l6 6a.75.75 0 0 1 0 1.06l-6 6a.75.75 0 1 1-1.06-1.06L14.19 12 9.47 7.28a.75.75 0 0 1 0-1.06Z" />
            </svg>
          </Link>
        </div>
      </section>

      {/* ── 4. GENERATE ───────────────────────────────────────────────────
          Karena latarnya sudah hitam, tiga langkah di sini tidak perlu lagi
          blok gelap tersendiri — cukup kotak bergaris tipis. Yang menandai
          urutannya adalah angka merah besar. */}
      <section className="border-y border-border">
        <div className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.28em] text-void-red">
              <span className="h-px w-8 bg-void-red" aria-hidden="true" />
              {t("home.generate.kicker")}
            </p>
            <h2 className="mt-4 font-display text-2xl font-bold tracking-tight sm:text-3xl">
              {t("home.generate.title")}
            </h2>
            <p className="mt-3 leading-relaxed text-fg-muted">
              {t("home.generate.subtitle")}
            </p>
          </div>

          {/* Tiga langkah bernomor. Angka ditulis sebagai teks supaya tetap
              terbaca meski gambar/gaya mati. */}
          <ol className="mt-10 grid gap-4 sm:grid-cols-3">
            {GENERATE_STEPS.map((key, index) => (
              <li
                key={key}
                className="rounded-2xl border border-border bg-surface p-5 transition-colors hover:border-void-red/60"
              >
                <span className="font-display text-2xl font-bold leading-none text-void-red">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <p className="mt-4 text-sm leading-relaxed text-fg">{t(key)}</p>
              </li>
            ))}
          </ol>

          <div className="mt-8">
            <Link
              to="/compose"
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-void-red underline-offset-4 hover:underline"
            >
              {t("home.generate.cta")}
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
                <path d="M9.47 5.47a.75.75 0 0 1 1.06 0l6 6a.75.75 0 0 1 0 1.06l-6 6a.75.75 0 1 1-1.06-1.06L14.19 12 9.47 7.28a.75.75 0 0 1 0-1.06Z" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ── 5. PENUTUP ──────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-5 py-16 text-center sm:py-20">
        <h2 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
          {t("home.closing.title")}
        </h2>
        <p className="mx-auto mt-3 max-w-xl leading-relaxed text-fg-muted">
          {t("home.closing.subtitle")}
        </p>
        <Link
          to="/collection"
          className="mt-8 inline-block rounded-xl bg-accent px-6 py-3 text-sm font-semibold text-accent-fg shadow-brand-md transition-opacity hover:opacity-90"
        >
          {t("home.closing.cta")}
        </Link>
      </section>
    </HalamanBerlatar>
  );
}
