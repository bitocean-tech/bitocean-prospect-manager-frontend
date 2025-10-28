"use client";

import { GerenciarProspectsProvider } from "@/contexts/GerenciarProspectsContext";

interface GerenciarProspectsLayoutProps {
  children: React.ReactNode;
}

export default function GerenciarProspectsLayout({
  children,
}: GerenciarProspectsLayoutProps) {
  return (
    <GerenciarProspectsProvider>
      {children}
    </GerenciarProspectsProvider>
  );
}