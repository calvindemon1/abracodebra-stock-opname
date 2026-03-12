import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";
import { isLoggedIn } from "../utils/auth";
import { Navigate } from "@solidjs/router";

export default function DashboardLayout(props) {
  if (!isLoggedIn()) return <Navigate href="/login" />;

  return (
    // 1. Ganti min-h-screen jadi h-screen
    // 2. Tambah overflow-hidden biar parent-nya nge-lock layout
    <div class="flex h-screen bg-gray-100 overflow-hidden w-full">
      <Sidebar />

      {/* 3. Kasih overflow-hidden juga di kolom kanannya */}
      <div class="flex-1 flex flex-col overflow-hidden relative">
        <Navbar />

        {/* main-nya tetap flex-1 dan overflow-y-auto */}
        <main class="p-6 flex-1 bg-gray-100 overflow-y-auto custom-scrollbar">
          {props.children}
        </main>
      </div>
    </div>
  );
}
