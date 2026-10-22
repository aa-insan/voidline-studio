import { useEffect, useRef, useState } from "react";
import { useLanguage } from "../../i18n/useLanguage";
import type { Collection } from "../../data/collections";

/* =============================================================================
   KOTAK MINT XRP.CAFE

   Widget disuntikkan lewat useEffect, bukan ditulis sebagai <script> di JSX.
   React tidak menjalankan tag <script> yang datang dari JSX; kalau ditempel
   begitu saja kotaknya tidak akan pernah muncul. Menambah dan membuang elemen
   lewat DOM langsung adalah cara yang benar.

   CARA KERJA WIDGET — perlu dipahami sebelum mengubah berkas ini.
   xrp.cafe mengeksekusi tiga langkah, dan langkah ketiga itulah sumber
   masalahnya:

     1. Membuat <iframe> berisi UI mint dari origin xrp.cafe.
     2. Menyisipkannya tepat SETELAH tag <script> :
            script.parentNode.insertBefore(iframe, script.nextSibling)
     3. Mengubah tingginya lewat postMessage ketika UI selesai menghitung
        ukurannya sendiri.

   Langkah 2 membuat posisi iframe ditentukan oleh DI MANA TAG SCRIPT BERADA.
   Karena itu skrip TIDAK BOLEH diletakkan di dalam wadah berposisi absolute,
   dan tidak boleh ada elemen React yang ditempatkan setelah tag skrip dalam
   wadah yang sama.

   KENAPA PERNAH TERJADI WIDGET DOBEL YANG MENIMPA FOOTER.
   Penanda "memuat" versi lama dipasang dengan `absolute inset-0` DI DALAM
   wadah berposisi relative yang sama dengan tag skrip. React menempatkan
   penanda itu tepat sesudah tag skrip. Ketika React memutuskan penanda sudah
   tidak perlu — tema berganti, koleksi berganti, atau siklus ganda StrictMode
   di mode pengembangan — React melepas elemen tersebut dari DOM. Karena
   iframe adalah ANAK LANGSUNG dari elemen induk yang sama, pelepasan itu ikut
   mencabut iframe keluar dari wadahnya. React lalu memasang penanda baru,
   widget dimuat ulang, muncul iframe kedua — dan yang pertama kini berada di
   luar wadah, tanpa induk berposisi relative, sehingga posisinya meleset ke
   bawah dan menimpa footer.

   ATURAN YANG DIPAKAI SEKARANG.
   a. Tag skrip berdiri sendiri di dalam <div> sendiri, tanpa saudara.
   b. Penanda memuat berada di elemen TERPISAH, bukan di dalam wadah skrip.
   c. React tidak pernah memasang elemen apa pun di dalam wadah skrip, jadi
      React tidak pernah menyentuh iframe milik xrp.cafe.
   d. React hanya MEMASANG, tidak pernah MEMBERSIHKAN saat komponen dilepas.
      Menghapus isi wadah terbukti membahayakan: React melepas penanda memuat
      tepat setelah tag skrip, dan pelepasan itu dapat mencabut iframe
      xrp.cafe dari wadahnya sehingga menempel liar di halaman.

   KENAPA PENANDA MEMUAT TIDAK LAGI MENGGUNAKAN EVENT "load".
   Versi sebelumnya menunggu event "load" pada tag skrip, lalu memanggil
   setReady(true). Itu rapuh: bila tag skrip sudah dilepas dari DOM atau event
   "load" tidak pernah menyala karena skrip dilayani dari cache, penanda
   berputar selamanya dan kotak mint tidak pernah dianggap siap. Sekarang
   penanda ditutup oleh pemeriksaan berkala yang melihat kenyataan di DOM —
   apakah iframe benar-benar sudah ada. Kalau ada, penanda berhenti. Kalau
   dalam 15 detik tetap tidak ada, penanda juga berhenti supaya pengunjung
   tidak menatap lingkaran berputar tanpa akhir, dan pesan pengganti
   ditampilkan lewat keadaan "gagal".

   KENAPA PENJAGA firstElementChild DIHAPUS.
   Penjaga itu memeriksa isi wadah dan membatalkan pemasangan bila sudah ada
   isi. Niatnya mencegah skrip ganda, tetapi akibatnya fatal: begitu tag skrip
   tertinggal di wadah (Vite tidak selalu membuangnya), kunjungan berikutnya
   tidak pernah memasang widget lagi — halaman macet permanen sampai di-refresh
   paksa. Sekarang yang dijaga adalah CATATAN di luar DOM: satu variabel
   menyimpan janji pemasangan, sehingga effect kedua menunggu yang pertama
   selesai, bukan membatalkannya. Tidak ada lagi jalan buntu.

   KENAPA TIDAK ADA LOGIKA ASINKRON SAAT MEMBERSIHKAN.
   Versi lama memakai requestAnimationFrame untuk menunda pembersihan.
   Pembersihan yang tertunda bisa terjadi SETELAH pemasangan berikutnya,
   sehingga justru menghapus widget yang baru terpasang. Pembersihan ditunda
   itu sudah dibuang.

   KENAPA TIDAK ADA PENGHAPUSAN <script> DARI DOM.
   Vite membuat skrip yang dieksekusi lewat appendChild kadang tetap tinggal di
   DOM. Kalau kita mencoba menghapusnya sendiri, yang terhapus justru wadah
   yang berisi iframe xrp.cafe. Jadi tidak ada kode penghapusan sama sekali,
   dan `replaceChildren` tidak dipakai di berkas ini.

   TEMA diteruskan dari tema situs, bukan dibiarkan mengikuti tema sistem
   pengunjung. Kalau dibiarkan, situs bisa tampil gelap sementara kotak mint
   terang — terlihat seperti kotak asing yang menempel.

   TINGGI MINIMUM 620px dipakai supaya halaman sudah cukup tinggi sejak gambar
   pertama, sehingga footer tidak pernah tertimpa oleh iframe yang tumbuh
   belakangan. Angka 620px sama dengan perkiraan awal tinggi iframe di dalam
   skrip xrp.cafe.
   ============================================================================= */

