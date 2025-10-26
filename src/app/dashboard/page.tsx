"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { clearAccessKey } from "@/common/helpers/cookies";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function DashboardPage() {
  const router = useRouter();

  const handleLogout = () => {
    clearAccessKey();
    toast.success("Logout realizado com sucesso");
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <Button variant="outline" onClick={handleLogout}>
            Sair
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Bem-vindo ao Prospect Manager</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              Você está autenticado e pode acessar o sistema. Em breve, aqui
              estarão as funcionalidades de busca de negócios e envio de
              mensagens.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
