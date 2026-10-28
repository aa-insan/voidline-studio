/* =============================================================================
   HALAMAN INFORMASI

   Menu pengganti Compose di navbar: satu halaman yang menjawab "apa yang
   sedang berjalan sekarang" — pengumuman rilis terbaru beserta seluruh
   karyanya, lengkap dengan pencarian dan filter ketersediaan.

   Isinya diturunkan dari halaman /new-collection yang lama (kini dihapus):
   NFT dari taxon yang belum terdaftar di urutanKelompok — yaitu koleksi
   terbaru yang belum diberi nama dalam kode.

   Halaman ini dihasilkan sepenuhnya dari data ledger: bila tidak ada
   koleksi baru (kodeGrupBaru kosong), ia menampilkan pesan kosong yang
   menunjuk ke /collection. Push ke GitHub atau jalankan npm run tarik-karya
   untuk memperbarui konten secara otomatis.

   Rute terdaftar di src/routes/config.tsx.
   Tombol berasal dari src/pages/guest/home/HomePage.tsx.
   ============================================================================= */

import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../../../i18n/useLanguage";
import { karyaPerKelompok, kodeGrupBaru } from "../../../data/karyaNft";
import HalamanBerlatar from "../../../components/guest/HalamanBerlatar";
import KartuKarya from "../../../components/guest/KartuKarya";
import DropdownKoleksi from "../../../components/guest/DropdownKoleksi";
import { useStatusKarya } from "../../../services/statusKarya";
import PengumumanRilis from "../../../components/guest/PengumumanRilis";

