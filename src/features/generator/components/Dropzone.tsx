/* =============================================================================
   KOTAK UNGGAH LAYER

   Satu kotak untuk menambah gambar ke sebuah layer. Dipakai di dua tempat:
   saat membuat layer baru (dengan nama layer), dan saat menambah trait ke
   layer yang sudah ada.

   MENGAPA MEMAKAI <input type="file"> TERSEMBUNYI
   Seluruh kotak dibuat bisa diklik DAN bisa menerima seretan berkas. Menulis
   keduanya sendiri (klik + drag) membutuhkan banyak keadaan; <input> bawaan
   browser sudah menangani pemilihan berkas, termasuk dialog sistem yang benar
   di setiap sistem operasi. Kotak di sekelilingnya hanya sebuah label.
   ============================================================================= */

import { useCallback, useRef, useState } from "react";
import { useLanguage } from "../../../i18n/useLanguage";

type Props = {
  /** Daftar tipe MIME yang diterima, mis. ["image/png", ...]. */
  terima: readonly string[];
  /** Dipanggil dengan berkas yang dipilih/diseret. */
  onBerkas: (berkas: File[]) => void | Promise<void>;
  /** Teks utama di dalam kotak. */
  judul: string;
  /** Keterangan kecil di bawah judul. */
  keterangan?: string;
  /** Bila benar, kotak tampil ringkas (dipakai di dalam kartu layer). */
  ringkas?: boolean;
};

export default function Dropzone({ terima, onBerkas, judul, keterangan, ringkas = false }: Props) {
  const { t } = useLanguage();
  const inputRef = useRef<HTMLInputElement>(null);
  const [terseret, setTerseret] = useState(false);
  const [memuat, setMemuat] = useState(false);

  const proses = useCallback(
    async (daftar: FileList | null) => {
      if (!daftar || daftar.length === 0) return;
      setMemuat(true);
      try {
        await onBerkas(Array.from(daftar));
      } finally {
        setMemuat(false);
        // Nilai input dikosongkan supaya berkas yang SAMA bisa dipilih lagi
        // (mis. setelah dihapus dari layer).
        if (inputRef.current) inputRef.current.value = "";
      }
    },
    [onBerkas],
  );

  const ambilTeks = terima.map((tipe) => tipe.split("/")[1].toUpperCase()).join(", ");

  return (
    <label
      onDragOver={(e) => {
        e.preventDefault();
        setTerseret(true);
      }}
      onDragLeave={() => setTerseret(false)}
      onDrop={(e) => {
        e.preventDefault();
        setTerseret(false);
        void proses(e.dataTransfer.files);
      }}
      className={`group relative flex cursor-pointer flex-col items-center justify-center rounded-xl border border-dashed text-center transition-colors ${
        ringkas ? "gap-1 px-4 py-5" : "gap-2 px-6 py-10"
      } ${
        terseret
          ? "border-accent bg-accent-soft"
          : "border-border-strong bg-surface hover:border-accent/70 hover:bg-surface-hover"
      } ${memuat ? "pointer-events-none opacity-60" : ""}`}
    >
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={terima.join(",")}
        className="sr-only"
        onChange={(e) => void proses(e.target.files)}
        disabled={memuat}
      />

      <svg
        viewBox="0 0 24 24"
        className={`fill-none stroke-current transition-colors ${
          terseret ? "text-accent" : "text-fg-muted group-hover:text-accent"
        } ${ringkas ? "h-5 w-5" : "h-7 w-7"}`}
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M12 16V4m0 0L8 8m4-4 4 4" />
        <path d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
      </svg>

      <span className={`text-fg ${ringkas ? "text-xs font-medium" : "text-sm font-semibold"}`}>
        {memuat ? t("page.generator.dropzone.loading") : judul}
      </span>

      {keterangan && (
        <span className="text-[11px] leading-relaxed text-fg-muted">{keterangan}</span>
      )}

      {!ringkas && <span className="mt-1 text-[11px] text-fg-muted">{ambilTeks}</span>}
    </label>
  );
}
