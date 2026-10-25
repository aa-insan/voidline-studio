import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    rollupOptions: {
      output: {
        /**
         * Berkas pihak ketiga dipisah dari kode situs.
         *
         * Perbedaannya pada cache: React, React Router, dan JSZip jarang berubah,
         * sedangkan kode situs berubah setiap kali ada perbaikan. Tanpa
         * pemisahan, satu perubahan teks membuat pengunjung mengunduh ulang
         * seluruh React; dengan pemisahan, hanya berkas halaman yang berubah
         * yang diunduh ulang.
         *
         * JSZip sebenarnya sudah dipecah sendiri (diimpor dinamis saat ekspor),
         * tetapi pola ini memastikan tetap begitu walau suatu saat impor itu
         * berubah menjadi statis.
         */
        manualChunks(id: string) {
          if (
            id.includes("node_modules/react/") ||
            id.includes("node_modules/react-dom/") ||
            id.includes("node_modules/react-router") ||
            id.includes("node_modules/scheduler/")
          ) {
            return "react";
          }
          return undefined;
        },
      },
    },
  },
})
