import { createSignal, onMount, onCleanup, For, Show } from "solid-js";
import { Portal } from "solid-js/web";
import { useNavigate } from "@solidjs/router";
import Swal from "sweetalert2";
import {
  Users,
  Plus,
  Edit,
  Trash2,
  MessageCircle,
  Wallet,
  CalendarClock,
  Ban,
  RefreshCcw,
  MoreVertical,
} from "lucide-solid";

const LIMIT_BULANAN = 3500000;

export default function Freelances() {
  const navigate = useNavigate();

  // ===== ANIMATION STATE =====
  const [isMounted, setIsMounted] = createSignal(false);

  // State khusus Dropdown
  const [activeDropdown, setActiveDropdown] = createSignal(null);
  const [dropdownPos, setDropdownPos] = createSignal({ x: 0, y: 0 });

  const [freelancers, setFreelancers] = createSignal([
    {
      id: 1,
      nama: "Budi Santoso",
      notelp: "081234567890",
      no_bank: "BCA - 1234567890 (Budi)",
      status: "Available",
      pendapatan_bulan_ini: 1500000,
      event_end_date: null,
    },
    {
      id: 2,
      nama: "Siti Aminah",
      notelp: "6289876543210",
      no_bank: "Mandiri - 0987654321 (Siti)",
      status: "Event",
      pendapatan_bulan_ini: 3000000,
      event_end_date: new Date(
        Date.now() + 3 * 24 * 60 * 60 * 1000,
      ).toISOString(),
    },
    {
      id: 3,
      nama: "Andi Wijaya",
      notelp: "085612345678",
      no_bank: "BRI - 1122334455 (Andi)",
      status: "Not Available",
      pendapatan_bulan_ini: 3600000,
      event_end_date: null,
    },
  ]);

  // ===== EVENT LISTENER GLOBAL (ANTI BOCOR) =====
  onMount(() => {
    setTimeout(() => setIsMounted(true), 50);

    const closeDropdown = (e) => {
      // Cek kalau yang diklik adalah tombol 3 titik (jangan tutup)
      if (e && e.type === "click" && e.target.closest(".btn-action-dropdown"))
        return;
      // Cek kalau yang diklik adalah area menu di dalam portal (jangan tutup)
      if (e && e.type === "click" && e.target.closest(".dropdown-menu-portal"))
        return;

      setActiveDropdown(null);
    };

    document.addEventListener("click", closeDropdown);
    window.addEventListener("scroll", closeDropdown, true);
    window.addEventListener("resize", closeDropdown);

    onCleanup(() => {
      document.removeEventListener("click", closeDropdown);
      window.removeEventListener("scroll", closeDropdown, true);
      window.removeEventListener("resize", closeDropdown);
    });
  });

  // ===== LOGIC KLIK TOMBOL 3 TITIK =====
  const toggleDropdown = (id, e) => {
    e.stopPropagation();

    if (activeDropdown() === id) {
      setActiveDropdown(null);
      return;
    }

    const rect = e.currentTarget.getBoundingClientRect();

    setDropdownPos({
      x: rect.right - 192, // 192px = w-48 (lebar menu dropdown)
      y: rect.top - 8, // Jarak atas biar melayang
    });

    setActiveDropdown(id);
  };

  // ===== HELPERS =====
  const formatIDR = (num) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 0,
    }).format(num);
  const formatWA = (phone) => {
    if (!phone) return "";
    let formatted = phone.replace(/\D/g, "");
    if (formatted.startsWith("0")) formatted = "62" + formatted.substring(1);
    return `https://wa.me/${formatted}`;
  };

  const getCountdown = (endDateStr) => {
    if (!endDateStr) return null;
    const diffDays = Math.ceil(
      (new Date(endDateStr) - new Date()) / (1000 * 60 * 60 * 24),
    );
    return diffDays <= 0 ? "Selesai hari ini" : `Ready dlm ${diffDays} hari`;
  };

  const getStatusBadge = (status) => {
    if (status === "Available")
      return "bg-green-100 text-green-700 border border-green-200";
    if (status === "Event")
      return "bg-blue-100 text-blue-700 border border-blue-200";
    return "bg-gray-100 text-gray-600 border border-gray-200";
  };

  // ===== ACTION HANDLERS =====
  const handleUpdateUang = async (item) => {
    setActiveDropdown(null);
    const { value: addAmount } = await Swal.fire({
      title: "Update Pendapatan",
      html: `<p class="text-sm text-gray-500 mb-4">Tambahkan uang yang diterima <b>${item.nama}</b> bulan ini.</p>
             <div class="text-left text-xs font-bold text-gray-400 mb-1">JUMLAH DITAMBAHKAN (RP)</div>`,
      input: "number",
      inputPlaceholder: "Misal: 500000",
      showCancelButton: true,
      confirmButtonText: "Tambahkan",
      cancelButtonText: "Batal",
      confirmButtonColor: "#10b981",
    });

    if (addAmount) {
      const newTotal = item.pendapatan_bulan_ini + parseInt(addAmount);
      if (newTotal >= LIMIT_BULANAN && item.status !== "Not Available") {
        Swal.fire({
          icon: "warning",
          title: "Limit Tercapai!",
          text: "Pendapatan >= Rp 3.5 Juta. Status diubah ke Not Available.",
          confirmButtonColor: "#000",
        });
      } else {
        Swal.fire({
          icon: "success",
          title: "Berhasil",
          text: "Pendapatan diperbarui!",
          timer: 1500,
          showConfirmButton: false,
        });
      }
      setFreelancers((prev) =>
        prev.map((f) =>
          f.id === item.id
            ? {
                ...f,
                pendapatan_bulan_ini: newTotal,
                status: newTotal >= LIMIT_BULANAN ? "Not Available" : f.status,
              }
            : f,
        ),
      );
    }
  };

  const handleUpdateStatus = async (item) => {
    setActiveDropdown(null);
    if (item.pendapatan_bulan_ini >= LIMIT_BULANAN) {
      return Swal.fire({
        icon: "error",
        title: "Tidak Bisa Ambil Event",
        text: "Freelance sudah mencapai limit pendapatan.",
        confirmButtonColor: "#000",
      });
    }

    const { value: formValues } = await Swal.fire({
      title: "Update Status",
      html: `
        <select id="swal-status" class="w-full px-4 py-3 border border-gray-300 rounded-xl mb-4 text-sm outline-none">
          <option value="Available" ${item.status === "Available" ? "selected" : ""}>Available</option>
          <option value="Event" ${item.status === "Event" ? "selected" : ""}>Sedang Event</option>
          <option value="Not Available" ${item.status === "Not Available" ? "selected" : ""}>Not Available</option>
        </select>
        <div id="hari-kerja-container" style="display: ${item.status === "Event" ? "block" : "none"}; text-align: left;">
          <label class="text-xs font-bold text-gray-500 mb-1 block">JUMLAH HARI KERJA</label>
          <input id="swal-hari" type="number" min="1" placeholder="Berapa hari?" class="w-full px-4 py-3 border border-gray-300 rounded-xl text-sm outline-none">
        </div>
      `,
      didOpen: () => {
        document
          .getElementById("swal-status")
          .addEventListener("change", (e) => {
            document.getElementById("hari-kerja-container").style.display =
              e.target.value === "Event" ? "block" : "none";
          });
      },
      preConfirm: () => {
        const status = document.getElementById("swal-status").value;
        const hari = document.getElementById("swal-hari").value;
        if (status === "Event" && !hari)
          Swal.showValidationMessage("Jumlah hari kerja wajib diisi!");
        return { status, hari: parseInt(hari) };
      },
      showCancelButton: true,
      confirmButtonText: "Simpan",
      confirmButtonColor: "#000",
    });

    if (formValues) {
      setFreelancers((prev) =>
        prev.map((f) =>
          f.id === item.id
            ? {
                ...f,
                status: formValues.status,
                event_end_date:
                  formValues.status === "Event"
                    ? new Date(
                        Date.now() + formValues.hari * 24 * 60 * 60 * 1000,
                      ).toISOString()
                    : null,
              }
            : f,
        ),
      );
      Swal.fire({
        icon: "success",
        title: "Berhasil",
        timer: 1000,
        showConfirmButton: false,
      });
    }
  };

  const handleDelete = async (id) => {
    setActiveDropdown(null);
    const confirm = await Swal.fire({
      title: "Hapus Freelance?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Ya, Hapus",
      confirmButtonColor: "#ef4444",
    });
    if (confirm.isConfirmed) {
      setFreelancers((prev) => prev.filter((f) => f.id !== id));
      Swal.fire({
        icon: "success",
        title: "Terhapus!",
        timer: 1000,
        showConfirmButton: false,
      });
    }
  };

  return (
    <div class="p-6 bg-gray-50/50 min-h-screen font-sans">
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-row {
          opacity: 0;
          animation: fadeSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        /* ANIMASI KHUSUS DROPDOWN (Mumbul ke Atas) */
        @keyframes popUp {
          from { opacity: 0; transform: translateY(-90%) scale(0.95); }
          to { opacity: 1; transform: translateY(-100%) scale(1); }
        }
        .animate-pop-up {
          animation: popUp 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          transform-origin: bottom right; /* Titik tumpunya di kanan bawah */
        }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 10px; }
      `}</style>

      <div
        class={`max-w-7xl mx-auto space-y-6 transition-all duration-700 ease-out transform ${isMounted() ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
      >
        {/* HEADER */}
        <div class="flex justify-between items-center bg-white p-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-gray-600">
              <Users size={24} />
            </div>
            <div>
              <h1 class="text-2xl font-bold text-gray-800 tracking-tight">
                Freelance Management
              </h1>
              <p class="text-sm text-gray-500 mt-0.5">
                Kelola data, status, dan pembayaran freelancer.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate("/admin/freelance/create")}
            class="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:-translate-y-0.5 active:scale-95 transition-all"
          >
            <Plus size={16} /> Tambah Freelance
          </button>
        </div>

        {/* TABLE SECTION */}
        <div class="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
          <Show when={freelancers().length > 0}>
            <div class="overflow-x-auto overflow-y-auto max-h-[65vh] custom-scrollbar">
              <table class="min-w-full text-sm text-left whitespace-nowrap">
                <thead class="bg-gray-50/80 text-gray-500 text-xs uppercase tracking-widest sticky top-0 z-10 backdrop-blur-sm border-b border-gray-100">
                  <tr>
                    <th class="p-4 font-semibold text-center w-12">#</th>
                    <th class="p-4 font-semibold">Nama & Kontak</th>
                    <th class="p-4 font-semibold">Rekening Bank</th>
                    <th class="p-4 font-semibold text-center">
                      Status & Ketersediaan
                    </th>
                    <th class="p-4 font-semibold text-right">
                      Diterima (Bulan Ini)
                    </th>
                    <th class="p-4 font-semibold text-center w-16">Aksi</th>
                  </tr>
                </thead>

                <tbody class="divide-y divide-gray-50">
                  <For each={freelancers()}>
                    {(item, i) => {
                      const isOverLimit =
                        item.pendapatan_bulan_ini >= LIMIT_BULANAN;

                      return (
                        <tr
                          class={`animate-row hover:bg-gray-50/80 transition-colors duration-200 ${isOverLimit ? "bg-red-50/20" : ""}`}
                          style={{ "animation-delay": `${i() * 0.05}s` }}
                        >
                          <td class="p-4 text-center text-gray-400 font-medium">
                            {i() + 1}
                          </td>

                          {/* KOLOM LAINNYA */}
                          <td class="p-4">
                            <div class="font-bold text-gray-800">
                              {item.nama}
                            </div>
                            <a
                              href={formatWA(item.notelp)}
                              target="_blank"
                              rel="noopener noreferrer"
                              class="inline-flex items-center gap-1.5 text-xs mt-1 px-2 py-0.5 rounded bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors font-medium"
                            >
                              <MessageCircle size={12} /> {item.notelp}
                            </a>
                          </td>
                          <td class="p-4 text-gray-600 font-medium">
                            {item.no_bank}
                          </td>
                          <td class="p-4 text-center">
                            <span
                              class={`px-3 py-1 rounded-full text-[11px] font-bold tracking-wide uppercase ${getStatusBadge(item.status)}`}
                            >
                              {item.status}
                            </span>
                            <Show
                              when={
                                item.status === "Event" && item.event_end_date
                              }
                            >
                              <div class="mt-1.5 text-[10px] font-bold text-blue-500 bg-blue-50 px-2 py-0.5 rounded border border-blue-100 flex items-center justify-center gap-1 w-max mx-auto">
                                <CalendarClock size={10} />{" "}
                                {getCountdown(item.event_end_date)}
                              </div>
                            </Show>
                          </td>
                          <td class="p-4 text-right">
                            <div
                              class={`font-bold text-base ${isOverLimit ? "text-red-600" : "text-gray-800"}`}
                            >
                              {formatIDR(item.pendapatan_bulan_ini)}
                            </div>
                            <Show when={isOverLimit}>
                              <div class="flex items-center justify-end gap-1 mt-1 text-[10px] font-bold text-white bg-red-500 px-2 py-0.5 rounded w-max ml-auto">
                                <Ban size={10} strokeWidth={3} /> LIMIT TERCAPAI
                              </div>
                            </Show>
                          </td>

                          {/* KOLOM AKSI (TOMBOL 3 TITIK) */}
                          <td class="p-4 text-center">
                            {/* Class btn-action-dropdown itu wajib ada, buat tanda ke event global */}
                            <button
                              type="button"
                              onClick={(e) => toggleDropdown(item.id, e)}
                              class="btn-action-dropdown p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-lg transition-colors focus:outline-none"
                            >
                              <MoreVertical size={20} />
                            </button>

                            {/* PORTAL RENDER DROPDOWN DI LUAR TABLE */}
                            <Show when={activeDropdown() === item.id}>
                              <Portal>
                                {/* Class dropdown-menu-portal ini juga wajib buat ngehindarin auto-close */}
                                <div
                                  class="dropdown-menu-portal fixed animate-pop-up flex flex-col bg-white border border-gray-100 shadow-[0_10px_40px_rgb(0,0,0,0.15)] rounded-2xl p-1.5 w-48 z-[99999]"
                                  style={{
                                    top: `${dropdownPos().y}px`,
                                    left: `${dropdownPos().x}px`,
                                  }}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <button
                                    onClick={() => handleUpdateUang(item)}
                                    class="flex items-center gap-3 w-full p-2.5 text-sm font-bold text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors text-left"
                                  >
                                    <Wallet size={16} /> Tambah Uang
                                  </button>
                                  <button
                                    onClick={() => handleUpdateStatus(item)}
                                    class="flex items-center gap-3 w-full p-2.5 text-sm font-bold text-blue-600 hover:bg-blue-50 rounded-xl transition-colors text-left"
                                  >
                                    <RefreshCcw size={16} /> Update Status
                                  </button>
                                  <button
                                    onClick={() => {
                                      setActiveDropdown(null);
                                      navigate(
                                        `/admin/freelances/edit/${item.id}`,
                                      );
                                    }}
                                    class="flex items-center gap-3 w-full p-2.5 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors text-left"
                                  >
                                    <Edit size={16} /> Edit Data
                                  </button>
                                  <div class="h-px bg-gray-100 my-1 mx-2"></div>
                                  <button
                                    onClick={() => handleDelete(item.id)}
                                    class="flex items-center gap-3 w-full p-2.5 text-sm font-bold text-red-500 hover:bg-red-50 rounded-xl transition-colors text-left"
                                  >
                                    <Trash2 size={16} /> Hapus
                                  </button>
                                </div>
                              </Portal>
                            </Show>
                          </td>
                        </tr>
                      );
                    }}
                  </For>
                </tbody>
              </table>
            </div>
          </Show>
        </div>
      </div>
    </div>
  );
}
