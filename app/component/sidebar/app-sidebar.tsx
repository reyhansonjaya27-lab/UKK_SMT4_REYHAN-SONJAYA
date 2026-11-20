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
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  UsersRound,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export function AppSidebar() {
  return (
    <Sidebar className="border-r-0">
      <div className="flex h-full w-full flex-col bg-sidebar text-sidebar-foreground">
        {/* Header Logo */}
        <SidebarHeader className="p-4">
          <div className="flex items-center justify-center gap-3 px-3 py-2">
            <Image
              src="/img/smk_mvp_ars_logo_white.png"
              alt="SMK MVP ARS"
              width={200}
              height={200}
              className="w-auto h-auto max-h-12 object-contain"
              priority
            />
          </div>
        </SidebarHeader>

        {/* Content Menu */}
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel className="text-sidebar-foreground/70 text-xs font-semibold px-2 mb-2">
              Menu Utama
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {/* Dashboard */}
                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                  >
                    <Link href="/admin">
                      <LayoutDashboard className="w-4 h-4 mr-2" />
                      <span>Dashboard</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

                <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                  >
                    <Link href="/admin/usermanagement">
                      <UsersRound className="w-4 h-4 mr-2" />
                      <span>User Management</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>

              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>

        <SidebarFooter />
      </div>
    </Sidebar>
  );
}
