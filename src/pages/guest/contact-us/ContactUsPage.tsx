import { useLanguage } from "../../../i18n/useLanguage";
import HalamanBerlatar from "../../../components/guest/HalamanBerlatar";

/**
 * Halaman Contact Us.
 *
 * Menampilkan kanal resmi studio. Tidak ada formulir: pada tahap ini surat
 * elektronik dan pesan langsung di media sosial sudah cukup, dan formulir
 * tanpa backend hanya akan menampung pesan yang tidak sampai ke siapa pun.
 *
 * SUSUNAN
 *   1. Kepala   tujuan halaman
 *   2. Kanal    empat kanal, masing-masing satu kartu
 *   3. Catatan  jam balasan, supaya pengunjung tahu harus menunggu
 *
 * WARNA
 * Kartu kanal memakai panel PUTIH di atas latar hitam — pola yang sama dengan
 * kartu koleksi, supaya seluruh situs terbaca sebagai satu rancangan. Ikon dan
 * judul memakai merah; saat kartu disorot, garisnya ikut menyala merah.
 */

/** Empat kanal resmi studio. Sama dengan daftar di footer — satu sumber. */
const CHANNELS = [
  {
    key: "page.contact.channels.email",
    href: "mailto:febriyantojajang@gmail.com",
    label: "febriyantojajang@gmail.com",
    path: "M1.5 8.67v8.58a3 3 0 003 3h15a3 3 0 003-3V8.67l-8.928 5.493a3 3 0 01-3.144 0L1.5 8.67zM22.5 6.908V6.75a3 3 0 00-3-3h-15a3 3 0 00-3 3v.158l9.714 5.978a1.5 1.5 0 001.572 0L22.5 6.908z",
  },
  {
    key: "page.contact.channels.x",
    href: "https://x.com/JajangOsle",
    label: "@JajangOsle",
    path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
  },
  {
    key: "page.contact.channels.instagram",
    href: "https://www.instagram.com/jajangstd.art",
    label: "@jajangstd.art",
    path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z",
  },
  {
    key: "page.contact.channels.threads",
    href: "https://www.threads.com/@jajangstd.art",
    label: "@jajangstd.art",
    path: "M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.964-.065-1.19.408-2.285 1.33-3.082.88-.76 2.119-1.207 3.583-1.291a13.853 13.853 0 011.533.012 10.755 10.755 0 00-.418-1.83c-.541-1.368-1.468-2.07-2.831-2.14-1.203-.062-2.099.34-2.493.526l-.855-1.81c.53-.24 1.79-.803 3.62-.71 2.037.108 3.463 1.19 4.24 3.214.485 1.263.775 2.837.865 4.68.852.352 1.585.853 2.18 1.49 1.063 1.132 1.63 2.611 1.595 4.163-.036 1.605-.704 3.05-1.929 4.177-1.795 1.652-4.09 2.486-7.123 2.508zm1.253-8.222c-.245.02-.498.032-.75.03-1.302-.008-2.144.51-2.126 1.303.02.822.933 1.26 1.83 1.213.876-.046 2.038-.418 2.283-2.386a10.42 10.42 0 00-1.237-.16z",
  },
] as const;

export default function ContactUsPage() {
  const { t } = useLanguage();

  return (
    <HalamanBerlatar>
      {/* ── 1. KEPALA ───────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-t-4 border-accent">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.18]">
          <div className="absolute -left-1/4 top-0 h-full w-1/2 rotate-12 bg-linear-to-r from-void-red to-transparent" />
        </div>

        <div className="relative mx-auto max-w-6xl px-5 pb-16 pt-16 sm:pb-20 sm:pt-20">
          <div className="max-w-3xl">
            <p className="inline-flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.28em] text-void-red">
              <span className="h-px w-8 bg-void-red" aria-hidden="true" />
              {t("page.contact.kicker")}
            </p>

            <h1 className="mt-6 font-display text-4xl font-bold leading-[1.1] tracking-tight sm:text-5xl">
              {t("page.contact.title")}
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-relaxed text-fg-muted sm:text-lg">
              {t("page.contact.lead")}
            </p>
          </div>
        </div>
      </section>

      {/* ── 2. KANAL ──────────────────────────────────────────────────────
          Empat kartu PUTIH di atas latar hitam — pola yang sama dengan kartu
          koleksi. Seluruh kartu bisa diklik, bukan hanya tautannya. */}
      <section className="mx-auto max-w-6xl px-5 pb-16 sm:pb-20">
        <div className="grid gap-5 sm:grid-cols-2">
          {CHANNELS.map((channel) => (
            <a
              key={channel.key}
              href={channel.href}
              target={channel.href.startsWith("http") ? "_blank" : undefined}
              rel={channel.href.startsWith("http") ? "noreferrer noopener" : undefined}
              className="group flex items-center gap-4 rounded-2xl border-2 border-transparent bg-panel p-5 shadow-brand-md transition-colors hover:border-accent"
            >
              {/* Ikon dalam kotak merah — penanda kanal, sekaligus titik merah
                  yang mengarahkan mata sebelum membaca. */}
              <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-void-red text-void-white">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  className="fill-current"
                  aria-hidden="true"
                >
                  <path d={channel.path} />
                </svg>
              </span>

              <span className="min-w-0">
                <span className="block font-display text-base font-semibold tracking-tight text-panel-fg">
                  {t(channel.key)}
                </span>
                <span className="mt-0.5 block truncate text-sm text-panel-fg-muted">
                  {channel.label}
                </span>
              </span>

              {/* Panah keluar — muncul saat kartu disorot, menegaskan bahwa
                  seluruh kartu bisa diklik. */}
              <svg
                viewBox="0 0 24 24"
                className="ml-auto h-4 w-4 shrink-0 fill-current text-panel-fg-muted opacity-0 transition-opacity group-hover:opacity-100"
                aria-hidden="true"
              >
                <path d="M14 3h7v7h-2V6.41l-8.29 8.3-1.42-1.42 8.3-8.29H14V3ZM5 5h5v2H7v10h10v-3h2v5H5V5Z" />
              </svg>
            </a>
          ))}
        </div>

        {/* Catatan jam balasan — supaya pengunjung tahu harus menunggu, bukan
            mengira pesannya tidak sampai. */}
        <p className="mt-8 text-center text-xs leading-relaxed text-fg-muted">
          {t("page.contact.replyNote")}
        </p>
      </section>
    </HalamanBerlatar>
  );
}
