#!/usr/bin/env python3
# =============================================================================
# TARIK KARYA — MEMPERBARUI DATA KARYA DARI LEDGER
#
# Jalankan dengan:  npm run tarik-karya
# Atau dari Python: python3 scripts/tarik-karya.py
#
# ── CARA KERJANYA ───────────────────────────────────────────────────────────
# 1. Mengambil daftar semua NFT yang diterbitkan wallet studio dari ledger
#    publik xrplcluster.com (CORS terbuka). Ini mencakup karya baru yang baru
#    saja di-mint.
# 2. Membandingkan dengan data yang sudah ada di src/data/karyaNft.ts. NFT
#    baru (yang ID-nya belum ada di data) ditandai.
# 3. Untuk NFT baru, mengambil metadata dari IPFS. Kalau IPFS gagal, NFT-nya
#    tetap ditambahkan dengan judul "#<nomor>" seperti karya tanpa nama lain.
# 4. Menulis ulang src/data/karyaNft.ts dan src/data/karyaDetail.ts.
#
# ── CARA MENAMBAHKAN KARYA BARU ─────────────────────────────────────────────
# xrp.cafe mint → karya baru masuk ledger → jalankan skrip ini → push ke git
# → Vercel build ulang → grid otomatis menampilkan karya baru.
#
# ── MENJADIKAN OTOMATIS ─────────────────────────────────────────────────────
# Aktifkan GitHub Actions (workflow sudah dibuat di .github/workflows/tarik.yml).
# Rilis terbaru secara otomatis terlihat tanpa perlu push manual.
# =============================================================================

import json, re, sys, time, urllib.request
from pathlib import Path

# ── KONFIGURASI ──────────────────────────────────────────────────────────────
DIR   = Path(__file__).parent.parent          # /vs-fe
NODE  = "https://s2.ripple.com:51234"         # server-side; CORS tidak relevan di luar peramban
NODE_CADANGAN = "https://xrplcluster.com"
WALLET = "rf1tpdoihWP6RrdmMU9QPWBp9yXMSX8BMi"
GWS    = [
    "https://ipfs.filebase.io/ipfs",
    "https://gateway.pinata.cloud/ipfs",
    "https://ipfs.io/ipfs",
]
UA = {"User-Agent": "Mozilla/5.0", "Accept": "application/json"}
BATAS_DETIK = 12     # batas tunggu tiap permintaan IPFS
BATAS_RPC   = 20_000 # batas tunggu ledger (ms)

KODE  = {3: "apid", 9: "favo", 111: "javo", 1: "neo", 2: "lepas", 5: "puko"}
URUTAN = [3, 9, 111, 1, 2, 5]

# ── LEDGER ───────────────────────────────────────────────────────────────────
def rpc(method, params):
    """Memanggil node ledger dengan batas waktu. Node utama gagal → cadangan."""
    isi = json.dumps({"method": method, "params": [params]}).encode()
    terakhir = None
    for node in (NODE, NODE_CADANGAN):
        try:
            req = urllib.request.Request(node, data=isi, headers={"Content-Type": "application/json"})
            with urllib.request.urlopen(req, timeout=BATAS_RPC / 1000) as r:
                return json.loads(r.read())["result"]
        except Exception as e:
            terakhir = e
            print(f"  {node} gagal ({e}), mencoba cadangan…", flush=True)
    raise RuntimeError(f"Semua node gagal: {terakhir}")

def semua_ledger(method, key):
    """Mengambil semua baris dari ledger, mengikuti pagination."""
    terkumpul, marker = [], None
    for _ in range(20):
        p = {"issuer": WALLET, "ledger_index": "validated", "limit": 400} if method == "nfts_by_issuer" else {"account": WALLET, "ledger_index": "validated", "limit": 400}
        if marker: p["marker"] = marker
        hasil = rpc(method, p)
        terkumpul.extend(hasil.get(key, []))
        marker = hasil.get("marker")
        if not marker: break
    return terkumpul

# ── IPFS ─────────────────────────────────────────────────────────────────────
def ambil_ipfs(uri):
    """Mengambil metadata NFT dari IPFS. Dicoba tiga gateway berurutan."""
    if not uri.startswith("ipfs://"):
        return {}
    path = uri[7:]
    for i, gw in enumerate(GWS):
        try:
            req = urllib.request.Request(f"{gw}/{path}", headers=UA)
            with urllib.request.urlopen(req, timeout=BATAS_DETIK) as r:
                return json.loads(r.read())
        except Exception:
            time.sleep(0.5 * (i + 1))
    return {}

