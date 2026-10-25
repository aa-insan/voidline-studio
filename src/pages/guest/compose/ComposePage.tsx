/* =============================================================================
   HALAMAN COMPOSE — alat dan penjelasan dalam satu halaman

   Pengunjung tidak dipisah dari alatnya. Begitu halaman terbuka, generator
   sudah siap dipakai di depan mata; cara pakai ada di bawahnya, bisa dibuka
   kapan saja tanpa meninggalkan halaman.

   MENGAPA TIDAK DIPISAH LAGI
   Versi sebelumnya memisahkan halaman penjelasan dan alatnya menjadi dua
   alamat. Itu memaksa pengunjung membaca dulu, lalu pindah
   halaman untuk mencoba — padahal generator ini justru paling mudah dipahami
   dengan mencobanya. Menyatukan keduanya menghapus satu perpindahan yang
   tidak memberi apa-apa.

   SUSUNAN
     1. Kepala    satu kalimat: ini apa, dan aman (berjalan di browser)
     2. Alat      generator, selebar layar, tanpa halangan
     3. Cara pakai empat langkah, lalu lipatan detail & syarat berkas
     4. Penutup   ajakan melihat koleksi jadi

   WARNA
   Mengikuti brand: dinding hitam, panel putih untuk pratinjau, merah hanya
   untuk aksi. Bagian penjelasan sengaja tidak memakai panel putih — kalau
   terlalu banyak bidang terang, alatnya kehilangan sorotan.
   ============================================================================= */

import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "../../../i18n/useLanguage";
import { useGenerator } from "../../../features/generator/hooks/useGenerator";
import LayerCard from "../../../features/generator/components/LayerCard";
import PreviewCanvas from "../../../features/generator/components/PreviewCanvas";
import CollectionSettingsPanel from "../../../features/generator/components/CollectionSettingsPanel";
import ResultGrid from "../../../features/generator/components/ResultGrid";
import HalamanBerlatar from "../../../components/guest/HalamanBerlatar";
import EmptyStart from "../../../features/generator/components/EmptyStart";
import { namaBerkasAman, unduhBlob } from "../../../features/generator/lib/unduh";

