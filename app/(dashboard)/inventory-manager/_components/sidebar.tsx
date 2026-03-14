"use client";

import {
  LayoutDashboard,
  Package,
  History,
  ClipboardList,
  Boxes,
  FileText,
  Truck,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "@/hooks/use-session";

function formatRole(role?: string) {
  if (!role) return "";
  return role
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

const navItems = [
  { href: "/inventory-manager", icon: LayoutDashboard, label: "Dashboard" },
  {
    href: "/inventory-manager/inventory",
    icon: Package,
    label: "Inventory",
  },
  { href: "/inventory-manager/receipt", icon: FileText, label: "Receipts" },
  { href: "/inventory-manager/delivery", icon: Truck, label: "Deliveries" },
  { href: "/inventory-manager/products", icon: ClipboardList, label: "Products" },
  { href: "/inventory-manager/transfers", icon: History, label: "Transfers" },
];

const Sidebar = () => {
  const pathname = usePathname();
  const { data } = useSession();
  const user = data?.session?.user;

  return (
    <div className="h-screen w-64 shrink-0 border-r border-slate-200 bg-white flex flex-col justify-between p-4 print:hidden">
      <div>
        <div className="mb-7 flex items-center gap-2">
          <Boxes size={34} className="text-blue-500" />
          <div className="flex flex-col justify-center">
            <h1 className="text-xl font-bold text-black">StockFlow</h1>
            <h3 className="text-sm text-gray-400">Warehouse Alpha</h3>
          </div>
        </div>

        <nav className="space-y-1">
          {navItems.map(({ href, icon: Icon, label }) => {
            const isActive =
              label === "Receipts"
                ? pathname?.startsWith("/inventory-manager/receipt")
                : label === "Deliveries"
                ? pathname?.startsWith("/inventory-manager/delivery")
                : label === "Products"
                ? pathname?.startsWith("/inventory-manager/products")
                : label === "Inventory"
                ? pathname?.startsWith("/inventory-manager/inventory")
                : label === "Transfers"
                ? pathname?.startsWith("/inventory-manager/transfers")
                : pathname === href;
            return (
              <Link
                key={label}
                href={href}
                className={`flex items-center gap-3 rounded-lg p-2.5 text-sm transition-colors ${
                  isActive
                    ? "bg-violet-100 text-violet-700"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon size={18} />
                <span className="font-medium">{label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      <div>
        <div className="flex items-center gap-3 p-3 mt-auto border-t">
          <div className="w-10 h-10 rounded-full bg-orange-200 flex items-center justify-center">
            <Image
              src="/profile.jpg"
              width={40}
              height={40}
              alt="profile"
              className="w-full h-full rounded-full object-cover"
            />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-800">{user?.name ?? "User"}</p>
            <p className="text-xs text-gray-500">{formatRole(user?.role) || "Unknown Role"}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;