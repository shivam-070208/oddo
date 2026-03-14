"use client";

import { useQuery } from "@tanstack/react-query";

export type LocationRow = {
  id: string;
  name: string;
  code: string;
  warehouseName: string;
};

async function fetchLocations(searchQuery?: string): Promise<LocationRow[]> {
  const params = new URLSearchParams();
  if (searchQuery?.trim()) params.set("q", searchQuery.trim());
  const query = params.toString();
  const res = await fetch(`/api/locations${query ? `?${query}` : ""}`);
  if (!res.ok) {
    throw new Error("Failed to fetch locations");
  }
  const data = (await res.json()) as Array<{
    id: string;
    name: string;
    code: string;
    warehouse: { name: string };
  }>;

  return data.map((l) => ({
    id: l.id,
    name: l.name,
    code: l.code,
    warehouseName: l.warehouse?.name ?? "",
  }));
}

export function useLocations(searchQuery?: string) {
  return useQuery({
    queryKey: ["locations", searchQuery ?? ""],
    queryFn: () => fetchLocations(searchQuery),
  });
}

