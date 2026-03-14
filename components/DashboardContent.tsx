"use client";

import { ComponentType } from "react";
import Table from "@/components/RecentTable";
import {
  Package,
  Boxes,
  ArrowDownToLine,
  Truck,
} from "lucide-react";
import { useDashboardSummary } from "@/hooks/use-dashboard-summary";

type StatCard = {
  label: string;
  value: string;
  icon: ComponentType<{ size?: number; className?: string }>;
  iconBg: string;
  iconColor: string;
};

const DashboardContent = () => {
  const { data, isLoading, isError } = useDashboardSummary();

  const statCards: StatCard[] = [
    {
      label: "Total Products",
      value: isLoading ? "..." : String(data?.totalProducts ?? 0),
      icon: Package,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-500",
    },
    {
      label: "Total Stock Qty",
      value: isLoading ? "..." : String(data?.totalStockQuantity ?? 0),
      icon: Boxes,
      iconBg: "bg-yellow-100",
      iconColor: "text-yellow-600",
    },
    {
      label: "Pending Receipts",
      value: isLoading ? "..." : String(data?.pendingReceipts ?? 0),
      icon: ArrowDownToLine,
      iconBg: "bg-green-100",
      iconColor: "text-green-600",
    },
    {
      label: "Pending Deliveries",
      value: isLoading ? "..." : String(data?.pendingDeliveries ?? 0),
      icon: Truck,
      iconBg: "bg-purple-100",
      iconColor: "text-purple-500",
    },
  ];

  return (
    <main className="flex-1 overflow-y-auto p-6 space-y-6">
      <div className="grid grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm flex flex-col gap-3"
            >
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg ${card.iconBg}`}>
                  <Icon size={20} className={card.iconColor} />
                </div>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                  Live
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-400">{card.label}</p>
                <p className="text-3xl font-bold text-gray-800 mt-0.5">{card.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      {isError ? (
        <p className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
          Failed to load dashboard summary.
        </p>
      ) : null}


      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-gray-800">Recent Activities</h2>
          <a href="#" className="text-sm text-indigo-500 font-semibold hover:underline">
            View All
          </a>
        </div>
        <Table />
      </div>
    </main>
  );
};

export default DashboardContent;
