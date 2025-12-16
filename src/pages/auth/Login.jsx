import { useNavigate } from "@solidjs/router";
import { createSignal } from "solid-js";
import Swal from "sweetalert2";
import { login } from "../../utils/auth";

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = createSignal("");
  const [password, setPassword] = createSignal("");

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!email() || !password()) {
      Swal.fire({
        icon: "warning",
        title: "Oops...",
        text: "Email dan password wajib diisi!",
      });
      return;
    }

    // fake login
    login("dummy-token");

    Swal.fire({
      icon: "success",
      title: "Berhasil Login!",
      timer: 1500,
      showConfirmButton: false,
    });

    setTimeout(() => {
      navigate("/admin");
    }, 1500);
  };

  return (
    <div class="flex items-center justify-center w-screen min-h-screen bg-gray-100">
      <form
        class="bg-white shadow-2xl p-10 rounded-xl flex flex-col gap-6 w-96"
        onSubmit={handleSubmit}
      >
        <h2 class="text-3xl font-bold text-center text-gray-800">Login</h2>

        <div class="flex flex-col gap-4">
          <div class="relative">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              📧
            </span>
            <input
              class="border p-3 pl-10 rounded-lg w-full focus:ring-2 focus:ring-blue-400 focus:outline-none"
              placeholder="Email"
              type="email"
              onInput={(e) => setEmail(e.target.value)}
            />
          </div>

          <div class="relative">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              🔒
            </span>
            <input
              class="border p-3 pl-10 rounded-lg w-full focus:ring-2 focus:ring-blue-400 focus:outline-none"
              type="password"
              placeholder="Password"
              onInput={(e) => setPassword(e.target.value)}
            />
          </div>
        </div>

        <button class="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-lg font-semibold transition">
          Login
        </button>
      </form>
    </div>
  );
}

// import logoAbra from "../../assets/img/logo-abracodebra.png";

// // 🔥 Generate binary random dengan spasi antar grup
// function generateRandomBinaryRow(groups = 40) {
//   let row = "";
//   for (let i = 0; i < groups; i++) {
//     const groupSize = Math.floor(Math.random() * 4) + 4; // 4–8 digit
//     let group = "";
//     for (let j = 0; j < groupSize; j++) {
//       group += Math.random() > 0.5 ? "1" : "0";
//     }
//     row += group + " ";
//   }
//   return row;
// }

// export default function Login() {
//   const binaryRows = Array(300)
//     .fill(0)
//     .map(() => generateRandomBinaryRow())
//     .join("\n");

//   return (
//     <div class="relative w-screen h-screen flex items-center justify-center bg-[#000519] overflow-hidden">
//       {/* Hacker Random Binary Background */}
//       <div
//         class="absolute inset-0 opacity-25 pointer-events-none animate-binary
//                text-[#37ff00] font-mono text-[25px]"
//         style="white-space: pre; line-height: 1.05; letter-spacing: 0.5em;"
//       >
//         {binaryRows + "\n" + binaryRows}
//       </div>

//       {/* Logo */}
//       <img src={logoAbra} alt="logo" class="z-10 scale-125" />
//     </div>
//   );
// }
