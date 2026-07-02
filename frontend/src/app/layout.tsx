import React, { useState } from "react";
import { Navigate, Outlet } from "react-router-dom";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { useMe } from "@/hooks/admin/use-me";
import { AppHeader, AppSidebar } from "@/components/layout";

export default function AppLayout() {
  const me = useMe();
  const [scrolled, setScrolled] = useState(false);

  if (me.isPending) return null;

  if (me.isError || !me.data) {
    return <Navigate to="/signin" replace />;
  }

  return (
    <SidebarProvider className="h-svh overflow-hidden">
      <AppSidebar />
      <SidebarInset className="min-w-0 overflow-hidden">
        <AppHeader scrolled={scrolled} />
        <div
          className="flex-1 overflow-y-auto px-4 pb-6 pt-[5.5rem] flex flex-col gap-4 sm:gap-6"
          onScroll={(e: React.UIEvent<HTMLDivElement>) => setScrolled(e.currentTarget.scrollTop > 10)}
        >
          <Outlet />
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
