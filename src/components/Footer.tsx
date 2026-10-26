import { useLanguage } from "../i18n/useLanguage";
import Logo from "../assets/Logo.gif";

/**
 * Footer situs yang tampil di seluruh halaman.
 *
 * Dua sisi dalam satu baris: kiri berisi logo studio + teks hak cipta, kanan
 * berisi empat tautan sosial (Email, X, Instagram, Threads). Di layar sempit
 * keduanya menumpuk vertikal dan ditengahkan.
 *
 * WARNA
 * Footer adalah blok HITAM penuh, dengan satu garis aksen merah di tepi atas
 * sebagai penyambung ke halaman di atasnya. Ini satu-satunya tempat di situs
 * yang seluruh lebarnya hitam, dan itu disengaja: footer muncul di setiap
 * halaman, jadi ia yang paling efektif menutup halaman dengan warna brand.
 *
 * Teks di atas hitam tidak memakai warna tema (text-fg / text-fg-muted), karena
 * keduanya sudah bernilai putih dan akan menyatu dengan jalur merah di latar.
 * Yang dipakai adalah void-white dengan kepekatan yang diturunkan, sehingga
 * keterbacaan tetap terjaga.
 *
 * Tagline di bawah hak cipta memakai Cinzel (font-display) dengan huruf renggang
 * — mengulang gaya label di halaman About Us, dan memberi footer sesuatu yang
 * bernada, bukan sekadar baris keterangan.
 *
 * Logo memakai src/assets/Logo.gif — berkas logo asli studio, sama dengan yang
 * dipakai navbar.
 *
 * `object-contain` dipakai supaya logo tampil UTUH, tidak ada bagian yang
 * terpotong. `max-w-none` menetralkan aturan `img { max-width: 100% }` dari
 * Tailwind preflight, yang kalau dibiarkan bisa memotong lebar logo.
 *
 * Ukurannya disengaja disamakan dengan logo navbar (h-11 w-11, lg:h-12 lg:w-12)
 * supaya keduanya tampil sebesar yang sama di seluruh situs.
 *
 * Lebarnya disamakan dengan navbar dan konten halaman (max-w-6xl + px-5) supaya
 * tepi kiri-kanannya sejajar di semua lebar layar.
 *
 * Pemilih bahasa sengaja tidak ditaruh di sini — bahasa akan punya tempatnya
 * sendiri di Floating Action Button.
 */

const CURRENT_YEAR = new Date().getFullYear();

/** Empat kanal sosial studio. Ganti href-nya bila alamat resminya berubah. */
const SOCIALS = [
  {
    label: "Email",
    href: "mailto:febriyantojajang@gmail.com",
    path: "M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67zM22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z",
  },
  {
    label: "X",
    href: "https://x.com/JajangOsle",
    path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
  },
  {
    label: "Instagram",
    href: "https://www.instagram.com/jajangstd.art",
    path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z",
  },
  {
    label: "Threads",
    href: "https://www.threads.com/@jajangstd.art",
    path: "M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.964-.065-1.19.408-2.285 1.33-3.082.88-.76 2.119-1.207 3.583-1.291a13.853 13.853 0 011.533.012 10.755 10.755 0 00-.418-1.83c-.541-1.368-1.468-2.07-2.831-2.14-1.203-.062-2.099.34-2.493.526l-.855-1.81c.53-.24 1.79-.803 3.62-.71 2.037.108 3.463 1.19 4.24 3.214.485 1.263.775 2.837.865 4.68.852.352 1.585.853 2.18 1.49 1.063 1.132 1.63 2.611 1.595 4.163-.036 1.605-.704 3.05-1.929 4.177-1.795 1.652-4.09 2.486-7.123 2.508zm1.253-8.222c-.245.02-.498.032-.75.03-1.302-.008-2.144.51-2.126 1.303.02.822.933 1.26 1.83 1.213.876-.046 2.038-.418 2.283-2.386a10.42 10.42 0 00-1.237-.16z",
  },
] as const;

export default function Footer() {
  const { t } = useLanguage();

  return (
    <footer className="relative border-t border-accent-line bg-void-black text-void-white">
      {/* Jalur merah tipis sebagai latar — penanda bahwa halaman berhenti di
          sini. Sama bentuknya dengan jalur di hero, jadi halaman terbaca
          melingkar: dibuka dan ditutup dengan bahasa visual yang sama. */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -right-1/4 bottom-0 h-full w-1/3 -rotate-12 bg-linear-to-l from-void-red/20 to-transparent" />
      </div>

      <div className="wadah relative flex flex-col items-center gap-6 py-8 text-sm text-void-white/60 sm:flex-row sm:justify-between sm:gap-4">
        {/* Kiri — logo, hak cipta, dan tagline */}
        <div className="flex flex-col items-center gap-4 sm:flex-row sm:gap-4">
          <img
            src={Logo}
            alt="Voidline Island"
            loading="lazy"
            decoding="async"
            className="h-11 w-11 max-w-none shrink-0 rounded-full object-contain ring-1 ring-void-white/20 lg:h-12 lg:w-12"
          />
          <div className="text-center sm:text-left">
            <p className="text-void-white/60">
              © {CURRENT_YEAR} Voidline Island by{" "}
              <a
                href="mailto:insanajianggoro01@gmail.com"
                className="font-semibold text-void-white/80 underline decoration-void-white/30 underline-offset-4 transition-colors hover:text-accent-bright"
              >
                STUPER
              </a>
              . {t("footer.rights")}
            </p>
            <p className="mt-1.5 font-display text-[0.7rem] font-semibold uppercase tracking-[0.24em] text-accent-bright">
              {t("footer.tagline")}
            </p>
          </div>
        </div>

        {/* Kanan — tautan sosial. Ikon memakai warna redup lalu menyala merah
            saat disorot: aksen merah tetap jadi penanda interaksi. */}
        <nav aria-label="Social" className="flex items-center gap-2">
          {SOCIALS.map((social) => (
            <a
              key={social.label}
              href={social.href}
              aria-label={social.label}
              title={social.label}
              target={social.href.startsWith("http") ? "_blank" : undefined}
              rel={social.href.startsWith("http") ? "noreferrer noopener" : undefined}
              className="grid h-9 w-9 place-items-center rounded-lg text-void-white/60 transition-colors hover:bg-void-red hover:text-void-white"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                className="fill-current"
                aria-hidden="true"
              >
                <path d={social.path} />
              </svg>
            </a>
          ))}
        </nav>
      </div>
    </footer>
  );
}