# ── BANTUAN ──────────────────────────────────────────────────────────────────
def nomor_edisi(nama):
    m = re.search(r"#\s*(\d+)\s*$", (nama or "").strip())
    return int(m.group(1)) if m else None

def judul_karya(nama, nomor):
    nama = (nama or "").strip()
    if not nama: return f"#{nomor}"
    if re.fullmatch(r"#\s*\d+", nama): return f"#{nomor}"
    return nama

def buka_escape(teks):
    """Kembalikan string TS ter-escape menjadi teks mentah.

    File menyimpan `\\"`, `\\\\`, `\\n`. Pembacaan mengembalikannya ke `"`, `\\`,
    dan newline sungguhan — lalu penulisan meng-escape sekali lagi. Dengan
    begitu nilai tidak menumpuk backslash setiap kali skrip dijalankan.
    """
    return re.sub(r'\\(["\\nrt])', lambda m: {"n": "\n", "r": "\r", "t": "\t"}.get(m.group(1), m.group(1)), teks or "")

def tulis_escape(teks):
    """Ubah teks mentah menjadi string TS yang aman dikutip ganda.

    Urutan penting: backslash dulu, baru kutip. Hasil untuk teks `a"b` adalah
    `a\\"b` di dalam file — satu lapis escape, persis seperti yang dibaca TS.
    """
    return (teks or "").replace("\\", "\\\\").replace('"', '\\"')

# ── AMBIL SEMUA NFT DARI LEDGER ──────────────────────────────────────────────
print("Mengambil NFT dari ledger…")
terbit = semua_ledger("nfts_by_issuer", "nfts")
print(f"  {len(terbit)} NFT diterbitkan wallet studio")

# s2.ripple.com mengirim URI sebagai hex — balikkan ke teks biasa.
for n in terbit:
    u = n.get("uri", "")
    if u and not u.startswith("ipfs://"):
        try: n["uri"] = bytes.fromhex(u).decode("utf-8", "replace")
        except ValueError: pass

# urut berdasarkan nomor seri dalam taxon agar konsisten
terbit.sort(key=lambda n: (n.get("nft_taxon", 0), n.get("nft_seq", 0)))

# ── KOLEKSI BARU (TAXON DI LUAR DAFTAR) ────────────────────────────────────
# Taxon yang belum terdaftar di KODE dianggap koleksi terbaru (mis. rilis
# Mom Apes Voidline). Ia tetap ikut ditarik dan ditulis ke grup "baru" di
# karyaNft.ts, sehingga halaman /new-collection menampilkannya tanpa
# perlu mengubah kode. Setelah koleksi lama bernama, tambahkan taxon-nya
# ke KODE dan URUTAN di atas.
TAXON_KENAL = set(URUTAN)

# muat data lama
META_PATH = DIR / "src/data/karyaDetail.ts"
DATA_PATH = DIR / "src/data/karyaNft.ts"
CACHE = DIR / "scripts/.cache-metadata.json"

# muat metadata lama dari json (lebih cepat) kalau ada
md_lama = {}
if CACHE.exists():
    md_lama = json.load(open(CACHE))

# ── PERIKSA NFT BARU ─────────────────────────────────────────────────────────
def baca_id_meta(ts_path):
    """Membaca {NFTokenID -> metadata} dari karyaDetail.ts lama."""
    if not ts_path.exists(): return {}
    s = ts_path.read_text()
    ids = re.findall(r'"([0-9A-Fa-f]{64})": \{ attrs:', s)
    return {i: True for i in ids}

def baca_baris_lama(ts_path):
    """Membaca karyaNft.ts lama → {NFTokenID: {n, j, g, id}}.

    Dipakai sebagai jaring pengaman: saat cache metadata kosong (selalu begitu
    di runner CI), baris yang sudah benar di berkas lama dipakai kembali
    daripada ditimpa dengan "#None" dan gambar kosong.

    Penting: nilai dibaca dalam bentuk MENTAH (escape `\\"` dikembalikan jadi
    `"`). Penulisan nanti meng-escape sekali lagi. Kalau tidak, setiap tarikan
    menambah satu lapis backslash ke judul.
    """
    if not ts_path.exists(): return {}
    s = ts_path.read_text()
    hasil = {}
    for n, judul, gambar, nid in re.findall(
        r'^\s+\[(\d+), "((?:[^"\\]|\\.)*)", "((?:[^"\\]|\\.)*)", "([0-9A-Fa-f]{64})"\],$',
        s, re.M,
    ):
        hasil[nid] = {"n": int(n), "j": buka_escape(judul), "g": buka_escape(gambar), "id": nid}
    return hasil

