/* =============================================================================
   MULAI DARI NOL — panel pembuka saat proyek masih kosong

   Pengunjung yang membuka generator tanpa gambar sudah punya proyek kosong:
   daftar layer kosong, pratinjau kosong, pengaturan koleksi yang belum diisi.
   Secara teknis semuanya benar, tetapi tidak ada satu pun petunjuk apa yang
   harus dilakukan lebih dulu.

   Panel ini menggantikan bidang kosong itu dengan tiga jalan masuk, disusun
   dari yang paling sering dipakai:

     1. Unggah gambar        jalan utama, satu layer lalu isi gambarnya
     2. Muat koleksi contoh  untuk mencoba mesin tanpa menyiapkan apa pun
     3. Mulai manual         untuk yang ingin membuat layer satu per satu

   Jalan ketiga bisa dibilang sama dengan mengetik nama layer di kotak bawah.
   Ia tetap ditampilkan karena tombol kecil di bagian bawah daftar mudah
   terlewat, dan tiga pilihan terbaca lebih jelas daripada dua.

   ── BENTUK ────────────────────────────────────────────────────────────────
   Tiga kartu sederajat, bukan satu tombol besar di tengah. Tetap tidak
   mencolok (garis, bukan bidang warna) supaya tombol merah utama di halaman
   — Generate — tetap jadi satu-satunya aksi yang berteriak.
   ============================================================================= */

import { useRef } from "react";
import { useLanguage } from "../../../i18n/useLanguage";

type Props = {
  /** Dipanggil dengan berkas pilihan pengunjung; berkas digabung jadi satu layer. */
  onPilihBerkas: (berkas: File[]) => void;
  onMuatContoh: () => void;
  /** Mengisi kotak nama layer di bawah daftar dan memindahkan fokus ke sana. */
  onMulaiManual: () => void;
  /** Proyek contoh sedang disusun. */
  memuatContoh: boolean;
};

export default function EmptyStart({ onPilihBerkas, onMuatContoh, onMulaiManual, memuatContoh }: Props) {
  const { t } = useLanguage();
  const berkasRef = useRef<HTMLInputElement>(null);

  return (
    <div className="rounded-xl border border-border bg-surface/40 px-5 py-8 sm:px-8 sm:py-10">
      <h3 className="font-display text-lg font-semibold tracking-tight text-fg">
        {t("page.generator.start.title")}
      </h3>
      <p className="mt-1.5 max-w-xl text-sm leading-relaxed text-fg-muted">
        {t("page.generator.start.body")}
      </p>

      <div className="mt-6 grid gap-3 sm:grid-cols-3">
        {/* 1. Unggah gambar */}
        <button
          type="button"
          onClick={() => berkasRef.current?.click()}
          className="group flex flex-col items-start gap-2 rounded-lg border border-border-strong bg-surface px-4 py-4 text-left transition-colors hover:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <PanahIkon />
          <span className="text-sm font-semibold text-fg">
            {t("page.generator.start.uploadTitle")}
          </span>
          <span className="text-xs leading-relaxed text-fg-muted">
            {t("page.generator.start.uploadBody")}
          </span>
        </button>

        {/* 2. Koleksi contoh */}
        <button
          type="button"
          onClick={onMuatContoh}
          disabled={memuatContoh}
          className="group flex flex-col items-start gap-2 rounded-lg border border-border-strong bg-surface px-4 py-4 text-left transition-colors hover:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent disabled:cursor-progress disabled:opacity-60"
        >
          <BintangIkon />
          <span className="text-sm font-semibold text-fg">
            {memuatContoh
              ? t("page.generator.start.loadingDemo")
              : t("page.generator.start.demoTitle")}
          </span>
          <span className="text-xs leading-relaxed text-fg-muted">
            {t("page.generator.start.demoBody")}
          </span>
        </button>

        {/* 3. Mulai manual */}
        <button
          type="button"
          onClick={onMulaiManual}
          className="group flex flex-col items-start gap-2 rounded-lg border border-border-strong bg-surface px-4 py-4 text-left transition-colors hover:border-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
        >
          <DaftarIkon />
          <span className="text-sm font-semibold text-fg">
            {t("page.generator.start.manualTitle")}
          </span>
          <span className="text-xs leading-relaxed text-fg-muted">
            {t("page.generator.start.manualBody")}
          </span>
        </button>
      </div>

      {/*
        Kotak berkas tersembunyi dipakai bersama kartu pertama. Daftar layer
        tetap dibuat dari nama berkasnya (mis. "Background_Blue-01.png"
        menjadi layer "Background Blue"), jadi tidak perlu memasukkan nama
        layer lebih dulu.
      */}
      <input
        ref={berkasRef}
        type="file"
        multiple
        accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
        className="sr-only"
        aria-label={t("page.generator.start.uploadTitle")}
        onChange={(e) => {
          const berkas = e.target.files ? Array.from(e.target.files) : [];
          if (berkas.length > 0) onPilihBerkas(berkas);
          // Nilai dikosongkan supaya memilih berkas yang sama lagi tetap
          // memicu perubahan.
          e.target.value = "";
        }}
      />
    </div>
  );
}

function PanahIkon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4 fill-none stroke-current text-void-red"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 16V4M7 9l5-5 5 5M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
    </svg>
  );
}

function BintangIkon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4 fill-none stroke-current text-void-red"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M12 3l2.5 5.5L20 9.5l-4 4 1 6-5-2.8L7 19.5l1-6-4-4 5.5-1L12 3Z" />
    </svg>
  );
}

function DaftarIkon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-4 w-4 fill-none stroke-current text-void-red"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M4 6h16M4 12h16M4 18h10" />
    </svg>
  );
}
