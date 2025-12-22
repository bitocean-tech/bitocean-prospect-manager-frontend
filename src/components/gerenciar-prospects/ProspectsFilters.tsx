"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Filter, RotateCcw, AlertCircle } from "lucide-react";
import { useGerenciarProspects } from "@/contexts/GerenciarProspectsContext";
import { GerenciarProspectsService } from "@/services/gerenciar-prospects";
import type { ListPlacesQuery } from "@/types/gerenciar-prospects";

interface ProspectsFiltersProps {
  onFilter?: (filters: ListPlacesQuery) => void;
  isLoading?: boolean;
}

export function ProspectsFilters({ onFilter, isLoading = false }: ProspectsFiltersProps) {
  const { filters, setFilters, clearFilters } = useGerenciarProspects();
  
  // Estados locais dos campos do formulário (sem debounce)
  const [localState, setLocalState] = useState(filters.state || "");
  const [localCity, setLocalCity] = useState(filters.city || "");
  const [localCategory, setLocalCategory] = useState(filters.googlePrimaryCategoryLike || "");
  const [localNiche, setLocalNiche] = useState(filters.nicheSearched || "all");
  const [localWebsite, setLocalWebsite] = useState(filters.hasWebsite || "all");
  const [localFirstMessage, setLocalFirstMessage] = useState(filters.firstMessageSent || "all");
  const [localExcludeFailed, setLocalExcludeFailed] = useState(filters.excludeFirstMessageFailed || false);

  // Query para carregar nichos
  const {
    data: niches,
    isLoading: isLoadingNiches,
    error: nichesError,
  } = useQuery({
    queryKey: ["niches"],
    queryFn: GerenciarProspectsService.getNiches,
  });

  // Removido: atualização automática de filtros via debounce

  const handleNicheChange = (value: string) => {
    setLocalNiche(value);
  };

  const handleWebsiteChange = (value: string) => {
    setLocalWebsite(value);
  };

  const handleFirstMessageChange = (value: string) => {
    setLocalFirstMessage(value);
  };

  const handleExcludeFailedChange = (checked: boolean) => {
    setLocalExcludeFailed(checked);
  };

  const handleApplyTemplate = (templateName: string) => {
    if (templateName === "Venda de Sites") {
      // Template: Venda de Sites
      setLocalWebsite("false");
      setLocalExcludeFailed(true);
      setLocalFirstMessage("false");
      
      // Aplicar filtros automaticamente
      const appliedFilters: ListPlacesQuery = {
        ...filters,
        page: 1,
        hasWebsite: "false" as 'false',
        excludeFirstMessageFailed: true,
        firstMessageSent: "false" as 'false',
      };

      if (onFilter) {
        onFilter(appliedFilters);
      }
      setFilters(appliedFilters);
    }
  };

  const handleFilter = () => {
    const appliedFilters: ListPlacesQuery = {
      ...filters,
      page: 1,
      state: localState || undefined,
      city: localCity || undefined,
      googlePrimaryCategoryLike: localCategory || undefined,
      nicheSearched: localNiche === "all" ? undefined : localNiche,
      hasWebsite: localWebsite === "all" ? undefined : (localWebsite as 'true' | 'false'),
      firstMessageSent: localFirstMessage === "all" ? undefined : (localFirstMessage as 'true' | 'false'),
      excludeFirstMessageFailed: localExcludeFailed || undefined,
    };

    if (onFilter) {
      onFilter(appliedFilters);
    }
    setFilters(appliedFilters);
  };

  const handleClear = () => {
    setLocalState("");
    setLocalCity("");
    setLocalCategory("");
    setLocalNiche("all");
    setLocalWebsite("all");
    setLocalFirstMessage("all");
    setLocalExcludeFailed(false);
    clearFilters();
  };

  return (
    <div className="space-y-4">
      {/* Templates de Filtros */}
      <div className="flex flex-wrap gap-2 pb-2 border-b">
        <Label className="text-sm font-medium mr-2 self-center">Templates:</Label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => handleApplyTemplate("Venda de Sites")}
          disabled={isLoading}
          className="h-8"
        >
          Venda de Sites
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Estado */}
        <div className="space-y-2">
          <Label htmlFor="state">Estado</Label>
          <Input
            id="state"
            placeholder="Ex: SP, RJ, MG..."
            value={localState}
            onChange={(e) => setLocalState(e.target.value)}
            disabled={isLoading}
            className="w-full"
          />
        </div>

        {/* Cidade */}
        <div className="space-y-2">
          <Label htmlFor="city">Cidade</Label>
          <Input
            id="city"
            placeholder="Ex: São Paulo, Rio de Janeiro..."
            value={localCity}
            onChange={(e) => setLocalCity(e.target.value)}
            disabled={isLoading}
            className="w-full"
          />
        </div>

        {/* Nicho */}
        <div className="space-y-2">
          <Label htmlFor="niche">Nicho</Label>
          {isLoadingNiches ? (
            <Skeleton className="h-10 w-full" />
          ) : (
            <Select
              value={localNiche}
              onValueChange={handleNicheChange}
              disabled={isLoading}
            >
              <SelectTrigger id="niche" className="w-full">
                <SelectValue placeholder="Todos os nichos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os nichos</SelectItem>
                {niches?.map((niche) => (
                  <SelectItem key={niche.id} value={niche.standardizedName}>
                    {niche.displayName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>

        {/* Categoria Google */}
        <div className="space-y-2">
          <Label htmlFor="category">Categoria Google</Label>
          <Input
            id="category"
            placeholder="Ex: restaurant, gym, beauty salon..."
            value={localCategory}
            onChange={(e) => setLocalCategory(e.target.value)}
            disabled={isLoading}
            className="w-full"
          />
        </div>

        {/* Possui Website */}
        <div className="space-y-2">
          <Label htmlFor="website">Possui Website</Label>
          <Select
            value={localWebsite}
            onValueChange={handleWebsiteChange}
            disabled={isLoading}
          >
            <SelectTrigger id="website" className="w-full">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="true">Sim</SelectItem>
              <SelectItem value="false">Não</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Primeira Mensagem Enviada */}
        <div className="space-y-2">
          <Label htmlFor="firstMessage">Primeira Mensagem Enviada</Label>
          <Select
            value={localFirstMessage}
            onValueChange={handleFirstMessageChange}
            disabled={isLoading}
          >
            <SelectTrigger id="firstMessage" className="w-full">
              <SelectValue placeholder="Todos" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="true">Sim</SelectItem>
              <SelectItem value="false">Não</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Excluir Primeira Mensagem Falhada */}
        <div className="space-y-2">
          <div className="flex items-center space-x-2 pt-6">
            <Checkbox
              id="excludeFailed"
              checked={localExcludeFailed}
              onCheckedChange={handleExcludeFailedChange}
              disabled={isLoading}
            />
            <Label
              htmlFor="excludeFailed"
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
            >
              Excluir primeira mensagem falhada
            </Label>
          </div>
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

      {/* Botões de ação */}
      <div className="flex gap-2">
        <Button
          onClick={handleFilter}
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <RotateCcw className="mr-2 h-4 w-4 animate-spin" />
              Filtrando...
            </>
          ) : (
            <>
              <Filter className="mr-2 h-4 w-4" />
              Filtrar
            </>
          )}
        </Button>
        
        <Button
          variant="outline"
          onClick={handleClear}
          disabled={isLoading}
        >
          Limpar
        </Button>
      </div>
    </div>
  );
}