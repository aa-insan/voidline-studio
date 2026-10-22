/* =============================================================================
   SOROTAN KARYA — GALERI BERJALAN DI HALAMAN ATRIUM

   Delapan karya pilihan, disusun mendatar, berjalan sendiri dari kanan ke kiri.
   Setelah kartu terakhir lewat, kartu pertama menyusul tanpa jeda — tidak ada
   ujung yang terlihat, tidak ada lompatan kembali ke awal.

   ── SAMAR, LALU JERNIH SAAT DISENTUH ──────────────────────────────────────
   Seluruh kartu tampil SAMAR — diblur, diredupkan, dan warnanya dikecilkan.
   Karya yang sedang ditunjuk kursor (atau dijangkau dengan papan ketik)
   berubah JERNIH: blur hilang, terang penuh, warna kembali, dan kartu terangkat
   sedikit. Jadi strip terbaca sebagai deretan gambar yang menunggu, bukan
   sebagai album yang sudah terbuka.

   Yang samar BUKAN satu lapisan buram di atas strip. Kalau begitu, kartu yang
   jernih akan tetap tertutup lapisan itu. Blur dipasang per kartu, sehingga
   satu kartu bisa jernih sementara tetangganya tetap samar.

   ── KAPAN BERHENTI ────────────────────────────────────────────────────────
   Kursor boleh lewat di atas strip: jalan terus. Yang menghentikan hanya
   tindakan sungguhan — klik, ketuk, atau geseran jari. Tiga detik setelah
   dilepas, jalan lagi.

   Ini disengaja: kalau kursor saja menghentikan, strip akan berhenti setiap
   kali tetikus melintas di jalan menuju tombol lain, dan pengunjung melihatnya
   sebagai gerakan yang tersendat.

   ── CARA MEMBUATNYA TANPA TERLIHAT UJUNGNYA ────────────────────────────────
   Isi strip digandakan: delapan karya asli, lalu delapan salinan. Lebar satu
   putaran adalah lebar delapan kartu asli ditambah jaraknya. Begitu geseran
   mencapai lebar itu, nilainya dikurangi tepat satu putaran — dan karena
   salinan di posisi itu bentuknya persis sama dengan aslinya, mata tidak
   melihat apa pun terjadi.

   ── KECEPATAN ─────────────────────────────────────────────────────────────
   Sekitar 60 piksel per detik pada layar apa pun. Dihitung per milidetik,
   bukan per bingkai, supaya layar 120 Hz dan 60 Hz berjalan sama cepat.

   ── GERAK DIKURANGI ───────────────────────────────────────────────────────
   Pengguna yang memasang `prefers-reduced-motion` mendapat strip diam yang
   tetap bisa digeser, dan kartu langsung jernih tanpa animasi peralihan.
   Gerak berulang tanpa henti adalah salah satu pemicu pusing yang paling
   sering, jadi permintaan itu dihormati.
   ============================================================================= */

import { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../../i18n/useLanguage";
import { sorotan } from "../../data/sorotan";
import { collections } from "../../data/collections";

/** Halaman mint koleksi pertama — tujuan klik pada kartu. */
const TUJUAN_BELI = `/collections/mint/${collections[0].slug}`;

/** Kecepatan jalan, piksel per detik. */
const KECEPATAN = 60;

/** Jeda sebelum jalan lagi setelah disentuh, milidetik. */
const JEDA_LANJUT = 3000;

/** Kecepatan saat kursor berada di atas strip, sebagai bagian dari KECEPATAN
    penuh. Tidak nol: Anda meminta strip berhenti HANYA saat diklik atau
    digeser. Tapi kalau tetap 60 px/detik, kartu bergeser di bawah kursor dan
    sorotan berpindah sendiri, sehingga kartu yang ingin dilihat terus lolos.

    0.25 = sekitar 15 px/detik. Kartu 300 px butuh ±20 detik untuk lewat:
    cukup lambat untuk dibaca, cukup cepat untuk tetap terasa hidup.

    Jangan turunkan di bawah ±0,2. `scrollLeft` disimpan sebagai bilangan
    bulat, jadi pada 40 bingkai per detik setiap bingkai hanya menambah
    0,12 px — dan angka itu hilang saat dibulatkan, sehingga strip terlihat
    mati total padahal rumusnya berjalan. */
const PELAN = 0.25;

export default function SorotanKarya() {
  const { t } = useLanguage();
  const strip = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = strip.current;
    if (!el) return;

    // Pengguna yang meminta gerak dikurangi tidak diberi gerak otomatis.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let berhenti = false;
    let jamJeda = 0;
    let permintaan = 0;
    let terakhir = 0;
    /** Lebar satu putaran penuh (delapan kartu asli + jaraknya), piksel. */
    let putaran = 0;

    /** Hitung lebar satu putaran dari kartu pertama asli dan kartu pertama
        salinan. `offsetLeft` dipakai, bukan `getBoundingClientRect`, karena
        offsetLeft tidak terpengaruh posisi gulir maupun pembulatan layar. */
    const ukur = () => {
      const anak = el.children;
      const n = sorotan.length;
      if (anak.length < n + 1) return;
      putaran = (anak[n] as HTMLElement).offsetLeft - (anak[0] as HTMLElement).offsetLeft;
    };

    const snapAktif = (nyala: boolean) => {
      if (nyala) {
        el.classList.add("snap-x", "snap-mandatory");
        for (const k of Array.from(el.children)) k.classList.add("snap-start");
      } else {
        el.classList.remove("snap-x", "snap-mandatory");
        for (const k of Array.from(el.children)) k.classList.remove("snap-start");
      }
    };

    /** Hanya klik, ketuk, dan geseran yang menghentikan — bukan kursor lewat. */
    const tahan = () => {
      berhenti = true;
      clearTimeout(jamJeda);
      snapAktif(true);
    };

    const lepas = () => {
      clearTimeout(jamJeda);
      jamJeda = window.setTimeout(() => {
        berhenti = false;
        snapAktif(false);
        terakhir = 0;
      }, JEDA_LANJUT);
    };

    const langkah = (now: number) => {
      permintaan = requestAnimationFrame(langkah);
      if (berhenti || document.hidden) {
        terakhir = now;
        return;
      }
      if (!putaran) ukur();
      if (!putaran) return;

      const dt = terakhir ? Math.min(now - terakhir, 100) : 16;
      terakhir = now;

      // Keadaan "sedang ditunjuk" dibaca langsung dari peramban tiap bingkai,
      // bukan disimpan dari event. `pointerleave` bisa terlewat — misalnya saat
      // kursor keluar jendela atau tab berpindah — dan sekali terlewat, strip
      // akan melambat selamanya tanpa ada yang memperbaikinya.
      const ditunjuk = el.matches(":hover");

      el.scrollLeft += ((KECEPATAN * (ditunjuk ? PELAN : 1)) * dt) / 1000;

      // Melewati satu putaran: kurangi tepat satu putaran. Bentuk di layar
      // tidak berubah sama sekali, jadi peralihannya tidak terlihat.
      if (el.scrollLeft >= putaran) {
        el.scrollLeft -= putaran;
      }
    };

    // Kursor TIDAK menghentikan. Yang menghentikan: menekan, menyentuh, dan
    // menggeser roda (niat menggeser sendiri). Klik dihitung lewat pointerdown
    // supaya berlaku untuk tetikus maupun jari.
    el.addEventListener("pointerdown", tahan);
    el.addEventListener("pointerup", lepas);
    el.addEventListener("pointercancel", lepas);
    el.addEventListener("touchstart", tahan, { passive: true });
    el.addEventListener("touchend", lepas, { passive: true });
    el.addEventListener("wheel", tahan, { passive: true });

    const pengamat = new ResizeObserver(ukur);
    pengamat.observe(el);

    permintaan = requestAnimationFrame(langkah);

    return () => {
      cancelAnimationFrame(permintaan);
      clearTimeout(jamJeda);
      pengamat.disconnect();
      el.removeEventListener("pointerdown", tahan);
      el.removeEventListener("pointerup", lepas);
      el.removeEventListener("pointercancel", lepas);
      el.removeEventListener("touchstart", tahan);
      el.removeEventListener("touchend", lepas);
      el.removeEventListener("wheel", tahan);
    };
  }, []);

  /** Satu kartu karya. `salinan` menandai penggandaan supaya isinya tidak
      dibacakan dua kali oleh pembaca layar dan tidak bisa difokuskan keyboard
      dua kali. */
  const Kartu = ({ i, salinan }: { i: number; salinan?: boolean }) => {
    const karya = sorotan[i];
    const adaGambar = Boolean(karya.gambar) && karya.gambar!.startsWith("http");

    return (
      <Link
        to={TUJUAN_BELI}
        role={salinan ? undefined : "listitem"}
        aria-hidden={salinan ? true : undefined}
        tabIndex={salinan ? -1 : undefined}
        /* Dua perubahan dari susunan biasa:

           `[&:hover]:` (bukan `hover:`) dipakai karena Tailwind menaruh
           varian `hover:` SEBELUM utilitas dasarnya di stylesheet. Dengan
           spesifisitas sama, `blur-[3px]` yang menang dan kartu tidak pernah
           jernih. `[&:hover]` menghasilkan selektor yang lebih kuat, jadi ia
           benar-benar menimpa blur dasarnya.

           `group` dipertahankan supaya penanda panah di dalam kartu bisa
           mengikuti keadaan sorot yang sama. */
        className="group w-[260px] shrink-0 snap-start overflow-hidden rounded-2xl border-2 border-transparent bg-panel opacity-55 shadow-none blur-[3px] transition-[filter,opacity,transform,border-color,box-shadow] duration-300 [&:hover]:z-10 [&:hover]:-translate-y-1 [&:hover]:border-accent [&:hover]:opacity-100 [&:hover]:shadow-brand-md [&:hover]:blur-none focus-visible:z-10 focus-visible:-translate-y-1 focus-visible:border-accent focus-visible:opacity-100 focus-visible:shadow-brand-md focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-void-red sm:w-[300px] motion-reduce:blur-none motion-reduce:opacity-100 motion-reduce:transition-none"
      >
        <div className="relative aspect-square overflow-hidden bg-void-black">
          {adaGambar ? (
            <img
              src={karya.gambar}
              alt={salinan ? "" : t(karya.judulKey)}
              loading="lazy"
              decoding="async"
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <>
              <div
                aria-hidden="true"
                className="absolute -left-1/4 top-0 h-full w-1/2 rotate-12 bg-linear-to-r from-void-red/25 to-transparent"
              />
              <span className="absolute inset-0 grid place-items-center text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-void-white/60">
                {t("sorotan.segera")}
              </span>
            </>
          )}

          {/* Penanda "bisa diklik" — muncul hanya saat kartu benar-benar
              disentuh, supaya strip yang sedang berjalan tetap bersih. */}
          <span
            aria-hidden="true"
            className="absolute right-3 top-3 grid h-7 w-7 place-items-center rounded-full bg-void-red text-void-white opacity-0 transition-opacity duration-300 group-hover:opacity-100 group-focus-visible:opacity-100"
          >
            <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 fill-current">
              <path d="M9.47 5.47a.75.75 0 0 1 1.06 0l6 6a.75.75 0 0 1 0 1.06l-6 6a.75.75 0 1 1-1.06-1.06L14.19 12 9.47 7.28a.75.75 0 0 1 0-1.06Z" />
            </svg>
          </span>
        </div>

        <div className="p-4">
          <h3 className="font-display text-base font-semibold tracking-tight text-panel-fg">
            {t(karya.judulKey)}
          </h3>
          <p className="mt-1 text-xs font-medium uppercase tracking-[0.14em] text-accent-on-panel">
            {t(karya.catatanKey)}
          </p>
        </div>
      </Link>
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

      {/* Padding samping negatif (`-mx-5 px-5`) membuat strip bisa berjalan
          sampai tepi layar, sementara judul di atasnya tetap sejajar dengan
          isi halaman. */}
      <div
        ref={strip}
        role="list"
        aria-label={t("sorotan.judul")}
        className="scrollbar-none -mx-5 mt-10 flex gap-5 overflow-x-auto px-5 pb-2"
      >
        {sorotan.map((_, i) => (
          <Kartu key={"asli-" + i} i={i} />
        ))}
        {/* Penggandaan: bentuk yang sama persis, hanya untuk menyambung
            putaran. Disembunyikan dari pembaca layar dan tidak bisa difokuskan. */}
        {sorotan.map((_, i) => (
          <Kartu key={"salinan-" + i} i={i} salinan />
        ))}
      </div>
    </section>
  );
}
