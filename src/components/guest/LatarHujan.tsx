/* =============================================================================
   LATAR HUJAN GARIS — JATUH DARI BAWAH NAVBAR, PECAH TEPAT DI ATAS FOOTER

   Garis merah tegak yang jatuh dari tepi atas area halaman, menempuh seluruh
   tingginya, lalu memecah di dasar halaman — tepat di garis di atas footer.
   Sehabis pecah, garis itu lahir kembali di atas dan mengulang perjalanan.

   ── EMPAT ATURAN BENTUKNYA ────────────────────────────────────────────────
     1. WARNA PENUH. Setiap garis satu warna dari ujung ke ujung. Tidak ada
        gradien, tidak ada ekor yang memudar. Gerak dibaca dari posisinya,
        bukan dari pudarnya warna.
     2. SELURUH TINGGI. Kanvas mengisi penuh pembungkus halaman — dari bawah
        navbar sampai tepat di atas footer.
     3. TANPA ZONA TENANG. Garis boleh lewat di belakang judul dan paragraf,
        seperti hujan lewat di depan jendela. Yang menjaga teks tetap terbaca
        adalah ketebalan satu piksel dan opasitas yang tidak pekat.
     4. PECAH DI DASAR. Tepat di garis dasar, garis yang tiba memicu dua hal
        sekaligus: satu kilau horizontal putih pucat, dan beberapa butir kecil
        yang menyebar ke samping lalu jatuh kembali. Setelah itu garisnya
        hilang dan lahir lagi di atas.

   ── MENGAPA PECAHANNYA KECIL ──────────────────────────────────────────────
   Komponen acuan memakai dua puluh butir per tumbukan. Di sana latarnya satu
   kotak 640 px, jadi tumbukannya jarang. Di sini dasarnya dasar halaman yang
   tingginya lebih dari dua ribu piksel, jadi tumbukan terjadi terus-menerus;
   dua puluh butir per tumbukan, dikali puluhan garis, akan terbaca sebagai
   kembang api dan menghabiskan tenaga di HP. Delapan butir kecil sudah cukup
   memberi tahu mata bahwa ada sesuatu yang berakhir di sana.

   ── DUA LAPIS ─────────────────────────────────────────────────────────────
   Lapis jauh: garis tipis, redup, lambat, dan lebih pendek. Lapis dekat:
   lebih tebal, lebih terang, dan lebih cepat. Tanpa dua kecepatan, semuanya
   tampak menempel di satu bidang kaca dan hujannya terasa datar.

   ── MENGAPA KANVAS ────────────────────────────────────────────────────────
   Komponen acuannya menggantungkan satu elemen DOM per garis dan menggerakkan-
   nya lewat pustaka animasi, ditambah pemeriksa posisi tiap 50 ms. Di kanvas,
   seluruhnya satu gambar: ratusan goresan setipis satu piksel jauh lebih murah
   daripada puluhan elemen yang disusun ulang per detik.

   ── BEBAN ─────────────────────────────────────────────────────────────────
   Satu goresan per garis per bingkai, tanpa gradien. Butir pecahan paling
   banyak beberapa lusin pada satu waktu. Dibatasi 40 bingkai per detik,
   berhenti saat tab disembunyikan, dan diganti satu gambar diam bagi pengguna
   yang meminta gerak dikurangi.
   ============================================================================= */

import { useEffect, useRef } from "react";

/** Satu rintik garis. */
type Rintik = {
  /** Sumbu x, piksel CSS. Dibulatkan ke setengah piksel supaya tajam. */
  x: number;
  /** Ujung bawah garis — bagian yang paling dekat ke dasar halaman. */
  kepala: number;
  /** Panjang garis, piksel CSS. */
  panjang: number;
  /** Kecepatan turun, piksel per milidetik. */
  laju: number;
  /** Opasitas. */
  terang: number;
  /** Ketebalan, piksel CSS. */
  tebal: number;
  /** Lapis jauh (redup, lambat) atau lapis dekat (terang, cepat). */
  dekat: boolean;
};

