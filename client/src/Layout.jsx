import { Outlet } from "react-router-dom";
import Header from "./pages/Header";
import Footer from "./pages/Footer";

export default function Layout() {
  return (
    // ⭐ Warm cream background applied globally
    <div className="min-h-screen flex flex-col bg-[#FFF5E8]">
      <Header />

      {/* Main content area */}
      <main className="flex-1">
        <Outlet />
      </main>

      <Footer />
    </div>
  );
}
