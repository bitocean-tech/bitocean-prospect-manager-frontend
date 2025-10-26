"use client"

import { SidebarTrigger } from "@/components/ui/sidebar"

export function Header() {
  return (
    <header className="flex h-16 items-center justify-between border-b bg-background px-4 lg:px-6">
      <SidebarTrigger />
      
      <div className="flex-1" />
      
      <div className="flex items-center">
        <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
          <span className="text-primary-foreground text-sm font-semibold">PM</span>
        </div>
      </div>
    </header>
  )
}