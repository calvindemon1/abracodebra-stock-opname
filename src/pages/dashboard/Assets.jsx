import {
  createSignal,
  createResource,
  For,
  Show,
  onMount,
  createEffect,
} from "solid-js";
import { useNavigate } from "@solidjs/router";
import Swal from "sweetalert2";
import { ItemsService } from "../../services/items";
import { CircleX, Edit } from "lucide-solid";
import TableFilter from "../../components/ui/TableFilter";

export default function Assets() {
  const navigate = useNavigate();
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
      ItemsService.list({ search, sort, location, condition, page, limit })
  );

  const paginatedData = () => {
    if (!items()) return [];
    const start = (page() - 1) * limit();
    return items()?.slice(start, start + limit());
  };

  const totalPages = () => Math.ceil((items()?.length || 1) / limit());

  //   onMount(() => {
  //     console.log("Assets component mounted:", items()?.data);
  //   });createEffect(() => {
  //   console.log("Filters changed:", filters());
  // });

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
      items.refetch();
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
      {/* {console.log("API RESPONSE:", items())} */}

      <div class="flex justify-between items-center">
        <h1 class="text-2xl font-bold">Assets Dashboard</h1>

        <button
          class="bg-blue-600 text-white px-4 py-2 rounded"
          onClick={() => navigate("/admin/asset/create")}
        >
          + Tambah Asset
        </button>
      </div>

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
      <div class="bg-white rounded shadow p-4">
        <Show when={items.loading}>
          <div class="p-4 text-center">Loading...</div>
        </Show>

        <Show when={!items.loading && items()?.length === 0}>
          <div class="p-4 text-center text-gray-500">Tidak ada data asset</div>
        </Show>

        <Show when={!items.loading && items()?.length > 0}>
          <div class="overflow-y-auto max-h-[60vh] border">
            <table class="w-full text-sm border-collapse">
              <thead class="bg-gray-200 sticky top-0">
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
                <For each={paginatedData()}>
                  {(item, i) => (
                    <tr>
                      <td class="border p-2 text-center">
                        {(page() - 1) * limit() + i() + 1}
                      </td>
                      <td class="border p-2">{item.asset_code}</td>
                      <td class="border p-2">{item.asset_name}</td>
                      <td class="border p-2">{item.location_name}</td>
                      <td class="border p-2">{item.condition_name}</td>
                      <td class="border p-2 flex gap-2 justify-center">
                        <button
                          class="text-blue-600"
                          onClick={() =>
                            navigate(`/admin/asset/edit/${item.id}`)
                          }
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

          {/* Pagination */}
          <div class="flex justify-between items-center mt-4">
            <button
              class="px-3 py-1 bg-gray-300 rounded disabled:opacity-40"
              disabled={page() === 1}
              onClick={() => setPage(page() - 1)}
            >
              Prev
            </button>

            <span>
              Page {page()} / {totalPages()}
            </span>

            <button
              class="px-3 py-1 bg-gray-300 rounded disabled:opacity-40"
              disabled={page() >= totalPages()}
              onClick={() => setPage(page() + 1)}
            >
              Next
            </button>
          </div>
        </Show>
      </div>
    </div>
  );
}
