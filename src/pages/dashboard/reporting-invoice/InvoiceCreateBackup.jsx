import { createSignal, For, onMount, Show } from "solid-js";
import { useNavigate, useParams } from "@solidjs/router";
import { Plus, Trash2, Loader2 } from "lucide-solid";
import Swal from "sweetalert2";

// Import API Service lu bro
import { InvoicesService } from "../../../services/invoices";

export default function InvoiceForm() {
  const navigate = useNavigate();
  const params = useParams();

  const isEdit = () => !!params.id;

  // ===== ANIMATION & LOADING STATE =====
  const [isMounted, setIsMounted] = createSignal(false);
  const [isLoading, setIsLoading] = createSignal(false); // Buat fetch data awal (Edit)
  const [isSaving, setIsSaving] = createSignal(false); // Buat loading pas klik Save/Update

  // ===== MASTER DATA (Kalo API butuh ID, ini nanti lu ubah jadi array of object ya) =====
  const masterPIC = ["Andi", "Budi", "Citra", "Jevin", "Arthika", "Imelda"];
  const masterCustomer = [
    "PT Maju Jaya",
    "PT Sukses Selalu",
    "BYD",
    "BCA",
    "Denza",
  ];
  const masterProject = [
    "Server Migration",
    "Annual Gathering",
    "BYD IIMS 2026",
    "DAIHATSU - GJAW 2025",
  ];

  // ===== STATE FORM =====
  const [form, setForm] = createSignal({
    pic1: "",
    pic2: "",
    customer: "",
    projectName: "",
    eventStart: "",
    eventEnd: "",
    quotationNumber: "",
    invoiceNumber: "",
    invoiceDate: new Date().toISOString().slice(0, 10),
    projectAmount: "",
    invoiceAmount: "",
    keterangan: "",
    division: "",
    eventYear: "",
    paymentStatus: "",
  });

  const [items, setItems] = createSignal([
    { id: Date.now(), name: "", qty: 1, price: 0 },
  ]);

  // ===== FETCH DATA (KHUSUS EDIT) =====
  const fetchDetail = async () => {
    setIsLoading(true);
    try {
      const response = await InvoicesService.getByID(params.id);
      const data = response.data?.data || response.data; // Sesuaikan mapping data-nya

      if (data) {
        setForm({
          pic1: data.pic_1 || "",
          pic2: data.pic_2 || "",
          customer: data.customer_name || "",
          projectName: data.event_name || "",
          eventStart: data.event_date ? data.event_date.slice(0, 10) : "",
          eventEnd: "", // Di JSON ngga ada event_end, dikosongin aja atau tambah fieldnya
          quotationNumber: data.quotation_number || "",
          invoiceNumber: data.inv_number || "",
          invoiceDate: data.inv_date ? data.inv_date.slice(0, 10) : "",
          projectAmount: parseFloat(data.project_amount || 0),
          invoiceAmount: parseFloat(data.inv_amount || 0),
          keterangan: data.notes || "",
          division: data.division_name || "",
          eventYear: data.event_year || "",
          paymentStatus: data.payment_status || "",
        });

        // Mapping string "Barang A;Barang B" jadi array UI
        if (data.item) {
          const parsedItems = data.item.split(";").map((itemName, index) => ({
            id: Date.now() + index,
            name: itemName,
            qty: 1, // Default krn API ngga nyimpen QTY
            price: 0, // Default krn API ngga nyimpen Harga satuan
          }));
          setItems(parsedItems);
        } else {
          setItems([]);
        }
      }
    } catch (error) {
      console.error("Gagal ambil data edit", error);
      Swal.fire("Error", "Gagal memuat detail invoice", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // ===== ON MOUNT =====
  onMount(() => {
    setTimeout(() => setIsMounted(true), 50);

    if (isEdit()) {
      fetchDetail();
    }
  });

  // ===== HANDLER =====
  const handleChange = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  const addItem = () => {
    setItems([...items(), { id: Date.now(), name: "", qty: 1, price: 0 }]);
  };

  const removeItem = (id) => {
    setItems(items().filter((item) => item.id !== id));
  };

  const updateItem = (index, field, value) => {
    const updated = [...items()];
    updated[index][field] = value;
    setItems(updated);
  };

  const handleEventDate = (field, value) => {
    handleChange(field, value);
    if (field === "eventStart") {
      const year = new Date(value).getFullYear();
      handleChange("eventYear", year);
    }
  };

  // ===== SUBMIT KE API =====
  const handleSubmit = async () => {
    setIsSaving(true);

    // MAPPING STATE UI -> PAYLOAD JSON API
    const payload = {
      pic_1: form().pic1,
      pic_2: form().pic2,
      customer_name: form().customer,
      event_name: form().projectName,
      event_date: form().eventStart,
      quotation_number: form().quotationNumber,
      inv_number: form().invoiceNumber,
      inv_date: form().invoiceDate,
      project_amount: form().projectAmount,
      inv_amount: form().invoiceAmount,
      notes: form().keterangan,
      division_name: form().division,
      event_year: form().eventYear,
      payment_status: form().paymentStatus,
      // Mapping Array -> String digabung ";" (Sesuai API lu)
      item: items()
        .map((i) => i.name)
        .filter(Boolean)
        .join(";"),
    };

    try {
      if (isEdit()) {
        await InvoicesService.update(params.id, payload);
        Swal.fire({
          title: "Success",
          text: "Invoice berhasil diupdate",
          icon: "success",
          timer: 1500,
        });
      } else {
        await InvoicesService.create(payload);
        Swal.fire({
          title: "Success",
          text: "Invoice berhasil dibuat",
          icon: "success",
          timer: 1500,
        });
      }
      navigate("/admin/invoice");
    } catch (error) {
      console.error("Gagal save/update:", error);
      Swal.fire("Error", "Gagal menyimpan invoice", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div class="p-6 bg-gray-50/50 min-h-screen font-sans">
      <style>{`
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-item {
          animation: slideInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-spin-slow {
          animation: spin 1.5s linear infinite;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #9ca3af; }
      `}</style>

      <div
        class={`max-w-6xl mx-auto transition-all duration-700 ease-out transform ${
          isMounted() ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <div class="flex justify-between items-center mb-8">
          <h1 class="text-3xl font-bold text-gray-800 tracking-tight">
            {isEdit() ? "Edit Invoice" : "Create Invoice"}
          </h1>
        </div>

        <div class="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] h-[73vh] overflow-y-auto p-8 space-y-8 custom-scrollbar border border-gray-100 relative">
          {/* LOADER OVERLAY PAS FETCH DATA EDIT */}
          <Show when={isLoading()}>
            <div class="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center rounded-2xl">
              <Loader2 size={40} class="animate-spin-slow text-black mb-4" />
              <p class="text-gray-500 font-medium">Memuat Data Invoice...</p>
            </div>
          </Show>

          {/* ================= BASIC INFO ================= */}
          <section class="p-6 rounded-xl bg-gray-50/50 border border-gray-100 hover:border-gray-200 transition-colors duration-300">
            <h2 class="text-xs font-bold mb-6 text-gray-500 uppercase tracking-widest flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-blue-500"></span>
              Basic Information
            </h2>

            <div class="grid grid-cols-2 gap-6">
              <Select
                label="PIC 1"
                options={masterPIC}
                value={form().pic1}
                onChange={(v) => handleChange("pic1", v)}
              />
              <Select
                label="PIC 2"
                options={masterPIC}
                value={form().pic2}
                onChange={(v) => handleChange("pic2", v)}
              />
              <Select
                label="Customer"
                options={masterCustomer}
                value={form().customer}
                onChange={(v) => handleChange("customer", v)}
              />
              <Select
                label="Project Name"
                options={masterProject}
                value={form().projectName}
                onChange={(v) => handleChange("projectName", v)}
              />

              <div>
                <label class="block text-sm font-medium mb-2 text-gray-700">
                  Event Date (Range)
                </label>
                <div class="flex gap-3 items-center">
                  <input
                    type="date"
                    value={form().eventStart}
                    class={baseInputClass}
                    onInput={(e) =>
                      handleEventDate("eventStart", e.target.value)
                    }
                  />
                  <span class="text-gray-400">-</span>
                  <input
                    type="date"
                    value={form().eventEnd}
                    class={baseInputClass}
                    onInput={(e) => handleEventDate("eventEnd", e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label class="block text-sm font-medium mb-2 text-gray-700">
                  Tahun Event
                </label>
                <input
                  type="text"
                  value={form().eventYear}
                  disabled
                  class="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-100/50 text-center font-semibold text-gray-500 cursor-not-allowed transition-all"
                />
              </div>

              <Input
                label="Quotation Number"
                value={form().quotationNumber}
                onInput={(v) => handleChange("quotationNumber", v)}
              />
              <Input
                label="Invoice Number"
                value={form().invoiceNumber}
                onInput={(v) => handleChange("invoiceNumber", v)}
              />

              <div>
                <label class="block text-sm font-medium mb-2 text-gray-700">
                  Invoice Date
                </label>
                <input
                  type="date"
                  value={form().invoiceDate}
                  class={baseInputClass}
                  onInput={(e) => handleChange("invoiceDate", e.target.value)}
                />
              </div>

              <Select
                label="Division"
                options={["IT", "Abracodebra", "Video"]}
                value={form().division}
                onChange={(v) => handleChange("division", v)}
              />
            </div>
          </section>

          {/* ================= FINANCIAL INFO ================= */}
          <section class="p-6 rounded-xl bg-gray-50/50 border border-gray-100 hover:border-gray-200 transition-colors duration-300">
            <h2 class="text-xs font-bold mb-6 text-gray-500 uppercase tracking-widest flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-green-500"></span>
              Financial Information
            </h2>

            <div class="grid grid-cols-2 gap-6">
              <NumberInput
                label="Project Amount (Quotation)"
                value={form().projectAmount}
                onChange={(v) => handleChange("projectAmount", v)}
              />
              <NumberInput
                label="Invoice Amount"
                value={form().invoiceAmount}
                onChange={(v) => handleChange("invoiceAmount", v)}
              />
              <Select
                label="Keterangan"
                options={["DONE RELEASED", "DEALING", "CANCELED"]}
                value={form().keterangan}
                onChange={(v) => handleChange("keterangan", v)}
              />
              <Select
                label="Status Pembayaran"
                options={["PAID", "UNPAID", "DP"]}
                value={form().paymentStatus}
                onChange={(v) => handleChange("paymentStatus", v)}
              />
            </div>
          </section>

          {/* ================= ITEM SECTION ================= */}
          <section class="p-6 rounded-xl border border-gray-100">
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                <span class="w-2 h-2 rounded-full bg-purple-500"></span>
                Items
              </h2>

              <button
                onClick={addItem}
                class="flex items-center gap-2 text-sm bg-black text-white px-5 py-2.5 rounded-xl hover:bg-gray-800 hover:shadow-lg hover:-translate-y-0.5 active:scale-95 transition-all duration-200"
              >
                <Plus size={16} /> Add Item
              </button>
            </div>

            <div class="space-y-4">
              <For each={items()}>
                {(item, index) => (
                  <div class="animate-item grid grid-cols-12 gap-4 items-end bg-white p-4 rounded-xl border border-gray-100 hover:shadow-md transition-shadow duration-300">
                    <div class="col-span-6">
                      <Input
                        label="Item Name"
                        value={item.name}
                        onInput={(v) => updateItem(index(), "name", v)}
                      />
                    </div>

                    <div class="col-span-2">
                      <Input
                        label="Qty"
                        type="number"
                        value={item.qty}
                        onInput={(v) => updateItem(index(), "qty", v)}
                      />
                    </div>

                    <div class="col-span-3">
                      <NumberInput
                        label="Price"
                        value={item.price}
                        onChange={(v) => updateItem(index(), "price", v)}
                      />
                    </div>

                    <div class="col-span-1 pb-2 flex justify-center">
                      <button
                        onClick={() => removeItem(item.id)}
                        class="p-2.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg hover:rotate-12 active:scale-90 transition-all duration-200"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                )}
              </For>
            </div>
          </section>

          {/* ================= ACTION BUTTON ================= */}
          <div class="flex justify-end gap-4 pt-6 border-t border-gray-100">
            <button
              onClick={() => navigate("/admin/invoice")}
              class="px-6 py-2.5 font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 hover:text-gray-900 active:scale-95 transition-all duration-200"
              disabled={isSaving()}
            >
              Cancel
            </button>

            <button
              onClick={handleSubmit}
              disabled={isSaving()}
              class="flex items-center gap-2 px-8 py-2.5 font-medium bg-black text-white rounded-xl hover:bg-gray-800 hover:shadow-lg hover:-translate-y-0.5 active:scale-95 transition-all duration-200 disabled:opacity-70 disabled:hover:translate-y-0"
            >
              <Show when={isSaving()}>
                <Loader2 size={16} class="animate-spin-slow" />
              </Show>
              {isSaving()
                ? "Saving..."
                : isEdit()
                  ? "Update Invoice"
                  : "Save Invoice"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===== REUSABLE COMPONENTS ===== */

const baseInputClass =
  "w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white text-sm text-gray-800 " +
  "focus:outline-none focus:ring-4 focus:ring-gray-100 focus:border-gray-400 hover:border-gray-300 transition-all duration-200";

function Input(props) {
  return (
    <div>
      <label class="block text-sm font-medium mb-2 text-gray-700">
        {props.label}
      </label>
      <input
        type={props.type || "text"}
        value={props.value || ""}
        onInput={(e) => props.onInput(e.target.value)}
        class={baseInputClass}
      />
    </div>
  );
}

function Select(props) {
  return (
    <div>
      <label class="block text-sm font-medium mb-2 text-gray-700">
        {props.label}
      </label>
      <select
        class={baseInputClass}
        value={props.value || ""}
        onChange={(e) => props.onChange(e.target.value)}
      >
        <option value="" disabled>
          Select...
        </option>
        <For each={props.options}>
          {(opt) => <option value={opt}>{opt}</option>}
        </For>
      </select>
    </div>
  );
}

function NumberInput(props) {
  const format = (val) =>
    val ? new Intl.NumberFormat("id-ID").format(val) : "";
  const parse = (val) => Number(String(val).replace(/\./g, ""));

  return (
    <div>
      <label class="block text-sm font-medium mb-2 text-gray-700">
        {props.label}
      </label>
      <div class="relative">
        <span class="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-medium">
          Rp
        </span>
        <input
          type="text"
          value={format(props.value)}
          onInput={(e) => props.onChange(parse(e.target.value))}
          class={`${baseInputClass} pl-10`}
        />
      </div>
    </div>
  );
}
