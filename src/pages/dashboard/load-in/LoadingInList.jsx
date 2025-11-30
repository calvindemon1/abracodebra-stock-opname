import { createResource, For, Show } from "solid-js";
import { useNavigate } from "@solidjs/router";
import Swal from "sweetalert2";
import { LoadInService } from "../../../services/loadIn";
import { CircleX, Edit, Eye } from "lucide-solid";

export default function LoadingInList() {
  const navigate = useNavigate();
  const [data, { refetch }] = createResource(() => LoadInService.list());

  const remove = async (id) => {
    const confirm = await Swal.fire({
      title: "Hapus?",
      text: "Data yang dihapus tidak dapat dikembalikan",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Hapus",
    });
    if (!confirm.isConfirmed) return;
    await LoadInService.delete(id);
    Swal.fire("Berhasil", "Data dihapus", "success");
    refetch();
  };

  return (
    <div class="p-6 space-y-4">
      <div class="flex justify-between items-center">
        <h1 class="text-2xl font-bold">Loading In</h1>
        <div class="space-x-2">
          <button
            class="bg-blue-600 text-white px-4 py-2 rounded"
            onClick={() => navigate("/admin/load-in/create")}
          >
            + Create
          </button>
        </div>
      </div>

      <div class="bg-white rounded shadow p-4 overflow-x-auto">
        <Show when={data.loading}>
          <div class="p-4 text-center">Loading...</div>
        </Show>

        <Show when={!data.loading && (!data() || data().length === 0)}>
          <div class="p-4 text-center text-gray-500">Tidak ada data</div>
        </Show>

        <Show when={!data.loading && data()?.length > 0}>
          <table class="w-full text-sm border-collapse border">
            <thead class="bg-gray-100">
              <tr>
                <th class="border p-2">#</th>
                <th class="border p-2">Event</th>
                <th class="border p-2">PIC</th>
                <th class="border p-2">Tanggal</th>
                <th class="border p-2">Notes</th>
                <th class="border p-2 w-28">Aksi</th>
              </tr>
            </thead>
            <tbody>
              <For each={data()}>
                {(row, i) => (
                  <tr>
                    <td class="border p-2 text-center">{i() + 1}</td>
                    <td class="border p-2">{row.event_name ?? row.event_id}</td>
                    <td class="border p-2">{row.pic_load_in}</td>
                    <td class="border p-2">{row.load_in_date}</td>
                    <td class="border p-2">{row.load_in_notes}</td>
                    <td class="border p-2 flex gap-2 justify-center">
                      <button
                        class="text-blue-600"
                        onClick={() => navigate(`/admin/load-in/${row.id}`)}
                      >
                        <Eye size={18} />
                      </button>
                      <button
                        class="text-yellow-600"
                        onClick={() =>
                          navigate(`/admin/load-in/create/${row.id}`)
                        }
                      >
                        <Edit size={18} />
                      </button>
                      <button
                        class="text-red-600"
                        onClick={() => remove(row.id)}
                      >
                        <CircleX size={18} />
                      </button>
                    </td>
                  </tr>
                )}
              </For>
            </tbody>
          </table>
        </Show>
      </div>
    </div>
  );
}
