import {
  createSignal,
  createMemo,
  For,
  onMount,
  Show,
  onCleanup,
} from "solid-js";
import { useNavigate, useParams } from "@solidjs/router";
import {
  Trash2,
  Loader2,
  Image as ImageIcon,
  Tag,
  X,
  Folder,
  UploadCloud,
  FileVideo,
  File as FileIcon,
  Calculator,
} from "lucide-solid";
import Swal from "sweetalert2";

// Import service lu di sini
// import { VideoAssetService } from "../../../services/video-assets";

// Helper untuk format ukuran file (Bytes ke KB, MB, GB)
const formatBytes = (bytes, decimals = 2) => {
  if (!+bytes) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

export default function VideoDataCreate() {
  const navigate = useNavigate();
  const params = useParams();
  const isEdit = () => !!params.id;

  const [isMounted, setIsMounted] = createSignal(false);
  const [isLoading, setIsLoading] = createSignal(false);
  const [isSaving, setIsSaving] = createSignal(false);

  // 1. STATE FORM DASAR
  const [form, setForm] = createSignal({
    folderName: "",
    category: "",
    tags: [],
  });
  const [tagInput, setTagInput] = createSignal("");

  // 2. STATE THUMBNAIL (File Upload)
  const [thumbnail, setThumbnail] = createSignal({
    file: null,
    previewUrl: "",
  });

  // 3. STATE MULTIPLE FILES
  const [uploadedFiles, setUploadedFiles] = createSignal([]);

  // Auto Calculate (Derived State)
  const totalFiles = createMemo(() => uploadedFiles().length);
  const totalSize = createMemo(() => {
    const totalBytes = uploadedFiles().reduce(
      (acc, curr) => acc + curr.size,
      0,
    );
    return formatBytes(totalBytes);
  });

  // Fetch Data (Kalau Edit)
  const fetchDetail = async () => {
    setIsLoading(true);
    try {
      // Dummy data buat testing tampilan Edit
      const data = {
        folder_name: "Opening Adira Finance",
        category: "Motion Graphic",
        thumbnail_url:
          "https://images.unsplash.com/photo-1620641788415-622040ea313f?q=80&w=400&auto=format&fit=crop",
        tags: ["kuning", "petir", "semangat", "adira"],
        // Simulasi file yang udah ada dari database
        existing_files: [
          { id: "ex-1", name: "scene_01.mp4", size: 15400000 },
          { id: "ex-2", name: "sfx_swoosh.wav", size: 2300000 },
        ],
      };

      setTimeout(() => {
        setForm({
          folderName: data.folder_name || "",
          category: data.category || "",
          tags: data.tags || [],
        });

        // Load thumbnail URL ke preview
        if (data.thumbnail_url) {
          setThumbnail({ file: null, previewUrl: data.thumbnail_url });
        }

        // Load existing files
        if (data.existing_files) {
          setUploadedFiles(data.existing_files);
        }

        setIsLoading(false);
      }, 800);
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Gagal memuat detail folder", "error");
      setIsLoading(false);
    }
  };

  onMount(() => {
    setTimeout(() => setIsMounted(true), 50);
    if (isEdit()) fetchDetail();
  });

  // Cleanup object URL biar nggak memory leak
  onCleanup(() => {
    if (thumbnail().file && thumbnail().previewUrl) {
      URL.revokeObjectURL(thumbnail().previewUrl);
    }
  });

  const handleChange = (field, value) =>
    setForm((prev) => ({ ...prev, [field]: value }));

  // --- LOGIC THUMBNAIL ---
  const handleThumbnailUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Hapus preview lama kalau ada
      if (thumbnail().file && thumbnail().previewUrl) {
        URL.revokeObjectURL(thumbnail().previewUrl);
      }
      setThumbnail({
        file: file,
        previewUrl: URL.createObjectURL(file),
      });
    }
  };

  const clearThumbnail = () => {
    if (thumbnail().file && thumbnail().previewUrl) {
      URL.revokeObjectURL(thumbnail().previewUrl);
    }
    setThumbnail({ file: null, previewUrl: "" });
    // Reset input value (opsional, perlu ref)
  };

  // --- LOGIC MULTIPLE FILES ---
  const handleMultipleFiles = (e) => {
    const filesArray = Array.from(e.target.files);
    if (filesArray.length === 0) return;

    const newFiles = filesArray.map((file) => ({
      id: Math.random().toString(36).substr(2, 9), // Generate ID unik sementara
      file: file, // Object asli buat di-upload nanti
      name: file.name,
      size: file.size,
      type: file.type,
    }));

    setUploadedFiles((prev) => [...prev, ...newFiles]);
    e.target.value = ""; // Reset input biar bisa upload file yang sama lagi
  };

  const removeFile = (idToRemove) => {
    setUploadedFiles((prev) => prev.filter((f) => f.id !== idToRemove));
  };

  // --- LOGIC TAGS ---
  const handleTagKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const newTag = tagInput().trim().toLowerCase();
      if (newTag && !form().tags.includes(newTag)) {
        handleChange("tags", [...form().tags, newTag]);
      }
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove) => {
    handleChange(
      "tags",
      form().tags.filter((t) => t !== tagToRemove),
    );
  };

  const getTagColor = (index) => {
    const colors = [
      "bg-blue-100 text-blue-700 hover:bg-blue-200",
      "bg-emerald-100 text-emerald-700 hover:bg-emerald-200",
      "bg-amber-100 text-amber-700 hover:bg-amber-200",
      "bg-violet-100 text-violet-700 hover:bg-violet-200",
      "bg-rose-100 text-rose-700 hover:bg-rose-200",
    ];
    return colors[index % colors.length];
  };

  // --- SUBMIT ---
  const handleSubmit = async () => {
    if (!form().folderName || !form().category) {
      return Swal.fire(
        "Oops",
        "Nama Folder dan Kategori wajib diisi!",
        "warning",
      );
    }

    setIsSaving(true);

    // Kalau pakai API sungguhan, gunakan FormData karena ada File
    const formData = new FormData();
    formData.append("folder_name", form().folderName);
    formData.append("category", form().category);
    formData.append("tags", JSON.stringify(form().tags));

    // Thumbnail (kalau user ganti/upload baru)
    if (thumbnail().file) {
      formData.append("thumbnail", thumbnail().file);
    }

    // Multiple Files (Hanya file baru yang berupa object File)
    uploadedFiles().forEach((item) => {
      if (item.file) {
        formData.append("assets[]", item.file);
      }
    });

    try {
      // MOCK API SAVE
      // await VideoAssetService.save(formData);

      setTimeout(() => {
        Swal.fire({
          title: "Success",
          text: `Asset berhasil di${isEdit() ? "update" : "simpan"}!`,
          icon: "success",
          timer: 1500,
        });
        navigate("/admin/assets");
        setIsSaving(false);
      }, 1500);
    } catch (error) {
      console.error(error);
      Swal.fire("Error", "Gagal menyimpan data asset", "error");
      setIsSaving(false);
    }
  };

  return (
    <div class="p-6 bg-gray-50/50 min-h-screen font-sans">
      <style>{`
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-item {
          opacity: 0;
          animation: slideInUp 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
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
            {isEdit() ? "Edit Video Asset" : "Buat Folder Asset Baru"}
          </h1>
        </div>

        <div class="bg-white rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.04)] h-[73vh] overflow-y-auto p-6 md:p-8 space-y-8 custom-scrollbar border border-gray-100 relative">
          <Show when={isLoading()}>
            <div class="absolute inset-0 bg-white/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center rounded-2xl">
              <Loader2 size={40} class="animate-spin-slow text-black mb-4" />
              <p class="text-gray-500 font-medium">Memuat Data Asset...</p>
            </div>
          </Show>

          {/* SECTION 1: THUMBNAIL (Dipindah ke Paling Atas) */}
          <section>
            <h2 class="text-xs font-bold mb-4 text-gray-500 uppercase tracking-widest flex items-center gap-2">
              <ImageIcon size={14} class="text-purple-500" />
              Cover / Thumbnail Folder
            </h2>

            <div class="w-full relative bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl overflow-hidden group hover:border-gray-400 hover:bg-gray-100 transition-colors flex items-center justify-center min-h-[220px]">
              <Show
                when={thumbnail().previewUrl}
                fallback={
                  <div class="flex flex-col items-center text-gray-400 pointer-events-none p-6 text-center">
                    <div class="w-16 h-16 bg-white rounded-full shadow-sm flex items-center justify-center mb-3">
                      <ImageIcon size={28} class="text-gray-400" />
                    </div>
                    <p class="text-sm font-bold text-gray-600">
                      Upload Thumbnail
                    </p>
                    <p class="text-xs mt-1">
                      Klik atau drag gambar ke area ini
                    </p>
                  </div>
                }
              >
                <img
                  src={thumbnail().previewUrl}
                  alt="Thumbnail"
                  class="w-full h-[250px] object-cover"
                />
                {/* Tombol Hapus Thumbnail */}
                <button
                  type="button"
                  onClick={clearThumbnail}
                  class="absolute top-4 right-4 bg-white/90 backdrop-blur text-red-500 p-2 rounded-xl shadow-md hover:bg-red-50 hover:text-red-600 transition-all z-10"
                  title="Hapus Cover"
                >
                  <Trash2 size={18} />
                </button>
              </Show>

              {/* Input File Overlay (Tutup semua area box biar bisa diklik) */}
              <input
                type="file"
                accept="image/*"
                onChange={handleThumbnailUpload}
                class="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-0"
                title="Pilih Gambar"
              />
            </div>
          </section>

          {/* SECTION 2: INFORMASI DASAR & TAGS */}
          <section class="p-6 rounded-2xl bg-gray-50/50 border border-gray-100 hover:border-gray-200 transition-colors duration-300">
            <h2 class="text-xs font-bold mb-6 text-gray-500 uppercase tracking-widest flex items-center gap-2">
              <Folder size={14} class="text-blue-500" />
              Informasi Folder
            </h2>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Nama Folder / Project"
                placeholder="Misal: Opening Adira Finance"
                value={form().folderName}
                onInput={(v) => handleChange("folderName", v)}
              />

              <Select
                label="Kategori"
                options={[
                  "Footage",
                  "Motion Graphic",
                  "Template",
                  "Sound Effect",
                ]}
                value={form().category}
                onChange={(v) => handleChange("category", v)}
              />

              {/* TAGS INPUT */}
              <div class="md:col-span-2">
                <label class="block text-sm font-medium mb-2 text-gray-700 flex items-center gap-2">
                  <Tag size={14} /> Label / Tags
                </label>
                <input
                  type="text"
                  value={tagInput()}
                  onInput={(e) => setTagInput(e.target.value)}
                  onKeyDown={handleTagKeyDown}
                  placeholder="Ketik nama label lalu tekan Enter..."
                  class={baseInputClass}
                />

                <div class="flex flex-wrap gap-2 mt-3">
                  <For each={form().tags}>
                    {(tag, index) => (
                      <span
                        class={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide transition-colors ${getTagColor(index())}`}
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          class="hover:scale-125 transition-transform"
                        >
                          <X size={12} strokeWidth={3} />
                        </button>
                      </span>
                    )}
                  </For>
                  <Show when={form().tags.length === 0}>
                    <span class="text-xs text-gray-400 italic mt-1">
                      Belum ada label ditambahkan.
                    </span>
                  </Show>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 3: UPLOAD ASSET FILES */}
          <section>
            <h2 class="text-xs font-bold mb-4 text-gray-500 uppercase tracking-widest flex items-center gap-2">
              <UploadCloud size={14} class="text-emerald-500" />
              Upload File Assets
            </h2>

            {/* Kotak Upload Multiple File */}
            <div class="relative bg-emerald-50/50 border-2 border-dashed border-emerald-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center hover:bg-emerald-50 hover:border-emerald-400 transition-colors group cursor-pointer">
              <div class="w-14 h-14 bg-white rounded-full shadow-sm flex items-center justify-center mb-3 text-emerald-500 group-hover:scale-110 transition-transform">
                <UploadCloud size={24} />
              </div>
              <p class="text-sm font-bold text-gray-700">
                Klik atau Drag & Drop file ke sini
              </p>
              <p class="text-xs text-gray-500 mt-1">
                Bisa pilih banyak file sekaligus (.mp4, .mov, .wav, dll)
              </p>

              <input
                type="file"
                multiple
                onChange={handleMultipleFiles}
                class="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                title="Pilih File Asset"
              />
            </div>

            {/* Auto Calculate Info */}
            <div class="flex items-center justify-between bg-slate-800 text-white px-5 py-3 rounded-xl mt-4 shadow-md">
              <div class="flex items-center gap-2">
                <Calculator size={18} class="text-emerald-400" />
                <span class="text-sm font-semibold tracking-wide">
                  Estimasi Total Asset
                </span>
              </div>
              <div class="flex items-center gap-6">
                <div class="flex flex-col items-end">
                  <span class="text-[10px] text-slate-400 uppercase tracking-widest">
                    Files
                  </span>
                  <span class="font-bold">{totalFiles()}</span>
                </div>
                <div class="flex flex-col items-end">
                  <span class="text-[10px] text-slate-400 uppercase tracking-widest">
                    Size
                  </span>
                  <span class="font-bold text-emerald-400">{totalSize()}</span>
                </div>
              </div>
            </div>

            {/* LIST FILES KE BAWAH */}
            <Show when={uploadedFiles().length > 0}>
              <div class="mt-4 border border-gray-100 rounded-2xl overflow-hidden divide-y divide-gray-100">
                <For each={uploadedFiles()}>
                  {(fileItem, index) => (
                    <div
                      class="animate-item flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors"
                      style={{ "animation-delay": `${index() * 0.05}s` }}
                    >
                      <div class="flex items-center gap-4 overflow-hidden">
                        <div class="w-10 h-10 rounded-lg bg-blue-50 text-blue-500 flex flex-shrink-0 items-center justify-center">
                          <Show
                            when={fileItem.name.match(/\.(mp4|mov|avi)$/i)}
                            fallback={<FileIcon size={20} />}
                          >
                            <FileVideo size={20} />
                          </Show>
                        </div>
                        <div class="truncate pr-4">
                          <p class="text-sm font-bold text-gray-700 truncate">
                            {fileItem.name}
                          </p>
                          <p class="text-xs text-gray-400 font-medium">
                            {formatBytes(fileItem.size)}
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => removeFile(fileItem.id)}
                        class="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
                        title="Hapus dari daftar"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  )}
                </For>
              </div>
            </Show>
          </section>

          {/* ACTION BUTTONS */}
          <div class="flex justify-end gap-4 pt-6 border-t border-gray-100">
            <button
              onClick={() => navigate("/admin/assets")}
              class="px-6 py-2.5 font-medium text-gray-600 border border-gray-200 rounded-xl hover:bg-gray-50 hover:text-gray-900 active:scale-95 transition-all duration-200"
              disabled={isSaving()}
            >
              Batal
            </button>

            <button
              onClick={handleSubmit}
              disabled={isSaving() || uploadedFiles().length === 0}
              class="flex items-center gap-2 px-8 py-2.5 font-medium bg-black text-white rounded-xl hover:bg-gray-800 hover:shadow-lg hover:-translate-y-0.5 active:scale-95 transition-all duration-200 disabled:opacity-70 disabled:hover:translate-y-0"
            >
              <Show when={isSaving()}>
                <Loader2 size={16} class="animate-spin-slow" />
              </Show>
              {isSaving()
                ? "Menyimpan..."
                : isEdit()
                  ? "Update Folder & File"
                  : "Simpan & Upload"}
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
      <input
        type={props.type || "text"}
        value={props.value || ""}
        onInput={(e) => props.onInput(e.target.value)}
        placeholder={props.placeholder || ""}
        class={baseInputClass}
      />
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
        <option value="" disabled>
          Pilih Kategori...
        </option>
        <For each={props.options}>
          {(opt) => <option value={opt}>{opt}</option>}
        </For>
      </select>
    </div>
  );
}
