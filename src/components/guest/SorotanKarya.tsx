/* =============================================================================
   SOROTAN KARYA — TUMPUKAN KARTU 3D DI HALAMAN ATRIUM

   Karya pilihan ditampilkan sebagai satu tumpukan: beberapa kartu bertumpuk di
   posisi yang sama, seperti tumpukan foto di atas meja. Hanya kartu paling atas
   yang utuh; kartu di belakangnya lebih kecil, lebih redup, dan lebih buram.

   ── BENTUK TUMPUKAN ──────────────────────────────────────────────────────
   Tiap lapisan didorong MENJAUH ke dalam layar (`translateZ` negatif), bukan
   dikecilkan dengan `scale()`. Perspektif di panggung yang mengurus sisanya:
   kartu yang lebih jauh tampak lebih kecil dan sedikit lebih rendah dengan
   sendirinya. Bedanya terasa saat kartu berpindah lapisan — ia benar-benar
   bergerak maju-mundur di ruang, bukan seperti gambar 2D yang dikecilkan.

   ── ARAH PUTARAN: "LEWAT SAMPING, LALU KE BELAKANG" ──────────────────────
     · Panah KANAN → gambar teratas meluncur ke KANAN, berputar sedikit, lalu
       masuk ke tumpukan sebagai lapisan paling belakang.
     · Panah KIRI  → sama, tapi lewat KIRI.

   ── MENGAPA DIHITUNG PER KARTU, BUKAN SEBAGAI URUTAN GERAK ───────────────
   Cara yang biasa dipakai pustaka animasi: kartu keluar digerakkan ke samping
   dulu (600 ms), baru tumpukan lain bergeser (600 ms sesudahnya). Total
   1,2 detik, dan kartu yang keluar terlihat terpisah dari tumpukannya.

   Di sini seluruh tumpukan bergerak dalam satu tarikan napas. Yang dihitung
   per kartu hanyalah bentuk lintasannya — sebuah busur:

       mulai  ───────────► kartu di depan, x = 0
       puncak ───────────► x = ±PUNCAK, sudah di samping, mulai masuk ke dalam
       akhir  ───────────► x = 0, berada di lapisan paling belakang

   Nilai x dihitung dari sinus setengah lingkaran terhadap `jarak`, jadi
   lintasannya melengkung keluar lalu masuk lagi — persis gerak tangan yang
   menyelipkan foto ke belakang tumpukan. Karena bentuknya satu transform
   biasa, peramban bisa menganimasikannya mulus tanpa satu pun bingkai
   yang dihitung di JavaScript.

   ── KARTU KELUAR DISALIN, BUKAN DIPINDAH ─────────────────────────────────
   Satu elemen tidak bisa berada di dua tempat. Supaya kartu teratas benar-
   benar TERLIHAT meluncur pergi sementara kartu berikutnya sudah naik, kartu
   yang sama digambar dua kali selama animasi: satu salinan "tinggal" yang
   sudah di posisi barunya, dan satu salinan "pergi" yang meluncur dari depan
   ke belakang. Salinan pergi dibuat `pointer-events: none` dan
   `aria-hidden`, jadi tidak bisa diklik maupun dibacakan pembaca layar.

   ── KENAPA KARTU DI BELAKANG TIDAK BISA DIKLIK ───────────────────────────
   Hanya kartu teratas yang menjadi tautan ke halaman mint. Lapisan lain
   diberi `pointer-events: none` dan `aria-hidden`, karena pengunjung tidak
   bisa melihat isinya dan tidak boleh bisa menekan sesuatu yang tak terlihat.

   ── GAMBAR DISAMARKAN ────────────────────────────────────────────────────
   Gambar karya sengaja diblur kuat dan diredupkan, bahkan pada kartu teratas.
   Tujuannya membuat tumpukan terbaca sebagai "koleksi misteri" — yang terlihat
   adalah bentuk dan warnanya, bukan detailnya.

   ── PAPAN KETIK DAN PEMBACA LAYAR ────────────────────────────────────────
   Tombol panah dan titik semuanya tombol sungguhan dengan label yang terbaca.
   Tumpukan juga bisa digeser dengan tombol panah keyboard saat fokus berada
   di dalamnya.
   ============================================================================= */

