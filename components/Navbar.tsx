import { Bell, HelpCircle, MapPin } from "lucide-react";
<<<<<<< HEAD
import React from "react";
=======


>>>>>>> d528ece13f6796d568a8b2a118ec6edf446997c6
const Navbar = () => {
  return (
    <div className="w-full h-20 bg-white border-b flex items-center justify-between px-6 py-5 print:hidden">
      <div className="flex-1 max-w-md">
        <input
          type="text"
          placeholder="Search inventory, orders, or reports..."
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-400"
        />
      </div>
      <div className="flex items-center gap-6">
        <Bell className="cursor-pointer text-gray-400" />
        <HelpCircle className="cursor-pointer text-gray-400" />
        <div className="flex items-center gap-1 text-gray-600">
          <span>Stockholm DC</span>
          <MapPin size={20} className="cursor-pointer text-gray-400 ml-1" />
        </div>
      </div>
    </div>
  );
<<<<<<< HEAD
};

export default Navbar;

=======

}


export default Navbar;


>>>>>>> d528ece13f6796d568a8b2a118ec6edf446997c6
