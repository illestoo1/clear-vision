import type { ReactNode } from "react";
import { redirect } from "next/navigation";
import { createClient } from "@/app/lib/supabase/server";
import Sidebar from "@/app/components/layout/Sidebar";
import Navbar from "@/app/components/layout/Navbar";

export default async function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Navbar user={user} />
        <main className="flex-1 p-6 md:p-8 overflow-auto bg-slate-50">
          {children}
        </main>
      </div>
    </div>
  );
}
