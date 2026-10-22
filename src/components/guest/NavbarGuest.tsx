import { useEffect, useState } from "react";
import { Link, NavLink } from "react-router-dom";
import Logo from "../../assets/Logo.gif";
import { collections } from "../../data/collections";
import { useLanguage } from "../../i18n/useLanguage";
import LanguageSwitch from "./LanguageSwitch";

/**
 * Navbar pengunjung yang belum login.
 *
 * Satu baris saja, tinggi 72px: logo di kiri, menu di tengah, dan deretan alat
 * di kanan — dengan urutan pemilih bahasa, lalu tombol merah "Buy Now".
 *
 * Menu diposisikan center terhadap halaman memakai trik absolut: blok menu
 * diletakkan di tengah (`left-1/2 -translate-x-1/2`) sehingga lebar logo dan
 * lebar deretan alat di kanan tidak menggesernya. Kalau memakai flex biasa,
 * menu akan bergeser setiap kali panjang teks kanan berubah (mis. saat bahasa
 * berganti).
 *
 * Jam dan kalender tidak dipakai — jam dinding tanpa label zona waktu berbahaya
 * di situs publik, karena dua pengunjung dari kota berbeda membaca angka yang
 * sama dengan arti berbeda.
 *
 * Logo memakai src/assets/Logo.gif — berkas logo asli studio.
 *
 * Dimuat dengan prioritas tinggi (fetchPriority="high") karena selalu berada
 * di atas lipatan dan tampil di setiap halaman.
 *
 * Logo tampil UTUH (object-contain), jadi tidak ada bagian yang terpotong.
 * Latar kanvas logo transparan dan kanvasnya hampir persegi, sehingga bentuk
 * bulat (rounded-full) membuatnya menyatu dengan latar navbar.
 *
 * Mobile: deretan menu disembunyikan, digantikan panel yang dibuka tombol
 * hamburger. Pemilih bahasa tetap di luar panel karena sering dipakai; pada
 * layar sangat sempit ia ikut menyusut agar tidak berdesak.
 *
 * WARNA
 * Navbar berlatar HITAM dan ikut menyatu dengan dinding halaman — ia tidak
 * dipisahkan oleh blok, hanya oleh garis aksen merah di tepi bawah. Satu garis,
 * bukan bidang merah: navbar yang berwarna sendiri akan mencuri perhatian dari
 * isi halaman di bawahnya, sementara navbar yang menyatu membuat halaman terasa
 * lebih tinggi.
 *
 * Tombol "Buy Now" memakai latar merah penuh dengan teks putih — satu-satunya
 * bidang merah di navbar, karena ia memang satu-satunya hal yang diminta untuk
 * diklik. Ia tautan biasa (bukan tombol nonaktif): tujuannya halaman mint
 * koleksi pertama, dan halaman itu sudah ada.
 */
const NAV_ITEMS = [
  { key: "nav.home", to: "/", end: true },
  { key: "nav.collection", to: "/collections", end: false },
  { key: "nav.generate", to: "/generate", end: false },
  { key: "nav.about", to: "/about-us", end: false },
  { key: "nav.contact", to: "/contact-us", end: false },
] as const;

/**
 * Tujuan tombol "Buy Now".
 *
 * Diambil dari `collections[0]`, bukan ditulis tetap ("/collections/mint/apesvoidline"),
 * supaya tombol ini selalu menunjuk koleksi pertama yang BENAR. Begitu urutan
 * koleksi di data/collections.ts diubah, tombol ikut menyesuaikan sendiri dan
 * tidak akan menunjuk koleksi yang sudah tidak ada.
 */
const BUY_NOW_TO = `/collections/mint/${collections[0].slug}`;

