import logoAbra from "../../assets/img/logogram-abracodebra.png";

export default function Navbar() {
  return (
    <header class="py-4 pr-4">
      <div
        class="
          bg-[#0a0a0a]
          shadow-lg 
          rounded-xl 
          px-6 py-3 
          flex justify-between items-center
          border border-gray-200
          transition-all duration-300
          w-full
        "
      >
        <h1 class="font-semibold text-lg text-white">Dashboard</h1>

        <div class="flex items-center gap-3">
          <span class="text-white">Hi, Admin 👋</span>

          {/* avatar circle */}
          <div class="w-9 h-9 bg-black rounded-full">
            <img src={logoAbra} class="scale-125" alt="Avatar" />
          </div>
        </div>
      </div>
    </header>
  );
}
