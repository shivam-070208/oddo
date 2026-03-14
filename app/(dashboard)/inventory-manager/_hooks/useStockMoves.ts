"use client";

import { useQuery } from "@tanstack/react-query";

type MoveType = "RECEIPT" | "DELIVERY" | "TRANSFER" | "ADJUSTMENT";

export type StockMoveRow = {
  id: string;
  type: MoveType;
  quantity: number;
  reference: string | null;
  productName: string;
  productSku: string;
  fromLocationName: string | null;
  toLocationName: string | null;
  createdAt: string;
};

async function fetchStockMoves(): Promise<StockMoveRow[]> {
  const res = await fetch("/api/stock-moves");
  if (!res.ok) {
    throw new Error("Failed to fetch stock moves");
  }
  const data = (await res.json()) as Array<{
    id: string;
    type: MoveType;
    quantity: number;
    reference: string | null;
    createdAt: string;
    product: { name: string; sku: string };
    fromLocation: { name: string } | null;
    toLocation: { name: string } | null;
  }>;

  return data.map((m) => ({
    id: m.id,
    type: m.type,
    quantity: m.quantity,
    reference: m.reference,
    createdAt: m.createdAt,
    productName: m.product?.name ?? "",
    productSku: m.product?.sku ?? "",
    fromLocationName: m.fromLocation?.name ?? null,
    toLocationName: m.toLocation?.name ?? null,
  }));
}

export function useStockMoves() {
  return useQuery({
    queryKey: ["stock-moves"],
    queryFn: fetchStockMoves,
  });
}

