import { createSignal, For, Show, onMount, createMemo } from "solid-js";
import { createStore } from "solid-js/store"; // <-- IMPORT BARU buat handle array multiple crew
import { useNavigate, useParams } from "@solidjs/router";
import { Plus, Trash2, Loader2, Check, UserPlus } from "lucide-solid";
import Swal from "sweetalert2";

export default function CrewLogForm() {
  const navigate = useNavigate();
  const params = useParams();

  const isEdit = () => !!params.id;

  // ===== STATE =====
  const [isMounted, setIsMounted] = createSignal(false);
  const [isLoading, setIsLoading] = createSignal(false);
  const [isSaving, setIsSaving] = createSignal(false);

  // Master data
  const [eventOptions, setEventOptions] = createSignal([
    { id: "evt-1", event_name: "BYD IIMS 2026" },
    { id: "evt-2", event_name: "GIIAS Pre-Launch Show" },
  ]);

  // Form Event
  const [eventForm, setEventForm] = createSignal({
    event_id: "",
    event_name: "",
    start_date: "",
    end_date: "",
    is_new_event: false,
  });

  // ===== STATE CREW (MULTIPLE) =====
  // Pake createStore biar performa mantap & input text nggak kehilangan fokus pas dirender ulang
  const [crews, setCrews] = createStore([
    { id: Date.now(), nama: "", fee_per_hari: "", kehadiran: [] },
  ]);

  // ===== DERIVED STATE =====
  const getDatesInRange = (startDate, endDate) => {
    if (!startDate || !endDate) return [];
    const date = new Date(startDate);
    const end = new Date(endDate);
    const dates = [];
    while (date <= end) {
      dates.push(new Date(date).toISOString().split("T")[0]);
      date.setDate(date.getDate() + 1);
    }
    return dates;
  };

  const eventDateRange = createMemo(() =>
    getDatesInRange(eventForm().start_date, eventForm().end_date),
  );

  // ===== HANDLERS EVENT =====
  const handleEventChange = (field, value) => {
    setEventForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleEventSelect = (eventId) => {
    const selected = eventOptions().find((e) => e.id === eventId);
    if (selected) {
      setEventForm({
        event_id: selected.id,
        event_name: selected.event_name,
        start_date: "",
        end_date: "",
        is_new_event: false,
      });
    }
  };

  const handleToggleNewEvent = () => {
    setEventForm((prev) => ({
      ...prev,
      is_new_event: !prev.is_new_event,
      event_id: "",
      event_name: "",
      start_date: "",
      end_date: "",
    }));
  };

  // ===== HANDLERS CREW (MULTIPLE) =====
  const handleAddCrew = () => {
    setCrews((prev) => [
      ...prev,
      { id: Date.now(), nama: "", fee_per_hari: "", kehadiran: [] },
    ]);
  };

  const handleRemoveCrew = (index) => {
    setCrews((prev) => prev.filter((_, i) => i !== index));
  };

  const handleCrewChange = (index, field, value) => {
    setCrews(index, field, value);
  };

  const handleToggleAttendance = (index, date) => {
    const current = crews[index].kehadiran;
    if (current.includes(date)) {
      // Kalo udah ada, hapus (uncheck)
      setCrews(index, "kehadiran", (prev) => prev.filter((d) => d !== date));
    } else {
      // Kalo belum, tambahin (check)
      setCrews(index, "kehadiran", (prev) => [...prev, date].sort());
    }
  };

  const handleSelectAllDates = (index) => {
    setCrews(index, "kehadiran", eventDateRange());
  };

  const handleDeselectAllDates = (index) => {
    setCrews(index, "kehadiran", []);
  };

  // ===== SUBMIT VALIDATION =====
  const validateForm = () => {
    if (!eventForm().event_name) {
      Swal.fire("Validation", "Nama Event wajib diisi", "warning");
      return false;
    }
    if (!eventForm().start_date || !eventForm().end_date) {
      Swal.fire("Validation", "Tanggal Event wajib diisi", "warning");
      return false;
    }

    if (crews.length === 0) {
      Swal.fire("Validation", "Minimal 1 crew harus ditambahkan", "warning");
      return false;
    }

    // Validasi per crew
    for (let i = 0; i < crews.length; i++) {
      const c = crews[i];
      if (!c.nama) {
        Swal.fire("Validation", `Nama Crew #${i + 1} wajib diisi`, "warning");
        return false;
      }
      if (!c.fee_per_hari || c.fee_per_hari <= 0) {
        Swal.fire(
          "Validation",
          `Fee per hari Crew #${i + 1} harus lebih dari 0`,
          "warning",
        );
        return false;
      }
      if (c.kehadiran.length === 0) {
        Swal.fire(
          "Validation",
          `Minimal 1 hari hadir harus dipilih untuk Crew #${i + 1}`,
          "warning",
        );
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSaving(true);

    const payload = {
      event_id: eventForm().event_id,
      event_name: eventForm().event_name,
      start_date: eventForm().start_date,
      end_date: eventForm().end_date,
      crews: crews.map((c) => ({
        crew_nama: c.nama,
        crew_fee_per_hari: parseInt(c.fee_per_hari),
        crew_kehadiran: c.kehadiran,
        is_paid: false,
      })),
    };

    try {
      console.log("Submitting Multiple Crews:", payload);
      await new Promise((resolve) => setTimeout(resolve, 1000));

      Swal.fire({
        title: "Success",
        text: isEdit() ? "Data berhasil diupdate" : "Data berhasil disimpan",
        icon: "success",
        timer: 1500,
        showConfirmButton: false,
      });

      navigate("/admin/crews-log");
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Gagal menyimpan data", "error");
    } finally {
      setIsSaving(false);
    }
  };

  onMount(() => {
    setTimeout(() => setIsMounted(true), 50);
  });

  return (
    <div class="p-6 bg-gray-50/50 min-h-screen font-sans">
      <style>{`
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(15px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-item {
          animation: slideInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 10px; }
      `}</style>

      <div
        class={`max-w-4xl mx-auto transition-all duration-700 ease-out transform pb-24 ${
          isMounted() ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <div class="flex justify-between items-center mb-8">
          <h1 class="text-3xl font-bold text-gray-800 tracking-tight">
            {isEdit() ? "Edit Crew Log" : "Create Crew Log"}
          </h1>
        </div>

        <div class="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 p-8 space-y-8">
          <Show when={isLoading()}>
            <div class="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex items-center justify-center rounded-2xl">
              <Loader2 size={40} class="animate-spin text-black mb-4" />
            </div>
          </Show>

          {/* ========== SECTION: EVENT DETAILS ========== */}
          <section class="p-6 rounded-xl bg-gray-50/50 border border-gray-100">
            <h2 class="text-xs font-bold mb-6 text-gray-500 uppercase tracking-widest flex items-center gap-2">
              <span class="w-2 h-2 rounded-full bg-blue-500"></span>
              Event Details
            </h2>

            <div class="space-y-5">
              <div class="flex items-center gap-4 p-4 bg-white rounded-lg border border-gray-100">
                <input
                  type="checkbox"
                  id="newEventToggle"
                  checked={eventForm().is_new_event}
                  onChange={handleToggleNewEvent}
                  class="w-4 h-4 cursor-pointer rounded"
                />
                <label
                  for="newEventToggle"
                  class="text-sm font-medium text-gray-700 cursor-pointer flex-1"
                >
                  Create New Event (instead of selecting existing)
                </label>
              </div>

              <Show when={!eventForm().is_new_event}>
                <div>
                  <label class="block text-sm font-medium mb-2 text-gray-700">
                    Select Event
                  </label>
                  <select
                    value={eventForm().event_id}
                    onChange={(e) => handleEventSelect(e.target.value)}
                    class={baseInputClass}
                  >
                    <option value="" disabled>
                      Choose an event...
                    </option>
                    <For each={eventOptions()}>
                      {(evt) => (
                        <option value={evt.id}>{evt.event_name}</option>
                      )}
                    </For>
                  </select>
                </div>
              </Show>

              <Show when={eventForm().is_new_event}>
                <Input
                  label="Event Name"
                  value={eventForm().event_name}
                  onInput={(v) => handleEventChange("event_name", v)}
                  placeholder="e.g., IIMS 2026"
                />
              </Show>

              <div>
                <label class="block text-sm font-medium mb-2 text-gray-700">
                  Event Date Range
                </label>
                <div class="flex gap-3 items-center">
                  <div class="flex-1">
                    <input
                      type="date"
                      value={eventForm().start_date}
                      onChange={(e) =>
                        handleEventChange("start_date", e.target.value)
                      }
                      class={baseInputClass}
                    />
                  </div>
                  <span class="text-gray-400">to</span>
                  <div class="flex-1">
                    <input
                      type="date"
                      value={eventForm().end_date}
                      onChange={(e) =>
                        handleEventChange("end_date", e.target.value)
                      }
                      class={baseInputClass}
                    />
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ========== SECTION: CREW DETAILS (MULTIPLE) ========== */}
          <Show when={eventForm().start_date && eventForm().end_date}>
            <section class="p-6 rounded-xl bg-gray-50/50 border border-gray-100">
              <div class="flex justify-between items-center mb-6">
                <h2 class="text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
                  <span class="w-2 h-2 rounded-full bg-green-500"></span>
                  Crew Information
                </h2>
                <button
                  onClick={handleAddCrew}
                  class="flex items-center gap-2 text-sm bg-black text-white px-4 py-2 rounded-xl hover:bg-gray-800 hover:shadow-md active:scale-95 transition-all"
                >
                  <UserPlus size={16} /> Tambah Crew
                </button>
              </div>

              <div class="space-y-6">
                <For each={crews}>
                  {(crew, index) => (
                    <div class="bg-white p-6 rounded-2xl border border-gray-200 relative animate-item shadow-sm">
                      {/* Crew Card Header */}
                      <div class="flex justify-between items-center mb-5 pb-4 border-b border-gray-100">
                        <h3 class="font-bold text-gray-800 flex items-center gap-2">
                          <span class="bg-gray-100 text-gray-500 w-6 h-6 rounded-full flex items-center justify-center text-xs">
                            {index() + 1}
                          </span>
                          Data Crew
                        </h3>

                        <Show when={crews.length > 1}>
                          <button
                            onClick={() => handleRemoveCrew(index())}
                            class="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors flex items-center gap-1.5 text-xs font-semibold"
                          >
                            <Trash2 size={14} /> Hapus
                          </button>
                        </Show>
                      </div>

                      <div class="space-y-5">
                        <Input
                          label="Nama Crew"
                          value={crew.nama}
                          onInput={(v) => handleCrewChange(index(), "nama", v)}
                          placeholder="e.g., Andi Saputra"
                        />

                        <NumberInput
                          label="Fee per Hari"
                          value={crew.fee_per_hari}
                          onChange={(v) =>
                            handleCrewChange(index(), "fee_per_hari", v)
                          }
                        />

                        {/* Attendance Section */}
                        <div class="bg-gray-50/50 p-4 rounded-xl border border-gray-100 mt-2">
                          <div class="flex justify-between items-center mb-4">
                            <label class="block text-sm font-semibold text-gray-700">
                              Absensi Kehadiran
                            </label>
                            <div class="flex gap-2">
                              <button
                                type="button"
                                onClick={() => handleSelectAllDates(index())}
                                class="text-xs px-3 py-1.5 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-lg hover:bg-emerald-100 font-medium transition-colors"
                              >
                                Check All
                              </button>
                              <button
                                type="button"
                                onClick={() => handleDeselectAllDates(index())}
                                class="text-xs px-3 py-1.5 bg-gray-100 text-gray-600 border border-gray-200 rounded-lg hover:bg-gray-200 font-medium transition-colors"
                              >
                                Clear All
                              </button>
                            </div>
                          </div>

                          {/* Date Grid */}
                          <div class="flex flex-wrap gap-2">
                            <For each={eventDateRange()}>
                              {(dateStr) => (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleToggleAttendance(index(), dateStr)
                                  }
                                  title={dateStr}
                                  // PERBAIKAN: class reactive, evaluasi `.includes` langsung di sini
                                  class={`flex flex-col items-center justify-center w-[52px] h-[52px] rounded-lg border-2 font-bold text-sm transition-all duration-200 ${
                                    crew.kehadiran.includes(dateStr)
                                      ? "bg-emerald-100 border-emerald-400 text-emerald-700 shadow-sm"
                                      : "bg-white border-gray-200 text-gray-400 hover:border-gray-300 hover:bg-gray-50"
                                  }`}
                                >
                                  <span class="text-[10px] uppercase font-semibold leading-none mb-1 opacity-70">
                                    {new Date(dateStr).toLocaleString(
                                      "default",
                                      { month: "short" },
                                    )}
                                  </span>
                                  <span>{new Date(dateStr).getDate()}</span>
                                  <Show when={crew.kehadiran.includes(dateStr)}>
                                    <Check
                                      size={12}
                                      class="absolute -top-1 -right-1 bg-emerald-500 text-white rounded-full p-0.5 shadow-sm"
                                    />
                                  </Show>
                                </button>
                              )}
                            </For>
                          </div>

                          {/* Summary per Crew */}
                          <div class="mt-4 pt-4 border-t border-gray-200 flex justify-between items-center text-sm">
                            <span class="text-gray-500">
                              Total hadir:{" "}
                              <strong class="text-gray-800">
                                {crew.kehadiran.length}
                              </strong>{" "}
                              Hari
                            </span>
                            <span class="text-gray-500">
                              Total Bayar:{" "}
                              <strong class="text-emerald-600 text-base">
                                Rp{" "}
                                {(
                                  (parseInt(crew.fee_per_hari) || 0) *
                                  crew.kehadiran.length
                                ).toLocaleString("id-ID")}
                              </strong>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}
                </For>
              </div>
            </section>
          </Show>

          {/* ========== ACTION BUTTONS ========== */}
          <div class="flex justify-end gap-4 pt-6">
            <button
              onClick={() => navigate("/admin/crews-log")}
              disabled={isSaving()}
              class="px-6 py-2.5 font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 hover:text-gray-900 active:scale-95 transition-all"
            >
              Cancel
            </button>

            <button
              onClick={handleSubmit}
              disabled={isSaving()}
              class="flex items-center gap-2 px-8 py-2.5 font-medium bg-black text-white rounded-xl hover:bg-gray-800 hover:shadow-lg active:scale-95 transition-all disabled:opacity-70"
            >
              <Show when={isSaving()}>
                <Loader2 size={16} class="animate-spin" />
              </Show>
              {isSaving() ? "Menyimpan..." : "Simpan Crew Log"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ===== REUSABLE COMPONENTS =====
const baseInputClass =
  "w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white text-sm text-gray-800 " +
  "focus:outline-none focus:ring-4 focus:ring-gray-100 focus:border-gray-400 hover:border-gray-300 transition-all";

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
        class={baseInputClass}
      />
    </div>
  );
}

function NumberInput(props) {
  const format = (val) =>
    val ? new Intl.NumberFormat("id-ID").format(val) : "";
  const parse = (val) => Number(String(val).replace(/\./g, ""));

  return (
    <div>
      <label class="block text-sm font-semibold mb-2 text-gray-700">
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
