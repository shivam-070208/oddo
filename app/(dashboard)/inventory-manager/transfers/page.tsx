"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { ArrowLeft, Activity, MapPin, Package, Plus } from "lucide-react";
import { toast } from "sonner";
import { useTransfers, useCreateTransfer } from "../_hooks/useTransfers";
import { useProducts } from "../_hooks/useProducts";
import { useLocations } from "../_hooks/useLocations";

type TransferFormValues = {
  reference?: string;
  productId: string;
  fromLocationId: string;
  toLocationId: string;
  quantity: number;
};

export default function TransfersPage() {
  const { data: transfers, isLoading, error } = useTransfers();
  const { data: products } = useProducts();
  const { data: locations } = useLocations();
  const createTransfer = useCreateTransfer();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TransferFormValues>({
    defaultValues: {
      reference: "",
      productId: "",
      fromLocationId: "",
      toLocationId: "",
      quantity: 0,
    },
  });

  const list = transfers ?? [];
  const total = list.length;

  const onSubmit = async (values: TransferFormValues) => {
    if (values.fromLocationId === values.toLocationId) {
      toast.error("Source and destination locations must be different.");
      return;
    }

    try {
      await createTransfer.mutateAsync({
        reference: values.reference || undefined,
        productId: values.productId,
        fromLocationId: values.fromLocationId,
        toLocationId: values.toLocationId,
        quantity: Number(values.quantity),
      });
      toast.success("Transfer created.");
      reset({
        reference: "",
        productId: "",
        fromLocationId: "",
        toLocationId: "",
        quantity: 0,
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to create transfer";
      toast.error(message);
    }
  };

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
            <h1 className="text-2xl font-bold text-slate-900">Transfers</h1>
          </div>
          <p className="mt-1 text-sm text-slate-600">
            Move stock between locations and review transfer history.
          </p>
        </div>
      </div>

      {/* Quick transfer form */}
      <div className="rounded-xl border border-slate-200 bg-white p-5">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">
            Create transfer
          </h2>
          <Plus size={18} className="text-slate-400" />
        </div>
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid gap-4 md:grid-cols-5 md:items-end"
        >
          <div className="md:col-span-2">
            <label
              htmlFor="productId"
              className="mb-1 block text-xs font-medium text-slate-700"
            >
              Product
            </label>
            <select
              id="productId"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-black"
              {...register("productId", {
                required: "Product is required",
              })}
            >
              <option value="">Select product</option>
              {products?.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.sku})
                </option>
              ))}
            </select>
            {errors.productId && (
              <p className="mt-1 text-xs text-red-600">
                {errors.productId.message}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="fromLocationId"
              className="mb-1 block text-xs font-medium text-slate-700"
            >
              From location
            </label>
            <select
              id="fromLocationId"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-black"
              {...register("fromLocationId", {
                required: "From location is required",
              })}
            >
              <option value="">Select location</option>
              {locations?.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name} ({l.code})
                </option>
              ))}
            </select>
            {errors.fromLocationId && (
              <p className="mt-1 text-xs text-red-600">
                {errors.fromLocationId.message}
              </p>
            )}
          </div>
          <div>
            <label
              htmlFor="toLocationId"
              className="mb-1 block text-xs font-medium text-slate-700"
            >
              To location
            </label>
            <select
              id="toLocationId"
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-black"
              {...register("toLocationId", {
                required: "To location is required",
              })}
            >
              <option value="">Select location</option>
              {locations?.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.name} ({l.code})
                </option>
              ))}
            </select>
            {errors.toLocationId && (
              <p className="mt-1 text-xs text-red-600">
                {errors.toLocationId.message}
              </p>
            )}
          </div>
          <div className="md:col-span-1">
            <label
              htmlFor="quantity"
              className="mb-1 block text-xs font-medium text-slate-700"
            >
              Quantity
            </label>
            <input
              id="quantity"
              type="number"
              min={1}
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-black"
              {...register("quantity", {
                required: "Quantity is required",
                min: { value: 1, message: "Must be at least 1" },
              })}
            />
            {errors.quantity && (
              <p className="mt-1 text-xs text-red-600">
                {errors.quantity.message}
              </p>
            )}
          </div>
          <div className="md:col-span-5 md:flex md:justify-between md:items-center">
            <div className="mt-2 md:mt-0 md:w-1/2">
              <label
                htmlFor="reference"
                className="mb-1 block text-xs font-medium text-slate-700"
              >
                Reference (optional)
              </label>
              <input
                id="reference"
                type="text"
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-black"
                {...register("reference")}
              />
            </div>
            <div className="mt-4 flex justify-end md:mt-0 md:w-auto">
              <button
                type="submit"
                disabled={isSubmitting || createTransfer.isPending}
                className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-70"
              >
                {isSubmitting || createTransfer.isPending
                  ? "Transferring…"
                  : "Create transfer"}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Transfers table */}
      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-slate-900">
            Recent transfers
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
              Loading transfers…
            </p>
          ) : error ? (
            <p className="px-5 py-4 text-sm text-red-600">
              Failed to load transfers.
            </p>
          ) : list.length === 0 ? (
            <p className="px-5 py-4 text-sm text-slate-500">
              No transfers recorded yet.
            </p>
          ) : (
            <table className="w-full min-w-[760px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold uppercase tracking-wider text-slate-500">
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
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                          <Package size={16} />
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">
                            {m.productName}
                          </p>
                          <p className="font-mono text-[11px] text-slate-500">
                            {m.productSku}
                          </p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-xs text-slate-600">
                      <div className="flex items-center gap-1">
                        <MapPin size={14} className="text-slate-400" />
                        <span>{m.fromLocationName ?? "—"}</span>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-xs text-slate-600">
                      <div className="flex items-center gap-1">
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

