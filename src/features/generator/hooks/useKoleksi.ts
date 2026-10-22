/* =============================================================================
   HOOK BUAT KOLEKSI — dari permintaan sampai deretan gambar jadi

   Menyatukan mesin generate, render, dan keadaan progres. Pemanggil cukup
   memanggil `buat()` dan membaca `progres` selama proses berjalan.

   ── PROGRES HARUS TERLIHAT ────────────────────────────────────────────────
   Render ratusan PNG butuh detik sampai puluhan detik. Kalau loop berjalan
   tanpa memberi napas ke browser, layar membeku — tombol tidak bisa diklik,
   progres tidak bergerak, dan pengunjung mengira alatnya hang. Karena itu
   setiap item selesai, loop menunggu satu frame (`requestAnimationFrame`)
   sehingga React sempat menggambar ulang progres.

   ── PEMBATALAN ────────────────────────────────────────────────────────────
   Pembatalan memakai penanda di `ref`, bukan state: loop yang sedang berjalan
   tidak melihat state terbaru, sedangkan ref dibaca langsung di setiap
   putaran. Setelah batal, gambar dan URL yang sudah terlanjur dibuat dibuang.

   ── URL OBJEK ─────────────────────────────────────────────────────────────
   Setiap hasil punya object URL untuk ditampilkan <img>. URL itu tidak
   dilepas otomatis oleh browser. Fungsi ini yang mencabutnya setiap kali
   koleksi diganti atau halaman ditinggalkan — tanpa itu, membuka generator
   berkali-kali akan menahan ratusan MB memori.
   ============================================================================= */

import { useCallback, useEffect, useRef, useState } from "react";
import { hitungKombinasi, susunKoleksi, type ItemHasil } from "../lib/generate";
import {
  gambarItemKeKanvas,
  kanvasKePng,
  lepasPeta,
  muatSemuaTrait,
  skalaKoleksi,
  ukuranKoleksi,
} from "../lib/render";
import type { GeneratorState } from "../types";
import { buatZip, namaZip } from "../lib/eksporZip";
import { unduhBlob } from "../lib/unduh";
import {
  buangDanIsi,
  kerUlangItem,
  kunciSemua,
  nomorUlang,
  tukarTrait,
  ubahKunci,
  type AlasanSunting,
} from "../lib/sunting";
import type { Trait } from "../types";

/** Satu item yang sudah dirender. */
export type HasilItem = {
  item: ItemHasil;
  blob: Blob;
  /** Object URL untuk <img>. Dicabut oleh hook saat hasil diganti. */
  url: string;
};

export type HasilKoleksi = {
  item: HasilItem[];
  /** Ukuran gambar hasil — sama untuk semua item. */
  width: number;
  height: number;
};

export type Progres = { selesai: number; total: number };

/** Alasan generate berhenti tanpa hasil. */
export type GalatBuat =
  | { jenis: "kombinasiKurang"; tersedia: number; diminta: number }
  | { jenis: "tidakAdaGambar"; nama: string[] }
  | { jenis: "gagal"; pesan: string };

type Props = {
  keadaan: GeneratorState;
  /** Apakah susunan proyek sudah sah untuk digenerate. */
  bisaGenerate: boolean;
};

