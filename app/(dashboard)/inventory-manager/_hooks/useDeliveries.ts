"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export type DeliveryStatus = string;

export type DeliveryRow = {
  id: string;
  reference: string;
  customer: string;
  status: DeliveryStatus;
  scheduledDate: string;
  createdAt: string;
  itemsCount: number;
  responsibleName: string;
};

async function fetchDeliveries(searchQuery?: string): Promise<DeliveryRow[]> {
  const params = new URLSearchParams();
  if (searchQuery?.trim()) params.set("q", searchQuery.trim());
  const query = params.toString();
  const res = await fetch(`/api/deliveries${query ? `?${query}` : ""}`);
  if (!res.ok) {
    throw new Error("Failed to fetch deliveries");
  }
  const data = (await res.json()) as Array<{
    id: string;
    reference: string;
    customer: string;
    status: string;
    scheduledDate: string;
    createdAt: string;
    _count?: { items?: number };
    responsible?: { name?: string | null };
  }>;

  return data.map((d) => ({
    id: d.id,
    reference: d.reference,
    customer: d.customer,
    status: d.status,
    scheduledDate: d.scheduledDate,
    createdAt: d.createdAt,
    itemsCount: d._count?.items ?? 0,
    responsibleName: d.responsible?.name ?? "—",
  }));
}

export function useDeliveries(searchQuery?: string) {
  return useQuery({
    queryKey: ["deliveries", searchQuery ?? ""],
    queryFn: () => fetchDeliveries(searchQuery),
  });
}

export type CreateDeliveryPayload = {
  reference: string;
  customer: string;
  status: string;
  scheduledDate: string;
  responsibleId: string;
};

async function createDelivery(payload: CreateDeliveryPayload): Promise<void> {
  const res = await fetch("/api/deliveries", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message =
      typeof data?.error === "string" ? data.error : "Failed to create delivery";
    throw new Error(message);
  }
}

export function useCreateDelivery() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createDelivery,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["deliveries"] });
    },
  });
}

