import { Link, useLocation } from "react-router-dom";
import { CircleUser, ChevronsUpDown, LogOut } from "lucide-react";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMe } from "@/hooks/admin/use-me";
import { useLogout } from "@/hooks/auth/use-logout";
import { navigationGroups } from "@/lib/sidebar-navigation";

export function AppSidebar() {
  const { pathname } = useLocation();
  const me = useMe();
  const logout = useLogout();

  const isAdmin = me.data?.is_admin ?? false;
  const username = me.data?.username ?? "—";

  const visibleGroups = navigationGroups.filter(
    (group) => !group.adminOnly || isAdmin
  );

  return (
    <Sidebar variant="inset" collapsible="icon">
      <SidebarHeader className="px-4 py-3 font-semibold tracking-tight">
        Cashboxes
      </SidebarHeader>

      <SidebarSeparator className="data-horizontal:w-auto mr-2" />

      <SidebarContent>
        {visibleGroups.map((group) => (
          <SidebarGroup key={group.title}>
            <SidebarGroupLabel>{group.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu className="gap-1">
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild isActive={pathname === item.url}>
                      <Link to={item.url}>
                        <item.icon className="h-4 w-4" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton size="lg">
                  <CircleUser className="shrink-0" />
                  <span className="truncate text-sm">{username}</span>
                  <ChevronsUpDown className="ml-auto shrink-0 opacity-50" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" align="start" className="w-[--radix-dropdown-menu-trigger-width] min-w-52">
                <DropdownMenuItem onClick={logout} className="text-destructive focus:text-destructive">
                  <LogOut />
                  Выйти
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
