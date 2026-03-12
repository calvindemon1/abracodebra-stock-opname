import { createResource, createSignal, For, Show, onMount } from "solid-js";
import { CustomersService } from "../../../services/customers";
import { Edit, CircleX, Users, Plus, Save, X } from "lucide-solid"; // Pake icon Users
import Swal from "sweetalert2";

export default function Customer() {
  // ===== ANIMATION STATE =====
  const [isMounted, setIsMounted] = createSignal(false);

  const [customers, { refetch }] = createResource(() =>
    CustomersService.list(),
  );

  const [name, setName] = createSignal("");
  const [editingId, setEditingId] = createSignal(null);
  const [loading, setLoading] = createSignal(false);

  onMount(() => {
    // Trigger animasi muncul setelah komponen di-render
    setTimeout(() => setIsMounted(true), 50);
  });

  const submit = async () => {
    if (!name()) {
      return Swal.fire({
        icon: "warning",
        title: "Oops...",
        text: "Nama customer tidak boleh kosong!",
        confirmButtonColor: "#000",
      });
    }

    setLoading(true);

    try {
      if (editingId()) {
        await CustomersService.update(editingId(), { customer: name() });
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Customer berhasil diperbarui ✅",
          confirmButtonColor: "#10b981",
        });
      } else {
        await CustomersService.create({ customer: name() });
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Customer berhasil ditambahkan ✅",
          confirmButtonColor: "#10b981",
        });
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Gagal menyimpan data customer ❌",
        confirmButtonColor: "#ef4444",
      });
    }

    setName("");
    setEditingId(null);
    setLoading(false);
    refetch();
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    // Handle perbedaan field name (customer vs customer_name)
    setName(item.customer || item.customer_name);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setName("");
  };

  const remove = async (id) => {
    const confirm = await Swal.fire({
      title: "Hapus customer?",
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
      await CustomersService.delete(id);
      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Customer berhasil dihapus ✅",
        confirmButtonColor: "#10b981",
      });
      refetch();
    } catch {
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Gagal menghapus data customer ❌",
        confirmButtonColor: "#ef4444",
      });
    }
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

      {/* CONTAINER UTAMA (Lebar dibatasi max-w-4xl) */}
      <div
        class={`max-w-4xl mx-auto space-y-6 transition-all duration-700 ease-out transform ${
          isMounted() ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        {/* HEADER */}
        <div class="flex items-center gap-4 mb-6">
          <div class="w-12 h-12 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center text-gray-700">
            <Users size={24} />
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-800 tracking-tight">
              Master Customers
            </h1>
            <p class="text-sm text-gray-500 mt-0.5">
              Kelola daftar pelanggan atau klien perusahaan.
            </p>
          </div>
        </div>

        {/* INPUT FORM SECTION */}
        <div class="bg-white p-5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
          <label class="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">
            {editingId() ? "Edit Customer" : "Add New Customer"}
          </label>
          <div class="flex flex-col sm:flex-row gap-3">
            <div class="relative flex-1">
              <input
                type="text"
                class={`w-full px-4 py-2.5 rounded-xl text-sm transition-all duration-200 outline-none border ${
                  editingId()
                    ? "bg-blue-50/50 border-blue-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-50"
                    : "bg-gray-50/50 border-gray-200 focus:border-gray-400 focus:ring-4 focus:ring-gray-100"
                } ${loading() ? "opacity-60 cursor-not-allowed" : ""}`}
                placeholder="e.g. BYD, BCA, Mandiri, ..."
                value={name()}
                onInput={(e) => setName(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !loading() && submit()}
                disabled={loading()}
              />
            </div>

            <div class="flex gap-2">
              <button
                onClick={submit}
                disabled={loading()}
                class={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium text-white transition-all duration-200 hover:-translate-y-0.5 active:scale-95 disabled:opacity-70 disabled:hover:translate-y-0 disabled:active:scale-100 disabled:cursor-not-allowed ${
                  editingId()
                    ? "bg-blue-600 hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20"
                    : "bg-black hover:bg-gray-800 hover:shadow-lg"
                }`}
              >
                {loading() ? (
                  <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : editingId() ? (
                  <Save size={16} />
                ) : (
                  <Plus size={16} />
                )}
                {loading() ? "Saving..." : editingId() ? "Update" : "Add Data"}
              </button>

              <Show when={editingId() && !loading()}>
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
                <th class="p-4 font-semibold">Customer Name</th>
                <th class="p-4 font-semibold text-center w-32">Actions</th>
              </tr>
            </thead>

            <tbody class="divide-y divide-gray-50">
              {/* Loading State */}
              <Show when={customers.loading && !loading()}>
                <tr>
                  <td colspan="3" class="p-12 text-center">
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-black mx-auto mb-4"></div>
                    <p class="text-gray-500 text-sm font-medium">
                      Memuat data...
                    </p>
                  </td>
                </tr>
              </Show>

              {/* Empty State */}
              <Show
                when={
                  !customers.loading &&
                  (!customers() || customers()?.data?.length === 0)
                }
              >
                <tr>
                  <td colspan="3" class="p-12 text-center text-gray-500">
                    <Users size={40} class="mx-auto text-gray-300 mb-3" />
                    <p class="font-medium text-gray-600">
                      Belum ada data customer
                    </p>
                    <p class="text-sm mt-1">
                      Silakan tambah customer melalui form di atas.
                    </p>
                  </td>
                </tr>
              </Show>

              {/* Data Rows */}
              <For each={customers()?.data || []}>
                {(item, i) => (
                  <tr
                    class="animate-row hover:bg-gray-50/80 transition-colors duration-200 group"
                    style={{ "animation-delay": `${i() * 0.05}s` }}
                  >
                    <td class="p-4 text-center text-gray-400 font-medium">
                      {i() + 1}
                    </td>
                    <td class="p-4 font-medium text-gray-700 flex items-center gap-3">
                      {/* Aksen titik warna Orange khusus Customer */}
                      <div class="w-2 h-2 rounded-full bg-orange-300 group-hover:bg-orange-500 transition-colors"></div>
                      {item.customer || item.customer_name}
                    </td>
                    <td class="p-4 text-center">
                      <div class="flex items-center justify-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                        <button
                          class="p-2 text-blue-600 hover:bg-blue-50 hover:text-blue-700 rounded-lg transition-colors"
                          title="Edit"
                          onClick={() => startEdit(item)}
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
