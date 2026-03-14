import Link from "next/link";
export default function InventoryManagerDashboard() {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-slate-900">Dashboard</h1>
      <p className="text-slate-600">
        Welcome to StockFlow Warehouse Alpha. Use the sidebar to navigate.
      </p>
      <Link
        href="/inventory-manager/receipt"
        className="inline-flex rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
      >
        View sample receipt
      </Link>
    </div>
  );
}