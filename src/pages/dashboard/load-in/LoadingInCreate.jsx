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
    items: [],
  };

  const [form, setForm] = createSignal(defaultForm);
  const [itemsOptions, setItemsOptions] = createSignal([]);
  const [eventsOptions, setEventsOptions] = createSignal([]);
  const [locationsOptions, setLocationsOptions] = createSignal([]);
  const [scanBuffer, setScanBuffer] = createSignal("");
  const [itemSearch, setItemSearch] = createSignal("");

  // 🔍 Search tapi hanya buat hide/show items list
  const filteredFormItems = createMemo(() => {
    const search = itemSearch().toLowerCase();
    const rows = form().items || [];

    if (!search) return rows;

    return rows.filter((it) => {
      const opt = itemsOptions().find((x) => x.id == it.item_id);
      return (
        opt?.asset_code?.toLowerCase().includes(search) ||
        opt?.asset_name?.toLowerCase().includes(search) ||
        opt?.item_name?.toLowerCase().includes(search)
      );
    });
  });

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

    // EDIT MODE
    if (isEdit) {
      const res = await LoadInService.get(params.id);
      let data = res.data?.data || res.data || res;

      if (Array.isArray(data)) data = data[0];
      if (typeof data === "object" && data !== null && data[0]) data = data[0];

      setForm({
        event_id: data?.event_id ?? "",
        pic_load_in: data?.pic_load_in ?? "",
        load_in_date: data?.load_in_date ?? "",
        load_in_notes: data?.load_in_notes ?? "",
        items: (data?.items ?? []).map((it) => ({
          item_id: String(it.item_id),
          qty: it.qty || 1,
          notes: it.load_in_item_notes || "",
          location_id: String(it.location_id || ""),
          location_notes: it.location_notes || "",
        })),
      });
    }

    // Scanner fisik
    const handleKey = (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const code = scanBuffer().trim();
        if (!code) return;

        const found = itemsOptions().find(
          (it) =>
            it.asset_code?.toLowerCase() === code.toLowerCase() ||
            it.asset_name?.toLowerCase() === code.toLowerCase()
        );

        if (found) {
          addItem(found.id);
          Swal.fire({
            icon: "success",
            title: "Item ditambahkan",
            text: `${found.asset_code} - ${found.asset_name}`,
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

        handleAddByCode(code);

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
      const selectedEvent = eventsOptions().find((ev) => ev.id == val);
      const defaultLoc = selectedEvent?.location_id || "";

      setForm((prev) => ({
        ...prev,
        event_id: val,
        items: prev.items.map((it) => ({
          ...it,
          location_id: String(defaultLoc),
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
        {
          item_id: String(itemId),
          qty: 1,
          notes: foundItem?.notes || "",
          location_id: String(defaultLocation),
        },
      ],
    }));
  };

  const handleAddByCode = (code) => {
    if (!code) return;

    const found = itemsOptions().find(
      (it) =>
        it.asset_code?.toLowerCase() === code.toLowerCase() ||
        it.asset_name?.toLowerCase() === code.toLowerCase()
    );

    if (found) {
      addItem(found.id);
      Swal.fire({
        icon: "success",
        title: "Item ditambahkan",
        text: `${found.asset_code} - ${found.asset_name}`,
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
  };

  const updateItem = (idx, key, val) =>
    setForm((prev) => {
      const arr = prev.items.map((it, i) =>
        i === idx ? { ...it, [key]: val } : it
      );
      return { ...prev, items: arr };
    });

  const removeItem = (idx) =>
    setForm((prev) => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== idx),
    }));

  const submit = async (e) => {
    e.preventDefault();
    try {
      const payload = {
        ...form(),
        items: form().items.map((it) => ({
          item_id: it.item_id,
          location_id: it.location_id,
          load_in_item_notes: it.notes || "",
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

      {/* Scanner input */}
      <input
        type="text"
        class="opacity-0 absolute pointer-events-none"
        autofocus
      />

      <form class="space-y-4" onSubmit={submit}>
        <div class="grid grid-cols-3 gap-3">
          {/* Event */}
          <div>
            <label class="block mb-1">Event</label>
            <select
              value={form().event_id}
              onInput={(e) => updateField("event_id", e.currentTarget.value)}
              class="border w-full rounded px-3 h-10"
            >
              <option value="">Pilih Event</option>
              <For each={eventsOptions()}>
                {(ev) => (
                  <option value={ev.id}>{ev.event_name || ev.name}</option>
                )}
              </For>
            </select>
          </div>

          {/* PIC */}
          <div>
            <label class="block mb-1">PIC Load In</label>
            <input
              value={form().pic_load_in}
              onInput={(e) => updateField("pic_load_in", e.currentTarget.value)}
              class="border w-full rounded px-3 h-10"
            />
          </div>

          {/* Date */}
          <div>
            <label class="block mb-1">Load In Date</label>
            <input
              type="date"
              value={form().load_in_date}
              onInput={(e) =>
                updateField("load_in_date", e.currentTarget.value)
              }
              class="border w-full rounded px-3 h-10"
            />
          </div>
        </div>

        {/* Notes */}
        <div>
          <label class="block mb-1">Notes</label>
          <textarea
            value={form().load_in_notes}
            onInput={(e) => updateField("load_in_notes", e.currentTarget.value)}
            class="border p-2 w-full rounded"
          />
        </div>

        {/* Items */}
        <div>
          <div class="flex justify-between items-center mb-2">
            <div>
              <h3 class="font-semibold mb-2">Items</h3>

              {/* Search hanya hide/show */}
              <input
                type="text"
                placeholder="Cari item..."
                class="border px-3 py-2 rounded w-60"
                onInput={(e) => setItemSearch(e.currentTarget.value)}
              />
            </div>

            <div class="flex gap-2 items-center">
              {/* MANUAL INPUT */}
              <input
                type="text"
                placeholder="Scan / ketik asset code"
                class="border px-3 py-2 rounded w-64"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleAddByCode(e.currentTarget.value);
                    e.currentTarget.value = "";
                  }
                }}
              />

              <button
                type="button"
                class="text-blue-600 border px-3 py-2 rounded h-10"
                onClick={() => addItem()}
                disabled={!form().event_id}
              >
                + Add Item
              </button>
            </div>
          </div>

          {/* LIST ROW YG DI FILTER */}
          <div class="max-h-[350px] overflow-y-auto space-y-2 pr-2 border border-black p-3 rounded">
            <For each={filteredFormItems()}>
              {(it, i) => (
                <div class="grid grid-cols-4 gap-2 border p-2 rounded items-center bg-white">
                  {/* Item */}
                  <select
                    value={it.item_id}
                    class="border p-2 rounded"
                    onInput={(e) =>
                      updateItem(i(), "item_id", e.currentTarget.value)
                    }
                  >
                    <option value="">Pilih Item</option>
                    <For each={itemsOptions()}>
                      {(opt) => (
                        <option value={opt.id}>
                          {opt.asset_code} - {opt.asset_name}
                        </option>
                      )}
                    </For>
                  </select>

                  {/* Location */}
                  <select
                    value={it.location_id}
                    class="border p-2 rounded"
                    onInput={(e) =>
                      updateItem(i(), "location_id", e.currentTarget.value)
                    }
                  >
                    <option value="">Pilih Lokasi</option>
                    <For each={locationsOptions()}>
                      {(loc) => (
                        <option value={loc.id}>{loc.location_name}</option>
                      )}
                    </For>
                  </select>

                  {/* Qty */}
                  <input
                    type="number"
                    min="1"
                    value={it.qty}
                    class="border p-2 rounded"
                    onInput={(e) =>
                      updateItem(i(), "qty", e.currentTarget.value)
                    }
                  />

                  {/* Notes + Delete */}
                  <div class="flex gap-2 items-center">
                    <input
                      placeholder="Notes"
                      value={it.notes}
                      class="border p-2 rounded flex-1"
                      onInput={(e) =>
                        updateItem(i(), "notes", e.currentTarget.value)
                      }
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
