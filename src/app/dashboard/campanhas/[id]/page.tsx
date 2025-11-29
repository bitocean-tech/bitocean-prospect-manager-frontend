"use client";

import { useParams } from "next/navigation";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { GerenciarProspectsService } from "@/services/gerenciar-prospects";
import type {
  Campaign,
  CampaignRecipientStatus,
} from "@/types/gerenciar-prospects";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertCircle,
  Clock,
  Loader2,
  Users,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { ChevronDown } from "lucide-react";

const STATUS_FILTER_OPTIONS: Array<{
  label: string;
  value: CampaignRecipientStatus | "all";
}> = [
  { label: "Todos", value: "all" },
  { label: "Pendentes", value: "pending" },
  { label: "Enviados", value: "sent" },
  { label: "Falhas", value: "failed" },
];

export default function CampanhaDetalhesPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id || "";
  const queryClient = useQueryClient();

  const [selectedRecipients, setSelectedRecipients] = useState<Set<string>>(
    new Set()
  );
  const [recStatusFilter, setRecStatusFilter] = useState<
    CampaignRecipientStatus | "all"
  >("all");
  const [recPage, setRecPage] = useState<number>(1);
  const [recPageSize, setRecPageSize] = useState<number>(10);

  const { data, isLoading, error } = useQuery({
    queryKey: ["campaign", id],
    queryFn: () => GerenciarProspectsService.getCampaignById(id),
    enabled: !!id,
    refetchInterval: (query) => {
      const c = query.state.data as Campaign | undefined;
      if (!c) return false;
      // Não fazer polling para campanhas externas
      return c.status === "in_progress" && !c.isExternal ? 3000 : false;
    },
  });

  const {
    data: recipientsData,
    isLoading: isLoadingRecipients,
    error: recipientsError,
    refetch: refetchRecipients,
  } = useQuery({
    queryKey: ["campaignRecipients", id, recPage, recPageSize, recStatusFilter],
    queryFn: () =>
      GerenciarProspectsService.getCampaignRecipients(id, {
        page: recPage,
        pageSize: recPageSize,
        status: recStatusFilter === "all" ? undefined : recStatusFilter,
      }),
    enabled: !!id,
    refetchInterval:
      data?.status === "in_progress" && !data?.isExternal ? 3000 : false,
  });

  // Mutation para atualizar recipients
  const updateRecipientsMutation = useMutation({
    mutationFn: (params: {
      recipientIds?: string[];
      status: CampaignRecipientStatus;
      errorMessage?: string;
    }) => {
      // Sempre enviar errorMessage como string vazia quando não for erro
      const updateParams = {
        ...params,
        errorMessage:
          params.status === "failed"
            ? params.errorMessage || "Marcado manualmente como falha"
            : "",
      };
      return GerenciarProspectsService.updateRecipients(id, updateParams);
    },
    onSuccess: () => {
      // Refetch campaign e recipients
      queryClient.invalidateQueries({ queryKey: ["campaign", id] });
      queryClient.invalidateQueries({ queryKey: ["campaignRecipients", id] });
      setSelectedRecipients(new Set());
      toast.success("Status dos destinatários atualizado com sucesso.");
    },
    onError: (error: Error) => {
      toast.error(error.message || "Erro ao atualizar destinatários.");
    },
  });

  // Force a final refresh after campaign leaves in_progress
  useEffect(() => {
    if (!id) return;
    if (data?.status && data.status !== "in_progress") {
      refetchRecipients();
    }
  }, [id, data?.status, refetchRecipients]);

  // Reset selection when filter changes
  useEffect(() => {
    setSelectedRecipients(new Set());
  }, [recStatusFilter, recPage]);

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

  const isExternal = data?.isExternal ?? false;

  // Seleção de recipients
  const currentPageRecipients = recipientsData?.items || [];
  const allCurrentPageSelected =
    currentPageRecipients.length > 0 &&
    currentPageRecipients.every((r) => selectedRecipients.has(r.id));
  const someCurrentPageSelected = currentPageRecipients.some((r) =>
    selectedRecipients.has(r.id)
  );

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const newSelection = new Set(selectedRecipients);
      currentPageRecipients.forEach((r) => newSelection.add(r.id));
      setSelectedRecipients(newSelection);
    } else {
      const newSelection = new Set(selectedRecipients);
      currentPageRecipients.forEach((r) => newSelection.delete(r.id));
      setSelectedRecipients(newSelection);
    }
  };

  const handleToggleRecipient = (recipientId: string) => {
    const newSelection = new Set(selectedRecipients);
    if (newSelection.has(recipientId)) {
      newSelection.delete(recipientId);
    } else {
      newSelection.add(recipientId);
    }
    setSelectedRecipients(newSelection);
  };

  const handleMarkAllAsSent = () => {
    updateRecipientsMutation.mutate({
      status: "sent",
    });
  };

  const handleMarkSelectedAsSent = () => {
    if (selectedRecipients.size === 0) {
      toast.error("Selecione pelo menos um destinatário.");
      return;
    }

    updateRecipientsMutation.mutate({
      recipientIds: Array.from(selectedRecipients),
      status: "sent",
    });
  };

  const handleMarkAllAsFailed = () => {
    updateRecipientsMutation.mutate({
      status: "failed",
      errorMessage: "Marcado manualmente como falha",
    });
  };

  const handleMarkSelectedAsFailed = () => {
    if (selectedRecipients.size === 0) {
      toast.error("Selecione pelo menos um destinatário.");
      return;
    }

    updateRecipientsMutation.mutate({
      recipientIds: Array.from(selectedRecipients),
      status: "failed",
      errorMessage: "Marcado manualmente como falha",
    });
  };

  const isUpdating = updateRecipientsMutation.isPending;

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
            <div className="flex items-center gap-3">
              <CardTitle>
                {data?.name || (isLoading ? "Carregando..." : "-")}
              </CardTitle>
              {isExternal && (
                <Badge
                  variant="outline"
                  className="bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300"
                >
                  <Users className="h-3 w-3 mr-1" />
                  Externa
                </Badge>
              )}
            </div>
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
          {/* Intervalo e tipo - apenas para campanhas normais */}
          {!isExternal && (
            <div className="text-sm text-muted-foreground">
              <span className="font-medium text-foreground">
                {data?.messageType?.name || "-"}
              </span>{" "}
              • Intervalo:{" "}
              <span className="font-medium text-foreground">
                {data?.intervalMin ?? "-"}s — {data?.intervalMax ?? "-"}s
              </span>
            </div>
          )}

          {/* Informação para campanhas externas */}
          {isExternal && (
            <Alert className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30">
              <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
              <AlertDescription className="text-blue-800 dark:text-blue-200">
                Esta é uma campanha externa. Os contatos foram armazenados para
                envio por outras plataformas. Marque manualmente os contatos
                como enviados após realizar o envio.
              </AlertDescription>
            </Alert>
          )}

          {/* Datas e total */}
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>
                Criada em:{" "}
                <span className="font-medium text-foreground">
                  {formatDateTime(data?.createdAt)}
                </span>
              </span>
            </div>
            {data?.startedAt && (
              <>
                <span className="opacity-60">|</span>
                <div className="flex items-center gap-1">
                  <Clock className="h-4 w-4" />
                  <span>
                    Início:{" "}
                    <span className="font-medium text-foreground">
                      {formatDateTime(data?.startedAt)}
                    </span>
                  </span>
                </div>
              </>
            )}
            {data?.completedAt && (
              <>
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
              </>
            )}
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
          {data?.status === "in_progress" && !isExternal && (
            <div className="mt-2 flex items-center gap-2 text-sm">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>Envio em andamento... atualizando automaticamente</span>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recipients */}
      <div className="mt-6">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">Destinatários</h2>
            <p className="text-sm text-muted-foreground">
              {isExternal
                ? "Lista de contatos. Marque como enviados após realizar o envio por outra plataforma."
                : "Lista de contatos envolvidos na campanha."}
            </p>
          </div>
        </div>

        {/* Filtros e ações para campanhas externas */}
        {isExternal && (
          <div className="mb-4 rounded-lg border border-dashed border-muted-foreground/20 bg-muted/30 dark:bg-muted/10 p-4">
            <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
              {/* Filtro e Seleção */}
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center flex-1">
                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Filtrar por status
                  </Label>
                  <Select
                    value={recStatusFilter}
                    onValueChange={(v: CampaignRecipientStatus | "all") => {
                      setRecStatusFilter(v);
                      setRecPage(1);
                    }}
                  >
                    <SelectTrigger className="w-full sm:w-48">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {STATUS_FILTER_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center gap-3 pt-6 sm:pt-0">
                  {selectedRecipients.size > 0 ? (
                    <Badge
                      variant="outline"
                      className="px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700"
                    >
                      {selectedRecipients.size} prospect
                      {selectedRecipients.size !== 1 ? "s" : ""} selecionado
                      {selectedRecipients.size !== 1 ? "s" : ""}
                    </Badge>
                  ) : (
                    <span className="text-sm text-muted-foreground pt-6 sm:pt-0">
                      Nenhum prospect selecionado
                    </span>
                  )}
                </div>
              </div>

              {/* Ações */}
              <div className="flex items-center gap-2 shrink-0">
                {selectedRecipients.size > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedRecipients(new Set())}
                    disabled={isUpdating}
                  >
                    Limpar Seleção
                  </Button>
                )}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isUpdating}
                      className="h-8"
                    >
                      Ações em Lote
                      <ChevronDown className="h-4 w-4 ml-2" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {selectedRecipients.size > 0 ? (
                      <>
                        <DropdownMenuItem
                          onClick={handleMarkSelectedAsSent}
                          disabled={isUpdating}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
                          Marcar Selecionados como Enviados
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={handleMarkSelectedAsFailed}
                          disabled={isUpdating}
                        >
                          <XCircle className="h-4 w-4 mr-2 text-red-600" />
                          Marcar Selecionados como Falha
                        </DropdownMenuItem>
                      </>
                    ) : (
                      <>
                        <DropdownMenuItem
                          onClick={handleMarkAllAsSent}
                          disabled={isUpdating}
                        >
                          <CheckCircle2 className="h-4 w-4 mr-2 text-green-600" />
                          Marcar Todos como Enviados
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={handleMarkAllAsFailed}
                          disabled={isUpdating}
                        >
                          <XCircle className="h-4 w-4 mr-2 text-red-600" />
                          Marcar Todos como Falha
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
                {isUpdating && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Atualizando...</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {recipientsError && (
          <Alert className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>Erro ao carregar destinatários.</AlertDescription>
          </Alert>
        )}

        {/* Header com checkbox para selecionar todos (apenas para externas) */}
        {isExternal &&
          !isLoadingRecipients &&
          currentPageRecipients.length > 0 && (
            <div className="mb-3 p-3 rounded-md border bg-muted/30">
              <div className="flex items-center gap-3">
                <Checkbox
                  checked={allCurrentPageSelected}
                  onCheckedChange={handleSelectAll}
                />
                <Label
                  className="text-sm font-medium cursor-pointer"
                  onClick={() => handleSelectAll(!allCurrentPageSelected)}
                >
                  Selecionar todos desta página ({currentPageRecipients.length}{" "}
                  itens)
                  {someCurrentPageSelected && !allCurrentPageSelected && (
                    <span className="text-xs text-muted-foreground ml-1">
                      ({selectedRecipients.size} selecionado
                      {selectedRecipients.size !== 1 ? "s" : ""})
                    </span>
                  )}
                </Label>
              </div>
            </div>
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
            currentPageRecipients.map((r) => (
              <Card
                key={r.id}
                className={`border ${
                  isExternal && selectedRecipients.has(r.id)
                    ? "border-l-4 border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/20"
                    : ""
                }`}
              >
                <CardContent className="px-6 py-4">
                  <div className="flex items-start gap-3">
                    {isExternal && (
                      <div className="pt-1">
                        <Checkbox
                          checked={selectedRecipients.has(r.id)}
                          onCheckedChange={() => handleToggleRecipient(r.id)}
                          disabled={isUpdating}
                        />
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
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
                      {r.errorMessage && (
                        <div className="text-xs text-red-600 dark:text-red-400 mt-1">
                          Erro: {r.errorMessage}
                        </div>
                      )}
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
