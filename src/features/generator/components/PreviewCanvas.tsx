/* =============================================================================
   PRATINJAU LANGSUNG

   Kanvas yang menampilkan satu kombinasi acak dari trait yang sedang aktif.
   Tujuannya bukan menghasilkan gambar akhir, melainkan memberi gambaran
   apakah layer sudah tersusun benar — urutan, skala, dan posisi.

   KANVAS BERUKURAN TETAP
   Kanvas punya ukuran piksel internal tetap (resolusi), lalu diperkecil oleh
   CSS agar muat di kolomnya. Dengan begitu pratinjau tetap tajam di layar
   beresolusi tinggi tanpa perlu menghitung ulang ukuran setiap kali jendela
   berubah.

   TOMBOL ACAK ULANG
   Pratinjau memilih trait acak ulang setiap kali proyek berubah. Untuk melihat
   kombinasi lain TANPA mengubah proyek, disediakan tombol "acak ulang" yang
   hanya menggambar ulang — bukan mengubah data.
   ============================================================================= */

import { useEffect, useRef, useState } from "react";
import { useLanguage } from "../../../i18n/useLanguage";

type Props = {
  /** Menggambar ulang pratinjau ke kanvas. */
  gambar: (kanvas: HTMLCanvasElement) => Promise<void>;
  /** Berubah setiap kali isi proyek/aset berubah → memicu gambar ulang. */
  versi: number;
  /** Apakah ada sesuatu untuk digambar sama sekali. */
  adaIsi: boolean;
};

/** Resolusi internal kanvas pratinjau (piksel). */
const RESOLUSI = 640;

export default function PreviewCanvas({ gambar, versi, adaIsi }: Props) {
  const { t } = useLanguage();
  const kanvasRef = useRef<HTMLCanvasElement>(null);
  const [menyiapkan, setMenyiapkan] = useState(false);

  useEffect(() => {
    const kanvas = kanvasRef.current;
    if (!kanvas) return;

    let dibatalkan = false;
    setMenyiapkan(true);

    void (async () => {
      try {
        await gambar(kanvas);
      } finally {
        if (!dibatalkan) setMenyiapkan(false);
      }
    })();

    return () => {
      dibatalkan = true;
    };
  }, [gambar, versi]);

  return (
    <div className="flex flex-col gap-3">
      <div className="relative overflow-hidden rounded-xl border border-border bg-[#0f0f11]">
        {/* Papan catur samar di belakang kanvas: menandakan bahwa latar
            transparan adalah bagian dari gambar, bukan kekosongan. */}
        <div
          aria-hidden="true"
          className="absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "linear-gradient(45deg, #fff 25%, transparent 25%), linear-gradient(-45deg, #fff 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #fff 75%), linear-gradient(-45deg, transparent 75%, #fff 75%)",
            backgroundSize: "16px 16px",
            backgroundPosition: "0 0, 0 8px, 8px -8px, -8px 0",
          }}
        />

        <canvas
          ref={kanvasRef}
          width={RESOLUSI}
          height={RESOLUSI}
          className="relative block h-auto w-full"
          aria-label={t("page.generator.preview.canvasLabel")}
        />

        {!adaIsi && (
          <div className="absolute inset-0 grid place-items-center px-6 text-center">
            <p className="text-xs leading-relaxed text-fg-muted">
              {t("page.generator.preview.empty")}
            </p>
          </div>
        )}

        {menyiapkan && adaIsi && (
          <div className="absolute inset-0 grid place-items-center">
            <span className="h-5 w-5 animate-spin rounded-full border-2 border-border-strong border-t-accent" />
          </div>
        )}
      </div>

      <button
        type="button"
        disabled={!adaIsi}
        onClick={() => {
          const kanvas = kanvasRef.current;
          if (!kanvas) return;
          setMenyiapkan(true);
          void gambar(kanvas).finally(() => setMenyiapkan(false));
        }}
        className="inline-flex items-center justify-center gap-2 rounded-lg border border-border px-3.5 py-2 text-xs font-medium text-fg-muted transition-colors hover:border-accent hover:text-accent disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:border-border disabled:hover:text-fg-muted"
      >
        <svg
          viewBox="0 0 24 24"
          className="h-3.5 w-3.5 fill-none stroke-current"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="M21 12a9 9 0 1 1-3-6.7M21 3v6h-6" />
        </svg>
        {t("page.generator.preview.shuffle")}
      </button>
    </div>
  );
}
