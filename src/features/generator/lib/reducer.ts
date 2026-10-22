/* =============================================================================
   KEADAAN GENERATOR — reducer

   Semua perubahan proyek lewat satu reducer ini, bukan disebar lewat banyak
   `useState`. Alasannya: proyek punya banyak bagian yang saling bergantung
   (menghapus layer berarti membuang trait-traitnya, mengubah temuan berarti
   membuang berkasnya). Reducer menjaga semuanya berubah bersamaan, dan
   memudahkan menyimpan/memuat proyek nanti — cukup satu objek keadaan.

   YANG DIANGGAP "KOSONG"
   Proyek di mulai dari keadaan kosong: tidak ada layer. Pengunjung boleh
   menambah layer sendiri, atau menekan "pakai contoh" yang mengisi beberapa
   layer contoh supaya bisa langsung mencoba mesinnya.
   ============================================================================= */

import { buatId, namaDariBerkas } from "./utils";
import type { GeneratorState, Layer, Trait } from "../types";
import { KEADAAN_AWAL } from "../types";

export type Aksi =
  | { jenis: "gantiNamaProyek"; nama: string }
  | { jenis: "ubahPengaturan"; perubahan: Partial<GeneratorState["settings"]> }
  | { jenis: "tambahLayer"; nama: string; layerId?: string }
  | { jenis: "sisipkanTrait"; layerId: string; traits: Trait[] }
  | { jenis: "gantiNamaLayer"; layerId: string; nama: string }
  | { jenis: "hapusLayer"; layerId: string }
  | { jenis: "pindahkanLayer"; dari: number; ke: number }
  | { jenis: "tambahTrait"; layerId: string; berkas: File[] }
  | { jenis: "gantiNamaTrait"; layerId: string; traitId: string; nama: string }
  | { jenis: "ubahBobotTrait"; layerId: string; traitId: string; bobot: number }
  | { jenis: "bolakBalikTrait"; layerId: string; traitId: string }
  | { jenis: "hapusTrait"; layerId: string; traitId: string }
  | { jenis: "gantiSeluruhKeadaan"; keadaan: GeneratorState };

/** Mencari layer lalu mengembalikan salinan baru dengan satu trait diubah. */
function ubahTrait(
  layers: Layer[],
  layerId: string,
  traitId: string,
  ubah: (trait: Trait) => Trait,
): Layer[] {
  return layers.map((layer) =>
    layer.id === layerId
      ? {
          ...layer,
          traits: layer.traits.map((trait) => (trait.id === traitId ? ubah(trait) : trait)),
        }
      : layer,
  );
}

export function generatorReducer(keadaan: GeneratorState, aksi: Aksi): GeneratorState {
  switch (aksi.jenis) {
    case "gantiNamaProyek":
      return { ...keadaan, projectName: aksi.nama };

    case "ubahPengaturan":
      return { ...keadaan, settings: { ...keadaan.settings, ...aksi.perubahan } };

    case "tambahLayer": {
      const nama = aksi.nama.trim() || `Layer ${keadaan.layers.length + 1}`;
      // `layerId` boleh diberikan pemanggil supaya gambarnya bisa langsung
      // dipasangkan ke layer yang sama tanpa menebak id setelah dispatch.
      const layer: Layer = { id: aksi.layerId ?? buatId("layer"), name: nama, traits: [] };
      return { ...keadaan, layers: [...keadaan.layers, layer] };
    }

    case "sisipkanTrait":
      return {
        ...keadaan,
        layers: keadaan.layers.map((l) =>
          l.id === aksi.layerId ? { ...l, traits: [...l.traits, ...aksi.traits] } : l,
        ),
      };

    case "gantiNamaLayer":
      return {
        ...keadaan,
        layers: keadaan.layers.map((l) =>
          l.id === aksi.layerId ? { ...l, name: aksi.nama } : l,
        ),
      };

    case "hapusLayer":
      return { ...keadaan, layers: keadaan.layers.filter((l) => l.id !== aksi.layerId) };

    case "pindahkanLayer": {
      const { dari, ke } = aksi;
      if (
        dari === ke ||
        dari < 0 ||
        ke < 0 ||
        dari >= keadaan.layers.length ||
        ke >= keadaan.layers.length
      ) {
        return keadaan;
      }
      const berikut = [...keadaan.layers];
      const [dipindah] = berikut.splice(dari, 1);
      berikut.splice(ke, 0, dipindah);
      return { ...keadaan, layers: berikut };
    }

    case "tambahTrait": {
      // Bobot awal 1 untuk semua: pada awalnya semua pilihan sama-sama mungkin,
      // dan pengunjung hanya menyetel rarity untuk hal yang memang langka.
      const traitBaru: Trait[] = aksi.berkas.map((berkas) => ({
        id: buatId("trait"),
        name: namaDariBerkas(berkas.name),
        weight: 1,
        excluded: false,
        fileName: berkas.name,
      }));

      return {
        ...keadaan,
        layers: keadaan.layers.map((l) =>
          l.id === aksi.layerId ? { ...l, traits: [...l.traits, ...traitBaru] } : l,
        ),
      };
    }

    case "gantiNamaTrait":
      return {
        ...keadaan,
        layers: ubahTrait(keadaan.layers, aksi.layerId, aksi.traitId, (t) => ({
          ...t,
          name: aksi.nama,
        })),
      };

    case "ubahBobotTrait":
      return {
        ...keadaan,
        layers: ubahTrait(keadaan.layers, aksi.layerId, aksi.traitId, (t) => ({
          ...t,
          // Bobot tidak boleh negatif. Nol berarti "tidak pernah dipilih",
          // yang tetap sah dan berbeda dari "dimatikan".
          weight: Math.max(0, Math.round(aksi.bobot * 100) / 100),
        })),
      };

    case "bolakBalikTrait":
      return {
        ...keadaan,
        layers: ubahTrait(keadaan.layers, aksi.layerId, aksi.traitId, (t) => ({
          ...t,
          excluded: !t.excluded,
        })),
      };

    case "hapusTrait":
      return {
        ...keadaan,
        layers: keadaan.layers.map((l) =>
          l.id === aksi.layerId
            ? { ...l, traits: l.traits.filter((t) => t.id !== aksi.traitId) }
            : l,
        ),
      };

    case "gantiSeluruhKeadaan":
      return aksi.keadaan;

    default:
      return keadaan;
  }
}

/** Keadaan awal untuk proyek baru. */
export const keadaanAwal = (): GeneratorState => ({
  ...KEADAAN_AWAL,
  layers: [],
  settings: { ...KEADAAN_AWAL.settings },
});
