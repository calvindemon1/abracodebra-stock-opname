import { createSignal, createMemo, For, Show, onMount } from "solid-js";
import { createStore } from "solid-js/store";
import { useNavigate, useParams } from "@solidjs/router";
import { Plus, Trash2, Loader2, Store, PackageOpen } from "lucide-solid";
import Swal from "sweetalert2";

export default function VendorLogCreate() {
  const navigate = useNavigate();
  const params = useParams();
  const isEdit = () => !!params.id;

  const [isMounted, setIsMounted] = createSignal(false);
  const [isSaving, setIsSaving] = createSignal(false);

  // Form Utama (Event, Vendor, Status)
  const [form, setForm] = createSignal({
    event_name: "",
    vendor_name: "",
    status: "Belum Lunas",
  });

  // Store untuk List Items (Dynamic Array)
  const [items, setItems] = createStore([
    { id: Date.now(), name: "", qty: 1, price: 0 },
  ]);

  onMount(() => {
    setTimeout(() => setIsMounted(true), 50);
  });

  // ===== DERIVED STATE =====
  const grandTotal = createMemo(() => {
    return items.reduce(
      (acc, curr) => acc + parseInt(curr.qty || 0) * parseInt(curr.price || 0),
      0,
    );
  });

  const formatIDR = (num) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);

  // ===== HANDLERS =====
  const handleFormChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      { id: Date.now(), name: "", qty: 1, price: 0 },
    ]);
  };

  const handleRemoveItem = (index) => {
    if (items.length === 1) {
      Swal.fire("Peringatan", "Minimal harus ada 1 item order", "warning");
      return;
    }
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (index, field, value) => {
    setItems(index, field, value);
  };

  // ===== SUBMIT =====
  const handleSubmit = async () => {
    if (!form().event_name || !form().vendor_name) {
      Swal.fire("Error", "Nama Event dan Vendor wajib diisi", "error");
      return;
    }
    if (items.some((i) => !i.name || i.qty <= 0 || i.price <= 0)) {
      Swal.fire(
        "Error",
        "Mohon lengkapi semua data item (Nama, Qty > 0, Harga > 0)",
        "error",
      );
      return;
    }

    setIsSaving(true);
    const payload = {
      ...form(),
      items: Array.from(items), // Convert proxy store ke normal array
      grand_total: grandTotal(),
    };

    try {
      console.log("Submitting Vendor Log:", payload);
      await new Promise((r) => setTimeout(r, 1000)); // Mock API delay
      Swal.fire({
        title: "Success",
        text: "Data log vendor berhasil disimpan",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
      navigate("/admin/vendor-log");
    } catch (error) {
      Swal.fire("Error", "Gagal menyimpan data", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div class="p-6 bg-gray-50/50 min-h-screen font-sans">
      <style>{`
        @keyframes slideInUp { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
        .animate-item { animation: slideInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 10px; }
      `}</style>

      <div
        class={`max-w-5xl mx-auto transition-all duration-700 ease-out transform pb-24 ${isMounted() ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
      >
        <div class="flex justify-between items-center mb-8">
          <h1 class="text-3xl font-bold text-gray-800 tracking-tight">
            {isEdit() ? "Edit Vendor Log" : "Buat Vendor Log"}
          </h1>
        </div>

        <div class="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-8 space-y-8">
          {/* SECTION: BASIC INFO */}
          <section class="p-6 rounded-xl bg-gray-50/50 border border-gray-100">
            <h2 class="text-xs font-bold mb-6 text-gray-500 uppercase tracking-widest flex items-center gap-2">
              <Store size={16} class="text-blue-500" /> Informasi Utama
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Input
                label="Nama Event"
                value={form().event_name}
                onInput={(v) => handleFormChange("event_name", v)}
                placeholder="e.g., IIMS 2026"
              />
              <Input
                label="Nama Vendor"
                value={form().vendor_name}
                onInput={(v) => handleFormChange("vendor_name", v)}
                placeholder="e.g., Vendor Tenda Jaya"
              />
              <div>
                <label class="block text-sm font-semibold mb-2 text-gray-700">
                  Status Pembayaran
                </label>
                <select
                  value={form().status}
                  onChange={(e) => handleFormChange("status", e.target.value)}
                  class="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white text-sm text-gray-800 focus:outline-none focus:ring-4 focus:ring-gray-100 focus:border-gray-400"
                >
                  <option value="Belum Lunas">Belum Lunas</option>
                  <option value="Lunas">Lunas</option>
                </select>
              </div>
            </div>
          </section>

          {/* SECTION: ITEMS (DYNAMIC) */}
          <section class="p-6 rounded-xl bg-gray-50/50 border border-gray-100">
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                <PackageOpen size={16} class="text-green-500" /> Detail Item
                Belanja
              </h2>
            </div>

            {/* HEADER TABEL DESKTOP */}
            <div class="hidden md:grid grid-cols-12 gap-4 px-4 py-2 bg-gray-100 rounded-lg text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
              <div class="col-span-5">Deskripsi Item</div>
              <div class="col-span-2 text-center">Qty</div>
              <div class="col-span-2 text-right">Harga Satuan</div>
              <div class="col-span-2 text-right">Subtotal</div>
              <div class="col-span-1 text-center">Aksi</div>
            </div>

            <div class="space-y-3">
              <For each={items}>
                {(item, index) => {
                  const subTotal =
                    (parseInt(item.qty) || 0) * (parseInt(item.price) || 0);
                  return (
                    <div class="animate-item bg-white p-4 md:p-2 rounded-xl border border-gray-200 shadow-sm flex flex-col md:grid md:grid-cols-12 gap-4 md:items-center">
                      {/* Nama Item */}
                      <div class="col-span-5">
                        <label class="md:hidden text-xs font-bold text-gray-500 mb-1 block">
                          Nama Item
                        </label>
                        <input
                          type="text"
                          value={item.name}
                          placeholder="Misal: Sewa Tenda 5x5m"
                          onInput={(e) =>
                            handleItemChange(index(), "name", e.target.value)
                          }
                          class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-gray-400"
                        />
                      </div>

                      {/* Qty */}
                      <div class="col-span-2">
                        <label class="md:hidden text-xs font-bold text-gray-500 mb-1 block">
                          Qty
                        </label>
                        <input
                          type="number"
                          min="1"
                          value={item.qty}
                          onInput={(e) =>
                            handleItemChange(
                              index(),
                              "qty",
                              parseInt(e.target.value) || 0,
                            )
                          }
                          class="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm text-center focus:outline-none focus:border-gray-400"
                        />
                      </div>

                      {/* Harga Satuan */}
                      <div class="col-span-2">
                        <label class="md:hidden text-xs font-bold text-gray-500 mb-1 block">
                          Harga Satuan
                        </label>
                        <NumberInputInline
                          value={item.price}
                          onChange={(v) =>
                            handleItemChange(index(), "price", v)
                          }
                        />
                      </div>

                      {/* Subtotal (Readonly) */}
                      <div class="col-span-2 md:text-right">
                        <label class="md:hidden text-xs font-bold text-gray-500 mb-1 block">
                          Subtotal
                        </label>
                        <div class="px-3 py-2 bg-gray-50 border border-gray-100 rounded-lg text-sm font-bold text-gray-700 text-right">
                          {formatIDR(subTotal)}
                        </div>
                      </div>

                      {/* Aksi Hapus */}
                      <div class="col-span-1 flex justify-center mt-2 md:mt-0">
                        <button
                          onClick={() => handleRemoveItem(index())}
                          class="p-2 w-full md:w-auto flex justify-center text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                }}
              </For>
            </div>

            <button
              onClick={handleAddItem}
              class="mt-4 flex items-center gap-2 text-sm bg-gray-100 text-gray-700 px-4 py-2.5 rounded-xl hover:bg-gray-200 font-medium transition-all"
            >
              <Plus size={16} /> Tambah Item Lain
            </button>

            {/* GRAND TOTAL SUMMARY */}
            <div class="mt-8 pt-6 border-t border-gray-200 flex flex-col items-end">
              <span class="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">
                Total Keseluruhan
              </span>
              <span class="text-3xl font-black text-gray-800 tracking-tight">
                {formatIDR(grandTotal())}
              </span>
            </div>
          </section>

          {/* ACTIONS */}
          <div class="flex justify-end gap-4 pt-6">
            <button
              onClick={() => navigate("/admin/vendor-log")}
              disabled={isSaving()}
              class="px-6 py-2.5 font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 active:scale-95 transition-all"
            >
              Batal
            </button>
            <button
              onClick={handleSubmit}
              disabled={isSaving()}
              class="flex items-center gap-2 px-8 py-2.5 font-medium bg-black text-white rounded-xl hover:bg-gray-800 hover:shadow-lg active:scale-95 transition-all disabled:opacity-70"
            >
              <Show when={isSaving()}>
                <Loader2 size={16} class="animate-spin" />
              </Show>
              {isSaving() ? "Menyimpan..." : "Simpan Data Vendor"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== REUSABLE COMPONENTS LOKAL =====
function Input(props) {
  return (
    <div>
      <label class="block text-sm font-semibold mb-2 text-gray-700">
        {props.label}
      </label>
      <input
        type="text"
        value={props.value || ""}
        placeholder={props.placeholder}
        onInput={(e) => props.onInput(e.target.value)}
        class="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white text-sm text-gray-800 focus:outline-none focus:ring-4 focus:ring-gray-100 focus:border-gray-400 transition-all"
      />
    </div>
  );
}

// Input Rupiah untuk tabel (Inline)
function NumberInputInline(props) {
  const format = (val) =>
    val ? new Intl.NumberFormat("id-ID").format(val) : "";
  const parse = (val) => Number(String(val).replace(/\./g, ""));

  return (
    <div class="relative">
      <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
        Rp
      </span>
      <input
        type="text"
        value={format(props.value)}
        onInput={(e) => props.onChange(parse(e.target.value))}
        class="w-full pl-8 pr-3 py-2 border border-gray-200 rounded-lg text-sm text-right focus:outline-none focus:border-gray-400 transition-all"
      />
    </div>
  );
}
