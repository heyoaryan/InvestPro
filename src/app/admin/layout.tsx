import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
import type { SessionUser } from "@/types";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  const user = session.user as SessionUser;
  if (user.role !== "ADMIN") redirect("/dashboard");

  return (
    <div className="flex min-h-screen bg-[#0a0a0a]">
      <AdminSidebar />
      <main className="ml-[200px] flex-1 flex justify-center px-8 py-8">
        <div className="w-full max-w-4xl">{children}</div>
      </main>
    </div>
  );
}
