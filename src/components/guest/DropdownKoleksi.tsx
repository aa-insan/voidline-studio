/* =============================================================================
   DROPDOWN KOLEKSI — MENU BAYANGAN CUSTOM

   Kenapa tidak <select> asli? Dropdown asli dirender oleh sistem operasi,
   bukan oleh halaman: warna sorotnya biru bawaan OS dan tidak bisa dipaksa
   jadi merah di semua peramban. Menu buatan sendiri memakai warna, ikon, dan
   gerak yang sama dengan seluruh situs.

   ── AKSESIBILITAS ───────────────────────────────────────────────────────────
   Pola "tombol + listbox" dari WAI-ARIA:
   - tombol punya aria-haspopup dan aria-expanded, pembaca layar tahu ini menu;
   - daftar memakai role="listbox", opsi memakai role="option" + aria-selected;
   - panah atas/bawah memindah sorotan, Enter memilih, Esc menutup;
   - klik di luar menutup menu.

   ── SOAL API ────────────────────────────────────────────────────────────────
   Komponen ini tidak memanggil API apa pun. Isinya hanya enam label yang sudah
   ada di data karya. Membuatnya custom tidak mengubah satu pun permintaan ke
   ledger.
   ============================================================================= */

import { useEffect, useRef, useState } from "react";

type Props = {
  /** Nilai yang sedang dipilih. */
  nilai: string;
  /** Dipanggil saat pengunjung memilih opsi. */
  ganti: (nilai: string) => void;
  opsi: readonly { nilai: string; label: string }[];
  /** Label untuk pembaca layar. */
  label: string;
};

export default function DropdownKoleksi({ nilai, ganti, opsi, label }: Props) {
  const [terbuka, setTerbuka] = useState(false);
  // Opsi yang disorot keyboard — bukan yang terpilih. Dua keadaan berbeda:
  // panah memindahkan sorotan tanpa langsung mengganti nilai.
  const [sorot, setSorot] = useState(-1);
  const wadah = useRef<HTMLDivElement>(null);
  const tombol = useRef<HTMLButtonElement>(null);

  const indeksTerpilih = opsi.findIndex((o) => o.nilai === nilai);
  const aktif = indeksTerpilih >= 0 ? opsi[indeksTerpilih] : undefined;

  useEffect(() => {
    if (!terbuka) return;

    const klikLuar = (e: PointerEvent) => {
      if (!wadah.current?.contains(e.target as Node)) setTerbuka(false);
    };

    window.addEventListener("pointerdown", klikLuar);
    return () => window.removeEventListener("pointerdown", klikLuar);
  }, [terbuka]);

  const tutup = (kembalikanFokus: boolean) => {
    setTerbuka(false);
    setSorot(-1);
    if (kembalikanFokus) tombol.current?.focus();
  };

  const pilih = (nilaiBaru: string) => {
    ganti(nilaiBaru);
    tutup(true);
  };

  /** Membuka menu dengan sorotan di opsi yang sekarang terpilih. */
  const buka = () => {
    setTerbuka(true);
    setSorot(indeksTerpilih);
  };

  const tekanTombol = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
      e.preventDefault();
      if (!terbuka) {
        buka();
        return;
      }
      setSorot((i) => {
        const awal = i < 0 ? indeksTerpilih : i;
        const langkah = e.key === "ArrowDown" ? 1 : -1;
        return (awal + langkah + opsi.length) % opsi.length;
      });
      return;
    }
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (terbuka && sorot >= 0) pilih(opsi[sorot].nilai);
      else if (terbuka) tutup(true);
      else buka();
      return;
    }
    if (e.key === "Escape" && terbuka) {
      e.preventDefault();
      tutup(true);
    }
    if (e.key === "Tab") setTerbuka(false);
  };

  return (
    <div ref={wadah} className="relative w-full sm:w-64">
      <button
        ref={tombol}
        type="button"
        onClick={() => (terbuka ? tutup(true) : buka())}
        onKeyDown={tekanTombol}
        aria-haspopup="listbox"
        aria-expanded={terbuka}
        aria-label={`${label}: ${aktif?.label ?? ""}`}
        className="flex w-full items-center justify-between gap-2 rounded-xl border border-border bg-surface px-4 py-2.5 text-left text-sm font-medium text-fg outline-none transition-colors hover:border-border-strong focus:border-accent focus:bg-surface-hover"
      >
        <span className="truncate">{aktif?.label}</span>
        <svg
          viewBox="0 0 24 24"
          className={`h-4 w-4 shrink-0 fill-current text-fg-muted transition-transform ${
            terbuka ? "rotate-180" : ""
          }`}
          aria-hidden="true"
        >
          <path d="M12 15.5 5.5 9h13L12 15.5Z" />
        </svg>
      </button>

      {terbuka && (
        <ul
          role="listbox"
          aria-label={label}
          className="absolute left-0 right-0 top-full z-30 mt-2 max-h-72 overflow-y-auto rounded-xl border border-border bg-void-black p-1 shadow-brand-lg"
        >
          {opsi.map((o, i) => {
            const terpilih = o.nilai === nilai;
            return (
              <li
                key={o.nilai}
                role="option"
                aria-selected={terpilih}
                // pointerdown, bukan click: sorotan keyboard memakai ref yang
                // sama, dan click pada li bisa didahului penutupan oleh
                // pointerdown di luar bila wadahnya sempat berubah.
                onPointerDown={(e) => {
                  e.preventDefault();
                  pilih(o.nilai);
                }}
                onPointerEnter={() => setSorot(i)}
                className={`flex cursor-pointer items-center justify-between gap-2 rounded-lg px-3 py-2 text-sm ${
                  sorot === i || terpilih
                    ? "bg-accent text-accent-fg"
                    : "text-fg hover:bg-accent hover:text-accent-fg"
                }`}
              >
                <span className="truncate">{o.label}</span>
                {terpilih && (
                  <svg
                    viewBox="0 0 24 24"
                    className="h-4 w-4 shrink-0 fill-current"
                    aria-hidden="true"
                  >
                    <path d="M9.55 17.6 4 12.05l1.4-1.4 4.15 4.15L18.6 5.7l1.4 1.4-10.45 10.5Z" />
                  </svg>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
