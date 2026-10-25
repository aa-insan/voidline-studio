import { Link } from "react-router-dom";
import { useLanguage } from "../../../i18n/useLanguage";
import HalamanBerlatar from "../../../components/guest/HalamanBerlatar";
import { collections } from "../../../data/collections";
import { rilis } from "../../../data/rilis";
import { karyaPerKelompok, urutanKelompok, kodeDariTaxon, type KodeKelompok, type KaryaNft } from "../../../data/karyaNft";
import { daftarAlamat } from "../../../services/gambarKarya";

import infMomApe from "../../../assets/Inf-MomApe.gif";

/* =============================================================================
   HALAMAN HOME

   Halaman ini adalah wajah studio untuk pengunjung yang belum login. Tugasnya
   dua: memperkenalkan studio, dan mengarahkan pengunjung ke dua pintu utama —
   mengoleksi karya (Collections) atau membuat koleksi sendiri (Generate).

   Susunan bagian:

     0. Rilis       jadwal drop koleksi terbaru + GIF selebar layar
     1. Hero        kalimat pembuka + dua tombol utama
     2. Angka       tiga angka studio — papan merah
     3. Koleksi     pratinjau tiga koleksi sebagai kartu PUTIH
     4. Galeri      strip karya terbaru dari ledger
     5. Penutup     ajakan mengoleksi

   IRAMA WARNA
   Seluruh halaman berlatar HITAM — itulah dindingnya. Yang membedakan satu
   bagian dari bagian lain bukanlah warna latarnya (semuanya hitam), melainkan
   apa yang ditempel di atasnya:

     · kartu koleksi, panel, dan kotak adalah PUTIH — benda yang menonjol
     · angka dan garis pemandu adalah MERAH
     · jalur merah tipis di hero memberi kedalaman tanpa menambah warna

   Karena latarnya sudah hitam, bagian yang dulunya "blok hitam penekan" tidak
   perlu apa-apa lagi — ia cukup dibiarkan kosong. Yang perlu ditandai justru
   kebalikannya: papan merah di bagian angka — satu-satunya bidang penuh warna
   di situs.

   SEMUA teks diambil dari kamus bahasa lewat t("..."), tidak ada satu pun yang
   ditulis langsung di sini. Menambah bahasa baru cukup dari kamus.

   Gambar karya belum tersedia, jadi kartu koleksi memakai tempat kosong yang
   sama dengan halaman /collection. Begitu gambar ada, ubah di satu tempat:
   src/data/collections.ts.
   ============================================================================= */

/** Jumlah karya di galeri terbaru — satu baris memanjang yang bisa digulir. */
const JUMLAH_GALERI = 12;

