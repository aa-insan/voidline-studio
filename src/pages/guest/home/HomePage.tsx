import { Link } from "react-router-dom";
import { useLanguage } from "../../../i18n/useLanguage";
import HalamanBerlatar from "../../../components/guest/HalamanBerlatar";
import { collections } from "../../../data/collections";
import { karyaPerKelompok, kodeGrupBaru, kelompokTampil, kodeDariTaxon, type KodeTampil, type KaryaNft } from "../../../data/karyaNft";
import { daftarAlamat } from "../../../services/gambarKarya";
import { useStatistikLedger } from "../../../services/statistikLedger";
import infMomApe from "../../../assets/atrium/hero_section.jpeg";
import heroGif from "../../../assets/atrium/hero_section2.gif";

/* =============================================================================
   HALAMAN HOME

   Halaman ini adalah wajah studio untuk pengunjung yang belum login. Tugasnya
   dua: memperkenalkan studio, dan mengarahkan pengunjung ke dua pintu utama —
   mengoleksi karya (Collections) atau membuat koleksi sendiri (Generate).

   Susunan bagian:

     1. Hero        pengumuman rilis terbaru (judul + LIVE NOW + ajakan) + GIF
     2. Angka       tiga angka studio — papan merah
     3. Koleksi     pratinjau tiga koleksi sebagai kartu PUTIH
     4. Galeri      strip karya terbaru dari ledger
     5. Penutup     ajakan mengoleksi

   Hero rilis di atas langsung membaca src/data/rilis.ts — judul, kalimat
   DROPPING…LIVE NOW, dan sumbernya sama dengan hero /information.

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

/** Jumlah karya di galeri terbaru — dibagi dua baris marquee yang berlawanan
    arah: 12 per baris (24 total). Satu baris cukup tipis; dua baris membuat
    bagian ini terasa seperti dinding galeri, bukan satu garis tipis. */
const GALERI_PER_BARIS = 12;

