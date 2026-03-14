"use client";

import Table from "@/components/Table";
import {
  Package,
  AlertTriangle,
  ArrowDownToLine,
  Truck,
  Plus,
  TrendingUp,
  TrendingDown,
} from "lucide-react";

const statCards = [
  {
    label: "Total Products",
    value: "1,284",
    change: "+2.5%",
    up: true,
    icon: Package,
    iconBg: "bg-blue-100",
    iconColor: "text-blue-500",
  },
  {
    label: "Low Stock",
    value: "12",
    change: "-5.2%",
    up: false,
    icon: AlertTriangle,
    iconBg: "bg-yellow-100",
    iconColor: "text-yellow-500",
  },
  {
    label: "Pending Receipts",
    value: "48",
    change: "+12%",
    up: true,
    icon: ArrowDownToLine,
    iconBg: "bg-green-100",
    iconColor: "text-green-500",
  },
  {
    label: "Pending Deliveries",
    value: "32",
    change: "-8%",
    up: false,
    icon: Truck,
    iconBg: "bg-purple-100",
    iconColor: "text-purple-500",
  },
];

const DashboardContent = () => {
  return (
    <main className="flex-1 overflow-y-auto p-6 space-y-6">

      {/* Stat Cards */}
      <div className="grid grid-cols-4 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          const Trend = card.up ? TrendingUp : TrendingDown;
          return (
            <div
              key={card.label}
              className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm flex flex-col gap-3"
            >
              <div className="flex items-center justify-between">
                <div className={`p-2 rounded-lg ${card.iconBg}`}>
                  <Icon size={20} className={card.iconColor} />
                </div>
                <span
                  className={`flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${
                    card.up
                      ? "text-green-600 bg-green-50"
                      : "text-red-500 bg-red-50"
                  }`}
                >
                  <Trend size={11} />
                  {card.change}
                </span>
              </div>
              <div>
                <p className="text-sm text-gray-400">{card.label}</p>
                <p className="text-3xl font-bold text-gray-800 mt-0.5">
                  {card.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-2 gap-4">
        {/* Incoming Shipments */}
        <div className="rounded-xl p-7 flex flex-col gap-3 bg-linear-to-br from-indigo-500 via-blue-500 to-purple-600 text-white shadow-md">
          <h2 className="text-xl font-bold">Incoming Shipments</h2>
          <p className="text-sm text-blue-100 leading-relaxed">
            Register new stock arriving from suppliers or warehouse transfers.
          </p>
          <div className="mt-2">
            <button className="flex items-center gap-2 border border-white text-white text-sm font-semibold px-5 py-2 rounded-lg hover:bg-white hover:text-blue-600 transition-colors duration-200">
              <Plus size={16} />
              Create Receipt
            </button>
          </div>
        </div>

        {/* Outgoing Shipments */}
        <div className="rounded-xl p-7 flex flex-col gap-3 bg-gray-900 text-white shadow-md">
          <h2 className="text-xl font-bold">Outgoing Shipments</h2>
          <p className="text-sm text-gray-400 leading-relaxed">
            Prepare products for delivery to customers or external locations.
          </p>
          <div className="mt-2">
            <button className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold px-5 py-2 rounded-lg transition-colors duration-200">
              <Truck size={16} />
              Create Delivery
            </button>
          </div>
        </div>
      </div>

      {/* Recent Activities */}
      <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-base font-bold text-gray-800">
            Recent Activities
          </h2>
          <a
            href="#"
            className="text-sm text-indigo-500 font-semibold hover:underline"
          >
            View All
          </a>
        </div>
        <Table />
      </div>

    </main>
  );
};

export default DashboardContent;