def baca_detail_lama(ts_path):
    """Membaca karyaDetail.ts lama → {NFTokenID: (attrs, desc)} dalam bentuk mentah."""
    if not ts_path.exists(): return {}
    s = ts_path.read_text()
    hasil = {}
    for nid, isi, desc in re.findall(
        r'"([0-9A-Fa-f]{64})": \{ attrs: (\[.*?\]), desc: "((?:[^"\\]|\\.)*)" \}',
        s,
    ):
        try:
            attrs = json.loads(isi)
        except Exception:
            attrs = []
        hasil[nid] = (attrs, buka_escape(desc))
    return hasil

id_lama = baca_id_meta(META_PATH)
lama_per_id = baca_baris_lama(DATA_PATH)
detail_lama = baca_detail_lama(META_PATH)
baru = [n for n in terbit if n["nft_id"] not in id_lama]
print(f"  {len(baru)} NFT baru sejak terakhir")
if baru:
    print(f"  NFT baru: {[n['nft_id'][:16] for n in baru[:5]]}", end="")
    if len(baru) > 5: print(f" … +{len(baru)-5} lagi")
    else: print()
else:
    print("  Tidak ada NFT baru — data sudah terkini.")

# ── AMBIL METADATA NFT BARU ─────────────────────────────────────────────────
if baru:
    print("Mengambil metadata NFT baru dari IPFS…")
    berhasil, gagal = 0, []
    for i, n in enumerate(baru):
        uri  = n.get("uri", "")
        data = ambil_ipfs(uri)
        if isinstance(data, dict) and data:
            md_lama[n["nft_id"]] = data
            berhasil += 1
        else:
            gagal.append(n["nft_id"])
        time.sleep(0.15)
        if (i + 1) % 20 == 0:
            print(f"  {i+1}/{len(baru)}", flush=True)
    print(f"  {berhasil}/{len(baru)} metadata berhasil diambil")
    if gagal:
        print(f"  {len(gagal)} gagal (akan dicoba lagi di tarikan berikutnya)")
    # Cache hanya diperbarui kalau ada yang berhasil — jangan timpa cache bagus
    # dengan hasil kosong saat IPFS sedang tidak bisa diakses.
    if berhasil:
        CACHE.parent.mkdir(parents=True, exist_ok=True)
        json.dump(md_lama, open(CACHE, "w"))
        print(f"  Cache metadata disimpan ke {CACHE}")

# ── SUSUN SEMUA KARYA ────────────────────────────────────────────────────────
by_k = {}
for n in terbit:
    by_k.setdefault(n.get("nft_taxon", -1), []).append(n)

# Taxon yang belum dikenal digabung ke satu grup "baru", urut nomor seri.
baru_taxon = sorted(set(by_k) - TAXON_KENAL)
for t in baru_taxon:
    by_k["baru"] = by_k.get("baru", []) + by_k[t]
    del by_k[t]

# ── SUSUN SEMUA KARYA ────────────────────────────────────────────────────────
# Aturan penyusunan (penting, jangan disederhanakan):
#
#   1. Baris lama dari karyaNft.ts adalah SUMBER KEBENARAN untuk karya yang
#      sudah ada. Judul dan gambar yang sudah benar tidak boleh hilang.
#   2. Metadata IPFS hanya menimpa baris lama kalau isinya valid — punya nama
#      (atau nomor edisi) DAN punya gambar. Metadata kosong/gagal tidak pernah
#      menimpa apa pun.
#   3. NFT yang benar-benar baru (belum ada di karyaNft.ts) hanya ditulis kalau
#      metadatanya berhasil diambil. Kalau gagal, ia dilewati dan dicoba lagi
#      pada tarikan berikutnya — bukan ditulis sebagai "#None" dengan gambar
#      kosong.
#
# Kenapa begini: scripts/.cache-metadata.json sengaja tidak masuk git, jadi di
# runner GitHub Actions cache-nya selalu kosong. Dulu skrip tetap menulis ulang
# semua baris, dan satu kali cron berjalan mengubah 654 karya menjadi
# "#None" dengan gambar kosong — situs kehilangan seluruh judul dan gambar.
def meta_valid(meta):
    """True kalau metadata IPFS cukup lengkap untuk menimpa data lama."""
    if not isinstance(meta, dict) or not meta:
        return False
    nama = meta.get("name") or ""
    gam  = meta.get("animation") or meta.get("image") or ""
    return bool(gam) and bool(nama or nomor_edisi(nama))

