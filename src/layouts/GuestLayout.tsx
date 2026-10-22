import { Outlet } from "react-router-dom";
import NavbarGuest from "../components/guest/NavbarGuest";
import Footer from "../components/Footer";

/**
 * Layout untuk pengunjung yang belum login.
 *
 * Kerangka semua halaman publik: navbar di atas, isi halaman di tengah, footer
 * di bawah. Halaman dirender lewat <Outlet />, jadi navbar dan footer tidak
 * perlu ditulis ulang di setiap halaman.
 *
 * #main-content dijadikan wadah berkolom flex supaya halaman yang isinya lebih
 * panjang dari layar tetap mendorong footer turun dengan benar.
 */
export default function GuestLayout() {
  return (
    <div className="flex min-h-screen flex-col">
      <NavbarGuest />
      <main id="main-content" className="flex flex-1 flex-col">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}
