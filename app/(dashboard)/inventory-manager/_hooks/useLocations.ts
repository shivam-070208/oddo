"use client";

import { useQuery } from "@tanstack/react-query";

export type LocationRow = {
  id: string;
  name: string;
  code: string;
  warehouseName: string;
};

async function fetchLocations(): Promise<LocationRow[]> {
  const res = await fetch("/api/locations");
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

export function useLocations() {
  return useQuery({
    queryKey: ["locations"],
    queryFn: fetchLocations,
  });
}

