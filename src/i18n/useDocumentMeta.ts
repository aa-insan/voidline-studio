import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useLanguage } from "./useLanguage";
import type { TextKey } from "./useLanguage";

/* =============================================================================
   JUDUL & DESKRIPSI HALAMAN

   Situs ini satu dokumen HTML yang sama untuk semua alamat (SPA), jadi judul
   tab dan deskripsi tidak bisa ditulis per halaman di index.html. Hook ini
   menyetelnya saat rute berubah — satu tempat, dipanggil sekali dari layout.

   ── BATAS YANG PERLU DIKETAHUI ─────────────────────────────────────────────
   Yang diubah hook ini hanya terlihat oleh peramban dan mesin pencari yang
   menjalankan JavaScript (Google). Pratinjau tautan di Discord, X, WhatsApp,
   dan Facebook TIDAK menjalankan JavaScript — mereka membaca index.html apa
   adanya. Karena itu judul dan gambar cadangan untuk beranda tetap harus
   lengkap di index.html, dan tidak ada cara memperbaikinya dari sini.

   ── BAHASA ─────────────────────────────────────────────────────────────────
   Judul ikut bahasa yang sedang dipilih, karena itu bagian dari isi halaman.
   Penanda og:locale tidak diubah: bahasa situs hanya tersimpan di peramban,
   bukan di alamat, jadi crawler selalu melihat versi default (Inggris).

   ── HALAMAN DINAMIS ────────────────────────────────────────────────────────
   MintPage memuat koleksi berdasarkan :slug. Judulnya "Mint <nama koleksi>",
   dan nama koleksi itu diambil dari kamus lewat peta di bawah. Hook ini tidak
   mengimpor data koleksi supaya tidak menambah ketergantungan; kalau suatu saat
   judul mint perlu menyebut nama koleksi, tambahkan di sini.
   ============================================================================= */

/** Rute statis dan kunci kamus untuk judulnya. */
const JUDUL_RUTE: Record<string, TextKey> = {
  "/": "page.home.title",
  "/collection": "page.collection.title",
  // "/compose" sengaja tidak ada: rutenya dimatikan (lihat routes/config.tsx),
  // jadi alamat itu diperlakukan seperti alamat tak dikenal — judul 404 dan
  // noindex, bukan judul "Compose" untuk halaman yang tidak pernah tampil.
  "/studio": "page.about.title",
  "/reach": "page.contact.title",
};

/**
 * Deskripsi per halaman. Bukan dari kamus: kalimat ini tidak pernah tampil di
 * layar — hanya dibaca mesin pencari — jadi menerjemahkannya dua kali tidak
 * memberi manfaat, dan menaruhnya di kamus justru mengundang orang memakainya
 * sebagai teks tampilan.
 */
const DESKRIPSI_RUTE: Record<string, string> = {
  "/": "Voidline Iceland is an independent art studio building hand-drawn NFT collections on the XRP Ledger — plus a browser-based generator for creators.",
  "/collection":
    "Every Voidline Iceland NFT collection in one place. Mint directly on the site through the XRP Ledger.",
  "/studio":
    "Voidline Iceland is an independent art studio: hand-drawn NFT collections in red, black, and white.",
  "/reach":
    "Commission custom artwork from Voidline Iceland, or hire the studio for NFT collections, animated GIFs, and generator setups.",
};

const NAMA_SITUS = "Voidline Iceland";
const DESKRIPSI_CADANGAN = DESKRIPSI_RUTE["/"];

/** Menyetel satu <meta> berdasarkan atribut `property` atau `name`. */
const setMeta = (atribut: "property" | "name", kunci: string, isi: string) => {
  let tag = document.head.querySelector<HTMLMetaElement>(`meta[${atribut}="${kunci}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(atribut, kunci);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", isi);
};

export function useDocumentMeta() {
  const { pathname } = useLocation();
  const { t, language } = useLanguage();

  useEffect(() => {
    // Alamat yang tidak dikenal (halaman 404) tidak perlu diindeks, dan judulnya
    // tetap menyebut situs supaya tab tidak terlihat kosong.
    const tidakDikenal = !(pathname in JUDUL_RUTE) && !pathname.startsWith("/collection/mint/");

    const nama = tidakDikenal ? t("page.notFound.title") : t(JUDUL_RUTE[pathname]);
    const judul = `${nama} · ${NAMA_SITUS}`;
    const deskripsi = DESKRIPSI_RUTE[pathname] ?? DESKRIPSI_CADANGAN;

    document.title = judul;

    // og:title dan twitter:title ikut diperbarui sekalipun crawler sosial tidak
    // membacanya saat ini — peramban tetap bisa, dan nilainya jadi konsisten
    // dengan judul tab kalau halaman dibagikan lewat tautan "salin alamat".
    setMeta("name", "description", deskripsi);
    setMeta("property", "og:title", judul);
    setMeta("property", "og:description", deskripsi);
    setMeta("name", "twitter:title", judul);
    setMeta("name", "twitter:description", deskripsi);
    setMeta("property", "og:locale", language === "id" ? "id_ID" : "en_US");

    // Halaman 404 tidak boleh masuk indeks. Nilai ini dikembalikan ke "index"
    // saat rute berikutnya dibuka, bukan dibiarkan menempel.
    setMeta("name", "robots", tidakDikenal ? "noindex, follow" : "index, follow");
  }, [pathname, language, t]);
}
