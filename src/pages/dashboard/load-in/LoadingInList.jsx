import { createResource, createSignal, For, Show, onMount } from "solid-js";
import { useNavigate } from "@solidjs/router";
import Swal from "sweetalert2";
import { LoadInService } from "../../../services/loadIn";
import {
  CircleX,
  Edit,
  Eye,
  Truck,
  Plus,
  Calendar,
  User,
  FileText,
} from "lucide-solid";

export default function LoadingInList() {
  const navigate = useNavigate();

  // ===== ANIMATION STATE =====
  const [isMounted, setIsMounted] = createSignal(false);

  // FETCH DATA
  const [data, { refetch }] = createResource(() => LoadInService.list());

  onMount(() => {
    // Trigger animasi muncul setelah komponen di-render
    setTimeout(() => setIsMounted(true), 50);
  });

  const remove = async (id) => {
    const confirm = await Swal.fire({
      title: "Hapus Data Load-In?",
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
      await LoadInService.delete(id);
      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Data load-in berhasil dihapus ✅",
        confirmButtonColor: "#10b981",
      });
      refetch();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Gagal!",
        text: "Terjadi kesalahan saat menghapus data ❌",
        confirmButtonColor: "#ef4444",
      });
    }
  };

  // Helper Formatter Tanggal
  const formatDate = (dateStr) => {
    if (!dateStr) return "-";
    return new Date(dateStr).toLocaleDateString("id-ID", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
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
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #9ca3af; }
      `}</style>

      {/* CONTAINER UTAMA */}
      <div
        class={`max-w-7xl mx-auto space-y-6 transition-all duration-700 ease-out transform ${
          isMounted() ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        {/* HEADER */}
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-gray-700">
              <Truck size={24} />
            </div>
            <div>
              <h1 class="text-2xl font-bold text-gray-800 tracking-tight">
                Loading In
              </h1>
              <p class="text-sm text-gray-500 mt-0.5">
                Daftar pencatatan barang masuk (Load-In) ke event.
              </p>
            </div>
          </div>

          <button
            onClick={() => navigate("/admin/load-in/create")}
            class="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 hover:shadow-lg hover:-translate-y-0.5 active:scale-95 transition-all duration-200 shrink-0"
          >
            <Plus size={16} />
            Create Load-In
          </button>
        </div>

        {/* TABLE SECTION */}
        <div class="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
          <Show when={data.loading}>
            <div class="p-16 text-center">
              <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
              <p class="text-gray-500 text-sm font-medium">
                Memuat data Load-In...
              </p>
            </div>
          </Show>

          <Show when={!data.loading && (!data() || data().length === 0)}>
            <div class="p-16 text-center text-gray-500">
              <Truck size={48} class="mx-auto text-gray-300 mb-4" />
              <p class="font-medium text-gray-600">
                Belum ada transaksi Loading In
              </p>
              <p class="text-sm mt-1">
                Klik tombol Create Load-In untuk mulai mencatat.
              </p>
            </div>
          </Show>

          <Show when={!data.loading && data()?.length > 0}>
            <div class="overflow-x-auto custom-scrollbar">
              <table class="min-w-full text-sm text-left whitespace-nowrap">
                <thead class="bg-gray-50/80 text-gray-500 text-xs uppercase tracking-widest border-b border-gray-100">
                  <tr>
                    <th class="p-4 font-semibold text-center w-16">No</th>
                    <th class="p-4 font-semibold">Event</th>
                    <th class="p-4 font-semibold">PIC Load-In</th>
                    <th class="p-4 font-semibold">Tanggal</th>
                    <th class="p-4 font-semibold">Notes</th>
                    <th class="p-4 font-semibold text-center w-36">Aksi</th>
                  </tr>
                </thead>
                <tbody class="divide-y divide-gray-50">
                  <For each={data()}>
                    {(row, i) => (
                      <tr
                        class="animate-row hover:bg-gray-50/80 transition-colors duration-200 group"
                        style={{ "animation-delay": `${i() * 0.05}s` }} // Efek muncul bertahap
                      >
                        <td class="p-4 text-center text-gray-400 font-medium">
                          {i() + 1}
                        </td>

                        <td class="p-4">
                          <div class="font-bold text-gray-800 flex items-center gap-2">
                            <div class="w-2 h-2 rounded-full bg-blue-500"></div>
                            {row.event_name ?? row.event_id}
                          </div>
                        </td>

                        <td class="p-4">
                          <div class="flex items-center gap-2 text-gray-700">
                            <div class="p-1.5 bg-gray-100 rounded-lg text-gray-500">
                              <User size={14} />
                            </div>
                            <span class="font-medium">
                              {row.pic_load_in || "-"}
                            </span>
                          </div>
                        </td>

                        <td class="p-4">
                          <div class="flex items-center gap-2 text-gray-600">
                            <Calendar size={14} class="text-gray-400" />
                            {formatDate(row.load_in_date)}
                          </div>
                        </td>

                        <td class="p-4 max-w-[200px] truncate text-gray-500">
                          {row.load_in_notes || (
                            <span class="text-gray-300 italic">
                              Tidak ada catatan
                            </span>
                          )}
                        </td>

                        <td class="p-4 text-center">
                          <div class="flex items-center justify-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                            {/* Tombol View */}
                            <button
                              onClick={() =>
                                navigate(`/admin/load-in/${row.id}`)
                              }
                              class="p-2 text-blue-600 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors"
                              title="Lihat Detail"
                            >
                              <Eye size={18} />
                            </button>

                            {/* Tombol Edit */}
                            <button
                              onClick={() =>
                                navigate(`/admin/load-in/edit/${row.id}`)
                              }
                              class="p-2 text-orange-500 hover:bg-orange-50 hover:text-orange-600 rounded-lg transition-colors"
                              title="Edit"
                            >
                              <Edit size={18} />
                            </button>

                            {/* Tombol Hapus */}
                            <button
                              onClick={() => remove(row.id)}
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

            {/* FOOTER TABEL (Optional, buat pemanis aja) */}
            <div class="p-4 border-t border-gray-100 bg-gray-50/30 text-xs text-gray-400 font-medium text-right">
              Total: {data()?.length || 0} Data Load-In
            </div>
          </Show>
        </div>
      </div>
    </div>
  );
}
