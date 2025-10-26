"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import Image from "next/image";

export function Header() {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-4 lg:px-6">
      <SidebarTrigger />

      <div className="flex-1" />

      <div className="flex items-center">
        {/* Logo no canto direito usando public/logo.svg */}
        <Image
          width={90}
          height={90}
          src="/logo.svg"
          alt="Prospect Manager"
          className="h-8 w-8 rounded-full object-contain"
        />
      </div>
    </header>
  );
}
