"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { ArrowLeft, Calendar, ClipboardList, Truck, Plus } from "lucide-react";
import { toast } from "sonner";
import {
  useDeliveries,
  useCreateDelivery,
  type DeliveryRow,
} from "../_hooks/useDeliveries";
import { useSearchContext } from "@/contexts/search-context";

type CreateDeliveryForm = {
  reference: string;
  customer: string;
  status: string;
  scheduledDate: string;
};

export default function DeliveryPage() {
  const { searchQuery } = useSearchContext();
  const { data: deliveries, isLoading, error } = useDeliveries(searchQuery);
  const createDelivery = useCreateDelivery();
  const [open, setOpen] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CreateDeliveryForm>({
    defaultValues: {
      reference: "",
      customer: "",
      status: "DRAFT",
      scheduledDate: "",
    },
  });

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
    void loadCurrentUser();
  }, []);

  const onSubmit = async (form: CreateDeliveryForm) => {
    if (!currentUserId) {
      toast.error("Cannot create delivery: no responsible user found.");
      return;
    }

    try {
      await createDelivery.mutateAsync({
        reference: form.reference,
        customer: form.customer,
        status: form.status,
        scheduledDate: form.scheduledDate,
        responsibleId: currentUserId,
      });
      toast.success("Delivery created.");
      reset();
      setOpen(false);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to create delivery";
      toast.error(message);
    }
  };

  const list: DeliveryRow[] = deliveries ?? [];
  const total = list.length;

  const statusCounts: Record<string, number> = {
    Draft: 0,
    Ready: 0,
    Done: 0,
    Cancelled: 0,
  };
  list.forEach((d) => {
    const key =
      d.status.toUpperCase() === "READY"
        ? "Ready"
        : d.status.toUpperCase() === "DONE"
        ? "Done"
        : d.status.toUpperCase() === "CANCELLED"
        ? "Cancelled"
        : "Draft";
    statusCounts[key] += 1;
  });

  const steps = [
    { label: "Draft", key: "Draft", count: statusCounts.Draft },
    { label: "Ready", key: "Ready", count: statusCounts.Ready },
    { label: "Done", key: "Done", count: statusCounts.Done },
    { label: "Cancelled", key: "Cancelled", count: statusCounts.Cancelled },
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
            <h1 className="text-2xl font-bold text-slate-900">Deliveries</h1>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Overview of all outgoing deliveries to customers.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
        >
          <Plus size={18} />
          New delivery
        </button>
      </div>

      {/* Status timeline */}
      <div className="rounded-xl border border-slate-200 bg-white p-6">
        <div className="mb-4 flex items-center justify-between">
          <p className="text-sm font-medium text-slate-700">
            Status overview
          </p>
          <p className="text-xs text-slate-500">
            Total deliveries:{" "}
            <span className="font-semibold text-slate-900">{total}</span>
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
                <div className="mx-2 mt-4 h-0.5 min-w-6 flex-1 bg-blue-200" />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            TOTAL DELIVERIES
          </p>
          <div className="flex items-center gap-2">
            <Truck size={18} className="shrink-0 text-slate-500" />
            <p className="text-lg font-semibold text-slate-900">{total}</p>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            READY TO SHIP
          </p>
          <div className="flex items-center gap-2">
            <ClipboardList size={18} className="shrink-0 text-slate-500" />
            <p className="text-lg font-semibold text-slate-900">
              {statusCounts.Ready}
            </p>
          </div>
        </div>
      </div>

      {/* Deliveries table */}
      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-slate-900">
            All deliveries
          </h2>
          <p className="text-sm text-slate-500">
            Showing{" "}
            <span className="font-semibold text-slate-900">{total}</span>{" "}
            records
          </p>
        </div>
        <div className="overflow-x-auto">
          {isLoading ? (
            <p className="px-5 py-4 text-sm text-slate-500">
              Loading deliveries…
            </p>
          ) : error ? (
            <p className="px-5 py-4 text-sm text-red-600">
              Failed to load deliveries.
            </p>
          ) : list.length === 0 ? (
            <p className="px-5 py-4 text-sm text-slate-500">
              No deliveries yet. Create your first delivery using the button
              above.
            </p>
          ) : (
            <table className="w-full min-w-180">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <th className="px-5 py-3 text-left">Reference</th>
                  <th className="px-5 py-3 text-left">Customer</th>
                  <th className="px-5 py-3 text-left">Status</th>
                  <th className="px-5 py-3 text-left">Scheduled</th>
                  <th className="px-5 py-3 text-left">Responsible</th>
                  <th className="px-5 py-3 text-right">Lines</th>
                </tr>
              </thead>
              <tbody>
                {list.map((d) => (
                  <tr
                    key={d.id}
                    className="border-b border-slate-100 text-sm text-slate-700 transition-colors hover:bg-slate-50/50"
                  >
                    <td className="px-5 py-3 font-semibold text-blue-600">
                      {d.reference}
                    </td>
                    <td className="px-5 py-3">{d.customer}</td>
                    <td className="px-5 py-3">
                      <span className="inline-flex rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-700">
                        {d.status}
                      </span>
                    </td>
                    <td className="px-5 py-3">
                      {new Date(d.scheduledDate).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3">{d.responsibleName}</td>
                    <td className="px-5 py-3 text-right font-medium">
                      {d.itemsCount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* New delivery modal */}
      {open && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                New delivery
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
                  htmlFor="customer"
                  className="mb-1 block text-sm font-medium text-slate-700"
                >
                  Customer
                </label>
                <input
                  id="customer"
                  type="text"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-black focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  {...register("customer", {
                    required: "Customer is required",
                  })}
                />
                {errors.customer && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.customer.message}
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
                  disabled={isSubmitting || createDelivery.isPending}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-70"
                >
                  {isSubmitting || createDelivery.isPending
                    ? "Creating…"
                    : "Create delivery"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