baris, detail = [], {}
for taxon in URUTAN + (["baru"] if by_k.get("baru") else []):
    nomor_otomatis = 0
    for n in by_k.get(taxon, []):
        nid  = n["nft_id"]
        meta = md_lama.get(nid) or {}
        lama = lama_per_id.get(nid)

        if lama is not None:
            # Karya lama → mulai dari baris yang sudah ada.
            e = {"k": taxon, "n": lama["n"], "j": lama["j"], "g": lama["g"], "id": nid}
            if meta_valid(meta):
                nama  = (meta.get("name") or "").strip()
                nomor = nomor_edisi(nama)
                e["j"] = judul_karya(nama, nomor)
                e["g"] = meta.get("animation") or meta.get("image") or e["g"]
                if nomor:
                    e["n"] = nomor
        elif meta_valid(meta):
            # Karya baru dengan metadata lengkap.
            nama  = (meta.get("name") or "").strip()
            nomor = nomor_edisi(nama)
            nomor_otomatis += 1
            e = {
                "k": taxon,
                "n": nomor or nomor_otomatis,
                "j": judul_karya(nama, nomor or nomor_otomatis),
                "g": meta.get("animation") or meta.get("image") or "",
                "id": nid,
            }
        else:
            # Karya baru tanpa metadata → jangan tulis apa pun. Tarikan
            # berikutnya (setelah IPFS bisa diakses) akan menangkapnya.
            print(f"  ! {nid[:16]}… metadata belum tersedia, ditunda ke tarikan berikutnya")
            continue

        baris.append(e)

        if meta_valid(meta):
            attrs = meta.get("attributes") or []
            desc  = (meta.get("description") or "").strip()
            if attrs or desc:
                detail[nid] = (attrs, desc)
        elif nid in detail_lama:
            detail[nid] = detail_lama[nid]

# ── TULIS KARYA NFT (TANPA ATTRS/DESC) ───────────────────────────────────────
grid = []
for taxon in URUTAN + (["baru"] if by_k.get("baru") else []):
    kode = KODE[taxon] if taxon != "baru" else "baru"
    daftar = [e for e in baris if e["k"] == taxon]
    grid.append(f"  {kode}: [")
    for e in daftar:
        grid.append(f'    [{e["n"]}, "{tulis_escape(e["j"])}", "{tulis_escape(e["g"])}", "{e["id"]}"],')
    grid.append("  ],")

HEADER = """\
/* =============================================================================
   KARYA — SELURUH NFT WALLET STUDIO

   Berkas dibuat otomatis oleh scripts/tarik-karya.py.
   Jalankan skrip ini setiap kali ada koleksi baru di-mint di xrp.cafe:
     npm run tarik-karya

   Struktur: [nomor, judul, gambar, NFTokenID]
   ============================================================================= */

export type KaryaNft = readonly [nomor: number, judul: string, gambar: string, nftId: string];
export type KodeKelompok = "apid" | "favo" | "javo" | "neo" | "lepas" | "puko";
/** Taxon yang belum terdaftar → koleksi terbaru, grup sementara "baru". */
export type KodeTampil = KodeKelompok | "baru";
export const urutanKelompok: readonly KodeKelompok[] = [
  "apid", "favo", "javo", "neo", "lepas", "puko",
];
export const koleksiVanity: Partial<Record<KodeKelompok, string>> = {
  apid: "apesvoidline-jajangosle", favo: "fine-art-voidline", javo: "jajangvoidline",
};
export const koleksiSlug: Partial<Record<KodeKelompok, string>> = {
  apid: "apesvoidline", favo: "fine-art-voidline", javo: "jajangvoidline",
};
/** Taxon → kode kelompok. Dipakai untuk cari karya pertama per koleksi. */
export const kodeDariTaxon: Record<number, KodeKelompok> = Object.fromEntries(
  Object.entries({ 3: "apid", 9: "favo", 111: "javo", 1: "neo", 2: "lepas", 5: "puko" })
    .map(([t, k]) => [Number(t), k as KodeKelompok]),
);
export const karyaPerKelompok: Partial<Record<KodeTampil, readonly KaryaNft[]>> = {
"""

