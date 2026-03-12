import { createResource, createSignal, For, Show, onMount } from "solid-js";
import { MembersService } from "../../../services/members";
import { DivisionsService } from "../../../services/divisions";
import { PositionsService } from "../../../services/positions"; // <-- Manggil API Master Posisi/Role
import {
  Edit,
  CircleX,
  Users,
  Plus,
  Save,
  X,
  Building2,
  Briefcase,
} from "lucide-solid";
import Swal from "sweetalert2";

export default function Members() {
  // ===== ANIMATION STATE =====
  const [isMounted, setIsMounted] = createSignal(false);

  // ===== FETCH DATA =====
  const [members, { refetch: refetchMembers }] = createResource(() =>
    MembersService.list(),
  );
  const [divisions] = createResource(() => DivisionsService.list());
  const [positions] = createResource(() => PositionsService.list()); // <-- Fetch data Posisi

  // ===== FORM STATE =====
  const [name, setName] = createSignal("");
  const [divisionId, setDivisionId] = createSignal("");
  const [positionId, setPositionId] = createSignal(""); // <-- State baru buat Posisi
  const [editingId, setEditingId] = createSignal(null);
  const [loading, setLoading] = createSignal(false);

  onMount(() => {
    setTimeout(() => setIsMounted(true), 50);
  });

  const submit = async () => {
    if (!name() || !divisionId() || !positionId()) {
      return Swal.fire({
        icon: "warning",
        title: "Kolom belum lengkap",
        text: "Nama karyawan, Divisi, dan Posisi wajib diisi!",
        confirmButtonColor: "#000",
      });
    }

    setLoading(true);
    try {
      // Payload disesuaikan dengan kebutuhan API lu
      const payload = {
        name: name(),
        division_id: divisionId(),
        position_id: positionId(), // <-- Kirim ID posisi
      };

      if (editingId()) {
        await MembersService.update(editingId(), payload);
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Data anggota berhasil diperbarui ✅",
          confirmButtonColor: "#10b981",
        });
      } else {
        await MembersService.create(payload);
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Anggota baru berhasil ditambahkan ✅",
          confirmButtonColor: "#10b981",
        });
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Gagal menyimpan data ❌",
        confirmButtonColor: "#ef4444",
      });
    }

    // Reset Form
    setName("");
    setDivisionId("");
    setPositionId("");
    setEditingId(null);
    setLoading(false);
    refetchMembers();
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setName(item.name || item.member_name);
    setDivisionId(item.division_id);
    setPositionId(item.position_id || item.role_id); // Disesuaikan sama response API
  };

  const cancelEdit = () => {
    setEditingId(null);
    setName("");
    setDivisionId("");
    setPositionId("");
  };

  const remove = async (id) => {
    const confirm = await Swal.fire({
      title: "Hapus Anggota?",
      text: "Data yang dihapus tidak dapat dikembalikan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Hapus",
      cancelButtonText: "Batal",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#f3f4f6",
      customClass: { cancelButton: "text-gray-800" },
    });

    if (!confirm.isConfirmed) return;

    try {
      await MembersService.delete(id);
      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Data anggota berhasil dihapus ✅",
        confirmButtonColor: "#10b981",
      });
      refetchMembers();
    } catch {
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Gagal menghapus data ❌",
        confirmButtonColor: "#ef4444",
      });
    }
  };

  return (
    <div class="p-6 bg-gray-50/50 min-h-screen font-sans pb-24">
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

      <div
        class={`max-w-6xl mx-auto space-y-6 transition-all duration-700 ease-out transform ${
          isMounted() ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        {/* HEADER */}
        <div class="flex items-center gap-4 mb-6">
          <div class="w-12 h-12 bg-white rounded-2xl shadow-sm border border-gray-100 flex items-center justify-center text-emerald-600">
            <Users size={24} />
          </div>
          <div>
            <h1 class="text-2xl font-bold text-gray-800 tracking-tight">
              Master Karyawan
            </h1>
            <p class="text-sm text-gray-500 mt-0.5">
              Kelola data nama karyawan, divisi, beserta posisi/role-nya.
            </p>
          </div>
        </div>

        {/* INPUT FORM SECTION */}
        <div class="bg-white p-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
          <label class="block text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">
            {editingId() ? "Edit Anggota" : "Tambah Anggota Baru"}
          </label>

          {/* Form diubah jadi Grid 3 Kolom biar rapi */}
          <div class="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
            {/* INPUT NAMA */}
            <div>
              <label class="block text-xs font-semibold text-gray-500 mb-1.5 ml-1">
                Nama Karyawan <span class="text-red-500">*</span>
              </label>
              <input
                type="text"
                class={`w-full px-4 py-2.5 rounded-xl text-sm transition-all duration-200 outline-none border ${
                  editingId()
                    ? "bg-emerald-50/50 border-emerald-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50"
                    : "bg-gray-50/50 border-gray-200 focus:border-gray-400 focus:ring-4 focus:ring-gray-100"
                } ${loading() ? "opacity-60 cursor-not-allowed" : ""}`}
                placeholder="Misal: Jevin, Reyza..."
                value={name()}
                onInput={(e) => setName(e.target.value)}
                disabled={loading()}
              />
            </div>

            {/* DROPDOWN DIVISI */}
            <div>
              <label class="block text-xs font-semibold text-gray-500 mb-1.5 ml-1">
                Asal Divisi <span class="text-red-500">*</span>
              </label>
              <select
                class={`w-full px-4 py-2.5 rounded-xl text-sm transition-all duration-200 outline-none border ${
                  editingId()
                    ? "bg-emerald-50/50 border-emerald-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50"
                    : "bg-gray-50/50 border-gray-200 focus:border-gray-400 focus:ring-4 focus:ring-gray-100"
                } ${loading() ? "opacity-60 cursor-not-allowed" : ""}`}
                value={divisionId()}
                onChange={(e) => setDivisionId(e.target.value)}
                disabled={loading() || divisions.loading}
              >
                <option value="" disabled>
                  -- Pilih Divisi --
                </option>
                <Show
                  when={!divisions.loading}
                  fallback={<option disabled>Memuat Divisi...</option>}
                >
                  <For each={divisions()?.data || []}>
                    {(div) => (
                      <option value={div.id}>
                        {div.name || div.division_name}
                      </option>
                    )}
                  </For>
                </Show>
              </select>
            </div>

            {/* DROPDOWN POSISI/ROLE */}
            <div>
              <label class="block text-xs font-semibold text-gray-500 mb-1.5 ml-1">
                Posisi / Role <span class="text-red-500">*</span>
              </label>
              <select
                class={`w-full px-4 py-2.5 rounded-xl text-sm transition-all duration-200 outline-none border ${
                  editingId()
                    ? "bg-emerald-50/50 border-emerald-200 focus:border-emerald-400 focus:ring-4 focus:ring-emerald-50"
                    : "bg-gray-50/50 border-gray-200 focus:border-gray-400 focus:ring-4 focus:ring-gray-100"
                } ${loading() ? "opacity-60 cursor-not-allowed" : ""}`}
                value={positionId()}
                onChange={(e) => setPositionId(e.target.value)}
                disabled={loading() || positions.loading}
              >
                <option value="" disabled>
                  -- Pilih Posisi --
                </option>
                <Show
                  when={!positions.loading}
                  fallback={<option disabled>Memuat Posisi...</option>}
                >
                  <For each={positions()?.data || []}>
                    {(pos) => (
                      <option value={pos.id}>
                        {pos.name || pos.position_name}
                      </option>
                    )}
                  </For>
                </Show>
              </select>
            </div>
          </div>

          {/* BUTTONS (Pindah ke bawah kanan) */}
          {/* BUTTONS (Full Width) */}
          <div class="flex w-full gap-3 pt-4 mt-2 border-t border-gray-100">
            <Show when={editingId() && !loading()}>
              <button
                onClick={cancelEdit}
                class="flex-1 flex justify-center items-center gap-2 py-2.5 rounded-xl text-sm font-medium text-gray-500 border border-gray-200 hover:text-gray-800 hover:bg-gray-50 transition-all active:scale-95"
              >
                Batal
              </button>
            </Show>

            <button
              onClick={submit}
              disabled={loading()}
              class={`flex-1 flex justify-center items-center gap-2 py-2.5 rounded-xl text-sm font-medium text-white transition-all duration-200 hover:-translate-y-0.5 active:scale-95 disabled:opacity-70 disabled:hover:translate-y-0 disabled:active:scale-100 disabled:cursor-not-allowed ${
                editingId()
                  ? "bg-emerald-600 hover:bg-emerald-700 hover:shadow-lg hover:shadow-emerald-600/20"
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
              {loading()
                ? "Menyimpan..."
                : editingId()
                  ? "Update Data"
                  : "Simpan Karyawan"}
            </button>
          </div>
        </div>

        {/* TABLE SECTION */}
        <div class="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="min-w-full text-sm text-left">
              <thead class="bg-gray-50/80 text-gray-500 text-xs uppercase tracking-widest border-b border-gray-100">
                <tr>
                  <th class="p-4 font-semibold text-center w-16">No</th>
                  <th class="p-4 font-semibold">Nama Karyawan</th>
                  <th class="p-4 font-semibold">Divisi</th>
                  <th class="p-4 font-semibold">Posisi / Role</th>
                  <th class="p-4 font-semibold text-center w-32">Actions</th>
                </tr>
              </thead>

              <tbody class="divide-y divide-gray-50">
                {/* Loading State */}
                <Show when={members.loading && !loading()}>
                  <tr>
                    <td colspan="5" class="p-12 text-center">
                      <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600 mx-auto mb-4"></div>
                      <p class="text-gray-500 text-sm font-medium">
                        Memuat data...
                      </p>
                    </td>
                  </tr>
                </Show>

                {/* Empty State */}
                <Show
                  when={
                    !members.loading &&
                    (!members() || members()?.data?.length === 0)
                  }
                >
                  <tr>
                    <td colspan="5" class="p-12 text-center text-gray-500">
                      <Users size={40} class="mx-auto text-gray-300 mb-3" />
                      <p class="font-medium text-gray-600">
                        Belum ada data anggota
                      </p>
                      <p class="text-sm mt-1">
                        Silakan tambah melalui form di atas.
                      </p>
                    </td>
                  </tr>
                </Show>

                {/* Data Rows */}
                <For each={members()?.data || []}>
                  {(item, i) => (
                    <tr
                      class="animate-row hover:bg-gray-50/80 transition-colors duration-200 group"
                      style={{ "animation-delay": `${i() * 0.05}s` }}
                    >
                      <td class="p-4 text-center text-gray-400 font-medium">
                        {i() + 1}
                      </td>
                      <td class="p-4 font-bold text-gray-800">
                        {item.name || item.member_name}
                      </td>
                      <td class="p-4">
                        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-md border border-blue-100">
                          <Building2 size={12} />
                          {item.division_name || "Unknown"}
                        </span>
                      </td>
                      <td class="p-4">
                        {/* Tambahan Badge untuk Posisi */}
                        <span class="inline-flex items-center gap-1.5 px-2.5 py-1 bg-purple-50 text-purple-700 text-xs font-bold rounded-md border border-purple-100">
                          <Briefcase size={12} />
                          {item.position_name || item.role_name || "Unknown"}
                        </span>
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
    </div>
  );
}
