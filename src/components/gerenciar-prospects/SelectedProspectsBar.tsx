"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronDown, MessageSquare } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useGerenciarProspects } from "@/contexts/GerenciarProspectsContext";

export function SelectedProspectsBar() {
  const { selectedItems } = useGerenciarProspects();

  return (
    <Card className="mb-6 py-4">
      <CardContent>
        <div className="flex items-center justify-between gap-4">
          {/* Informações de seleção */}
          <div className="flex items-center gap-3">
            {selectedItems.length > 0 ? (
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {selectedItems.length} prospect
                {selectedItems.length !== 1 ? "s" : ""} selecionado
                {selectedItems.length !== 1 ? "s" : ""}
              </Badge>
            ) : (
              <span className="text-sm text-muted-foreground">
                Nenhum prospect selecionado
              </span>
            )}
          </div>

          {/* Ações em lote */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                disabled={selectedItems.length === 0}
                className="h-8"
              >
                Ações em Lote
                <ChevronDown className="h-4 w-4 ml-2" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => {
                  // TODO: Implementar ação de envio de mensagem em lote
                  console.log("Enviar mensagem para:", selectedItems);
                }}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Envio de Mensagem
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}
