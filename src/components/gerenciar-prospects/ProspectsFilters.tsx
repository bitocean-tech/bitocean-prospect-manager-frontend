"use client";

import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

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
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Filter, RotateCcw, AlertCircle } from "lucide-react";
import { useGerenciarProspects } from "@/contexts/GerenciarProspectsContext";
import { GerenciarProspectsService } from "@/services/gerenciar-prospects";
import { useDebounce } from "@/hooks/useDebounce";
import type { ListPlacesQuery } from "@/types/gerenciar-prospects";

interface ProspectsFiltersProps {
  onFilter?: (filters: ListPlacesQuery) => void;
  isLoading?: boolean;
}

export function ProspectsFilters({ onFilter, isLoading = false }: ProspectsFiltersProps) {
  const { filters, setFilters, clearFilters } = useGerenciarProspects();
  
  // Estados locais para inputs com debounce
  const [localState, setLocalState] = useState(filters.state || "");
  const [localCity, setLocalCity] = useState(filters.city || "");
  const [localCategory, setLocalCategory] = useState(filters.googlePrimaryCategoryLike || "");
  
  // Debounced values para inputs de texto
  const debouncedState = useDebounce(localState, 500);
  const debouncedCity = useDebounce(localCity, 500);
  const debouncedCategory = useDebounce(localCategory, 500);

  // Query para carregar nichos
  const {
    data: niches,
    isLoading: isLoadingNiches,
    error: nichesError,
  } = useQuery({
    queryKey: ["niches"],
    queryFn: GerenciarProspectsService.getNiches,
  });

  // Atualiza filtros quando valores debounced mudam
  useEffect(() => {
    const updatedFilters = {
      ...filters,
      state: debouncedState || undefined,
      city: debouncedCity || undefined,
      googlePrimaryCategoryLike: debouncedCategory || undefined,
    };
    setFilters(updatedFilters);
  }, [debouncedState, debouncedCity, debouncedCategory]);

  const handleNicheChange = (value: string) => {
    const updatedFilters = {
      ...filters,
      nicheSearched: value === "all" ? undefined : value,
    };
    setFilters(updatedFilters);
  };

  const handleWebsiteChange = (value: string) => {
    const updatedFilters = {
      ...filters,
      hasWebsite: value === "all" ? undefined : (value as 'true' | 'false'),
    };
    setFilters(updatedFilters);
  };

  const handleFirstMessageChange = (value: string) => {
    const updatedFilters = {
      ...filters,
      firstMessageSent: value === "all" ? undefined : (value as 'true' | 'false'),
    };
    setFilters(updatedFilters);
  };

  const handleFilter = () => {
    // Se onFilter foi fornecido, usa; caso contrário, apenas atualiza filtros
    if (onFilter) {
      onFilter(filters);
    } else {
      setFilters({ ...filters });
    }
  };

  const handleClear = () => {
    setLocalState("");
    setLocalCity("");
    setLocalCategory("");
    clearFilters();
    if (onFilter) {
      onFilter({
        page: 1,
        pageSize: 20,
      });
    } else {
      setFilters({ page: 1, pageSize: 20 });
    }
  };

  return (
    <div className="space-y-4">
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
              value={filters.nicheSearched || "all"}
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
            value={filters.hasWebsite || "all"}
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
            value={filters.firstMessageSent || "all"}
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