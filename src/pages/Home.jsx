export default function Home() {
  return (
    <div class="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div class="text-center">
        <h1 class="text-3xl font-bold text-gray-800 mb-2">Welcome 👋</h1>
        <p class="text-gray-600 mb-6">Please login to continue</p>

        <div class="flex flex-col gap-3 w-48 mx-auto">
          <a
            href="/login"
            class="bg-blue-600 text-white py-2 rounded-md font-semibold hover:bg-blue-700 transition"
          >
            Login
          </a>

          <a
            href="/register"
            class="text-blue-600 font-medium hover:underline text-sm"
          >
            Create an account
          </a>
        </div>
      </div>
    </div>
  );
}
