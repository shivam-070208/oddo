"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export type ProductRow = {
  id: string;
  name: string;
  sku: string;
  unit: string;
  categoryId: string;
  categoryName: string;
  receiptCount: number;
};

async function fetchProducts(): Promise<ProductRow[]> {
  const res = await fetch("/api/products");
  if (!res.ok) {
    throw new Error("Failed to fetch products");
  }
  const data = (await res.json()) as Array<{
    id: string;
    name: string;
    sku: string;
    unit: string;
    categoryId: string;
    category: { name: string };
    _count?: { receiptItems?: number };
  }>;

  return data.map((p) => ({
    id: p.id,
    name: p.name,
    sku: p.sku,
    unit: p.unit,
    categoryId: p.categoryId,
    categoryName: p.category?.name ?? "",
    receiptCount: p._count?.receiptItems ?? 0,
  }));
}

export function useProducts() {
  return useQuery({
    queryKey: ["products"],
    queryFn: fetchProducts,
  });
}

export type UpsertProductPayload = {
  id?: string;
  name: string;
  sku: string;
  unit: string;
  categoryId: string;
};

async function upsertProduct(payload: UpsertProductPayload): Promise<void> {
  const { id, ...rest } = payload;
  const url = id ? `/api/products/${id}` : "/api/products";
  const method = id ? "PUT" : "POST";

  const res = await fetch(url, {
    method,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(rest),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message =
      typeof data?.error === "string" ? data.error : "Failed to save product";
    throw new Error(message);
  }
}

export function useUpsertProduct() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: upsertProduct,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["products"] });
    },
  });
}