export default function HomePage() {
  const { t } = useLanguage();

  // Papan angka: cadangan statis dari karyaNft.ts (instan), lalu diganti
  // angka langsung dari ledger begitu statistikLedger selesai membaca.
  const statistik = useStatistikLedger();

  // Tiga koleksi pertama dianggap unggulan. Halaman /collection tetap
  // menampilkan daftar lengkapnya.
  const featured = collections.slice(0, 3);

  // Jumlah karya total di semua kelompok — angka yang sama dengan grid
  // halaman /collection, dihitung dari berkas data yang dibuat
  // scripts/tarik-karya.py, bukan angka tulis tangan.
  const jumlahKarya = kelompokTampil.reduce(
    (total, kode) => total + (karyaPerKelompok[kode]?.length ?? 0),
    0,
  );

  // Jumlah koleksi dihitung dari kelompok ledger yang benar-benar berisi
  // karya (koleksi bernama + grup terbaru) — ikut data tarik-karya.py,
  // bukan daftar statis di collections.ts yang tidak pernah bertambah
  // begitu taxon baru terbit di ledger.
  const jumlahKoleksiStatis = kelompokTampil.filter(
    (kode) => (karyaPerKelompok[kode]?.length ?? 0) > 0,
  ).length;

  // Angka akhir papan: bila ledger menjawab → pakai itu; bila tidak → statis.
  const jumlahKoleksi = statistik.koleksi ?? jumlahKoleksiStatis;
  const jumlahKaryaPapan = statistik.karya ?? jumlahKarya;

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

  // Gallery: dua baris dari dua grup berbeda.
  // Baris atas - grup terbaru (Mom Apes Voidline / "baru").
  // Baris bawah - koleksi utama Apes Voidline ("apid").
  // Jika grup baru kosong, baris atas fallback ke kelompokTampil.
  const targetGroupsAtas: readonly KodeTampil[] =
    kodeGrupBaru.length > 0 ? kodeGrupBaru : kelompokTampil;

  // Baris bawah selalu dari "apid" (Apes Voidline) - grup utama studio.
  const targetGroupsBawah: readonly KodeTampil[] = ["apid"];

  // Jumlah karya baris atas - dipakai CTA.
  const jumlahKaryaBaru = targetGroupsAtas.reduce(
    (total, kode) => total + (karyaPerKelompok[kode]?.length ?? 0),
    0,
  );

  // Baris atas: GALERI_PER_BARIS kartu dari grup terbaru.
  const perGrupAtas = Object.fromEntries(
    targetGroupsAtas.map((kode) => [kode, karyaPerKelompok[kode] ?? []] as const),
  );
  const galeriAtas: Array<{ kode: KodeTampil; karya: KaryaNft }> = [];
  for (let i = 0; galeriAtas.length < GALERI_PER_BARIS; i++) {
    for (const kode of targetGroupsAtas) {
      const barisan = perGrupAtas[kode];
      if (i < barisan.length) {
        galeriAtas.push({ kode, karya: barisan[i] });
        if (galeriAtas.length >= GALERI_PER_BARIS) break;
      }
    }
  }

  // Baris bawah: GALERI_PER_BARIS kartu dari Apes Voidline ("apid").
  const perGrupBawah = Object.fromEntries(
    targetGroupsBawah.map((kode) => [kode, karyaPerKelompok[kode] ?? []] as const),
  );
  const galeriBawah: Array<{ kode: KodeTampil; karya: KaryaNft }> = [];
  for (let i = 0; galeriBawah.length < GALERI_PER_BARIS; i++) {
    for (const kode of targetGroupsBawah) {
      const barisan = perGrupBawah[kode];
      if (i < barisan.length) {
        galeriBawah.push({ kode, karya: barisan[i] });
        if (galeriBawah.length >= GALERI_PER_BARIS) break;
      }
    }
  }

  return (
    /* Pembungkus halaman: satu-satunya tempat hujan dipasang. `flex-1` membuat
       halaman pendek tetap mengisi sampai footer, dan `relative isolate`
       menahan latar di dalam halaman ini saja. */
    <HalamanBerlatar>

      {/* ── 1. HERO ───────────────────────────────────────────────────────
          Background `hero_section.jpeg` full-bleed + overlay gradasi hitam
          dari kiri (95% → 70% → 25%) supaya teks putih dan CTA tetap terbaca.
          Layout 2 kolom di lg: kiri teks (badge, judul, subtitle, CTA ke
          xrp.cafe + /information), kanan GIF animasi hero_section2.gif. */}
      <section className="relative overflow-hidden border-t border-border">
        {/* Latar full-bleed */}
        <img
          src={infMomApe}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full object-cover"
        />
        {/* Overlay gradasi hitam → transparan dari kiri, biar teks kiri terbaca */}
        <div className="absolute inset-0 bg-gradient-to-r from-void-black/95 via-void-black/70 to-void-black/25" />

        <div className="relative wadah bagian-kepala-halaman grid items-center gap-12 pb-16 sm:pb-24 lg:grid-cols-[1.1fr_1fr]">
          {/* Kolom kiri: teks + tombol */}
          <div className="max-w-2xl">
            <p className="kicker">
              <span className="kicker-garis" aria-hidden="true" />
              {t("home.hero.badge")}
            </p>

            <h1 className="judul-halaman mt-6">
              {t("home.hero.title")}
            </h1>

            <p className="teks-lead mt-6 max-w-2xl text-base leading-relaxed text-fg-muted sm:text-lg">
              {t("home.hero.subtitle")}
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <a
                href="https://xrp.cafe/id/collection/momapesvoidline-jajangosle"
                target="_blank"
                rel="noopener noreferrer"
                className="tombol tombol-merah"
              >
                {t("home.hero.ctaCollections")}
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
                  <path d="M12.97 5.47a.75.75 0 0 1 1.06 0l6 6a.75.75 0 0 1 0 1.06l-6 6a.75.75 0 1 1-1.06-1.06l4.72-4.72H4.75a.75.75 0 0 1 0-1.5h12.94l-4.72-4.72a.75.75 0 0 1 0-1.06Z" />
                </svg>
              </a>

              {/* <Link to="/information" className="tombol tombol-garis">
                {t("home.hero.ctaLatestCollection")}
              </Link> */}
            </div>
          </div>

          {/* Kolom kanan: GIF animasi 500×500 — identitas gerak studio.
              `self-end` + margin bawah negatif menarik GIF sampai nempel di
              tepi akhir hero (mengimbangi padding-bottom kontainer). */}
          <img
            src={heroGif}
            alt=""
            aria-hidden="true"
            width={500}
            height={500}
            decoding="async"
            className="self-end justify-self-center w-full max-w-2xl -mb-16 sm:-mb-24 lg:max-w-[44rem]"
          />
        </div>
      </section>

      {/* ── 2. ANGKA ──────────────────────────────────────────────────────
          Satu-satunya bidang merah penuh di situs. Ditaruh di sini karena
          angkanya sedikit dan besar — cocok dibaca di atas merah. Tiga angka
          memakai Cinzel, sama seperti nomor "01 / 02" di halaman About Us. */}
      <section className="bg-void-red text-void-white">
        <div className="wadah grid grid-cols-1 gap-y-2 py-10 text-center sm:grid-cols-3 sm:gap-y-0 sm:py-10 sm:divide-x sm:divide-white/20">
          {/* Angka dari ledger langsung (statistikLedger.ts); statis dari
              karyaNft.ts hanya cadangan saat node tidak menjawab. */}
          <div className="px-5 py-4 sm:py-2">
            <p className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              {jumlahKoleksi}
            </p>
            <p className="mt-1.5 text-xs font-semibold uppercase tracking-[0.18em] text-void-white/75">
              {t("home.stats.collections")}
            </p>
          </div>
          {/* Jumlah karya dihitung dari data ledger yang ditarik
              scripts/tarik-karya.py — selalu sepadan dengan grid /collection. */}
          <div className="px-5 py-2">
            <p className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              {jumlahKaryaPapan}
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

      {/* ── 3. KOLEKSI UNGGULAN — DINONAKTIFKAN SEMENTARA ─────────────────
          Blok "The Work / Featured Collections" dimatikan sesuai permintaan,
          tetapi sengaja TIDAK dihapus karena bisa dibutuhkan lagi kapan pun.
          Untuk mengaktifkan kembali: ganti `false && (` menjadi `true && (`.
          Kunci terjemahannya (home.collections.*) juga masih ada di
          src/i18n/translations.ts, jadi tidak ada yang perlu dikembalikan. */}
      {/* eslint-disable-next-line no-constant-binary-expression -- disengaja: blok dimatikan, lihat komentar di atas */}
      {false && (
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
      )}
      {/* Akhir blok KOLEKSI UNGGULAN (dinonaktifkan — lihat komentar di atas). */}

      {/* ── 4. GALERI TERBARU ─────────────────────────────────────────────
          Strip karya yang bergerak sendiri tanpa henti ke kiri — 12 karya
          nyata dari grup terbaru (`kodeGrupBaru`, yaitu Mom Apes Voidline).
          Fallback ke semua koleksi bila grup baru kosong. Track ditulis dua
          kali (aria-hidden pada salinan) agar putarannya mulus; lingkaran
          penuh 12 kartu untuk satu kali geser. Gerak berhenti saat kursor di
          atasnya atau saat strip difokus dengan papan ketik. */}
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
          </div>

          {/* Dua baris galeri berlawanan arah: baris atas meluncur ke kiri
              (Mom Apes Voidline), baris bawah ke kanan (Apes Voidline). Track
              ditulis dua kali (aria-hidden pada salinan) agar putaran mulus.
              Gerak berhenti saat kursor di atasnya atau saat strip difokus. */}
          <div className="mt-10 space-y-6">
            {[0, 1].map((baris) => (
              <div
                key={baris}
                className="marquee [mask-image:linear-gradient(to_right,transparent,black_4rem,black_calc(100%-4rem),transparent)]"
                style={{ ["--marquee-durasi" as string]: baris === 0 ? "60s" : "75s" }}
              >
                <div
                  className={`marquee-track gap-4 pb-4 ${baris === 1 ? "marquee-track-kiri" : ""}`}
                >
                  {(baris === 0 ? galeriAtas : galeriBawah)
                    .concat(baris === 0 ? galeriAtas : galeriBawah)
                    .map(({ kode, karya }, i) => {
                      const [, judul, uri, nftId] = karya;
                      const salinan = i >= GALERI_PER_BARIS;
                      return (
                        <Link
                          key={`${nftId}-${baris}-${i}`}
                          to={`/collection/work/${nftId}`}
                          className="group w-40 shrink-0 sm:w-44"
                          aria-label={judul}
                          aria-hidden={salinan || undefined}
                          tabIndex={salinan ? -1 : undefined}
                        >
                          <div className="aspect-square overflow-hidden rounded-xl border border-border bg-void-black">
                            <img
                              src={daftarAlamat(uri)[0]}
                              alt={salinan ? "" : judul}
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
              </div>
            ))}
          </div>

          <div className="mt-6">
            <Link to="/information" className="tautan-lanjut">
              {t("home.gallery.cta", { count: jumlahKaryaBaru })}
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
                <path d="M12.97 5.47a.75.75 0 0 1 1.06 0l6 6a.75.75 0 0 1 0 1.06l-6 6a.75.75 0 1 1-1.06-1.06l4.72-4.72H4.75a.75.75 0 0 1 0-1.5h12.94l-4.72-4.72a.75.75 0 0 1 0-1.06Z" />
              </svg>
            </Link>
          </div>
        </div>
      </section>

      {/* ── 5. PENUTUP ────────────────────────────────────────────────────────
          Dua tombol: "Mint Now" (merah) menuju koleksi Mom Apes di xrp.cafe —
          pembayaran tetap on-ledger, situs hanya mengarahkan; dan "New
          Collection" (garis) menuju /information untuk melihat rilis terbaru. */}

      <section>
        <div className="wadah bagian text-center">
          <h2 className="judul-bagian">
            {t("home.closing.title")}
          </h2>
          <p className="teks-lead mx-auto mt-3 max-w-xl leading-relaxed text-fg-muted">
            {t("home.closing.subtitle")}
          </p>
          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <a
              href="https://xrp.cafe/id/collection/momapesvoidline-jajangosle"
              target="_blank"
              rel="noopener noreferrer"
              className="tombol tombol-merah"
            >
              {t("home.closing.ctaMint")}
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
                <path d="M12.97 5.47a.75.75 0 0 1 1.06 0l6 6a.75.75 0 0 1 0 1.06l-6 6a.75.75 0 1 1-1.06-1.06l4.72-4.72H4.75a.75.75 0 0 1 0-1.5h12.94l-4.72-4.72a.75.75 0 0 1 0-1.06Z" />
              </svg>
            </a>
            <Link
              to={
                kodeGrupBaru.length > 0
                  ? `/collection?filter=${kodeGrupBaru[0]}`
                  : "/collection"
              }
              className="tombol tombol-garis"
            >
              {t("home.closing.ctaNewCollection")}
            </Link>
          </div>
        </div>
      </section>
    </HalamanBerlatar>
  );
}
