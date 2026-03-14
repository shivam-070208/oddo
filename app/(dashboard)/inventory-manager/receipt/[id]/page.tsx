"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Calendar, Package, User, Tag, Printer } from "lucide-react";

type ReceiptStatus = "DRAFT" | "READY" | "DONE" | "CANCELLED";

type ReceiptItem = {
  id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    sku: string;
    unit: string;
  };
};

type ReceiptDetail = {
  id: string;
  reference: string;
  vendor: string;
  status: ReceiptStatus;
  scheduledDate: string;
  createdAt: string;
  responsible: {
    id: string;
    name: string;
    email: string;
  } | null;
  items: ReceiptItem[];
};

export default function ReceiptDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [receipt, setReceipt] = useState<ReceiptDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);

  async function loadReceipt() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`/api/receipts/${params.id}`);
      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        const message =
          typeof body?.error === "string" ? body.error : "Failed to fetch receipt";
        throw new Error(message);
      }

      setReceipt(body as ReceiptDetail);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to fetch receipt";
      setError(message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadReceipt();
  }, [params.id]);

  const handleStatusChange = async (status: ReceiptStatus) => {
    if (!receipt) return;
    try {
      setUpdating(true);
      const res = await fetch(`/api/receipts/${receipt.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        const message =
          typeof body?.error === "string" ? body.error : "Failed to update status";
        throw new Error(message);
      }
      setReceipt(body as ReceiptDetail);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to update status";
      alert(message);
    } finally {
      setUpdating(false);
    }
  };

  const renderStatusBadge = (status: ReceiptStatus) => {
    const base =
      "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium";
    if (status === "CANCELLED") {
      return <span className={`${base} bg-red-100 text-red-700`}>Cancelled</span>;
    }
    if (status === "DONE") {
      return <span className={`${base} bg-emerald-100 text-emerald-700`}>Done</span>;
    }
    if (status === "READY") {
      return <span className={`${base} bg-blue-100 text-blue-700`}>Ready</span>;
    }
    return <span className={`${base} bg-slate-100 text-slate-700`}>Draft</span>;
  };

  const renderBarcode = (value: string) => {
    return (
      <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
        <p className="mb-1 text-xs font-medium uppercase tracking-wide text-slate-500">
          Receipt barcode
        </p>
        <div className="flex items-end gap-0.5">
          {value.split("").map((ch, idx) => {
            const height = 20 + ((ch.charCodeAt(0) + idx * 13) % 20);
            const width = ch.charCodeAt(0) % 2 === 0 ? 2 : 1;
            return (
              <div
                key={`${ch}-${idx}`}
                className="bg-slate-800"
                style={{ height, width }}
              />
            );
          })}
        </div>
        <p className="mt-2 text-xs font-mono tracking-wider text-slate-700">
          {value}
        </p>
      </div>
    );
  };

  // Print handler: prints the whole page
  const onPrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-slate-500">Loading receipt…</p>
      </div>
    );
  }

  if (error || !receipt) {
    return (
      <div className="space-y-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-200"
        >
          <ArrowLeft size={16} />
          Back
        </button>
        <p className="text-sm text-red-600">
          {error ?? "Receipt not found."}
        </p>
      </div>
    );
  }

  const created = new Date(receipt.createdAt).toLocaleString();
  const scheduled = new Date(receipt.scheduledDate).toLocaleDateString();

  return (
    <div className="space-y-6 ">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Link
              href="/inventory-manager/receipt"
              className="rounded-lg p-1.5 text-slate-500 transition-colors hover:bg-slate-100 hover:text-slate-700"
              aria-label="Back"
            >
              <ArrowLeft size={20} />
            </Link>
            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
              {receipt.reference}
              <button
                type="button"
                onClick={onPrint}
                aria-label="Print this receipt"
                className="no-print inline-flex items-center justify-center rounded-md p-1.5 transition-colors hover:bg-slate-100 active:bg-slate-200"
                style={{ border: 0 }}
              >
                <Printer size={20} className="text-slate-700" />
                <span className="sr-only">Print this receipt</span>
              </button>
            </h1>
            {renderStatusBadge(receipt.status)}
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Receipt • Created on {created}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={receipt.status}
            disabled={updating}
            onChange={(e) =>
              handleStatusChange(e.target.value as ReceiptStatus)
            }
            className="rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          >
            <option value="DRAFT">Draft</option>
            <option value="READY">Ready</option>
            <option value="DONE">Done</option>
            <option value="CANCELLED">Cancelled</option>
          </select>
        </div>
      </div>

      {/* Top cards */}
      <div className="grid gap-4 md:grid-cols-[minmax(0,2fr)_minmax(0,1.3fr)]">
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Vendor
              </p>
              <div className="flex items-center gap-2">
                <Tag size={18} className="shrink-0 text-slate-500" />
                <p className="font-semibold text-slate-900">
                  {receipt.vendor}
                </p>
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Scheduled date
              </p>
              <div className="flex items-center gap-2">
                <Calendar size={18} className="shrink-0 text-slate-500" />
                <p className="font-semibold text-slate-900">{scheduled}</p>
              </div>
            </div>
            <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4 sm:col-span-2">
              <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
                Responsible
              </p>
              <div className="flex items-center gap-2">
                <User size={18} className="shrink-0 text-slate-500" />
                <div>
                  <p className="font-semibold text-slate-900">
                    {receipt.responsible?.name ?? "—"}
                  </p>
                  {receipt.responsible?.email && (
                    <p className="text-xs text-slate-500">
                      {receipt.responsible.email}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div>{renderBarcode(receipt.reference)}</div>
      </div>

      {/* Items table */}
      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-slate-900">
            Receipt lines
          </h2>
          <p className="text-sm text-slate-500">
            {receipt.items?.length}{" "}
            {receipt.items.length === 1 ? "line" : "lines"}
          </p>
        </div>
        <div className="overflow-x-auto">
          {receipt.items.length === 0 ? (
            <p className="px-5 py-4 text-sm text-slate-500">
              No products are linked to this receipt yet.
            </p>
          ) : (
            <table className="w-full min-w-[640px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <th className="px-5 py-3 text-left">Product</th>
                  <th className="px-5 py-3 text-left">SKU</th>
                  <th className="px-5 py-3 text-left">Unit</th>
                  <th className="px-5 py-3 text-right">Quantity</th>
                </tr>
              </thead>
              <tbody>
                {receipt.items.map((item) => (
                  <tr
                    key={item.id}
                    className="border-b border-slate-100 text-sm text-slate-700 transition-colors hover:bg-slate-50/50"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                          <Package size={16} />
                        </div>
                        <p className="font-medium text-slate-900">
                          {item.product.name}
                        </p>
                      </div>
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-slate-700">
                      {item.product.sku}
                    </td>
                    <td className="px-5 py-3">{item.product.unit}</td>
                    <td className="px-5 py-3 text-right font-medium">
                      {item.quantity}
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