export default function HomePage() {
  const { t } = useLanguage();

  // Tiga koleksi pertama dianggap unggulan. Halaman /collection tetap
  // menampilkan daftar lengkapnya.
  const featured = collections.slice(0, 3);

  // Jumlah karya total di semua kelompok — angka yang sama dengan grid
  // halaman /collection, dihitung dari berkas data yang dibuat
  // scripts/tarik-karya.py, bukan angka tulis tangan.
  const jumlahKarya = urutanKelompok.reduce(
    (total, kode) => total + (karyaPerKelompok[kode]?.length ?? 0),
    0,
  );

  // Satu karya nyata per koleksi unggulan: karya pertama dari kelompok
  // bertaxon yang sama. Taxon tidak dikenal → kartu tetap placeholder.
  const karyaUnggulan = new Map(
    collections.map((c) => {
      const kode = c.taxon !== undefined ? kodeDariTaxon[c.taxon] : undefined;
      const karya = kode ? karyaPerKelompok[kode]?.[0] : undefined;
      return [c.slug, karya] as const;
    }),
  );

  // Slug → kode kelompok, untuk tombol yang membuka /collection dengan
  // filter koleksi itu sudah aktif (?filter=<kode>).
  const kodeUnggulan = new Map(
    collections.map((c) => {
      const kode = c.taxon !== undefined ? kodeDariTaxon[c.taxon] : undefined;
      return [c.slug, kode] as const;
    }),
  );

  // 12 karya dari ledger, interleaved dari keenam kelompok — supaya galeri
  // merata mewakili seluruh koleksi. Karya diambil langsung dari karyaNft.ts
  // (data yang sudah diperbarui oleh scripts/tarik-karya.py).
  // 12 karya dari ledger, interleaved dari keenam kelompok — supaya galeri
  // merata mewakili seluruh koleksi. Karya diambil langsung dari karyaNft.ts
  // (data yang sudah diperbarui oleh scripts/tarik-karya.py).
  const perKelompok = Object.fromEntries(
    urutanKelompok.map((kode) => [kode, karyaPerKelompok[kode] ?? []] as const),
  );
  const galeri: Array<{ kode: KodeKelompok; karya: KaryaNft }> = [];
  for (let i = 0; galeri.length < JUMLAH_GALERI; i++) {
    for (const kode of urutanKelompok) {
      const barisan = perKelompok[kode];
      if (i < barisan.length) {
        galeri.push({ kode, karya: barisan[i] });
        if (galeri.length >= JUMLAH_GALERI) break;
      }
    }
  }

  return (
    /* Pembungkus halaman: satu-satunya tempat hujan dipasang. `flex-1` membuat
       halaman pendek tetap mengisi sampai footer, dan `relative isolate`
       menahan latar di dalam halaman ini saja. */
    <HalamanBerlatar>

      {/* ── 0. PENGUMUMAN RILIS ───────────────────────────────────────
          Satu bagian, dua lapis yang menempel: jadwal drop sebagai teks,
          langsung disusul GIF selebar layar tanpa jarak. Teks lebih dulu
          supaya ketentuan terbaca sebelum gerakan gambar menarik mata. */}
      <section className="relative isolate overflow-hidden">
        {/* ── Jadwal drop: teks di ATAS gambar ─────────────────────────────
            Tanpa latar sendiri — mengikuti latar halaman (hujan garis) seperti
            bagian lain, bukan bidang hitam tersendiri. */}
        <div className="wadah bagian-kepala-halaman pb-6 text-center sm:pb-8">
          {/* Judul: huruf pahat Cinzel — wajah "gothic" situs ini. Huruf
              kecilnya sudah berbentuk kapital kecil, jadi teksnya tetap
              ditulis apa adanya ("Mom Apes Voidline") dan tampil bergaya
              pahat tanpa perlu diubah jadi kapital semua. Skalanya satu
              ramping mengikuti lebar layar — cara yang sama dengan GIF
              yang menyusut. */}
          <h2 className="font-display font-bold leading-[1.1] tracking-[0.03em] text-void-red [font-size:clamp(1.5rem,1rem+4vw,3rem)]">
            {rilis.judul}
          </h2>

          {/* Kalimat pengumuman: angka edisi dan tanggal dicetak merah. */}
          <p className="mt-2 font-semibold uppercase tracking-[0.2em] text-void-white [font-size:clamp(0.6rem,0.5rem+0.9vw,0.875rem)] sm:mt-3">
            {rilis.pengumuman.map((bagian, i) => (
              <span key={i} className={bagian.merah ? "text-void-red" : undefined}>
                {bagian.teks}
              </span>
            ))}
          </p>

          {/* Empat batch: label "Batch N :" merah menempel di awal kalimat,
              isi putih mengalir di baris yang sama, dan baris lanjutan
              menjorok sejajar dengan isi (indentasi gantung). Jendela waktu
              ikut mengalir di akhir kalimat. */}
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

        {/* GIF selebar layar — berkasnya sudah dipangkas band hitam kosongnya
            (dulu 62% atasnya kosong), jadi visualnya langsung menyambung
            dengan teks di atasnya tanpa jurang. */}
        <img
          src={infMomApe}
          alt={rilis.judul}
          width={1184}
          height={241}
          decoding="async"
          className="h-auto w-full"
        />
      </section>

      {/* ── 1. HERO ───────────────────────────────────────────────────────
          Dipisah dari blok pengumuman di atasnya dengan garis abu-abu tipis,
          sama seperti pembatas antar section di tempat lain. Kedalaman bidang
          hitam datang dari lapisan asap di pembungkus halaman. */}
      <section className="relative border-t border-border">
        <div className="wadah bagian-kepala-halaman pb-16 sm:pb-24">
          <div className="max-w-3xl">
            {/* Penanda atas: garis merah + label renggang, sama bentuknya
                dengan kicker di halaman About Us. */}
            <p className="kicker">
              <span className="kicker-garis" aria-hidden="true" />
              {t("home.hero.badge")}
            </p>

            <h1 className="judul-halaman mt-6">
              {t("home.hero.title")}
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-relaxed text-fg-muted sm:text-lg">
              {t("home.hero.subtitle")}
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link to="/collection" className="tombol tombol-merah">
                {t("home.hero.ctaCollections")}
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
                  <path d="M12.97 5.47a.75.75 0 0 1 1.06 0l6 6a.75.75 0 0 1 0 1.06l-6 6a.75.75 0 1 1-1.06-1.06l4.72-4.72H4.75a.75.75 0 0 1 0-1.5h12.94l-4.72-4.72a.75.75 0 0 1 0-1.06Z" />
                </svg>
              </Link>

              <Link to="/new-collection" className="tombol tombol-garis">
                {t("home.hero.ctaLatestCollection")}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 2. ANGKA ──────────────────────────────────────────────────────
          Satu-satunya bidang merah penuh di situs. Ditaruh di sini karena
          angkanya sedikit dan besar — cocok dibaca di atas merah. Tiga angka
          memakai Cinzel, sama seperti nomor "01 / 02" di halaman About Us. */}
      <section className="bg-void-red text-void-white">
        <div className="wadah grid grid-cols-1 gap-y-2 py-10 text-center sm:grid-cols-3 sm:gap-y-0 sm:py-10 sm:divide-x sm:divide-white/20 sm:text-left">
          <div className="px-5 py-4 sm:py-2">
            <p className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              {collections.length}
            </p>
            <p className="mt-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-void-white/75">
              {t("home.stats.collections")}
            </p>
          </div>
          {/* Jumlah karya dihitung dari data ledger yang ditarik
              scripts/tarik-karya.py — selalu sepadan dengan grid /collection. */}
          <div className="px-5 py-2">
            <p className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              {jumlahKarya}
            </p>
            <p className="mt-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-void-white/75">
              {t("home.stats.artworks")}
            </p>
          </div>
          <div className="px-5 py-2">
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
      {/* ── 3. KOLEKSI UNGGULAN ─────────────────────────────────────────── */}
      <section>
        <div className="wadah bagian">
          <header className="max-w-2xl">
            <p className="kicker">
              <span className="kicker-garis" aria-hidden="true" />
              {t("home.collections.kicker")}
            </p>
            <h2 className="judul-bagian mt-4">
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
                className="group flex flex-col overflow-hidden rounded-2xl border border-transparent bg-panel shadow-brand-md transition-colors hover:border-accent"
              >
                {/* Gambar karya nyata dari ledger — karya pertama koleksi ini.
                    Gateway gagal → pindah ke berikutnya, sama seperti kartu di
                    grid /collection. Belum ada karya → placeholder lama. */}
                <div className="relative grid aspect-4/3 place-items-center overflow-hidden bg-void-black">
                  {(() => {
                    const karya = karyaUnggulan.get(collection.slug);
                    if (!karya) {
                      return (
                        <>
                          <div
                            aria-hidden="true"
                            className="absolute -left-1/4 top-0 h-full w-1/2 rotate-12 bg-linear-to-r from-void-red/25 to-transparent"
                          />
                          <span className="relative text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-void-white/60">
                            {t("collection.imageSoon")}
                          </span>
                        </>
                      );
                    }
                    const [, judul, uri] = karya;
                    return (
                      <img
                        src={daftarAlamat(uri)[0]}
                        alt={judul}
                        loading="lazy"
                        decoding="async"
                        width={600}
                        height={450}
                        className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                      />
                    );
                  })()}
                </div>

                <div className="flex flex-1 flex-col p-5">
                  <h3 className="font-display text-lg font-semibold tracking-tight text-panel-fg">
                    {t(collection.titleKey)}
                  </h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-panel-fg-muted">
                    {t(collection.subtitleKey)}
                  </p>

                  <Link
                    to={
                      kodeUnggulan.get(collection.slug)
                        ? `/collection?filter=${kodeUnggulan.get(collection.slug)}`
                        : "/collection"
                    }
                    className="tombol tombol-merah mt-5 w-full"
                  >
                    {t("collection.viewCollection")}
                  </Link>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-8">
            <Link to="/collection" className="tautan-lanjut">
              {t("home.collections.viewAll")}
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
                <path d="M9.47 5.47a.75.75 0 0 1 1.06 0l6 6a.75.75 0 0 1 0 1.06l-6 6a.75.75 0 1 1-1.06-1.06L14.19 12 9.47 7.28a.75.75 0 0 1 0-1.06Z" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ── 4. GALERI TERBARU ─────────────────────────────────────────────
          Strip memanjang yang bisa digulir ke samping — 12 karya nyata dari
          ledger, bergantian dari keenam kelompok. Banyak karya terlihat
          sekaligus, mengajak pengunjung masuk ke /collection. */}
      <section className="border-y border-border">
        <div className="wadah bagian">
          <div className="max-w-2xl">
            <p className="kicker">
              <span className="kicker-garis" aria-hidden="true" />
              {t("home.gallery.kicker")}
            </p>
            <h2 className="judul-bagian mt-4">
              {t("home.gallery.title")}
            </h2>
            <p className="mt-3 leading-relaxed text-fg-muted">
              {t("home.gallery.subtitle")}
            </p>
          </div>

          {/* Baris galeri: gambar diklik → halaman detail karya. Gambarnya
              GIF asli dari IPFS — dua belas saja, jadi tetap ringan. */}
          {/* Baris galeri: gambar diklik → halaman detail karya. Gambarnya
              GIF asli dari IPFS — dua belas saja, jadi tetap ringan. Strip
              memakai snap-scroll: di layar sentuh kartu berhenti rapi di
              tepian, bukan tercecer di tengah. */}
          <div className="scrollbar-none mt-10 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 [scroll-padding-inline:1.25rem]">
            {galeri.map(({ kode, karya }) => {
              const [, judul, uri, nftId] = karya;
              return (
                <Link
                  key={nftId}
                  to={`/collection/work/${nftId}`}
                  className="group w-40 shrink-0 snap-start sm:w-44"
                  aria-label={judul}
                >
                  <div className="aspect-square overflow-hidden rounded-xl border border-border bg-void-black">
                    <img
                      src={daftarAlamat(uri)[0]}
                      alt={judul}
                      loading="lazy"
                      decoding="async"
                      width={300}
                      height={300}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.05]"
                    />
                  </div>
                  <p className="mt-2 truncate text-xs font-semibold text-fg-muted" title={judul}>
                    {judul}
                  </p>
                  <p className="text-[0.65rem] uppercase tracking-wider text-fg-muted/70">
                    {t(`collection.kelompok.${kode}`)}
                  </p>
                </Link>
              );
            })}
          </div>

          <div className="mt-6">
            <Link to="/collection" className="tautan-lanjut">
              {t("home.gallery.cta")}
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
                <path d="M12.97 5.47a.75.75 0 0 1 1.06 0l6 6a.75.75 0 0 1 0 1.06l-6 6a.75.75 0 1 1-1.06-1.06l4.72-4.72H4.75a.75.75 0 0 1 0-1.5h12.94l-4.72-4.72a.75.75 0 0 1 0-1.06Z" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ── 5. PENUTUP ──────────────────────────────────────────────────── */}
      <section>
        <div className="wadah bagian text-center">
          <h2 className="judul-bagian">
            {t("home.closing.title")}
          </h2>
          <p className="mx-auto mt-3 max-w-xl leading-relaxed text-fg-muted">
            {t("home.closing.subtitle")}
          </p>
          <Link to="/collection" className="tombol tombol-merah mt-8">
            {t("home.closing.cta")}
          </Link>
        </div>
      </section>
    </HalamanBerlatar>
  );
}
