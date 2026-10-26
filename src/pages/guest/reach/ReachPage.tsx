import { Link } from "react-router";
import { useLanguage } from "../../../i18n/useLanguage";
import HalamanBerlatar from "../../../components/guest/HalamanBerlatar";
import Logo from "../../../assets/Logo.gif";

/**
 * Halaman Reach.
 *
 * Satu halaman, dua jalur: karya pesanan (commission) dan jasa studio. Di
 * bawahnya panduan menulis, tiga kebijakan, lalu kanal — Discord sebagai jalur
 * utama, media sosial sebagai pelengkap.
 *
 * SUSUNAN
 *   1. Kepala     tujuan halaman + baris keadaan (menerima kerja, balasan)
 *   2. Dua jalur  kartu commission (merah, gelap) | kartu jasa studio (putih)
 *   3. Panduan    tiga langkah sebelum menulis
 *   4. Kebijakan  beli NFT · pakai artwork · kolaborasi
 *   5. Kanal      panel Discord, lalu tautan media sosial
 *   6. Studio     penutup: siapa yang menjawab, tautan ke /studio
 *
 * WARNA
 * Kartu jasa memakai panel PUTIH seperti kartu koleksi; kartu commission
 * sengaja gelap dengan pendar merah supaya kedua jalur tidak terbaca sebagai
 * dua blok yang sama pentingnya. Merah hanya dipakai untuk penanda, angka, dan
 * tombol.
 *
 * Tidak ada formulir dan tidak ada email: tanpa backend, formulir hanya
 * menampung pesan yang tidak sampai ke siapa pun, dan surel satu-satunya jalan
 * yang bisa dipakai tidak lebih baik daripada percakapan langsung di Discord.
 */

const DISCORD_URL = "https://discord.com/users/934785696667942923";

/** Empat jasa studio. Urutan sama dengan tampilan. */
const JASA = [
  { key: "png", num: "01" },
  { key: "gif", num: "02" },
  { key: "web", num: "03" },
  { key: "generator", num: "04" },
] as const;

/** Panduan sebelum menulis — tiga langkah. */
const LANGKAH = ["1", "2", "3"] as const;

/** Kebijakan singkat. `tautan` menandai baris yang punya jalan keluar. */
const KEBIJAKAN = ["nft", "karya", "kolaborasi"] as const;

/** Media sosial — sama dengan daftar di footer. */
const SOSIAL = [
  {
    key: "x",
    href: "https://x.com/JajangOsle",
    label: "@JajangOsle",
    path: "M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z",
  },
  {
    key: "instagram",
    href: "https://www.instagram.com/jajangstd.art",
    label: "@jajangstd.art",
    path: "M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z",
  },
  {
    key: "threads",
    href: "https://www.threads.com/@jajangstd.art",
    label: "@jajangstd.art",
    path: "M12.186 24h-.007c-3.581-.024-6.334-1.205-8.184-3.509C2.35 18.44 1.5 15.586 1.472 12.01v-.017c.03-3.579.879-6.43 2.525-8.482C5.845 1.205 8.6.024 12.18 0h.014c2.746.02 5.043.725 6.826 2.098 1.677 1.29 2.858 3.13 3.509 5.467l-2.04.569c-1.104-3.96-3.898-5.984-8.304-6.015-2.91.022-5.11.936-6.54 2.717C4.307 6.504 3.616 8.914 3.589 12c.027 3.086.718 5.496 2.057 7.164 1.43 1.783 3.631 2.698 6.54 2.717 2.623-.02 4.358-.631 5.8-2.045 1.647-1.613 1.618-3.593 1.09-4.798-.31-.71-.873-1.3-1.634-1.75-.192 1.352-.622 2.446-1.284 3.272-.886 1.102-2.14 1.704-3.73 1.79-1.202.065-2.361-.218-3.259-.801-1.063-.689-1.685-1.74-1.752-2.964-.065-1.19.408-2.285 1.33-3.082.88-.76 2.119-1.207 3.583-1.291a13.853 13.853 0 011.533.012 10.755 10.755 0 00-.418-1.83c-.541-1.368-1.468-2.07-2.831-2.14-1.203-.062-2.099.34-2.493.526l-.855-1.81c.53-.24 1.79-.803 3.62-.71 2.037.108 3.463 1.19 4.24 3.214.485 1.263.775 2.837.865 4.68.852.352 1.585.853 2.18 1.49 1.063 1.132 1.63 2.611 1.595 4.163-.036 1.605-.704 3.05-1.929 4.177-1.795 1.652-4.09 2.486-7.123 2.508zm1.253-8.222c-.245.02-.498.032-.75.03-1.302-.008-2.144.51-2.126 1.303.02.822.933 1.26 1.83 1.213.876-.046 2.038-.418 2.283-2.386a10.42 10.42 0 00-1.237-.16z",
  },
] as const;

