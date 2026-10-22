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
  const [atas, setAtas] = useState(0);
  /** Arah putaran terakhir: 1 = lewat kanan, −1 = lewat kiri. */
  const [arah, setArah] = useState<1 | -1>(1);
  /** Indeks kartu yang sedang terbang ke belakang, atau null bila diam. */
  const [terbang, setTerbang] = useState<number | null>(null);
  const jamTerbang = useRef<number | undefined>(undefined);
  const jumlah = sorotan.length;

  /** Mulai satu putaran. `delta` 1 = kanan, −1 = kiri. */
  const geser = useCallback(
    (delta: 1 | -1) => {
      if (jumlah < 2) return;
      setArah(delta);
      setTerbang(atas);
      clearTimeout(jamTerbang.current);
      jamTerbang.current = window.setTimeout(() => setTerbang(null), DURASI);
      setAtas((sebelumnya) => (sebelumnya + delta + jumlah) % jumlah);
    },
    [atas, jumlah],
  );

  /** Titik lompat langsung ke kartu tertentu. */
  const ke = (i: number) => {
    if (i === atas) return;
    setArah(i > atas ? 1 : -1);
    setTerbang(atas);
    clearTimeout(jamTerbang.current);
    jamTerbang.current = window.setTimeout(() => setTerbang(null), DURASI);
    setAtas(i);
  };

  useEffect(() => () => clearTimeout(jamTerbang.current), []);

  const onKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowRight") {
      e.preventDefault();
      geser(1);
    } else if (e.key === "ArrowLeft") {
      e.preventDefault();
      geser(-1);
    }
  };

  /** Isi kartu untuk satu karya. Dipakai oleh kartu biasa maupun lapisan
      terbang, supaya keduanya selalu identik. */
  const isiKartu = (i: number, terbaca: boolean) => {
    const karya = sorotan[i];
    return (
      <IsiKartu
        karya={karya}
        judul={t(karya.judulKey)}
        catatan={t(karya.catatanKey)}
        labelMisteri={t("sorotan.misteri")}
        labelSegera={t("sorotan.segera")}
        terbaca={terbaca}
      />
    );
  };

  return (
    <section className="mx-auto max-w-6xl px-5 py-16 sm:py-20">
      <header className="flex flex-wrap items-end justify-between gap-6">
        <div className="max-w-2xl">
          <p className="inline-flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.28em] text-void-red">
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
            {sorotan.map((_, i) => {
              const jarak = (i - atas + jumlah) % jumlah;
              if (jarak >= LAPISAN) return null;
              // Kartu yang sedang terbang digambar terpisah di bawah, supaya
              // elemennya TIDAK ikut berpindah komponen saat mulai bergerak.
              if (terbang === i) return null;

              return (
                <Lapisan key={i} jarak={jarak} teratas={jarak === 0} terbang={false} arah={arah}>
                  {isiKartu(i, jarak === 0)}
                </Lapisan>
              );
            })}

            {/* ── KARTU YANG SEDANG TERBANG ────────────────────────────────
                Kalau kartu ini sekadar diubah posisinya di tengah tumpukan,
                peramban akan menganggap elemennya sama dan langsung
                melompat ke tempat baru — tidak ada yang bisa dianimasikan.
                Menaruhnya di urutan paling akhir membuatnya elemen baru saat
                mulai bergerak, dan elemen baru MULAI dari posisi yang
                diberikan. Jadi ia benar-benar menempuh lintasannya. */}
            {terbang !== null && (
              <Lapisan key={"terbang-" + terbang} jarak={0} teratas={false} terbang arah={arah}>
                {isiKartu(terbang, false)}
              </Lapisan>
            )}
          </div>
        </div>

        {/* ── KONTROL ──────────────────────────────────────────────────────
            Panah kiri · titik · panah kanan. Titik dibuat cukup besar untuk
            jari (32×32) walau tampilannya kecil. */}
        <div className="mt-6 flex w-full items-center justify-center gap-2 sm:gap-4">
          <TombolPanah
            arah="kiri"
            label={t("sorotan.sebelumnya")}
            onClick={() => geser(-1)}
          />

          <div className="flex shrink-0 items-center gap-0.5 sm:gap-1.5" role="tablist" aria-label={t("sorotan.judul")}>
            {sorotan.map((_, i) => (
              <button
                key={i}
                type="button"
                role="tab"
                aria-selected={i === atas}
                aria-label={t("sorotan.keKarya", { n: i + 1 })}
                onClick={() => ke(i)}
                className="grid h-7 w-7 place-items-center sm:h-8 sm:w-8"
              >
                <span
                  className={
                    "block h-1.5 rounded-full transition-all duration-300 " +
                    (i === atas ? "w-6 bg-void-red" : "w-1.5 bg-void-white/25 hover:bg-void-white/50")
                  }
                />
              </button>
            ))}
          </div>

          <TombolPanah
            arah="kanan"
            label={t("sorotan.berikutnya")}
            onClick={() => geser(1)}
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
  children,
}: {
  jarak: number;
  teratas: boolean;
  terbang: boolean;
  arah: 1 | -1;
  children: React.ReactNode;
}) {
  // ── DIAM ─────────────────────────────────────────────────────────────────
  // Semakin jauh, semakin ke dalam layar. Sisi (kiri/kanan) tidak menentukan
  // apa pun saat diam — tumpukannya tegak lurus.
  const diamZ = -jarak * JARAK_Z;

  // ── KARTU YANG SEDANG TERBANG ───────────────────────────────────────────
  // Elemen ini BARU dipasang saat tombol ditekan. Supaya ia terlihat
  // menempuh lintasan (bukan langsung muncul di belakang), posisi awalnya
  // ditulis dulu secara langsung, lalu posisi akhirnya dipasang pada bingkai
  // berikutnya. Peramban baru bisa menganimasikan perubahan kalau nilai
  // awal dan nilai akhir datang dari dua keadaan berbeda — bukan dari nilai
  // bawaan elemen baru.
  const awalTerbang = {
    transform: "translateX(0px) translateZ(0px) rotateY(0deg)",
    opacity: 1,
    filter: "none",
    zIndex: LAPISAN + 2,
    pointerEvents: "none" as const,
    transition: `transform ${DURASI}ms cubic-bezier(.3,.66,.24,1), opacity ${DURASI}ms cubic-bezier(.45,.05,.55,.95)`,
  };

  // Dua langkah. Langkah pertama menulis posisi AWAL dan langsung
  // "membakar" nilai itu ke tata letak (`void el.offsetWidth`), sehingga
  // peramban menganggapnya keadaan sah — bukan nilai bawaan. Langkah kedua,
  // pada bingkai berikutnya, mengganti ke posisi AKHIR. Baru sesudah itu
  // peramban punya dua keadaan untuk dianimasikan.
  const [posisi, setPosisi] = useState(0);
  useEffect(() => {
    if (!terbang) return;
    const r = requestAnimationFrame(() => setPosisi(1));
    return () => cancelAnimationFrame(r);
  }, [terbang]);

  const gaya: React.CSSProperties = terbang
    ? {
        ...awalTerbang,
        // Posisi akhir: di lapisan paling belakang, sudah redup.
        transform:
          posisi === 0
            ? "translateX(0px) translateZ(0px) rotateY(0deg)"
            : `translateX(${(PUNCAK * arah).toFixed(1)}px) translateZ(${(-(LAPISAN - 1) * JARAK_Z).toFixed(1)}px) rotateY(${(-18 * arah).toFixed(1)}deg)`,
        opacity: posisi === 0 ? 1 : 0.35,
        filter: posisi === 0 ? "none" : "blur(4px) brightness(0.7)",
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
    "absolute inset-0 flex flex-col overflow-hidden rounded-[18px] bg-[#0f0f11] " +
    "shadow-[0_0_0_1px_rgba(224,27,36,.22),0_24px_50px_-24px_rgba(0,0,0,.95)] " +
    "[backface-visibility:hidden]";

  if (teratas) {
    return (
      <Link
        to={TUJUAN_BELI}
        className={kelas + " group"}
        style={gaya}
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
}: {
  karya: (typeof sorotan)[number];
  judul: string;
  catatan: string;
  labelMisteri: string;
  labelSegera: string;
  terbaca: boolean;
}) {
  const adaGambar = Boolean(karya.gambar) && karya.gambar!.startsWith("http");

  return (
    <>
      <div className="relative h-[360px] overflow-hidden rounded-t-[18px] bg-void-black sm:h-[400px]">
        {adaGambar ? (
          <>
            <img
              src={karya.gambar}
              alt=""
              loading="lazy"
              decoding="async"
              aria-hidden="true"
              className="absolute inset-0 h-full w-full scale-110 object-cover blur-lg brightness-75 saturate-50"
            />
            <div className="absolute inset-0 bg-void-black/45" aria-hidden="true" />
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

        <span className="absolute left-3.5 top-3.5 inline-flex items-center gap-1.5 rounded-full border border-accent-line bg-void-black/70 px-2.5 py-1 text-[0.6rem] font-semibold uppercase tracking-[0.16em] text-void-white/85 backdrop-blur-sm">
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
        <span className="shrink-0 text-[0.62rem] font-semibold uppercase tracking-[0.16em] text-void-red">
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
   Lingkaran 44 px — ukuran minimum yang nyaman disentuh jari. */
function TombolPanah({
  arah,
  label,
  onClick,
}: {
  arah: "kiri" | "kanan";
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      className="grid h-11 w-11 place-items-center rounded-full border border-void-white/20 bg-void-white/4 text-void-white transition-colors duration-200 hover:border-accent hover:bg-accent-soft hover:text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-void-red"
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
