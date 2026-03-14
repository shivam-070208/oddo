"use client";

import { Bell, HelpCircle, MapPin } from "lucide-react";

export default function Navbar() {
  return (
    <div className="flex h-20 w-full items-center justify-between border-b border-slate-200 bg-white px-6 py-5">
      <div className="max-w-md flex-1">
        <input
          type="text"
          placeholder="Search inventory, orders, or reports..."
          className="w-full rounded-lg border border-slate-200 px-4 py-2 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      <div className="flex items-center gap-6">
        <Bell className="cursor-pointer text-slate-400" size={20} />
        <HelpCircle className="cursor-pointer text-slate-400" size={20} />
        <div className="flex items-center gap-1 text-slate-600">
          <span>Stockholm DC</span>
          <MapPin size={20} className="ml-1 cursor-pointer text-slate-400" />
        </div>
      </div>
    </div>
  );
}
