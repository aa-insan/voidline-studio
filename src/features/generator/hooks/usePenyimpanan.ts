/* =============================================================================
   HOOK PENYIMPANAN — proyek bertahan setelah halaman ditutup

   Tiga tugas:
     1. Memuat proyek terakhir saat halaman dibuka.
     2. Menyimpan otomatis setiap kali proyek berubah.
     3. Menyediakan "mulai baru" dan menghapus data tersimpan.

   ── AUTOSAVE TIDAK BOLEH MENGUNCI LAYAR ───────────────────────────────────
   Menyimpan ratusan gambar bisa memakan waktu. Karena itu penyimpanan diberi
   jeda (debounce): setelah pengunjung berhenti mengubah apa pun selama
   sesaat, baru ditulis. Tanpa jeda, mengetik satu nama proyek akan memicu
   penyimpanan di setiap huruf — masing-masing menulis semua gambar.

   ── MENYIMPAN SAAT TAB DITUTUP ────────────────────────────────────────────
   Jeda bisa membuat perubahan terakhir belum tersimpan ketika tab ditutup.
   `visibilitychange` menangkap momen itu dan menyimpan segera. `beforeunload`
   tidak dipakai karena penyimpanan asinkron tidak dijamin selesai di sana.

   ── KEADAAN PEMULIHAN ─────────────────────────────────────────────────────
   `memulihkan` dipakai antarmuka untuk tidak menampilkan "belum ada layer"
   selama data masih dibaca. Tanpa itu, pengunjung melihat layar kosong
   sekejap yang terlihat seperti proyeknya hilang.
   ============================================================================= */

import { useCallback, useEffect, useRef, useState } from "react";
import { lemariAset } from "../lib/aset";
import {
  hapusProyek,
  muatProyek,
  penyimpananTersedia,
  simpanProyek,
} from "../lib/penyimpanan";
import type { GeneratorState } from "../types";
import { KEADAAN_AWAL } from "../types";
import type { Aksi } from "../lib/reducer";

/** Jeda sebelum menyimpan setelah perubahan terakhir. */
const JEDA_SIMPAN_MS = 800;

type Props = {
  keadaan: GeneratorState;
  dispatch: (aksi: Aksi) => void;
  /** Naik setiap kali lemari aset berubah — pemicu agar aset ikut tersimpan. */
  versiAset: number;
};

