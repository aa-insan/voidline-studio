import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { useLanguage } from "../../../i18n/useLanguage";
import { karyaPerKelompok, kelompokTampil, type KodeKelompok } from "../../../data/karyaNft";
import HalamanBerlatar from "../../../components/guest/HalamanBerlatar";
import KartuKarya from "../../../components/guest/KartuKarya";

/**
 * Halaman daftar koleksi — berisi karya dari seluruh wallet studio.
 *
 * ── SEMUANYA TAMPIL, TANPA SARINGAN NAMA ───────────────────────────────────
 * Versi sebelumnya menyaring ke koleksi yang namanya mengandung "Voidline".
 * Saringan itu dibuang: ia bergantung pada tebakan nama, dan setiap koleksi
 * baru menuntut seseorang mengingat untuk menambahkannya ke daftar. Yang
 * terlihat bukan aturan, melainkan kelalaian yang menumpuk.
 *
 * Sekarang yang tampil adalah apa adanya: setiap NFT yang diterbitkan wallet
 * studio di XRP Ledger. Koleksi baru muncul tanpa perlu ada yang mengubah kode,
 * asalkan data sumbernya diperbarui.
 *
 * ── FILTER DAN PENCARIAN ────────────────────────────────────────────────────
 * Dropdown menyaring berdasarkan kelompok; pencarian menyaring judul. Keduanya
 * berdiri sendiri — keduanya boleh dipakai bersamaan, keduanya boleh kosong.
 * Daftar kelompok ikut data (`urutanKelompok`), bukan ditulis ulang di sini.
 *
 * ── BIAYA RENDER ────────────────────────────────────────────────────────────
 * Ratusan kartu bukan jumlah yang ringan untuk React. Yang membuatnya aman
 * adalah gambarnya: `KartuKarya` tidak memuat apa pun sampai kartunya masuk
 * layar. Jadi membuka halaman ini tidak mengunduh ratusan GIF — hanya belasan
 * yang terlihat. Pencarian tidak menambah beban: menyaring 654 judul adalah
 * operasi yang tidak terasa, yang berat adalah gambarnya — dan itu tetap
 * ditunda sampai kartu masuk layar.
 */

type Pilihan = Exclude<KodeKelompok | "baru", "semua">;

/** Nilai filter yang sah di dropdown — dipakai untuk memvalidasi URL. */
const KODE_SAHIH = new Set<string>(kelompokTampil);

export default function CollectionPage() {
  const { t } = useLanguage();
  const [parameter] = useSearchParams();
  // Koleksi awal dari URL (?collection=) — dipakai navbar dropdown.
  const collectionUrl = parameter.get("collection") ?? "";
  const awalCollection: Pilihan = KODE_SAHIH.has(collectionUrl) ? (collectionUrl as Pilihan) : "baru";
  const [pilihan, setPilihan] = useState<Pilihan>(awalCollection);

  // Urutan: "asc" = terlama dulu (1,2,3…), "desc" = terbaru dulu (…,3,2,1). null = tanpa sort.
  const [urutan, setUrutan] = useState<"asc" | "desc" | null>(null);

  // Sync pilihan dengan URL saat collection berubah (misal dari navbar dropdown).
  useEffect(() => {
    setPilihan(awalCollection);
  }, [awalCollection]);
  const [kueri, setKueri] = useState("");

  // Cari di judul, apa adanya: tanpa memandang huruf besar-kecil. Nomor edisi
  // ikut dicari — "#39" menemukan Apes Voidline #39.
  const kueriRendah = kueri.trim().toLowerCase();

  // Menyaring 654 judul adalah pekerjaan yang tidak terasa — useMemo di sini
  // bukan demi kecepatan, melainkan supaya identitas daftarnya stabil antar
  // render, sehingga React tidak me-render ulang 654 kartu tanpa alasan.
  const hasil = useMemo(() => {
    const filtered = [pilihan].flatMap((kode) =>
      (karyaPerKelompok[kode] ?? [])
        .filter((karya) => !kueriRendah || karya[1].toLowerCase().includes(kueriRendah))
        .map((karya) => ({ karya, kode })),
    );
    return [...filtered].sort((a, b) => {
      const noA = parseInt(a.karya[1].match(/#(\d+)/)?.[1] ?? "0", 10);
      const noB = parseInt(b.karya[1].match(/#(\d+)/)?.[1] ?? "0", 10);
      return urutan === "asc" ? noA - noB : noB - noA;
    });
  }, [pilihan, kueriRendah, urutan]);

  return (
    <HalamanBerlatar>
      <section className="wadah bagian-kepala-halaman pb-16 sm:pb-20">
        <header className="max-w-2xl">
          <p className="kicker">
            <span className="kicker-garis" aria-hidden="true" />
            {t("collection.works", { count: hasil.length })}
          </p>
          <h1 className="judul-halaman mt-4">
            {t("page.collection.title")}
          </h1>
          <p className="teks-lead mt-4 leading-relaxed text-fg-muted">{t("page.collection.subtitle")}</p>
        </header>

        {/* ── PENCARIAN ──────────────────────────────────────────────────────
            Satu baris, tanpa tombol. Menyaring judul karya — nomor edisi ikut
            ditemukan karena nomornya memang bagian dari judul ("Apes Voidline
            #39"). Hasilnya mengganti seluruh grid, jadi pencarian dan dropdown
            saling menggantikan tanpa perlu tombol "hapus saringan". */}
        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:items-center">
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

          {/* Tombol urutan — panah atas (terlama dulu) / panah bawah (terbaru dulu). */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setUrutan("asc")}
              title={t("collection.sortAsc")}
              aria-label={t("collection.sortAsc")}
              className={`rounded-lg p-2.5 transition-colors ${
                urutan === "asc"
                  ? "bg-accent text-accent-fg"
                  : "text-fg-muted hover:bg-surface-hover hover:text-fg"
              }`}
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
                <path d="M12 4 4 14h5v6h6v-6h5L12 4Z" />
              </svg>
            </button>
            <button
              onClick={() => setUrutan("desc")}
              title={t("collection.sortDesc")}
              aria-label={t("collection.sortDesc")}
              className={`rounded-lg p-2.5 transition-colors ${
                urutan === "desc"
                  ? "bg-accent text-accent-fg"
                  : "text-fg-muted hover:bg-surface-hover hover:text-fg"
              }`}
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
                <path d="M12 20 4 10h5V4h6v6h5L12 20Z" />
              </svg>
            </button>
          </div>
        </div>

        <p className="sr-only" role="status" aria-live="polite">
          {t("collection.works", { count: hasil.length })}
        </p>

        {hasil.length === 0 ? (
          <p className="mt-16 text-center text-sm text-fg-muted">
            {t("collection.noMatch")}
          </p>
        ) : (
          /* ── GRID ──────────────────────────────────────────────────────────
              Dua kolom di ponsel: gambar karya lebih penting daripada ukurannya,
              dan satu kolom berarti menggulir 654 layar. */
          <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-3 md:gap-4 lg:grid-cols-4 xl:grid-cols-5">
            {hasil.map(({ karya, kode }, indeks) => (
              <KartuKarya
                key={`${kode}-${karya[3]}`}
                karya={karya}
                koleksi={t(`collection.kelompok.${kode}`)}
                // Dua belas pertama dimuat tanpa menunggu masuk layar, supaya
                // bagian atas halaman langsung terisi saat dibuka.
                prioritas={indeks < 12}
              />
            ))}
          </div>
        )}
      </section>
    </HalamanBerlatar>
  );
}

