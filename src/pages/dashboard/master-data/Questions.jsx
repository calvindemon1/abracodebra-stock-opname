import { createSignal, For, Show, onMount } from "solid-js";
import { useNavigate } from "@solidjs/router";
import { Plus, Trash2, Edit, FileQuestion, ArrowRight } from "lucide-solid";
import Swal from "sweetalert2";

export default function QuestionList() {
  const navigate = useNavigate();
  const [isMounted, setIsMounted] = createSignal(false);

  // ===== MOCK DATA =====
  // 1 Set merepresentasikan kumpulan pertanyaan dari Divisi A ke Divisi B
  const [qSets, setQSets] = createSignal([
    { id: "qs-1", from: "Event", to: "Creative", total_questions: 3 },
    { id: "qs-2", from: "Creative", to: "Event", total_questions: 3 },
    { id: "qs-3", from: "Event", to: "Procurement", total_questions: 2 },
  ]);

  onMount(() => {
    setTimeout(() => setIsMounted(true), 50);
  });

  const handleDelete = (id) => {
    Swal.fire({
      title: "Hapus Set Pertanyaan?",
      text: "Semua pertanyaan di dalam set ini akan terhapus.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#ef4444",
      confirmButtonText: "Ya, Hapus",
    }).then((res) => {
      if (res.isConfirmed) {
        setQSets((prev) => prev.filter((item) => item.id !== id));
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
        class={`max-w-5xl mx-auto transition-all duration-700 ease-out transform ${isMounted() ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
      >
        {/* HEADER */}
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center bg-white p-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 gap-4 mb-8">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
              <FileQuestion size={24} />
            </div>
            <div>
              <h1 class="text-2xl font-bold text-gray-800 tracking-tight">
                Master Pertanyaan CS
              </h1>
              <p class="text-sm text-gray-500 mt-0.5">
                Kelola bank pertanyaan evaluasi antar divisi.
              </p>
            </div>
          </div>
          <button
            onClick={() => navigate("/admin/questions/create")}
            class="flex items-center gap-2 bg-black text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:-translate-y-0.5 active:scale-95 transition-all"
          >
            <Plus size={16} /> Buat Set Pertanyaan
          </button>
        </div>

        {/* TABLE */}
        <div class="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 overflow-hidden">
          <div class="overflow-x-auto">
            <table class="min-w-full text-sm text-left">
              <thead class="bg-gray-50 text-gray-500 text-xs uppercase tracking-widest border-b border-gray-100">
                <tr>
                  <th class="p-4 font-bold text-center w-16">No</th>
                  <th class="p-4 font-bold">Penilai (From)</th>
                  <th class="p-4 font-bold w-12 text-center"></th>
                  <th class="p-4 font-bold">Dinilai (To)</th>
                  <th class="p-4 font-bold text-center">Jumlah Pertanyaan</th>
                  <th class="p-4 font-bold text-center w-28">Aksi</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-50">
                <Show when={qSets().length === 0}>
                  <tr>
                    <td colspan="6" class="p-8 text-center text-gray-400">
                      Belum ada master data pertanyaan.
                    </td>
                  </tr>
                </Show>

                <For each={qSets()}>
                  {(set, index) => (
                    <tr
                      class="animate-row hover:bg-gray-50/50 transition-colors"
                      style={{ "animation-delay": `${index() * 0.05}s` }}
                    >
                      <td class="p-4 text-center font-medium text-gray-400">
                        {index() + 1}
                      </td>
                      <td class="p-4 font-bold text-gray-800">{set.from}</td>
                      <td class="p-4 text-center text-gray-300">
                        <ArrowRight size={16} />
                      </td>
                      <td class="p-4 font-bold text-gray-800">{set.to}</td>
                      <td class="p-4 text-center">
                        <span class="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-xs font-bold border border-gray-200">
                          {set.total_questions} Item
                        </span>
                      </td>
                      <td class="p-4 text-center">
                        <div class="flex justify-center gap-2 opacity-60 hover:opacity-100 transition-opacity">
                          <button
                            onClick={() =>
                              navigate(
                                `/admin/questions/edit/${set.id}`,
                              )
                            }
                            class="p-1.5 text-blue-500 hover:bg-blue-50 rounded-lg"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(set.id)}
                            class="p-1.5 text-red-500 hover:bg-red-50 rounded-lg"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )}
                </For>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
