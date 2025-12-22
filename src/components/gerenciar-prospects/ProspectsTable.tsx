"use client";

import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { XCircle } from "lucide-react";
import { useGerenciarProspects } from "@/contexts/GerenciarProspectsContext";
import type { PlaceItem } from "@/types/gerenciar-prospects";

interface ProspectsTableProps {
  data: PlaceItem[];
  isLoading?: boolean;
  onSelectAll?: (items: PlaceItem[]) => void;
}

export function ProspectsTable({
  data,
  isLoading = false,
  onSelectAll,
}: ProspectsTableProps) {
  const {
    selectedItems,
    toggleSelection,
    isSelected,
    selectAll,
    clearSelection,
  } = useGerenciarProspects();

  const handleSelectAll = (checked: boolean | "indeterminate") => {
    const isChecked = checked === true;
    if (isChecked) {
      if (onSelectAll) {
        onSelectAll(data);
      } else {
        // Fallback para selecionar todos via contexto quando nenhuma função externa é passada
        selectAll(data);
      }
    } else {
      // Ao desmarcar, limpar todas as seleções para refletir o estado do header checkbox
      clearSelection();
    }
  };

  const allCurrentPageSelected =
    data.length > 0 && data.every((item) => isSelected(item));
  const someCurrentPageSelected = data.some((item) => isSelected(item));

  if (isLoading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, index) => (
          <div key={index} className="flex items-center space-x-4">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 flex-1" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-16" />
          </div>
        ))}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-muted rounded-full flex items-center justify-center mb-4">
          <XCircle className="h-12 w-12 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">
          Nenhum resultado encontrado
        </h3>
        <p className="text-muted-foreground mb-4">
          Tente ajustar os filtros para encontrar prospects.
        </p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table className="table-fixed w-full">
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={
                  allCurrentPageSelected
                    ? true
                    : someCurrentPageSelected
                    ? "indeterminate"
                    : false
                }
                onCheckedChange={(checked) => handleSelectAll(checked)}
                aria-label="Selecionar todos da página atual"
              />
            </TableHead>
            <TableHead className="w-[320px]">Nome do Negócio</TableHead>
            <TableHead>Categoria</TableHead>
            <TableHead>Cidade/Estado</TableHead>
            <TableHead>Telefone</TableHead>
            <TableHead>Website</TableHead>
            <TableHead>Primeira Mensagem</TableHead>
            <TableHead>Primeira Mensagem Falhada</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((item) => (
            <TableRow
              key={item.id}
              className={isSelected(item) ? "bg-muted/50" : ""}
            >
              <TableCell>
                <Checkbox
                  checked={isSelected(item)}
                  onCheckedChange={() => toggleSelection(item)}
                  aria-label={`Selecionar ${item.displayName}`}
                />
              </TableCell>
              <TableCell className="font-medium w-[320px] overflow-hidden">
                <span className="block truncate" title={item.displayName}>
                  {item.displayName}
                </span>
              </TableCell>
              <TableCell>{item.googlePrimaryCategory || "-"}</TableCell>
              <TableCell>
                {item.city && item.state
                  ? `${item.city}, ${item.state}`
                  : item.city || item.state || "-"}
              </TableCell>
              <TableCell>{item.nationalPhoneNumber || "-"}</TableCell>
              <TableCell>
                {item.websiteUri ? (
                  <a
                    href={item.websiteUri}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Abrir website"
                    className="inline-block"
                    title={item.websiteUri}
                  >
                    <Badge
                      variant="secondary"
                      className="rounded-full px-2 py-0.5 text-xs bg-muted text-muted-foreground hover:bg-muted/80"
                    >
                      Abrir
                    </Badge>
                  </a>
                ) : (
                  "-"
                )}
              </TableCell>
              <TableCell>
                {item.firstMessageSent ? (
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-800"
                  >
                    Enviada
                  </Badge>
                ) : (
                  <Badge variant="outline">Não enviada</Badge>
                )}
              </TableCell>
              <TableCell>
                {item.firstMessageFailed ? (
                  <Badge
                    variant="secondary"
                    className="bg-red-100 text-red-800"
                  >
                    Falhou
                  </Badge>
                ) : (
                  <Badge variant="outline">Sem falha</Badge>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
