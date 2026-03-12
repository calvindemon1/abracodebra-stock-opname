import { createSignal, onMount, onCleanup, For, Show } from "solid-js";
import { Portal } from "solid-js/web";
import { useNavigate } from "@solidjs/router";
import Swal from "sweetalert2";
import {
  Users,
  Plus,
  Edit,
  Trash2,
  Check,
  X as XIcon,
  MoreVertical,
  Banknote,
  CalendarDays,
  CheckCircle2,
  FileSpreadsheet,
} from "lucide-solid";

export default function CrewLogs() {
  const navigate = useNavigate();

  // ===== STATE =====
  const [isMounted, setIsMounted] = createSignal(false);

  // State Dropdown (Action 3 Titik)
  const [activeDropdown, setActiveDropdown] = createSignal(null);
  const [dropdownPos, setDropdownPos] = createSignal({ x: 0, y: 0 });

  // ===== MOCK DATA =====
  // Struktur: Event -> Berisi daftar Crew
  const [eventLogs, setEventLogs] = createSignal([
    {
      id: "evt-1",
      event_name: "BYD IIMS 2026",
      start_date: "2026-02-15",
      end_date: "2026-02-30", // Event berlangsung 4 hari
      crews: [
        {
          id: "cr-1",
          nama: "Andi Saputra",
          fee_per_hari: 350000,
          kehadiran: ["2026-02-15", "2026-02-16", "2026-02-17"], // Hadir 3 hari
          is_paid: false,
        },
        {
          id: "cr-2",
          nama: "Novi Arianti",
          fee_per_hari: 350000,
          kehadiran: [
            "2026-02-15",
            "2026-02-16",
            "2026-02-18",
            "2026-02-19",
            "2026-02-20",
          ], // Hadir 3 hari (tgl 17 bolos)
          is_paid: true,
        },
      ],
    },
    {
      id: "evt-2",
      event_name: "GIIAS Pre-Launch Show",
      start_date: "2026-03-01",
      end_date: "2026-03-02", // Event 2 hari
      crews: [
        {
          id: "cr-3",
          nama: "Budi Santoso",
          fee_per_hari: 500000,
          kehadiran: ["2026-03-01", "2026-03-02"], // Hadir full
          is_paid: false,
        },
      ],
    },
  ]);

  // ===== LIFECYCLE & EVENT LISTENERS =====
  onMount(() => {
    setTimeout(() => setIsMounted(true), 50);

    const closeDropdown = (e) => {
      if (e && e.type === "click" && e.target.closest(".btn-action-dropdown"))
        return;
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
      x: rect.right - 160, // Lebar menu pop up
      y: rect.top - 8,
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

  // Generate Array Tanggal dari Start - End
  const getDatesInRange = (startDate, endDate) => {
    const date = new Date(startDate);
    const end = new Date(endDate);
    const dates = [];
    while (date <= end) {
      dates.push(new Date(date).toISOString().split("T")[0]);
      date.setDate(date.getDate() + 1);
    }
    return dates;
  };

  // Format Tgl untuk text di dalam kotak (e.g., "15 Feb")
  const formatShortDate = (dateStr) => {
    const d = new Date(dateStr);
    return `${d.getDate()} ${d.toLocaleString("default", { month: "short" })}`;
  };

  // Hitung Grand Total 1 Event
  const getEventTotal = (crews) => {
    return crews.reduce(
      (acc, curr) => acc + curr.fee_per_hari * curr.kehadiran.length,
      0,
    );
  };

  // ===== ACTION HANDLERS =====
  const handleMarkPaid = (crew, eventId) => {
    setActiveDropdown(null);
    Swal.fire({
      title: "Tandai Lunas?",
      text: `Set status pembayaran ${crew.nama} menjadi Lunas?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "Ya, Lunas",
      confirmButtonColor: "#10b981",
    }).then((res) => {
      if (res.isConfirmed) {
        setEventLogs((prev) =>
          prev.map((evt) => {
            if (evt.id === eventId) {
              return {
                ...evt,
                crews: evt.crews.map((c) =>
                  c.id === crew.id ? { ...c, is_paid: true } : c,
                ),
              };
            }
            return evt;
          }),
        );
        Swal.fire({
          icon: "success",
          title: "Berhasil",
          timer: 1000,
          showConfirmButton: false,
        });
      }
    });
  };

  const handleDeleteCrew = (crew, eventId) => {
    setActiveDropdown(null);
    Swal.fire({
      title: "Hapus dari List?",
      text: `Hapus ${crew.nama} dari event ini?`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "Hapus",
      confirmButtonColor: "#ef4444",
    }).then((res) => {
      if (res.isConfirmed) {
        setEventLogs((prev) =>
          prev.map((evt) => {
            if (evt.id === eventId) {
              return {
                ...evt,
                crews: evt.crews.filter((c) => c.id !== crew.id),
              };
            }
            return evt;
          }),
        );
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
        .animate-row {
          opacity: 0;
          animation: fadeSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        @keyframes popUp {
          from { opacity: 0; transform: translateY(-90%) scale(0.95); }
          to { opacity: 1; transform: translateY(-100%) scale(1); }
        }
        .animate-pop-up {
          animation: popUp 0.2s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          transform-origin: bottom right;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 10px; }
      `}</style>

      <div
        class={`max-w-7xl mx-auto space-y-8 transition-all duration-700 ease-out transform pb-24 ${isMounted() ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
      >
        {/* HEADER */}
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 gap-4">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-gray-100 rounded-xl flex items-center justify-center text-gray-600">
              <FileSpreadsheet size={24} />
            </div>
            <div>
              <h1 class="text-2xl font-bold text-gray-800 tracking-tight">
                Crew's Log & Payments
              </h1>
              <p class="text-sm text-gray-500 mt-0.5">
                Track absensi dan fee crew berdasarkan project event.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate("/admin/crews-log/create")}
            class="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:-translate-y-0.5 active:scale-95 transition-all"
          >
            <Plus size={16} /> Buat Log Baru
          </button>
        </div>

        {/* LIST EVENT CARDS */}
        <Show when={eventLogs().length === 0}>
          <div class="bg-white p-16 rounded-2xl border border-gray-100 text-center text-gray-500 shadow-sm">
            <FileSpreadsheet size={48} class="mx-auto text-gray-300 mb-4" />
            <p class="font-medium text-gray-600">Belum ada Log Event</p>
          </div>
        </Show>

        <For each={eventLogs()}>
          {(eventData) => {
            const eventDates = getDatesInRange(
              eventData.start_date,
              eventData.end_date,
            );
            const totalBayar = getEventTotal(eventData.crews);

            return (
              <div class="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden animate-row">
                {/* EVENT CARD HEADER */}
                <div class="bg-gray-50/80 px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                  <div>
                    <h2 class="text-lg font-black text-gray-800 flex items-center gap-2 uppercase tracking-wide">
                      <div class="w-2 h-6 bg-blue-500 rounded-full"></div>
                      {eventData.event_name}
                    </h2>
                    <div class="flex items-center gap-1.5 text-xs font-medium text-gray-500 mt-1 ml-4">
                      <CalendarDays size={14} />
                      {formatShortDate(eventData.start_date)} -{" "}
                      {formatShortDate(eventData.end_date)}
                    </div>
                  </div>
                  <button class="text-sm font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5">
                    <Plus size={14} /> Tambah Crew
                  </button>
                </div>

                {/* TABLE EVENT */}
                <div class="overflow-x-auto custom-scrollbar">
                  <table class="min-w-full text-sm text-left whitespace-nowrap">
                    <thead class="bg-white text-gray-400 text-[11px] uppercase tracking-widest border-b border-gray-100">
                      <tr>
                        <th class="px-6 py-4 font-bold w-12 text-center">#</th>
                        <th class="px-6 py-4 font-bold">Nama Crew</th>
                        <th class="px-6 py-4 font-bold">Absensi (Tgl)</th>
                        <th class="px-6 py-4 font-bold text-right">
                          Fee / Hari
                        </th>
                        <th class="px-6 py-4 font-bold text-center">Status</th>
                        <th class="px-6 py-4 font-bold text-right">
                          Total Bayar
                        </th>
                        <th class="px-6 py-4 font-bold text-center w-16">
                          Aksi
                        </th>
                      </tr>
                    </thead>
                    <tbody class="divide-y divide-gray-50">
                      <Show when={eventData.crews.length === 0}>
                        <tr>
                          <td colspan="7" class="p-8 text-center text-gray-400">
                            Belum ada crew di event ini.
                          </td>
                        </tr>
                      </Show>

                      <For each={eventData.crews}>
                        {(crew, i) => {
                          const totalHariHadir = crew.kehadiran.length;
                          const totalFee = crew.fee_per_hari * totalHariHadir;

                          return (
                            <tr class="hover:bg-gray-50/50 transition-colors group">
                              <td class="px-6 py-4 text-center text-gray-400 font-medium">
                                {i() + 1}
                              </td>

                              <td class="px-6 py-4 font-bold text-gray-800">
                                {crew.nama}
                              </td>

                              {/* KOLOM ABSENSI KOTAK-KOTAK */}
                              <td class="px-6 py-4">
                                {/* Tambahin flex-wrap dan max-w-[280px] biar otomatis turun ke baris baru */}
                                <div class="flex flex-wrap items-center gap-1.5 max-w-[280px]">
                                  <For each={eventDates}>
                                    {(dateStr) => {
                                      const isHadir =
                                        crew.kehadiran.includes(dateStr);
                                      return (
                                        <div
                                          title={dateStr}
                                          class={`flex flex-col items-center justify-center w-[34px] h-[36px] rounded-md border ${
                                            isHadir
                                              ? "bg-emerald-50 border-emerald-200 text-emerald-600"
                                              : "bg-gray-50 border-gray-200 text-gray-300"
                                          }`}
                                        >
                                          <span class="text-[9px] font-bold leading-none mb-0.5">
                                            {new Date(dateStr).getDate()}
                                          </span>
                                          <Show
                                            when={isHadir}
                                            fallback={
                                              <XIcon
                                                size={12}
                                                strokeWidth={3}
                                              />
                                            }
                                          >
                                            <Check size={12} strokeWidth={4} />
                                          </Show>
                                        </div>
                                      );
                                    }}
                                  </For>
                                </div>
                              </td>

                              <td class="px-6 py-4 text-right font-medium text-gray-600">
                                {formatIDR(crew.fee_per_hari)}
                              </td>

                              <td class="px-6 py-4 text-center">
                                <span
                                  class={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
                                    crew.is_paid
                                      ? "bg-emerald-100 text-emerald-700"
                                      : "bg-amber-100 text-amber-700"
                                  }`}
                                >
                                  {crew.is_paid ? "Lunas" : "Belum Lunas"}
                                </span>
                              </td>

                              <td class="px-6 py-4 text-right font-bold text-gray-800">
                                {formatIDR(totalFee)}
                              </td>

                              {/* AKSI 3 TITIK PORTAL */}
                              <td class="px-6 py-4 text-center">
                                <button
                                  type="button"
                                  onClick={(e) => toggleDropdown(crew.id, e)}
                                  class="btn-action-dropdown p-1.5 text-gray-400 hover:text-black hover:bg-gray-100 rounded-lg transition-colors focus:outline-none"
                                >
                                  <MoreVertical size={18} />
                                </button>

                                <Show when={activeDropdown() === crew.id}>
                                  <Portal>
                                    <div
                                      class="dropdown-menu-portal fixed animate-pop-up flex flex-col bg-white border border-gray-100 shadow-[0_10px_40px_rgb(0,0,0,0.15)] rounded-2xl p-1.5 w-40 z-[99999]"
                                      style={{
                                        top: `${dropdownPos().y}px`,
                                        left: `${dropdownPos().x}px`,
                                      }}
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <Show when={!crew.is_paid}>
                                        <button
                                          onClick={() =>
                                            handleMarkPaid(crew, eventData.id)
                                          }
                                          class="flex items-center gap-3 w-full p-2.5 text-sm font-bold text-emerald-600 hover:bg-emerald-50 rounded-xl transition-colors text-left"
                                        >
                                          <CheckCircle2 size={16} /> Set Lunas
                                        </button>
                                      </Show>

                                      <button
                                        onClick={() => {
                                          setActiveDropdown(null);
                                          navigate(
                                            `/admin/crews-log/edit/${crew.id}`,
                                          );
                                        }}
                                        class="flex items-center gap-3 w-full p-2.5 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors text-left"
                                      >
                                        <Edit size={16} /> Edit Data
                                      </button>

                                      <div class="h-px bg-gray-100 my-1 mx-2"></div>

                                      <button
                                        onClick={() =>
                                          handleDeleteCrew(crew, eventData.id)
                                        }
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

                      {/* GRAND TOTAL ROW */}
                      <Show when={eventData.crews.length > 0}>
                        <tr class="bg-slate-800 border-t-2 border-slate-900">
                          <td
                            colspan="5"
                            class="px-6 py-4 font-black text-slate-300 uppercase tracking-widest text-right text-xs"
                          >
                            TOTAL EVENT {eventData.event_name}
                          </td>
                          <td class="px-6 py-4 text-right font-black text-emerald-400 text-base">
                            {formatIDR(totalBayar)}
                          </td>
                          <td></td>
                        </tr>
                      </Show>
                    </tbody>
                  </table>
                </div>
              </div>
            );
          }}
        </For>
      </div>
    </div>
  );
}
