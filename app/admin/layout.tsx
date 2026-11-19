import { AppSidebar } from "@/app/component/sidebar/app-sidebar";
import { SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { getAuthenticatedUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LogoutButton } from "@/components/logout-button";

export default async function Layout({ children }: { children: React.ReactNode }) {
  const user = await getAuthenticatedUser();
  if (!user || user.role !== "admin") redirect("/");

  return (
    <SidebarProvider>
      <AppSidebar />
      {/* Tambahkan class w-full flex-1 overflow-x-hidden di tag main */}
      <main className="w-full flex-1 overflow-x-hidden">
        <SidebarInset />
        <header className="flex items-center justify-between p-4">
        <SidebarTrigger />
          <DropdownMenu >
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="rounded-full">
                <Avatar>
                  <AvatarImage src="/img/saber.jpg" alt="shadcn" />
                  <AvatarFallback>CN</AvatarFallback>
                </Avatar>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-32">
              <DropdownMenuGroup>
                <DropdownMenuItem>Profile</DropdownMenuItem>
                <DropdownMenuItem>Billing</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <LogoutButton />
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </header>
        {children}
      </main>
    </SidebarProvider>
  );
}
