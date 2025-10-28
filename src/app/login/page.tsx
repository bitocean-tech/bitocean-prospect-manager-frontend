"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { AuthService } from "@/modules/auth/services/authService";
import { saveAccessKey } from "@/common/helpers/cookies";

export default function LoginPage() {
  const [accessKey, setAccessKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!accessKey.trim()) {
      toast.error("Por favor, informe a chave de acesso");
      return;
    }

    setIsLoading(true);

    try {
      const result = await AuthService.validateAccessKey(accessKey.trim());

      if (result.valid) {
        saveAccessKey(accessKey.trim());
        toast.success("Login realizado com sucesso!");
        router.push("/dashboard");
      } else {
        toast.error(result.message || "Chave inválida");
      }
    } catch (error) {
      toast.error("Erro inesperado ao validar chave");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center space-y-4">
          <Image
            src="/logo.svg"
            alt="Bitocean Prospect Manager"
            width={64}
            height={64}
            className="mx-auto hidden"
            priority
          />
          <div className="mx-auto w-16 h-16 rounded-full overflow-hidden flex items-center justify-center">
            <Image
              src="/logo.svg"
              alt="Bitocean Prospect Manager"
              width={64}
              height={64}
              className="w-full h-full object-cover"
              priority
            />
          </div>
          <h1 className="text-2xl font-semibold text-foreground">
            Prospect Manager
          </h1>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="accessKey">Chave de acesso</Label>
              <Input
                id="accessKey"
                type="password"
                placeholder="Digite sua chave de acesso"
                value={accessKey}
                onChange={(e) => setAccessKey(e.target.value)}
                disabled={isLoading}
                className="w-full"
                autoComplete="current-password"
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !accessKey.trim()}
            >
              {isLoading ? "Validando..." : "Entrar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
