/* =============================================================================
   LAYER CONTOH — titik mulai untuk pengunjung yang datang tanpa gambar

   Generator ini hanya bisa dinilai setelah ada yang bisa dilihat. Pengunjung
   yang baru membuka halaman melihat bidang kosong dan panel pengaturan: secara
   teknis benar, tetapi tidak menunjukkan apa pun tentang cara kerja alatnya.

   Karena itu disediakan satu koleksi contoh — bukan untuk dipakai sebagai NFT,
   melainkan supaya mesinnya bisa dicoba dalam hitungan detik.

   ── GAMBARNYA DIBUAT, BUKAN DIUNDUH ───────────────────────────────────────
   Contoh ini digambar langsung di kanvas memori (bukan mengambil berkas dari
   jaringan). Alasannya konsisten dengan janji halaman ini: semuanya berjalan
   di browser, tidak ada yang diunggah, tidak ada yang diunduh diam-diam.
   Keuntungan lain: tidak ada aset biner yang menambah bobot situs, dan
   gambarnya otomatis setajam kanvas make-nya.

   ── HANYA BENTUK DASAR ────────────────────────────────────────────────────
   Tujuannya menunjukkan susunan lapis (latar, badan, kepala, aksesori), bukan
   menyediakan seni jadi. Setiap contoh adalah bentuk geometris sederhana
   dengan nama trait yang jelas — cukup untuk melihat pratinjau, bobot rarity,
   dan hasil generate bekerja sungguhan.
   ============================================================================= */

import { buatId, namaDariBerkas } from "./utils";
import type { Layer, Trait, TraitAsset } from "../types";

/** Ukuran kanvas contoh. Semua potongan digambar pada ukuran yang sama. */
const UKURAN = 512;

type Potongan = {
  /** Nama layer tempat potongan ini masuk. */
  layer: string;
  /** Urutan layer dari belakang ke depan — dipakai saat menyusun daftar layer. */
  urutan: number;
  /** Nama trait yang tampil di antarmuka dan metadata. */
  nama: string;
  /** Bobot rarity awal — sengaja berbeda supaya efeknya terlihat. */
  bobot: number;
  /** Menggambar potongan ke kanvas 512 × 512. */
  gambar: (ctx: CanvasRenderingContext2D) => void;
};

function kanvasKosong(): HTMLCanvasElement {
  const kanvas = document.createElement("canvas");
  kanvas.width = UKURAN;
  kanvas.height = UKURAN;
  return kanvas;
}

/** Merangkai nama berkas contoh yang konsisten dengan gambar trait biasa. */
function namaBerkas(layer: string, nama: string): string {
  return `${layer}_${nama.replace(/\s+/g, "-")}.png`;
}

/**
 * Daftar potongan contoh.
 *
 * Disusun dari belakang ke depan: Background → Body → Head → Accessory.
 * Setiap layer punya beberapa pilihan dengan bobot tidak sama, sehingga
 * analitik rarity dan kelangkaan hasil langsung punya sesuatu untuk dibaca.
 */
