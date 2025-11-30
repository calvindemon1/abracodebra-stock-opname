export default function AuthLayout(props) {
  return (
    <div class="flex items-center justify-center min-h-screen bg-gray-100">
      <div class="p-6 bg-white shadow rounded">{props.children}</div>
    </div>
  );
}
