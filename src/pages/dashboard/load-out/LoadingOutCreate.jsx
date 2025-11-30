import { createSignal, onMount, For, onCleanup } from "solid-js";
import { useNavigate, useParams } from "@solidjs/router";
import Swal from "sweetalert2";
import { LoadOutService } from "../../../services/loadOut";
import { ItemsService } from "../../../services/items";
import { EventsService } from "../../../services/events";

import { Trash } from "lucide-solid";

export default function LoadingOutCreate() {
  const params = useParams();
  const navigate = useNavigate();
  const isEdit = !!params.id;

  const defaultForm = {
    event_id: "",
    pic_load_out: "",
    load_out_date: "",
    load_out_notes: "",
    items: [], // { item_id, qty, notes }
  };

  const [form, setForm] = createSignal(defaultForm);
  const [itemsOptions, setItemsOptions] = createSignal([]);
  const [scanBuffer, setScanBuffer] = createSignal("");
  const [eventsOptions, setEventsOptions] = createSignal([]);

  // ✅ Ambil semua item (buat dropdown + auto match scanner)
  onMount(async () => {
    try {
      const [resItems, resEvents] = await Promise.all([
        ItemsService.list(),
        EventsService.list(),
      ]);

      setItemsOptions(resItems.data || resItems);
      setEventsOptions(resEvents.data || resEvents);
    } catch (e) {
      console.error("Gagal ambil data:", e);
    }

    if (isEdit) {
      const data = await LoadOutService.get(params.id);
      setForm({
        event_id: data.event_id,
        pic_load_out: data.pic_load_out,
        load_out_date: data.load_out_date,
        load_out_notes: data.load_out_notes,
        items: data.items || [],
      });
    }

    // 🎯 Scanner handler
    const handleKey = (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        const code = scanBuffer().trim();
        if (!code) return;

        const found = itemsOptions().find(
          (it) =>
            it.asset_code?.toLowerCase() === code.toLowerCase() ||
            it.name?.toLowerCase() === code.toLowerCase()
        );

        if (found) {
          addItem(found.id);
          Swal.fire({
            icon: "success",
            title: "Item ditambahkan",
            text: `${found.asset_code} - ${found.asset_name || found.name}`,
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

  // 🧩 Handler update
  const updateField = (key, val) =>
    setForm((prev) => ({ ...prev, [key]: val }));

  const addItem = (itemId = "") =>
    setForm((prev) => ({
      ...prev,
      items: [...prev.items, { item_id: itemId, qty: 1, notes: "" }],
    }));

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

  // 🧾 Submit
  const submit = async (e) => {
    e.preventDefault();
    try {
      if (isEdit) {
        await LoadOutService.update(params.id, form());
        Swal.fire("Berhasil", "Data berhasil diupdate", "success");
      } else {
        await LoadOutService.create(form());
        Swal.fire("Berhasil", "Data berhasil disimpan", "success");
      }
      navigate("/admin/load-out");
    } catch (err) {
      Swal.fire("Gagal", "Terjadi kesalahan", "error");
    }
  };

  return (
    <div class="p-6 space-y-4">
      <h1 class="text-2xl font-bold">
        {isEdit ? "Edit Loading Out" : "Create Loading Out"}
      </h1>

      {/* Scanner input (invisible tapi aktif) */}
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
          <label>PIC Load Out</label>
          <input
            value={form().pic_load_out}
            onInput={(e) => updateField("pic_load_out", e.currentTarget.value)}
            class="border p-2 w-full rounded"
          />
        </div>

        <div>
          <label>Load Out Date</label>
          <input
            type="date"
            value={form().load_out_date}
            onInput={(e) => updateField("load_out_date", e.currentTarget.value)}
            class="border p-2 w-full rounded"
          />
        </div>

        <div>
          <label>Notes</label>
          <textarea
            value={form().load_out_notes}
            onInput={(e) =>
              updateField("load_out_notes", e.currentTarget.value)
            }
            class="border p-2 w-full rounded"
          />
        </div>

        {/* Items Section */}
        <div>
          <div class="flex justify-between items-center mb-2">
            <h3 class="font-semibold">Items</h3>

            {/* ✅ Input scanner manual */}
            <div class="flex gap-2 items-center">
              <input
                type="text"
                placeholder="Scan / Input Kode Asset lalu Enter"
                class="border p-2 rounded w-60"
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    const code = e.currentTarget.value.trim();
                    if (!code) return;

                    const found = itemsOptions().find(
                      (it) =>
                        it.asset_code?.toLowerCase() === code.toLowerCase() ||
                        it.name?.toLowerCase() === code.toLowerCase()
                    );

                    if (found) {
                      addItem(found.id);
                      Swal.fire({
                        icon: "success",
                        title: "Item ditambahkan",
                        text: `${found.asset_code} - ${
                          found.asset_name || found.name
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
              >
                + Add Item
              </button>
            </div>
          </div>

          <For each={form().items}>
            {(it, i) => (
              <div class="grid grid-cols-3 gap-2 border p-2 rounded items-center">
                {/* Item Select */}
                <select
                  value={it.item_id}
                  onInput={(e) =>
                    updateItem(i(), "item_id", e.currentTarget.value)
                  }
                  class="border p-2 rounded"
                >
                  <option value="">Pilih Item</option>
                  <For each={itemsOptions()}>
                    {(opt) => (
                      <option value={opt.id}>
                        {opt.asset_code} - {opt.asset_name ?? opt.name}
                      </option>
                    )}
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
            onClick={() => navigate("/admin/load-out")}
          >
            Batal
          </button>
        </div>
      </form>
    </div>
  );
}