/** Satu butir pecahan hasil tumbukan. */
type Butir = {
  x: number;
  y: number;
  /** Kecepatan, piksel per milidetik. */
  vx: number;
  vy: number;
  /** Umur sekarang dan umur maksimum, milidetik. */
  umur: number;
  hidup: number;
  /** Jari-jari, piksel CSS. */
  r: number;
};

/** Satu kilau horizontal di titik tumbukan. */
type Kilau = {
  x: number;
  y: number;
  umur: number;
  hidup: number;
  lebar: number;
};

/** PRNG deterministik (mulberry32): susunan sama tiap halaman dibuka. */
function acakSema(bibit: number) {
  let a = bibit >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Setelan satu lapis hujan. */
type Lapis = {
  jumlah: number;
  panjang: [number, number];
  laju: [number, number];
  tebal: [number, number];
  opasitas: [number, number];
};

/** Lapis jauh: tipis, redup, lambat. */
const LAPIS_JAUH: Lapis = {
  jumlah: 30,
  panjang: [150, 300],
  laju: [0.05, 0.09],
  tebal: [1, 1],
  opasitas: [0.15, 0.28],
};

/** Lapis dekat: tebal, terang, cepat. */
const LAPIS_DEKAT: Lapis = {
  jumlah: 22,
  panjang: [200, 400],
  laju: [0.13, 0.22],
  tebal: [1, 1.6],
  opasitas: [0.45, 0.85],
};

/** Jarak minimum antar-rintik pada sumbu x, supaya dua garis tidak menempel
    dan terbaca sebagai satu garis tebal. */
const JARAK_MIN = 8;

/** Berapa butir yang terlempar pada satu tumbukan. */
const BUTIR_PER_TUMBUKAN = 8;

export default function LatarHujan() {
  const rujukan = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const kanvas = rujukan.current;
    if (!kanvas) return;
    const ctx = kanvas.getContext("2d", { alpha: true });
    if (!ctx) return;

    let lebar = 0;
    let tinggi = 0;
    let rasio = 1;
    const rng = acakSema(20261022);
    const rintik: Rintik[] = [];
    const butir: Butir[] = [];
    const kilau: Kilau[] = [];

    /** Buat satu rintik untuk lapis tertentu. `diAtas` menentukan apakah ia
        lahir di atas tepi (seperti rintik susulan) atau disebar di seluruh
        tinggi (susunan pertama saat halaman dibuka). */
    const buat = (lapis: Lapis, dekat: boolean, diAtas: boolean): Rintik => {
      const panjang = lapis.panjang[0] + rng() * (lapis.panjang[1] - lapis.panjang[0]);

      // Sebaran x: dicoba beberapa kali supaya tidak ada dua garis yang
      // menempel. Acak murni selalu menghasilkan gumpalan dan celah.
      let x = 2 + rng() * (lebar - 4);
      for (let coba = 0; coba < 14; coba++) {
        if (!rintik.some((r) => Math.abs(r.x - x) < JARAK_MIN)) break;
        x = 2 + rng() * (lebar - 4);
      }

      // Rintik susulan lahir dengan SELURUH badannya di atas tepi layar:
      // ujung bawahnya 0–40 px di atas 0 supaya ia benar-benar masuk tanpa
      // jeda tak terlihat. Kalau hanya `-rng()*120` yang dipakai, rintik
      // setinggi 400 px bisa lahir 120 px di atas layar dan tetap tak tampak
      // selama beberapa detik — itulah yang dulu terbaca sebagai potongan
      // garis yang muncul tiba-tiba di tengah halaman.
      return {
        x: Math.round(x) + 0.5,
        kepala: diAtas ? -(panjang + rng() * 40) : -panjang + rng() * (tinggi + panjang),
        panjang,
        laju: lapis.laju[0] + rng() * (lapis.laju[1] - lapis.laju[0]),
        terang: lapis.opasitas[0] + rng() * (lapis.opasitas[1] - lapis.opasitas[0]),
        tebal: lapis.tebal[0] + rng() * (lapis.tebal[1] - lapis.tebal[0]),
        dekat,
      };
    };

    /** Susun ulang seluruh rintik untuk ukuran kanvas saat ini. */
    const susun = () => {
      rintik.length = 0;
      // Jumlah mengikuti luas: halaman dua kali lebih tinggi mendapat garis
      // dua kali lebih banyak, bukan garis yang sama yang direntangkan.
      const luas = Math.max(0.35, (lebar * tinggi) / (1440 * 900));
      const jatah = Math.min(2.4, luas);
      const jauh = Math.round(LAPIS_JAUH.jumlah * jatah);
      const dekat = Math.round(LAPIS_DEKAT.jumlah * jatah);

      for (let i = 0; i < jauh; i++) rintik.push(buat(LAPIS_JAUH, false, false));
      for (let i = 0; i < dekat; i++) rintik.push(buat(LAPIS_DEKAT, true, false));
    };

    const ukur = () => {
      rasio = Math.min(window.devicePixelRatio || 1, 1.5);
      const l = kanvas.clientWidth;
      const t = kanvas.clientHeight;
      if (!l || !t) return;
      if (l === lebar && t === tinggi) return;
      lebar = l;
      tinggi = t;
      kanvas.width = Math.max(1, Math.round(l * rasio));
      kanvas.height = Math.max(1, Math.round(t * rasio));
      ctx.setTransform(rasio, 0, 0, rasio, 0, 0);
      susun();
    };
    ukur();
    const pengamat = new ResizeObserver(ukur);
    pengamat.observe(kanvas);

    /** Tumbukan di dasar halaman. */
    const pecah = (x: number, y: number) => {
      kilau.push({ x, y, umur: 0, hidup: 150, lebar: 12 + rng() * 14 });

      for (let i = 0; i < BUTIR_PER_TUMBUKAN; i++) {
        // Menyebar ke samping dengan sedikit dorongan ke atas. Butir yang
        // langsung terlempar tinggi akan terbaca sebagai kembang api; butir
        // yang hampir mendatar lalu jatuh kembali terbaca sebagai percikan.
        const arah = rng() < 0.5 ? -1 : 1;
        butir.push({
          x,
          y,
          vx: arah * (0.04 + rng() * 0.13),
          vy: -(0.03 + rng() * 0.08),
          umur: 0,
          hidup: 500 + rng() * 900,
          r: 0.7 + rng() * 0.9,
        });
      }
    };

    const gambar = (dt: number) => {
      ctx.clearRect(0, 0, lebar, tinggi);

      // Dasar halaman: tempat tumbukan terjadi, sedikit di atas tepi bawah
      // supaya kilaunya tidak terpotong kanvas.
      const dasar = tinggi - 2;

      // "lighter" = aditif. Dua garis yang berdempetan menyala sedikit lebih
      // terang dengan sendirinya, seperti cahaya yang bertumpuk.
      ctx.globalCompositeOperation = "lighter";
      ctx.lineCap = "butt";

      // Lapis jauh dulu, lapis dekat di atasnya.
      for (const dekat of [false, true]) {
        for (const r of rintik) {
          if (r.dekat !== dekat) continue;

          r.kepala += r.laju * dt;

          // Tiba di dasar: pecah, lalu lahir lagi di atas.
          if (r.kepala >= dasar) {
            pecah(r.x, dasar);
            const baru = buat(dekat ? LAPIS_DEKAT : LAPIS_JAUH, dekat, true);
            r.x = baru.x;
            r.kepala = baru.kepala;
            r.panjang = baru.panjang;
            r.laju = baru.laju;
            r.terang = baru.terang;
            r.tebal = baru.tebal;
            continue;
          }

          const atas = r.kepala - r.panjang;
          if (r.kepala < 0 || atas > tinggi) continue;

          // Bagian yang keluar dari tepi atas dipotong, supaya tidak ada
          // gambar yang jatuh di luar kanvas.
          const y0 = Math.max(0, atas);
          const y1 = Math.min(tinggi, r.kepala);
          if (y1 <= y0) continue;

          // Warna penuh dari ujung ke ujung — tidak ada gradien.
          ctx.strokeStyle = `rgba(224, 27, 36, ${r.terang})`;
          ctx.lineWidth = r.tebal;
          ctx.beginPath();
          ctx.moveTo(r.x, y0);
          ctx.lineTo(r.x, y1);
          ctx.stroke();
        }
      }

      // ── Kilau dasar ─────────────────────────────────────────────────────
      // Coretan mendatar pucat di titik tumbukan: inilah yang memberi tahu
      // mata bahwa garisnya benar-benar berhenti di situ, bukan menembus.
      for (let i = kilau.length - 1; i >= 0; i--) {
        const k = kilau[i];
        k.umur += dt;
        const t = k.umur / k.hidup;
        if (t >= 1) {
          kilau.splice(i, 1);
          continue;
        }
        const nyala = Math.sin(t * Math.PI);
        const lebarKini = k.lebar * (0.5 + t * 1.1);
        const g = ctx.createLinearGradient(k.x - lebarKini, 0, k.x + lebarKini, 0);
        g.addColorStop(0, "rgba(255, 235, 235, 0)");
        g.addColorStop(0.5, `rgba(255, 235, 235, ${0.7 * nyala})`);
        g.addColorStop(1, "rgba(255, 235, 235, 0)");
        ctx.strokeStyle = g;
        ctx.lineWidth = 1.3;
        ctx.beginPath();
        ctx.moveTo(k.x - lebarKini, k.y);
        ctx.lineTo(k.x + lebarKini, k.y);
        ctx.stroke();
      }

      // ── Butir pecahan ───────────────────────────────────────────────────
      const gaya = 0.0009; // piksel per milidetik kuadrat
      for (let i = butir.length - 1; i >= 0; i--) {
        const b = butir[i];
        b.umur += dt;
        const t = b.umur / b.hidup;
        if (t >= 1) {
          butir.splice(i, 1);
          continue;
        }
        b.vy += gaya * dt;
        b.x += b.vx * dt;
        b.y += b.vy * dt;

        const alpha = (1 - t) ** 1.5;
        ctx.fillStyle = `rgba(255, 138, 132, ${alpha * 0.85})`;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.r, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.globalCompositeOperation = "source-over";
    };

    // ── Gerak ─────────────────────────────────────────────────────────────
    const SELANG = 1000 / 40;
    const hematGerak = window.matchMedia("(prefers-reduced-motion: reduce)");

    if (hematGerak.matches) {
      // Satu susunan diam: rintik tersebar di seluruh tinggi, beberapa kilau
      // di dasar supaya bentuk peristiwanya tetap terbaca. Tanpa animasi.
      gambar(0);
      for (let i = 0; i < 3; i++) {
        pecah(lebar * (0.2 + i * 0.3), tinggi - 2);
      }
      for (const k of kilau) k.umur = k.hidup * 0.5;
      for (const b of butir) {
        b.x += b.vx * 180;
        b.y += b.vy * 180;
        b.umur = b.hidup * 0.4;
      }
      gambar(0);
      return () => pengamat.disconnect();
    }

    let permintaan = 0;
    let terakhir = 0;
    const langkah = (now: number) => {
      permintaan = requestAnimationFrame(langkah);
      if (now - terakhir < SELANG) return;
      const dt = terakhir ? Math.min(now - terakhir, 50) : 16;
      terakhir = now;
      if (document.hidden) return;
      gambar(dt);
    };
    permintaan = requestAnimationFrame(langkah);

    return () => {
      cancelAnimationFrame(permintaan);
      pengamat.disconnect();
    };
  }, []);

  return (
    <div aria-hidden="true" className="latar-hujan">
      <canvas ref={rujukan} />
    </div>
  );
}