/** Judul bagian dengan garis tipis yang mengisi sisa lebar. */
function KepalaBagian({ teks }: { teks: string }) {
  return (
    <div className="mb-5 flex items-baseline gap-4">
      <h2 className="font-display text-2xl font-semibold tracking-tight">{teks}</h2>
      <span aria-hidden="true" className="h-px flex-1 bg-border" />
    </div>
  );
}

/** Logo Discord — satu-satunya tanda kanal utama di halaman ini. */
function IkonDiscord({ ukuran = 20 }: { ukuran?: number }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={ukuran}
      height={ukuran}
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M20.317 4.369a19.79 19.79 0 00-4.885-1.515.074.074 0 00-.079.037c-.211.375-.444.864-.608 1.249a18.27 18.27 0 00-5.487 0 12.64 12.64 0 00-.617-1.249.077.077 0 00-.079-.037A19.736 19.736 0 003.677 4.37a.07.07 0 00-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 00.031.056 19.9 19.9 0 005.993 3.03.078.078 0 00.084-.028c.462-.63.874-1.295 1.226-1.994a.076.076 0 00-.041-.106 13.107 13.107 0 01-1.872-.892.077.077 0 01-.008-.128c.126-.094.252-.192.372-.291a.074.074 0 01.077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 01.078.009c.12.099.246.198.373.292a.077.077 0 01-.006.127 12.3 12.3 0 01-1.873.892.077.077 0 00-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 00.084.028 19.839 19.839 0 006.002-3.03.077.077 0 00.032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 00-.031-.03zM8.02 15.331c-1.182 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.419 0 1.334-.956 2.419-2.157 2.419zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.419 0 1.334-.946 2.419-2.157 2.419z" />
    </svg>
  );
}

