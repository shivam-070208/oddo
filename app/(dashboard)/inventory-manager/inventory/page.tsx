"use client";

import Link from "next/link";
import { ArrowLeft, Activity, Package, MapPin } from "lucide-react";
import { useStockMoves } from "../_hooks/useStockMoves";
import { useSearchContext } from "@/contexts/search-context";

const typeLabels: Record<string, string> = {
  RECEIPT: "Receipt",
  DELIVERY: "Delivery",
  TRANSFER: "Transfer",
  ADJUSTMENT: "Adjustment",
};

const typeColors: Record<string, string> = {
  RECEIPT: "bg-emerald-100 text-emerald-700",
  DELIVERY: "bg-sky-100 text-sky-700",
  TRANSFER: "bg-amber-100 text-amber-700",
  ADJUSTMENT: "bg-slate-100 text-slate-700",
};

export default function InventoryPage() {
  const { searchQuery } = useSearchContext();
  const { data: moves, isLoading, error } = useStockMoves(searchQuery);
  const list = moves ?? [];

  const totalMoves = list.length;
  const receiptMoves = list.filter((m) => m.type === "RECEIPT").length;
  const deliveryMoves = list.filter((m) => m.type === "DELIVERY").length;
  const transferMoves = list.filter((m) => m.type === "TRANSFER").length;
  const adjustmentMoves = list.filter((m) => m.type === "ADJUSTMENT").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/inventory-manager"
              className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
              aria-label="Back"
            >
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-2xl font-bold text-slate-900">Inventory</h1>
          </div>
          <p className="mt-1 text-sm text-slate-600">
            Live view of stock movements across products and locations.
          </p>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            TOTAL MOVES
          </p>
          <div className="flex items-center gap-2">
            <Activity size={18} className="shrink-0 text-slate-500" />
            <p className="text-lg font-semibold text-slate-900">
              {totalMoves}
            </p>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            RECEIPTS
          </p>
          <div className="flex items-center gap-2">
            <Package size={18} className="shrink-0 text-emerald-600" />
            <p className="text-lg font-semibold text-slate-900">
              {receiptMoves}
            </p>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            DELIVERIES
          </p>
          <div className="flex items-center gap-2">
            <Package size={18} className="shrink-0 text-sky-600" />
            <p className="text-lg font-semibold text-slate-900">
              {deliveryMoves}
            </p>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            TRANSFERS & ADJUSTMENTS
          </p>
          <div className="flex items-center gap-2">
            <Activity size={18} className="shrink-0 text-amber-600" />
            <p className="text-lg font-semibold text-slate-900">
              {transferMoves + adjustmentMoves}
            </p>
          </div>
        </div>
      </div>

      {/* Stock moves table */}
      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-slate-900">
            Recent stock moves
          </h2>
          <p className="text-sm text-slate-500">
            Showing{" "}
            <span className="font-semibold text-slate-900">
              {list.length}
            </span>{" "}
            records
          </p>
        </div>
        <div className="overflow-x-auto">
          {isLoading ? (
            <p className="px-5 py-4 text-sm text-slate-500">
              Loading stock moves…
            </p>
          ) : error ? (
            <p className="px-5 py-4 text-sm text-red-600">
              Failed to load stock moves.
            </p>
          ) : list.length === 0 ? (
            <p className="px-5 py-4 text-sm text-slate-500">
              No stock moves recorded yet.
            </p>
          ) : (
            <table className="w-full min-w-190">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <th className="px-5 py-3 text-left">Type</th>
                  <th className="px-5 py-3 text-left">Product</th>
                  <th className="px-5 py-3 text-left">From</th>
                  <th className="px-5 py-3 text-left">To</th>
                  <th className="px-5 py-3 text-right">Quantity</th>
                  <th className="px-5 py-3 text-left">Reference</th>
                  <th className="px-5 py-3 text-right">Date</th>
                </tr>
              </thead>
              <tbody>
                {list.map((m) => (
                  <tr
                    key={m.id}
                    className="border-b border-slate-100 text-sm text-slate-700 transition-colors hover:bg-slate-50/50"
                  >
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          typeColors[m.type] ?? "bg-slate-100 text-slate-700"
                        }`}
                      >
                        {typeLabels[m.type] ?? m.type}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex flex-col">
                        <span className="font-medium text-slate-900">
                          {m.productName}
                        </span>
                        <span className="font-mono text-[11px] text-slate-500">
                          {m.productSku}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1 text-xs text-slate-600">
                        <MapPin size={14} className="text-slate-400" />
                        <span>{m.fromLocationName ?? "—"}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-1 text-xs text-slate-600">
                        <MapPin size={14} className="text-slate-400" />
                        <span>{m.toLocationName ?? "—"}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right font-medium">
                      {m.quantity}
                    </td>
                    <td className="px-5 py-3 text-xs text-slate-600">
                      {m.reference ?? "—"}
                    </td>
                    <td className="px-5 py-3 text-right text-xs text-slate-500">
                      {new Date(m.createdAt).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

