"use client";

import { useQuery } from "@tanstack/react-query";

export type CategoryRow = {
  id: string;
  name: string;
  productsCount: number;
};

async function fetchCategories(): Promise<CategoryRow[]> {
  const res = await fetch("/api/categories");
  if (!res.ok) {
    throw new Error("Failed to fetch categories");
  }
  const data = (await res.json()) as Array<{
    id: string;
    name: string;
    _count?: { products?: number };
  }>;

  return data.map((c) => ({
    id: c.id,
    name: c.name,
    productsCount: c._count?.products ?? 0,
  }));
}

export function useCategories() {
  return useQuery({
    queryKey: ["categories"],
    queryFn: fetchCategories,
  });
}

