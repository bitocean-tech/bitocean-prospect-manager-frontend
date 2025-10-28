"use client";

import { Search, Send, LogOut } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from "@/components/ui/sidebar";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { clearAccessKey } from "@/common/helpers/cookies";
import { ROUTES } from "@/common/utils/constants";

const menuItems = [
  {
    title: "Buscar negócios",
    url: "/dashboard/buscar-negocios",
    icon: Search,
  },
  {
    title: "Gerenciar Prospects",
    url: "/dashboard/gerenciar-prospects",
    icon: Send,
  },
];

export function AppSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  function handleLogout() {
    try {
      clearAccessKey();
    } catch (_) {}
    router.push(ROUTES.login);
  }

  return (
    <Sidebar>
      <SidebarHeader className="border-b p-6">
        <div className="flex items-center gap-3">
          <Image
            width={90}
            height={90}
            src="/logo.svg"
            alt="Prospect Manager"
            className="h-10 w-10 rounded-full object-contain"
          />
          <div>
            <h2 className="text-lg font-semibold">Prospect Manager</h2>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent className="pt-4">
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild isActive={pathname === item.url}>
                    <Link href={item.url}>
                      <item.icon className="h-4 w-4" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="border-t p-4">
        <Button variant="outline" className="w-full justify-start" onClick={handleLogout}>
          <LogOut className="h-4 w-4" />
          <span>Logout</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
