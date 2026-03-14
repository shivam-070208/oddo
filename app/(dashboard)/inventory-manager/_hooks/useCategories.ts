"use client";

import { useQuery } from "@tanstack/react-query";

export type CategoryRow = {
  id: string;
  name: string;
  productsCount: number;
};

async function fetchCategories(searchQuery?: string): Promise<CategoryRow[]> {
  const params = new URLSearchParams();
  if (searchQuery?.trim()) params.set("q", searchQuery.trim());
  const query = params.toString();
  const res = await fetch(`/api/categories${query ? `?${query}` : ""}`);
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

export function useCategories(searchQuery?: string) {
  return useQuery({
    queryKey: ["categories", searchQuery ?? ""],
    queryFn: () => fetchCategories(searchQuery),
  });
}

