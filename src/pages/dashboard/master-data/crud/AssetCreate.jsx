import { createSignal, onMount, For, Show } from "solid-js";
import { useParams, useNavigate } from "@solidjs/router";
import Swal from "sweetalert2";
import {
  ArrowLeft,
  Save,
  ChevronDown,
  ChevronUp,
  Monitor,
  Box,
  Cpu,
  Wifi,
  Ruler,
  FileText,
  QrCode,
} from "lucide-solid";

// Import Services
import { ItemsService } from "../../../../services/items";
import { ItemsPCService } from "../../../../services/items-pc";
import { LocationsService } from "../../../../services/locations";
import { ConditionsService } from "../../../../services/conditions";
import QRComponent from "../../../../layouts/helper/QRComponent";

export default function AssetCreate() {
  const params = useParams();
  const navigate = useNavigate();
  const isEdit = !!params.id;

  const [isMounted, setIsMounted] = createSignal(false);

  const defaultFormPC = {
    asset_code: "",
    asset_name: "",
    type_pc_id: "",
    condition_id: "",
    location_id: "",
    location_notes: "",
    purchase_date: "",
    purchase_price: "",
    main_price: "",
    rent_price: "",
    notes: "",

    // Hardware
    processor: "",
    vga: "",
    vram: "",
    memory: "",
    storage: "",
    motherboard: "",
    os: "",
    psu: "",
    cooler: "",
    fan: "",
    pc_case: "",
    sn: "",
    color: "",

    // Remote Access
    pc_password: "",
    remote_desktop_code: "",
    team_viewer_code: "",
    team_viewer_password: "",
    anydesk_code: "",
    anydesk_password: "",

    // Size
    voltage: "",
    length: "",
    width: "",
    height: "",
  };

  const defaultFormGeneral = {
    asset_code: "",
    asset_name: "",
    condition_id: "",
    location_id: "",
    location_notes: "",
    notes: "",
    purchase_date: "",
    purchase_price: "",
    main_price: "",
    rent_price: "",
  };

  const [form, setForm] = createSignal(defaultFormPC);
  const [savedCode, setSavedCode] = createSignal("");
  const [openSection, setOpenSection] = createSignal(0);
  const [activeTab, setActiveTab] = createSignal("general");
  const [locations, setLocations] = createSignal([]);
  const [conditions, setConditions] = createSignal([]);
  const [isSaving, setIsSaving] = createSignal(false);

  const updateField = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  onMount(async () => {
    setTimeout(() => setIsMounted(true), 50);

    try {
      // Ambil master data
      const [locRes, condRes] = await Promise.all([
        LocationsService.list(),
        ConditionsService.list(),
      ]);
      setLocations(locRes.data);
      setConditions(condRes.data);
    } catch (err) {
      console.error("Gagal ambil master data:", err);
    }

    // Kalau edit
    if (isEdit) {
      const res =
        activeTab() === "pc"
          ? await ItemsPCService.get(params.id)
          : await ItemsService.get(params.id);

      let data = res.data?.data || res.data || res;

      // FIX ARRAY
      if (Array.isArray(data)) {
        data = data[0];
      }

      setForm(data);
      setSavedCode(data.asset_code);
    }
  });

  const submit = async () => {
    const dataToSave = form();
    dataToSave.category = activeTab();

    // Validasi
    if (!dataToSave.asset_code || !dataToSave.asset_name) {
      return Swal.fire({
        icon: "warning",
        title: "Form belum lengkap",
        text: "Asset Code & Asset Name wajib diisi!",
        confirmButtonColor: "#000",
      });
    }

    const confirm = await Swal.fire({
      title: isEdit ? "Update Asset?" : "Simpan Asset?",
      text: isEdit
        ? "Apakah kamu yakin ingin mengupdate data asset ini?"
        : "Apakah kamu yakin ingin menyimpan asset baru?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: isEdit ? "Ya, Update" : "Ya, Simpan",
      cancelButtonText: "Batal",
      confirmButtonColor: "#000",
      cancelButtonColor: "#f3f4f6",
      customClass: { cancelButton: "text-gray-800" },
    });

    if (!confirm.isConfirmed) return;
    setIsSaving(true);

    try {
      if (isEdit) {
        if (activeTab() === "pc")
          await ItemsPCService.update(params.id, form());
        else await ItemsService.update(params.id, form());

        await Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Asset berhasil diperbarui ✅",
          confirmButtonColor: "#10b981",
        });
      } else {
        if (activeTab() === "pc") await ItemsPCService.create(form());
        else await ItemsService.create(form());

        await Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Asset berhasil ditambahkan ✅",
          confirmButtonColor: "#10b981",
        });
      }

      // RESET FORM SETELAH SUBMIT
      if (activeTab() === "pc") setForm(defaultFormPC);
      else setForm(defaultFormGeneral);

      setSavedCode("");
      setOpenSection(0);
      navigate("/admin/asset"); // Balik ke list
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Terjadi kesalahan saat menyimpan data!",
        confirmButtonColor: "#ef4444",
      });
    } finally {
      setIsSaving(false);
    }
  };

  // Konfigurasi Section & Icon
  const sections = () => {
    if (activeTab() === "pc") {
      return [
        {
          title: "Informasi Utama",
          icon: <FileText size={18} class="text-blue-500" />,
          fields: [
            "asset_code",
            "asset_name",
            "type_pc_id",
            "condition_id",
            "location_id",
            "location_notes",
            "purchase_date",
            "purchase_price",
            "main_price",
            "rent_price",
            "notes",
          ],
        },
        {
          title: "Spesifikasi Hardware",
          icon: <Cpu size={18} class="text-purple-500" />,
          fields: [
            "processor",
            "vga",
            "vram",
            "memory",
            "storage",
            "motherboard",
            "os",
            "psu",
            "cooler",
            "fan",
            "pc_case",
            "sn",
            "color",
          ],
        },
        {
          title: "Remote Access",
          icon: <Wifi size={18} class="text-emerald-500" />,
          fields: [
            "pc_password",
            "remote_desktop_code",
            "team_viewer_code",
            "team_viewer_password",
            "anydesk_code",
            "anydesk_password",
          ],
        },
        {
          title: "Dimensi & Tegangan",
          icon: <Ruler size={18} class="text-amber-500" />,
          fields: ["voltage", "length", "width", "height"],
        },
      ];
    } else {
      return [
        {
          title: "Informasi Umum",
          icon: <Box size={18} class="text-blue-500" />,
          fields: [
            "asset_code",
            "asset_name",
            "condition_id",
            "location_id",
            "location_notes",
            "notes",
            "purchase_date",
            "purchase_price",
            "main_price",
            "rent_price",
          ],
        },
      ];
    }
  };

  const textAreaKeys = ["notes", "location_notes"];
  const numberKeys = [
    "purchase_price",
    "main_price",
    "rent_price",
    "length",
    "width",
    "height",
    "voltage",
  ];

  // Helper Formater Judul
  const formatLabel = (key) =>
    key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());

  // Styling Base Input biar seragam
  const baseInputClass =
    "w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50/50 text-sm text-gray-800 focus:outline-none focus:ring-4 focus:ring-gray-100 focus:border-gray-400 hover:border-gray-300 transition-all duration-200 focus:bg-white";

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
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #9ca3af; }
      `}</style>

      <div
        class={`max-w-6xl mx-auto transition-all duration-700 ease-out transform pb-24 ${isMounted() ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"}`}
      >
        {/* HEADER */}
        <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h1 class="text-3xl font-bold text-gray-800 tracking-tight">
              {isEdit ? "Edit Asset" : "Tambah Asset Baru"}
            </h1>
            <p class="text-sm text-gray-500 mt-1">
              Lengkapi form di bawah untuk menyimpan data inventaris.
            </p>
          </div>

          <div class="flex items-center gap-3">
            <button
              onClick={() => navigate("/admin/asset")}
              class="flex items-center gap-2 bg-white border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900 px-5 py-2.5 rounded-xl text-sm font-medium transition-all active:scale-95 shadow-sm"
            >
              <ArrowLeft size={16} /> Kembali
            </button>
            <button
              onClick={submit}
              disabled={isSaving()}
              class="flex items-center gap-2 bg-black text-white px-6 py-2.5 rounded-xl text-sm font-medium hover:bg-gray-800 hover:shadow-lg transition-all active:scale-95 disabled:opacity-70"
            >
              <Save size={16} />{" "}
              {isSaving()
                ? "Menyimpan..."
                : isEdit
                  ? "Update Asset"
                  : "Simpan Asset"}
            </button>
          </div>
        </div>

        {/* TAB SWITCHER (GENERAL VS PC) - Sembunyikan pas Edit */}
        <Show when={!isEdit}>
          <div class="flex justify-center mb-8">
            <div class="bg-gray-200/60 p-1.5 rounded-2xl inline-flex gap-1 shadow-inner">
              <button
                class={`flex items-center gap-2 px-8 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab() === "general" ? "bg-white text-gray-900 shadow-md transform scale-100" : "text-gray-500 hover:text-gray-700 scale-95 hover:bg-gray-200/50"}`}
                onClick={() => {
                  setActiveTab("general");
                  setForm(defaultFormGeneral);
                  setOpenSection(0);
                }}
              >
                <Box size={16} /> General Asset
              </button>
              <button
                class={`flex items-center gap-2 px-8 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab() === "pc" ? "bg-white text-gray-900 shadow-md transform scale-100" : "text-gray-500 hover:text-gray-700 scale-95 hover:bg-gray-200/50"}`}
                onClick={() => {
                  setActiveTab("pc");
                  setForm(defaultFormPC);
                  setOpenSection(0);
                }}
              >
                <Monitor size={16} /> PC / Desktop
              </button>
            </div>
          </div>
        </Show>

        {/* QR CODE PREVIEW */}
        <Show when={savedCode()}>
          <div class="bg-white p-6 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-gray-100 mb-8 flex items-center gap-6 animate-item">
            <div class="p-4 bg-gray-50 border border-dashed border-gray-200 rounded-xl">
              <QRComponent urlQr={savedCode()} />
            </div>
            <div>
              <h2 class="text-sm font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2 mb-1">
                <QrCode size={14} /> QR Code Generated
              </h2>
              <p class="text-2xl font-black text-gray-800">{savedCode()}</p>
              <p class="text-sm text-gray-500 mt-1">
                Scan kode ini untuk melihat detail asset secara instan.
              </p>
            </div>
          </div>
        </Show>

        {/* FORM SECTIONS (ACCORDION) */}
        <div class="space-y-4 overflow-y-auto" style="max-height:550px;">
          <For each={sections()}>
            {(sec, index) => {
              const isOpen = () => openSection() === index();

              return (
                <div
                  class={`bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] border transition-colors duration-300 overflow-hidden ${isOpen() ? "border-gray-200" : "border-gray-100 hover:border-gray-200"}`}
                >
                  {/* Accordion Header */}
                  <button
                    class="w-full flex justify-between items-center p-6 bg-transparent focus:outline-none group"
                    onClick={() => setOpenSection(isOpen() ? -1 : index())}
                  >
                    <div class="flex items-center gap-3">
                      <div
                        class={`p-2 rounded-xl transition-colors ${isOpen() ? "bg-gray-100" : "bg-gray-50 group-hover:bg-gray-100"}`}
                      >
                        {sec.icon}
                      </div>
                      <span
                        class={`font-bold text-lg tracking-tight transition-colors ${isOpen() ? "text-black" : "text-gray-600"}`}
                      >
                        {sec.title}
                      </span>
                    </div>
                    <div
                      class={`text-gray-400 transition-transform duration-300 ${isOpen() ? "rotate-180" : "rotate-0"}`}
                    >
                      <ChevronDown size={20} />
                    </div>
                  </button>

                  {/* Accordion Body */}
                  <div
                    class={`transition-all duration-300 ease-in-out origin-top ${isOpen() ? "max-h-[2000px] opacity-100 border-t border-gray-100" : "max-h-0 opacity-0 pointer-events-none"}`}
                  >
                    <div class="p-6 md:p-8">
                      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <For each={sec.fields}>
                          {(key) => {
                            // Render Input Helper Function
                            const renderInput = () => {
                              // DROPDOWN LOCATION
                              if (key === "location_id") {
                                return (
                                  <select
                                    class={baseInputClass}
                                    value={form()[key] || ""}
                                    onInput={(e) =>
                                      updateField(key, Number(e.target.value))
                                    }
                                  >
                                    <option value="" disabled>
                                      -- Pilih Lokasi --
                                    </option>
                                    <For each={locations()}>
                                      {(loc) => (
                                        <option value={loc.id}>
                                          {loc.location_name}
                                        </option>
                                      )}
                                    </For>
                                  </select>
                                );
                              }

                              // DROPDOWN CONDITION
                              if (key === "condition_id") {
                                return (
                                  <select
                                    class={baseInputClass}
                                    value={form()[key] || ""}
                                    onInput={(e) =>
                                      updateField(key, Number(e.target.value))
                                    }
                                  >
                                    <option value="" disabled>
                                      -- Pilih Kondisi --
                                    </option>
                                    <For each={conditions()}>
                                      {(cond) => (
                                        <option value={cond.id}>
                                          {cond.condition_name}
                                        </option>
                                      )}
                                    </For>
                                  </select>
                                );
                              }

                              // TEXTAREA
                              if (textAreaKeys.includes(key)) {
                                return (
                                  <textarea
                                    class={`${baseInputClass} resize-none`}
                                    rows="3"
                                    placeholder={`Masukkan ${formatLabel(key).toLowerCase()}...`}
                                    value={form()[key] || ""}
                                    onInput={(e) =>
                                      updateField(key, e.target.value)
                                    }
                                  />
                                );
                              }

                              // STANDARD INPUT (Date, Number, Text)
                              const isDate = key.includes("date");
                              const isNumber = numberKeys.includes(key);

                              return (
                                <input
                                  type={
                                    isDate
                                      ? "date"
                                      : isNumber
                                        ? "number"
                                        : "text"
                                  }
                                  min={isNumber ? "0" : undefined}
                                  step={isNumber ? "any" : undefined}
                                  placeholder={
                                    isDate
                                      ? ""
                                      : `Masukkan ${formatLabel(key).toLowerCase()}...`
                                  }
                                  class={baseInputClass}
                                  value={form()[key] || ""}
                                  onInput={(e) =>
                                    updateField(
                                      key,
                                      isNumber
                                        ? Number(e.target.value)
                                        : e.target.value,
                                    )
                                  }
                                />
                              );
                            };

                            // Check if field should take full width
                            const isFullWidth = textAreaKeys.includes(key);

                            return (
                              <div
                                class={`flex flex-col animate-item ${isFullWidth ? "md:col-span-2 lg:col-span-3" : ""}`}
                              >
                                <label class="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-2 flex items-center gap-1">
                                  {formatLabel(key)}
                                  {/* Kasih tanda bintang merah buat yg wajib */}
                                  {(key === "asset_code" ||
                                    key === "asset_name") && (
                                    <span class="text-red-500">*</span>
                                  )}
                                </label>
                                {renderInput()}
                              </div>
                            );
                          }}
                        </For>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }}
          </For>
        </div>
      </div>
    </div>
  );
}
