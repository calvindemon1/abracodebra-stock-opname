import { createSignal, onMount, For, onCleanup, createMemo } from "solid-js";
import { useNavigate, useParams } from "@solidjs/router";
import Swal from "sweetalert2";
import { LoadInService } from "../../../services/loadIn";
import { ItemsService } from "../../../services/items";
import { EventsService } from "../../../services/events";
import { LocationsService } from "../../../services/locations";
import {
  Trash2,
  Truck,
  Calendar,
  User,
  FileText,
  Search,
  Barcode,
  Plus,
  Save,
  X,
} from "lucide-solid";

export default function LoadingInCreate() {
  const params = useParams();
  const navigate = useNavigate();
  const isEdit = !!params.id;

  // ===== ANIMATION STATE =====
  const [isMounted, setIsMounted] = createSignal(false);
  const [loading, setLoading] = createSignal(false);

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

  // BIKIN ROW ID UNIQUE BIAR GAK BUG PAS DI SEARCH
  const generateRowId = () => Math.random().toString(36).substr(2, 9);

  // 🔍 Search item
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
    setTimeout(() => setIsMounted(true), 50);

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
      try {
        const res = await LoadInService.get(params.id);
        let data = res.data?.data || res.data || res;
        if (Array.isArray(data)) data = data[0];

        setForm({
          event_id: data?.event_id ?? "",
          pic_load_in: data?.pic_load_in ?? "",
          load_in_date: data?.load_in_date ?? "",
          load_in_notes: data?.load_in_notes ?? "",
          items: (data?.items ?? []).map((it) => ({
            row_id: generateRowId(), // Kasih ID unik
            item_id: String(it.item_id),
            qty: it.qty || 1,
            notes: it.load_in_item_notes || "",
            location_id: String(it.location_id || ""),
            location_notes: it.location_notes || "",
          })),
        });
      } catch (err) {
        console.error(err);
      }
    }

    // Scanner fisik listener
    const handleKey = (e) => {
      if (e.key === "Enter") {
        e.preventDefault();
        handleAddByCode(scanBuffer().trim());
        setScanBuffer("");
      } else {
        setScanBuffer((prev) => prev + e.key);
      }
    };

    window.addEventListener("keypress", handleKey);
    onCleanup(() => window.removeEventListener("keypress", handleKey));
  });

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
          row_id: generateRowId(),
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
        it.asset_name?.toLowerCase() === code.toLowerCase(),
    );

    if (found) {
      addItem(found.id);
      Swal.fire({
        icon: "success",
        title: "Item Ditambahkan",
        text: `${found.asset_code} - ${found.asset_name}`,
        timer: 1000,
        showConfirmButton: false,
      });
    } else {
      Swal.fire({
        icon: "warning",
        title: "Tidak Ditemukan",
        text: `Kode: ${code}`,
        timer: 1500,
        showConfirmButton: false,
      });
    }
  };

  // UPDATE & REMOVE BY ROW_ID BIAR AMAN DARI BUG FILTER
  const updateItem = (rowId, key, val) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.map((it) =>
        it.row_id === rowId ? { ...it, [key]: val } : it,
      ),
    }));
  };

  const removeItem = (rowId) => {
    setForm((prev) => ({
      ...prev,
      items: prev.items.filter((it) => it.row_id !== rowId),
    }));
  };

  const submit = async (e) => {
    e.preventDefault();

    if (!form().event_id) {
      return Swal.fire({
        icon: "warning",
        title: "Peringatan",
        text: "Event belum dipilih!",
        confirmButtonColor: "#000",
      });
    }

    setLoading(true);
    try {
      const payload = {
        ...form(),
        items: form().items.map((it) => ({
          item_id: it.item_id,
          location_id: it.location_id,
          load_in_item_notes: it.notes || "",
          qty: it.qty,
        })),
      };

      if (isEdit) {
        await LoadInService.update(params.id, payload);
        Swal.fire({
          icon: "success",
          title: "Berhasil",
          text: "Data berhasil diupdate ✅",
          confirmButtonColor: "#10b981",
        });
      } else {
        await LoadInService.create(payload);
        Swal.fire({
          icon: "success",
          title: "Berhasil",
          text: "Data berhasil disimpan ✅",
          confirmButtonColor: "#10b981",
        });
      }

      navigate("/admin/load-in");
    } catch (err) {
      console.error("Submit error:", err);
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Terjadi kesalahan saat menyimpan ❌",
        confirmButtonColor: "#ef4444",
      });
    }
    setLoading(false);
  };

  // ===== BASE CSS =====
  const baseInput =
    "w-full px-4 py-2.5 rounded-xl text-sm transition-all duration-200 outline-none border bg-gray-50/50 border-gray-200 focus:border-gray-400 focus:ring-4 focus:ring-gray-100";
  const baseLabel =
    "block text-xs font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-2";

  return (
    <div class="p-6 bg-gray-50/50 min-h-screen font-sans">
      <style>{`
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-item {
          animation: slideInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #9ca3af; }
      `}</style>

      {/* Hidden Scanner */}
      <input
        type="text"
        class="opacity-0 absolute pointer-events-none"
        autofocus
      />

      <div
        class={`max-w-6xl mx-auto transition-all duration-700 ease-out transform ${isMounted() ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
      >
        {/* HEADER */}
        <div class="flex items-center gap-4 mb-8">
          <div class="w-12 h-12 bg-black rounded-2xl shadow-lg flex items-center justify-center text-white">
            <Truck size={24} />
          </div>
          <div>
            <h1 class="text-3xl font-bold text-gray-800 tracking-tight">
              {isEdit ? "Edit Loading In" : "Create Loading In"}
            </h1>
            <p class="text-sm text-gray-500 mt-1">
              Catat barang masuk (Load-In) ke event dengan akurat.
            </p>
          </div>
        </div>

        <form onSubmit={submit} class="space-y-6">
          {/* ================= BASIC INFO ================= */}
          <div class="bg-white p-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
            <h2 class="text-sm font-bold text-gray-800 mb-6 flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-blue-500"></span>
              Informasi Umum
            </h2>

            <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
              <div>
                <label class={baseLabel}>
                  <Calendar size={14} /> Event
                </label>
                <select
                  value={form().event_id}
                  onInput={(e) =>
                    updateField("event_id", e.currentTarget.value)
                  }
                  class={baseInput}
                >
                  <option value="" disabled>
                    Pilih Event...
                  </option>
                  <For each={eventsOptions()}>
                    {(ev) => (
                      <option value={ev.id}>{ev.event_name || ev.name}</option>
                    )}
                  </For>
                </select>
              </div>

              <div>
                <label class={baseLabel}>
                  <User size={14} /> PIC Load In
                </label>
                <input
                  type="text"
                  placeholder="Nama PIC"
                  value={form().pic_load_in}
                  onInput={(e) =>
                    updateField("pic_load_in", e.currentTarget.value)
                  }
                  class={baseInput}
                />
              </div>

              <div>
                <label class={baseLabel}>
                  <Calendar size={14} /> Load In Date
                </label>
                <input
                  type="date"
                  value={form().load_in_date}
                  onInput={(e) =>
                    updateField("load_in_date", e.currentTarget.value)
                  }
                  class={baseInput}
                />
              </div>
            </div>

            <div>
              <label class={baseLabel}>
                <FileText size={14} /> Notes
              </label>
              <textarea
                placeholder="Tambahkan catatan jika perlu..."
                value={form().load_in_notes}
                onInput={(e) =>
                  updateField("load_in_notes", e.currentTarget.value)
                }
                class={`${baseInput} min-h-[80px]`}
              />
            </div>
          </div>

          {/* ================= ITEMS SECTION ================= */}
          <div class="bg-white p-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <h2 class="text-sm font-bold text-gray-800 flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-purple-500"></span>
                Daftar Item
              </h2>

              <div class="flex flex-wrap gap-3 w-full md:w-auto">
                {/* Search Box */}
                <div class="relative flex-1 md:flex-none">
                  <Search
                    size={16}
                    class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    placeholder="Cari di list..."
                    class={`${baseInput} pl-9 w-full md:w-48`}
                    onInput={(e) => setItemSearch(e.currentTarget.value)}
                  />
                </div>

                {/* Barcode / Manual Add */}
                <div class="relative flex-1 md:flex-none">
                  <Barcode
                    size={16}
                    class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <input
                    type="text"
                    placeholder="Scan Barcode..."
                    class={`${baseInput} pl-9 w-full md:w-56 border-blue-200 focus:border-blue-400`}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        handleAddByCode(e.currentTarget.value);
                        e.currentTarget.value = "";
                      }
                    }}
                  />
                </div>

                <button
                  type="button"
                  onClick={() => addItem()}
                  disabled={!form().event_id}
                  class="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <Plus size={16} /> Add Item
                </button>
              </div>
            </div>

            {/* List Header (Desktop Only) */}
            <div class="hidden md:grid grid-cols-12 gap-3 px-4 mb-2 text-xs font-bold text-gray-400 uppercase tracking-widest">
              <div class="col-span-4">Asset / Item</div>
              <div class="col-span-3">Location</div>
              <div class="col-span-1 text-center">Qty</div>
              <div class="col-span-3">Notes</div>
              <div class="col-span-1 text-center">Aksi</div>
            </div>

            {/* Item Rows */}
            <div class="max-h-[400px] overflow-y-auto custom-scrollbar space-y-3 pr-2">
              <Show when={filteredFormItems().length === 0}>
                <div class="p-8 text-center border-2 border-dashed border-gray-200 rounded-xl">
                  <p class="text-gray-400 font-medium">
                    Belum ada item ditambahkan.
                  </p>
                  <p class="text-xs text-gray-400 mt-1">
                    Pilih event dan scan barcode atau tambah manual.
                  </p>
                </div>
              </Show>

              <For each={filteredFormItems()}>
                {(it) => (
                  <div class="animate-item bg-gray-50/50 border border-gray-100 p-3 rounded-xl grid grid-cols-1 md:grid-cols-12 gap-3 items-center hover:shadow-sm hover:border-gray-200 transition-all">
                    <div class="col-span-4">
                      <select
                        value={it.item_id}
                        class={baseInput}
                        onInput={(e) =>
                          updateItem(
                            it.row_id,
                            "item_id",
                            e.currentTarget.value,
                          )
                        }
                      >
                        <option value="" disabled>
                          Pilih Item...
                        </option>
                        <For each={itemsOptions()}>
                          {(opt) => (
                            <option value={opt.id}>
                              {opt.asset_code} - {opt.asset_name}
                            </option>
                          )}
                        </For>
                      </select>
                    </div>

                    <div class="col-span-3">
                      <select
                        value={it.location_id}
                        class={baseInput}
                        onInput={(e) =>
                          updateItem(
                            it.row_id,
                            "location_id",
                            e.currentTarget.value,
                          )
                        }
                      >
                        <option value="" disabled>
                          Pilih Lokasi...
                        </option>
                        <For each={locationsOptions()}>
                          {(loc) => (
                            <option value={loc.id}>{loc.location_name}</option>
                          )}
                        </For>
                      </select>
                    </div>

                    <div class="col-span-1">
                      <input
                        type="number"
                        min="1"
                        value={it.qty}
                        class={`${baseInput} text-center`}
                        onInput={(e) =>
                          updateItem(it.row_id, "qty", e.currentTarget.value)
                        }
                      />
                    </div>

                    <div class="col-span-3">
                      <input
                        type="text"
                        placeholder="Kondisi / Catatan"
                        value={it.notes}
                        class={baseInput}
                        onInput={(e) =>
                          updateItem(it.row_id, "notes", e.currentTarget.value)
                        }
                      />
                    </div>

                    <div class="col-span-1 flex justify-center">
                      <button
                        type="button"
                        onClick={() => removeItem(it.row_id)}
                        class="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg hover:rotate-12 active:scale-90 transition-all"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                )}
              </For>
            </div>
          </div>

          {/* ================= ACTION BUTTONS ================= */}
          <div class="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => navigate("/admin/load-in")}
              class="px-6 py-2.5 font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 hover:text-gray-900 active:scale-95 transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading()}
              class="flex items-center gap-2 px-8 py-2.5 font-medium bg-blue-600 text-white rounded-xl hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20 hover:-translate-y-0.5 active:scale-95 disabled:opacity-70 disabled:hover:translate-y-0 transition-all"
            >
              {loading() ? (
                <div class="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <Save size={18} />
              )}
              {isEdit ? "Update Data" : "Simpan Data"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