export default function NavbarGuest() {
  const { t } = useLanguage();
  const [menuOpen, setMenuOpen] = useState(false);

  // Kunci gulir halaman selama panel mobile terbuka, supaya latar belakang
  // tidak ikut bergulir saat pengunjung membaca menu.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  const desktopLinkClass = ({ isActive }: { isActive: boolean }) =>
    `relative py-2 transition-colors ${
      isActive
        ? "font-semibold text-accent after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:rounded-full after:bg-accent"
        : "text-fg-muted hover:text-fg"
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-accent-line bg-bg/80 backdrop-blur-xl">
      {/* Grid 3 kolom sama lebar: logo | menu | alat kanan.
          Karena kolom kiri dan kanan sama-sama 1fr, kolom tengah otomatis
          berada tepat di tengah halaman — menu tidak bergeser walau panjang
          teks di kanan berubah (mis. saat bahasa berganti). */}
      {/* Lebar dan padding navbar sengaja sama persis dengan container konten
          halaman (max-w-6xl + px-5) supaya tepi kiri-kanan navbar sejajar dengan
          tepi kiri-kanan isi halaman di semua lebar layar. */}
      <div className="mx-auto grid h-18 max-w-6xl grid-cols-[1fr_auto_1fr] items-center gap-4 px-5">
        {/* Kolom 1 — logo, rata kiri.
            Ukuran logo dilepas dari alur layout (`absolute`) supaya bisa lebih
            besar dari tinggi navbar tanpa menambah tinggi baris atau menggeser
            posisi garis bawah. Yang menentukan tinggi navbar adalah grid itu
            sendiri (h-18).

            Wadah <Link> diberi ukuran yang SAMA PERSIS dengan logonya (h-11 w-11).
            Ini bukan hiasan: Tailwind preflight memasang `img { max-width: 100% }`,
            sehingga lebar gambar selalu dibatasi lebar wadahnya. Kalau wadahnya
            lebih kecil dari logo, gambar terpotong dan tampil lonjong, bukan
            bulat. Dengan wadah yang sama besar, batas itu tidak pernah aktif.

            `max-w-none` dipasang di gambar sebagai sabuk pengaman kedua: ia
            mematikan batas 100% itu langsung di elemennya.

            `object-contain` (bukan `object-cover`) dipakai supaya logo tampil
            UTUH — tidak ada bagian yang terpotong. `object-cover` akan memangkas
            tepi gambar demi memenuhi kotak; `object-contain` mengecilkan gambar
            seperlunya agar seluruh isinya masuk. Karena kanvas logo hampir persegi
            dan wadahnya juga persegi, hasilnya sama saja ukurannya, tetapi isinya
            dijamin tidak hilang.

            `rounded-full` tetap dipertahankan: latar kanvas logo transparan,
            sehingga bentuk bulat membuat logo menyatu dengan latar navbar
            alih-alih tampak sebagai kotak. */}
        <Link
          to="/"
          className="relative h-11 w-11 shrink-0 justify-self-start lg:h-12 lg:w-12"
          aria-label="Voidline Studio"
        >
          <img
            src={Logo}
            alt="Voidline Studio"
            fetchPriority="high"
            decoding="async"
            className="absolute left-0 top-1/2 h-11 w-11 max-w-none -translate-y-1/2 rounded-full object-contain lg:h-12 lg:w-12"
          />
        </Link>

        {/* Kolom 2 — menu, center. Di layar < lg disembunyikan supaya tidak
            berdesakan dengan kolom kanan; digantikan panel hamburger. */}
        <nav
          aria-label={t("nav.menu")}
          className="hidden items-center gap-5 text-sm font-medium lg:flex xl:gap-7"
        >
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} to={item.to} end={item.end} className={desktopLinkClass}>
              {t(item.key)}
            </NavLink>
          ))}
        </nav>

        {/* Kolom 3 — satu deretan "tabs-lift": bahasa · auth. Semua elemen duduk
            di garis tengah navbar (`items-center`), supaya sejajar dengan menu di
            tengah. Keduanya memakai bentuk serupa — kotak sudut atas melengkung —
            supaya terbaca sebagai satu kelompok alat, bukan dua elemen
            berlainan. */}
        <div className="flex shrink-0 items-center gap-0.5 justify-self-end">
          {/* Tab bahasa — satu bendera bahasa aktif; klik untuk berganti. */}
          <LanguageSwitch />

          {/* Buy Now — satu tombol, latar merah, teks putih.
              Satu-satunya bidang merah di navbar: ia memang satu-satunya hal
              yang diminta untuk diklik, jadi seluruh daya tarik merah
              dikumpulkan di sini alih-alih disebar.
              Bentuknya sengaja disamakan dengan deretan tab di sebelahnya
              (sudut membulat, tinggi ~36px) supaya sejajar dan terbaca sebagai
              satu kelompok alat.
              Tujuannya koleksi pertama; lihat BUY_NOW_TO di atas file ini. */}
          <Link
            to={BUY_NOW_TO}
            className="ml-2 hidden shrink-0 items-center rounded-lg bg-accent px-5 py-2 text-xs font-semibold text-accent-fg shadow-brand-sm transition-colors hover:bg-accent-deep sm:inline-flex"
          >
            {t("nav.buyNow")}
          </Link>

          {/* Hamburger — mobile/tablet */}
          <button
            type="button"
            onClick={() => setMenuOpen((current) => !current)}
            aria-label={menuOpen ? t("nav.closeMenu") : t("nav.openMenu")}
            aria-expanded={menuOpen}
            aria-controls="mobile-nav-panel"
            className="grid h-9 w-9 shrink-0 place-items-center rounded-lg text-fg-muted transition-colors hover:bg-surface-muted hover:text-fg lg:hidden"
          >
            {menuOpen ? (
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                <path d="M6 6l12 12M18 6L6 18" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
                <path d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Panel menu mobile */}
      <div
        id="mobile-nav-panel"
        className={`overflow-hidden border-t border-border transition-[max-height,opacity] duration-300 lg:hidden ${
          menuOpen ? "max-h-128 opacity-100" : "max-h-0 border-t-0 opacity-0"
        }`}
      >
        <div className="mx-auto flex max-w-6xl flex-col px-5 py-3">
          {NAV_ITEMS.map((item, index) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={() => setMenuOpen(false)}
              className={({ isActive }) =>
                `border-b border-border/60 py-3 text-sm font-medium transition-colors last:border-b-0 ${
                  isActive ? "font-semibold text-accent" : "text-fg-muted hover:text-fg"
                }`
              }
            >
              {/* Nomor urut kecil di depan tiap menu: mengulang bahasa visual
                  "01 / 02" halaman About Us, dan memakai ruang kosong di kiri
                  yang tadinya cuma jarak. */}
              <span className="mr-3 font-display text-xs text-accent" aria-hidden="true">
                {String(index + 1).padStart(2, "0")}
              </span>
              {t(item.key)}
            </NavLink>
          ))}

          <div className="pt-4 sm:hidden">
            <Link
              to={BUY_NOW_TO}
              onClick={() => setMenuOpen(false)}
              className="block rounded-lg bg-accent px-4 py-2.5 text-center text-sm font-semibold text-accent-fg transition-colors hover:bg-accent-deep"
            >
              {t("nav.buyNow")}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
}
