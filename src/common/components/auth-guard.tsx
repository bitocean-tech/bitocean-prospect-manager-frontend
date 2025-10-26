"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { hasAccessKey } from "@/common/helpers/cookies";

interface AuthGuardProps {
  children: React.ReactNode;
}

/**
 * Componente para proteger rotas que requerem autenticação
 */
export function AuthGuard({ children }: AuthGuardProps) {
  const [isChecking, setIsChecking] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const checkAuth = () => {
      const hasKey = hasAccessKey();
      setIsAuthenticated(hasKey);

      // Se não tem chave e está tentando acessar rota protegida
      if (!hasKey && pathname.startsWith("/dashboard")) {
        router.push("/login");
        return;
      }

      // Se tem chave e está na página de login, redireciona para dashboard
      if (hasKey && pathname === "/login") {
        router.push("/dashboard");
        return;
      }

      setIsChecking(false);
    };

    checkAuth();
  }, [pathname, router]);

  // Mostrar loading enquanto verifica autenticação
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="text-muted-foreground">Verificando autenticação...</p>
        </div>
      </div>
    );
  }

  // Para rotas protegidas, só renderiza se autenticado
  if (pathname.startsWith("/dashboard") && !isAuthenticated) {
    return null; // Redirecionamento já foi feito
  }

  return <>{children}</>;
}
