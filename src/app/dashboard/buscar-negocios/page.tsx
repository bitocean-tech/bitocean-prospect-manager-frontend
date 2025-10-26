"use client";

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Search,
  Database,
  Plus,
  RotateCcw,
  CheckCircle,
  XCircle,
  Clock,
  AlertCircle,
} from "lucide-react";
import {
  BusinessService,
  type SearchRequest,
} from "@/common/services/businessService";
import type { Niche, SearchResponse } from "@/common/interfaces";

export default function BuscarNegociosPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedNiche, setSelectedNiche] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResponse | null>(
    null
  );

  // Query para carregar nichos
  const {
    data: niches,
    isLoading: isLoadingNiches,
    error: nichesError,
  } = useQuery({
    queryKey: ["niches"],
    queryFn: BusinessService.getNiches,
  });

  // Mutation para busca de negócios
  const searchMutation = useMutation({
    mutationFn: (request: SearchRequest) =>
      BusinessService.searchBusinesses(request),
    onSuccess: (data) => {
      setSearchResults(data);
      toast.success("Busca realizada com sucesso!");
    },
    onError: (error) => {
      console.error("Erro na busca:", error);
      toast.error("Erro ao realizar busca. Tente novamente.");
    },
  });

  const handleSearch = () => {
    if (!searchTerm.trim() || !selectedNiche) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    searchMutation.mutate({
      query: searchTerm.trim(),
      niche: selectedNiche,
    });
  };

  const isFormValid = searchTerm.trim() && selectedNiche;
  const isSearching = searchMutation.isPending;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold">Buscar negócios</h1>
        <p className="text-muted-foreground">
          Pesquise negócios por termo e nicho e visualize o relatório da busca.
        </p>
      </div>

      {/* Formulário de Busca */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Formulário de Busca
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Termo de busca */}
            <div className="space-y-2">
              <Label htmlFor="search-term">Termo de busca *</Label>
              <Input
                id="search-term"
                placeholder="Ex: restaurantes, academias, salões..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={isSearching}
              />
            </div>

            {/* Select de Nicho */}
            <div className="space-y-2">
              <Label htmlFor="niche-select">Nicho *</Label>
              {isLoadingNiches ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Select
                  value={selectedNiche}
                  onValueChange={setSelectedNiche}
                  disabled={isSearching}
                >
                  <SelectTrigger id="niche-select">
                    <SelectValue placeholder="Selecione um nicho" />
                  </SelectTrigger>
                  <SelectContent>
                    {niches?.map((niche) => (
                      <SelectItem key={niche.id} value={niche.standardizedName}>
                        {niche.displayName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          {/* Erro ao carregar nichos */}
          {nichesError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Erro ao carregar nichos. Recarregue a página e tente novamente.
              </AlertDescription>
            </Alert>
          )}

          {/* Botão de busca */}
          <Button
            onClick={handleSearch}
            disabled={!isFormValid || isSearching}
            className="w-full md:w-auto"
          >
            {isSearching ? (
              <>
                <RotateCcw className="mr-2 h-4 w-4 animate-spin" />
                Buscando...
              </>
            ) : (
              <>
                <Search className="mr-2 h-4 w-4" />
                Buscar
              </>
            )}
          </Button>
        </CardContent>
      </Card>

      {/* Cards de Métricas */}
      {isSearching ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        searchResults && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Database className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Total Encontrado
                    </p>
                    <p className="text-2xl font-bold">
                      {searchResults.totalFetched}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Plus className="h-5 w-5 text-green-500" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Novos Salvos
                    </p>
                    <p className="text-2xl font-bold">
                      {searchResults.newSavedCount}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <RotateCcw className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Já Existentes
                    </p>
                    <p className="text-2xl font-bold">
                      {searchResults.alreadyExistingCount}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Enriquecidos
                    </p>
                    <p className="text-2xl font-bold">
                      {searchResults.enrichedCount}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <XCircle className="h-5 w-5 text-red-500" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Falharam
                    </p>
                    <p className="text-2xl font-bold">
                      {searchResults.failedCount}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-yellow-500" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Pendentes
                    </p>
                    <p className="text-2xl font-bold">
                      {searchResults.pendingCount}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )
      )}

      {/* Tabela de Resultados */}
      {isSearching ? (
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-64 w-full" />
          </CardContent>
        </Card>
      ) : (
        searchResults && (
          <Card>
            <CardHeader>
              <CardTitle>Resultados da Busca</CardTitle>
            </CardHeader>
            <CardContent>
              {searchResults.items.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">
                    Nenhum resultado encontrado.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Nome</TableHead>
                        <TableHead>Categoria</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {searchResults.items.map((item) => (
                        <TableRow key={item.googlePlaceId}>
                          <TableCell className="font-medium">
                            {item.displayName}
                          </TableCell>
                          <TableCell>
                            {item.googlePrimaryCategory || "-"}
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">novo</Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        )
      )}
    </div>
  );
}
