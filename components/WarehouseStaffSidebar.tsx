"use client";

import {
  LayoutDashboard,
  History,
  ClipboardList,
  Boxes,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_ITEMS = [
  {
    label: "Dashboard",
    href: "/warehouse-staff",
    icon: LayoutDashboard,
  },
  {
    label: "Move History",
    href: "/warehouse-staff/move-history",
    icon: History,
  },
];


const WarehouseStaffSidebar = () => {
  const pathname = usePathname();

  const linkClass = (href: string) => {
 
    let isActive = false;
    if (href === "/warehouse-staff") {
      isActive = pathname === "/warehouse-staff";
    } else {
      isActive = pathname === href || pathname.startsWith(href + "/");
    }
    return `flex items-center gap-3 p-2 rounded-lg cursor-pointer transition-colors ${
      isActive
        ? "bg-blue-500 text-white"
        : "text-gray-400 hover:bg-blue-400 hover:text-white"
    }`;
  };

  return (
    <div className="h-screen w-64 bg-white border-r flex flex-col justify-between p-4">
      <div>
        {/* Logo */}
        <div className="flex items-center gap-2 mb-7">
          <Boxes size={34} className="text-blue-500" />
          <div className="flex flex-col justify-center">
            <h1 className="text-xl font-bold text-black">StockFlow</h1>
            <h3 className="text-sm text-gray-400">Warehouse Staff</h3>
          </div>
        </div>

        {/* Main nav */}
        <nav className="space-y-1">
          {NAV_ITEMS.map(({ label, href, icon: Icon }) => (
            <Link key={href} href={href} className={linkClass(href)}>
              <Icon size={18} />
              <span className="text-sm font-medium text-inherit">{label}</span>
            </Link>
          ))}
        </nav>


      </div>

      {/* User footer */}
      <div className="flex items-center gap-3 p-3 border-t mt-auto">
        <div className="w-10 h-10 rounded-full bg-orange-200 flex items-center justify-center overflow-hidden">
          <Image
            src="/profile.jpg"
            width={40}
            height={40}
            alt="profile"
            className="w-full h-full object-cover"
          />
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-800">Warehouse Staff</p>
          <p className="text-xs text-gray-500">Warehouse Staff</p>
        </div>
      </div>
    </div>
  );
};

export default WarehouseStaffSidebar;