export function useKoleksi({ keadaan, bisaGenerate }: Props) {
  const [hasil, setHasil] = useState<HasilKoleksi | null>(null);
  const [progres, setProgres] = useState<Progres | null>(null);
  const [galatBuat, setGalatBuat] = useState<GalatBuat | null>(null);
  /** Sedang menyusun ZIP untuk diunduh. */
  const [mengepak, setMengepak] = useState(false);
  /** Alasan penyuntingan terakhir ditolak — ditampilkan di grid hasil. */
  const [galatSunting, setGalatSunting] = useState<AlasanSunting | null>(null);
  /** Item yang gambarnya sedang dirender ulang setelah disunting. */
  const [menyunting, setMenyunting] = useState<number | null>(null);
  /**
   * Penjaga agar tidak ada dua penyuntingan berjalan bersamaan.
   *
   * Ref, bukan state: dua klik cepat masuk sebelum React sempat menggambar
   * ulang, sehingga keduanya akan membaca state lama dan lolos penjagaan.
   */
  const sedangSuntingRef = useRef(false);

  /** Penanda batal — dibaca loop di setiap putaran. */
  const dibatalkan = useRef(false);

  /**
   * Hasil yang sedang ditampilkan, dalam ref.
   *
   * Dibutuhkan saat mengganti atau membuang hasil: state di closure bisa
   * tertinggal satu render. Ref selalu berisi nilai terbaru, sehingga tidak
   * ada object URL yang lolos dari pencabutan.
   */
  const hasilRef = useRef<HasilKoleksi | null>(null);

  useEffect(() => {
    hasilRef.current = hasil;
  }, [hasil]);

  /** Mencabut semua object URL milik satu koleksi. */
  const buangHasil = useCallback((target: HasilKoleksi | null) => {
    if (!target) return;
    for (const h of target.item) URL.revokeObjectURL(h.url);
  }, []);

  /** Membuang hasil yang sedang tampil. */
  const bersihkanHasil = useCallback(() => {
    buangHasil(hasilRef.current);
    hasilRef.current = null;
    setHasil(null);
  }, [buangHasil]);

  // Hasil dibuang saat halaman ditinggalkan — object URL dan Blob tidak
  // boleh hidup lebih lama dari komponen yang menampilkannya.
  useEffect(() => {
    return () => {
      dibatalkan.current = true;
      buangHasil(hasilRef.current);
      hasilRef.current = null;
    };
  }, [buangHasil]);

  /** Membatalkan generate yang sedang berjalan. */
  const batalkan = useCallback(() => {
    if (progres) dibatalkan.current = true;
  }, [progres]);

  const buat = useCallback(async () => {
    if (!bisaGenerate || progres) return;

    const { layers, settings } = keadaan;

    // Periksa lebih dulu apakah permintaannya mungkin. Tanpa ini, pekerjaan
    // berat (memuat semua bitmap) dimulai untuk permintaan yang pasti gagal.
    const tersedia = hitungKombinasi(layers);
    if (tersedia < settings.editionSize) {
      setGalatBuat({ jenis: "kombinasiKurang", tersedia, diminta: settings.editionSize });
      return;
    }

    setGalatBuat(null);
    bersihkanHasil();
    dibatalkan.current = false;
    setProgres({ selesai: 0, total: settings.editionSize });

    let peta = null as Awaited<ReturnType<typeof muatSemuaTrait>>["peta"] | null;

    try {
      const dimuat = await muatSemuaTrait(layers);
      peta = dimuat.peta;

      // Satu berkas rusak tidak membatalkan semuanya: item yang memuat berkas
      // itu akan tampil tanpa layer tersebut. Pengunjung diberi tahu lewat
      // peringatan, tetapi tetap mendapat koleksi yang bisa dipakai.
      if (dimuat.tidakTermuat.length > 0) {
        setGalatBuat({ jenis: "tidakAdaGambar", nama: dimuat.tidakTermuat });
      }

      const susunan = susunKoleksi(
        layers,
        settings.editionSize,
        settings.startTokenId,
        settings.name,
      );

      if (!susunan.sukses) {
        setGalatBuat({ jenis: "kombinasiKurang", tersedia: susunan.tersedia, diminta: susunan.diminta });
        return;
      }

      const { width, height } = ukuranKoleksi(peta, settings.outputSize);
      // Satu skala untuk seluruh koleksi — dihitung dari semua trait yang
      // dipakai, bukan dari layer yang terpilih pada satu item.
      const skala = skalaKoleksi(peta, settings.outputSize);
      const kanvas = document.createElement("canvas");
      kanvas.width = width;
      kanvas.height = height;

      const terkumpul: HasilItem[] = [];

      for (const item of susunan.item) {
        if (dibatalkan.current) {
          for (const h of terkumpul) URL.revokeObjectURL(h.url);
          setGalatBuat({ jenis: "gagal", pesan: "dibatalkan" });
          return;
        }

        gambarItemKeKanvas(item, kanvas, peta, skala);
        const blob = await kanvasKePng(kanvas);
        terkumpul.push({ item, blob, url: URL.createObjectURL(blob) });
        setProgres({ selesai: terkumpul.length, total: susunan.item.length });

        // Beri browser satu frame untuk menggambar progres dan menerima klik
        // batal. Tanpa ini, tombol Batal tidak akan pernah bisa ditekan.
        await new Promise<void>((r) => requestAnimationFrame(() => r()));
      }

      const koleksi: HasilKoleksi = { item: terkumpul, width, height };
      hasilRef.current = koleksi;
      setHasil(koleksi);
    } catch (e) {
      setGalatBuat({
        jenis: "gagal",
        pesan: e instanceof Error ? e.message : "Tidak diketahui",
      });
    } finally {
      if (peta) lepasPeta(peta);
      setProgres(null);
    }
  }, [bisaGenerate, keadaan, progres, bersihkanHasil]);

  // ── Penyuntingan hasil ─────────────────────────────────────────────────────

  /**
   * Merender ulang SATU item dan menggantinya di koleksi.
   *
   * Bitmap dimuat ulang hanya untuk item ini — memakai peta gambar lama tidak
   * mungkin karena peta sudah dilepas setelah generate selesai (bitmap besar
   * tidak dibiarkan menganggur di memori sepanjang sesi).
   *
   * `ubah` adalah fungsi yang menghasilkan item baru beserta koleksi barunya.
   * Bila ditolak, alasan dikembalikan dan tidak ada yang berubah.
   */
  const sunting = useCallback(
    async (
      indeks: number,
      ubah: (semua: ItemHasil[], layerSekarang: GeneratorState["layers"]) =>
        | { sukses: true; item?: ItemHasil; semua?: ItemHasil[] }
        | { sukses: false; alasan: AlasanSunting },
    ) => {
      const sekarang = hasilRef.current;
      // Penanda "sedang menyunting" dibaca dari ref, bukan state: dua klik
      // cepat pada dua kartu bisa masuk sebelum re-render, dan keduanya akan
      // melihat `menyunting === null` dari closure yang sama.
      if (!sekarang || sedangSuntingRef.current) return;
      sedangSuntingRef.current = true;

      setGalatSunting(null);
      const hasilUbah = ubah(
        sekarang.item.map((h) => h.item),
        keadaan.layers,
      );

      if (!hasilUbah.sukses) {
        setGalatSunting(hasilUbah.alasan);
        sedangSuntingRef.current = false;
        return;
      }

      // Ubahan yang tidak menghasilkan item baru (mis. kunci) tidak butuh
      // render ulang gambar — cukup perbarui data.
      if (!hasilUbah.item && !hasilUbah.semua) {
        sedangSuntingRef.current = false;
        return;
      }

      setMenyunting(indeks);

      let peta = null as Awaited<ReturnType<typeof muatSemuaTrait>>["peta"] | null;
      try {
        const dimuat = await muatSemuaTrait(keadaan.layers);
        peta = dimuat.peta;

        const kanvas = document.createElement("canvas");
        kanvas.width = sekarang.width;
        kanvas.height = sekarang.height;

        // Skala yang sama persis dengan saat koleksi dibuat: dihitung dari
        // seluruh trait aktif, bukan dari item yang sedang disunting. Kalau
        // dihitung dari item itu saja, item hasil suntingan akan berbeda
        // ukuran isinya dari item lain di koleksi yang sama.
        const skala = skalaKoleksi(peta, keadaan.settings.outputSize);

        // Item yang berubah: satu (tukar/ker ulang) atau satu posisi (buang).
        const itemBaru =
          hasilUbah.item ??
          hasilUbah.semua?.find((it) => it.indeks === indeks) ??
          sekarang.item.find((h) => h.item.indeks === indeks)!.item;

        gambarItemKeKanvas(itemBaru, kanvas, peta, skala);
        const blob = await kanvasKePng(kanvas);

        const itemBaruHasil: HasilItem = {
          item: itemBaru,
          blob,
          url: URL.createObjectURL(blob),
        };

        const sebelumnya = hasilRef.current;
        if (!sebelumnya) {
          sedangSuntingRef.current = false;
          return;
        }

        // URL lama dicabut SETELAH URL baru dibuat dan dipasang, supaya gambar
        // tidak sempat kosong di layar.
        const itemLama = sebelumnya.item.find((h) => h.item.indeks === indeks);
        const koleksi: HasilKoleksi = {
          ...sebelumnya,
          item: sebelumnya.item.map((h) =>
            h.item.indeks === indeks ? itemBaruHasil : h,
          ),
        };
        hasilRef.current = koleksi;
        setHasil(koleksi);
        if (itemLama) URL.revokeObjectURL(itemLama.url);
      } catch (e) {
        setGalatBuat({
          jenis: "gagal",
          pesan: e instanceof Error ? e.message : "Tidak diketahui",
        });
      } finally {
        if (peta) lepasPeta(peta);
        sedangSuntingRef.current = false;
        setMenyunting(null);
      }
    },
    [keadaan.layers, keadaan.settings.outputSize],
  );

  // ── Tindakan penyuntingan yang dipakai antarmuka ───────────────────────────

  /** Membuka/menutup kunci satu item. Tidak butuh render ulang gambar. */
  const kunciItem = useCallback(
    (indeks: number, dikunci: boolean) => {
      const sekarang = hasilRef.current;
      if (!sekarang) return;
      const koleksi: HasilKoleksi = {
        ...sekarang,
        item: sekarang.item.map((h) =>
          h.item.indeks === indeks ? { ...h, item: ubahKunci(h.item, dikunci) } : h,
        ),
      };
      hasilRef.current = koleksi;
      setHasil(koleksi);
    },
    [],
  );

  /** Mengunci atau membuka semua item sekaligus. */
  const kunciSemuaItem = useCallback((dikunci: boolean) => {
    const sekarang = hasilRef.current;
    if (!sekarang) return;
    const semua = kunciSemua(
      sekarang.item.map((h) => h.item),
      dikunci,
    );
    const peta = new Map(semua.map((it) => [it.indeks, it]));
    const koleksi: HasilKoleksi = {
      ...sekarang,
      item: sekarang.item.map((h) => ({ ...h, item: peta.get(h.item.indeks) ?? h.item })),
    };
    hasilRef.current = koleksi;
    setHasil(koleksi);
  }, []);

  /** Mengganti satu trait pada satu item. */
  const gantiTrait = useCallback(
    (indeks: number, layerId: string, traitBaru: Trait) =>
      sunting(indeks, (semua) => tukarTrait(semua, indeks, layerId, traitBaru)),
    [sunting],
  );

  /** Mengacak ulang satu item. */
  const kerUlang = useCallback(
    (indeks: number) => sunting(indeks, (semua, layers) => kerUlangItem(semua, indeks, layers)),
    [sunting],
  );

  /** Membuang satu item, celahnya diisi kombinasi baru. */
  const buangItem = useCallback(
    (indeks: number) => sunting(indeks, (semua, layers) => buangDanIsi(semua, indeks, layers)),
    [sunting],
  );

  /** Memberi nomor baru berurutan mulai dari nomor awal pengaturan. */
  const nomoriUlang = useCallback(() => {
    const sekarang = hasilRef.current;
    if (!sekarang) return;
    const semua = nomorUlang(
      sekarang.item.map((h) => h.item),
      keadaan.settings.startTokenId,
    );
    const peta = new Map(semua.map((it) => [it.indeks, it]));
    const koleksi: HasilKoleksi = {
      ...sekarang,
      item: sekarang.item.map((h) => ({ ...h, item: peta.get(h.item.indeks) ?? h.item })),
    };
    hasilRef.current = koleksi;
    setHasil(koleksi);
  }, [keadaan.settings.startTokenId]);

  /**
   * Menyusun ZIP dari hasil yang sedang tampil lalu memicu unduhannya.
   * Pengepakan berjalan di memori dan bisa memakan waktu untuk koleksi besar,
   * jadi tombol dikunci selama proses (`mengepak`) agar tidak ada dua ZIP
   * disusun bersamaan dan menggandakan pemakaian memori.
   */
  const unduhZip = useCallback(async () => {
    const sekarang = hasilRef.current;
    if (!sekarang || mengepak) return;

    setMengepak(true);
    try {
      const blob = await buatZip(sekarang);
      unduhBlob(blob, namaZip(keadaan.settings.name));
    } catch (e) {
      setGalatBuat({
        jenis: "gagal",
        pesan: e instanceof Error ? e.message : "Tidak diketahui",
      });
    } finally {
      setMengepak(false);
    }
  }, [mengepak, keadaan.settings.name]);

  return {
    hasil,
    progres,
    galatBuat,
    setGalatBuat,
    buat,
    batalkan,
    bersihkanHasil,
    unduhZip,
    mengepak,
    // Penyuntingan
    galatSunting,
    setGalatSunting,
    menyunting,
    kunciItem,
    kunciSemuaItem,
    gantiTrait,
    kerUlang,
    buangItem,
    nomoriUlang,
    /** Apakah sedang berjalan — dipakai tombol untuk menampilkan progres. */
    sedangMembuat: progres !== null,
  };
}