SAMBUNG = """
};

export const karyaLookup: Record<string, KaryaNft> = Object.fromEntries(
  Object.values(karyaPerKelompok).flatMap((a) => a.map((k) => [k[3], k])),
);

const KELOMPOK_NFT: Record<string, KodeTampil> = Object.fromEntries(
  Object.entries(karyaPerKelompok).flatMap(([k, arr]) =>
    arr.map((karya) => [karya[3], k as KodeTampil])),
);
export const kelompokKarya = (nftId: string): KodeTampil | undefined =>
  KELOMPOK_NFT[nftId];

/** Koleksi terbaru: grup taxon yang belum masuk urutanKelompok. Kosong bila
    semua taxon sudah punya nama. */
export const kodeGrupBaru: KodeTampil[] = (
  Object.keys(karyaPerKelompok) as KodeTampil[]
).filter((k) => !urutanKelompok.includes(k as KodeKelompok));

/** Kode kelompok yang tampil di halaman koleksi: koleksi bernama dulu, lalu
    koleksi terbaru (grup `baru`) di urutan akhir. Menjadikan rilisan baru yang
    belum diberi nama tetap terlihat di /collection dan dropdownnya. */
export const kelompokTampil: readonly KodeTampil[] = [
  ...urutanKelompok,
  ...(kodeGrupBaru.length > 0 ? kodeGrupBaru : []),
];

export const alamatIpfs = (uri: string): string =>
  uri.startsWith("ipfs://") ? `https://ipfs.io/ipfs/${uri.slice(7)}` : uri;
"""

tulis = HEADER + "\n".join(grid) + SAMBUNG
DATA_PATH.write_text(tulis, encoding="utf-8")

# ── TULIS KARYA DETAIL (ATTRS + DESC) ───────────────────────────────────────
det = []
for taxon in URUTAN + (["baru"] if by_k.get("baru") else []):
    for e in [x for x in baris if x["k"] == taxon]:
        if e["id"] not in detail: continue
        attrs, desc = detail[e["id"]]
        aj = json.dumps(attrs, separators=(",", ":"), ensure_ascii=False)
        dj = json.dumps(desc, ensure_ascii=False)
        det.append(f'  "{e["id"]}": {{ attrs: {aj}, desc: {dj} }},')

DETAIL = """\
/* =============================================================================
   METADATA TAMBAHAN PER KARYA — atribut dan deskripsi dari IPFS.

   Berkas dibuat otomatis oleh scripts/tarik-karya.py.
   Diperbarui bersamaan dengan karyaNft.ts.
   ============================================================================= */

export type AtributNft = { trait_type?: string; value?: string | number };
export type DetailKarya = { attrs: readonly AtributNft[]; desc: string };

export const detailKarya: Partial<Record<string, DetailKarya>> = {
""" + "\n".join(det) + "\n};\n"

META_PATH.write_text(DETAIL, encoding="utf-8")

# ── SELESAI ──────────────────────────────────────────────────────────────────
total = len(baris)
print(f"\nSelesai. {total} NFT ditulis ke:")
print(f"  {DATA_PATH}")
print(f"  {META_PATH}")

ditunda = [n for n in terbit if n["nft_id"] not in {e["id"] for e in baris}]
if total != len(lama_per_id):
    print(f"\n  {total - len(lama_per_id)} NFT baru ditambahkan.")
    print("  Commit dan push, atau jalankan lagi setelah mint berikutnya.")
else:
    print("  Semua NFT sudah tercacat — tidak ada yang berubah.")
if ditunda:
    print(f"  ! {len(ditunda)} NFT ditunda karena metadata IPFS belum tersedia:")
    for n in ditunda[:5]:
        print(f"      {n['nft_id'][:16]}… (taxon {n.get('nft_taxon', '?')})")
    if len(ditunda) > 5:
        print(f"      … +{len(ditunda) - 5} lagi")