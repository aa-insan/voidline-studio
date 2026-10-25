/* =============================================================================
   HALAMAN DETAIL KARYA — /collection/work/:nftId

   Satu halaman untuk satu karya, dibuka dari kartu di /collection.

   ── KENAPA NFT-ID, BUKAN NOMOR ──────────────────────────────────────────────
   Nomor edisi bisa berulang: Fine Art Voidline menyimpan lima nama "Fine Art
   Voidline 5" untuk 42 karya, dan 250 karya lain tidak punya nama sama sekali.
   NFTokenID adalah satu-satunya penanda yang pasti unik di ledger.

   ── TOMBOL MINT ─────────────────────────────────────────────────────────────
   Tiga koleksi Voidline punya halaman mint di situs ini (widget xrp.cafe).
   Karya dari koleksi lain — Neo, Karya Lepas, Pukonimichi — tidak punya halaman
   koleksi di xrp.cafe yang diketahui, jadi tombol mint tampil nonaktif dengan
   keterangan, dan pengunjung diarahkan ke halaman NFT itu di xrp.cafe.

   Kalau nanti salah satu koleksi punya halaman xrp.cafe, cukup tambahkan
   slug-nya ke `koleksiSlug` di data karya — tombol mint-nya ikut aktif tanpa
   perubahan di berkas ini.
   ============================================================================= */

import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useLanguage } from "../../../i18n/useLanguage";
import {
  karyaLookup,
  kelompokKarya,
  koleksiSlug,
  type KodeKelompok,
} from "../../../data/karyaNft";
import { detailKarya } from "../../../data/karyaDetail";
import { daftarAlamat } from "../../../services/gambarKarya";
import { useStatusKarya } from "../../../services/statusKarya";
import HalamanBerlatar from "../../../components/guest/HalamanBerlatar";

/** Kode kelompok → nama koleksi yang tampil di layar. */
const NAMA_KELOMPOK: Record<KodeKelompok, { id: string; en: string }> = {
  apid: { id: "Apes Voidline", en: "Apes Voidline" },
  favo: { id: "Fine Art Voidline", en: "Fine Art Voidline" },
  javo: { id: "Jajang Voidline", en: "Jajang Voidline" },
  neo: { id: "Neo", en: "Neo" },
  lepas: { id: "Karya Lepas", en: "Standalone" },
  puko: { id: "Pukonimichi", en: "Pukonimichi" },
};

