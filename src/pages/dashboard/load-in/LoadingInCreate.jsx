import { createSignal, onMount, For, onCleanup, createMemo } from "solid-js";
import { useNavigate, useParams } from "@solidjs/router";
import Swal from "sweetalert2";
import { LoadInService } from "../../../services/loadIn";
import { ItemsService } from "../../../services/items";
import { EventsService } from "../../../services/events";
import { LocationsService } from "../../../services/locations";
import { Trash } from "lucide-solid";

export default function LoadingInCreate() {
  const params = useParams();
  const navigate = useNavigate();
  const isEdit = !!params.id;

  const defaultForm = {
    event_id: "",
    pic_load_in: "",
    load_in_date: "",
    load_in_notes: "",
    items: [], // { item_id, qty, notes, location_id }
  };

  const [form, setForm] = createSignal(defaultForm);
  const [itemsOptions, setItemsOptions] = createSignal([]);
  const [scanBuffer, setScanBuffer] = createSignal("");
  const [eventsOptions, setEventsOptions] = createSignal([]);
  const [locationsOptions, setLocationsOptions] = createSignal([]);

  // Filter item berdasarkan event
  const filteredItems = createMemo(() => {
    const allItems = itemsOptions();
    return allItems && allItems.length ? allItems : [];
  });

  // Ambil semua data master
  onMount(async () => {
    try {
      const [resItems, resEvents, resLocations] = await Promise.all([
        ItemsService.list(),
        EventsService.list(),
        LocationsService.list(),
      ]);

      setItemsOptions(resItems.data?.data || resItems.data || resItems);
      setEventsOptions(resEvents.data || resEvents);
      setLocationsOptions(resLocations.data || resLocations);
    } catch (e) {
      console.error("Gagal ambil data:", e);
    }

    if (isEdit) {
      const data = await LoadInService.get(params.id);
      setForm({
        event_id: data.event_id,
        pic_load_in: data.pic_load_in,
        load_in_date: data.load_in_date,
        load_in_notes: data.load_in_notes,
        items: data.items || [],
      });
    }

    // Handler scanner fisik
    const handleKey = (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const code = scanBuffer().trim();
        if (!code) return;

        const found = filteredItems().find(
          (it) =>
            it.asset_code?.toLowerCase() === code.toLowerCase() ||
            it.asset_name?.toLowerCase() === code.toLowerCase() ||
            it.item_name?.toLowerCase() === code.toLowerCase()
        );

        if (found) {
          addItem(found.id);
          Swal.fire({
            icon: "success",
            title: "Item ditambahkan",
            text: `${found.asset_code} - ${
              found.asset_name || found.item_name || found.name
            }`,
            timer: 800,
            showConfirmButton: false,
          });
        } else {
          Swal.fire({
            icon: "warning",
            title: "Item tidak ditemukan",
            text: code,
            timer: 1000,
            showConfirmButton: false,
          });
        }

        setScanBuffer("");
      } else {
        setScanBuffer((prev) => prev + e.key);
      }
    };

    window.addEventListener("keypress", handleKey);
    onCleanup(() => window.removeEventListener("keypress", handleKey));
  });

  // Update field utama
  const updateField = (key, val) => {
    if (key === "event_id") {
      // cari lokasi default dari event terpilih
      const selectedEvent = eventsOptions().find((ev) => ev.id == val);
      const defaultLoc = selectedEvent?.location_id || "";

      setForm((prev) => ({
        ...prev,
        event_id: val,
        // reset items biar gak nyampur
        items: prev.items.map((it) => ({
          ...it,
          location_id: defaultLoc, // auto-update semua item existing
        })),
      }));
    } else {
      setForm((prev) => ({ ...prev, [key]: val }));
    }
  };

  // Tambah item
  const addItem = (itemId = "") => {
    const foundItem = itemsOptions().find((it) => it.id == itemId);
    const currentEvent = eventsOptions().find((ev) => ev.id == form().event_id);
    const defaultLocation =
      currentEvent?.location_id || foundItem?.location_id || "";

    setForm((prev) => ({
      ...prev,
      items: [
        ...prev.items,
        { item_id: itemId, qty: 1, notes: "", location_id: defaultLocation },
      ],
    }));
  };

  // Update item per index
  const updateItem = (idx, key, val) =>
    setForm((prev) => {
      const arr = prev.items.map((it, i) =>
        i === idx ? { ...it, [key]: val } : it
      );
      return { ...prev, items: arr };
    });

  // Hapus item
  const removeItem = (idx) =>
    setForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== idx),
    }));

  // Submit form
  const submit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form(),
        items: form().items.map((it) => ({
          item_id: it.item_id,
          location_id: it.location_id,
          load_in_item_notes: it.notes || "",
          location_notes: it.location_notes || "",
        })),
      };

      if (isEdit) {
        await LoadInService.update(params.id, payload);
        Swal.fire("Berhasil", "Data berhasil diupdate", "success");
      } else {
        await LoadInService.create(payload);
        Swal.fire("Berhasil", "Data berhasil disimpan", "success");
      }

      navigate("/admin/load-in");
    } catch (err) {
      console.error("Submit error:", err);
      Swal.fire("Gagal", "Terjadi kesalahan", "error");
    }
  };

  return (
    <div class="p-6 space-y-4">
      <h1 class="text-2xl font-bold">
        {isEdit ? "Edit Loading In" : "Create Loading In"}
      </h1>

      {/* Scanner hidden input */}
      <input
        type="text"
        class="opacity-0 absolute pointer-events-none"
        autofocus
      />

      <form class="space-y-4" onSubmit={submit}>
        <div>
          <label>Event</label>
          <select
            value={form().event_id}
            onInput={(e) => updateField("event_id", e.currentTarget.value)}
            class="border p-2 w-full rounded"
          >
            <option value="">Pilih Event</option>
            <For each={eventsOptions()}>
              {(ev) => (
                <option value={ev.id}>
                  {ev.event_name || ev.name || `Event #${ev.id}`}
                </option>
              )}
            </For>
          </select>
        </div>

        <div>
          <label>PIC Load In</label>
          <input
            value={form().pic_load_in}
            onInput={(e) => updateField("pic_load_in", e.currentTarget.value)}
            class="border p-2 w-full rounded"
          />
        </div>

        <div>
          <label>Load In Date</label>
          <input
            type="date"
            value={form().load_in_date}
            onInput={(e) => updateField("load_in_date", e.currentTarget.value)}
            class="border p-2 w-full rounded"
          />
        </div>

        <div>
          <label>Notes</label>
          <textarea
            value={form().load_in_notes}
            onInput={(e) => updateField("load_in_notes", e.currentTarget.value)}
            class="border p-2 w-full rounded"
          />
        </div>

        {/* Items Section */}
        <div>
          <div class="flex justify-between items-center mb-2">
            <h3 class="font-semibold">Items</h3>

            {/* Input manual scan */}
            <div class="flex gap-2 items-center">
              <input
                type="text"
                placeholder="Scan / Input Kode Asset lalu Enter"
                class="border p-2 rounded w-60"
                disabled={!form().event_id}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    const code = e.currentTarget.value.trim();
                    if (!code) return;

                    const found = filteredItems().find(
                      (it) =>
                        it.asset_code?.toLowerCase() === code.toLowerCase() ||
                        it.asset_name?.toLowerCase() === code.toLowerCase() ||
                        it.item_name?.toLowerCase() === code.toLowerCase()
                    );

                    if (found) {
                      addItem(found.id);
                      Swal.fire({
                        icon: "success",
                        title: "Item ditambahkan",
                        text: `${found.asset_code} - ${
                          found.asset_name || found.item_name || found.name
                        }`,
                        timer: 800,
                        showConfirmButton: false,
                      });
                    } else {
                      Swal.fire({
                        icon: "warning",
                        title: "Item tidak ditemukan",
                        text: code,
                        timer: 1000,
                        showConfirmButton: false,
                      });
                    }

                    e.currentTarget.value = "";
                  }
                }}
              />
              <button
                type="button"
                class="text-blue-600 border px-3 py-1 rounded"
                onClick={() => addItem()}
                disabled={!form().event_id}
              >
                + Add Item
              </button>
            </div>
          </div>

          <For each={form().items}>
            {(it, i) => (
              <div class="grid grid-cols-4 gap-2 border p-2 rounded items-center">
                {/* Item Select */}
                <select
                  value={it.item_id}
                  onInput={(e) =>
                    updateItem(i(), "item_id", e.currentTarget.value)
                  }
                  class="border p-2 rounded"
                >
                  <option value="">Pilih Item</option>
                  {console.log("Filtered Items sekarang:", filteredItems())}
                  <For each={filteredItems()}>
                    {(opt) => {
                      console.log("Rendering item option:", opt);
                      return (
                        <option value={opt.id}>
                          {opt.asset_code || "NO CODE"} -{" "}
                          {opt.asset_name || opt.name || "NO NAME"}
                        </option>
                      );
                    }}
                  </For>
                </select>

                {/* Location */}
                <select
                  value={it.location_id}
                  onInput={(e) =>
                    updateItem(i(), "location_id", e.currentTarget.value)
                  }
                  class="border p-2 rounded"
                >
                  <option value="">Pilih Lokasi</option>
                  <For each={locationsOptions()}>
                    {(loc) => {
                      console.log("Rendering item option:", loc);
                      return (
                        <option value={loc.id}>
                          {loc.location_name || loc.name || `Lokasi #${loc.id}`}
                        </option>
                      );
                    }}
                  </For>
                </select>

                {/* Qty */}
                <input
                  type="number"
                  min="1"
                  value={it.qty}
                  onInput={(e) => updateItem(i(), "qty", e.currentTarget.value)}
                  class="border p-2 rounded w-full"
                  placeholder="Qty"
                />

                {/* Notes + Delete */}
                <div class="flex gap-2 items-center">
                  <input
                    placeholder="Notes"
                    value={it.notes}
                    onInput={(e) =>
                      updateItem(i(), "notes", e.currentTarget.value)
                    }
                    class="border p-2 rounded flex-1"
                  />
                  <button
                    type="button"
                    class="text-red-600"
                    onClick={() => removeItem(i())}
                  >
                    <Trash size={22} />
                  </button>
                </div>
              </div>
            )}
          </For>
        </div>

        {/* Submit */}
        <div class="flex gap-2">
          <button
            type="submit"
            class="bg-blue-600 text-white px-4 py-2 rounded"
          >
            {isEdit ? "Update" : "Simpan"}
          </button>
          <button
            type="button"
            class="bg-gray-300 px-4 py-2 rounded"
            onClick={() => navigate("/admin/load-in")}
          >
            Batal
          </button>
        </div>
      </form>
    </div>
  );
}
