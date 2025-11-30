import { createResource, createSignal, For, Show } from "solid-js";
import { ConditionsService } from "../../services/conditions";
import { CircleX, Edit } from "lucide-solid";
import Swal from "sweetalert2";

export default function Conditions() {
  const [conditions, { refetch }] = createResource(() =>
    ConditionsService.list()
  );

  const [name, setName] = createSignal("");
  const [editingId, setEditingId] = createSignal(null);

  const submit = async () => {
    if (!name()) {
      return Swal.fire({
        icon: "warning",
        title: "Form belum lengkap",
        text: "Nama kondisi wajib diisi!",
      });
    }

    try {
      if (editingId()) {
        await ConditionsService.update(editingId(), { condition_name: name() });
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Kondisi berhasil diperbarui ✅",
        });
      } else {
        await ConditionsService.create({ condition_name: name() });
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Kondisi berhasil ditambahkan ✅",
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
      });
    }
  };

  const remove = async (id) => {
    const confirm = await Swal.fire({
      title: "Hapus data?",
      text: "Data kondisi akan terhapus permanen.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Hapus",
      cancelButtonText: "Batal",
    });

    if (!confirm.isConfirmed) return;

    try {
      await ConditionsService.delete(id);

      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Kondisi berhasil dihapus ✅",
      });

      refetch();
    } catch {
      Swal.fire({
        icon: "error",
        title: "Gagal!",
        text: "Tidak dapat menghapus data ❌",
      });
    }
  };

  return (
    <div>
      <h1 class="text-2xl font-bold mb-4">Conditions</h1>

      <div class="bg-white p-4 rounded shadow mb-4 flex gap-2">
        <input
          class="border p-2 w-full rounded"
          placeholder="Condition name"
          value={name()}
          onInput={(e) => setName(e.target.value)}
        />

        <button class="bg-blue-600 text-white px-4 rounded" onClick={submit}>
          {editingId() ? "Update" : "Add"}
        </button>

        {editingId() && (
          <button
            class="bg-gray-400 text-white px-4 rounded"
            onClick={() => {
              setEditingId(null);
              setName("");
            }}
          >
            Cancel
          </button>
        )}
      </div>

      <table class="w-full bg-white rounded shadow">
        <thead>
          <tr class="border-b text-left">
            <th class="p-2">#</th>
            <th class="p-2">Name</th>
            <th class="p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          <Show when={conditions.loading}>
            <tr>
              <td colspan="3" class="p-4 text-center">
                Loading...
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
              <td colspan="3" class="p-4 text-center text-gray-500">
                No data found
              </td>
            </tr>
          </Show>

          <For each={conditions()?.data || []}>
            {(item, i) => (
              <tr class="border-b">
                <td class="p-2">{i() + 1}</td>
                <td class="p-2">{item.condition_name}</td>
                <td class="p-2 flex gap-2">
                  <button
                    class="text-blue-600"
                    onClick={() => {
                      setEditingId(item.id);
                      setName(item.condition_name);
                    }}
                  >
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
