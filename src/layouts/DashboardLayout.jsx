import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";
import { isLoggedIn } from "../utils/auth";
import { Navigate } from "@solidjs/router";

export default function DashboardLayout(props) {
  if (!isLoggedIn()) return <Navigate href="/login" />;

  return (
    <div class="flex min-h-screen bg-gray-100">
      <Sidebar />
      <div class="flex-1 flex flex-col">
        <Navbar />
        <main class="p-6 flex-1 bg-gray-100">{props.children}</main>
      </div>
    </div>
  );
}
