"use client";

import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { useState } from "react";
import { GerenciarProspectsService } from "@/services/gerenciar-prospects";
import type { Campaign } from "@/types/gerenciar-prospects";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Clock, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

  // Recipients with pagination and polling aligned to campaign status
  const [recPage, setRecPage] = useState<number>(1);
  const [recPageSize, setRecPageSize] = useState<number>(10);
  const {
    data: recipientsData,
    isLoading: isLoadingRecipients,
    error: recipientsError,
    refetch: refetchRecipients,
  } = useQuery({
    queryKey: ["campaignRecipients", id, recPage, recPageSize],
    queryFn: () =>
      GerenciarProspectsService.getCampaignRecipients(id, {
        page: recPage,
        pageSize: recPageSize,
      }),
    enabled: !!id,
    refetchInterval: data?.status === "in_progress" ? 3000 : false,
  });

  // Force a final refresh after campaign leaves in_progress
  useEffect(() => {
    if (!id) return;
    if (data?.status && data.status !== "in_progress") {
      refetchRecipients();
    }
  }, [id, data?.status, refetchRecipients]);

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

      {/* Recipients */}
      <div className="mt-6">
        <div className="mb-3">
          <h2 className="text-xl font-semibold">Destinatários</h2>
          <p className="text-sm text-muted-foreground">
            Lista de contatos envolvidos na campanha.
          </p>
        </div>

        {recipientsError && (
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Erro ao carregar destinatários.</AlertDescription>
          </Alert>
        )}

        <div className="flex flex-col gap-3">
          {isLoadingRecipients &&
            Array.from({ length: recPageSize }).map((_, i) => (
              <Card key={`rec-sk-${i}`}>
                <CardContent className="p-4 space-y-2">
                  <div className="h-4 w-48 bg-muted rounded animate-pulse" />
                  <div className="h-3 w-32 bg-muted rounded animate-pulse" />
                </CardContent>
              </Card>
            ))}

          {!isLoadingRecipients &&
            (recipientsData?.items || []).map((r) => (
              <Card key={r.id} className="border">
                <CardContent className="px-6">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-medium truncate">
                          {r.place.displayName}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {r.place.city && r.place.state
                            ? `${r.place.city}, ${r.place.state}`
                            : ""}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground mt-1">
                        {r.place.normalizedPhoneE164 || "-"}
                      </div>
                    </div>
                    <Badge
                      variant="outline"
                      className={`shrink-0 ${
                        r.status === "sent"
                          ? "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-300"
                          : r.status === "failed"
                          ? "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-300"
                          : "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300"
                      }`}
                    >
                      {r.status === "sent"
                        ? "Enviado"
                        : r.status === "failed"
                        ? "Falhou"
                        : "Pendente"}
                    </Badge>
                  </div>
                  <div className="mt-2 text-xs text-muted-foreground">
                    {r.sentAt ? `Enviado em ${formatDateTime(r.sentAt)}` : ""}
                  </div>
                </CardContent>
              </Card>
            ))}
        </div>

        {/* Pagination controls */}
        {recipientsData && (
          <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4 py-2">
            <div className="text-sm text-muted-foreground">
              Mostrando{" "}
              {(recipientsData.page - 1) * recipientsData.pageSize + 1} a{" "}
              {Math.min(
                recipientsData.page * recipientsData.pageSize,
                recipientsData.total
              )}{" "}
              de {recipientsData.total} resultados
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={recPageSize.toString()}
                onValueChange={(v) => {
                  setRecPageSize(Number(v));
                  setRecPage(1);
                }}
              >
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setRecPage(1)}
                  disabled={recPage <= 1 || isLoadingRecipients}
                >
                  {"<<"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setRecPage((p: number) => Math.max(1, p - 1))}
                  disabled={recPage <= 1 || isLoadingRecipients}
                >
                  {"<"}
                </Button>
                <span className="text-sm px-2">
                  Página {recipientsData.page} de {recipientsData.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    setRecPage((p: number) =>
                      Math.min(recipientsData.totalPages, p + 1)
                    )
                  }
                  disabled={
                    recPage >= (recipientsData.totalPages || 1) ||
                    isLoadingRecipients
                  }
                >
                  {">"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setRecPage(recipientsData.totalPages)}
                  disabled={
                    recPage >= (recipientsData.totalPages || 1) ||
                    isLoadingRecipients
                  }
                >
                  {">>"}
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
