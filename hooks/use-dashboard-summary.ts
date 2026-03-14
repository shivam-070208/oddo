import { useQuery } from "@tanstack/react-query";

export type DashboardSummary = {
  totalProducts: number;
  totalStockQuantity: number;
  pendingReceipts: number;
  pendingDeliveries: number;
};

async function fetchDashboardSummary(): Promise<DashboardSummary> {
  const res = await fetch("/api/dashboard/summary", {
    credentials: "include",
  });

  if (!res.ok) {
    throw new Error("Failed to fetch dashboard summary");
  }

  return res.json();
}

export function useDashboardSummary() {
  return useQuery({
    queryKey: ["dashboard-summary"],
    queryFn: fetchDashboardSummary,
  });
}
