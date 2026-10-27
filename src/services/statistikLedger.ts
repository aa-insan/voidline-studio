/* =============================================================================
   STATISTIK LEDGER — ANGKA PAPAN MERAH DIBACA LANGSUNG DARI XRPL

   Papan angka di beranda (Collections / Artworks) tidak lagi mengandalkan
   berkas data yang diperbarui berkala: angkanya dibaca langsung dari ledger
   saat halaman dibuka, jadi begitu ada NFT baru terbit, angka di layar ikut
   berubah tanpa sentuhan tangan.

   ── SUMBER DATA ─────────────────────────────────────────────────────────────
   `nfts_by_issuer` (Clio) memuat semua NFT yang PERNAH diterbitkan sebuah
   akun — bukan hanya yang masih dipegangnya. Karya yang sudah laku tetap
   terhitung, sama seperti arti "karya" di seluruh situs (scripts/
   tarik-karya.py memakai perintah yang sama). Dari daftar itu dihitung:

     · karya   = jumlah baris NFT (semua edisi dari wallet studio)
     · koleksi = banyaknya nft_taxon berbeda (taxon = pembeda koleksi)

   ── KENAPA WEBSOCKET, BUKAN HTTP ────────────────────────────────────────────
   Perintah Clio ini hanya ada di node Clio (s1/s2.ripple.com), dan HTTP-nya
   tidak memasang header CORS — browser menolak. WebSocket tidak diperiksa
   header CORS-nya, dan node publik Ripple menerima koneksi dari browser.
   xrplcluster.com (yang CORS-nya terbuka) adalah rippled biasa dan menolak
   perintah ini — karena itu WS ke s1/s2 adalah satu-satunya jalan langsung.

   ── FORMAT RESPONS WS ───────────────────────────────────────────────────────
   Berbeda dari JSON-RPC HTTP: `status` ada di amplop atas
   ({ id, status, result }), bukan di dalam result. Halaman dibatasi server
   100 baris; `marker` membawa ke halaman berikutnya.

   ── KEandalAN ───────────────────────────────────────────────────────────────
   Halaman dirender dulu dengan angka dari karyaNft.ts (statis, instan).
   Service ini hanya MENGGANTI angka itu bila ledger berhasil dijawab —
   bila gagal (offline, node sibuk), angka statis dipakai apa adanya.
   Tidak pernah ada angka 0 palsu atau layout bergeser.

   ── SEBARAPA SERING ─────────────────────────────────────────────────────────
   Sekali per kunjungan. Bila tab ditinggal lalu dibuka lagi setelah lebih
   dari satu menit, data diambil ulang — angka tetap segar tanpa polling
   terus-menerus.
   ============================================================================= */

import { useSyncExternalStore } from "react";

/** Node Clio publik yang menerima WebSocket dari browser. Dicoba berurutan. */
const NODES = ["wss://s1.ripple.com/", "wss://s2.ripple.com/"] as const;

/** Wallet studio yang menerbitkan seluruh karya. */
const ISSUER = "rf1tpdoihWP6RrdmMU9QPWBp9yXMSX8BMi";

/** Server membatasi 100 baris per halaman — minta maksimum itu saja. */
const LIMIT = 100;

/** Batas halaman pagination — 688 NFT ≈ 7 halaman; jauh dari batas. */
const MAKS_HALAMAN = 20;

/** Batas tunggu jawaban satu halaman (ms). */
const BATAS_HALAMAN_MS = 8000;

/** Ambil ulang hanya bila tab kembali terlihat setelah sekian lama. */
const JEDA_SEGAR_MS = 60_000;

export type KeadaanStatistik = "memuat" | "siap" | "gagal";

export type StatistikLedger = {
  /** Jumlah koleksi = banyaknya taxon berbeda dari wallet studio. */
  koleksi: number;
  /** Jumlah karya = total NFT yang diterbitkan wallet studio. */
  karya: number;
};

type Snapshot = {
  keadaan: KeadaanStatistik;
  /** null selama memuat / gagal — pemakai memakai angka statisnya sendiri. */
  statistik: StatistikLedger | null;
};

type BarisNft = { nft_taxon?: unknown };

type Halaman = { nfts: BarisNft[]; marker: unknown };

let snapshot: Snapshot = { keadaan: "memuat", statistik: null };
const pendengar = new Set<() => void>();
let sudahMulai = false;
let terakhirAmbil = 0;

function umumkan(baru: Snapshot) {
  snapshot = baru;
  for (const f of pendengar) f();
}

