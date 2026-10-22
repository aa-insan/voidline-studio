import { createBrowserRouter } from "react-router-dom";
import { routes } from "./config";

/**
 * Router aplikasi.
 *
 * createBrowserRouter dipakai agar rute dapat disusun sebagai data bersarang
 * (lihat config.tsx), yang lebih mudah dikembangkan saat jumlah layout dan
 * halaman bertambah.
 */
export const router = createBrowserRouter(routes);
