import Link from "next/link";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-slate-50">
      <h1 className="text-2xl font-bold text-slate-900">InventoryMS</h1>
      <Link
        href="/admin"
        className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-medium text-white hover:bg-blue-600"
      >
        Admin Dashboard
      </Link>
      <Link
        href="/login"
        className="text-slate-600 hover:text-slate-900 hover:underline"
      >
        Login
      </Link>
    </div>
  );
}