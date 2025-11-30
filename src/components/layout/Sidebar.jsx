import { useNavigate, useLocation } from "@solidjs/router";
import { createSignal } from "solid-js";

import logoAbra from "../../assets/img/logogram-abracodebra.png";

export default function Sidebar() {
  const navigate = useNavigate();
  const [openUsers, setOpenUsers] = createSignal(false);
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <aside class="min-h-screen p-4 bg-gray-100 flex">
      <div
        class="
          w-64 bg-blue-950 text-white 
          p-6 flex flex-col 
          rounded-2xl shadow-lg
          border border-gray-700
          h-[95vh]       /* biar ga full tinggi */
          sticky top-4   /* biar ikut scroll tapi ada jarak */
          transition-all duration-300
        "
      >
        <h2 class="flex items-center text-xl font-semibold mb-6">
          <img src={logoAbra} class="size-12" alt="" />
          Admin Panel
        </h2>

        <nav class="flex flex-col gap-2 flex-1">
          <a
            href="/admin"
            class={`p-2 rounded transition-all duration-200 ${
              isActive("/admin")
                ? "bg-gray-800 font-semibold scale-[1.02]"
                : "opacity-80 hover:opacity-100"
            }`}
          >
            Dashboard
          </a>

          <a
            href="/admin/load-in"
            class={`p-2 rounded transition-all duration-200 ${
              isActive("/admin/load-in")
                ? "bg-gray-800 font-semibold scale-[1.02]"
                : "opacity-80 hover:opacity-100"
            }`}
          >
            Loading In
          </a>

          <a
            href="/admin/load-out"
            class={`p-2 rounded transition-all duration-200 ${
              isActive("/admin/load-out")
                ? "bg-gray-800 font-semibold scale-[1.02]"
                : "opacity-80 hover:opacity-100"
            }`}
          >
            Loading Out
          </a>

          <button
            class={`w-full flex justify-between items-center p-2 rounded transition-all duration-200
      ${
        isActive("/admin/users")
          ? "bg-gray-800 font-semibold"
          : "opacity-80 hover:opacity-100"
      }
    `}
            onClick={() => setOpenUsers((o) => !o)}
          >
            <span>Master Data</span>

            <span
              class={`transition-transform duration-200 ${
                openUsers() ? "rotate-180" : "rotate-0"
              }`}
            >
              ▼
            </span>
          </button>

          {/* Animated dropdown section */}
          <div
            class={`
            overflow-hidden transition-all duration-300 
            ${openUsers() ? "max-h-40 mt-2" : "max-h-0 mt-0"} 
          `}
          >
            <div class="ml-4 flex flex-col gap-1">
              <a
                href="/admin/asset"
                class={`p-2 rounded text-sm transition-all duration-200 
                ${
                  isActive("/admin/asset")
                    ? "bg-gray-800 font-semibold"
                    : "opacity-80 hover:opacity-100"
                }`}
              >
                Asset
              </a>

              <a
                href="/admin/conditions"
                class={`p-2 rounded text-sm transition-all duration-200 
                ${
                  isActive("/admin/conditions")
                    ? "bg-gray-800 font-semibold"
                    : "opacity-80 hover:opacity-100"
                }`}
              >
                Conditions
              </a>

              <a
                href="/admin/locations"
                class={`p-2 rounded text-sm transition-all duration-200 
                ${
                  isActive("/admin/locations")
                    ? "bg-gray-800 font-semibold"
                    : "opacity-80 hover:opacity-100"
                }`}
              >
                Locations
              </a>

              <a
                href="/admin/events"
                class={`p-2 rounded text-sm transition-all duration-200 
                ${
                  isActive("/admin/events")
                    ? "bg-gray-800 font-semibold"
                    : "opacity-80 hover:opacity-100"
                }`}
              >
                Events
              </a>
              <a
                href="/admin/types"
                class={`p-2 rounded text-sm transition-all duration-200 
                ${
                  isActive("/admin/types")
                    ? "bg-gray-800 font-semibold"
                    : "opacity-80 hover:opacity-100"
                }`}
              >
                Types
              </a>
            </div>
          </div>
        </nav>

        <button
          class="bg-red-600 p-2 rounded hover:bg-red-700 transition-all duration-200"
          onClick={() => {
            localStorage.removeItem("token");
            navigate("/login");
          }}
        >
          Logout
        </button>
      </div>
    </aside>
  );
}
