import { createSignal, createResource, For, Show, onMount } from "solid-js";
import { useNavigate } from "@solidjs/router";
import Swal from "sweetalert2";
import { ItemsService } from "../../../services/items";
import { CircleX, Edit, Plus, Box, Download, Loader2 } from "lucide-solid"; // Tambah Plus & Box
import TableFilter from "../../../components/ui/TableFilter";

export default function Assets() {
  const navigate = useNavigate();

  // ===== ANIMATION STATE =====
  const [isMounted, setIsMounted] = createSignal(false);

  // State untuk Data & Loading dari API
  const [isExporting, setIsExporting] = createSignal(false); // <-- State buat loading export

  const [page, setPage] = createSignal(1);
  const [limit, setLimit] = createSignal(10);

  const [filters, setFilters] = createSignal({
    search: "",
    sort: "",
    location: "",
    condition: "",
  });

  const [items] = createResource(
    () => ({ ...filters(), page: page(), limit: limit() }),
    ({ search, sort, location, condition, page, limit }) =>
      ItemsService.list({ search, sort, location, condition, page, limit }),
  );

  const paginatedData = () => {
    if (!items()) return [];
    const start = (page() - 1) * limit();
    return items()?.slice(start, start + limit());
  };

  const totalPages = () => Math.ceil((items()?.length || 1) / limit());

  onMount(() => {
    // Trigger animasi load awal
    setTimeout(() => setIsMounted(true), 50);
  });

  const remove = async (id) => {
    const confirm = await Swal.fire({
      title: "Hapus asset?",
      text: "Data yang dihapus tidak dapat dikembalikan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#f3f4f6",
      customClass: {
        cancelButton: "text-gray-800",
      },
    });

    if (!confirm.isConfirmed) return;

    try {
      await ItemsService.delete(id);
      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Asset berhasil dihapus ✅",
        confirmButtonColor: "#10b981",
      });
      items.refetch();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Gagal!",
        text: "Gagal menghapus asset ❌",
        confirmButtonColor: "#3b82f6",
      });
    }
  };

  const handleExport = async () => {
    const confirm = await Swal.fire({
      title: "Export Asset?",
      text: "Anda akan mengunduh semua data asset dalam format Excel.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya, Download",
      cancelButtonText: "Batal",
      confirmButtonColor: "#000000",
      cancelButtonColor: "#6d6d6d",
      customClass: { cancelButton: "text-gray-800" },
    });

    if (!confirm.isConfirmed) return;

    setIsExporting(true);
    try {
      Swal.fire({
        title: "Menyiapkan File...",
        text: "Mohon tunggu sebentar",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const blob = await ItemsService.export();

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      link.download = `Invoices_Export_${new Date()
        .toISOString()
        .slice(0, 10)}.xlsx`;

      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(url);

      Swal.fire({
        title: "Berhasil!",
        text: "File Excel berhasil diunduh.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Gagal export data:", error);
      Swal.fire("Error", "Gagal meng-export data", "error");
    } finally {
      setIsExporting(false);
    }
  };

  // Helper buat nge-styling Badge Kondisi (Baik = Hijau, Rusak = Merah)
  const getConditionBadge = (condition) => {
    if (!condition) return "bg-gray-100 text-gray-600";
    const lower = condition.toLowerCase();
    if (lower.includes("baik"))
      return "bg-green-100/80 text-green-700 border border-green-200/60";
    if (lower.includes("rusak"))
      return "bg-red-100/80 text-red-700 border border-red-200/60";
    return "bg-blue-100/80 text-blue-700 border border-blue-200/60";
  };

  return (
    <div class="p-6 bg-gray-50/50 min-h-screen font-sans">
      {/* ===== INJECT CUSTOM KEYFRAMES ===== */}
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-row {
          opacity: 0;
          animation: fadeSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        /* Custom Scrollbar biar tabel rapi */
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #9ca3af; }
      `}</style>

      {/* CONTAINER UTAMA BERANIMASI */}
      <div
        class={`max-w-7xl mx-auto space-y-6 transition-all duration-700 ease-out transform ${
          isMounted() ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        {/* HEADER */}
        <div class="flex justify-between items-center bg-white p-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-gray-600">
              <Box size={24} />
            </div>
            <div>
              <h1 class="text-2xl font-bold text-gray-800 tracking-tight">
                Assets Dashboard
              </h1>
              <p class="text-sm text-gray-500 mt-0.5">
                Kelola dan pantau inventaris aset perusahaan.
              </p>
            </div>
          </div>
          <div class="flex items-center gap-3">
            {/* Tombol Export */}
            <button
              onClick={handleExport}
              disabled={isExporting()}
              class="flex items-center gap-2 bg-white text-gray-700 border border-gray-200 px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 hover:shadow-sm hover:-translate-y-0.5 active:scale-95 transition-all duration-200 disabled:opacity-70 disabled:hover:translate-y-0"
            >
              <Show when={isExporting()} fallback={<Download size={16} />}>
                <Loader2 size={16} class="animate-spin-slow" />
              </Show>
              {isExporting() ? "Exporting..." : "Export"}
            </button>

            {/* Tombol Create */}
            <button
              onClick={() => navigate("/admin/asset/create")}
              class="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 hover:shadow-lg hover:-translate-y-0.5 active:scale-95 transition-all duration-200"
            >
              <Plus size={16} />
              Tambah Asset
            </button>
          </div>
        </div>

        {/* FILTER SECTION (Bungkus dlm kotak biar nyatu style-nya) */}
        <div class="bg-white p-5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 relative z-20">
          <TableFilter
            onChange={(data) => setFilters(data)}
            sortOptions={[
              { label: "Nama A-Z", value: "name_asc" },
              { label: "Nama Z-A", value: "name_desc" },
              { label: "Terbaru", value: "newest" },
              { label: "Terlama", value: "oldest" },
            ]}
            locations={[
              { id: 1, name: "Office (Kembar)" },
              { id: 2, name: "Event" },
            ]}
            conditions={[
              { id: 1, name: "Baik" },
              { id: 2, name: "Rusak" },
            ]}
          />
        </div>

        {/* TABLE SECTION */}
        <div class="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
          <Show when={items.loading}>
            <div class="p-12 text-center">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
              <p class="text-gray-500 text-sm font-medium">
                Memuat data asset...
              </p>
            </div>
          </Show>

          <Show when={!items.loading && items()?.length === 0}>
            <div class="p-16 text-center text-gray-500">
              <Box size={48} class="mx-auto text-gray-300 mb-4" />
              <p class="font-medium text-gray-600">
                Tidak ada data asset ditemukan
              </p>
              <p class="text-sm mt-1">
                Coba sesuaikan filter atau tambah asset baru.
              </p>
            </div>
          </Show>

          <Show when={!items.loading && items()?.length > 0}>
            <div class="overflow-y-auto max-h-[60vh] custom-scrollbar">
              <table class="min-w-full text-sm text-left">
                <thead class="bg-gray-50/80 text-gray-500 text-xs uppercase tracking-widest sticky top-0 z-10 backdrop-blur-sm border-b border-gray-100">
                  <tr>
                    <th class="p-4 font-semibold text-center w-16">#</th>
                    <th class="p-4 font-semibold">Asset Code</th>
                    <th class="p-4 font-semibold">Asset Name</th>
                    <th class="p-4 font-semibold">Location</th>
                    <th class="p-4 font-semibold text-center">Condition</th>
                    <th class="p-4 font-semibold text-center w-28">Aksi</th>
                  </tr>
                </thead>

                <tbody class="divide-y divide-gray-50">
                  <For each={paginatedData()}>
                    {(item, i) => (
                      <tr
                        class="animate-row hover:bg-gray-50/80 transition-colors duration-200 group"
                        style={{ "animation-delay": `${i() * 0.05}s` }} // Efek muncul bertahap
                      >
                        <td class="p-4 text-center text-gray-400 font-medium">
                          {(page() - 1) * limit() + i() + 1}
                        </td>
                        <td class="p-4 font-medium text-gray-800">
                          <span class="bg-gray-100 px-2.5 py-1 rounded-md text-xs tracking-wide">
                            {item.asset_code}
                          </span>
                        </td>
                        <td class="p-4 font-medium text-gray-700">
                          {item.asset_name}
                        </td>
                        <td class="p-4 text-gray-600 flex items-center gap-2">
                          <div class="w-1.5 h-1.5 rounded-full bg-blue-400"></div>
                          {item.location_name}
                        </td>
                        <td class="p-4 text-center">
                          <span
                            class={`px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase ${getConditionBadge(item.condition_name)}`}
                          >
                            {item.condition_name}
                          </span>
                        </td>
                        <td class="p-4 text-center">
                          <div class="flex items-center justify-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() =>
                                navigate(`/admin/asset/edit/${item.id}`)
                              }
                              class="p-2 text-blue-600 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit size={18} />
                            </button>
                            <button
                              onClick={() => remove(item.id)}
                              class="p-2 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                              title="Hapus"
                            >
                              <CircleX size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    )}
                  </For>
                </tbody>
              </table>
            </div>

            {/* Pagination Footer */}
            <div class="flex justify-between items-center p-4 border-t border-gray-100 bg-gray-50/30">
              <span class="text-sm text-gray-500 font-medium">
                Page <span class="text-black font-bold">{page()}</span> of{" "}
                {totalPages()}
              </span>

              <div class="flex gap-2">
                <button
                  class="px-4 py-2 text-sm font-medium border border-gray-200 rounded-xl bg-white text-gray-600 hover:bg-gray-50 hover:text-black transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white"
                  disabled={page() === 1}
                  onClick={() => setPage(page() - 1)}
                >
                  Previous
                </button>
                <button
                  class="px-4 py-2 text-sm font-medium border border-gray-200 rounded-xl bg-white text-gray-600 hover:bg-gray-50 hover:text-black transition-colors disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-white"
                  disabled={page() >= totalPages()}
                  onClick={() => setPage(page() + 1)}
                >
                  Next
                </button>
              </div>
            </div>
          </Show>
        </div>
      </div>
    </div>
  );
}
