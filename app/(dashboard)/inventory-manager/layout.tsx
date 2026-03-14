import Navbar from "@/components/Navbar";
import Sidebar from "./_components/sidebar";
import { getAuthContext } from "@/lib/auth-utils";
import { redirect } from "next/navigation";

export default async function InventoryManagerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await getAuthContext();
  if (!auth) {
    redirect("/login");
  }

  return (
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <Sidebar />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Navbar />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
