/* =============================================================================
   STATUS PENJUALAN KOLEKSI — DIBACA LANGSUNG DARI XRP LEDGER

   Menghitung berapa karya dari sebuah koleksi yang sudah pindah tangan, tanpa
   server, tanpa API key, tanpa akun xrp.cafe.

   ── CARA KERJANYA ───────────────────────────────────────────────────────────
   Ledger mencatat dua hal yang cukup:

     1. nfts_by_issuer  — semua NFT yang PERNAH diterbitkan wallet studio,
                          lengkap dengan taxon (penanda koleksi).
     2. account_nfts    — NFT yang SEKARANG masih dipegang wallet studio.

   Yang pernah terbit tapi tidak lagi dipegang = sudah terjual atau dipindah.
   Tidak ada status "terjual" yang perlu diisi manual, dan tidak bisa basi.

   ── KENAPA BISA DARI BROWSER ────────────────────────────────────────────────
   xrplcluster.com mengirim `access-control-allow-origin: *`, jadi pengunjung
   boleh memanggilnya langsung. Bukti: sudah diuji dengan header Origin seperti
   peramban dan dijawab 200.

   ── ATURAN YANG DIPAKAI ─────────────────────────────────────────────────────
   a. Gagal membaca ledger BUKAN kegagalan halaman. Jaringan putus, node
      gangguan, atau batas laju — semua berakhir pada status "tidak diketahui",
      dan kartu jatuh ke `editionSize` dari data statis. Tidak ada angka salah.
   b. Tidak ada permintaan berulang. Satu kali saat halaman dibuka, lalu berhenti.
   c. Hasilnya disimpan di memori selama tab hidup, supaya berpindah dari
      /collection ke beranda tidak memanggil ulang.
   ============================================================================= */

import { useEffect, useState } from "react";
import { collections, type Collection } from "../data/collections";

/** Node publik yang CORS-nya terbuka. Bukan rahasia, bukan API key. */
const NODE = "https://xrplcluster.com";

/** Wallet studio yang menerbitkan semua koleksi. */
const ISSUER = "rf1tpdoihWP6RrdmMU9QPWBp9yXMSX8BMi";

/** Batas tunggu satu permintaan (ms) — jangan biarkan kartu menggantung. */
const BATAS_MS = 8000;

export type StatusKoleksi = {
  /** Jumlah karya yang sudah pindah tangan. */
  terjual: number;
  /** Jumlah karya yang masih dipegang studio. */
  tersedia: number;
  /** Jumlah yang pernah diterbitkan. */
  total: number;
};

export type PetaStatus = {
  /** "siap" bila ledger sudah terbaca, "gagal" bila tidak. */
  keadaan: "memuat" | "siap" | "gagal";
  /** Status per slug koleksi. Kosong selama memuat atau bila gagal. */
  perSlug: Record<string, StatusKoleksi>;
};

/** Hasil yang sudah terbaca, disimpan supaya tidak diminta ulang tiap render. */
let simpanan: PetaStatus | null = null;
/** Satu janji bersama: banyak komponen menunggu permintaan yang sama. */
let janjiBerjalan: Promise<PetaStatus> | null = null;

type BarisNft = {
  nft_id?: string;
  NFTokenID?: string;
  nft_taxon?: number;
  NFTokenTaxon?: number;
  Issuer?: string;
};

/** Memanggil node ledger dengan batas waktu. */
async function panggilLedger(method: string, params: object): Promise<unknown> {
  const kendali = new AbortController();
  const jam = setTimeout(() => kendali.abort(), BATAS_MS);
  try {
    const jawab = await fetch(NODE, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ method, params: [params] }),
      signal: kendali.signal,
    });
    if (!jawab.ok) throw new Error(`HTTP ${jawab.status}`);
    return await jawab.json();
  } finally {
    clearTimeout(jam);
  }
}

