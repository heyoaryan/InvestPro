import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { DashboardSidebar } from "@/components/dashboard/sidebar";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <div className="flex min-h-screen bg-[#0a0a0a]">
      <DashboardSidebar />
      <main className="ml-[200px] flex-1 flex justify-center px-8 py-8">
        <div className="w-full max-w-4xl">{children}</div>
      </main>
    </div>
  );
}
