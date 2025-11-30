import { createResource, createSignal, For, Show } from "solid-js";
import { LocationsService } from "../../services/locations";
import { Edit, CircleX } from "lucide-solid";
import Swal from "sweetalert2";

export default function Locations() {
  const [locations, { refetch }] = createResource(() =>
    LocationsService.list()
  );

  const [name, setName] = createSignal("");
  const [editingId, setEditingId] = createSignal(null);
  const [loading, setLoading] = createSignal(false);

  const submit = async () => {
    if (!name()) {
      return Swal.fire({
        icon: "warning",
        title: "Oops...",
        text: "Nama lokasi tidak boleh kosong!",
      });
    }

    setLoading(true);
    try {
      if (editingId()) {
        await LocationsService.update(editingId(), { location_name: name() });
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Lokasi berhasil diperbarui ✅",
        });
      } else {
        await LocationsService.create({ location_name: name() });
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Lokasi berhasil ditambahkan ✅",
        });
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Gagal menyimpan lokasi ❌",
      });
    }

    setName("");
    setEditingId(null);
    setLoading(false);
    refetch();
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setName(item.location_name);
  };

  const remove = async (id) => {
    const confirm = await Swal.fire({
      title: "Hapus lokasi?",
      text: "Lokasi yang dihapus tidak dapat dikembalikan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Hapus",
      cancelButtonText: "Batal",
    });

    if (!confirm.isConfirmed) return;

    try {
      await LocationsService.delete(id);
      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Lokasi berhasil dihapus ✅",
      });
      refetch();
    } catch {
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Gagal menghapus lokasi ❌",
      });
    }
  };

  return (
    <div>
      <h1 class="text-2xl font-bold mb-4">Locations</h1>

      {/* Form */}
      <div class="bg-white p-4 rounded shadow mb-4 flex gap-2">
        <input
          class="border p-2 flex-1 rounded"
          placeholder="Location name"
          value={name()}
          onInput={(e) => setName(e.target.value)}
        />

        <button
          class="bg-blue-600 text-white px-4 rounded disabled:opacity-50"
          onClick={submit}
          disabled={loading()}
        >
          {editingId() ? "Update" : "Add"}
        </button>

        <Show when={editingId()}>
          <button
            class="bg-gray-400 text-white px-4 rounded"
            onClick={() => {
              setEditingId(null);
              setName("");
            }}
          >
            Cancel
          </button>
        </Show>
      </div>

      {/* Table */}
      <table class="w-full bg-white rounded shadow">
        <thead>
          <tr class="border-b text-left">
            <th class="p-2">#</th>
            <th class="p-2">Location Name</th>
            <th class="p-2 w-32">Actions</th>
          </tr>
        </thead>
        <tbody>
          {/* Loading */}
          <Show when={locations.loading}>
            <tr>
              <td colspan="3" class="p-4 text-center">
                Loading...
              </td>
            </tr>
          </Show>

          {/* Empty */}
          <Show
            when={
              !locations.loading &&
              (!locations() || locations()?.data?.length === 0)
            }
          >
            <tr>
              <td colspan="3" class="p-4 text-center text-gray-500">
                No locations found
              </td>
            </tr>
          </Show>

          {/* Data */}
          <For each={locations()?.data || []}>
            {(item, i) => (
              <tr class="border-b">
                <td class="p-2">{i() + 1}</td>
                <td class="p-2">{item.location_name}</td>
                <td class="p-2 flex gap-2">
                  <button class="text-blue-600" onClick={() => startEdit(item)}>
                    <Edit size={20} />
                  </button>
                  <button class="text-red-600" onClick={() => remove(item.id)}>
                    <CircleX size={20} />
                  </button>
                </td>
              </tr>
            )}
          </For>
        </tbody>
      </table>
    </div>
  );
}
