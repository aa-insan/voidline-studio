/* =============================================================================
   STATUS KARYA — MASIH DIPEGANG STUDIO ATAU SUDAH LAKU

   Tombol mint hanya berguna untuk karya yang masih bisa dibeli. Karya yang
   sudah pindah tangan tidak perlu tombol aktif — ditekan, pengunjung tetap
   sampai di widget mint yang bingung.

   ── CARA MENENTUKANNYA ──────────────────────────────────────────────────────
   Ledger menyimpan daftar NFT yang SEKARANG dipegang sebuah akun
   (`account_nfts`). Yang tidak ada di daftar itu berarti sudah keluar dari
   wallet studio — terjual atau dipindah. Tidak ada status yang perlu diisi
   manual, jadi tidak bisa basi.

   Hanya satu permintaan, sekali per kunjungan, dan hanya untuk wallet studio:
   19 NFT dipegang, jauh di bawah batas 400 per halaman.

   ── KALAU LEDGER TIDAK MENJAWAB ─────────────────────────────────────────────
   Hampir semua karya sudah laku, jadi menebak "tersedia" saat ragu akan salah
   hampir selalu. Tetapi tombol mint aktif masih lebih berguna daripada tombol
   mati: halaman mint punya widget xrp.cafe yang tahu keadaan sebenarnya. Karena
   itu saat gagal, tombol dibiarkan aktif tanpa label terjual.

   ── KENAPA DIBAGI KE SELURUH KARTU ─────────────────────────────────────────
   Status dibaca sekali di tingkat modul lalu dibagikan lewat `useSyncExternalStore`.
   Grid bisa berisi 654 kartu; tanpa penyimpanan bersama, tiap kartu akan
   memanggil ledger sendiri-sendiri.
   ============================================================================= */

import { useSyncExternalStore } from "react";

/** Node publik yang CORS-nya terbuka — sudah diuji menjawab header Origin. */
const NODE = "https://xrplcluster.com";

/** Wallet studio yang menerbitkan seluruh karya. */
const ISSUER = "rf1tpdoihWP6RrdmMU9QPWBp9yXMSX8BMi";

/** Batas tunggu (ms). Kecil: ini hanya pelengkap, bukan isi halaman. */
const BATAS_MS = 6000;

export type KeadaanKarya = "memuat" | "siap" | "gagal";

type Snapshot = {
  keadaan: KeadaanKarya;
  /** NFTokenID yang masih dipegang studio. Kosong selama memuat. */
  dipegang: ReadonlySet<string>;
};

const KOSONG: ReadonlySet<string> = new Set();

let snapshot: Snapshot = { keadaan: "memuat", dipegang: KOSONG };
const pendengar = new Set<() => void>();

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

let sudahMulai = false;

/**
 * Mengambil NFT yang masih dipegang studio.
 *
 * Wallet ini memegang belasan NFT, jauh di bawah batas 400, jadi satu halaman
 * sudah habis. Pagination tetap ditangani: kalau suatu hari koleksi yang belum
 * laku menumpuk, `marker` membawa ke halaman berikutnya (maksimal 5 halaman).
 */
async function baca(): Promise<void> {
  const dipegang = new Set<string>();
  let marker: unknown = undefined;

  try {
    for (let halaman = 0; halaman < 5; halaman += 1) {
      const kendali = new AbortController();
      const jam = setTimeout(() => kendali.abort(), BATAS_MS);
      let hasil: {
        result?: { account_nfts?: { NFTokenID?: string }[]; marker?: unknown };
      };

      try {
        const jawab = await fetch(NODE, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            method: "account_nfts",
            params: [
              {
                account: ISSUER,
                ledger_index: "validated",
                limit: 400,
                ...(marker !== undefined ? { marker } : {}),
              },
            ],
          }),
          signal: kendali.signal,
        });
        if (!jawab.ok) throw new Error(`HTTP ${jawab.status}`);
        hasil = await jawab.json();
      } finally {
        clearTimeout(jam);
      }

      const isi = hasil.result;
      if (!isi?.account_nfts) throw new Error("Ledger menolak");

      for (const nft of isi.account_nfts) {
        if (nft.NFTokenID) dipegang.add(nft.NFTokenID);
      }

      marker = isi.marker;
      if (marker === undefined) break;
    }

    umumkan({ keadaan: "siap", dipegang });
  } catch {
    umumkan({ keadaan: "gagal", dipegang: KOSONG });
  }
}

function mulai() {
  if (sudahMulai) return;
  sudahMulai = true;
  void baca();
}

/**
 * Status seluruh karya.
 *
 * `terjual(nftId)` hanya menjawab `true` bila ledger sudah terbaca — selama
 * memuat atau gagal ia menjawab `false`, supaya tombol mint tidak dimatikan
 * berdasarkan tebakan.
 */
export function useStatusKarya(): {
  keadaan: KeadaanKarya;
  terjual: (nftId: string) => boolean;
} {
  const { keadaan, dipegang } = useSyncExternalStore(berlangganan, bacaSnapshot);

  return {
    keadaan,
    terjual: (nftId: string) => keadaan === "siap" && !dipegang.has(nftId),
  };
}