/** Mengumpulkan semua halaman hasil, mengikuti `marker` sampai habis. */
async function ambilSemua(
  method: string,
  params: Record<string, unknown>,
  ambilBaris: (hasil: Record<string, unknown>) => BarisNft[],
): Promise<BarisNft[]> {
  const terkumpul: BarisNft[] = [];
  let marker: unknown = undefined;

  // Batas 20 halaman × 400 = 8.000 NFT. Jauh di atas kebutuhan, tetapi cukup
  // untuk menghentikan perulangan kalau node mengirim marker yang sama terus.
  for (let halaman = 0; halaman < 20; halaman += 1) {
    const mentah = (await panggilLedger(method, {
      ...params,
      ledger_index: "validated",
      limit: 400,
      ...(marker ? { marker } : {}),
    })) as { result?: Record<string, unknown> };

    const hasil = mentah.result;
    if (!hasil || hasil.status === "error") throw new Error("Ledger menolak permintaan");

    terkumpul.push(...ambilBaris(hasil));
    marker = hasil.marker;
    if (!marker) break;
  }

  return terkumpul;
}

const idDari = (baris: BarisNft) => baris.nft_id ?? baris.NFTokenID ?? "";
const taxonDari = (baris: BarisNft) => baris.nft_taxon ?? baris.NFTokenTaxon ?? -1;

/** Membaca ledger sekali dan menyusun status per koleksi. */
async function bacaLedger(): Promise<PetaStatus> {
  const [terbit, dipegang] = await Promise.all([
    ambilSemua("nfts_by_issuer", { issuer: ISSUER }, (hasil) => (hasil.nfts as BarisNft[]) ?? []),
    ambilSemua("account_nfts", { account: ISSUER }, (hasil) => (hasil.account_nfts as BarisNft[]) ?? []),
  ]);

  // NFT yang masih dipegang studio DAN diterbitkan studio sendiri.
  const masihDipegang = new Set(
    dipegang.filter((baris) => baris.Issuer === ISSUER).map(idDari),
  );

  const jumlahTerbit = new Map<number, number>();
  const jumlahTersedia = new Map<number, number>();

  for (const baris of terbit) {
    const taxon = taxonDari(baris);
    jumlahTerbit.set(taxon, (jumlahTerbit.get(taxon) ?? 0) + 1);
    if (masihDipegang.has(idDari(baris))) {
      jumlahTersedia.set(taxon, (jumlahTersedia.get(taxon) ?? 0) + 1);
    }
  }

  const perSlug: Record<string, StatusKoleksi> = {};
  for (const koleksi of collections) {
    if (typeof koleksi.taxon !== "number") continue;
    const total = jumlahTerbit.get(koleksi.taxon) ?? 0;
    if (total === 0) continue;
    const tersedia = jumlahTersedia.get(koleksi.taxon) ?? 0;
    perSlug[koleksi.slug] = { total, tersedia, terjual: total - tersedia };
  }

  return { keadaan: "siap", perSlug };
}

/** Membaca status penjualan semua koleksi. Dipakai bersama oleh beberapa halaman. */
export function useStatusKoleksi(): PetaStatus {
  const [status, setStatus] = useState<PetaStatus>(
    () => simpanan ?? { keadaan: "memuat", perSlug: {} },
  );

  useEffect(() => {
    if (simpanan) return;
    let batal = false;

    janjiBerjalan ??= bacaLedger()
      .then((hasil) => {
        simpanan = hasil;
        return hasil;
      })
      .catch(() => {
        // Jangan simpan kegagalan: kunjungan berikutnya boleh mencoba lagi.
        const gagal: PetaStatus = { keadaan: "gagal", perSlug: {} };
        return gagal;
      })
      .finally(() => {
        janjiBerjalan = null;
      });

    void janjiBerjalan.then((hasil) => {
      if (!batal) setStatus(hasil);
    });

    return () => {
      batal = true;
    };
  }, []);

  return status;
}

/** Status satu koleksi, atau undefined bila ledger belum terbaca. */
export const statusDari = (
  peta: PetaStatus,
  koleksi: Collection,
): StatusKoleksi | undefined => peta.perSlug[koleksi.slug];
