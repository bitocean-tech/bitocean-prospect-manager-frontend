"use client";

import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Users } from "lucide-react";
import { useGerenciarProspects } from "@/contexts/GerenciarProspectsContext";
import { ProspectsFilters } from "@/components/gerenciar-prospects/ProspectsFilters";
import { ProspectsTable } from "@/components/gerenciar-prospects/ProspectsTable";
import { ProspectsPagination } from "@/components/gerenciar-prospects/ProspectsPagination";
import { SelectedProspectsBar } from "@/components/gerenciar-prospects/SelectedProspectsBar";
import { GerenciarProspectsService } from "@/services/gerenciar-prospects";

function GerenciarProspectsContent() {
  const { filters, setFilters, selectAll, clearSelection } =
    useGerenciarProspects();

  // Query para buscar prospects
  const {
    data: placesData,
    isLoading: isLoadingPlaces,
    error: placesError,
    refetch: refetchPlaces,
  } = useQuery({
    queryKey: ["places", filters],
    queryFn: () => GerenciarProspectsService.getPlaces(filters),
    enabled: true,
  });

  const handlePageChange = (page: number) => {
    setFilters({ ...filters, page });
  };

  const handlePageSizeChange = (pageSize: number) => {
    setFilters({ ...filters, pageSize, page: 1 });
  };

  const handleSelectAll = (items: any[]) => {
    selectAll(items);
  };

  if (placesError) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Erro ao carregar prospects:{" "}
            {placesError instanceof Error
              ? placesError.message
              : "Erro desconhecido"}
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Users className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Gerenciar Prospects</h1>
        </div>
        <p className="text-muted-foreground">
          Gerencie e organize seus prospects com filtros avançados e ações em
          lote.
        </p>
      </div>

      {/* Filtros */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Filtros de Busca</CardTitle>
        </CardHeader>
        <CardContent>
          <ProspectsFilters />
        </CardContent>
      </Card>

      {/* Barra de seleção */}
      <SelectedProspectsBar />

      {/* Resultados */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Resultados</span>
            {placesData && placesData.total !== undefined && (
              <span className="text-sm font-normal text-muted-foreground">
                {placesData.total} prospect{placesData.total !== 1 ? "s" : ""}{" "}
                encontrado{placesData.total !== 1 ? "s" : ""}
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ProspectsTable
            data={placesData?.items || []}
            isLoading={isLoadingPlaces}
            onSelectAll={handleSelectAll}
          />

          {placesData && placesData.items && placesData.items.length > 0 && (
            <ProspectsPagination
              data={placesData}
              onPageChange={handlePageChange}
              onPageSizeChange={handlePageSizeChange}
              isLoading={isLoadingPlaces}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default function GerenciarProspectsPage() {
  return <GerenciarProspectsContent />;
}