export default function InformationPage() {
  const { t } = useLanguage();
  const { terjual } = useStatusKarya();
  const [kueri, setKueri] = useState("");
  // Status yang dipilih: "semua" | "tersedia" | "laku".
  const [ketersediaan, setKetersediaan] = useState<"semua" | "tersedia" | "laku">("semua");

  const kueriRendah = kueri.trim().toLowerCase();

  // Semua karya dari semua grup "baru" (taxon yang belum terdaftar).
  // kodeGrupBaru hanya berisi "baru" saat ada koleksi terbaru.
  const semuakarya = useMemo(
    () =>
      (kodeGrupBaru.length > 0 ? kodeGrupBaru : []).flatMap((kode) =>
        (karyaPerKelompok[kode] ?? []).map((karya) => ({ karya, kode })),
      ),
    [],
  );

  const hasil = useMemo(
    () =>
      semuakarya.filter(({ karya }) => {
        // Saring nama — nomor edisi ikut ditemukan karena jadi bagian judul.
        if (kueriRendah && !karya[1].toLowerCase().includes(kueriRendah)) {
          return false;
        }
        // Saring ketersediaan — hanya setelah ledger menjawab. Saat masih
        // memuat/gagal, terjual() menjawab false untuk semua, jadi status
        // belum bisa dipakai; filter dilewati sementara.
        if (ketersediaan === "tersedia") return !terjual(karya[3]);
        if (ketersediaan === "laku") return terjual(karya[3]);
        return true;
      }),
    [semuakarya, kueriRendah, ketersediaan, terjual],
  );

  return (
    <HalamanBerlatar>
      <section className="wadah bagian-kepala-halaman pb-16 sm:pb-20">
        <header className="max-w-2xl">
          {semuakarya.length > 0 && (
            <p className="kicker">
              <span className="kicker-garis" aria-hidden="true" />
              {t("collection.works", { count: semuakarya.length })}
            </p>
          )}
          <h1 className={`judul-halaman ${semuakarya.length > 0 ? "mt-4" : ""}`}>
            {t("page.information.title")}
          </h1>

          {/* ── Informasi rilis, menempel di bawah judul ────────────────────
              Kalimat pengumuman dan jadwal batch berasal dari
              src/data/rilis.ts lewat komponen bersama. Varian `tanpaJudul`
              karena judul halaman sudah berdiri di atasnya, dan tanpa GIF
              karena karya aslinya tampil di grid bawah. */}
          <div className="mt-6 border-t border-border pt-6">
            <PengumumanRilis tanpaJudul />
          </div>
        </header>

        {/* Pencarian + filter ketersediaan — selebar grid kartu di bawahnya,
            dropdown menempel di tepi kanan. */}
        {semuakarya.length > 0 && (
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
            <label className="relative flex-[1_1_0]">
              <span className="sr-only">{t("collection.searchLabel")}</span>
              <svg
                viewBox="0 0 24 24"
                className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 fill-current text-fg-muted"
                aria-hidden="true"
              >
                <path d="M10 4a6 6 0 1 0 4.47 7.47l4.53 4.53 1.41-1.41-4.52-4.53A6 6 0 0 0 10 4Zm-4 6a4 4 0 1 1 8 0 4 4 0 0 1-8 0Z" />
              </svg>
              <input
                type="search"
                value={kueri}
                onChange={(e) => setKueri(e.target.value)}
                placeholder={t("collection.searchPlaceholder")}
                aria-label={t("collection.searchLabel")}
                className="bidang-cari"
              />
            </label>

            {/* Dropdown ketersediaan — reusable, warna dan geraknya milik situs.
                Label dari kamus (soldOut/available). */}
            <DropdownKoleksi
              nilai={ketersediaan}
              ganti={(v) => setKetersediaan(v as "semua" | "tersedia" | "laku")}
              label={t("collection.filterAvailability")}
              opsi={[
                { nilai: "semua", label: t("collection.filterAll") },
                { nilai: "tersedia", label: t("collection.available") },
                { nilai: "laku", label: t("collection.soldOut") },
              ]}
            />
          </div>
        )}

        <p className="sr-only" role="status" aria-live="polite">
          {t("collection.works", { count: hasil.length })}
        </p>

        {semuakarya.length === 0 ? (
          /* Belum ada koleksi baru. Arahkan ke /collection. */
          <div className="mt-16 flex flex-col items-center gap-6 text-center">
            <p className="max-w-sm text-sm leading-relaxed text-fg-muted">
              {t("collection.newCollectionEmpty")}
            </p>
            <Link to="/collection" className="tombol tombol-merah">
              {t("collection.newCollectionBrowse")}
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
                <path d="M12.97 5.47a.75.75 0 0 1 1.06 0l6 6a.75.75 0 0 1 0 1.06l-6 6a.75.75 0 1 1-1.06-1.06l4.72-4.72H4.75a.75.75 0 0 1 0-1.5h12.94l-4.72-4.72a.75.75 0 0 1 0-1.06Z" />
              </svg>
            </Link>
          </div>
        ) : hasil.length === 0 ? (
          <p className="mt-16 text-center text-sm text-fg-muted">
            {t("collection.noMatch")}
          </p>
        ) : (
          <>
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4 xl:grid-cols-5">
              {hasil.map(({ karya, kode }, indeks) => (
                <KartuKarya
                  key={`${kode}-${karya[3]}`}
                  karya={karya}
                  koleksi={t(`page.information.title`)}
                  prioritas={indeks < 12}
                  showStatus={false}
                />
              ))}
            </div>

            {/* Pas panah penutup — kiri ke /collection, kanan ke xrp.cafe;
                keduanya di luar grid, tepat di atas garis pembatas footer.
                Margin bawah negatif meniadakan padding section
                (pb-16 sm:pb-20) hingga tinggal 0.5rem jarak ke garis.
                Gerak: panah-geser (kanan) dan panah-geser-kiri di index.css. */}
            <div className="-mb-14 mt-6 flex items-center justify-between sm:-mb-[4.5rem]">
              <Link
                to="/collection"
                aria-label={t("collection.viewCollection")}
                title={t("collection.viewCollection")}
                className="panah-geser-kiri group inline-flex"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-16 w-16 fill-current text-void-white sm:h-20 sm:w-20"
                  aria-hidden="true"
                >
                  <path d="M11.03 5.47a.75.75 0 0 0-1.06 0l-6 6a.75.75 0 0 0 0 1.06l6 6a.75.75 0 1 0 1.06-1.06L6.31 12.75h12.94a.75.75 0 0 0 0-1.5H6.31l4.72-4.72a.75.75 0 0 0 0-1.06Z" />
                </svg>
              </Link>

              <a
                href="https://xrp.cafe/id/collection/momapesvoidline-jajangosle"
                target="_blank"
                rel="noopener noreferrer"
                aria-label={t("home.rilis.cta")}
                title={t("home.rilis.cta")}
                className="panah-geser group inline-flex"
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-16 w-16 fill-current text-void-white sm:h-20 sm:w-20"
                  aria-hidden="true"
                >
                  <path d="M12.97 5.47a.75.75 0 0 1 1.06 0l6 6a.75.75 0 0 1 0 1.06l-6 6a.75.75 0 1 1-1.06-1.06l4.72-4.72H4.75a.75.75 0 0 1 0-1.5h12.94l-4.72-4.72a.75.75 0 0 1 0-1.06Z" />
                </svg>
              </a>
            </div>
          </>
        )}
      </section>
    </HalamanBerlatar>
  );
}
