import { createResource, For, Show } from "solid-js";
import { useNavigate } from "@solidjs/router";
import Swal from "sweetalert2";
import { ItemsService } from "../../services/items";
import { CircleX, Edit } from "lucide-solid";

export default function AdminHome() {
  const navigate = useNavigate();

  const [items, { refetch }] = createResource(() => ItemsService.list());

  const remove = async (id) => {
    const confirm = await Swal.fire({
      title: "Hapus asset?",
      text: "Data yang dihapus tidak dapat dikembalikan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Hapus",
      cancelButtonText: "Batal",
    });

    if (!confirm.isConfirmed) return;

    try {
      await ItemsService.delete(id);
      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Asset berhasil dihapus ✅",
      });
      refetch();
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Gagal!",
        text: "Gagal menghapus asset ❌",
      });
    }
  };

  return (
    <div class="p-6 space-y-4">
      <div class="flex justify-between items-center">
        <h1 class="text-2xl font-bold">Assets Dashboard</h1>

        <button
          class="bg-blue-600 text-white px-4 py-2 rounded"
          onClick={() => navigate("/admin/asset/create")}
        >
          + Tambah Asset
        </button>
      </div>

      <div class="bg-white rounded shadow p-4 overflow-x-auto">
        <table class="w-full text-sm border-collapse border">
          <thead class="bg-gray-200">
            <tr>
              <th class="border p-2">#</th>
              <th class="border p-2">Asset Code</th>
              <th class="border p-2">Asset Name</th>
              <th class="border p-2">Location</th>
              <th class="border p-2">Condition</th>
              <th class="border p-2 w-28">Aksi</th>
            </tr>
          </thead>
          <tbody>
            {/* Loading */}
            <Show when={items.loading}>
              <tr>
                <td colspan="6" class="p-4 text-center">
                  Loading...
                </td>
              </tr>
            </Show>

            {/* Empty */}
            <Show
              when={!items.loading && (!items() || items()?.data?.length === 0)}
            >
              <tr>
                <td colspan="6" class="p-4 text-center text-gray-500">
                  Tidak ada data asset
                </td>
              </tr>
            </Show>

            {/* Data */}
            <For each={items()?.data || []}>
              {(item, i) => (
                <tr>
                  <td class="border p-2 text-center">{i() + 1}</td>
                  <td class="border p-2">{item.asset_code}</td>
                  <td class="border p-2">{item.asset_name}</td>
                  <td class="border p-2">{item?.location?.location_name}</td>
                  <td class="border p-2">{item?.condition?.condition_name}</td>
                  <td class="border p-2 flex gap-2 justify-center">
                    <button
                      class="text-blue-600"
                      onClick={() => navigate(`/admin/asset/create/${item.id}`)}
                    >
                      <Edit size={20} />
                    </button>
                    <button
                      class="text-red-600"
                      onClick={() => remove(item.id)}
                    >
                      <CircleX size={20} />
                    </button>
                  </td>
                </tr>
              )}
            </For>
          </tbody>
        </table>
      </div>
    </div>
  );
}
