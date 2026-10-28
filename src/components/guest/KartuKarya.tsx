/* =============================================================================
   KARTU KARYA — SATU NFT DI DALAM GRID KOLEKSI

   ── KENAPA GAMBAR TIDAK LANGSUNG DIMUAT ────────────────────────────────────
   Koleksi terbesar berisi 302 karya. Kalau 302 GIF animasi dimuat sekaligus,
   halaman menarik puluhan sampai ratusan megabita, dan di ponsel hasilnya
   halaman berhenti merespons. Karena itu gambarnya dimuat hanya ketika kartu
   benar-benar masuk layar (IntersectionObserver), bukan saat halaman dibuka.

   ── KLIKNYA KE MANA ────────────────────────────────────────────────────────
   Kartu adalah tautan ke halaman detail karya (/collection/work/:nftId) —
   tempat tombol mint dan atribut karya berada. GIF aslinya bergerak di sana;
   di grid, kartu sengaja menampilkan gambar statis (poster) supaya membuka
   halaman ini tidak mengunduh ratusan animasi sekaligus.

   ── KALAU IPFS LAMBAT ATAU MATI ────────────────────────────────────────────
   Ada tiga gateway. Yang pertama gagal, pindah ke berikutnya. Kalau semuanya
   gagal, kartu menampilkan kotak kosong berlabel — bukan ikon gambar rusak.
   ============================================================================= */

import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../../i18n/useLanguage";
import { type KaryaNft } from "../../data/karyaNft";
import { daftarAlamat } from "../../services/gambarKarya";
import { useStatusKarya } from "../../services/statusKarya";

type Props = {
  karya: KaryaNft;
  /** Nama koleksi induk. Tidak tampil di kartu — dipakai untuk label pembaca layar. */
  koleksi: string;
  prioritas?: boolean;
  /** Sembunyikan badge Available / Sold out. Dipakai halaman information yang
      tidak perlu membedakan status jual per kartu. Koleksi tetap menampilkannya. */
  showStatus?: boolean;
};

export default function KartuKarya({
  karya,
  koleksi,
  prioritas = false,
  showStatus = true,
}: Props) {
  const { t } = useLanguage();
  const [nomor, judul, uri, nftId] = karya;

  // Judul yang isinya hanya nomor ("#55") — terjadi pada karya yang metadata
  // `name`-nya kosong. Nomor di pojok disembunyikan untuk kasus ini supaya
  // tidak muncul dua kali di kartu yang sama.
  const hanyaNomor = /^#\d+$/.test(judul);

  const bingkai = useRef<HTMLAnchorElement>(null);
  const [terlihat, setTerlihat] = useState(prioritas);
  const [alamat, setAlamat] = useState(() => daftarAlamat(uri));
  const [gagal, setGagal] = useState(false);

  // Status laku/tersedia dari ledger, dibaca sekali untuk seluruh grid —
  // lihat statusKarya.ts. Selama ledger belum menjawab, tidak ada badge.
  const { keadaan, terjual } = useStatusKarya();
  const sudahLaku = terjual(nftId);

  // Muat hanya saat kartu masuk layar.
  useEffect(() => {
    if (prioritas) return;
    const el = bingkai.current;
    if (!el) return;

    const pengawas = new IntersectionObserver(
      (catatan) => {
        if (catatan.some((c) => c.isIntersecting)) {
          setTerlihat(true);
          pengawas.disconnect();
        }
      },
      // 300px di bawah layar: gambar sudah siap sebelum pengunjung sampai.
      { rootMargin: "300px" },
    );

    pengawas.observe(el);
    return () => pengawas.disconnect();
  }, [prioritas]);

  const sumber = alamat[0];

  return (
    <figure className="group overflow-hidden rounded-xl border border-border bg-panel">
      <Link
        ref={bingkai}
        to={`/collection/work/${nftId}`}
        aria-label={
          keadaan === "siap"
            ? `${judul} — ${koleksi} — ${sudahLaku ? t("collection.soldOut") : t("collection.available")}`
            : `${judul} — ${koleksi}`
        }
        className="relative block aspect-square w-full overflow-hidden bg-void-black focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-bright"
      >
        {terlihat && !gagal && (
          <img
            src={sumber}
            alt={judul}
            loading={prioritas ? "eager" : "lazy"}
            decoding="async"
            width={400}
            height={400}
            onError={() => {
              // Gateway pertama gagal: coba berikutnya sebelum menyerah.
              const sisa = alamat.slice(1);
              if (sisa.length > 0) setAlamat(sisa);
              else setGagal(true);
            }}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
        )}

        {!terlihat && <span className="sr-only">{t("collection.loadingArt")}</span>}

        {gagal && (
          <span className="grid h-full w-full place-items-center px-3 text-center text-[0.7rem] leading-snug text-fg-muted">
            {t("collection.artFailed")}
          </span>
        )}

        {/* Nomor edition di pojok. Disembunyikan bila judulnya sendiri sudah
            berupa nomor (Pukonimichi), supaya tidak tampil "#55" dua kali. */}
        {!hanyaNomor && (
          <span className="absolute left-2 top-2 rounded-md bg-void-black/80 px-1.5 py-0.5 text-[0.65rem] font-semibold tabular-nums text-void-white">
            #{nomor}
          </span>
        )}

        {/* Status jual di pojok kanan atas. Muncul setelah ledger menjawab —
            sebelum itu kartu polos, bukan menebak. */}
        {showStatus && keadaan === "siap" && (
          <span
            className={
              sudahLaku
                ? "absolute right-2 top-2 rounded-md bg-void-black/80 px-1.5 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wider text-void-white/75"
                : "absolute right-2 top-2 rounded-md bg-void-white px-1.5 py-0.5 text-[0.6rem] font-semibold uppercase tracking-wider text-void-black"
            }
          >
            {sudahLaku ? t("collection.soldOut") : t("collection.available")}
          </span>
        )}
      </Link>

      <figcaption className="p-3">
        <p className="truncate text-sm font-semibold text-panel-fg" title={judul}>
          {judul}
        </p>
      </figcaption>
    </figure>
  );
}
