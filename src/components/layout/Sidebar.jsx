import { useNavigate, useLocation } from "@solidjs/router";
import { createSignal, createEffect, For, Show, on } from "solid-js";
import {
  Boxes,
  Database,
  BarChart3,
  File,
  LogOut,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CircleDot,
  Network,
} from "lucide-solid";
import logoAbra from "../../assets/img/logo-abracodebra.png";
import logoGramAbra from "../../assets/img/logogram-abracodebra.png";

export default function Sidebar() {
  const navigate = useNavigate();
  const location = useLocation();

  const [openKeys, setOpenKeys] = createSignal([]);
  const [collapsed, setCollapsed] = createSignal(false);

  const toggleMenu = (key) => {
    setOpenKeys((prev) =>
      prev.includes(key) ? prev.filter((k) => k !== key) : [...prev, key],
    );
  };

  const isOpen = (key) => openKeys().includes(key);

  /*
    =========================
    ACTIVE CHECK
    =========================
  */
  const checkActive = (path) => {
    if (!path) return false;
    return (
      location.pathname === path || location.pathname.startsWith(`${path}/`)
    );
  };

  // Ini udah bener (Recursive Active Check)
  const isGroupActive = (item) => {
    if (!item.children) return checkActive(item.path);
    return item.children.some((child) => isGroupActive(child));
  };

  /*
    =========================
    MENU CONFIG
    =========================
  */
  const menus = [
    {
      key: "master",
      label: "Master Data",
      icon: Database,
      children: [
        { label: "Asset", path: "/admin/asset" },
        { label: "Conditions", path: "/admin/conditions" },
        { label: "Locations", path: "/admin/locations" },
        { label: "Events", path: "/admin/events" },
        { label: "Types", path: "/admin/types" },
        { label: "Customers", path: "/admin/customers" },
        { label: "Divisions", path: "/admin/divisions" },
        { label: "Freelances", path: "/admin/freelances" },
        { label: "Members", path: "/admin/members" },
        { label: "Positions", path: "/admin/positions" },
        { label: "Questions", path: "/admin/questions" },
      ],
    },
    {
      key: "stock",
      label: "Stock Opname",
      icon: Boxes,
      children: [
        { label: "Loading In", path: "/admin/load-in" },
        { label: "Loading Out", path: "/admin/load-out" },
      ],
    },
    {
      key: "reporting",
      label: "Reporting",
      icon: BarChart3,
      children: [
        { label: "Invoice Tracker", path: "/admin/invoice" },
        { label: "Crew's Log", path: "/admin/crews-log" },
        { label: "Vendor's Payment Log", path: "/admin/vendor-log" },
      ],
    },
    {
      key: "file-management",
      label: "File Management",
      icon: File,
      children: [
        { label: "Video's Team Data Bank", path: "/admin/video-data-bank" },
      ],
    },
    {
      key: "corporate-management",
      label: "Corporate Management",
      icon: Network,
      children: [
        // {
        //   key: "corman-master-data",
        //   label: "Master Data",
        //   icon: Database,
        //   children: [
        //     { label: "Events", path: "/admin/events" },
        //     { label: "Divisi", path: "/admin/division" },
        //     {
        //       label: "Karyawan",
        //       path: "/admin/corman-master/employees",
        //     },
        //     {
        //       label: "Master Pertanyaan CS",
        //       path: "/admin/corman-master/cs-questions",
        //     },
        //   ],
        // },
        { label: "CS Internal", path: "/admin/corman-cs-internal" },
      ],
    },
  ];

  /*
    =========================
    AUTO-EXPAND MENU (UPDATED BUAT NESTED)
    =========================
  */
  createEffect(
    on(
      () => location.pathname,
      () => {
        // Fungsi rekursif buat ngecek dan ngebuka semua folder bapaknya
        const expandActiveParents = (menuList) => {
          menuList.forEach((item) => {
            if (item.children) {
              expandActiveParents(item.children); // Cek anak-anaknya dulu
              if (isGroupActive(item)) {
                setOpenKeys((prev) =>
                  prev.includes(item.key) ? prev : [...prev, item.key],
                );
              }
            }
          });
        };
        expandActiveParents(menus);
      },
      { defer: false },
    ),
  );

  /*
    =========================
    RENDER RECURSIVE (UPDATED)
    =========================
  */
  // Tambahin parameter "level" biar kita tau ini bapak, anak, atau cucu
  const renderMenu = (items, level = 0) => {
    return (
      <For each={items}>
        {(item) => {
          const hasChildren = !!item.children;
          const Icon = item.icon;

          if (hasChildren) {
            return (
              <div class={`mb-1 ${level > 0 ? "relative" : ""}`}>
                {/* TITIK GARIS buat Sub-Folder (Cucu) */}
                <Show when={level > 0 && !collapsed()}>
                  <div
                    class={`absolute -left-[21px] top-[14px] w-2 h-2 rounded-full border-[1.5px] border-[#0a0a0a] transition-all duration-300 ${
                      isGroupActive(item)
                        ? "bg-white ring-2 ring-white/20"
                        : "bg-gray-600 group-hover:bg-gray-400"
                    }`}
                  ></div>
                </Show>

                {/* PARENT BUTTON */}
                <button
                  onClick={() => toggleMenu(item.key)}
                  class={`w-full flex items-center ${
                    collapsed() ? "justify-center" : "justify-between"
                  } ${level > 0 ? "p-2.5" : "p-3"} rounded-xl transition-all duration-200 group
                  ${
                    isGroupActive(item)
                      ? level > 0
                        ? "text-white"
                        : "bg-white/10 text-white"
                      : "text-gray-400 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <div class="flex items-center gap-3">
                    {Icon && (
                      <Icon
                        size={level > 0 ? 18 : 20}
                        class={
                          isGroupActive(item)
                            ? "text-white"
                            : "text-gray-400 group-hover:text-white transition-colors"
                        }
                      />
                    )}
                    <Show when={!collapsed()}>
                      <span
                        class={`text-sm tracking-wide ${level > 0 ? "font-normal" : "font-medium"}`}
                      >
                        {item.label}
                      </span>
                    </Show>
                  </div>

                  <Show when={!collapsed()}>
                    <ChevronDown
                      size={16}
                      class={`transition-transform duration-300 ease-in-out ${
                        isOpen(item.key)
                          ? "rotate-180 text-white"
                          : "text-gray-500"
                      }`}
                    />
                  </Show>
                </button>

                {/* CHILDREN WRAPPER DENGAN EFEK TREE-LINE */}
                <Show when={isOpen(item.key) && !collapsed()}>
                  <div class="flex flex-col mt-1 mb-2 ml-[22px] pl-4 border-l border-white/10 space-y-1">
                    {/* INI KUNCI REKURSIFNYA: Manggil fungsi renderMenu lagi */}
                    {renderMenu(item.children, level + 1)}
                  </div>
                </Show>
              </div>
            );
          }

          // MENU TANPA CHILDREN (Stand-alone/Leaf)
          return (
            <a
              href={item.path}
              class={`relative flex items-center ${
                collapsed()
                  ? "justify-center"
                  : level > 0
                    ? "p-2.5"
                    : "gap-3 p-3"
              } rounded-xl transition-all duration-200 group mb-1
              ${
                checkActive(item.path)
                  ? level > 0
                    ? "text-white font-medium bg-white/5"
                    : "bg-white/10 text-white"
                  : "text-gray-400 hover:bg-white/5 hover:text-white"
              }`}
            >
              {/* Titik indikator di garis vertikal */}
              <Show when={level > 0 && !collapsed()}>
                <div
                  class={`absolute -left-[21px] w-2 h-2 rounded-full border-[1.5px] border-[#0a0a0a] transition-all duration-300 ${
                    checkActive(item.path)
                      ? "bg-white ring-2 ring-white/20"
                      : "bg-gray-600 group-hover:bg-gray-400"
                  }`}
                ></div>
              </Show>

              {/* Tampilkan icon untuk level 0 (Menu Utama) */}
              <Show when={level === 0}>
                {Icon ? <Icon size={20} /> : <CircleDot size={18} />}
              </Show>

              <Show when={!collapsed()}>
                <span
                  class={`text-sm tracking-wide ${level === 0 ? "font-medium" : ""}`}
                >
                  {item.label}
                </span>
              </Show>
            </a>
          );
        }}
      </For>
    );
  };

  /*
    =========================
    UI
    =========================
  */
  return (
    <aside class="min-h-screen p-4 bg-gray-50 flex items-start z-50">
      <style>{`
        .sidebar-scroll::-webkit-scrollbar { width: 4px; }
        .sidebar-scroll::-webkit-scrollbar-track { background: transparent; }
        .sidebar-scroll::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }
        .sidebar-scroll::-webkit-scrollbar-thumb:hover { background: #555; }
      `}</style>

      <div
        class={`
          ${collapsed() ? "w-20" : "w-72"}
          bg-[#0a0a0a] text-white 
          p-4 flex flex-col 
          rounded-[24px] shadow-2xl
          border border-white/5
          h-[calc(100vh-32px)]
          sticky top-4
          transition-all duration-400 ease-in-out
        `}
      >
        {/* HEADER */}
        <div
          class={`flex items-center ${collapsed() ? "justify-center" : "justify-between"} mb-8 mt-2 px-2`}
        >
          <Show
            when={!collapsed()}
            fallback={
              <button
                onClick={() => setCollapsed(false)}
                class="relative w-10 h-10 bg-white/10 hover:bg-white/20 rounded-xl flex items-center justify-center cursor-pointer transition-all duration-300 group"
              >
                <div class="absolute inset-0 flex items-center justify-center transition-all duration-300 opacity-100 group-hover:opacity-0 group-hover:scale-50">
                  <img
                    src={logoGramAbra}
                    class="h-40 -my-32 -mx-6 object-contain pointer-events-none"
                    alt="Logo"
                  />
                </div>
                <div class="absolute inset-0 flex items-center justify-center transition-all duration-300 opacity-0 scale-50 group-hover:opacity-100 group-hover:scale-100">
                  <ChevronRight size={20} class="text-white" />
                </div>
              </button>
            }
          >
            <img
              src={logoAbra}
              class="h-40 -my-32 -mx-6 object-contain pointer-events-none"
              alt="Logo"
            />
            <button
              onClick={() => setCollapsed(true)}
              class="p-1.5 bg-white/5 hover:bg-white/15 text-gray-400 hover:text-white rounded-lg transition-all z-10 relative"
            >
              <ChevronLeft size={18} />
            </button>
          </Show>
        </div>

        {/* MENU */}
        <nav class="flex flex-col flex-1 overflow-y-auto sidebar-scroll pr-1">
          {/* MANGGIL RENDER MENU PERTAMA KALI */}
          {renderMenu(menus)}
        </nav>

        {/* LOGOUT */}
        <div class="pt-4 mt-2 border-t border-white/10">
          <button
            onClick={() => {
              localStorage.removeItem("token");
              navigate("/login");
            }}
            class={`w-full flex items-center ${
              collapsed() ? "justify-center" : "gap-3 px-4"
            } bg-red-500/10 text-red-500 py-3 rounded-xl hover:bg-red-500 hover:text-white transition-all duration-300 group`}
          >
            <LogOut
              size={20}
              class="transition-transform group-hover:-translate-x-1"
            />
            <Show when={!collapsed()}>
              <span class="text-sm font-semibold tracking-wide">Logout</span>
            </Show>
          </button>
        </div>
      </div>
    </aside>
  );
}
