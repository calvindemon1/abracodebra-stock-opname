import { createSignal, For, Show, onMount, onCleanup } from "solid-js";
import { useNavigate } from "@solidjs/router";
import {
  MoreVertical,
  Pencil,
  Trash2,
  Plus,
  FileText,
  Loader2,
  Download, // <-- Import icon Download
} from "lucide-solid";
import Swal from "sweetalert2";
import { Portal } from "solid-js/web";

// Taruh import service lu di sini bro
import { InvoicesService } from "../../../services/invoices";

export default function InvoiceList() {
  const navigate = useNavigate();

  // ===== STATE =====
  const [isMounted, setIsMounted] = createSignal(false);
  const [activeTab, setActiveTab] = createSignal("All");
  const [summaryStatus, setSummaryStatus] = createSignal("Paid");
  const [openActionId, setOpenActionId] = createSignal(null);
  const [dropdownPos, setDropdownPos] = createSignal({ x: 0, y: 0 });

  // State untuk Data & Loading dari API
  const [invoices, setInvoices] = createSignal([]);
  const [isLoading, setIsLoading] = createSignal(true);
  const [isExporting, setIsExporting] = createSignal(false); // <-- State buat loading export

  // ===== FETCH DATA =====
  const fetchInvoices = async () => {
    setIsLoading(true);
    try {
      const response = await InvoicesService.getAll();
      const data = response.data || [];
      setInvoices(data);
    } catch (error) {
      console.error("Gagal mengambil data invoice:", error);
      Swal.fire("Error", "Gagal memuat data invoices", "error");
    } finally {
      setIsLoading(false);
    }
  };

  // ===== HANDLE EXPORT =====
  const handleExport = async () => {
    const confirm = await Swal.fire({
      title: "Export Invoice?",
      text: "Anda akan mengunduh semua data invoice dalam format Excel.",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya, Download",
      cancelButtonText: "Batal",
      confirmButtonColor: "#000000",
      cancelButtonColor: "#6d6d6d",
      customClass: { cancelButton: "text-gray-800" },
    });

    if (!confirm.isConfirmed) return;

    setIsExporting(true);
    try {
      Swal.fire({
        title: "Menyiapkan File...",
        text: "Mohon tunggu sebentar",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      const blob = await InvoicesService.export();

      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;

      link.download = `Invoices_Export_${new Date()
        .toISOString()
        .slice(0, 10)}.xlsx`;

      document.body.appendChild(link);
      link.click();

      link.remove();
      window.URL.revokeObjectURL(url);

      Swal.fire({
        title: "Berhasil!",
        text: "File Excel berhasil diunduh.",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error("Gagal export data:", error);
      Swal.fire("Error", "Gagal meng-export data", "error");
    } finally {
      setIsExporting(false);
    }
  };

  const handleGlobalPointer = (e) => {
    if (!openActionId()) return;
    const dropdown = document.querySelector("#invoice-action-dropdown");
    if (!dropdown) return;
    if (
      !dropdown.contains(e.target) &&
      !e.target.closest("[data-action-trigger]")
    ) {
      setOpenActionId(null);
    }
  };

  onMount(() => {
    fetchInvoices();
    setTimeout(() => setIsMounted(true), 50);
    document.addEventListener("pointerdown", handleGlobalPointer);
    window.addEventListener("resize", () => setOpenActionId(null));
    window.addEventListener("scroll", () => setOpenActionId(null));
  });

  onCleanup(() => {
    document.removeEventListener("pointerdown", handleGlobalPointer);
  });

  // ===== DERIVED STATE (Filter & Summary) =====
  const filteredInvoices = () => {
    if (activeTab() === "All" || activeTab() === "Summary") return invoices();
    return invoices().filter((inv) => inv.division_name === activeTab());
  };

  const getMonthName = (dateStr) => {
    if (!dateStr) return "Unknown";
    return new Date(dateStr).toLocaleString("id-ID", { month: "long" });
  };

  const summaryData = () => {
    const filtered = invoices().filter(
      (inv) =>
        (inv.payment_status || "").toUpperCase() ===
        summaryStatus().toUpperCase(),
    );
    const grouped = {};

    filtered.forEach((inv) => {
      const month = getMonthName(inv.inv_date);
      const projectName = inv.event_name || "Unknown";
      const division = inv.division_name;
      const amount = parseFloat(inv.inv_amount || 0);

      if (!grouped[month]) grouped[month] = {};
      if (!grouped[month][projectName]) {
        grouped[month][projectName] = { IT: 0, Abracodebra: 0, Video: 0 };
      }

      if (grouped[month][projectName][division] !== undefined) {
        grouped[month][projectName][division] += amount;
      } else {
        grouped[month][projectName][division] = amount;
      }
    });

    return grouped;
  };

  // ===== DELETE ACTION =====
  const handleDelete = async (invoice) => {
    setOpenActionId(null);
    const confirm = await Swal.fire({
      title: "Delete Invoice?",
      html: `
        <div class="text-left text-sm mt-2 text-gray-600">
          <p class="mb-1"><strong>Project:</strong> ${invoice.event_name}</p>
          <p class="mb-1"><strong>Invoice:</strong> ${invoice.inv_number}</p>
          <p><strong>Customer:</strong> ${invoice.customer_name}</p>
        </div>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Yes, delete it",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#ef4444",
      cancelButtonColor: "#6d6d6d",
      customClass: { cancelButton: "text-gray-800" },
    });

    if (!confirm.isConfirmed) return;

    try {
      Swal.fire({
        title: "Deleting...",
        text: "Mohon tunggu sebentar",
        allowOutsideClick: false,
        didOpen: () => {
          Swal.showLoading();
        },
      });

      await InvoicesService.delete(invoice.id);
      setInvoices((prev) => prev.filter((inv) => inv.id !== invoice.id));

      Swal.fire({
        title: "Deleted!",
        text: `Invoice ${invoice.inv_number} berhasil dihapus`,
        icon: "success",
        confirmButtonColor: "#10b981",
      });
    } catch (error) {
      console.error("Gagal menghapus invoice:", error);
      Swal.fire({
        title: "Error!",
        text: "Terjadi kesalahan saat menghapus invoice.",
        icon: "error",
      });
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusBadge = (status) => {
    const s = (status || "").toUpperCase();
    if (s === "PAID") {
      return "bg-green-100/80 text-green-700 border border-green-200/60";
    }
    return "bg-red-100/80 text-red-700 border border-red-200/60";
  };

  return (
    <div class="p-6 bg-gray-50/50 min-h-screen font-sans overflow-x-hidden">
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes scalePop {
          from { opacity: 0; transform: scale(0.95) translateY(-5px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-row {
          opacity: 0;
          animation: fadeSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-dropdown {
          transform-origin: top right;
          animation: scalePop 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .animate-spin-slow {
          animation: spin 1.5s linear infinite;
        }
      `}</style>

      <div
        class={`max-w-7xl mx-auto transition-all duration-700 ease-out transform ${
          isMounted() ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        {/* HEADER */}
        <div class="flex justify-between items-center mb-8">
          <div>
            <h1 class="text-3xl font-bold text-gray-800 tracking-tight">
              Invoice Center
            </h1>
            <p class="text-sm text-gray-500 mt-1">
              Manage and track your project invoices easily.
            </p>
          </div>

          {/* ===== ACTION BUTTONS AREA ===== */}
          <div class="flex items-center gap-3">
            {/* Tombol Export */}
            <button
              onClick={handleExport}
              disabled={isExporting()}
              class="flex items-center gap-2 bg-white text-gray-700 border border-gray-200 px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-50 hover:shadow-sm hover:-translate-y-0.5 active:scale-95 transition-all duration-200 disabled:opacity-70 disabled:hover:translate-y-0"
            >
              <Show when={isExporting()} fallback={<Download size={16} />}>
                <Loader2 size={16} class="animate-spin-slow" />
              </Show>
              {isExporting() ? "Exporting..." : "Export"}
            </button>

            {/* Tombol Create */}
            <button
              onClick={() => navigate("/admin/invoice/create")}
              class="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 hover:shadow-lg hover:-translate-y-0.5 active:scale-95 transition-all duration-200"
            >
              <Plus size={16} />
              Create Invoice
            </button>
          </div>
        </div>

        {/* MAIN TABS */}
        <div class="border-b border-gray-200 mb-8 flex gap-8 relative">
          {["All", "IT", "Abracodebra", "Video", "Summary"].map((tab) => (
            <button
              onClick={() => setActiveTab(tab)}
              class={`relative pb-4 text-sm font-medium transition-colors duration-300 ${
                activeTab() === tab
                  ? "text-black"
                  : "text-gray-400 hover:text-gray-800"
              }`}
            >
              {tab}
              <div
                class={`absolute bottom-0 left-0 w-full h-0.5 bg-black rounded-t-full transition-transform duration-300 origin-left ${
                  activeTab() === tab ? "scale-x-100" : "scale-x-0"
                }`}
              />
            </button>
          ))}
        </div>

        {/* SHOW LOADING SPINNER */}
        <Show when={isLoading()}>
          <div class="flex flex-col items-center justify-center py-20 text-gray-400">
            <Loader2 size={40} class="animate-spin-slow mb-4 text-black" />
            <p class="text-sm font-medium">Memuat data invoices...</p>
          </div>
        </Show>

        <Show when={!isLoading()}>
          {/* ================= NORMAL TABLE ================= */}
          <Show when={activeTab() !== "Summary"}>
            <div class="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
              <div class="overflow-x-auto">
                <table class="min-w-full text-sm text-left">
                  <thead class="bg-gray-50/80 text-gray-500 text-xs uppercase tracking-widest border-b border-gray-100">
                    <tr>
                      <th class="p-4 font-semibold w-12 text-center">No</th>
                      <th class="p-4 font-semibold">PIC</th>
                      <th class="p-4 font-semibold">Customer</th>
                      <th class="p-4 font-semibold">Project</th>
                      <th class="p-4 font-semibold">Invoice</th>
                      <th class="p-4 font-semibold text-right">Amount</th>
                      <th class="p-4 font-semibold">Date</th>
                      <th class="p-4 font-semibold">Status</th>
                      <th class="p-4 font-semibold text-center w-16">Act</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-gray-100">
                    <Show
                      when={filteredInvoices().length > 0}
                      fallback={
                        <tr>
                          <td colspan="9" class="p-8 text-center text-gray-400">
                            No invoices found.
                          </td>
                        </tr>
                      }
                    >
                      <For each={filteredInvoices()}>
                        {(inv, index) => (
                          <tr
                            class="animate-row hover:bg-gray-50/80 transition-colors duration-200 group"
                            style={{ "animation-delay": `${index() * 0.05}s` }}
                          >
                            <td class="p-4 text-center text-gray-400 font-medium">
                              {index() + 1}
                            </td>
                            <td class="p-4">
                              <div class="font-medium text-gray-800">
                                {inv.pic_1 || "-"}
                              </div>
                              <div class="text-xs text-gray-500">
                                {inv.pic_2 || "-"}
                              </div>
                            </td>
                            <td class="p-4 text-gray-700">
                              {inv.customer_name}
                            </td>
                            <td class="p-4 font-medium text-gray-800">
                              {inv.event_name}
                            </td>
                            <td class="p-4 text-gray-500 flex items-center gap-2">
                              <FileText size={14} class="text-gray-400" />
                              {inv.inv_number}
                            </td>
                            <td class="p-4 text-right font-semibold text-gray-800">
                              Rp{" "}
                              {parseFloat(inv.inv_amount || 0).toLocaleString(
                                "id-ID",
                              )}
                            </td>
                            <td class="p-4 text-gray-500">
                              {formatDate(inv.inv_date)}
                            </td>
                            <td class="p-4">
                              <span
                                class={`px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase ${getStatusBadge(inv.payment_status)}`}
                              >
                                {inv.payment_status}
                              </span>
                            </td>
                            <td class="p-4 text-center relative">
                              <button
                                data-action-trigger
                                onClick={(e) => {
                                  const rect =
                                    e.currentTarget.getBoundingClientRect();
                                  setDropdownPos({
                                    x: rect.right - 144,
                                    y: rect.bottom + 8,
                                  });
                                  setOpenActionId(
                                    openActionId() === inv.id ? null : inv.id,
                                  );
                                }}
                                class="p-1.5 text-gray-400 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors"
                              >
                                <MoreVertical size={18} />
                              </button>

                              {/* DROPDOWN MENU */}
                              <Show when={openActionId() === inv.id}>
                                <Portal>
                                  <div
                                    id="invoice-action-dropdown"
                                    class="animate-dropdown fixed w-36 bg-white border border-gray-100 rounded-xl shadow-xl z-[9999] overflow-hidden p-1"
                                    style={{
                                      top: `${dropdownPos().y}px`,
                                      left: `${dropdownPos().x}px`,
                                    }}
                                  >
                                    <button
                                      onClick={() =>
                                        navigate(
                                          `/admin/invoice/edit/${inv.id}`,
                                        )
                                      }
                                      class="flex items-center gap-2 px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 hover:text-black w-full text-left rounded-lg transition-colors"
                                    >
                                      <Pencil size={14} /> Edit
                                    </button>
                                    <div class="h-px bg-gray-100 my-1"></div>
                                    <button
                                      onClick={() => handleDelete(inv)}
                                      class="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left rounded-lg transition-colors"
                                    >
                                      <Trash2 size={14} /> Delete
                                    </button>
                                  </div>
                                </Portal>
                              </Show>
                            </td>
                          </tr>
                        )}
                      </For>
                    </Show>
                  </tbody>
                </table>
              </div>
            </div>
          </Show>

          {/* ================= SUMMARY VIEW ================= */}
          <Show when={activeTab() === "Summary"}>
            <div class="animate-row" style={{ "animation-delay": "0.1s" }}>
              <div class="flex gap-4 mb-8">
                {["Paid", "Unpaid"].map((status) => (
                  <button
                    onClick={() => setSummaryStatus(status)}
                    class={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                      summaryStatus() === status
                        ? "bg-black text-white shadow-md"
                        : "bg-white text-gray-500 border border-gray-200 hover:border-gray-300 hover:text-gray-800"
                    }`}
                  >
                    {status} Invoices
                  </button>
                ))}
              </div>

              <Show
                when={Object.keys(summaryData()).length > 0}
                fallback={
                  <div class="p-8 text-center text-gray-400 bg-white rounded-2xl border border-gray-100">
                    No data available for this status.
                  </div>
                }
              >
                <For each={Object.entries(summaryData())}>
                  {([month, projects]) => {
                    const projectEntries = Object.entries(projects);
                    let monthTotalIT = 0;
                    let monthTotalAbr = 0;
                    let monthTotalVid = 0;

                    projectEntries.forEach(([_, div]) => {
                      monthTotalIT += div.IT || 0;
                      monthTotalAbr += div.Abracodebra || 0;
                      monthTotalVid += div.Video || 0;
                    });

                    return (
                      <div class="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 mb-8 overflow-hidden hover:shadow-md transition-shadow duration-300">
                        <div class="bg-gray-50/80 p-5 border-b border-gray-100">
                          <h2 class="text-lg font-bold text-gray-800 capitalize flex items-center gap-2">
                            <div class="w-2 h-6 bg-blue-500 rounded-full"></div>
                            {month}
                          </h2>
                        </div>

                        <div class="overflow-x-auto p-2">
                          <table class="min-w-full text-sm text-left">
                            <thead class="text-gray-500 text-xs uppercase tracking-widest border-b border-gray-100">
                              <tr>
                                <th class="p-3 font-semibold text-center w-12">
                                  No
                                </th>
                                <th class="p-3 font-semibold">Nama Project</th>
                                <th class="p-3 font-semibold text-right w-32">
                                  IT
                                </th>
                                <th class="p-3 font-semibold text-right w-32">
                                  Abracodebra
                                </th>
                                <th class="p-3 font-semibold text-right w-32">
                                  Video
                                </th>
                                <th class="p-3 font-semibold text-right w-36">
                                  Total
                                </th>
                              </tr>
                            </thead>
                            <tbody class="divide-y divide-gray-50">
                              <For each={projectEntries}>
                                {([project, div], index) => {
                                  const valIT = div.IT || 0;
                                  const valAbr = div.Abracodebra || 0;
                                  const valVid = div.Video || 0;
                                  const total = valIT + valAbr + valVid;

                                  return (
                                    <tr class="hover:bg-gray-50/50 transition-colors">
                                      <td class="p-3 text-center text-gray-400">
                                        {index() + 1}
                                      </td>
                                      <td class="p-3 font-medium text-gray-700">
                                        {project}
                                      </td>
                                      <td class="p-3 text-right text-gray-600">
                                        Rp {valIT.toLocaleString("id-ID")}
                                      </td>
                                      <td class="p-3 text-right text-gray-600">
                                        Rp {valAbr.toLocaleString("id-ID")}
                                      </td>
                                      <td class="p-3 text-right text-gray-600">
                                        Rp {valVid.toLocaleString("id-ID")}
                                      </td>
                                      <td class="p-3 text-right font-bold text-gray-800">
                                        Rp {total.toLocaleString("id-ID")}
                                      </td>
                                    </tr>
                                  );
                                }}
                              </For>

                              <tr class="bg-blue-50/30 border-t-2 border-blue-100">
                                <td
                                  class="p-4 font-bold text-gray-800 uppercase tracking-widest text-xs"
                                  colspan="2"
                                >
                                  Grand Total {month}
                                </td>
                                <td class="p-4 text-right font-semibold text-blue-700">
                                  Rp {monthTotalIT.toLocaleString("id-ID")}
                                </td>
                                <td class="p-4 text-right font-semibold text-blue-700">
                                  Rp {monthTotalAbr.toLocaleString("id-ID")}
                                </td>
                                <td class="p-4 text-right font-semibold text-blue-700">
                                  Rp {monthTotalVid.toLocaleString("id-ID")}
                                </td>
                                <td class="p-4 text-right font-bold text-blue-800 text-base">
                                  Rp{" "}
                                  {(
                                    monthTotalIT +
                                    monthTotalAbr +
                                    monthTotalVid
                                  ).toLocaleString("id-ID")}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      </div>
                    );
                  }}
                </For>
              </Show>
            </div>
          </Show>
        </Show>
      </div>
    </div>
  );
}
