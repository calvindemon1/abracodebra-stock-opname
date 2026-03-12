import { createSignal, onMount, Show, For } from "solid-js";
import { useNavigate, useParams } from "@solidjs/router";
import Swal from "sweetalert2";
import {
  Users,
  Loader2,
  Phone,
  CreditCard,
  Wallet,
  CalendarClock,
  BriefcaseBusiness,
  AlertCircle,
} from "lucide-solid";

// Batas maksimal per bulan
const LIMIT_BULANAN = 3500000;

export default function FreelanceCreate() {
  const navigate = useNavigate();
  const params = useParams();

  const isEdit = () => !!params.id;

  const [isMounted, setIsMounted] = createSignal(false);
  const [isLoading, setIsLoading] = createSignal(false);
  const [isSaving, setIsSaving] = createSignal(false);

  // State Form
  const [form, setForm] = createSignal({
    nama: "",
    notelp: "",
    no_bank: "",
    status: "Available",
    pendapatan: 0,
    hari_kerja: "", // Hanya dipakai kalau status == "Event"
  });

  const fetchDetail = async () => {
    setIsLoading(true);
    try {
      // MOCK API CALL - Ganti pakai service lu:
      // const response = await FreelanceService.getByID(params.id);
      // const data = response.data;

      // Dummy data buat testing tampilan Edit
      const data = {
        nama: "Siti Aminah",
        notelp: "089876543210",
        no_bank: "Mandiri - 0987654321 (Siti)",
        status: "Event",
        pendapatan_bulan_ini: 3000000,
        hari_kerja: 3, // Simulasi sisa hari
      };

      setTimeout(() => {
        setForm({
          nama: data.nama || "",
          notelp: data.notelp || "",
          no_bank: data.no_bank || "",
          status: data.status || "Available",
          pendapatan: data.pendapatan_bulan_ini || 0,
          hari_kerja: data.hari_kerja || "",
        });
        setIsLoading(false);
      }, 800);
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Gagal memuat detail freelance", "error");
      setIsLoading(false);
    }
  };

  onMount(() => {
    setTimeout(() => setIsMounted(true), 50);
    if (isEdit()) fetchDetail();
  });

  const handleChange = (field, value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    // Validasi Basic
    if (!form().nama || !form().notelp || !form().no_bank) {
      return Swal.fire(
        "Oops",
        "Nama, No WhatsApp, dan Rekening Bank wajib diisi!",
        "warning",
      );
    }

    if (form().status === "Event" && !form().hari_kerja) {
      return Swal.fire(
        "Oops",
        "Jumlah hari kerja wajib diisi jika status Sedang Event!",
        "warning",
      );
    }

    // Validasi Limit
    let finalStatus = form().status;
    if (form().pendapatan >= LIMIT_BULANAN && finalStatus !== "Not Available") {
      finalStatus = "Not Available";
      await Swal.fire({
        icon: "info",
        title: "Limit Tercapai",
        text: "Pendapatan >= Rp 3.5 Juta. Status otomatis diubah menjadi Not Available.",
        confirmButtonColor: "#000",
      });
    }

    setIsSaving(true);

    const payload = {
      nama: form().nama,
      notelp: form().notelp,
      no_bank: form().no_bank,
      status: finalStatus,
      pendapatan_bulan_ini: form().pendapatan,
      hari_kerja: finalStatus === "Event" ? parseInt(form().hari_kerja) : null,
    };

    try {
      // MOCK API SAVE - Ganti pake API asli lu
      // if (isEdit()) await FreelanceService.update(params.id, payload);
      // else await FreelanceService.create(payload);

      setTimeout(() => {
        Swal.fire({
          title: "Berhasil!",
          text: `Data Freelance berhasil di${isEdit() ? "update" : "simpan"}.`,
          icon: "success",
          timer: 1500,
          showConfirmButton: false,
        });
        navigate("/admin/freelance"); // Sesuaikan route balik ke list lu
        setIsSaving(false);
      }, 1000);
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Gagal menyimpan data freelance", "error");
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
        class={`max-w-4xl mx-auto transition-all duration-700 ease-out transform ${
          isMounted() ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
        }`}
      >
        <div class="flex justify-between items-center mb-8">
          <h1 class="text-3xl font-bold text-gray-800 tracking-tight">
            {isEdit() ? "Edit Data Freelance" : "Tambah Freelance Baru"}
          </h1>
        </div>

        <div class="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] h-[73vh] overflow-y-auto p-6 md:p-8 space-y-8 custom-scrollbar border border-gray-100 relative">
          <Show when={isLoading()}>
            <div class="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center rounded-2xl">
              <Loader2 size={40} class="animate-spin-slow text-black mb-4" />
              <p class="text-gray-500 font-medium">Memuat Data Freelance...</p>
            </div>
          </Show>

          {/* SECTION 1: Informasi Pribadi */}
          <section class="p-6 rounded-2xl bg-gray-50/50 border border-gray-100 hover:border-gray-200 transition-colors duration-300">
            <h2 class="text-xs font-bold mb-6 text-gray-500 uppercase tracking-widest flex items-center gap-2">
              <Users size={14} class="text-blue-500" />
              Informasi Pribadi
            </h2>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Nama Lengkap"
                placeholder="Misal: Budi Santoso"
                value={form().nama}
                onInput={(v) => handleChange("nama", v)}
                icon={<Users size={16} class="text-gray-400" />}
              />
              <Input
                label="No. WhatsApp"
                placeholder="Misal: 081234567890"
                type="tel"
                value={form().notelp}
                onInput={(v) => handleChange("notelp", v)}
                icon={<Phone size={16} class="text-gray-400" />}
              />
              <div class="md:col-span-2">
                <Input
                  label="No. Rekening & Atas Nama"
                  placeholder="Misal: BCA - 1234567890 (Budi Santoso)"
                  value={form().no_bank}
                  onInput={(v) => handleChange("no_bank", v)}
                  icon={<CreditCard size={16} class="text-gray-400" />}
                />
              </div>
            </div>
          </section>

          {/* SECTION 2: Ketersediaan & Pekerjaan */}
          <section class="p-6 rounded-2xl border border-gray-100">
            <h2 class="text-xs font-bold mb-6 text-gray-500 uppercase tracking-widest flex items-center gap-2">
              <BriefcaseBusiness size={14} class="text-emerald-500" />
              Status & Ketersediaan
            </h2>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Select
                label="Status Saat Ini"
                options={["Available", "Event", "Not Available"]}
                value={form().status}
                onChange={(v) => handleChange("status", v)}
              />

              {/* Input Hari Kerja hanya muncul kalau status "Event" */}
              <Show when={form().status === "Event"}>
                <div class="animate-item">
                  <Input
                    label="Jumlah Hari Kerja"
                    placeholder="Berapa hari event berlangsung?"
                    type="number"
                    value={form().hari_kerja}
                    onInput={(v) => handleChange("hari_kerja", v)}
                    icon={<CalendarClock size={16} class="text-gray-400" />}
                  />
                  <p class="text-[10px] text-emerald-600 mt-1.5 font-medium ml-1">
                    *Akan dihitung sebagai countdown ketersediaan.
                  </p>
                </div>
              </Show>
            </div>
          </section>

          {/* SECTION 3: Finansial */}
          <section class="p-6 rounded-2xl bg-gray-50/50 border border-gray-100 hover:border-gray-200 transition-colors duration-300">
            <h2 class="text-xs font-bold mb-6 text-gray-500 uppercase tracking-widest flex items-center gap-2">
              <Wallet size={14} class="text-purple-500" />
              Data Finansial (Bulan Ini)
            </h2>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <NumberInput
                  label="Total Pendapatan Diterima"
                  value={form().pendapatan}
                  onChange={(v) => handleChange("pendapatan", v)}
                />

                {/* Warning Limit Tercapai */}
                <Show when={form().pendapatan >= LIMIT_BULANAN}>
                  <div class="flex items-start gap-1.5 mt-2 text-red-500 bg-red-50 p-2.5 rounded-lg border border-red-100 animate-item">
                    <AlertCircle size={14} class="mt-0.5 flex-shrink-0" />
                    <p class="text-xs font-bold leading-relaxed">
                      Pendapatan sudah melewati batas (Rp 3.5 Juta). Freelance
                      ini tidak bisa mengambil event lagi bulan ini.
                    </p>
                  </div>
                </Show>
              </div>
            </div>
          </section>

          {/* ACTION BUTTONS */}
          <div class="flex justify-end gap-4 pt-6 border-t border-gray-100">
            <button
              onClick={() => navigate("/admin/freelances")}
              class="px-6 py-2.5 font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 hover:text-gray-900 active:scale-95 transition-all duration-200"
              disabled={isSaving()}
            >
              Batal
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
                ? "Menyimpan..."
                : isEdit()
                  ? "Update Data"
                  : "Simpan Freelance"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// === KOMPONEN HELPER ===

const baseInputClass =
  "w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-white text-sm text-gray-800 " +
  "focus:outline-none focus:ring-4 focus:ring-gray-100 focus:border-gray-400 hover:border-gray-300 transition-all duration-200";

function Input(props) {
  return (
    <div>
      <label class="block text-sm font-medium mb-2 text-gray-700">
        {props.label}
      </label>
      <div class="relative">
        <Show when={props.icon}>
          <div class="absolute left-3.5 top-1/2 -translate-y-1/2">
            {props.icon}
          </div>
        </Show>
        <input
          type={props.type || "text"}
          value={props.value || ""}
          onInput={(e) => props.onInput(e.target.value)}
          placeholder={props.placeholder || ""}
          class={`${baseInputClass} ${props.icon ? "pl-10" : ""}`}
        />
      </div>
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
          class={`${baseInputClass} pl-10 font-bold text-gray-700`}
          placeholder="0"
        />
      </div>
    </div>
  );
}
