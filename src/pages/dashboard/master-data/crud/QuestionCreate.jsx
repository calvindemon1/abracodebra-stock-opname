import { createSignal, onMount, Show, For } from "solid-js";
import { createStore } from "solid-js/store";
import { useNavigate, useParams } from "@solidjs/router";
import {
  Loader2,
  ListChecks,
  Plus,
  Trash2,
  Save,
  Star,
  AlignLeft,
} from "lucide-solid";
import Swal from "sweetalert2";

export default function QuestionForm() {
  const navigate = useNavigate();
  const params = useParams();
  const isEdit = () => !!params.id;

  const [isMounted, setIsMounted] = createSignal(false);
  const [isSaving, setIsSaving] = createSignal(false);

  // MOCK MASTER DIVISI
  const divisions = ["Event", "Creative", "Procurement", "IT", "Video"];

  // STATE HEADER FORM
  const [form, setForm] = createSignal({
    from_division: "",
    to_division: "",
  });

  // STORE PERTANYAAN (Dynamic Array)
  const [questions, setQuestions] = createStore([
    { id: Date.now(), category: "", text: "", type: "rating" }, // Default 1 baris
  ]);

  onMount(() => {
    setTimeout(() => setIsMounted(true), 50);
  });

  // HANDLERS
  const handleFormChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      { id: Date.now(), category: "", text: "", type: "rating" },
    ]);
  };

  const removeQuestion = (index) => {
    if (questions.length === 1) {
      Swal.fire("Peringatan", "Minimal harus ada 1 pertanyaan!", "warning");
      return;
    }
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const updateQuestion = (index, field, value) => {
    setQuestions(index, field, value);
  };

  // SUBMIT
  const handleSubmit = async () => {
    if (!form().from_division || !form().to_division) {
      Swal.fire(
        "Error",
        "Divisi Penilai (From) dan Dinilai (To) wajib diisi!",
        "error",
      );
      return;
    }
    if (form().from_division === form().to_division) {
      Swal.fire("Error", "Divisi (From) dan (To) tidak boleh sama!", "error");
      return;
    }

    const isInvalid = questions.some(
      (q) => !q.text.trim() || !q.category.trim(),
    );
    if (isInvalid) {
      Swal.fire(
        "Error",
        "Kategori dan Isi Pertanyaan tidak boleh kosong!",
        "error",
      );
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        ...form(),
        questions: Array.from(questions),
      };
      console.log("Submitting Master Questions:", payload);

      await new Promise((r) => setTimeout(r, 1000)); // Mock API delay

      Swal.fire({
        title: "Sukses",
        text: isEdit()
          ? "Data berhasil diupdate"
          : "Set Pertanyaan berhasil dibuat",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
      navigate("/admin/corman-master/cs-questions");
    } catch (error) {
      Swal.fire("Error", "Gagal menyimpan data", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div class="p-6 bg-gray-50/50 min-h-screen font-sans pb-24">
      <style>{`
        @keyframes slideInUp { from { opacity: 0; transform: translateY(15px); } to { opacity: 1; transform: translateY(0); } }
        .animate-item { animation: slideInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>

      <div
        class={`max-w-5xl mx-auto transition-all duration-700 ease-out transform ${isMounted() ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
      >
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-800 tracking-tight">
            {isEdit() ? "Edit Set Pertanyaan" : "Buat Set Pertanyaan Baru"}
          </h1>
          <p class="text-gray-500 mt-1">
            Atur format pertanyaan untuk CS Internal antar divisi.
          </p>
        </div>

        <div class="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-8 space-y-8">
          {/* SECTION 1: FROM TO */}
          <section class="p-6 rounded-xl bg-gray-50/50 border border-gray-100">
            <h2 class="text-xs font-bold mb-6 text-gray-500 uppercase tracking-widest flex items-center gap-2">
              <ListChecks size={16} class="text-amber-500" /> Relasi Divisi
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-semibold mb-2 text-gray-700">
                  Divisi Penilai (From)
                </label>
                <select
                  value={form().from_division}
                  onChange={(e) =>
                    handleFormChange("from_division", e.target.value)
                  }
                  class={baseInputClass}
                >
                  <option value="" disabled>
                    -- Pilih Divisi --
                  </option>
                  <For each={divisions}>
                    {(d) => <option value={d}>{d}</option>}
                  </For>
                </select>
              </div>
              <div>
                <label class="block text-sm font-semibold mb-2 text-gray-700">
                  Divisi yang Dinilai (To)
                </label>
                <select
                  value={form().to_division}
                  onChange={(e) =>
                    handleFormChange("to_division", e.target.value)
                  }
                  class={baseInputClass}
                >
                  <option value="" disabled>
                    -- Pilih Divisi --
                  </option>
                  <For
                    each={divisions.filter((d) => d !== form().from_division)}
                  >
                    {(d) => <option value={d}>{d}</option>}
                  </For>
                </select>
              </div>
            </div>
          </section>

          {/* SECTION 2: DYNAMIC QUESTIONS */}
          <section class="p-6 rounded-xl bg-amber-50/40 border border-amber-100">
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-xs font-bold text-amber-700 uppercase tracking-widest flex items-center gap-2">
                <ListChecks size={16} /> Daftar Pertanyaan
              </h2>
            </div>

            <div class="space-y-4">
              <For each={questions}>
                {(q, index) => (
                  <div class="animate-item bg-white p-5 rounded-xl border border-gray-200 shadow-sm flex flex-col md:flex-row gap-4 relative">
                    {/* Nomor Urut */}
                    <div class="hidden md:flex flex-col items-center justify-start pt-2">
                      <span class="w-6 h-6 bg-gray-100 text-gray-500 text-xs font-bold flex items-center justify-center rounded-full">
                        {index() + 1}
                      </span>
                    </div>

                    <div class="flex-1 space-y-4">
                      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Kategori */}
                        <div class="md:col-span-1">
                          <label class="block text-xs font-semibold text-gray-500 mb-1.5">
                            Kategori
                          </label>
                          <input
                            type="text"
                            placeholder="Contoh: Komunikasi & Koordinasi"
                            value={q.category}
                            onInput={(e) =>
                              updateQuestion(
                                index(),
                                "category",
                                e.target.value,
                              )
                            }
                            class={baseInputClass}
                          />
                        </div>

                        {/* Tipe Jawaban */}
                        <div class="md:col-span-2">
                          <label class="block text-xs font-semibold text-gray-500 mb-1.5">
                            Tipe Jawaban (Output)
                          </label>
                          <div class="flex gap-3">
                            <label
                              class={`flex-1 flex items-center justify-center gap-2 py-2 px-4 border rounded-xl cursor-pointer transition-all ${q.type === "rating" ? "bg-yellow-50 border-yellow-400 text-yellow-700 font-bold" : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"}`}
                            >
                              <input
                                type="radio"
                                name={`type-${index()}`}
                                class="hidden"
                                checked={q.type === "rating"}
                                onChange={() =>
                                  updateQuestion(index(), "type", "rating")
                                }
                              />
                              <Star
                                size={16}
                                class={
                                  q.type === "rating"
                                    ? "fill-yellow-500 text-yellow-500"
                                    : ""
                                }
                              />{" "}
                              Rating Bintang 1-5
                            </label>
                            <label
                              class={`flex-1 flex items-center justify-center gap-2 py-2 px-4 border rounded-xl cursor-pointer transition-all ${q.type === "text" ? "bg-blue-50 border-blue-400 text-blue-700 font-bold" : "bg-white border-gray-200 text-gray-500 hover:bg-gray-50"}`}
                            >
                              <input
                                type="radio"
                                name={`type-${index()}`}
                                class="hidden"
                                checked={q.type === "text"}
                                onChange={() =>
                                  updateQuestion(index(), "type", "text")
                                }
                              />
                              <AlignLeft size={16} /> Isian Bebas (Text)
                            </label>
                          </div>
                        </div>
                      </div>

                      {/* Isi Pertanyaan */}
                      <div>
                        <label class="block text-xs font-semibold text-gray-500 mb-1.5">
                          Pertanyaan
                        </label>
                        <textarea
                          rows="2"
                          placeholder="Tuliskan isi pertanyaan evaluasi di sini..."
                          value={q.text}
                          onInput={(e) =>
                            updateQuestion(index(), "text", e.target.value)
                          }
                          class={`${baseInputClass} resize-none`}
                        ></textarea>
                      </div>
                    </div>

                    {/* Hapus Baris */}
                    <div class="flex flex-col items-center justify-center border-t md:border-t-0 md:border-l border-gray-100 pt-3 md:pt-0 md:pl-4">
                      <button
                        onClick={() => removeQuestion(index())}
                        class="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-xl transition-all w-full md:w-auto flex items-center justify-center gap-2"
                      >
                        <Trash2 size={18} />{" "}
                        <span class="md:hidden text-sm font-semibold">
                          Hapus Baris
                        </span>
                      </button>
                    </div>
                  </div>
                )}
              </For>
            </div>

            <button
              onClick={addQuestion}
              class="mt-4 w-full md:w-auto flex items-center justify-center gap-2 text-sm bg-white border border-gray-200 text-gray-700 px-5 py-2.5 rounded-xl hover:bg-gray-50 font-semibold transition-all shadow-sm"
            >
              <Plus size={16} /> Tambah Pertanyaan Lain
            </button>
          </section>

          {/* ACTIONS */}
          <div class="flex justify-end gap-3 pt-6 border-t border-gray-100">
            <button
              onClick={() => navigate("/admin/questions")}
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
              {isSaving() ? "Menyimpan..." : "Simpan Bank Pertanyaan"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const baseInputClass =
  "w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white text-sm text-gray-800 focus:outline-none focus:ring-4 focus:ring-gray-100 focus:border-gray-400 transition-all";
