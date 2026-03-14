export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <h1 className="text-4xl font-bold mb-4 text-blue-700">Welcome to StockFlow Inventory Management</h1>
      <p className="text-lg text-gray-700 mb-8 max-w-xl text-center">
        StockFlow is your modern solution for efficiently tracking inventory, managing warehouses, and organizing staff roles. Get started by logging in or exploring the dashboard.
      </p>
      <a
        href="/login"
        className="inline-block rounded bg-blue-600 px-5 py-3 text-white font-semibold shadow hover:bg-blue-700 transition"
      >
        Get Started
      </a>
    </main>
  );
}