function berlangganan(f: () => void) {
  pendengar.add(f);
  mulai();
  return () => {
    pendengar.delete(f);
  };
}

const bacaSnapshot = () => snapshot;

/** Satu halaman `nfts_by_issuer` lewat koneksi WS yang sudah terbuka. */
function mintaHalaman(ws: WebSocket, id: number, marker: unknown): Promise<Halaman> {
  return new Promise((selesai, gagal) => {
    const jam = setTimeout(() => gagal(new Error("waktu habis")), BATAS_HALAMAN_MS);
    const dengar = (kejadian: MessageEvent) => {
      let pesan: {
        id?: number;
        status?: string;
        error?: string;
        result?: { nfts?: BarisNft[]; marker?: unknown };
      };
      try {
        pesan = JSON.parse(kejadian.data);
      } catch {
        return; // pesan asing — lewati, jangan putuskan koneksi
      }
      if (pesan.id !== id) return; // bukan jawaban untuk permintaan ini
      ws.removeEventListener("message", dengar);
      clearTimeout(jam);
      if (pesan.status !== "success") {
        return gagal(new Error(pesan.error ?? "ledger menolak"));
      }
      selesai({ nfts: pesan.result?.nfts ?? [], marker: pesan.result?.marker });
    };
    ws.addEventListener("message", dengar);
    ws.send(
      JSON.stringify({
        id,
        command: "nfts_by_issuer",
        issuer: ISSUER,
        ledger_index: "validated",
        limit: LIMIT,
        ...(marker !== undefined ? { marker } : {}),
      }),
    );
  });
}

/** Satu node: buka WS, kumpulkan semua halaman, tutup. */
function lewatSatuNode(url: string): Promise<StatistikLedger> {
  return new Promise((selesai, gagal) => {
    const ws = new WebSocket(url);
    const taxon = new Set<unknown>();
    let karya = 0;
    let idPermintaan = 0;

    let sudahBerakhir = false;
    function akhiri(jalankan: () => void) {
      if (sudahBerakhir) return;
      sudahBerakhir = true;
      ws.close();
      jalankan();
    }

    ws.addEventListener("error", () => akhiri(() => gagal(new Error("koneksi gagal"))));

    ws.addEventListener("open", () => {
      void (async () => {
        try {
          let marker: unknown = undefined;
          for (let halaman = 0; halaman < MAKS_HALAMAN; halaman += 1) {
            const isi = await mintaHalaman(ws, (idPermintaan += 1), marker);
            for (const nft of isi.nfts) {
              karya += 1;
              if (nft.nft_taxon !== undefined) taxon.add(nft.nft_taxon);
            }
            marker = isi.marker;
            if (marker === undefined) {
              return akhiri(() => selesai({ koleksi: taxon.size, karya }));
            }
          }
          akhiri(() => gagal(new Error("halaman melebihi batas")));
        } catch (e) {
          akhiri(() => gagal(e instanceof Error ? e : new Error("gagal membaca")));
        }
      })();
    });
  });
}

/** Coba tiap node berurutan; semua gagal → umumkan gagal (angka statis menang). */
async function baca(): Promise<void> {
  for (const url of NODES) {
    try {
      const statistik = await lewatSatuNode(url);
      terakhirAmbil = Date.now();
      umumkan({ keadaan: "siap", statistik });
      return;
    } catch {
      // node ini tidak menjawab — coba berikutnya
    }
  }
  umumkan({ keadaan: "gagal", statistik: null });
}

function mulai() {
  if (sudahMulai) return;
  sudahMulai = true;
  void baca();

  // Tab dibuka lagi setelah sekian lama → segarkan sekali, bukan polling.
  document.addEventListener("visibilitychange", () => {
    if (
      document.visibilityState === "visible" &&
      Date.now() - terakhirAmbil > JEDA_SEGAR_MS
    ) {
      void baca();
    }
  });
}

/**
 * Angka papan statistik langsung dari ledger.
 *
 * `koleksi` / `karya` bernilai null selama memuat atau gagal — pemakai
 * wajib punya angka cadangan (dari karyaNft.ts) untuk kedua keadaan itu,
 * sehingga papan tidak pernah menampilkan 0 palsu.
 */
export function useStatistikLedger(): {
  keadaan: KeadaanStatistik;
  koleksi: number | null;
  karya: number | null;
} {
  const { keadaan, statistik } = useSyncExternalStore(berlangganan, bacaSnapshot);
  return {
    keadaan,
    koleksi: statistik?.koleksi ?? null,
    karya: statistik?.karya ?? null,
  };
}
