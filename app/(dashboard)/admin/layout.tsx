import Navbar from "@/components/Navbar";
import Sidebar from "@/components/Sidebar";
import { getAuthContext } from "@/lib/auth-utils";
import { UserRole } from "@/app/generated/prisma/enums";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await getAuthContext({ roles: UserRole.ADMIN, requireVerified: true });

  if (!auth) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex flex-1 flex-col">
        <Navbar />
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  );
}
