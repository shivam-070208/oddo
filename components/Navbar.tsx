"use client";
import { useRouter } from "next/navigation";
import { Bell, HelpCircle } from "lucide-react";
import { useLogout } from "../hooks/use-logout";
import { useSearchContext } from "@/contexts/search-context";

const Navbar = () => {
  const router = useRouter();
  const logout = useLogout();
  const { searchQuery, setSearchQuery } = useSearchContext();

  const handleLogout = () => {
    logout.mutate(undefined, {
      onSuccess: () => {
        router.push("/login");
      },
      onError: (err) => {
        alert(err?.message || "Failed to logout");
      },
    });
  };

  // react-query v4: "isLoading" does not exist on useMutation, use "isPending"
  const isLoggingOut = logout.isPending;

  return (
    <div className="w-full h-20 bg-white border-b flex items-center justify-between px-6 py-5 print:hidden sticky top-0 z-10">
      <div className="flex-1 max-w-md">
        <input
          type="text"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search inventory, orders, or reports..."
          className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-700"
        />
      </div>
      <div className="flex items-center gap-6">
        <Bell className="cursor-pointer text-gray-400" />
        <HelpCircle className="cursor-pointer text-gray-400" />

        <button
          onClick={handleLogout}
          className="px-4 py-2 rounded-lg bg-red-500 text-white transition-colors hover:bg-red-600"
          disabled={isLoggingOut}
        >
          {isLoggingOut ? "Logging out..." : "Logout"}
        </button>
      </div>
    </div>
  );
};

export default Navbar;