import { useCallback, useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../../i18n/useLanguage";
import { sorotan } from "../../data/sorotan";
import { collections } from "../../data/collections";

/** Halaman mint koleksi pertama — tujuan klik pada kartu teratas. */
const TUJUAN_BELI = `/collection/mint/${collections[0].slug}`;

/** Banyak lapisan yang terlihat sekaligus. Lapisan ke-6 dan seterusnya tidak
    digambar sama sekali — tumpukan setebal apa pun tetap terlihat sama. */
const LAPISAN = 5;

/** Jarak antar lapisan ke dalam layar, piksel. Lapisan kelima berada 360 px
    di belakang; dengan perspektif 1200 px itu berarti ±0,75 kali ukuran asli. */
const JARAK_Z = 90;

/** Puncak lengkungan lintasan keluar, piksel dari pusat. */
const PUNCAK = 200;

/** Lama animasi, milidetik. */
const DURASI = 720;

export default function SorotanKarya() {
  const { t } = useLanguage();
  /** Tumpukan kartu, urut dari yang paling belakang ke yang paling atas.
      Kartu yang dibuang benar-benar keluar dari daftar ini; panah kiri
      mengembalikannya. Isinya selalu potongan `sorotan` — tidak pernah
      bertambah gambar baru. */
  const [tumpukan, setTumpukan] = useState<number[]>(() =>
    sorotan.map((_, i) => i),
  );
  /** Indeks kartu yang sedang meluncur pergi, atau null bila diam. */
  const [terbang, setTerbang] = useState<number | null>(null);
  /** Arah luncur kartu keluar: 1 = ke kanan, −1 = ke kiri. */
  const [arah, setArah] = useState<1 | -1>(1);
  /** Kartu teratas sedang dipegang kursor atau fokus papan ketik. Selama
      aktif, gambarnya dilepas dari blur. Disimpan di sini, bukan di CSS,
      karena kartu teratas bisa berganti tanpa kursor bergerak. */
  const [tajam, setTajam] = useState(false);
  const jamTerbang = useRef<number | undefined>(undefined);

  const jumlahAwal = sorotan.length;
  const jumlah = tumpukan.length;
  const bisaKanan = jumlah > 0;
  const bisaKiri = jumlah < jumlahAwal;

  /** Buang kartu teratas. `delta` 1 = meluncur ke kanan, −1 = ke kiri.
      Efek sampingnya sengaja di luar `setTumpukan`: updater state bisa
      dijalankan dua kali oleh React, dan animasi tidak boleh terpicu ganda. */
  const buang = useCallback(
    (delta: 1 | -1) => {
      if (tumpukan.length === 0) return;
      setArah(delta);
      setTerbang(tumpukan[tumpukan.length - 1]);
      setTajam(false);
      clearTimeout(jamTerbang.current);
      jamTerbang.current = window.setTimeout(() => setTerbang(null), DURASI);
      setTumpukan(tumpukan.slice(0, -1));
    },
    [tumpukan],
  );

  /** Kembalikan kartu terakhir yang dibuang. Kartu itu meluncur masuk dari
      sisi yang sama dengan jalannya ia pergi — datang dari kanan bila tadi
      dibuang ke kanan. Karena tumpukan selalu berisi `0..n−1` berurutan,
      kartu berikutnya yang kembali selalu bernomor `n`. */
  const kembalikan = useCallback(() => {
    if (tumpukan.length >= jumlahAwal) return;
    const kembali = tumpukan.length;
    setArah(-1);
    setTerbang(kembali);
    setTajam(false);
    clearTimeout(jamTerbang.current);
    jamTerbang.current = window.setTimeout(() => setTerbang(null), DURASI);
    setTumpukan([...tumpukan, kembali]);
  }, [tumpukan, jumlahAwal]);

  useEffect(() => () => clearTimeout(jamTerbang.current), []);

  const onKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowRight" && bisaKanan) {
      e.preventDefault();
      buang(1);
    } else if (e.key === "ArrowLeft" && bisaKiri) {
      e.preventDefault();
      kembalikan();
    }
  };

  /** Isi kartu untuk satu karya. Dipakai oleh kartu biasa maupun lapisan
      terbang, supaya keduanya selalu identik. */
  const isiKartu = (i: number, terbaca: boolean, kartuTajam = false) => {
    const karya = sorotan[i];
    return (
      <IsiKartu
        karya={karya}
        judul={t(karya.judulKey)}
        catatan={t(karya.catatanKey)}
        labelMisteri={t("sorotan.misteri")}
        labelSegera={t("sorotan.segera")}
        terbaca={terbaca}
        tajam={kartuTajam}
      />
    );
  };

  return (
    <section className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
      <header className="flex flex-wrap items-end justify-between gap-6">
        <div className="max-w-2xl">
          <p className="inline-flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.28em] text-accent-bright">
            <span className="h-px w-8 bg-void-red" aria-hidden="true" />
            {t("sorotan.kicker")}
          </p>
          <h2 className="mt-4 font-display text-2xl font-bold tracking-tight sm:text-3xl">
            {t("sorotan.judul")}
          </h2>
          <p className="mt-3 leading-relaxed text-fg-muted">{t("sorotan.ket")}</p>
        </div>

        <Link
          to={TUJUAN_BELI}
          className="inline-flex shrink-0 items-center gap-1.5 text-sm font-medium text-void-red underline-offset-4 hover:underline"
        >
          {t("sorotan.lihatSemua")}
          <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
            <path d="M9.47 5.47a.75.75 0 0 1 1.06 0l6 6a.75.75 0 0 1 0 1.06l-6 6a.75.75 0 1 1-1.06-1.06L14.19 12 9.47 7.28a.75.75 0 0 1 0-1.06Z" />
          </svg>
        </Link>
      </header>

      <div
        className="mt-12 flex flex-col items-center"
        onKeyDown={onKey}
        role="group"
        aria-roledescription="carousel"
        aria-label={t("sorotan.judul")}
      >
        {/* ── PANGGUNG ──────────────────────────────────────────────────────
            Perspektif dipasang di sini, bukan di kartu: `perspective` hanya
            berlaku untuk ANAK LANGSUNG, jadi semua kartu melihat kedalaman
            yang sama dan tidak masing-masing punya titik hilang sendiri.

            Padding bawah memberi ruang untuk bayangan; tanpa itu, kartu
            teratas yang sedang dimiringkan terpotong. */}
        <div className="relative w-[290px] pb-16 [perspective:1200px] [transform-style:preserve-3d] sm:w-[340px] sm:pb-20">
          <div className="relative h-[430px] [transform-style:preserve-3d] sm:h-[470px]">
            {tumpukan.map((indeksKarya, posisi) => {
              const jarak = jumlah - 1 - posisi;
              if (jarak >= LAPISAN) return null;
              // Kartu yang sedang meluncur pergi digambar terpisah di bawah,
              // supaya elemennya TIDAK ikut berpindah komponen saat bergerak.
              if (terbang === indeksKarya) return null;

              return (
                <Lapisan
                  key={indeksKarya}
                  jarak={jarak}
                  teratas={jarak === 0}
                  terbang={false}
                  arah={arah}
                  tajam={tajam && jarak === 0}
                  onArahkan={jarak === 0 ? setTajam : undefined}
                >
                  {isiKartu(indeksKarya, jarak === 0, tajam && jarak === 0)}
                </Lapisan>
              );
            })}

            {/* ── KARTU YANG SEDANG MELUNCUR ───────────────────────────────
                Kalau kartu ini sekadar diubah posisinya, peramban akan
                menganggap elemennya sama dan langsung melompat ke tempat
                baru — tidak ada yang bisa dianimasikan. Menaruhnya di urutan
                paling akhir membuatnya elemen baru saat mulai bergerak, dan
                elemen baru MULAI dari posisi yang diberikan. Jadi ia benar-
                benar menempuh lintasannya sebelum dilepas dari layar. */}
            {terbang !== null && (
              <Lapisan key={"terbang-" + terbang} jarak={0} teratas={false} terbang arah={arah}>
                {isiKartu(terbang, false)}
              </Lapisan>
            )}
          </div>
        </div>

        {/* ── KONTROL ──────────────────────────────────────────────────────
            Panah kiri · penghitung · panah kanan. Panah kiri mengembalikan
            kartu terakhir yang dibuang, jadi keduanya nonaktif saat tumpukan
            kosong atau penuh. */}
        <div className="mt-6 flex w-full items-center justify-center gap-3 sm:gap-5">
          <TombolPanah
            arah="kiri"
            label={t("sorotan.sebelumnya")}
            onClick={kembalikan}
            nonaktif={!bisaKiri}
          />

          {/* Penghitung: berapa kartu yang masih di tumpukan, dari jumlah awal.
              `aria-live` membuat pembaca layar ikut mendengar perubahannya. */}
          <p
            aria-live="polite"
            className="min-w-16 shrink-0 text-center font-display text-sm tabular-nums text-fg-muted"
          >
            <span className="text-void-red">{jumlah}</span>
            <span className="text-fg-muted/60"> / {jumlahAwal}</span>
          </p>

          <TombolPanah
            arah="kanan"
            label={t("sorotan.berikutnya")}
            onClick={() => buang(1)}
            nonaktif={!bisaKanan}
          />
        </div>
      </div>
    </section>
  );
}

