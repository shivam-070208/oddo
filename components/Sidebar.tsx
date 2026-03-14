"use client";

import {
  LayoutDashboard,
  Package,
  ClipboardList,
  Boxes,
  MapPinned,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

const Sidebar = () => {
  return (
    <div className="h-screen w-64 bg-white border-r flex flex-col justify-between p-4">
      <div>
        <div className="flex items-center gap-2 mb-7">
          <Boxes size={34} className="text-blue-500" />
          <div className="flex-col justify-center">
            <h1 className="text-xl font-bold text-black">InventoryMS</h1>
            <h3 className="text-sm text-gray-400">Saas Management</h3>
          </div>
        </div>

        <nav className="space-y-2">
          <Link
            href="/admin"
            className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-blue-400 hover:text-white text-gray-400"
          >
            <LayoutDashboard size={18} />
            <p className="text-black">Dashboard</p>
          </Link>
          <Link
            href="/admin/users"
            className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-blue-400 hover:text-white text-gray-400"
          >
            <ClipboardList size={18} />
            <p className="text-black">Users</p>
          </Link>
          <Link
            href="/admin/locations"
            className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-blue-400 hover:text-white text-gray-400"
          >
            <MapPinned size={18} />
            <p className="text-black">Locations</p>
          </Link>
          <Link
            href="/admin/categories"
            className="flex items-center gap-3 p-2 rounded-lg cursor-pointer hover:bg-blue-400 hover:text-white text-gray-400"
          >
            <Boxes size={18} />
            <p className="text-black">Categories</p>
          </Link>
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
            <p className="text-sm font-semibold text-gray-800">Alex Rivera</p>
            <p className="text-xs text-gray-500">Admin</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Sidebar;