const SCRIPT_SRC = "https://xrp.cafe/embed/mint.js";

/** Perkiraan tinggi kotak mint, dipakai sebagai ruang pesanan awal. */
const MIN_HEIGHT = "min-h-[620px]";

/**
 * Janji pemasangan per wadah, disimpan DI LUAR DOM.
 *
 * Dipakai untuk menahan effect kedua — misalnya siklus ganda StrictMode di
 * mode pengembangan — sampai pemasangan pertama selesai, lalu memakai hasil
 * yang sama. Tidak ada jalan buntu, dan tidak ada skrip ganda.
 */
const instalasi = new WeakMap<Element, Promise<void>>();

/** Batas tunggu penanda memuat sebelum dianggap gagal (ms). */
const TIMEOUT_MUAT = 15000;

type Props = { collection: Collection };

export default function MintEmbed({ collection }: Props) {
  const { t } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const [status, setStatus] = useState<"memuat" | "siap" | "gagal">("memuat");

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    setStatus("memuat");

    // Effect kedua menunggu janji yang sama — bukan membatalkan.
    const sudahAda = instalasi.get(container);
    const janji =
      sudahAda ??
      (() => {
        const skrip = document.createElement("script");
        skrip.src = SCRIPT_SRC;
        skrip.async = true;
        skrip.dataset.vanity = collection.vanity;
        // Tema situs diteruskan ke widget xrp.cafe. Sejak mode gelap dihapus,
        // nilainya tetap "light" — tetapi atribut ini dibiarkan ada supaya
        // widget tetap menerima tema yang benar kalau suatu saat tema
        // dikembalikan.
        skrip.dataset.theme = "light";
        container.appendChild(skrip);

        const selesai = Promise.resolve();
        instalasi.set(container, selesai);
        return selesai;
      })();

    let batal = false;

    const periksa = () => {
      if (batal) return;
      // Ukur kenyataan, bukan asumsi: widget dianggap siap hanya bila
      // iframe-nya benar-benar sudah ada di dalam wadah.
      if (container.querySelector("iframe")) {
        setStatus("siap");
        return true;
      }
      return false;
    };

    // Pemeriksaan berkala, dan juga saat DOM berubah — mana yang lebih dulu.
    const pengawas = new MutationObserver(() => {
      if (periksa()) {
        pengawas.disconnect();
        window.clearInterval(penjaga);
        window.clearTimeout(batasWaktu);
      }
    });
    pengawas.observe(container, { childList: true });

    const penjaga = window.setInterval(() => {
      if (periksa()) {
        pengawas.disconnect();
        window.clearInterval(penjaga);
        window.clearTimeout(batasWaktu);
      }
    }, 400);

    // Jaring pengaman: jangan biarkan pengunjung menatap lingkaran berputar
    // tanpa akhir bila widget benar-benar tidak pernah datang.
    const batasWaktu = window.setTimeout(() => {
      if (batal) return;
      setStatus((sekarang) => (sekarang === "memuat" ? "gagal" : sekarang));
      pengawas.disconnect();
      window.clearInterval(penjaga);
    }, TIMEOUT_MUAT);

    void janji;

    return () => {
      batal = true;
      pengawas.disconnect();
      window.clearInterval(penjaga);
      window.clearTimeout(batasWaktu);
    };
  }, [collection.vanity]);

  return (
    <section
      aria-label={t(collection.titleKey)}
      className="overflow-hidden rounded-2xl border-2 border-transparent border-t-accent bg-panel shadow-brand-lg"
    >
      <div className="relative p-4">
        {/* Wadah xrp.cafe — berisi tag skrip SAJA, tanpa saudara. React tidak
            pernah memasang apa pun di sini, jadi iframe yang dibuat widget
            tidak pernah ikut tergeser. Lihat catatan di atas berkas. */}
        <div ref={containerRef} className={MIN_HEIGHT} />

        {/* Penanda memuat — elemen TERPISAH, bukan di dalam wadah skrip. */}
        {status === "memuat" && (
          <div className="pointer-events-none absolute inset-0 grid place-items-center">
            <span className="flex items-center gap-2 text-sm text-panel-fg-muted">
              <svg
                viewBox="0 0 24 24"
                className="h-4 w-4 animate-spin fill-none stroke-current text-accent-on-panel"
                strokeWidth="2.5"
                strokeLinecap="round"
                aria-hidden="true"
              >
                <path d="M12 3a9 9 0 1 0 9 9" />
              </svg>
              {t("collection.loading")}
            </span>
          </div>
        )}

        {/* Jaring pengaman: widget tidak pernah datang. Pengunjung diberi jalan
            keluar, bukan layar kosong. */}
        {status === "gagal" && (
          <div className="absolute inset-0 grid place-items-center px-6 text-center">
            <span className="text-sm leading-relaxed text-panel-fg-muted">
              {t("collection.loadFailed")}
            </span>
          </div>
        )}
      </div>

      {/* Catatan kecil di bawah kotak: GemWallet tidak bisa mint dari dalam
          embed, jadi pengunjung yang memakainya perlu jalan lain. Tautan ke
          halaman xrp.cafe disediakan supaya mereka tidak buntu.
          Ditaruh di jalur krem, terpisah dari kotak — ini keterangan milik
          situs kita, bukan bagian dari widget. */}
      <p className="border-t border-panel-border bg-panel-muted px-5 py-3 text-center text-xs text-panel-fg-muted">
        {t("collection.mintNote")}{" "}
        <a
          href={`https://xrp.cafe/id/collection/${collection.vanity}`}
          target="_blank"
          rel="noreferrer noopener"
          className="font-semibold text-accent-on-panel underline-offset-2 hover:underline"
        >
          xrp.cafe
        </a>
      </p>
    </section>
  );
}