/* ── SATU LAPISAN TUMPUKAN ────────────────────────────────────────────────
   Menentukan letak kartu di ruang 3D. `jarak` 0 = paling atas.

   Dua keadaan:
     · DIAM      — kartu duduk di lapisannya sendiri.
     · TERBANG   — kartu yang baru saja meninggalkan puncak tumpukan; ia
                   meluncur melewati sisi kanan atau kiri lalu masuk ke
                   lapisan paling belakang.
                                                                           */
function Lapisan({
  jarak,
  teratas,
  terbang,
  arah,
  mulai,
  tajam,
  onArahkan,
  children,
}: {
  jarak: number;
  teratas: boolean;
  terbang: boolean;
  arah: 1 | -1;
  /** Untuk kartu yang meluncur: kedalaman lapisan tempat ia berangkat.
      Diisi 0 karena kartu yang dibuang selalu berangkat dari puncak. */
  mulai?: number;
  /** Hanya kartu teratas yang bisa dilepas blur-nya. */
  tajam?: boolean;
  /** Dipanggil saat kursor masuk/keluar atau fokus pindah. */
  onArahkan?: (tajam: boolean) => void;
  children: React.ReactNode;
}) {
  // ── DIAM ─────────────────────────────────────────────────────────────────
  // Semakin jauh, semakin ke dalam layar. Sisi (kiri/kanan) tidak menentukan
  // apa pun saat diam — tumpukannya tegak lurus.
  const diamZ = -jarak * JARAK_Z;

  // ── KARTU YANG SEDANG MELUNCUR ──────────────────────────────────────────
  // Elemen ini BARU dipasang saat tombol ditekan. Supaya ia terlihat
  // menempuh lintasan dari tempat kartu teratas tadi berada — bukan
  // melompat ke tengah panggung lalu meluncur — posisi awalnya disalin dari
  // kartu teratas (`mulai`), termasuk kedalaman lapisannya.
  const awalTerbang = {
    transform: `translateX(0px) translateZ(${(-(mulai ?? 0) * JARAK_Z).toFixed(1)}px) rotateY(0deg)`,
    opacity: 1,
    filter: "none",
    zIndex: LAPISAN + 2,
    pointerEvents: "none" as const,
    transition: `transform ${DURASI}ms cubic-bezier(.3,.66,.24,1), opacity ${DURASI}ms cubic-bezier(.45,.05,.55,.95)`,
  };

  // Dua langkah. Bingkai pertama menulis posisi AWAL; bingkai berikutnya
  // mengganti ke posisi AKHIR. Peramban baru bisa menganimasikan perubahan
  // kalau ia sempat mencatat keadaan awal — karena itu perlu dua bingkai,
  // bukan satu.
  const [posisi, setPosisi] = useState(0);
  useEffect(() => {
    if (!terbang) return;
    const r = requestAnimationFrame(() => setPosisi(1));
    return () => cancelAnimationFrame(r);
  }, [terbang]);

  const gaya: React.CSSProperties = terbang
    ? {
        ...awalTerbang,
        // Posisi akhir: jauh ke samping, sudah miring, dan memudar habis.
        // Kartu ini memang dilepas dari tumpukan, bukan diselipkan ke
        // belakang, jadi ia keluar dari layar sampai tak terlihat.
        transform:
          posisi === 0
            ? "translateX(0px) translateZ(0px) rotateY(0deg)"
            : `translateX(${(PUNCAK * 1.6 * arah).toFixed(1)}px) translateZ(120px) rotateY(${(14 * arah).toFixed(1)}deg)`,
        opacity: posisi === 0 ? 1 : 0,
        filter: posisi === 0 ? "none" : "blur(2px) brightness(0.8)",
      }
    : {
        transform: `translateZ(${diamZ}px)`,
        zIndex: LAPISAN - jarak,
        opacity: jarak === 0 ? 1 : Math.max(0, 1 - jarak * 0.1),
        filter: jarak === 0 ? "none" : `blur(${jarak * 1.4}px) brightness(${1 - jarak * 0.3})`,
        // Lapisan diam tidak dianimasikan: posisinya sudah final saat dipasang.
        transition: "none",
        pointerEvents: teratas ? "auto" : "none",
      };

  const kelas =
    "absolute inset-0 flex flex-col overflow-hidden rounded-[18px] " +
    // Sisi kartu dibuat terbaca dengan dua garis sungguhan, bukan bayangan:
    // `outline` merah 1 px menempel di tepi (menandai kartu di atas dinding
    // hitam), dan `border` putih samar 1 px di dalamnya. Border pasti mengikuti
    // lengkung `rounded-[18px]`, sementara `inset` box-shadow tidak selalu
    // tergambar di semua peramban. Keduanya menguat saat kartu teratas
    // diarahkan kursor. `data-[tajam=true]` dipakai, bukan `group-data-*`,
    // karena elemen ini yang memegang atributnya sendiri.
    "border border-white/15 bg-[#0f0f11] " +
    "outline outline-1 outline-void-red/35 " +
    "data-[tajam=true]:border-white/30 data-[tajam=true]:outline-void-red/70 " +
    "shadow-[0_24px_50px_-24px_rgba(0,0,0,.95)] transition-colors duration-300 [backface-visibility:hidden]";

  if (teratas) {
    return (
      <Link
        to={TUJUAN_BELI}
        className={kelas + " group"}
        style={gaya}
        data-tajam={tajam ? "true" : "false"}
        onPointerEnter={() => onArahkan?.(true)}
        onPointerLeave={() => onArahkan?.(false)}
        onFocus={() => onArahkan?.(true)}
        onBlur={() => onArahkan?.(false)}
      >
        {children}
      </Link>
    );
  }

  return (
    <div className={kelas} style={gaya} aria-hidden={!terbang ? true : undefined}>
      {children}
    </div>
  );
}

