import { createResource, createSignal, For, Show } from "solid-js";
import { EventsService } from "../../services/events";
import { Edit, CircleX } from "lucide-solid";
import Swal from "sweetalert2";

export default function Events() {
  const [events, { refetch }] = createResource(() => EventsService.list());

  const [name, setName] = createSignal("");
  const [editingId, setEditingId] = createSignal(null);
  const [loading, setLoading] = createSignal(false);

  const submit = async () => {
    if (!name()) {
      return Swal.fire({
        icon: "warning",
        title: "Kolom belum diisi",
        text: "Nama event tidak boleh kosong!",
      });
    }

    setLoading(true);
    try {
      if (editingId()) {
        await EventsService.update(editingId(), { event_name: name() });
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Event berhasil diperbarui ✅",
        });
      } else {
        await EventsService.create({ event_name: name() });
        Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Event berhasil ditambahkan ✅",
        });
      }
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Gagal menyimpan event ❌",
      });
    }

    setName("");
    setEditingId(null);
    setLoading(false);
    refetch();
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setName(item.event_name);
  };

  const remove = async (id) => {
    const confirm = await Swal.fire({
      title: "Hapus event?",
      text: "Event yang dihapus tidak dapat dikembalikan!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Hapus",
      cancelButtonText: "Batal",
    });

    if (!confirm.isConfirmed) return;

    try {
      await EventsService.delete(id);
      Swal.fire({
        icon: "success",
        title: "Berhasil!",
        text: "Event berhasil dihapus ✅",
      });
      refetch();
    } catch {
      Swal.fire({
        icon: "error",
        title: "Error!",
        text: "Gagal menghapus event ❌",
      });
    }
  };

  return (
    <div>
      <h1 class="text-2xl font-bold mb-4">Events</h1>

      {/* Form */}
      <div class="bg-white p-4 rounded shadow mb-4 flex gap-2">
        <input
          class="border p-2 flex-1 rounded"
          placeholder="Event name"
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
            <th class="p-2">Event Name</th>
            <th class="p-2 w-32">Actions</th>
          </tr>
        </thead>
        <tbody>
          {/* Loading */}
          <Show when={events.loading}>
            <tr>
              <td colspan="3" class="p-4 text-center">
                Loading...
              </td>
            </tr>
          </Show>

          {/* Empty */}
          <Show
            when={
              !events.loading && (!events() || events()?.data?.length === 0)
            }
          >
            <tr>
              <td colspan="3" class="p-4 text-center text-gray-500">
                No events found
              </td>
            </tr>
          </Show>

          {/* Data */}
          <For each={events()?.data || []}>
            {(item, i) => (
              <tr class="border-b">
                <td class="p-2">{i() + 1}</td>
                <td class="p-2">{item.event_name}</td>
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
