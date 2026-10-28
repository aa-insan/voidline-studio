#!/usr/bin/env python3
"""Buat public/og-image.png (1200×630) — kartu pratinjau tautan.

Kenapa harus lewat skrip: judul dan deskripsi di pratinjau aplikasi chat
(WhatsApp, Discord, Telegram) TIDAK diambil dari HTML React — mereka hanya
membaca <meta> di index.html DAN piksel di dalam gambar ini. Saat brand
berganti nama, gambar inilah yang paling mudah tertinggal versi lama.

Alur: HTML kecil ditulis ke berkas sementara, dirender headless Chrome,
lalu hasilnya ditulis ke public/og-image.png. Vite menyalinnya ke dist/.

Pemakaian:
    python3 scripts/buat-og.py

Prasyarat:
    - google-chrome (atau CHROME_PATH)
    - koneksi internet sekali untuk mengunduh font Cinzel & Marcellus
      (disimpan di ~/.fonts supaya render berikutnya tetap konsisten)

Jangan mengedit og-image.png secara manual: jalankan skrip ini, lalu commit
hasilnya. Isi teks ada di konstanta di bawah.
"""

from __future__ import annotations

import os
import shutil
import subprocess
import sys
import tempfile
import urllib.request
from pathlib import Path

# ── Isi kartu ────────────────────────────────────────────────────────────────
KICKER = "INDEPENDENT ART STUDIO"
JUDUL_BARIS_1 = "Voidline"
JUDUL_BARIS_2 = "Island"
SUB_BARIS_1 = "Hand-drawn NFT collections"
SUB_BARIS_2 = "on the XRP Ledger."

# ── Rupa ─────────────────────────────────────────────────────────────────────
LATAR = "#0a0a0b"
PUTIH = "#ffffff"
ABU = "#b9b9bf"
MERAH = "#e11d2e"
GARIS = "#2a2a2d"

LEBAR, TINGGI = 1200, 630

AKAR = Path(__file__).resolve().parent.parent
KELUARAN = AKAR / "public" / "og-image.png"
LOGO = AKAR / "src" / "assets" / "Logo.gif"

# Font diunduh sekali, lalu dipasang di fontconfig pengguna.
FONT = {
    "cinzel.ttf": "https://fonts.gstatic.com/s/cinzel/v26/8vIU7ww63mVu7gtR-kwKxNvkNOjw-jHgTYo.ttf",
    "marcellus.ttf": "https://fonts.gstatic.com/s/marcellus/v14/wEO_EBrOk8hQLDvIAF8FUQ.ttf",
}

TEMPLATE = f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<style>
  * {{ margin:0; padding:0; box-sizing:border-box; }}
  html, body {{ width:{LEBAR}px; height:{TINGGI}px; overflow:hidden; }}
  body {{ background:{LATAR}; color:{PUTIH}; position:relative; }}
  .garis {{ position:absolute; left:80px; right:80px; height:1px; background:{GARIS}; }}
  .atas {{ top:64px; }}
  .bawah {{ bottom:64px; }}
  .kiri {{ position:absolute; left:96px; top:150px; }}
  .kicker {{
    font-family:'Cinzel', Georgia, serif; font-size:19px; letter-spacing:0.32em;
    text-transform:uppercase; color:{MERAH}; margin-bottom:24px;
  }}
  .judul {{
    font-family:'Cinzel', Georgia, serif; font-weight:700;
    font-size:96px; line-height:1.02; letter-spacing:0.01em;
  }}
  .sub {{
    margin-top:34px; font-family:'Marcellus', Georgia, serif;
    font-size:30px; line-height:1.35; color:{ABU}; letter-spacing:0.02em;
  }}
  .kanan {{ position:absolute; right:96px; top:158px; width:330px; }}
  .kanan img {{ width:100%; display:block; }}
</style>
</head>
<body>
  <div class="garis atas"></div>
  <div class="garis bawah"></div>
  <div class="kiri">
    <div class="kicker">{KICKER}</div>
    <div class="judul">{JUDUL_BARIS_1}<br>{JUDUL_BARIS_2}</div>
    <div class="sub">{SUB_BARIS_1}<br>{SUB_BARIS_2}</div>
  </div>
  <div class="kanan"><img src="file://{LOGO}" alt=""></div>
</body>
</html>
"""


def chrome() -> str:
    """Cari peramban headless yang tersedia."""
    for nama in (
        os.environ.get("CHROME_PATH"),
        "google-chrome",
        "google-chrome-stable",
        "chromium",
        "chromium-browser",
    ):
        if nama and shutil.which(nama):
            return shutil.which(nama)
    sys.exit("google-chrome tidak ditemukan. Pasang Chrome, atau set CHROME_PATH.")


def pasang_font() -> None:
    """Unduh font bila belum ada, lalu daftarkan ke fontconfig."""
    tujuan = Path.home() / ".fonts"
    tujuan.mkdir(parents=True, exist_ok=True)
    baru = False

    for nama, url in FONT.items():
        berkas = tujuan / nama
        if berkas.exists():
            continue
        print(f"mengunduh {nama} …")
        try:
            with urllib.request.urlopen(url, timeout=30) as r:
                berkas.write_bytes(r.read())
            baru = True
        except OSError as e:
            sys.exit(f"gagal mengunduh {nama}: {e}")

    if baru and shutil.which("fc-cache"):
        subprocess.run(["fc-cache", "-f", str(tujuan)], check=False)

    if not shutil.which("fc-list"):
        return

    ada = subprocess.run(
        ["fc-list"], capture_output=True, text=True, check=False
    ).stdout.lower()
    if "cinzel" not in ada or "marcellus" not in ada:
        sys.exit(
            "Font Cinzel/Marcellus tidak terbaca fontconfig. "
            "Salin manual ke ~/.fonts lalu jalankan fc-cache -f."
        )


def render() -> None:
    """Render HTML sementara → PNG tujuan."""
    if not LOGO.exists():
        sys.exit(f"logo tidak ditemukan: {LOGO}")

    with tempfile.TemporaryDirectory() as tmp:
        html = Path(tmp) / "og.html"
        png = Path(tmp) / "og.png"
        html.write_text(TEMPLATE, encoding="utf-8")

        hasil = subprocess.run(
            [
                chrome(),
                "--headless=new",
                "--disable-gpu",
                "--no-sandbox",
                "--hide-scrollbars",
                "--force-device-scale-factor=1",
                f"--window-size={LEBAR},{TINGGI}",
                f"--screenshot={png}",
                "--virtual-time-budget=15000",  # beri waktu GIF termuat
                f"file://{html}",
            ],
            capture_output=True,
            text=True,
        )
        if not png.exists():
            sys.exit(f"render gagal:\n{hasil.stderr[-800:]}")

        KELUARAN.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(png, KELUARAN)

    # Sanity check: dimensi harus tepat.
    try:
        from PIL import Image  # type: ignore

        with Image.open(KELUARAN) as im:
            if im.size != (LEBAR, TINGGI):
                sys.exit(f"dimensi salah: {im.size}, harus {(LEBAR, TINGGI)}")
    except ImportError:
        pass

    print(f"ok: {KELUARAN.relative_to(AKAR)} ({KELUARAN.stat().st_size:,} byte)")


if __name__ == "__main__":
    pasang_font()
    render()