/* ── ISI KARTU ────────────────────────────────────────────────────────────
   Gambar disamarkan: diblur kuat dan diredupkan, di atas latar hitam, supaya
   warna karya masih terasa tanpa membocorkan detailnya.                          */
function IsiKartu({
  karya,
  judul,
  catatan,
  labelMisteri,
  labelSegera,
  terbaca,
  tajam,
}: {
  karya: (typeof sorotan)[number];
  judul: string;
  catatan: string;
  labelMisteri: string;
  labelSegera: string;
  terbaca: boolean;
  tajam: boolean;
}) {
  // Gambar dianggap ada selama `gambar` terisi. Sebelumnya hanya URL http yang
  // diterima; sekarang berkas yang diimpor dari `src/assets/` (jalur Vite)
  // juga berlaku, karena begitu album rilis jalurnya justru begini.
  const adaGambar = Boolean(karya.gambar);

  // `blur-*` Tailwind dan `brightness-*`/`saturate-*` menulis ke variabel
  // filter yang sama, jadi memasang `blur-0` lewat kelas tidak melepas blur.
  // Nilainya ditulis langsung di sini; transisi blur tetap jalan karena
  // propertinya sama.
  const blur = tajam ? 0 : 16;

  return (
    <>
      <div className="relative h-[360px] overflow-hidden rounded-t-[18px] bg-void-black sm:h-[400px]">
        {adaGambar ? (
          <>
            {/* Saat diam kartu sengaja disamarkan — bentuk dan warnanya saja.
                Begitu kartu teratas diarahkan kursor atau disentuh, gambar
                menjadi tajam supaya GIF-nya benar-benar terlihat berjalan.
                Lapisan blur ada di gambar, penggelap di atasnya; keduanya
                ikut memudar lewat `group-hover` milik tautan kartu. */}
            <img
              src={karya.gambar}
              alt=""
              decoding="async"
              aria-hidden="true"
              className="absolute inset-0 h-full w-full object-cover brightness-75 saturate-50 transition duration-500 group-data-[tajam=true]:brightness-100 group-data-[tajam=true]:saturate-100"
              style={{ filter: `blur(${blur}px)` }}
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-void-black/45 transition-opacity duration-500 group-data-[tajam=true]:opacity-0"
            />
          </>
        ) : (
          <>
            <div
              aria-hidden="true"
              className="absolute -left-1/4 top-0 h-full w-1/2 rotate-12 bg-linear-to-r from-void-red/30 to-transparent"
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-[radial-gradient(circle_at_30%_28%,rgba(224,27,36,.42),transparent_52%),radial-gradient(circle_at_74%_76%,rgba(255,255,255,.16),transparent_44%)]"
            />
            <span className="absolute inset-0 grid place-items-center text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-void-white/60">
              {labelSegera}
            </span>
          </>
        )}

        <span className="absolute left-3.5 top-3.5 inline-flex items-center gap-1.5 rounded-full border border-accent-line bg-void-black/70 px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-void-white/85 backdrop-blur-sm transition-opacity duration-300 group-data-[tajam=true]:opacity-0">
          <svg viewBox="0 0 24 24" className="h-3 w-3 fill-current" aria-hidden="true">
            <path d="M12 1a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2h-1V6a5 5 0 0 0-5-5Zm-3 8V6a3 3 0 1 1 6 0v3H9Z" />
          </svg>
          {labelMisteri}
        </span>
      </div>

      <div className="flex items-center justify-between gap-3 px-4 pb-4 pt-3.5">
        <span className="truncate font-display text-[15px] font-semibold tracking-tight text-void-white">
          {judul}
        </span>
        <span className="shrink-0 text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-accent-bright">
          {catatan}
        </span>
      </div>

      {/* Nama karya dibacakan pembaca layar lewat tautan teratas saja; di
          lapisan lain teks ini murni hiasan. `terbaca` menentukan apakah
          gambar ikut diberi keterangan. */}
      <span className="sr-only">{terbaca ? `${judul} — ${catatan}` : ""}</span>
    </>
  );
}

