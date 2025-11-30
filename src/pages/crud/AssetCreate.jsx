import { createSignal, onMount, For } from "solid-js";
import { useParams, useNavigate } from "@solidjs/router";
import { ItemsService } from "../../services/items";
import { ItemsPCService } from "../../services/items-pc";
import QRComponent from "../../layouts/helper/QRComponent";
import Swal from "sweetalert2";
import { LocationsService } from "../../services/locations";
import { ConditionsService } from "../../services/conditions";

export default function AssetCreate() {
  const params = useParams();
  const navigate = useNavigate();
  const isEdit = !!params.id;

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

  const updateField = (key, value) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  onMount(async () => {
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
      const data =
        activeTab() === "pc"
          ? await ItemsPCService.get(params.id)
          : await ItemsService.get(params.id);

      setForm(data);
      setSavedCode(data.asset_code);
    }
  });

  const submit = async () => {
    const dataToSave = form();
    dataToSave.category = activeTab(); // optional: biar backend tahu ini PC/General

    // validasi tetap sama
    if (!dataToSave.asset_code || !dataToSave.asset_name) {
      return Swal.fire({
        icon: "warning",
        title: "Form belum lengkap",
        text: "Asset Code & Asset Name wajib diisi!",
      });
    }

    const confirm = await Swal.fire({
      title: isEdit ? "Update Asset?" : "Simpan Asset?",
      text: isEdit
        ? "Apakah kamu yakin ingin mengupdate data asset ini?"
        : "Apakah kamu yakin ingin menyimpan asset baru?",
      icon: "question",
      showCancelButton: true,
      confirmButtonText: isEdit ? "Update" : "Simpan",
      cancelButtonText: "Batal",
    });

    if (!confirm.isConfirmed) return;

    try {
      if (isEdit) {
        if (activeTab() === "pc") {
          await ItemsPCService.update(params.id, form());
        } else {
          await ItemsService.update(params.id, form());
        }

        await Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Asset berhasil diperbarui ✅",
        });
      } else {
        if (activeTab() === "pc") {
          await ItemsPCService.create(form());
        } else {
          await ItemsService.create(form());
        }

        await Swal.fire({
          icon: "success",
          title: "Berhasil!",
          text: "Asset berhasil ditambahkan ✅",
        });
      }

      // 🔥 RESET FORM SETELAH SUBMIT
      if (activeTab() === "pc") {
        setForm(defaultFormPC);
      } else {
        setForm(defaultFormGeneral);
      }
      setSavedCode("");

      // opsional: reset section juga
      setOpenSection(0);

      // opsional: kalau mau balik ke halaman yang sama kosong
      // navigate("/admin/asset/create");
    } catch (err) {
      Swal.fire({
        icon: "error",
        title: "Gagal",
        text: "Terjadi kesalahan saat menyimpan data!",
      });
    }
  };

  const sections = () => {
    if (activeTab() === "pc") {
      return [
        {
          title: "Informasi Utama",
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
          fields: ["voltage", "length", "width", "height"],
        },
      ];
    } else {
      return [
        {
          title: "Informasi Umum",
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

  return (
    <div class="p-6 space-y-6 overflow-y-auto max-h-[90vh]">
      <div class="flex gap-2 mb-4">
        <button
          class={`px-4 py-2 rounded-t font-semibold ${
            activeTab() === "general" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
          onClick={() => {
            setActiveTab("general");
            setForm(defaultFormGeneral);
          }}
        >
          General
        </button>
        <button
          class={`px-4 py-2 rounded-t font-semibold ${
            activeTab() === "pc" ? "bg-blue-600 text-white" : "bg-gray-200"
          }`}
          onClick={() => {
            setActiveTab("pc");
            setForm(defaultFormPC);
          }}
        >
          PC
        </button>
      </div>

      {/* HEADER */}
      <div class="flex justify-between items-center">
        <h1 class="text-2xl font-bold">
          {isEdit ? "Edit Asset" : "Tambah Asset"}
        </h1>
        <button
          class="bg-gray-500 text-white px-4 py-2 rounded"
          onClick={() => navigate("/admin")}
        >
          Kembali
        </button>
      </div>

      {/* FORM SECTION */}
      <For each={sections()}>
        {(sec, index) => {
          const isOpen = () => openSection() === index();

          return (
            <div class="bg-white shadow rounded">
              <button
                class="w-full flex justify-between items-center p-4 font-semibold text-lg border-b hover:bg-gray-100 transition"
                onClick={() => setOpenSection(isOpen() ? -1 : index())}
              >
                <span>{sec.title}</span>
                <span class="text-xl">{isOpen() ? "−" : "+"}</span>
              </button>

              {isOpen() && (
                <div class="p-5 space-y-4">
                  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <For each={sec.fields}>
                      {(key) => {
                        const FieldInput = () => {
                          if (key === "location_id") {
                            return (
                              <select
                                class="border rounded p-2"
                                value={form()[key]}
                                onInput={(e) =>
                                  updateField(key, Number(e.target.value))
                                }
                              >
                                <option value="">-- Pilih Lokasi --</option>
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

                          if (key === "condition_id") {
                            return (
                              <select
                                class="border rounded p-2"
                                value={form()[key]}
                                onInput={(e) =>
                                  updateField(key, Number(e.target.value))
                                }
                              >
                                <option value="">-- Pilih Kondisi --</option>
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

                          if (textAreaKeys.includes(key)) {
                            return (
                              <textarea
                                class="border rounded p-2"
                                rows="3"
                                value={form()[key]}
                                onInput={(e) =>
                                  updateField(key, e.target.value)
                                }
                              />
                            );
                          }

                          return (
                            <input
                              type={
                                key.includes("date")
                                  ? "date"
                                  : numberKeys.includes(key)
                                  ? "number"
                                  : "text"
                              }
                              min={numberKeys.includes(key) ? "0" : undefined}
                              step={
                                numberKeys.includes(key) ? "any" : undefined
                              }
                              class="border rounded p-2"
                              value={form()[key]}
                              onInput={(e) =>
                                updateField(
                                  key,
                                  numberKeys.includes(key)
                                    ? Number(e.target.value)
                                    : e.target.value
                                )
                              }
                            />
                          );
                        };

                        return (
                          <div class="flex flex-col">
                            <label class="text-sm font-semibold mb-1 capitalize">
                              {key.replace(/_/g, " ")}
                            </label>
                            <FieldInput />
                          </div>
                        );
                      }}
                    </For>
                  </div>
                </div>
              )}
            </div>
          );
        }}
      </For>

      {/* BUTTON */}
      <button
        class="bg-blue-600 text-white px-6 py-2 rounded font-semibold w-full"
        onClick={submit}
      >
        {isEdit ? "Update Asset" : "Simpan Asset"}
      </button>

      {/* QR */}
      {savedCode() && (
        <div class="mt-4">
          <h2 class="text-lg font-semibold mb-2">QR untuk: {savedCode()}</h2>
          <QRComponent urlQr={savedCode()} />
        </div>
      )}
    </div>
  );
}