export function usePenyimpanan({ keadaan, dispatch, versiAset }: Props) {
  /** Sedang membaca proyek tersimpan saat halaman dibuka. */
  const [memulihkan, setMemulihkan] = useState(penyimpananTersedia());
  /** Proyek pernah disimpan — untuk menampilkan tombol "mulai baru". */
  const [adaSimpanan, setAdaSimpanan] = useState(false);
  const [tersimpanPada, setTersimpanPada] = useState<number | null>(null);
  const [galatSimpan, setGalatSimpan] = useState<string | null>(null);

  /**
   * Penanda apakah pemulihan sudah selesai.
   *
   * Sangat penting: autosave TIDAK BOLEH berjalan sebelum pemulihan selesai.
   * Kalau berjalan, keadaan kosong awal akan menimpa proyek yang sedang
   * dibaca — dan proyek itu hilang sebelum sempat ditampilkan.
   */
  const siapRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  /**
   * Salinan `siapRef` dalam bentuk state, khusus untuk memicu ulang efek
   * autosave. Ref tidak memberi tahu React saat nilainya berubah.
   */
  const [siapSimpan, setSiapSimpan] = useState(false);

  /** Menyimpan sekarang juga, tanpa menunggu jeda. */
  const simpanSekarang = useCallback(async () => {
    if (!siapRef.current || !penyimpananTersedia()) return;
    try {
      await simpanProyek(keadaan, lemariAset.isi());
      setAdaSimpanan(true);
      setTersimpanPada(Date.now());
      setGalatSimpan(null);
    } catch (e) {
      setGalatSimpan(e instanceof Error ? e.message : "Tidak diketahui");
    }
  }, [keadaan]);

  // ── Pemulihan saat halaman dibuka ──────────────────────────────────────────
  useEffect(() => {
    let batal = false;

    (async () => {
      if (!penyimpananTersedia()) {
        setMemulihkan(false);
        siapRef.current = true;
        setSiapSimpan(true);
        return;
      }

      try {
        const tersimpan = await muatProyek();
        if (batal) return;

        if (tersimpan) {
          // Aset masuk kembali ke lemari SEBELUM keadaan dipasang, supaya
          // pratinjau tidak sempat menggambar layer yang gambarnya belum ada.
          for (const a of tersimpan.aset) {
            lemariAset.pasang(a.traitId, a);
          }
          dispatch({ jenis: "gantiSeluruhKeadaan", keadaan: tersimpan.keadaan });
          setAdaSimpanan(true);
          setTersimpanPada(tersimpan.disimpanPada);
        }
      } catch (e) {
        // Gagal membaca bukan alasan mengunci pengunjung. Proyek baru tetap
        // bisa dikerjakan; hanya pemulihan yang tidak terjadi.
        setGalatSimpan(e instanceof Error ? e.message : "Tidak diketahui");
      } finally {
        if (!batal) {
          setMemulihkan(false);
          // Baru setelah ini autosave boleh menulis.
          siapRef.current = true;
          // Penanda ikut dinaikkan: efek autosave di bawah sudah pernah
          // berjalan saat `siapRef` masih false (dijalankan sebelum pemulihan
          // selesai), dan efek itu tidak akan jalan lagi kalau tidak ada
          // dependensinya yang berubah. Tanpa ini, proyek yang dipulihkan
          // tidak pernah tersimpan otomatis.
          setSiapSimpan(true);
        }
      }
    })();

    return () => {
      batal = true;
    };
  }, [dispatch]);

  /**
   * Apakah proyek masih kosong seluruhnya.
   *
   * Proyek kosong tidak disimpan. Alasannya bukan penghematan ruang, melainkan
   * kejujuran antarmuka: kalau keadaan kosong ikut ditulis, pengunjung yang
   * baru membuka halaman langsung melihat "Tersimpan di perangkat ini" dan
   * tombol "Mulai proyek baru" — padahal belum ada apa pun untuk disimpan,
   * apalagi dihapus. Menghapusnya juga akan menyalakan kembali autosave dan
   * membuat baris kosong muncul lagi.
   */
  const kosong =
    keadaan.layers.length === 0 && !keadaan.projectName.trim() && !keadaan.settings.name.trim();

  // ── Autosave berjeda ───────────────────────────────────────────────────────
  // `versiAset` ikut jadi pemicu: menambah gambar tidak mengubah `keadaan`
  // pada saat berkas selesai dimuat, tetapi lemari aset bertambah.
  useEffect(() => {
    if (!siapSimpan || kosong) return;

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      void simpanSekarang();
    }, JEDA_SIMPAN_MS);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [keadaan, versiAset, simpanSekarang, kosong, siapSimpan]);

  // ── Simpan saat tab disembunyikan/ditutup ─────────────────────────────────
  useEffect(() => {
    const saatDisembunyikan = () => {
      if (document.visibilityState === "hidden") void simpanSekarang();
    };
    document.addEventListener("visibilitychange", saatDisembunyikan);
    return () => document.removeEventListener("visibilitychange", saatDisembunyikan);
  }, [simpanSekarang]);

  /**
   * Menghapus proyek tersimpan lalu mengosongkan layar.
   *
   * Urutannya penting: `siapRef` dimatikan lebih dulu supaya autosave tidak
   * menulis keadaan kosong kembali ke database sebelum penghapusan selesai.
   */
  const mulaiBaru = useCallback(async () => {
    siapRef.current = false;
    try {
      await hapusProyek();
    } catch (e) {
      setGalatSimpan(e instanceof Error ? e.message : "Tidak diketahui");
    }

    lemariAset.kosongkan();
    dispatch({
      jenis: "gantiSeluruhKeadaan",
      // Salinan baru: KEADAAN_AWAL dipakai bersama seluruh sesi, dan mengubah
      // objek itu langsung akan merusak keadaan awal untuk pemakaian lain.
      keadaan: structuredClone(KEADAAN_AWAL),
    });
    setAdaSimpanan(false);
    setTersimpanPada(null);

    // `siapRef` TIDAK langsung dinyalakan. Dispatch di atas memicu autosave
    // berjeda yang baru berbunyi setelah 800 ms — kalau penjagaan dibuka
    // seketika, autosave itu menulis keadaan kosong kembali ke database dan
    // baris proyek yang baru dihapus muncul lagi. Menyalakannya setelah
    // autosave itu lewat membuat penghapusan benar-benar bersih.
    setTimeout(() => {
      siapRef.current = true;
      setSiapSimpan(true);
    }, JEDA_SIMPAN_MS + 200);
  }, [dispatch]);

  return {
    memulihkan,
    adaSimpanan,
    tersimpanPada,
    galatSimpan,
    setGalatSimpan,
    simpanSekarang,
    mulaiBaru,
  };
}
