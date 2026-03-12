import { createResource, createSignal, For, Show, onMount } from "solid-js";
import { ConditionsService } from "../../../services/conditions";
import { CircleX, Edit, Plus, Save, X, Activity } from "lucide-solid";
import Swal from "sweetalert2";

export default function Conditions() {
  // ===== ANIMATION STATE =====
  const [isMounted, setIsMounted] = createSignal(false);

  const [conditions, { refetch }] = createResource(() =>
    ConditionsService.list(),
  );

  const [name, setName] = createSignal("");
  const [editingId, setEditingId] = createSignal(null);

  onMount(() => {
    // Trigger animasi setelah komponen di-render
    setTimeout(() => setIsMounted(true), 50);
  });

  const submit = async () => {
    if (!name()) {
      return Swal.fire({
        icon: "warning",
        title: "Form belum lengkap",
        text: "Nama kondisi wajib diisi!",
        confirmButtonColor: "#000",
      });
    }

    try {
      if (editingId()) {
        await ConditionsService.update(editingId(), { condition_name: name() });
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Kondisi berhasil diperbarui ✅",
          confirmButtonColor: "#10b981",
        });
      } else {
        await ConditionsService.create({ condition_name: name() });
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Kondisi berhasil ditambahkan ✅",
          confirmButtonColor: "#10b981",
        });
      }

      setName("");
      setEditingId(null);
      refetch();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Gagal!",
        text: "Terjadi kesalahan saat menyimpan data ❌",
        confirmButtonColor: "#ef4444",
      });
    }
  };

  const remove = async (id) => {
    const confirm = await Swal.fire({
      title: "Hapus data?",
      text: "Data kondisi akan terhapus permanen.",
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
      await ConditionsService.delete(id);
      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Kondisi berhasil dihapus ✅",
        confirmButtonColor: "#10b981",
      });
      refetch();
    } catch {
      Swal.fire({
        icon: "error",
        title: "Gagal!",
        text: "Tidak dapat menghapus data ❌",
        confirmButtonColor: "#ef4444",
      });
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setName("");
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
      `}</style>

      {/* CONTAINER UTAMA (Lebar dibatasi max-w-4xl biar form-nya nggak kepanjangan) */}
      <div
        class={`max-w-4xl mx-auto space-y-6 transition-all duration-700 ease-out transform ${
          isMounted() ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        {/* HEADER */}
        <div class="flex items-center gap-4 mb-6">
          <div class="w-12 h-12 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center text-gray-700">
            <Activity size={24} />
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-800 tracking-tight">
              Master Conditions
            </h1>
            <p class="text-sm text-gray-500 mt-0.5">
              Kelola daftar kondisi untuk status aset perusahaan.
            </p>
          </div>
        </div>

        {/* INPUT FORM SECTION */}
        <div class="bg-white p-5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
          <label class="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
            {editingId() ? "Edit Condition" : "Add New Condition"}
          </label>
          <div class="flex flex-col sm:flex-row gap-3">
            <div class="relative flex-1">
              <input
                type="text"
                class={`w-full px-4 py-2.5 rounded-xl text-sm transition-all duration-200 outline-none border ${
                  editingId()
                    ? "bg-blue-50/50 border-blue-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
                    : "bg-gray-50/50 border-gray-200 focus:border-gray-400 focus:ring-4 focus:ring-gray-100"
                }`}
                placeholder="e.g. Kondisi Baik, Rusak Ringan, dll..."
                value={name()}
                onInput={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && submit()}
              />
            </div>

            <div class="flex gap-2">
              <button
                onClick={submit}
                class={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium text-white transition-all duration-200 hover:-translate-y-0.5 active:scale-95 ${
                  editingId()
                    ? "bg-blue-600 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20"
                    : "bg-black hover:bg-gray-800 hover:shadow-lg"
                }`}
              >
                {editingId() ? <Save size={16} /> : <Plus size={16} />}
                {editingId() ? "Update" : "Add Data"}
              </button>

              <Show when={editingId()}>
                <button
                  onClick={cancelEdit}
                  class="flex items-center justify-center gap-1 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-500 hover:text-red-600 hover:bg-red-50 transition-all active:scale-95"
                  title="Cancel Edit"
                >
                  <X size={18} />
                </button>
              </Show>
            </div>
          </div>
        </div>

        {/* TABLE SECTION */}
        <div class="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
          <table class="min-w-full text-sm text-left">
            <thead class="bg-gray-50/80 text-gray-500 text-xs uppercase tracking-widest border-b border-gray-100">
              <tr>
                <th class="p-4 font-semibold text-center w-16">No</th>
                <th class="p-4 font-semibold">Condition Name</th>
                <th class="p-4 font-semibold text-center w-32">Actions</th>
              </tr>
            </thead>

            <tbody class="divide-y divide-gray-50">
              <Show when={conditions.loading}>
                <tr>
                  <td colspan="3" class="p-12 text-center">
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
                    <p class="text-gray-500 text-sm font-medium">
                      Memuat data...
                    </p>
                  </td>
                </tr>
              </Show>

              <Show
                when={
                  !conditions.loading &&
                  (!conditions() || conditions().data.length === 0)
                }
              >
                <tr>
                  <td colspan="3" class="p-12 text-center text-gray-500">
                    <Activity size={40} class="mx-auto text-gray-300 mb-3" />
                    <p class="font-medium text-gray-600">
                      Belum ada data kondisi
                    </p>
                    <p class="text-sm mt-1">
                      Silakan tambah data melalui form di atas.
                    </p>
                  </td>
                </tr>
              </Show>

              <For each={conditions()?.data || []}>
                {(item, i) => (
                  <tr
                    class="animate-row hover:bg-gray-50/80 transition-colors duration-200 group"
                    style={{ "animation-delay": `${i() * 0.05}s` }}
                  >
                    <td class="p-4 text-center text-gray-400 font-medium">
                      {i() + 1}
                    </td>
                    <td class="p-4 font-medium text-gray-700 flex items-center gap-3">
                      <div class="w-2 h-2 rounded-full bg-gray-300 group-hover:bg-black transition-colors"></div>
                      {item.condition_name}
                    </td>
                    <td class="p-4 text-center">
                      <div class="flex items-center justify-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button
                          class="p-2 text-blue-600 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors"
                          title="Edit"
                          onClick={() => {
                            setEditingId(item.id);
                            setName(item.condition_name);
                          }}
                        >
                          <Edit size={18} />
                        </button>
                        <button
                          class="p-2 text-red-500 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                          title="Hapus"
                          onClick={() => remove(item.id)}
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
      </div>
    </div>
  );
}
