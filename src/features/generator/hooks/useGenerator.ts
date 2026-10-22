/* =============================================================================
   HOOK GENERATOR

   Menyatukan tiga hal yang selama ini terpisah:
     1. keadaan proyek (reducer)
     2. lemari aset (peta traitId → Blob)
     3. pratinjau langsung (kanvas)

   Komponen cukup memanggil hook ini sekali di halaman generator, lalu
   meneruskan hasilnya ke bawah. State proyek tidak disimpan di context global
   karena generator hanya hidup di satu halaman — context global akan membuat
   proyek ikut termuat di halaman yang tidak membutuhkannya.

   PRATINJAU
   Pratinjau memilih satu trait acak per layer, lalu menggambarnya ke kanvas
   tetap. Setiap kali proyek berubah (trait ditambah, bobot diganti, layer
   dipindah), pratinjau disusun ulang. Karena gambar sudah dimuat sebagai
   ImageBitmap, menyusun ulang ringan dan aman dilakukan sesering itu.
   ============================================================================= */

import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from "react";
import { generatorReducer, keadaanAwal } from "../lib/reducer";
import { lemariAset } from "../lib/aset";
import { bacaUkuranGambar, berkasTraitSah, buatId, namaDariBerkas } from "../lib/utils";
import {
  lepasSemua,
  muatGambar,
  susunKeKanvasTetap,
  type GambarSiap,
} from "../lib/compose";
import {
  BATAS_UKURAN_TRAIT,
  FORMAT_TRAIT,
  PENGATURAN_AWAL,
  type Layer,
  type Trait,
  type TraitAsset,
} from "../types";
import { useKoleksi } from "./useKoleksi";
import { usePenyimpanan } from "./usePenyimpanan";
import { buatContoh } from "../lib/contoh";

/** Satu gumpalan berkas yang akan dimasukkan ke satu layer. */
export type GumpalanLayer = { namaLayer: string; berkas: File[] };

