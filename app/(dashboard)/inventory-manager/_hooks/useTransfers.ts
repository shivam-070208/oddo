"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useStockMoves, type StockMoveRow } from "./useStockMoves";

export type TransferRow = StockMoveRow;

export function useTransfers(searchQuery?: string) {
  const result = useStockMoves(searchQuery);
  const transfers =
    result.data?.filter((m) => m.type === "TRANSFER") ?? [];
  return { ...result, data: transfers as TransferRow[] };
}

export type CreateTransferPayload = {
  quantity: number;
  productId: string;
  fromLocationId: string;
  toLocationId: string;
  reference?: string;
};

async function createTransfer(payload: CreateTransferPayload): Promise<void> {
  const res = await fetch("/api/stock-moves", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      ...payload,
      type: "TRANSFER",
    }),
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const message =
      typeof data?.error === "string" ? data.error : "Failed to create transfer";
    throw new Error(message);
  }
}

export function useCreateTransfer() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTransfer,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["stock-moves"] });
    },
  });
}

