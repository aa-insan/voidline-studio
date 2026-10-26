/* =============================================================================
   HALAMAN KOLEKSI TERBARU

   Menampilkan NFT dari taxon yang belum terdaftar di urutanKelompok —
   yaitu koleksi terbaru yang belum diberi nama dalam kode.

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
import PengumumanRilis from "../../../components/guest/PengumumanRilis";

export default function NewCollectionPage() {
  const { t } = useLanguage();
  const [kueri, setKueri] = useState("");

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
      kueriRendah
        ? semuakarya.filter(({ karya }) => karya[1].toLowerCase().includes(kueriRendah))
        : semuakarya,
    [semuakarya, kueriRendah],
  );

  return (
    <HalamanBerlatar>
      {/* ── HERO: pengumuman rilis ──────────────────────────────────────────
          Di halaman ini pengumuman drop adalah judul utamanya, jadi ia memakai
          varian `utama` — <h1> sendiri, jarak kepala halaman, dan GIF dimuat
          lebih dulu. Isinya dari src/data/rilis.ts. */}
      <PengumumanRilis utama />

      <section className="wadah bagian pb-16 sm:pb-20">
        <header className="max-w-2xl">
          <p className="kicker">
            <span className="kicker-garis" aria-hidden="true" />
            {t("collection.works", { count: semuakarya.length })}
          </p>
          <h2 className="judul-bagian mt-4">
            {t("page.newCollection.title")}
          </h2>
          <p className="mt-4 leading-relaxed text-fg-muted">
            {t("page.newCollection.subtitle")}
          </p>
        </header>

        {/* Pencarian — sama seperti /collection, tapi tanpa dropdown. */}
        {semuakarya.length > 0 && (
          <div className="mt-10 max-w-sm">
            <label className="relative flex-1">
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
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4 xl:grid-cols-5">
            {hasil.map(({ karya, kode }, indeks) => (
              <KartuKarya
                key={`${kode}-${karya[3]}`}
                karya={karya}
                koleksi={t(`page.newCollection.title`)}
                prioritas={indeks < 12}
              />
            ))}
          </div>
        )}
      </section>
    </HalamanBerlatar>
  );
}
