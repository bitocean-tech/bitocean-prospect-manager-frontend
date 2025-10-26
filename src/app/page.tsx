"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { hasAccessKey } from "@/common/helpers/cookies";

export default function HomePage() {
  const router = useRouter();

  useEffect(() => {
    // Redireciona baseado no estado de autenticação
    if (hasAccessKey()) {
      router.push("/dashboard");
    } else {
      router.push("/login");
    }
  }, [router]);

  // Loading state enquanto redireciona
  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center space-y-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
        <p className="text-muted-foreground">Carregando...</p>
      </div>
    </div>
  );
}
