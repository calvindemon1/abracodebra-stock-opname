import { createSignal, For, Show, onMount, onCleanup } from "solid-js";
import { useNavigate } from "@solidjs/router";
import {
  MoreVertical,
  Pencil,
  Trash2,
  Plus,
  Loader2,
  FolderOpen,
  Image as ImageIcon,
  Tag as TagIcon,
  HardDrive,
  FileBox,
} from "lucide-solid";
import Swal from "sweetalert2";
import { Portal } from "solid-js/web";

// Taruh import service lu di sini bro (Gua ganti namanya jadi VideoAssetService sebagai contoh)
// import { VideoAssetService } from "../../../services/video-assets";

export default function VideoDataList() {
  const navigate = useNavigate();

  // ===== STATE =====
  const [isMounted, setIsMounted] = createSignal(false);
  const [activeTab, setActiveTab] = createSignal("All");
  const [openActionId, setOpenActionId] = createSignal(null);
  const [dropdownPos, setDropdownPos] = createSignal({ x: 0, y: 0 });

  // State untuk Data & Loading
  const [assets, setAssets] = createSignal([]);
  const [isLoading, setIsLoading] = createSignal(true);

  // ===== MOCK FETCH DATA (Ganti pake API lu nanti) =====
  const fetchAssets = async () => {
    setIsLoading(true);
    try {
      // Simulasi request API
      // const response = await VideoAssetService.getAll();
      // setAssets(response.data);

      // Dummy Data sementara biar lu bisa liat bentuknya
      setTimeout(() => {
        setAssets([
          {
            id: 1,
            thumbnail_url:
              "https://images.unsplash.com/photo-1620641788415-622040ea313f?q=80&w=200&auto=format&fit=crop",
            folder_name: "Opening Adira Finance",
            category: "Motion Graphic",
            tags: ["kuning", "petir", "semangat", "adira"],
            file_count: 12,
            folder_size: "1.2 GB",
          },
          {
            id: 2,
            thumbnail_url: "", // Kosongin buat liat efek placeholder
            folder_name: "B-Roll Gedung Kantor",
            category: "Footage",
            tags: ["drone", "outdoor", "siang"],
            file_count: 45,
            folder_size: "14.5 GB",
          },
          {
            id: 3,
            thumbnail_url:
              "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=200&auto=format&fit=crop",
            folder_name: "Transition Pack V2",
            category: "Template",
            tags: ["glitch", "smooth", "zoom"],
            file_count: 120,
            folder_size: "850 MB",
          },
        ]);
        setIsLoading(false);
      }, 800);
    } catch (error) {
      console.error("Gagal mengambil data asset:", error);
      Swal.fire("Error", "Gagal memuat data", "error");
      setIsLoading(false);
    }
  };

  const handleGlobalPointer = (e) => {
    if (!openActionId()) return;
    const dropdown = document.querySelector("#asset-action-dropdown");
    if (!dropdown) return;
    if (
      !dropdown.contains(e.target) &&
      !e.target.closest("[data-action-trigger]")
    ) {
      setOpenActionId(null);
    }
  };

  onMount(() => {
    fetchAssets();
    setTimeout(() => setIsMounted(true), 50);
    document.addEventListener("pointerdown", handleGlobalPointer);
    window.addEventListener("resize", () => setOpenActionId(null));
    window.addEventListener("scroll", () => setOpenActionId(null));
  });

  onCleanup(() => {
    document.removeEventListener("pointerdown", handleGlobalPointer);
  });

  // ===== FILTER DATA =====
  const filteredAssets = () => {
    if (activeTab() === "All") return assets();
    return assets().filter((asset) => asset.category === activeTab());
  };

  // ===== DELETE ACTION =====
  const handleDelete = async (asset) => {
    setOpenActionId(null);
    const confirm = await Swal.fire({
      title: "Hapus Folder Ini?",
      html: `
        <div class="text-left text-sm mt-2 text-gray-600">
          <p class="mb-1"><strong>Nama:</strong> ${asset.folder_name}</p>
          <p><strong>Ukuran:</strong> ${asset.folder_size} (${asset.file_count} Files)</p>
        </div>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6d6d6d",
      customClass: { cancelButton: "text-gray-800" },
    });

    if (!confirm.isConfirmed) return;

    try {
      Swal.fire({
        title: "Menghapus...",
        text: "Mohon tunggu sebentar",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      // Panggil API Delete
      // await VideoAssetService.delete(asset.id);

      setAssets((prev) => prev.filter((a) => a.id !== asset.id));

      Swal.fire({
        title: "Terhapus!",
        text: `Folder "${asset.folder_name}" berhasil dihapus`,
        icon: "success",
        confirmButtonColor: "#10b981",
      });
    } catch (error) {
      console.error("Gagal menghapus asset:", error);
      Swal.fire("Error!", "Terjadi kesalahan saat menghapus data.", "error");
    }
  };

  // Helper untuk warna-warni tag biar nggak ngebosenin
  const getTagColor = (index) => {
    const colors = [
      "bg-blue-100 text-blue-700 border-blue-200",
      "bg-emerald-100 text-emerald-700 border-emerald-200",
      "bg-amber-100 text-amber-700 border-amber-200",
      "bg-violet-100 text-violet-700 border-violet-200",
      "bg-rose-100 text-rose-700 border-rose-200",
    ];
    return colors[index % colors.length];
  };

  return (
    <div class="p-6 bg-gray-50/50 min-h-screen font-sans overflow-x-hidden">
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scalePop {
          from { opacity: 0; transform: scale(0.95) translateY(-5px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-row {
          opacity: 0;
          animation: fadeSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-dropdown {
          transform-origin: top right;
          animation: scalePop 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-spin-slow {
          animation: spin 1.5s linear infinite;
        }
      `}</style>

      <div
        class={`max-w-7xl mx-auto transition-all duration-700 ease-out transform ${
          isMounted() ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        {/* HEADER */}
        <div class="flex justify-between items-center mb-8">
          <div>
            <h1 class="text-3xl font-bold text-gray-800 tracking-tight">
              Video Asset Library
            </h1>
            <p class="text-sm text-gray-500 mt-1">
              Kelola, cari, dan simpan semua folder asset videomu di sini.
            </p>
          </div>

          <div class="flex items-center gap-3">
            <button
              onClick={() => navigate("/admin/video-data-bank/create")}
              class="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 hover:shadow-lg hover:-translate-y-0.5 active:scale-95 transition-all duration-200"
            >
              <Plus size={16} />
              Folder Baru
            </button>
          </div>
        </div>

        {/* MAIN TABS (Disesuaikan untuk Video) */}
        <div class="border-b border-gray-200 mb-8 flex gap-8 relative overflow-x-auto whitespace-nowrap no-scrollbar">
          {["All", "Footage", "Motion Graphic", "Template", "Sound Effect"].map(
            (tab) => (
              <button
                onClick={() => setActiveTab(tab)}
                class={`relative pb-4 text-sm font-medium transition-colors duration-300 ${
                  activeTab() === tab
                    ? "text-black"
                    : "text-gray-400 hover:text-gray-800"
                }`}
              >
                {tab}
                <div
                  class={`absolute bottom-0 left-0 w-full h-0.5 bg-black rounded-t-full transition-transform duration-300 origin-left ${
                    activeTab() === tab ? "scale-x-100" : "scale-x-0"
                  }`}
                />
              </button>
            ),
          )}
        </div>

        {/* SHOW LOADING SPINNER */}
        <Show when={isLoading()}>
          <div class="flex flex-col items-center justify-center py-20 text-gray-400">
            <Loader2 size={40} class="animate-spin-slow mb-4 text-black" />
            <p class="text-sm font-medium">Memuat data asset...</p>
          </div>
        </Show>

        <Show when={!isLoading()}>
          <div class="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-visible pb-32">
            <div class="overflow-x-auto">
              <table class="min-w-full text-sm text-left">
                <thead class="bg-gray-50/80 text-gray-500 text-xs uppercase tracking-widest border-b border-gray-100">
                  <tr>
                    <th class="p-4 font-semibold w-24 text-center">
                      Thumbnail
                    </th>
                    <th class="p-4 font-semibold min-w-[200px]">
                      Detail Folder
                    </th>
                    <th class="p-4 font-semibold min-w-[250px]">Tags</th>
                    <th class="p-4 font-semibold text-center">Files</th>
                    <th class="p-4 font-semibold text-right">Size</th>
                    <th class="p-4 font-semibold text-center w-16">Act</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-100">
                  <Show
                    when={filteredAssets().length > 0}
                    fallback={
                      <tr>
                        <td colspan="6" class="p-12 text-center">
                          <FolderOpen
                            size={48}
                            class="mx-auto text-gray-300 mb-3"
                          />
                          <p class="text-gray-500 font-medium">
                            Folder tidak ditemukan.
                          </p>
                          <p class="text-xs text-gray-400 mt-1">
                            Coba tambahkan folder baru atau ganti tab filter.
                          </p>
                        </td>
                      </tr>
                    }
                  >
                    <For each={filteredAssets()}>
                      {(asset, index) => (
                        <tr
                          class="animate-row hover:bg-gray-50/80 transition-colors duration-200 group"
                          style={{ "animation-delay": `${index() * 0.05}s` }}
                        >
                          {/* THUMBNAIL */}
                          <td class="p-4">
                            <div class="w-16 h-12 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center border border-gray-200 shadow-sm">
                              <Show
                                when={asset.thumbnail_url}
                                fallback={
                                  <ImageIcon size={20} class="text-gray-400" />
                                }
                              >
                                <img
                                  src={asset.thumbnail_url}
                                  alt={asset.folder_name}
                                  class="w-full h-full object-cover"
                                />
                              </Show>
                            </div>
                          </td>

                          {/* FOLDER NAME & CATEGORY */}
                          <td class="p-4">
                            <div class="font-bold text-gray-800 text-base mb-1 group-hover:text-indigo-600 transition-colors cursor-pointer">
                              {asset.folder_name}
                            </div>
                            <div class="text-xs font-medium text-gray-500 bg-gray-100 inline-block px-2 py-0.5 rounded-md">
                              {asset.category}
                            </div>
                          </td>

                          {/* TAGS */}
                          <td class="p-4">
                            <div class="flex flex-wrap gap-1.5">
                              <Show
                                when={asset.tags && asset.tags.length > 0}
                                fallback={
                                  <span class="text-gray-400 text-xs italic">
                                    -
                                  </span>
                                }
                              >
                                <For each={asset.tags}>
                                  {(tag, i) => (
                                    <span
                                      class={`flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider border ${getTagColor(i())}`}
                                    >
                                      <TagIcon size={10} />
                                      {tag}
                                    </span>
                                  )}
                                </For>
                              </Show>
                            </div>
                          </td>

                          {/* JUMLAH FILE */}
                          <td class="p-4 text-center">
                            <div class="inline-flex items-center gap-1.5 bg-slate-50 border border-slate-200 text-slate-700 px-3 py-1.5 rounded-lg font-semibold">
                              <FileBox size={14} class="text-slate-400" />
                              {asset.file_count}
                            </div>
                          </td>

                          {/* FOLDER SIZE */}
                          <td class="p-4 text-right">
                            <div class="flex items-center justify-end gap-1.5 font-bold text-gray-700">
                              <HardDrive size={14} class="text-gray-400" />
                              {asset.folder_size}
                            </div>
                          </td>

                          {/* ACTION BUTTON & DROPDOWN */}
                          <td class="p-4 text-center relative">
                            <button
                              data-action-trigger
                              onClick={(e) => {
                                const rect =
                                  e.currentTarget.getBoundingClientRect();
                                setDropdownPos({
                                  x: rect.right - 144,
                                  y: rect.bottom + 8,
                                });
                                setOpenActionId(
                                  openActionId() === asset.id ? null : asset.id,
                                );
                              }}
                              class="p-1.5 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                            >
                              <MoreVertical size={18} />
                            </button>

                            {/* DROPDOWN MENU DI PORTAL (Biar gak kepotong tabel) */}
                            <Show when={openActionId() === asset.id}>
                              <Portal>
                                <div
                                  id="asset-action-dropdown"
                                  class="animate-dropdown fixed w-36 bg-white border border-gray-100 rounded-xl shadow-xl z-[9999] overflow-hidden p-1"
                                  style={{
                                    top: `${dropdownPos().y}px`,
                                    left: `${dropdownPos().x}px`,
                                  }}
                                >
                                  <button
                                    onClick={() =>
                                      navigate(`/admin/assets/edit/${asset.id}`)
                                    }
                                    class="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black w-full text-left rounded-lg transition-colors"
                                  >
                                    <Pencil size={14} /> Edit
                                  </button>
                                  <div class="h-px bg-gray-100 my-1"></div>
                                  <button
                                    onClick={() => handleDelete(asset)}
                                    class="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left rounded-lg transition-colors"
                                  >
                                    <Trash2 size={14} /> Hapus
                                  </button>
                                </div>
                              </Portal>
                            </Show>
                          </td>
                        </tr>
                      )}
                    </For>
                  </Show>
                </tbody>
              </table>
            </div>
          </div>
        </Show>
      </div>
    </div>
  );
}