const CONTOH: Potongan[] = [
  // ── Background ────────────────────────────────────────────────────────────
  {
    layer: "Background",
    urutan: 0,
    nama: "Void Black",
    bobot: 40,
    gambar: (ctx) => {
      ctx.fillStyle = "#0a0a0c";
      ctx.fillRect(0, 0, UKURAN, UKURAN);
    },
  },
  {
    layer: "Background",
    urutan: 0,
    nama: "Deep Red",
    bobot: 25,
    gambar: (ctx) => {
      const g = ctx.createRadialGradient(256, 256, 20, 256, 256, 380);
      g.addColorStop(0, "#7a1219");
      g.addColorStop(1, "#0a0a0c");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, UKURAN, UKURAN);
    },
  },
  {
    layer: "Background",
    urutan: 0,
    nama: "Bone White",
    bobot: 15,
    gambar: (ctx) => {
      const g = ctx.createLinearGradient(0, 0, 0, UKURAN);
      g.addColorStop(0, "#f4f0e6");
      g.addColorStop(1, "#cfc7b6");
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, UKURAN, UKURAN);
    },
  },
  {
    layer: "Background",
    urutan: 0,
    nama: "Grid",
    bobot: 5,
    gambar: (ctx) => {
      ctx.fillStyle = "#101014";
      ctx.fillRect(0, 0, UKURAN, UKURAN);
      ctx.strokeStyle = "rgba(224, 27, 36, 0.22)";
      ctx.lineWidth = 1;
      for (let i = 32; i < UKURAN; i += 32) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, UKURAN);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(UKURAN, i);
        ctx.stroke();
      }
    },
  },

  // ── Body ──────────────────────────────────────────────────────────────────
  {
    layer: "Body",
    urutan: 1,
    nama: "Charcoal",
    bobot: 30,
    gambar: (ctx) => {
      ctx.fillStyle = "#23232a";
      ctx.beginPath();
      ctx.roundRect(196, 300, 120, 160, 24);
      ctx.fill();
    },
  },
  {
    layer: "Body",
    urutan: 1,
    nama: "Red Suit",
    bobot: 10,
    gambar: (ctx) => {
      ctx.fillStyle = "#b31d27";
      ctx.beginPath();
      ctx.roundRect(196, 300, 120, 160, 24);
      ctx.fill();
    },
  },
  {
    layer: "Body",
    urutan: 1,
    nama: "Cream Robe",
    bobot: 20,
    gambar: (ctx) => {
      ctx.fillStyle = "#e9e3d5";
      ctx.beginPath();
      ctx.roundRect(196, 300, 120, 160, 24);
      ctx.fill();
    },
  },

  // ── Head ──────────────────────────────────────────────────────────────────
  {
    layer: "Head",
    urutan: 2,
    nama: "Round",
    bobot: 30,
    gambar: (ctx) => {
      ctx.fillStyle = "#d8cfc0";
      ctx.beginPath();
      ctx.arc(256, 220, 96, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = "#0a0a0c";
      ctx.beginPath();
      ctx.arc(222, 208, 11, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(290, 208, 11, 0, Math.PI * 2);
      ctx.fill();
    },
  },
  {
    layer: "Head",
    urutan: 2,
    nama: "Angular",
    bobot: 15,
    gambar: (ctx) => {
      ctx.fillStyle = "#c9beab";
      ctx.beginPath();
      ctx.moveTo(256, 120);
      ctx.lineTo(352, 220);
      ctx.lineTo(310, 316);
      ctx.lineTo(202, 316);
      ctx.lineTo(160, 220);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = "#0a0a0c";
      ctx.fillRect(206, 200, 26, 10);
      ctx.fillRect(280, 200, 26, 10);
    },
  },
  {
    layer: "Head",
    urutan: 2,
    nama: "Hollow",
    bobot: 5,
    gambar: (ctx) => {
      ctx.fillStyle = "#1b1b21";
      ctx.beginPath();
      ctx.arc(256, 220, 96, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "#e01b24";
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(256, 220, 96, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = "#e01b24";
      ctx.beginPath();
      ctx.arc(222, 208, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.arc(290, 208, 9, 0, Math.PI * 2);
      ctx.fill();
    },
  },

  // ── Accessory ─────────────────────────────────────────────────────────────
  {
    layer: "Accessory",
    urutan: 3,
    nama: "None",
    bobot: 45,
    gambar: () => {
      /* Kosong dengan sengaja: peluang terbesar adalah tanpa aksesori. */
    },
  },
  {
    layer: "Accessory",
    urutan: 3,
    nama: "Visor",
    bobot: 20,
    gambar: (ctx) => {
      ctx.fillStyle = "rgba(224, 27, 36, 0.85)";
      ctx.beginPath();
      ctx.roundRect(176, 196, 160, 30, 6);
      ctx.fill();
      ctx.fillStyle = "rgba(255, 255, 255, 0.35)";
      ctx.fillRect(184, 202, 60, 5);
    },
  },
  {
    layer: "Accessory",
    urutan: 3,
    nama: "Halo",
    bobot: 6,
    gambar: (ctx) => {
      ctx.strokeStyle = "#f2e9c9";
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.ellipse(256, 108, 78, 20, 0, 0, Math.PI * 2);
      ctx.stroke();
    },
  },
  {
    layer: "Accessory",
    urutan: 3,
    nama: "Crown",
    bobot: 3,
    gambar: (ctx) => {
      ctx.fillStyle = "#d9b64a";
      ctx.beginPath();
      ctx.moveTo(196, 140);
      ctx.lineTo(216, 96);
      ctx.lineTo(236, 132);
      ctx.lineTo(256, 88);
      ctx.lineTo(276, 132);
      ctx.lineTo(296, 96);
      ctx.lineTo(316, 140);
      ctx.closePath();
      ctx.fill();
    },
  },
];

/** Hasil contoh: susunan layer siap pakai beserta berkas gambarnya. */
export type ContohSiap = {
  layers: Layer[];
  aset: TraitAsset[];
};

/**
 * Menyusun koleksi contoh.
 *
 * Dijalankan sebagai fungsi asinkron walau gambar dibuat di memori, karena
 * kanvas harus diselesaikan menjadi Blob (`toBlob`) — operasi yang memakai
 * callback, bukan sinkron. Dengan begitu bentuk hasilnya sama dengan berkas
 * yang diunggah pengunjung, dan sisa aplikasi tidak perlu tahu bedanya.
 */
export async function buatContoh(): Promise<ContohSiap> {
  const perLayer = new Map<string, Layer>();
  const aset: TraitAsset[] = [];

  for (const potongan of CONTOH) {
    const kanvas = kanvasKosong();
    const ctx = kanvas.getContext("2d");
    if (!ctx) throw new Error("Kanvas 2D tidak tersedia di browser ini.");

    potongan.gambar(ctx);

    const blob = await new Promise<Blob | null>((resolve) =>
      kanvas.toBlob((b) => resolve(b), "image/png"),
    );
    if (!blob) throw new Error("Gambar contoh gagal dibuat.");

    const traitId = buatId("trait");
    const berkas = namaBerkas(potongan.layer, potongan.nama);

    const trait: Trait = {
      id: traitId,
      name: namaDariBerkas(potongan.nama),
      weight: potongan.bobot,
      excluded: false,
      fileName: berkas,
    };

    aset.push({ traitId, blob, width: UKURAN, height: UKURAN });

    const layerAda = perLayer.get(potongan.layer);
    if (layerAda) {
      layerAda.traits.push(trait);
    } else {
      perLayer.set(potongan.layer, {
        id: buatId("layer"),
        name: potongan.layer,
        traits: [trait],
      });
    }
  }

  // Urutan layer mengikuti `urutan` potongan, dari belakang ke depan.
  const urutanLayer = [...new Set(CONTOH.sort((a, b) => a.urutan - b.urutan).map((p) => p.layer))];
  const layers = urutanLayer
    .map((nama) => perLayer.get(nama))
    .filter((l): l is Layer => l !== undefined);

  return { layers, aset };
}
