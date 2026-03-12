import { createSignal, For, Show, onMount } from "solid-js";
import { useNavigate } from "@solidjs/router";
import {
  Plus,
  Trash2,
  ChevronDown,
  ChevronUp,
  ClipboardSignature,
  Users,
  Building, // <-- Ganti icon kalender jadi Building (Divisi)
} from "lucide-solid";
import Swal from "sweetalert2";

export default function CsInternalList() {
  const navigate = useNavigate();
  const [isMounted, setIsMounted] = createSignal(false);
  const [expandedId, setExpandedId] = createSignal(null);

  // ===== MOCK DATA =====
  // from dan to sekarang berisi nama Divisi
  const [csData, setCsData] = createSignal([
    {
      id: "evt-1",
      event_name: "BYD IIMS 2026",
      total_responders: 150,
      surveys: [
        { id: "s-1", from: "Event", to: "Procurement", responders: 100 },
        { id: "s-2", from: "Abracodebra", to: "IT", responders: 50 },
      ],
    },
    {
      id: "evt-2",
      event_name: "GIIAS Pre-Launch Show",
      total_responders: 320,
      surveys: [
        { id: "s-3", from: "Event", to: "Video", responders: 120 },
        { id: "s-4", from: "Procurement", to: "Event", responders: 200 },
      ],
    },
  ]);

  onMount(() => {
    setTimeout(() => setIsMounted(true), 50);
  });

  const toggleExpand = (id) => {
    setExpandedId(expandedId() === id ? null : id);
  };

  const handleDelete = (id) => {
    Swal.fire({
      title: "Hapus Data CS?",
      text: "Data report dari event ini akan terhapus.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Ya, Hapus",
    }).then((res) => {
      if (res.isConfirmed) {
        setCsData((prev) => prev.filter((item) => item.id !== id));
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
        class={`max-w-6xl mx-auto transition-all duration-700 ease-out transform ${isMounted() ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
      >
        {/* HEADER */}
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 gap-4 mb-8">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
              <ClipboardSignature size={24} />
            </div>
            <div>
              <h1 class="text-2xl font-bold text-gray-800 tracking-tight">
                CS Internal Report
              </h1>
              <p class="text-sm text-gray-500 mt-0.5">
                Pantau jumlah responders evaluasi antar divisi berdasarkan
                event.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate("/admin/corman-cs-internal/create")}
            class="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:-translate-y-0.5 active:scale-95 transition-all"
          >
            <Plus size={16} /> Buat Form CS
          </button>
        </div>

        {/* TABLE LIST */}
        <div class="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="min-w-full text-sm text-left">
              <thead class="bg-gray-50 text-gray-500 text-xs uppercase tracking-widest border-b border-gray-100">
                <tr>
                  <th class="p-4 font-bold text-center w-12">#</th>
                  <th class="p-4 font-bold">Nama Event</th>
                  <th class="p-4 font-bold text-center">Total Responders</th>
                  <th class="p-4 font-bold text-center w-28">Aksi</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-50">
                <Show when={csData().length === 0}>
                  <tr>
                    <td colspan="4" class="p-8 text-center text-gray-400">
                      Belum ada data CS Internal.
                    </td>
                  </tr>
                </Show>

                <For each={csData()}>
                  {(data, index) => {
                    const isExpanded = () => expandedId() === data.id;

                    return (
                      <>
                        {/* MAIN ROW */}
                        <tr
                          class={`animate-row transition-colors hover:bg-gray-50/50 ${isExpanded() ? "bg-purple-50/30" : ""}`}
                        >
                          <td class="p-4 text-center">
                            <button
                              onClick={() => toggleExpand(data.id)}
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
                          <td class="p-4 font-bold text-gray-800">
                            {data.event_name}
                          </td>
                          <td class="p-4 text-center">
                            <div class="inline-flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full font-bold text-sm border border-emerald-100">
                              <Users size={14} /> {data.total_responders}
                            </div>
                          </td>
                          <td class="p-4 text-center">
                            <div class="flex justify-center gap-2">
                              {/* <button
                                onClick={() =>
                                  navigate(
                                    `/admin/corman-cs-internal/edit/${data.id}`,
                                  )
                                }
                                class="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                              >
                                <Edit size={16} />
                              </button> */}
                              <button
                                onClick={() => handleDelete(data.id)}
                                class="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </td>
                        </tr>

                        {/* EXPANDED ROW (DETAIL DIVISI) */}
                        <Show when={isExpanded()}>
                          <tr class="bg-gray-50/50 border-b border-gray-200">
                            <td colspan="4" class="p-0">
                              <div class="p-6 pl-16 animate-row">
                                <h4 class="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center gap-2">
                                  <Building size={14} class="text-purple-500" />{" "}
                                  Detail Evaluasi Antar Divisi
                                </h4>
                                <div class="bg-white border border-gray-200 rounded-xl overflow-hidden max-w-3xl">
                                  <table class="min-w-full text-xs text-left">
                                    <thead class="bg-gray-50 text-gray-500 border-b border-gray-100 uppercase tracking-wider">
                                      <tr>
                                        <th class="px-4 py-3 font-semibold w-1/3">
                                          Nama Event
                                        </th>
                                        <th class="px-4 py-3 font-semibold text-center w-1/4">
                                          From (Divisi)
                                        </th>
                                        <th class="px-4 py-3 font-semibold text-center w-1/4">
                                          To (Divisi)
                                        </th>
                                        <th class="px-4 py-3 font-semibold text-center">
                                          Responders
                                        </th>
                                      </tr>
                                    </thead>
                                    <tbody class="divide-y divide-gray-50">
                                      <For each={data.surveys}>
                                        {(survey) => (
                                          <tr class="hover:bg-gray-50/50">
                                            <td class="px-4 py-3 font-medium text-gray-700">
                                              {data.event_name}
                                            </td>
                                            <td class="px-4 py-3 text-center text-gray-600 font-semibold">
                                              {survey.from}
                                            </td>
                                            <td class="px-4 py-3 text-center text-gray-600 font-semibold">
                                              {survey.to}
                                            </td>
                                            <td class="px-4 py-3 text-center font-bold text-gray-800">
                                              {survey.responders}
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
