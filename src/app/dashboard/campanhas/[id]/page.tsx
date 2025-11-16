"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { GerenciarProspectsService } from "@/services/gerenciar-prospects";
import type { Campaign } from "@/types/gerenciar-prospects";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Clock, Loader2 } from "lucide-react";

export default function CampanhaDetalhesPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id || "";

  const { data, isLoading, error } = useQuery({
    queryKey: ["campaign", id],
    queryFn: () => GerenciarProspectsService.getCampaignById(id),
    enabled: !!id,
    refetchInterval: (query) => {
      const c = query.state.data as Campaign | undefined;
      if (!c) return false;
      return c.status === "in_progress" ? 3000 : false;
    },
  });

  function formatDateTime(value?: string | null): string {
    if (!value) return "-";
    try {
      const d = new Date(value);
      const dd = String(d.getDate()).padStart(2, "0");
      const mm = String(d.getMonth() + 1).padStart(2, "0");
      const yyyy = d.getFullYear();
      const hh = String(d.getHours()).padStart(2, "0");
      const min = String(d.getMinutes()).padStart(2, "0");
      return `${dd}/${mm}/${yyyy} ${hh}:${min}`;
    } catch {
      return "-";
    }
  }

  const statusLabel =
    data?.status === "completed"
      ? "Concluída"
      : data?.status === "in_progress"
      ? "Em andamento"
      : data?.status === "failed"
      ? "Falhou"
      : "Pendente";

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Detalhes da Campanha</h1>
        <p className="text-muted-foreground">ID: {id}</p>
      </div>

      {error && (
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Erro ao carregar campanha.</AlertDescription>
        </Alert>
      )}

      <Card className="border relative">
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-3">
            <CardTitle>
              {data?.name || (isLoading ? "Carregando..." : "-")}
            </CardTitle>
            <Badge
              variant="outline"
              className={`shrink-0 ${
                data?.status === "completed"
                  ? "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-300"
                  : data?.status === "in_progress"
                  ? "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300"
                  : data?.status === "failed"
                  ? "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-300"
                  : "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300"
              }`}
            >
              {statusLabel}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 pt-0">
          {/* Intervalo e tipo */}
          <div className="text-sm text-muted-foreground">
            <span className="font-medium text-foreground">
              {data?.messageType?.name || "-"}
            </span>{" "}
            • Intervalo:{" "}
            <span className="font-medium text-foreground">
              {data?.intervalMin ?? "-"}s — {data?.intervalMax ?? "-"}s
            </span>
          </div>

          {/* Datas e total */}
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>
                Início:{" "}
                <span className="font-medium text-foreground">
                  {formatDateTime(data?.startedAt)}
                </span>
              </span>
            </div>
            <span className="opacity-60">|</span>
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>
                Fim:{" "}
                <span className="font-medium text-foreground">
                  {formatDateTime(data?.completedAt)}
                </span>
              </span>
            </div>
            <span className="opacity-60">|</span>
            <div className="flex items-center gap-1">
              <span>Total destinatários:</span>
              <span className="font-semibold text-foreground">
                {data?.totalRecipients ?? "-"}
              </span>
            </div>
          </div>

          {/* Contadores */}
          <div className="grid grid-cols-3 gap-3">
            <div className="rounded border bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800 p-3 text-center">
              <div className="text-xs text-green-800 dark:text-green-200">
                Sucesso
              </div>
              <div className="text-2xl font-bold text-green-700 dark:text-green-300">
                {data?.successCount ?? 0}
              </div>
            </div>
            <div className="rounded border bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800 p-3 text-center">
              <div className="text-xs text-red-800 dark:text-red-200">
                Falhas
              </div>
              <div className="text-2xl font-bold text-red-700 dark:text-red-300">
                {data?.failedCount ?? 0}
              </div>
            </div>
            <div className="rounded border bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800 p-3 text-center">
              <div className="text-xs text-amber-800 dark:text-amber-200">
                Pendentes
              </div>
              <div className="text-2xl font-bold text-amber-700 dark:text-amber-300">
                {data?.pendingCount ?? 0}
              </div>
            </div>
          </div>

          {/* Indicador de progresso se em andamento */}
          {data?.status === "in_progress" && (
            <div className="mt-2 flex items-center gap-2 text-sm">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Envio em andamento... atualizando automaticamente</span>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