export default function ComposePage() {
  const { t } = useLanguage();
  const {
    keadaan,
    dispatch,
    galat,
    setGalat,
    versiAset,
    tambahTrait,
    buatLayerDenganBerkas,
    unggahBerkas,
    muatContoh,
    memuatContoh,
    hapusLayer,
    hapusTrait,
    traitAktif,
    bisaGenerate,
    gambarPratinjau,
    hasil,
    progres,
    galatBuat,
    setGalatBuat,
    buat,
    batalkan,
    unduhZip,
    mengepak,
    galatSunting,
    setGalatSunting,
    menyunting,
    kunciItem,
    kunciSemuaItem,
    gantiTrait,
    kerUlang,
    buangItem,
    nomoriUlang,
    memulihkan,
    adaSimpanan,
    tersimpanPada,
    galatSimpan,
    mulaiBaru,
  } = useGenerator();

  const [namaLayerBaru, setNamaLayerBaru] = useState("");
  const kotakNamaRef = useRef<HTMLInputElement>(null);

  /**
   * Waktu penyimpanan terakhir, dalam format jam setempat.
   *
   * Dihitung di sini, bukan di dalam terjemahan, supaya formatnya mengikuti
   * bahasa perangkat — bukan dipaksa berbahasa Inggris.
   */
  const catatanSimpanan = tersimpanPada
    ? new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit" }).format(
        tersimpanPada,
      )
    : "";

  const tambahLayer = () => {
    const nama = namaLayerBaru.trim();
    void buatLayerDenganBerkas(nama, []);
    setNamaLayerBaru("");
  };

  /** Jumlah trait aktif per layer — untuk menghitung kombinasi yang mungkin. */
  const traitPerLayer = keadaan.layers.map(
    (layer) => layer.traits.filter((tr) => !tr.excluded && tr.weight > 0).length,
  );

  /** Mengunduh satu item hasil sebagai PNG, memakai nama NFT-nya. */
  const unduhItem = (indeks: number) => {
    const h = hasil?.item.find((x) => x.item.indeks === indeks);
    if (!h) return;
    unduhBlob(h.blob, `${namaBerkasAman(h.item.nama)}.png`);
  };

  // Daftar layer ditampilkan dari yang paling depan (indeks data terbesar) ke
  // yang paling belakang, meniru alat desain: atas = depan.
  const layerTerurut = [...keadaan.layers].reverse();
  const adaIsi = traitAktif.some((daftar) => daftar.length > 0);

  return (
    <HalamanBerlatar>
      {/* ── 1. KEPALA ───────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden border-b border-border">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 opacity-[0.16]">
          <div className="absolute -right-1/4 top-0 h-full w-1/2 -rotate-12 bg-linear-to-l from-void-red to-transparent" />
        </div>

        <div className="relative mx-auto max-w-7xl px-5 pb-8 pt-10">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div className="max-w-2xl">
              <p className="kicker">
                <span className="kicker-garis" aria-hidden="true" />
                {t("page.generate.kicker")}
              </p>

              <h1 className="judul-halaman mt-4">
                {t("page.generate.title")}
              </h1>

              <p className="mt-3 leading-relaxed text-fg-muted">{t("page.generate.lead")}</p>

              <p className="mt-4 inline-flex items-center gap-2 rounded-lg border border-border px-3 py-1.5 text-xs text-fg-muted">
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0 fill-current text-void-red" aria-hidden="true">
                  <path d="M12 2a5 5 0 0 0-5 5v3H6a2 2 0 0 0-2 2v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8a2 2 0 0 0-2-2h-1V7a5 5 0 0 0-5-5Zm-3 8V7a3 3 0 1 1 6 0v3H9Z" />
                </svg>
                {t("page.generate.privacy")}
              </p>

              {/* Status penyimpanan. Dinyatakan terang bahwa proyek bertahan,
                  karena itu pertanyaan pertama setiap orang yang sudah
                  mengerjakan susunan layer selama sepuluh menit. */}
              {!memulihkan && adaSimpanan && (
                <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-fg-muted">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-void-red" aria-hidden="true" />
                    {catatanSimpanan
                      ? t("page.generate.savedAt", { waktu: catatanSimpanan })
                      : t("page.generate.saved")}
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      if (window.confirm(t("page.generate.startNewConfirm"))) void mulaiBaru();
                    }}
                    className="underline decoration-border underline-offset-2 transition-colors hover:text-void-red"
                  >
                    {t("page.generate.startNew")}
                  </button>
                </p>
              )}

              {memulihkan && (
                <p className="mt-2 text-[11px] text-fg-muted">{t("page.generate.restoring")}</p>
              )}

              {galatSimpan && (
                <p
                  role="alert"
                  className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[11px] text-void-red"
                >
                  <svg
                    viewBox="0 0 24 24"
                    className="h-3.5 w-3.5 shrink-0 fill-none stroke-current"
                    strokeWidth="2"
                    strokeLinecap="round"
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 8v4M12 16h.01" />
                  </svg>
                  {t("page.generate.saveFailed")}
                </p>
              )}
            </div>

            <label className="flex w-full max-w-xs flex-col gap-1.5">
              <span className="text-[11px] font-medium uppercase tracking-wider text-fg-muted">
                {t("page.generator.projectName")}
              </span>
              <input
                value={keadaan.projectName}
                onChange={(e) => dispatch({ jenis: "gantiNamaProyek", nama: e.target.value })}
                placeholder={t("page.generator.projectNamePlaceholder")}
                className="rounded-lg border border-border bg-surface px-3 py-2 text-sm text-fg outline-none transition-colors placeholder:text-fg-muted/60 focus:border-accent"
              />
            </label>
          </div>
        </div>
      </section>

      {/* ── 2. ALAT ─────────────────────────────────────────────────────── */}
      <div className="mx-auto grid max-w-7xl gap-6 px-5 py-8 lg:grid-cols-[minmax(0,1fr)_360px]">
        {/* Kolom kiri — daftar layer */}
        <div className="flex min-w-0 flex-col gap-4">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 className="font-display text-lg font-semibold tracking-tight">
                {t("page.generator.layersTitle")}
              </h2>
              <p className="mt-0.5 text-xs text-fg-muted">{t("page.generator.layersHint")}</p>
            </div>

            <span className="shrink-0 font-display text-2xl font-bold leading-none text-void-red tabular-nums">
              {String(keadaan.layers.length).padStart(2, "0")}
            </span>
          </div>

          {galat && (
            <div className="flex items-start gap-2.5 rounded-lg border border-accent/40 bg-accent-soft px-3 py-2.5">
              <span className="mt-0.5 text-xs leading-relaxed text-fg">{galat}</span>
              <button
                type="button"
                onClick={() => setGalat(null)}
                aria-label={t("page.generator.dismiss")}
                className="ml-auto grid h-5 w-5 shrink-0 place-items-center rounded text-fg-muted hover:text-fg"
              >
                <svg viewBox="0 0 24 24" className="h-3 w-3 fill-none stroke-current" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                  <path d="M6 6l12 12M18 6L6 18" />
                </svg>
              </button>
            </div>
          )}

          {keadaan.layers.length === 0 ? (
            <EmptyStart
              onPilihBerkas={(berkas) => void unggahBerkas(berkas)}
              onMuatContoh={() => {
                if (adaSimpanan) {
                  if (!window.confirm(t("page.generate.startNewConfirm"))) return;
                }
                void mulaiBaru().then(() => muatContoh());
              }}
              onMulaiManual={() => kotakNamaRef.current?.focus()}
              memuatContoh={memuatContoh}
            />
          ) : (
            <div className="flex flex-col gap-2.5">
              {layerTerurut.map((layer, posisiTampil) => {
                const indeksAsli = keadaan.layers.length - 1 - posisiTampil;

                return (
                  <LayerCard
                    key={layer.id}
                    layer={layer}
                    indeks={indeksAsli}
                    totalLayer={keadaan.layers.length}
                    palingDepan={indeksAsli === keadaan.layers.length - 1}
                    onGantiNama={(nama) => dispatch({ jenis: "gantiNamaLayer", layerId: layer.id, nama })}
                    onHapus={() => hapusLayer(layer.id)}
                    onPindah={(arah) =>
                      dispatch({ jenis: "pindahkanLayer", dari: indeksAsli, ke: indeksAsli + arah })
                    }
                    onTambahBerkas={async (berkas) => {
                      await tambahTrait(layer.id, berkas);
                    }}
                    onGantiNamaTrait={(traitId, nama) =>
                      dispatch({ jenis: "gantiNamaTrait", layerId: layer.id, traitId, nama })
                    }
                    onUbahBobot={(traitId, bobot) =>
                      dispatch({ jenis: "ubahBobotTrait", layerId: layer.id, traitId, bobot })
                    }
                    onBolakBalikTrait={(traitId) =>
                      dispatch({ jenis: "bolakBalikTrait", layerId: layer.id, traitId })
                    }
                    onHapusTrait={(traitId) => hapusTrait(layer.id, traitId)}
                  />
                );
              })}
            </div>
          )}

          <div className="flex gap-2">
            <input
              ref={kotakNamaRef}
              value={namaLayerBaru}
              onChange={(e) => setNamaLayerBaru(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") tambahLayer();
              }}
              placeholder={t("page.generator.newLayerName")}
              aria-label={t("page.generator.newLayerName")}
              className="min-w-0 flex-1 rounded-lg border border-border bg-surface px-3 py-2.5 text-sm text-fg outline-none transition-colors placeholder:text-fg-muted/60 focus:border-accent"
            />
            <button
              type="button"
              onClick={tambahLayer}
              className="inline-flex shrink-0 items-center gap-1.5 rounded-lg bg-void-red px-4 py-2.5 text-sm font-semibold text-void-white transition-colors hover:bg-void-red-deep"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                <path d="M12 5v14M5 12h14" />
              </svg>
              {t("page.generate.addLayer")}
            </button>
          </div>
        </div>

        {/* Kolom kanan — pratinjau + pengaturan, melekat saat digulir */}
        <aside className="flex min-w-0 flex-col gap-4 lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-xl bg-panel p-3 shadow-brand-lg">
            <PreviewCanvas gambar={gambarPratinjau} versi={versiAset} adaIsi={adaIsi} />
          </div>

          <CollectionSettingsPanel
            pengaturan={keadaan.settings}
            traitPerLayer={traitPerLayer}
            onUbah={(perubahan) => dispatch({ jenis: "ubahPengaturan", perubahan })}
          />

          {/* Tombol generate. Tiga keadaan dibedakan: belum siap (redup),
              sedang berjalan (progres langsung di tombol), dan siap (merah
              penuh). Progres ditaruh di dalam tombol supaya mata tidak perlu
              mencari tempat lain saat prosesnya panjang. */}
          <div>
            <button
              type="button"
              onClick={() => void buat()}
              disabled={!bisaGenerate || progres !== null}
              title={bisaGenerate ? undefined : t("page.generate.blocked")}
              className={`w-full rounded-xl bg-void-red px-5 py-3 text-sm font-semibold text-void-white transition-colors ${
                !bisaGenerate
                  ? "cursor-not-allowed opacity-40"
                  : progres
                    ? "cursor-progress opacity-80"
                    : "hover:bg-void-red-deep"
              }`}
            >
              {progres
                ? t("page.generate.generating", {
                    selesai: String(progres.selesai),
                    total: String(progres.total),
                  })
                : t("page.generate.build")}
            </button>

            {/* Bilah progres tipis di bawah tombol. Angka saja terasa diam;
                bilah yang bergerak memberi tahu bahwa pekerjaan berjalan. */}
            {progres && (
              <div
                className="mt-2 h-1 overflow-hidden rounded-full bg-border"
                role="progressbar"
                aria-valuemin={0}
                aria-valuemax={progres.total}
                aria-valuenow={progres.selesai}
              >
                <div
                  className="h-full bg-void-red transition-[width] duration-150"
                  style={{ width: `${(progres.selesai / progres.total) * 100}%` }}
                />
              </div>
            )}

            {progres && (
              <button
                type="button"
                onClick={batalkan}
                className="mt-2 w-full rounded-lg border border-border px-3 py-2 text-xs font-medium text-fg-muted transition-colors hover:border-void-red hover:text-void-red"
              >
                {t("page.generate.cancel")}
              </button>
            )}

            {!bisaGenerate && (
              <p className="mt-2 text-center text-[11px] leading-relaxed text-fg-muted">
                {t("page.generate.blocked")}
              </p>
            )}

            {galatBuat && (
              <div className="mt-2 flex items-start gap-2 rounded-lg border border-accent/40 bg-accent-soft px-3 py-2">
                <p className="text-[11px] leading-relaxed text-fg">
                  {galatBuat.jenis === "kombinasiKurang"
                    ? t("page.generator.errors.notEnough", {
                        tersedia: new Intl.NumberFormat().format(galatBuat.tersedia),
                        diminta: new Intl.NumberFormat().format(galatBuat.diminta),
                      })
                    : galatBuat.jenis === "tidakAdaGambar"
                      ? t("page.generator.errors.missingFiles", { nama: galatBuat.nama.join(", ") })
                      : galatBuat.pesan === "dibatalkan"
                        ? t("page.generate.cancelled")
                        : t("page.generator.errors.failed", { pesan: galatBuat.pesan })}
                </p>
                <button
                  type="button"
                  onClick={() => setGalatBuat(null)}
                  aria-label={t("page.generator.dismiss")}
                  className="ml-auto grid h-5 w-5 shrink-0 place-items-center rounded text-fg-muted hover:text-fg"
                >
                  <svg viewBox="0 0 24 24" className="h-3 w-3 fill-none stroke-current" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </aside>
      </div>

      {/* ── 2b. HASIL ────────────────────────────────────────────────────────
          Muncul hanya setelah ada koleksi. Ditaruh tepat di bawah alat supaya
          hasil generate berada di tempat mata sudah berada — pengunjung tidak
          perlu mencari ke bawah halaman. */}
      {hasil && (
        <section className="border-t border-border">
          <div className="mx-auto max-w-7xl px-5 py-10">
            <ResultGrid
              hasil={hasil}
              layers={keadaan.layers}
              menyunting={menyunting}
              onUnduh={unduhItem}
              onUnduhZip={() => void unduhZip()}
              mengepak={mengepak}
              onKunci={kunciItem}
              onKunciSemua={kunciSemuaItem}
              onGantiTrait={(indeks, layerId, traitId) => {
                const trait = keadaan.layers
                  .find((l) => l.id === layerId)
                  ?.traits.find((tr) => tr.id === traitId);
                if (trait) void gantiTrait(indeks, layerId, trait);
              }}
              onKerUlang={(indeks) => void kerUlang(indeks)}
              onBuang={(indeks) => void buangItem(indeks)}
              onNomoriUlang={nomoriUlang}
            />

            {/* Penolakan penyuntingan: kembar, terkunci, atau kombinasi habis.
                Ditolak berarti TIDAK ada yang berubah — dinyatakan terang
                supaya pengunjung tidak mengira itemnya setengah jadi. */}
            {galatSunting && (
              <div className="mt-3 flex items-start gap-2 rounded-lg border border-accent/40 bg-accent-soft px-3 py-2">
                <p className="text-[11px] leading-relaxed text-fg">
                  {galatSunting === "kembar"
                    ? t("page.generator.results.errDuplicate")
                    : galatSunting === "terkunci"
                      ? t("page.generator.results.errLocked")
                      : galatSunting === "kombinasiHabis"
                        ? t("page.generator.results.errExhausted")
                        : t("page.generator.results.errMissing")}
                </p>
                <button
                  type="button"
                  onClick={() => setGalatSunting(null)}
                  aria-label={t("page.generator.dismiss")}
                  className="ml-auto grid h-5 w-5 shrink-0 place-items-center rounded text-fg-muted hover:text-fg"
                >
                  <svg viewBox="0 0 24 24" className="h-3 w-3 fill-none stroke-current" strokeWidth="2.5" strokeLinecap="round" aria-hidden="true">
                    <path d="M6 6l12 12M18 6L6 18" />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </section>
      )}

      {/* ── 3. CARA PAKAI ───────────────────────────────────────────────── */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-7xl px-5 py-14">
          <header className="max-w-2xl">
            <p className="kicker">
              <span className="kicker-garis" aria-hidden="true" />
              {t("page.generate.flow.kicker")}
            </p>
            <h2 className="judul-bagian mt-4">
              {t("page.generate.flow.title")}
            </h2>
          </header>

          <ol className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {(["upload", "order", "rarity", "build"] as const).map((langkah, i) => (
              <li
                key={langkah}
                className="rounded-xl border border-border bg-surface p-5 transition-colors hover:border-accent/60"
              >
                <span className="font-display text-2xl font-bold leading-none text-void-red">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="mt-3 font-display text-sm font-semibold tracking-tight">
                  {t(`page.generate.steps.${langkah}.title`)}
                </h3>
                <p className="mt-1.5 text-xs leading-relaxed text-fg-muted">
                  {t(`page.generate.steps.${langkah}.body`)}
                </p>
              </li>
            ))}
          </ol>

          <div className="mt-10 grid gap-3 lg:grid-cols-2">
            <Lipatan judul={t("page.generate.details.orderTitle")}>
              {t("page.generate.details.orderBody")}
            </Lipatan>
            <Lipatan judul={t("page.generate.details.filesTitle")}>
              {t("page.generate.details.filesBody")}
            </Lipatan>
          </div>
        </div>
      </section>

      {/* ── 4. PENUTUP ──────────────────────────────────────────────────── */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-7xl px-5 py-12 text-center">
          <p className="font-display text-xl font-bold tracking-tight sm:text-2xl">
            {t("page.generate.closingTitle")}
          </p>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-relaxed text-fg-muted">
            {t("page.generate.closingBody")}
          </p>
          <Link to="/collection" className="tombol tombol-garis mt-6">
            {t("page.generate.ctaExample")}
          </Link>
        </div>
      </section>
    </HalamanBerlatar>
  );
}

/** Satu butir penjelasan yang bisa dibuka-tutup. */
function Lipatan({ judul, children }: { judul: string; children: string }) {
  const [buka, setBuka] = useState(false);

  return (
    <div className="overflow-hidden rounded-xl border border-border bg-surface">
      <button
        type="button"
        onClick={() => setBuka((v) => !v)}
        aria-expanded={buka}
        className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition-colors hover:bg-surface-hover"
      >
        <span className="text-sm font-medium text-fg">{judul}</span>
        <svg
          viewBox="0 0 24 24"
          className={`h-3.5 w-3.5 shrink-0 fill-none stroke-fg-muted transition-transform ${buka ? "rotate-180" : ""}`}
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <path d="m6 9 6 6 6-6" />
        </svg>
      </button>
      {buka && (
        <p className="border-t border-border px-4 py-3 text-xs leading-relaxed text-fg-muted">
          {children}
        </p>
      )}
    </div>
  );
}
