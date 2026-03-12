import { createSignal, For, Show, onMount } from "solid-js";
import { useNavigate } from "@solidjs/router";
import {
  Plus,
  Trash2,
  Edit,
  ChevronDown,
  ChevronUp,
  Store,
  Package,
} from "lucide-solid";
import Swal from "sweetalert2";

export default function VendorLogList() {
  const navigate = useNavigate();
  const [isMounted, setIsMounted] = createSignal(false);

  // State untuk nyimpen ID baris yang lagi di-expand (buka detail)
  const [expandedId, setExpandedId] = createSignal(null);

  // Mock Data
  const [vendorLogs, setVendorLogs] = createSignal([
    {
      id: "vl-1",
      event_name: "BYD IIMS 2026",
      vendor_name: "Vendor Tenda & Rigging Jaya",
      status: "Lunas",
      items: [
        { id: "it-1", name: "Tenda Roder 10x20", qty: 2, price: 2500000 },
        { id: "it-2", name: "Kursi Futura + Cover", qty: 100, price: 15000 },
      ],
    },
    {
      id: "vl-2",
      event_name: "GIIAS Pre-Launch Show",
      vendor_name: "Cahaya Printing",
      status: "Belum Lunas",
      items: [
        { id: "it-3", name: "Cetak Banner 3x4m", qty: 5, price: 350000 },
        { id: "it-4", name: "Id Card Panitia", qty: 50, price: 12000 },
        { id: "it-5", name: "Brosur A4 (Rim)", qty: 10, price: 250000 },
      ],
    },
  ]);

  onMount(() => {
    setTimeout(() => setIsMounted(true), 50);
  });

  const formatIDR = (num) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);

  const toggleExpand = (id) => {
    setExpandedId(expandedId() === id ? null : id);
  };

  const handleDelete = (logId) => {
    Swal.fire({
      title: "Hapus Data Vendor?",
      text: "Data beserta item di dalamnya akan terhapus.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Ya, Hapus",
    }).then((res) => {
      if (res.isConfirmed) {
        setVendorLogs((prev) => prev.filter((v) => v.id !== logId));
        Swal.fire({
          icon: "success",
          title: "Terhapus",
          timer: 1000,
          showConfirmButton: false,
        });
      }
    });
  };

  return (
    <div class="p-6 bg-gray-50/50 min-h-screen font-sans">
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-row { opacity: 0; animation: fadeSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>

      <div
        class={`max-w-7xl mx-auto transition-all duration-700 ease-out transform ${isMounted() ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
      >
        {/* HEADER */}
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 gap-4 mb-8">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
              <Store size={24} />
            </div>
            <div>
              <h1 class="text-2xl font-bold text-gray-800 tracking-tight">
                Vendor Logs
              </h1>
              <p class="text-sm text-gray-500 mt-0.5">
                Catatan pengeluaran dan order ke pihak ketiga (Vendor).
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate("/admin/vendor-log/create")}
            class="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:-translate-y-0.5 active:scale-95 transition-all"
          >
            <Plus size={16} /> Buat Log Vendor
          </button>
        </div>

        {/* TABLE */}
        <div class="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="min-w-full text-sm text-left">
              <thead class="bg-gray-50 text-gray-500 text-xs uppercase tracking-widest border-b border-gray-100">
                <tr>
                  <th class="p-4 font-bold text-center w-12">#</th>
                  <th class="p-4 font-bold">Nama Event</th>
                  <th class="p-4 font-bold">Nama Vendor</th>
                  <th class="p-4 font-bold text-center">Jumlah Item</th>
                  <th class="p-4 font-bold text-right">Total Pembayaran</th>
                  <th class="p-4 font-bold text-center">Status</th>
                  <th class="p-4 font-bold text-center w-28">Aksi</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-50">
                <Show when={vendorLogs().length === 0}>
                  <tr>
                    <td colspan="7" class="p-8 text-center text-gray-400">
                      Belum ada data log vendor.
                    </td>
                  </tr>
                </Show>

                <For each={vendorLogs()}>
                  {(log, index) => {
                    const totalQty = log.items.reduce(
                      (acc, curr) => acc + curr.qty,
                      0,
                    );
                    const grandTotal = log.items.reduce(
                      (acc, curr) => acc + curr.qty * curr.price,
                      0,
                    );
                    const isExpanded = () => expandedId() === log.id;

                    return (
                      <>
                        {/* MAIN ROW */}
                        <tr
                          class={`animate-row transition-colors hover:bg-gray-50/50 ${isExpanded() ? "bg-blue-50/30" : ""}`}
                        >
                          <td class="p-4 text-center">
                            <button
                              onClick={() => toggleExpand(log.id)}
                              class="p-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg transition-colors"
                            >
                              <Show
                                when={isExpanded()}
                                fallback={<ChevronDown size={16} />}
                              >
                                <ChevronUp size={16} />
                              </Show>
                            </button>
                          </td>
                          <td class="p-4 font-semibold text-gray-800">
                            {log.event_name}
                          </td>
                          <td class="p-4 font-bold text-blue-600">
                            {log.vendor_name}
                          </td>
                          <td class="p-4 text-center font-medium text-gray-600">
                            {log.items.length} Macam <br />
                            <span class="text-xs text-gray-400">
                              ({totalQty} pcs)
                            </span>
                          </td>
                          <td class="p-4 text-right font-black text-gray-800">
                            {formatIDR(grandTotal)}
                          </td>
                          <td class="p-4 text-center">
                            <span
                              class={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
                                log.status === "Lunas"
                                  ? "bg-emerald-100 text-emerald-700"
                                  : "bg-amber-100 text-amber-700"
                              }`}
                            >
                              {log.status}
                            </span>
                          </td>
                          <td class="p-4 text-center">
                            <div class="flex justify-center gap-2">
                              <button
                                onClick={() =>
                                  navigate(`/admin/vendor-log/edit/${log.id}`)
                                }
                                class="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                              >
                                <Edit size={16} />
                              </button>
                              <button
                                onClick={() => handleDelete(log.id)}
                                class="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* EXPANDED DETAILS ROW */}
                        <Show when={isExpanded()}>
                          <tr class="bg-gray-50/50 border-b border-gray-200">
                            <td colspan="7" class="p-0">
                              <div class="p-6 pl-16 animate-row">
                                <h4 class="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                  <Package size={14} /> Detail Item Dibeli
                                </h4>
                                <div class="bg-white border border-gray-200 rounded-xl overflow-hidden">
                                  <table class="min-w-full text-xs text-left">
                                    <thead class="bg-gray-50 text-gray-500 border-b border-gray-100 uppercase">
                                      <tr>
                                        <th class="px-4 py-2 font-semibold">
                                          Nama Item
                                        </th>
                                        <th class="px-4 py-2 font-semibold text-center w-24">
                                          Qty
                                        </th>
                                        <th class="px-4 py-2 font-semibold text-right w-40">
                                          Harga Satuan
                                        </th>
                                        <th class="px-4 py-2 font-semibold text-right w-40">
                                          Total
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody class="divide-y divide-gray-50">
                                      <For each={log.items}>
                                        {(item) => (
                                          <tr class="hover:bg-gray-50/50">
                                            <td class="px-4 py-2.5 font-medium text-gray-700">
                                              {item.name}
                                            </td>
                                            <td class="px-4 py-2.5 text-center text-gray-600">
                                              {item.qty}
                                            </td>
                                            <td class="px-4 py-2.5 text-right text-gray-500">
                                              {formatIDR(item.price)}
                                            </td>
                                            <td class="px-4 py-2.5 text-right font-bold text-gray-800">
                                              {formatIDR(item.qty * item.price)}
                                            </td>
                                          </tr>
                                        )}
                                      </For>
                                    </tbody>
                                  </table>
                                </div>
                              </div>
                            </td>
                          </tr>
                        </Show>
                      </>
                    );
                  }}
                </For>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
