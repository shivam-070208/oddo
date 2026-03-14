"use client";

import {
  LayoutDashboard,
  Package,
  Settings,
  History,
  ClipboardList,
  Boxes,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/operations", label: "Operations", icon: ClipboardList },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/move-history", label: "Move History", icon: History },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="flex h-screen w-64 flex-col justify-between border-r border-slate-200 bg-white p-4">
      <div>
        <div className="mb-7 flex items-center gap-2">
          <Boxes size={34} className="text-blue-500" />
          <div className="flex flex-col justify-center">
            <h1 className="text-xl font-bold text-black">InventoryMS</h1>
            <h3 className="text-sm text-slate-400">SaaS Management</h3>
          </div>
        </div>
        <nav className="space-y-2">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-3 rounded-lg p-2 transition-colors ${
                  isActive
                    ? "bg-blue-500 text-white"
                    : "text-slate-600 hover:bg-blue-400 hover:text-white"
                }`}
              >
                <Icon size={18} />
                <p>{label}</p>
              </Link>
            );
          })}
        </nav>
        <div className="mt-4 flex flex-col items-center justify-center">
          <p className="m-1 p-1 text-sm text-slate-400">System</p>
          <Link
            href="/admin/settings"
            className="flex items-center gap-3 rounded-lg p-1 text-slate-600 transition-colors hover:bg-blue-400 hover:text-white"
          >
            <Settings size={18} />
            <p className="p-1 text-center">Settings</p>
          </Link>
        </div>
      </div>
      <div>
        <div className="mt-auto flex items-center gap-3 border-t border-slate-200 p-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-200">
            <Image
              src="/profile.jpg"
              width={40}
              height={40}
              alt="Profile"
              className="h-full w-full rounded-full object-cover"
            />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-800">Alex Rivera</p>
            <p className="text-xs text-slate-500">Admin</p>
          </div>
        </div>
      </div>
    </div>
  );
}