export default function KaryaPage() {
  const { nftId } = useParams();
  const { t, language } = useLanguage();

  const karya = nftId ? karyaLookup[nftId] : undefined;
  const detail = nftId ? detailKarya[nftId] : undefined;

  // Sudah laku = sudah keluar dari wallet studio. Ledger yang menjawab, bukan
  // data statis: karya yang terjual kemarin ikut mati tombolnya hari ini.
  // Dipanggil sebelum cabang "karya tidak ada" supaya urutan hook tetap sama.
  const { terjual } = useStatusKarya();

  if (!karya) {
    return (
      <HalamanBerlatar>
        <section className="wadah bagian-kepala-halaman pb-20 text-center">
          <h1 className="judul-halaman">
            {t("collection.workNotFound")}
          </h1>
          <Link to="/collection" className="tombol tombol-merah mt-8">
            {t("collection.back")}
          </Link>
        </section>
      </HalamanBerlatar>
    );
  }

  const [nomor, judul, gambar] = karya;
  const kode = kelompokKarya(karya[3]);

  // Hanya koleksi lama yang punya halaman mint di situs ini; karya grup
  // "baru" (taxon belum terdaftar) belum punya slug maupun nama resmi.
  const slug = kode ? koleksiSlug[kode as KodeKelompok] : undefined;
  const namaKoleksi =
    kode && kode in NAMA_KELOMPOK ? NAMA_KELOMPOK[kode as KodeKelompok][language] : judul;

  // Judul yang hanya berisi nomor tidak perlu badge nomor lagi.
  const hanyaNomor = /^#\d+$/.test(judul);
  const laku = terjual(karya[3]);

  return (
    <HalamanBerlatar>
      <section className="wadah bagian-kepala-halaman pb-16 sm:pb-20">
        <Link
          to="/collection"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-fg-muted underline-offset-4 transition-colors hover:text-fg hover:underline"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
            <path d="M14.53 5.47a.75.75 0 0 1 0 1.06L9.81 12l4.72 5.47a.75.75 0 1 1-1.06 1.06l-6-6a.75.75 0 0 1 0-1.06l6-6a.75.75 0 0 1 1.06 0Z" />
          </svg>
          {t("collection.back")}
        </Link>

        <div className="mt-6 grid gap-8 md:grid-cols-2 md:gap-10 lg:mt-8">
          <div className="overflow-hidden rounded-2xl border border-border bg-void-black">
            {/* key=uri: pindah karya berarti remount, jadi alamat gateway
                dihitung ulang tanpa efek tambahan. */}
            <GambarUtama key={gambar} judul={judul} uri={gambar} />
          </div>

          <div className="flex flex-col">
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-accent-bright">
              {namaKoleksi}
              {!hanyaNomor && <span className="ml-2 text-fg-muted">#{nomor}</span>}
            </p>
            <h1 className="mt-3 font-display text-3xl font-bold tracking-tight text-fg sm:text-4xl">
              {judul}
            </h1>

            {detail?.desc && (
              <p className="mt-4 whitespace-pre-line leading-relaxed text-fg-muted">
                {detail.desc}
              </p>
            )}

            {detail?.attrs.length ? (
              <dl className="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3">
                {detail.attrs.map((a) => {
                  if (!a.trait_type || a.value === undefined || a.value === "")
                    return null;
                  return (
                    <div
                      key={`${a.trait_type}-${a.value}`}
                      className="rounded-lg border border-border bg-panel px-3 py-2"
                    >
                      <dt className="text-[0.6rem] uppercase tracking-wider text-panel-fg-muted">
                        {a.trait_type}
                      </dt>
                      <dd className="mt-0.5 text-sm font-semibold text-panel-fg">
                        {a.value}
                      </dd>
                    </div>
                  );
                })}
              </dl>
            ) : null}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {laku ? (
                <span
                  aria-disabled="true"
                  className="tombol cursor-not-allowed border border-border text-fg-muted"
                >
                  {t("collection.soldOut")}
                </span>
              ) : slug ? (
                <Link to={`/collection/mint/${slug}`} className="tombol tombol-merah">
                  {t("collection.mintNow")}
                </Link>
              ) : (
                <span
                  aria-disabled="true"
                  className="tombol cursor-not-allowed border border-border text-fg-muted"
                >
                  {t("collection.mintHere")}
                </span>
              )}

              <a
                href={`https://xrp.cafe/id/nft/${karya[3]}`}
                target="_blank"
                rel="noreferrer noopener"
                className="tombol tombol-garis"
              >
                {t("collection.viewOnXrpCafe")}
                <svg
                  viewBox="0 0 24 24"
                  className="h-4 w-4 fill-current"
                  aria-hidden="true"
                >
                  <path d="M14 5h5v5h-2V8.41l-5.29 5.3-1.42-1.42L15.59 7H14V5Zm-4 8v6H5v-6h5Zm-7-2h9v9H3v-9Z" />
                </svg>
              </a>
            </div>

            {laku ? (
              <p className="mt-3 text-xs leading-relaxed text-fg-muted">
                {t("collection.soldOutNote")}
              </p>
            ) : (
              !slug && (
                <p className="mt-3 text-xs leading-relaxed text-fg-muted">
                  {t("collection.mintOutside")}
                </p>
              )
            )}

            {/* NFTokenID — identitas karya di ledger. Hurufnya 64 karakter dan
                panjang, jadi ia dilipat: tidak mengganggu pandangan, tetapi
                tetap bisa dibuka untuk mencocokkan karya dengan xrp.cafe. */}
            <details className="mt-6 text-xs text-fg-muted">
              <summary className="cursor-pointer select-none underline-offset-4 hover:text-fg hover:underline">
                {t("collection.tokenId")}
              </summary>
              <p className="mt-2 break-all font-mono text-[0.7rem] leading-relaxed">
                {karya[3]}
              </p>
            </details>
          </div>
        </div>
      </section>
    </HalamanBerlatar>
  );
}

/**
 * Gambar ukuran penuh dengan gateway cadangan.
 *
 * Berbeda dengan kartu di grid, di sini gambarnya dimuat segera — hanya satu
 * karya yang tampil, jadi tidak ada alasan menundanya.
 */
function GambarUtama({ judul, uri }: { judul: string; uri: string }) {
  const { t } = useLanguage();
  const [alamat, setAlamat] = useState(() => daftarAlamat(uri));
  const [gagal, setGagal] = useState(false);

  if (gagal) {
    return (
      <div className="grid aspect-square w-full place-items-center px-6 text-center text-sm text-fg-muted">
        {t("collection.artFailed")}
      </div>
    );
  }

  return (
    <img
      src={alamat[0]}
      alt={judul}
      decoding="async"
      width={800}
      height={800}
      onError={() => {
        const sisa = alamat.slice(1);
        if (sisa.length > 0) setAlamat(sisa);
        else setGagal(true);
      }}
      className="aspect-square w-full object-contain"
    />
  );
}