/* ── TOMBOL PANAH ────────────────────────────────────────────────────────
   Lingkaran 44 px — ukuran minimum yang nyaman disentuh jari. Saat tumpukan
   kosong (atau penuh, untuk panah kiri) tombolnya `disabled`: diredupkan,
   tidak bisa ditekan, dan tidak ikut fokus papan ketik. */
function TombolPanah({
  arah,
  label,
  onClick,
  nonaktif = false,
}: {
  arah: "kiri" | "kanan";
  label: string;
  onClick: () => void;
  nonaktif?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      disabled={nonaktif}
      className="grid h-11 w-11 place-items-center rounded-full border border-void-white/20 bg-void-white/4 text-void-white transition-colors duration-200 hover:enabled:border-accent hover:enabled:bg-accent-soft hover:enabled:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-void-red disabled:cursor-not-allowed disabled:opacity-30"
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
        {arah === "kiri" ? (
          <path d="M14.53 5.47a.75.75 0 0 1 0 1.06L9.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06l-6-6a.75.75 0 0 1 0-1.06l6-6a.75.75 0 0 1 1.06 0Z" />
        ) : (
          <path d="M9.47 5.47a.75.75 0 0 1 1.06 0l6 6a.75.75 0 0 1 0 1.06l-6 6a.75.75 0 1 1-1.06-1.06L14.19 12 9.47 7.28a.75.75 0 0 1 0-1.06Z" />
        )}
      </svg>
    </button>
  );
}
