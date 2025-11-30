export default function Navbar() {
  return (
    <header class="py-4 pr-4">
      <div
        class="
          bg-white 
          shadow-lg 
          rounded-xl 
          px-6 py-3 
          flex justify-between items-center
          border border-gray-200
          transition-all duration-300
          w-full
        "
      >
        <h1 class="font-semibold text-lg text-gray-800">Dashboard</h1>

        <div class="flex items-center gap-3">
          <span class="text-gray-600">Hi, Admin 👋</span>

          {/* avatar circle */}
          <div class="w-9 h-9 bg-gray-300 rounded-full"></div>
        </div>
      </div>
    </header>
  );
}
