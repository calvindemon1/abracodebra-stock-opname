import { createSignal, createMemo, Show, For, onMount } from "solid-js";
import { useNavigate, useParams } from "@solidjs/router";
import {
  Loader2,
  ClipboardSignature,
  UserCheck,
  MessageSquare,
  Star,
} from "lucide-solid";
import Swal from "sweetalert2";

export default function CsInternalForm() {
  const navigate = useNavigate();
  const params = useParams();
  const isEdit = () => !!params.id;

  const [isMounted, setIsMounted] = createSignal(false);
  const [isSaving, setIsSaving] = createSignal(false);

  // ===== 1. MOCK MASTER DATA =====
  const events = [
    { id: "evt-1", name: "BYD IIMS 2026" },
    { id: "evt-2", name: "GIIAS Pre-Launch Show" },
  ];

  const divisions = ["Event", "Creative", "Procurement", "IT"];

  // Master Data Karyawan & Role per Divisi
  const teamMembers = [
    { name: "Jevin", role: "PM", division: "Event" },
    {
      name: "Eva Srihartati Simanulang",
      role: "SPV Budget",
      division: "Event",
    },
    {
      name: "Bagus Rizky Basuki",
      role: "Animasi Member",
      division: "Creative",
    },
    { name: "Reyza Alvaraby", role: "SPV Animasi", division: "Creative" },
    { name: "Deni", role: "Desain Grafis", division: "Creative" },
  ];

  // Bank Pertanyaan Dinamis (Key = "FromDivision_ToDivision")
  const questionBank = {
    Event_Creative: [
      {
        id: "q1",
        category: "Efisiensi & Waktu",
        text: "Seberapa puas tim anda terhadap ketepatan waktu progres desain serta kecepatan dalam menghadapi kendala teknis (seperti resolusi atau ukuran file)?",
      },
      {
        id: "q2",
        category: "Kualitas & Teknis",
        text: "Seberapa puas tim anda terhadap kesesuaian visual desain grafis dibandingkan dengan brief yang diberikan?",
      },
      {
        id: "q3",
        category: "Komunikasi & Koordinasi",
        text: "Seberapa puas tim anda terhadap komunikasi, kecepatan respons dan sikap (keramahan) Tim Grafis dalam menangani perubahan desain minor maupun kebutuhan mendadak saat event?",
      },
    ],
    Creative_Event: [
      {
        id: "q4",
        category: "Komunikasi & Koordinasi",
        text: "Seberapa puas tim anda terhadap kejelasan brief (Logo, Guideline, Referensi, Konsep Visual) dari tim event?",
      },
      {
        id: "q5",
        category: "Kualitas & Teknis",
        text: "Seberapa puas tim anda terhadap kesesuaian list item kebutuhan grafis (checklist, spesifikasi aset, dan kepastian approval) beserta item revisi yang diperlukan?",
      },
      {
        id: "q6",
        category: "Efisiensi & Waktu",
        text: "Seberapa puas tim anda terhadap sinkronisasi timeline produksi (Kesesuaian jadwal desain dengan kebutuhan cetak, konten LED, dan media digital) dari team event?",
      },
    ],
  };

  // ===== 2. STATE FORM =====
  const [form, setForm] = createSignal({
    event_id: "",
    from_division: "",
    to_division: "",
    target_role: "",
    target_name: "",
    feedback: "",
  });

  // State untuk menyimpan nilai rating (1-5) per pertanyaan. Key = question_id, Value = score
  const [ratings, setRatings] = createSignal({});

  onMount(() => setTimeout(() => setIsMounted(true), 50));

  // ===== 3. DERIVED STATE (LOGIC OTOMATIS) =====

  // List pertanyaan yang muncul berdasarkan pilihan From dan To
  const currentQuestions = createMemo(() => {
    const key = `${form().from_division}_${form().to_division}`;
    return questionBank[key] || []; // Return array kosong jika belum ada settingan
  });

  // Filter Roles berdasarkan Divisi Tujuan (To)
  const availableRoles = createMemo(() => {
    if (!form().to_division) return [];
    const membersInDiv = teamMembers.filter(
      (m) => m.division === form().to_division,
    );
    return [...new Set(membersInDiv.map((m) => m.role))]; // Ambil unique roles
  });

  // Filter Nama berdasarkan Divisi Tujuan & Role yang dipilih
  const availableNames = createMemo(() => {
    if (!form().to_division || !form().target_role) return [];
    return teamMembers.filter(
      (m) => m.division === form().to_division && m.role === form().target_role,
    );
  });

  // ===== 4. HANDLERS =====
  const handleFormChange = (field, value) => {
    setForm((prev) => {
      const updated = { ...prev, [field]: value };

      // Reset logic jika divisi berubah
      if (field === "to_division") {
        updated.target_role = "";
        updated.target_name = "";
      }
      if (field === "from_division" || field === "to_division") {
        setRatings({}); // Reset rating karena pertanyaan berubah
      }
      if (field === "target_role") {
        updated.target_name = "";
      }

      return updated;
    });
  };

  const setRating = (questionId, score) => {
    setRatings((prev) => ({ ...prev, [questionId]: score }));
  };

  // ===== 5. SUBMIT =====
  const handleSubmit = async () => {
    // Validasi Field Dasar
    if (!form().event_id || !form().from_division || !form().to_division) {
      Swal.fire(
        "Error",
        "Pilih Event, Divisi Penilai, dan Divisi yang Dinilai terlebih dahulu!",
        "warning",
      );
      return;
    }
    if (!form().target_role || !form().target_name) {
      Swal.fire("Error", "Pilih Role dan Nama PIC yang dinilai!", "warning");
      return;
    }

    // Validasi Pertanyaan (Pastikan semua pertanyaan punya nilai)
    const questions = currentQuestions();
    if (questions.length === 0) {
      Swal.fire(
        "Oops",
        "Belum ada master data pertanyaan untuk relasi divisi ini.",
        "info",
      );
      return;
    }

    const unanswered = questions.filter((q) => !ratings()[q.id]);
    if (unanswered.length > 0) {
      Swal.fire(
        "Error",
        "Mohon berikan rating (bintang) untuk semua pertanyaan!",
        "warning",
      );
      return;
    }

    // Validasi Feedback
    if (!form().feedback.trim()) {
      Swal.fire("Error", "Mohon isi kritik dan saran!", "warning");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        ...form(),
        ratings: ratings(),
      };
      console.log("Submitting Survey:", payload);

      await new Promise((r) => setTimeout(r, 1000)); // Mock API

      Swal.fire({
        title: "Sukses",
        text: "Feedback berhasil dikirim!",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });
      navigate("/admin/cs-internal");
    } catch (error) {
      Swal.fire("Error", "Gagal mengirim data", "error");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div class="p-6 bg-gray-50/50 min-h-screen font-sans pb-24">
      <style>{`
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-card { animation: fadeUp 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .animate-item { animation: fadeUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
      `}</style>

      <div
        class={`max-w-4xl mx-auto transition-all duration-700 ease-out transform ${isMounted() ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
      >
        <div class="mb-8">
          <h1 class="text-3xl font-bold text-gray-800 tracking-tight">
            Form CS Internal (Evaluasi Divisi)
          </h1>
          <p class="text-gray-500 mt-1">
            Berikan penilaian objektif untuk meningkatkan kualitas kerja sama
            tim.
          </p>
        </div>

        <div class="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-8 space-y-8 animate-card">
          {/* SECTION 1: SETTING DIVISI */}
          <section class="p-6 rounded-xl bg-gray-50/50 border border-gray-100">
            <h2 class="text-xs font-bold mb-6 text-gray-500 uppercase tracking-widest flex items-center gap-2">
              <ClipboardSignature size={16} class="text-purple-500" /> Konteks
              Evaluasi
            </h2>
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label class="block text-sm font-semibold mb-2 text-gray-700">
                  Event
                </label>
                <select
                  value={form().event_id}
                  onChange={(e) => handleFormChange("event_id", e.target.value)}
                  class={baseSelectClass}
                >
                  <option value="" disabled>
                    -- Pilih Event --
                  </option>
                  <For each={events}>
                    {(e) => <option value={e.id}>{e.name}</option>}
                  </For>
                </select>
              </div>
              <div>
                <label class="block text-sm font-semibold mb-2 text-gray-700">
                  Kami Dari Divisi (From)
                </label>
                <select
                  value={form().from_division}
                  onChange={(e) =>
                    handleFormChange("from_division", e.target.value)
                  }
                  class={baseSelectClass}
                >
                  <option value="" disabled>
                    -- Pilih --
                  </option>
                  <For each={divisions}>
                    {(d) => <option value={d}>{d}</option>}
                  </For>
                </select>
              </div>
              <div>
                <label class="block text-sm font-semibold mb-2 text-gray-700">
                  Ingin Menilai Divisi (To)
                </label>
                <select
                  value={form().to_division}
                  onChange={(e) =>
                    handleFormChange("to_division", e.target.value)
                  }
                  class={baseSelectClass}
                >
                  <option value="" disabled>
                    -- Pilih --
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

          {/* SECTION 2: TARGET PERSON (Muncul kalau Divisi 'To' udah dipilih) */}
          <Show when={form().to_division}>
            <section class="p-6 rounded-xl bg-blue-50/40 border border-blue-100 animate-item">
              <h2 class="text-xs font-bold mb-6 text-blue-600 uppercase tracking-widest flex items-center gap-2">
                <UserCheck size={16} /> Target Penilaian (PIC)
              </h2>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-semibold mb-2 text-gray-700">
                    Posisi / Role
                  </label>
                  <select
                    value={form().target_role}
                    onChange={(e) =>
                      handleFormChange("target_role", e.target.value)
                    }
                    class={baseSelectClass}
                  >
                    <option value="" disabled>
                      -- Pilih Role --
                    </option>
                    <For each={availableRoles()}>
                      {(r) => <option value={r}>{r}</option>}
                    </For>
                  </select>
                </div>
                <div>
                  <label class="block text-sm font-semibold mb-2 text-gray-700">
                    Nama PIC
                  </label>
                  <select
                    value={form().target_name}
                    onChange={(e) =>
                      handleFormChange("target_name", e.target.value)
                    }
                    class={baseSelectClass}
                    disabled={!form().target_role}
                  >
                    <option value="" disabled>
                      -- Pilih Nama --
                    </option>
                    <For each={availableNames()}>
                      {(n) => <option value={n.name}>{n.name}</option>}
                    </For>
                  </select>
                </div>
              </div>
            </section>
          </Show>

          {/* SECTION 3: PERTANYAAN DINAMIS (Muncul kalau form dasar lengkap & pertanyaan ada) */}
          <Show when={form().target_name}>
            <Show
              when={currentQuestions().length > 0}
              fallback={
                <div class="p-8 text-center text-amber-600 bg-amber-50 rounded-xl border border-amber-200">
                  Belum ada format pertanyaan untuk evaluasi{" "}
                  <strong>{form().from_division}</strong> ke{" "}
                  <strong>{form().to_division}</strong>.
                </div>
              }
            >
              <section class="space-y-6">
                <div class="border-b border-gray-100 pb-2">
                  <h2 class="text-lg font-bold text-gray-800">
                    Form Evaluasi Kinerja
                  </h2>
                  <p class="text-sm text-gray-500">
                    Silakan beri bintang 1 (Sangat Kurang) hingga 5 (Sangat
                    Puas).
                  </p>
                </div>

                <div class="space-y-4">
                  <For each={currentQuestions()}>
                    {(q, index) => (
                      <div
                        class="p-5 rounded-xl border border-gray-200 bg-white hover:border-gray-300 hover:shadow-sm transition-all animate-item"
                        style={{ "animation-delay": `${index() * 0.1}s` }}
                      >
                        <div class="flex flex-col md:flex-row gap-4 justify-between md:items-center">
                          <div class="flex-1">
                            <span class="inline-block px-2.5 py-1 bg-gray-100 text-gray-600 rounded-md text-[10px] font-bold uppercase tracking-wider mb-2">
                              {q.category}
                            </span>
                            <p class="text-sm font-medium text-gray-800 leading-relaxed">
                              {q.text}
                            </p>
                          </div>

                          {/* 5 STARS RATING COMPONENT */}
                          <div class="flex gap-1 items-center bg-gray-50 px-4 py-2 rounded-full border border-gray-100">
                            <For each={[1, 2, 3, 4, 5]}>
                              {(starValue) => (
                                <button
                                  type="button"
                                  onClick={() => setRating(q.id, starValue)}
                                  class="p-1 transition-transform hover:scale-110 active:scale-90 focus:outline-none"
                                >
                                  <Star
                                    size={28}
                                    class={
                                      ratings()[q.id] >= starValue
                                        ? "fill-yellow-400 text-yellow-400"
                                        : "text-gray-300"
                                    }
                                    strokeWidth={
                                      ratings()[q.id] >= starValue ? 1 : 1.5
                                    }
                                  />
                                </button>
                              )}
                            </For>
                          </div>
                        </div>
                      </div>
                    )}
                  </For>
                </div>
              </section>

              {/* SECTION 4: KRITIK DAN SARAN */}
              <section
                class="p-6 rounded-xl bg-gray-50/50 border border-gray-100 animate-item"
                style={{ "animation-delay": "0.3s" }}
              >
                <h2 class="text-xs font-bold mb-4 text-gray-500 uppercase tracking-widest flex items-center gap-2">
                  <MessageSquare size={16} class="text-green-500" /> Kritik &
                  Saran
                </h2>
                <textarea
                  rows="4"
                  placeholder="Ceritakan detail kendala yang dialami atau apresiasi terhadap kinerja tim..."
                  value={form().feedback}
                  onInput={(e) => handleFormChange("feedback", e.target.value)}
                  class="w-full px-4 py-3 border border-gray-200 rounded-xl bg-white text-sm text-gray-800 focus:outline-none focus:ring-4 focus:ring-gray-100 focus:border-gray-400 transition-all resize-none"
                ></textarea>
              </section>

              {/* ACTION BUTTON */}
              <div class="flex justify-end gap-4 pt-6 border-t border-gray-100">
                <button
                  onClick={() => navigate("/admin/corman-cs-internal")}
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
                  {isSaving() ? "Mengirim..." : "Submit Evaluasi"}
                </button>
              </div>
            </Show>
          </Show>
        </div>
      </div>
    </div>
  );
}

const baseSelectClass =
  "w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white text-sm text-gray-800 focus:outline-none focus:ring-4 focus:ring-gray-100 focus:border-gray-400 cursor-pointer transition-all";
