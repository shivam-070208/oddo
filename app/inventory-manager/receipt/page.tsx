"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  ArrowLeft,
  Calendar,
  ClipboardList,
  Package,
  Plus,
} from "lucide-react";
import { toast } from "sonner";  

type ReceiptStatus = "DRAFT" | "READY" | "DONE" | "CANCELLED";

type ReceiptRow = {
  id: string;
  reference: string;
  vendor: string;
  status: ReceiptStatus;
  scheduledDate: string;
  createdAt: string;
  itemsCount: number;
  responsibleName: string;
};

type CreateReceiptForm = {
  reference: string;
  vendor: string;
  status: ReceiptStatus;
  scheduledDate: string;
};

export default function ReceiptPage() {
  const [receipts, setReceipts] = useState<ReceiptRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateReceiptForm>({
    defaultValues: {
      reference: "",
      vendor: "",
      status: "DRAFT",
      scheduledDate: "",
    },
  });

  async function loadReceipts() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch("/api/receipts");
      if (!res.ok) {
        throw new Error("Failed to fetch receipts");
      }
      const data = (await res.json()) as Array<{
        id: string;
        reference: string;
        vendor: string;
        status: ReceiptStatus;
        scheduledDate: string;
        createdAt: string;
        _count?: { items?: number };
        responsible?: { name?: string | null };
      }>;
      const mapped: ReceiptRow[] = data.map((r) => ({
        id: r.id,
        reference: r.reference,
        vendor: r.vendor,
        status: r.status as ReceiptStatus,
        scheduledDate: r.scheduledDate,
        createdAt: r.createdAt,
        itemsCount: r._count?.items ?? 0,
        responsibleName: r.responsible?.name ?? "—",
      }));
      setReceipts(mapped);
    } catch (err) {
      console.error(err);
      setError("Failed to fetch receipts");
    } finally {
      setLoading(false);
    }
  }

  async function loadCurrentUser() {
    try {
      const res = await fetch("/api/auth/session");
      if (!res.ok) return;
      const data = await res.json();
      const id: string | undefined = data?.session?.user?.id ?? data?.user?.id;
      if (id) setCurrentUserId(id);
    } catch (err) {
      console.error(err);
    }
  }

  useEffect(() => {
    void loadReceipts();
    void loadCurrentUser();
  }, []);

  const onSubmit = async (form: CreateReceiptForm) => {
    if (!currentUserId) {
      toast.error("Cannot create receipt: no responsible user found.");
      return;
    }

    try {
      const res = await fetch("/api/receipts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          reference: form.reference,
          vendor: form.vendor,
          status: form.status,
          scheduledDate: form.scheduledDate,
          responsibleId: currentUserId,
        }),
      });

      const body = await res.json().catch(() => ({}));

      if (!res.ok) {
        const message =
          typeof body?.error === "string" ? body.error : "Failed to create receipt";
        throw new Error(message);
      }

      // Use toast for feedback
      toast.success("Receipt created.");
      reset();
      setOpen(false);
      await loadReceipts();
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to create receipt";
      toast.error(message);
    }
  };

  const total = receipts.length;
  const statusCounts: Record<ReceiptStatus, number> = {
    DRAFT: 0,
    READY: 0,
    DONE: 0,
    CANCELLED: 0,
  };
  receipts.forEach((r) => {
    statusCounts[r.status] += 1;
  });

  const steps: { label: string; key: ReceiptStatus; count: number }[] = [
    { label: "Draft", key: "DRAFT", count: statusCounts.DRAFT },
    { label: "Ready", key: "READY", count: statusCounts.READY },
    { label: "Done", key: "DONE", count: statusCounts.DONE },
    { label: "Cancelled", key: "CANCELLED", count: statusCounts.CANCELLED },
  ];

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
            <h1 className="text-2xl font-bold text-slate-900">Receipts</h1>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Overview of all incoming receipts in the warehouse.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
        >
          <Plus size={18} />
          New receipt
        </button>
      </div>

      {/* Status timeline with counts */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-medium text-slate-700">
            Status overview
          </p>
          <p className="text-xs text-slate-500">
            Total receipts: <span className="font-semibold text-slate-900">{total}</span>
          </p>
        </div>
        <div className="flex items-center gap-0">
          {steps.map((step, i) => (
            <div key={step.key} className="flex flex-1 items-start">
              <div className="flex flex-col items-center">
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                    step.count > 0
                      ? "bg-blue-600 text-white"
                      : "border border-slate-200 bg-slate-50 text-slate-400"
                  }`}
                >
                  <span className="text-sm font-semibold">
                    {step.count}
                  </span>
                </div>
                <p className="mt-2 text-sm font-semibold text-slate-900">
                  {step.label}
                </p>
              </div>
              {i < steps.length - 1 && (
                <div className="mx-2 mt-4 h-0.5 min-w-[24px] flex-1 bg-blue-200" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Simple info cards: total & upcoming */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            TOTAL RECEIPTS
          </p>
          <div className="flex items-center gap-2">
            <ClipboardList size={18} className="shrink-0 text-slate-500" />
            <p className="text-lg font-semibold text-slate-900">{total}</p>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            READY
          </p>
          <div className="flex items-center gap-2">
            <Package size={18} className="shrink-0 text-slate-500" />
            <p className="text-lg font-semibold text-slate-900">
              {statusCounts.READY}
            </p>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            NEXT SCHEDULED
          </p>
          <div className="flex items-center gap-2">
            <Calendar size={18} className="shrink-0 text-slate-500" />
            <p className="text-sm font-semibold text-slate-900">
              {receipts[0]
                ? new Date(receipts[0].scheduledDate).toLocaleDateString()
                : "—"}
            </p>
          </div>
        </div>
      </div>

      {/* Receipts table */}
      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-slate-900">
            All receipts
          </h2>
          <p className="text-sm text-slate-500">
            Showing{" "}
            <span className="font-semibold text-slate-900">{receipts.length}</span>{" "}
            records
          </p>
        </div>

        <div className="overflow-x-auto">
          {loading ? (
            <p className="px-5 py-4 text-sm text-slate-500">Loading receipts…</p>
          ) : error ? (
            <p className="px-5 py-4 text-sm text-red-600">{error}</p>
          ) : receipts.length === 0 ? (
            <p className="px-5 py-4 text-sm text-slate-500">
              No receipts yet. Create your first receipt using the button above.
            </p>
          ) : (
            <table className="w-full min-w-[720px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <th className="px-5 py-3 text-left">Reference</th>
                  <th className="px-5 py-3 text-left">Vendor</th>
                  <th className="px-5 py-3 text-left">Status</th>
                  <th className="px-5 py-3 text-left">Scheduled</th>
                  <th className="px-5 py-3 text-left">Responsible</th>
                  <th className="px-5 py-3 text-right">Lines</th>
                </tr>
              </thead>
              <tbody>
                {receipts.map((r) => (
                  <tr
                    key={r.id}
                    className="border-b border-slate-100 text-sm text-slate-700 transition-colors hover:bg-slate-50/50"
                  >
                    <td className="px-5 py-3">
                      <Link
                        href={`/inventory-manager/receipt/${r.id}`}
                        className="font-semibold text-blue-600 hover:underline"
                      >
                        {r.reference}
                      </Link>
                    </td>
                    <td className="px-5 py-3">{r.vendor}</td>
                    <td className="px-5 py-3">
                      <span
                        className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                          r.status === "CANCELLED"
                            ? "bg-red-100 text-red-700"
                            : r.status === "DONE"
                            ? "bg-emerald-100 text-emerald-700"
                            : r.status === "DRAFT"
                            ? "bg-slate-100 text-slate-700"
                            : "bg-blue-100 text-blue-700"
                        }`}
                      >
                        {r.status}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {new Date(r.scheduledDate).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3">{r.responsibleName}</td>
                    <td className="px-5 py-3 text-right font-medium">
                      {r.itemsCount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* New receipt modal */}
      {open && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                New receipt
              </h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-sm text-slate-500 hover:text-slate-800"
              >
                Close
              </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label
                  htmlFor="reference"
                  className="mb-1 block text-sm font-medium text-slate-700"
                >
                  Reference
                </label>
                <input
                  id="reference"
                  type="text"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-black focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  {...register("reference", {
                    required: "Reference is required",
                  })}
                />
                {errors.reference && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.reference.message}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="vendor"
                  className="mb-1 block text-sm font-medium text-slate-700"
                >
                  Vendor
                </label>
                <input
                  id="vendor"
                  type="text"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-black focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  {...register("vendor", {
                    required: "Vendor is required",
                  })}
                />
                {errors.vendor && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.vendor.message}
                  </p>
                )}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="scheduledDate"
                    className="mb-1 block text-sm font-medium text-slate-700"
                  >
                    Scheduled date
                  </label>
                  <input
                    id="scheduledDate"
                    type="date"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-black focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    {...register("scheduledDate", {
                      required: "Scheduled date is required",
                    })}
                  />
                  {errors.scheduledDate && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.scheduledDate.message}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="status"
                    className="mb-1 block text-sm font-medium text-slate-700"
                  >
                    Status
                  </label>
                  <select
                    id="status"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-black focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    {...register("status", { required: true })}
                  >
                    <option value="DRAFT">Draft</option>
                    <option value="READY">Ready</option>
                    <option value="DONE">Done</option>
                    <option value="CANCELLED">Cancelled</option>
                  </select>
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="rounded-lg px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-70"
                >
                  {isSubmitting ? "Creating…" : "Create receipt"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

