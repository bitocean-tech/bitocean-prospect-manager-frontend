"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { GerenciarProspectsService } from "@/services/gerenciar-prospects";
import type { CampaignStatus } from "@/types/gerenciar-prospects";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

const STATUS_OPTIONS: Array<{ label: string; value: CampaignStatus | "all" }> =
  [
    { label: "Todos", value: "all" },
    { label: "Pendente", value: "pending" },
    { label: "Em andamento", value: "in_progress" },
    { label: "Concluída", value: "completed" },
    { label: "Falhou", value: "failed" },
  ];

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

export default function CampanhasPage() {
  const [status, setStatus] = useState<CampaignStatus | "all">("all");
  const [page, setPage] = useState<number>(1);
  const [pageSize, setPageSize] = useState<number>(10);
  const router = useRouter();

  const { data, isLoading, error } = useQuery({
    queryKey: ["campaigns", status, page, pageSize],
    queryFn: () =>
      GerenciarProspectsService.getCampaigns({
        page,
        pageSize,
        status: status === "all" ? undefined : status,
      }),
  });

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Campanhas</h1>
        <p className="text-muted-foreground">
          Listagem de campanhas e status de envio.
        </p>
      </div>

      <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="space-y-2">
          <Label>Status</Label>
          <Select
            value={status}
            onValueChange={(v: CampaignStatus | "all") => {
              setStatus(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              {STATUS_OPTIONS.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label>Itens por página</Label>
          <Select
            value={pageSize.toString()}
            onValueChange={(v) => {
              setPageSize(Number(v));
              setPage(1);
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10</SelectItem>
              <SelectItem value="20">20</SelectItem>
              <SelectItem value="50">50</SelectItem>
              <SelectItem value="100">100</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {error && (
        <Alert className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>Erro ao carregar campanhas.</AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col gap-3">
        {isLoading &&
          Array.from({ length: pageSize }).map((_, i) => (
            <Card key={`sk-${i}`}>
              <CardContent>
                <div></div>
                <div className="h-5 w-48 mb-2 bg-muted rounded animate-pulse"></div>
                <div className="h-4 w-24 bg-muted rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}

        {!isLoading &&
          (data?.items || []).map((c) => {
            const statusLabel =
              c.status === "completed"
                ? "Concluída"
                : c.status === "in_progress"
                ? "Em andamento"
                : c.status === "failed"
                ? "Falhou"
                : "Pendente";
            const statusClass =
              c.status === "completed"
                ? "bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-300"
                : c.status === "in_progress"
                ? "bg-blue-50 text-blue-700 dark:bg-blue-950/30 dark:text-blue-300"
                : c.status === "failed"
                ? "bg-red-50 text-red-700 dark:bg-red-950/30 dark:text-red-300"
                : "bg-amber-50 text-amber-700 dark:bg-amber-950/30 dark:text-amber-300";
            return (
              <Card
                key={c.id}
                className="border relative cursor-pointer transition-colors hover:bg-muted/40"
                role="button"
                tabIndex={0}
                onClick={() => router.push(`/dashboard/campanhas/${c.id}`)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    router.push(`/dashboard/campanhas/${c.id}`);
                  }
                }}
              >
                <CardContent className="px-4">
                  <Badge
                    className={`absolute top-3 right-3 ${statusClass}`}
                    variant="outline"
                  >
                    {statusLabel}
                  </Badge>
                  <div className="flex items-start gap-3">
                    <div className="min-w-0 w-full">
                      <h3 className="font-semibold truncate">{c.name}</h3>
                      <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          <span>
                            Início:{" "}
                            <span className="font-medium text-foreground">
                              {formatDateTime(c.startedAt)}
                            </span>
                          </span>
                        </div>
                        <span className="opacity-60">|</span>
                        <div className="flex items-center gap-1">
                          {c.status === "completed" ? (
                            <CheckCircle2 className="h-3 w-3" />
                          ) : c.status === "failed" ? (
                            <XCircle className="h-3 w-3" />
                          ) : (
                            <Clock className="h-3 w-3" />
                          )}
                          <span>
                            Fim:{" "}
                            <span className="font-medium text-foreground">
                              {formatDateTime(c.completedAt)}
                            </span>
                          </span>
                        </div>
                        <span className="opacity-60">|</span>
                        <div className="flex items-center gap-1">
                          <span>Total destinatários:</span>
                          <span className="font-semibold text-foreground">
                            {c.totalRecipients}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
      </div>

      {/* Paginação */}
      {data && (
        <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4 py-2">
          <div className="text-sm text-muted-foreground">
            Mostrando {(data.page - 1) * data.pageSize + 1} a{" "}
            {Math.min(data.page * data.pageSize, data.total)} de {data.total}{" "}
            resultados
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(1)}
              disabled={page <= 1 || isLoading}
              aria-label="Primeira página"
            >
              <ChevronsLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              disabled={page <= 1 || isLoading}
              aria-label="Página anterior"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm px-2">
              Página {data.page} de {data.totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))}
              disabled={page >= (data.totalPages || 1) || isLoading}
              aria-label="Próxima página"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(data.totalPages)}
              disabled={page >= (data.totalPages || 1) || isLoading}
              aria-label="Última página"
            >
              <ChevronsRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
