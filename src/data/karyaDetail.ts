/* =============================================================================
   METADATA TAMBAHAN PER KARYA — atribut dan deskripsi dari IPFS.

   Berkas dibuat otomatis oleh scripts/tarik-karya.py.
   Diperbarui bersamaan dengan karyaNft.ts.
   ============================================================================= */

export type AtributNft = { trait_type?: string; value?: string | number };
export type DetailKarya = { attrs: readonly AtributNft[]; desc: string };

export const detailKarya: Partial<Record<string, DetailKarya>> = {

};