export default function ReachPage() {
  const { t } = useLanguage();

  return (
    <HalamanBerlatar>
      {/* ── 1. KEPALA ───────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-t border-border">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.18]">
          <div className="absolute -left-1/4 top-0 h-full w-1/2 rotate-12 bg-linear-to-r from-void-red to-transparent" />
        </div>

        <div className="wadah bagian-kepala-halaman relative pb-20 sm:pb-24">
          <div className="max-w-3xl">
            <p className="kicker">
              <span className="kicker-garis" aria-hidden="true" />
              {t("page.contact.kicker")}
            </p>

            <h1 className="judul-halaman mt-6">
              {t("page.contact.title")}
            </h1>

            <p className="mt-6 max-w-[34rem] text-base leading-relaxed text-fg-muted sm:text-lg">
              {t("page.contact.lead")}
            </p>

            {/* Baris keadaan: satu pandangan memberi tahu apakah studio sedang
                menerima kerja dan seberapa cepat balasannya. Di layar sempit
                keterangan turun bersusun — titik pemisah hanya muncul saat
                semua muat satu baris. */}
            <ul className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-2 text-xs text-fg sm:text-sm">
              <li className="flex items-center gap-2 rounded-full border border-accent-line bg-white/3 px-3.5 py-1.5 font-medium">
                <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-void-red" />
                {t("page.contact.status.open")}
              </li>
              <li className="text-fg-muted sm:before:mr-3 sm:before:text-white/30 sm:before:content-['·']">
                {t("page.contact.status.terms")}
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ── 2. DUA JALUR ──────────────────────────────────────────────── */}
      <section className="wadah pb-16 sm:pb-20">
        <div className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
          {/* Commission — satu-satunya tombol merah penuh di halaman ini. */}
          <div className="relative flex flex-col overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-[#141114] to-[#0b0b0d] p-7 sm:p-8">
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -right-[30%] -top-[40%] h-[150%] w-[70%] bg-[radial-gradient(circle,rgba(224,27,36,0.30),transparent_62%)]"
            />

            <div className="relative flex flex-1 flex-col">
              <p className="font-display text-xs font-semibold uppercase tracking-[0.2em] text-accent-bright">
                {t("page.contact.commission.num")}
              </p>
              <h2 className="mt-4 font-display text-2xl font-semibold leading-tight sm:text-[1.7rem]">
                {t("page.contact.commission.title")}
              </h2>
              <p className="mt-4 max-w-[34rem] text-sm leading-relaxed text-fg-muted">
                {t("page.contact.commission.body")}
              </p>

              <ul className="mt-6 flex flex-wrap gap-2">
                {(["single", "series", "commercial", "revenue"] as const).map((chip) => (
                  <li
                    key={chip}
                    className="rounded-full border border-border px-3 py-1.5 text-xs text-white/80"
                  >
                    {t(`page.contact.commission.chips.${chip}`)}
                  </li>
                ))}
              </ul>
            </div>

            <a
              href={DISCORD_URL}
              target="_blank"
              rel="noreferrer noopener"
              className="tombol tombol-merah relative mt-7 w-fit"
            >
              <IkonDiscord ukuran={16} />
              {t("page.contact.commission.cta")}
              <span aria-hidden="true">→</span>
            </a>
          </div>

          {/* Jasa studio — panel putih, tidak bisa diklik seluruhnya karena
              isinya daftar, bukan satu tujuan. */}
          <div className="flex flex-col rounded-2xl bg-panel p-7 text-panel-fg sm:p-8">
            <h2 className="font-display text-xl font-semibold leading-tight">
              {t("page.contact.services.title")}
            </h2>
            <p className="mt-2 max-w-[34rem] text-sm leading-relaxed text-panel-fg-muted">
              {t("page.contact.services.sub")}
            </p>

            <ul className="mt-5">
              {JASA.map(({ key, num }) => (
                <li
                  key={key}
                  className="flex gap-3 border-t border-black/8 py-3 first:border-t-0 first:pt-0"
                >
                  <span className="min-w-5 pt-0.5 font-display text-xs text-accent-on-panel">
                    {num}
                  </span>
                  <span>
                    <span className="block text-sm font-semibold">
                      {t(`page.contact.services.items.${key}.name`)}
                    </span>
                    <span className="mt-0.5 block text-xs leading-relaxed text-panel-fg-muted">
                      {t(`page.contact.services.items.${key}.note`)}
                    </span>
                  </span>
                </li>
              ))}
            </ul>

            <p className="mt-auto max-w-[34rem] pt-5 text-xs leading-relaxed text-panel-fg-muted">
              {t("page.contact.services.foot")}
            </p>
          </div>
        </div>
      </section>

      {/* ── 3. PANDUAN SEBELUM MENULIS ─────────────────────────────────── */}
      <section className="wadah pb-16 sm:pb-20">
        <KepalaBagian teks={t("page.contact.before.title")} />

        <div className="grid gap-6 sm:grid-cols-3">
          {LANGKAH.map((n) => (
            <article key={n} className="border-t border-border pt-4">
              <p className="font-display text-xs tracking-[0.18em] text-accent-bright">
                {`0${n}`}
              </p>
              <h3 className="mt-2.5 font-display text-base font-semibold">
                {t(`page.contact.before.steps.${n}.title`)}
              </h3>
              <p className="mt-2 max-w-[34rem] text-sm leading-relaxed text-fg-muted">
                {t(`page.contact.before.steps.${n}.body`)}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* ── 4. KEBIJAKAN ───────────────────────────────────────────────── */}
      <section className="wadah pb-16 sm:pb-20">
        <div className="grid gap-px overflow-hidden rounded-xl bg-border">
          {KEBIJAKAN.map((key) => (
            <div
              key={key}
              className="flex flex-col gap-2 bg-bg px-6 py-5 sm:flex-row sm:gap-6"
            >
              <h3 className="font-display text-sm font-semibold leading-relaxed sm:min-w-44">
                {t(`page.contact.policy.${key}.title`)}
              </h3>
              <p className="max-w-[40rem] text-sm leading-relaxed text-fg-muted">
                {t(`page.contact.policy.${key}.body`)}
                {key === "nft" && (
                  <>
                    {" "}
                    <Link
                      to="/collection"
                      className="text-void-red underline decoration-accent-line underline-offset-4 transition-colors hover:decoration-void-red"
                    >
                      {t("page.contact.policy.nft.link")}
                    </Link>
                    .
                  </>
                )}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 5. KANAL ───────────────────────────────────────────────────── */}
      <section className="wadah pb-16 sm:pb-20">
        <KepalaBagian teks={t("page.contact.channels.title")} />

        {/* Discord adalah jalur utama — satu kanal, satu tombol. Tidak ada
            alamat yang perlu disalin; tekan tombolnya, percakapan langsung
            terbuka. */}
        <div className="flex flex-col gap-4 rounded-2xl bg-panel p-5 text-panel-fg sm:flex-row sm:items-center sm:gap-6 sm:p-6">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#5865F2] text-white">
            <IkonDiscord ukuran={22} />
          </span>

          <div className="min-w-0 flex-1">
            <p className="text-xs uppercase tracking-[0.16em] text-panel-fg-muted">
              {t("page.contact.channels.discordLabel")}
            </p>
            <p className="mt-1 font-display text-lg font-semibold tracking-tight sm:text-xl">
              {t("page.contact.channels.discordName")}
            </p>
          </div>

          <a
            href={DISCORD_URL}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex shrink-0 items-center justify-center gap-2 rounded-lg bg-panel-fg px-4 py-2.5 text-sm font-semibold text-void-white transition-opacity hover:opacity-85"
          >
            {t("page.contact.channels.discordCta")}
            <svg
              viewBox="0 0 24 24"
              width="15"
              height="15"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M14 3h7v7" />
              <path d="M21 3l-8.5 8.5" />
              <path d="M19 14v5.5A1.5 1.5 0 0117.5 21h-13A1.5 1.5 0 013 19.5v-13A1.5 1.5 0 014.5 5H10" />
            </svg>
          </a>
        </div>

        <ul className="mt-4 flex flex-wrap gap-2.5">
          {SOSIAL.map((sosial) => (
            <li key={sosial.key}>
              <a
                href={sosial.href}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex items-center gap-2.5 rounded-lg border border-border px-4 py-2.5 text-sm text-fg-muted transition-colors hover:border-accent hover:bg-accent-soft hover:text-fg"
              >
                <svg viewBox="0 0 24 24" className="h-4 w-4 fill-current" aria-hidden="true">
                  <path d={sosial.path} />
                </svg>
                {sosial.label}
              </a>
            </li>
          ))}
        </ul>
      </section>

      {/* ── 6. STUDIO ──────────────────────────────────────────────────── */}
      <section className="wadah pb-20 sm:pb-24">
        <div className="flex flex-col gap-5 rounded-2xl border border-border p-6 sm:flex-row sm:items-center sm:gap-7 sm:p-7">
          <span className="grid h-14 w-14 shrink-0 place-items-center rounded-full border border-border bg-white/5">
            <img
              src={Logo}
              alt=""
              className="h-10 w-10 max-w-none object-contain"
            />
          </span>

          <div className="min-w-0 flex-1">
            <h2 className="font-display text-lg font-semibold">{t("page.contact.studio.title")}</h2>
            <p className="mt-2 max-w-[34rem] text-sm leading-relaxed text-fg-muted">
              {t("page.contact.studio.body")}
            </p>
          </div>

          <Link
            to="/studio"
            className="shrink-0 self-start border-b border-accent-line pb-0.5 text-sm font-semibold text-void-red transition-colors hover:border-void-red sm:self-auto"
          >
            {t("page.contact.studio.cta")}
          </Link>
        </div>
      </section>
    </HalamanBerlatar>
  );
}
