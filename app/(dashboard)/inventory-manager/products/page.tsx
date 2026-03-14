"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { ClipboardList, Package, Plus } from "lucide-react";
import { useProducts, useUpsertProduct, type UpsertProductPayload } from "../_hooks/useProducts";
import { useCategories } from "../_hooks/useCategories";
import { toast } from "sonner";
import { useSearchContext } from "@/contexts/search-context";

type ProductFormValues = {
  name: string;
  sku: string;
  unit: string;
  categoryId: string;
};

export default function ProductsPage() {
  const { searchQuery } = useSearchContext();
  const { data: products, isLoading, error } = useProducts(searchQuery);
  const { data: categories } = useCategories();
  const upsert = useUpsertProduct();
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ProductFormValues>({
    defaultValues: {
      name: "",
      sku: "",
      unit: "",
      categoryId: "",
    },
  });

  const openCreate = () => {
    setEditingId(null);
    reset({
      name: "",
      sku: "",
      unit: "",
      categoryId: categories?.[0]?.id ?? "",
    });
    setOpen(true);
  };

  const openEdit = (id: string) => {
    const product = products?.find((p) => p.id === id);
    if (!product) return;
    setEditingId(id);
    reset({
      name: product.name,
      sku: product.sku,
      unit: product.unit,
      categoryId: product.categoryId,
    });
    setOpen(true);
  };

  const onSubmit = async (values: ProductFormValues) => {
    const payload: UpsertProductPayload = {
      id: editingId ?? undefined,
      name: values.name,
      sku: values.sku,
      unit: values.unit,
      categoryId: values.categoryId,
    };

    try {
      await upsert.mutateAsync(payload);
      toast.success(editingId ? "Product updated" : "Product created");
      setOpen(false);
      reset();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to save product";
      toast.error(message);
    }
  };

  const total = products?.length ?? 0;
  const totalReceipted =
    products?.reduce((sum, p) => sum + p.receiptCount, 0) ?? 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Products</h1>
          <p className="mt-1 text-sm text-slate-600">
            Manage product master data used across receipts, deliveries and
            inventory.
          </p>
        </div>
        <button
          type="button"
          onClick={openCreate}
          className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
        >
          <Plus size={18} />
          New product
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            TOTAL PRODUCTS
          </p>
          <div className="flex items-center gap-2">
            <Package size={18} className="shrink-0 text-slate-500" />
            <p className="text-lg font-semibold text-slate-900">{total}</p>
          </div>
        </div>
        <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-4">
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-slate-500">
            RECEIPT LINES
          </p>
          <div className="flex items-center gap-2">
            <ClipboardList size={18} className="shrink-0 text-slate-500" />
            <p className="text-lg font-semibold text-slate-900">
              {totalReceipted}
            </p>
          </div>
        </div>
      </div>

      {/* Products table */}
      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 px-5 py-4">
          <h2 className="text-lg font-semibold text-slate-900">All products</h2>
          <p className="text-sm text-slate-500">
            Showing{" "}
            <span className="font-semibold text-slate-900">{total}</span>{" "}
            records
          </p>
        </div>
        <div className="overflow-x-auto">
          {isLoading ? (
            <p className="px-5 py-4 text-sm text-slate-500">
              Loading products…
            </p>
          ) : error ? (
            <p className="px-5 py-4 text-sm text-red-600">
              Failed to load products.
            </p>
          ) : !products || products.length === 0 ? (
            <p className="px-5 py-4 text-sm text-slate-500">
              No products yet. Create one using the button above.
            </p>
          ) : (
            <table className="w-full min-w-[720px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-xs font-semibold uppercase tracking-wider text-slate-500">
                  <th className="px-5 py-3 text-left">Name</th>
                  <th className="px-5 py-3 text-left">SKU</th>
                  <th className="px-5 py-3 text-left">Unit</th>
                  <th className="px-5 py-3 text-left">Category</th>
                  <th className="px-5 py-3 text-right">Receipt lines</th>
                  <th className="px-5 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr
                    key={p.id}
                    className="border-b border-slate-100 text-sm text-slate-700 transition-colors hover:bg-slate-50/50"
                  >
                    <td className="px-5 py-3 font-medium text-slate-900">
                      {p.name}
                    </td>
                    <td className="px-5 py-3 font-mono text-xs text-slate-700">
                      {p.sku}
                    </td>
                    <td className="px-5 py-3">{p.unit}</td>
                    <td className="px-5 py-3">{p.categoryName}</td>
                    <td className="px-5 py-3 text-right font-medium">
                      {p.receiptCount}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => openEdit(p.id)}
                        className="text-sm font-medium text-blue-600 hover:text-blue-800"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {/* Add / Edit product modal */}
      {open && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">
                {editingId ? "Edit product" : "New product"}
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
                  htmlFor="name"
                  className="mb-1 block text-sm font-medium text-slate-700"
                >
                  Name
                </label>
                <input
                  id="name"
                  type="text"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-black focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  {...register("name", {
                    required: "Name is required",
                  })}
                />
                {errors.name && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.name.message}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="sku"
                  className="mb-1 block text-sm font-medium text-slate-700"
                >
                  SKU
                </label>
                <input
                  id="sku"
                  type="text"
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-black focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  {...register("sku", {
                    required: "SKU is required",
                  })}
                />
                {errors.sku && (
                  <p className="mt-1 text-xs text-red-600">
                    {errors.sku.message}
                  </p>
                )}
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="unit"
                    className="mb-1 block text-sm font-medium text-slate-700"
                  >
                    Unit
                  </label>
                  <input
                    id="unit"
                    type="text"
                    placeholder="e.g. pcs, box"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-black focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    {...register("unit", {
                      required: "Unit is required",
                    })}
                  />
                  {errors.unit && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.unit.message}
                    </p>
                  )}
                </div>
                <div>
                  <label
                    htmlFor="categoryId"
                    className="mb-1 block text-sm font-medium text-slate-700"
                  >
                    Category
                  </label>
                  <select
                    id="categoryId"
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-black focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                    {...register("categoryId", {
                      required: "Category is required",
                    })}
                  >
                    <option value="">Select category</option>
                    {categories?.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                  {errors.categoryId && (
                    <p className="mt-1 text-xs text-red-600">
                      {errors.categoryId.message}
                    </p>
                  )}
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
                  disabled={isSubmitting || upsert.isPending}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-70"
                >
                  {isSubmitting || upsert.isPending
                    ? "Saving…"
                    : editingId
                    ? "Save changes"
                    : "Create product"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