export function useGenerator() {
  const [keadaan, dispatch] = useReducer(generatorReducer, undefined, keadaanAwal);

  /**
   * Versi keadaan yang ditunggu pratinjau. Setiap kali lemari aset berubah,
   * angka ini naik sehingga pratinjau tahu harus digambar ulang.
   */
  const [versiAset, setVersiAset] = useState(0);
  const [galat, setGalat] = useState<string | null>(null);

  /** Gambar yang sedang dipakai pratinjau, agar bisa dilepas saat diganti. */
  const gambarPratinjau = useRef<GambarSiap[]>([]);

  // ── Impor berkas ───────────────────────────────────────────────────────────

  /**
   * Memasukkan berkas ke layer.
   *
   * Berkas disaring lebih dulu: format yang tidak didukung atau terlalu besar
   * TIDAK ditolak seluruhnya — berkas yang sah tetap masuk, yang tidak sah
   * dilaporkan lewat `galat`. Menolak seluruh unggahan karena satu berkas
   * salah akan membuat pengunjung bingung dan mengulang dari awal.
   */
  const tambahTrait = useCallback(
    async (layerId: string, berkas: File[]): Promise<number> => {
      const sah = berkas.filter((b) => berkasTraitSah(b, FORMAT_TRAIT, BATAS_UKURAN_TRAIT));
      const ditolak = berkas.length - sah.length;

      if (sah.length === 0) {
        setGalat(
          ditolak > 0
            ? "Format berkas tidak didukung atau ukurannya lebih dari 10 MB."
            : "Tidak ada berkas yang bisa dipakai.",
        );
        return 0;
      }

      setGalat(
        ditolak > 0
          ? `${ditolak} berkas dilewati karena format tidak didukung atau lebih dari 10 MB.`
          : null,
      );

      // Reducer membuat id trait. id itu perlu ditangkap supaya gambarnya bisa
      // dipasangkan. Karena itu keadaan dihitung lebih dulu di sini, bukan
      // lewat dispatch dan membaca ulang hasilnya — dua langkah itu tidak
      // sinkron dan rawan meleset.
      const idPerBerkas: { traitId: string; berkas: File }[] = sah.map((berkas) => ({
        traitId: buatId("trait"),
        berkas,
      }));

      const traitBaru: Trait[] = idPerBerkas.map(({ traitId, berkas }) => ({
        id: traitId,
        name: berkas.name.replace(/\.[^.]+$/, "").replace(/[_-]+/g, " "),
        weight: 1,
        excluded: false,
        fileName: berkas.name,
      }));

      // Pemuatan gambar berjalan berbarengan; urutan hasil tidak penting.
      await Promise.all(
        idPerBerkas.map(async ({ traitId, berkas }) => {
          try {
            const { width, height } = await bacaUkuranGambar(berkas);
            lemariAset.pasang(traitId, { traitId, blob: berkas, width, height });
          } catch {
            // Gambar rusak: trait tetap ditambahkan tanpa aset, dan dilaporkan.
            setGalat("Satu berkas tidak bisa dibaca dan belum bisa dipakai.");
          }
        }),
      );

      // Reducer menambahkan trait sekaligus: satu dispatch untuk seluruh
      // gumpalan, bukan satu per berkas.
      dispatch({ jenis: "sisipkanTrait", layerId, traits: traitBaru });

      setVersiAset((v) => v + 1);
      return traitBaru.length;
    },
    [],
  );

  // ── Pengelolaan layer & trait ──────────────────────────────────────────────

  const hapusLayer = useCallback((layerId: string) => {
    const layer = keadaan.layers.find((l) => l.id === layerId);
    if (layer) lemariAset.buangLayer(layer.traits.map((t) => t.id));
    dispatch({ jenis: "hapusLayer", layerId });
    setVersiAset((v) => v + 1);
  }, [keadaan.layers]);

  const hapusTrait = useCallback((layerId: string, traitId: string) => {
    lemariAset.buang(traitId);
    dispatch({ jenis: "hapusTrait", layerId, traitId });
    setVersiAset((v) => v + 1);
  }, []);

  /**
   * Membuat layer baru sekaligus memasukkan berkasnya.
   *
   * Dijadikan satu fungsi karena id layer harus diketahui SEBELUM dispatch
   * agar gambar bisa dipasangkan ke layer yang benar. Membuat layer lalu
   * menebak id-nya sesudah dispatch tidak bisa diandalkan pada React.
   */
  const buatLayerDenganBerkas = useCallback(
    async (namaLayer: string, berkas: File[]): Promise<void> => {
      const layerId = buatId("layer");
      dispatch({ jenis: "tambahLayer", nama: namaLayer, layerId });
      if (berkas.length > 0) await tambahTrait(layerId, berkas);
    },
    [tambahTrait],
  );

  /**
   * Mengisi generator dengan koleksi contoh.
   *
   * Menggantikan seluruh isi proyek, bukan menambah di sampingnya: yang
   * dibutuhkan pengunjung yang baru membuka halaman adalah titik mulai yang
   * utuh, bukan campuran contoh dengan sisa percobaannya.
   *
   * Gambar contoh dibuat di memori lalu dimasukkan ke lemari aset sebelum
   * keadaan diganti, supaya pratinjau tidak sempat menggambar trait yang
   * gambarnya belum ada.
   */
  const [memuatContoh, setMemuatContoh] = useState(false);

  /**
   * Mengunggah beberapa berkas sekaligus menjadi beberapa layer.
   *
   * Sengaja TIDAK memakai `buatLayerDenganBerkas` per berkas: setiap panggilan
   * melakukan dispatch sendiri, dan dispatch berurutan pada `layers` yang sama
   * bisa saling menimpa. Di sini keadaan baru disusun satu kali dari keadaan
   * terakhir, lalu dikirim dalam satu dispatch.
   *
   * Pembagian layer mengikuti bagian depan nama berkas (sebelum "_" atau "-"):
   * "Background_Blue-01.png" dan "Head_01.png" menjadi dua layer. Tanpa
   * pemisah, setiap berkas menjadi layer sendiri — lebih baik daripada
   * menebak, karena menebak salah berarti pengunjung harus memindahkan
   * gambarnya satu per satu.
   */
  const unggahBerkas = useCallback(
    async (berkas: File[]): Promise<void> => {
      const sah = berkas.filter((b) => berkasTraitSah(b, FORMAT_TRAIT, BATAS_UKURAN_TRAIT));
      if (sah.length === 0) return;

      /** Kelompok layer dalam urutan kemunculan pertama. */
      const kelompok = new Map<string, { berkas: File[]; layerId: string }>();

      /**
       * Menentukan kelompok layer dari nama berkas.
       *
       * Nama berkas trait sangat beragam, dan menebak salah berarti pengunjung
       * harus memindahkan gambar satu per satu. Urutan aturannya:
       *
       *   1. "Background_Blue-01.png"  → "Background"   (pemisah "_" / "-")
       *   2. "bgBlue-01.png"           → "BgBlue"       (akhiran angka)
       *   3. "Head Blue 01.png"        → "Head Blue"    (akhiran angka saja)
       *
       * Angka di ujung nama selalu dibuang karena hampir selalu nomor urut,
       * bukan bagian dari nama. Tanpa aturan ini "bg0" dan "bg1" menjadi dua
       * layer terpisah — satu trait per layer, yang tidak berguna.
       */
      const kelompokLayer = (namaBerkas: string): string => {
        const dasar = namaBerkas.replace(/\.[^.]+$/, "").trim();

        const [depan] = dasar.split(/[_-]/);
        const sisa = dasar.slice(depan.length + 1);

        // Pemisah "_"/"-" hanya berarti bila berada di antara dua kata —
        // "Background_Blue-01" ya, "bgBlue-01" tidak.
        const adaHurufDepan = /[A-Za-z]/.test(depan);
        const adaHurufBelakang = /[A-Za-z]/.test(sisa);
        if (adaHurufDepan && adaHurufBelakang) {
          return depan.charAt(0).toUpperCase() + depan.slice(1);
        }

        const tanpaAngka = dasar.replace(/[\s.\-_]*\d+$/, "").trim();
        const rapi = tanpaAngka || dasar;
        return rapi.charAt(0).toUpperCase() + rapi.slice(1);
      };

      for (const b of sah) {
        const nama = kelompokLayer(b.name);

        let isi = kelompok.get(nama);
        if (!isi) {
          isi = { berkas: [], layerId: buatId("layer") };
          kelompok.set(nama, isi);
        }
        isi.berkas.push(b);
      }

      const layerBaru: Layer[] = [];
      const asetBaru: TraitAsset[] = [];

      for (const [nama, isi] of kelompok) {
        const traits: Trait[] = [];

        for (const b of isi.berkas) {
          const traitId = buatId("trait");
          let ukuran = { width: 0, height: 0 };
          try {
            ukuran = await bacaUkuranGambar(b);
          } catch {
            // Berkas yang tidak bisa dibaca dilewati; sisanya tetap masuk.
            continue;
          }

          const trait: Trait = {
            id: traitId,
            name: namaDariBerkas(b.name),
            weight: 1,
            excluded: false,
            fileName: b.name,
          };
          traits.push(trait);
          asetBaru.push({ traitId, blob: b, width: ukuran.width, height: ukuran.height });
        }

        if (traits.length > 0) {
          layerBaru.push({ id: isi.layerId, name: nama, traits });
        }
      }

      if (layerBaru.length === 0) {
        setGalat("Tidak ada berkas yang bisa dipakai.");
        return;
      }

      for (const a of asetBaru) lemariAset.pasang(a.traitId, a);

      dispatch({
        jenis: "gantiSeluruhKeadaan",
        keadaan: { ...keadaan, layers: [...keadaan.layers, ...layerBaru] },
      });
      setVersiAset((v) => v + 1);
    },
    [keadaan],
  );

  const muatContoh = useCallback(async (): Promise<void> => {
    setMemuatContoh(true);
    try {
      const { layers, aset } = await buatContoh();

      lemariAset.kosongkan();
      for (const a of aset) lemariAset.pasang(a.traitId, a);

      dispatch({
        jenis: "gantiSeluruhKeadaan",
        keadaan: {
          projectName: "Starter demo",
          layers,
          settings: { ...PENGATURAN_AWAL, name: "Voidline Demo", editionSize: 25 },
        },
      });
      setVersiAset((v) => v + 1);
    } catch (e) {
      setGalat(e instanceof Error ? e.message : "Proyek contoh gagal dimuat.");
    } finally {
      setMemuatContoh(false);
    }
  }, []);

  /** Semua trait yang sah untuk digambar: bukan dikecualikan, bobot > 0. */
  const traitAktif = useMemo(
    () => keadaan.layers.map((layer) => layer.traits.filter((t) => !t.excluded && t.weight > 0)),
    [keadaan.layers],
  );

  /** Apakah proyek sudah bisa digenerate sama sekali. */
  const bisaGenerate = useMemo(
    () => keadaan.layers.length > 0 && traitAktif.every((daftar) => daftar.length > 0),
    [keadaan.layers.length, traitAktif],
  );

  // ── Generate koleksi ───────────────────────────────────────────────────────
  // Orkestrasinya (progres, pembatalan, render) ada di hook terpisah supaya
  // berkas ini tetap tentang keadaan proyek, bukan tentang pekerjaan berat.
  const koleksi = useKoleksi({ keadaan, bisaGenerate });

  // ── Penyimpanan proyek ─────────────────────────────────────────────────────
  const simpanan = usePenyimpanan({ keadaan, dispatch, versiAset });

  /**
   * Mulai proyek baru: kosongkan penyimpanan, lalu buang hasil generate.
   *
   * Hasil generate tidak ikut disimpan — ia milik keadaan ini, bukan milik
   * proyek. Membiarkannya setelah proyek dikosongkan akan menampilkan
   * koleksi dari proyek yang sudah tidak ada.
   */
  const mulaiBaru = useCallback(async () => {
    koleksi.bersihkanHasil();
    await simpanan.mulaiBaru();
  }, [koleksi, simpanan]);

  // ── Pratinjau ──────────────────────────────────────────────────────────────

  /**
   * Pratinjau memilih satu trait acak per layer.
   *
   * `versiAset` ikut jadi ketergantungan supaya pratinjau menyegarkan diri
   * saat gambar baru selesai dimuat — tanpa itu, pratinjau bisa tetap kosong
   * walau trait sudah ada.
   */
  const pilihPratinjau = useCallback((): { nama: string; aset: { blob: Blob; width: number; height: number } }[] => {
    const terpilih: { nama: string; aset: { blob: Blob; width: number; height: number } }[] = [];

    for (const daftar of traitAktif) {
      if (daftar.length === 0) continue;
      const trait = daftar[Math.floor(Math.random() * daftar.length)];
      const aset = lemariAset.ambil(trait.id);
      if (aset) terpilih.push({ nama: trait.name, aset });
    }

    return terpilih;
  }, [traitAktif]);

  /** Menggambar pratinjau ke kanvas yang diberikan. */
  const lukisPratinjau = useCallback(async (kanvas: HTMLCanvasElement) => {
    const daftar = pilihPratinjau();
    if (daftar.length === 0) {
      const ctx = kanvas.getContext("2d");
      ctx?.clearRect(0, 0, kanvas.width, kanvas.height);
      lepasSemua(gambarPratinjau.current);
      gambarPratinjau.current = [];
      return;
    }

    const dimuat: GambarSiap[] = [];
    for (const item of daftar) {
      dimuat.push(await muatGambar(item.aset.blob, item.nama));
    }

    lepasSemua(gambarPratinjau.current);
    gambarPratinjau.current = dimuat;
    susunKeKanvasTetap(dimuat, kanvas);
  }, [pilihPratinjau]);

  // Lepas semua gambar saat komponen pemakai dilepas.
  useEffect(() => {
    return () => {
      lepasSemua(gambarPratinjau.current);
      gambarPratinjau.current = [];
    };
  }, []);

  return {
    keadaan,
    dispatch,
    galat,
    setGalat,
    versiAset,
    tambahTrait,
    buatLayerDenganBerkas,
    unggahBerkas,
    muatContoh,
    memuatContoh,
    hapusLayer,
    hapusTrait,
    traitAktif,
    bisaGenerate,
    gambarPratinjau: lukisPratinjau,
    ...koleksi,
    // Penyimpanan
    memulihkan: simpanan.memulihkan,
    adaSimpanan: simpanan.adaSimpanan,
    tersimpanPada: simpanan.tersimpanPada,
    galatSimpan: simpanan.galatSimpan,
    setGalatSimpan: simpanan.setGalatSimpan,
    simpanSekarang: simpanan.simpanSekarang,
    mulaiBaru,
  };
}
