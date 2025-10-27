"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { X, MessageSquare, Download, Trash2 } from "lucide-react";
import { useGerenciarProspects } from "@/contexts/GerenciarProspectsContext";

export function SelectedProspectsBar() {
  const { selectedItems, clearSelection } = useGerenciarProspects();

  if (selectedItems.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-background border-t shadow-lg z-50">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          {/* Informações de seleção */}
          <div className="flex items-center gap-3">
            <Badge variant="secondary" className="text-sm">
              {selectedItems.length} prospect{selectedItems.length !== 1 ? 's' : ''} selecionado{selectedItems.length !== 1 ? 's' : ''}
            </Badge>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSelection}
              className="h-8 px-2 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4 mr-1" />
              Limpar seleção
            </Button>
          </div>

          {/* Ações em lote */}
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              className="h-8"
              onClick={() => {
                // TODO: Implementar ação de envio de primeira mensagem em lote
                console.log('Enviar primeira mensagem para:', selectedItems);
              }}
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Enviar Primeira Mensagem
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className="h-8"
              onClick={() => {
                // TODO: Implementar ação de exportação em lote
                console.log('Exportar prospects:', selectedItems);
              }}
            >
              <Download className="h-4 w-4 mr-2" />
              Exportar
            </Button>
            
            <Button
              variant="outline"
              size="sm"
              className="h-8 text-destructive hover:text-destructive"
              onClick={() => {
                // TODO: Implementar ação de exclusão em lote
                console.log('Excluir prospects:', selectedItems);
              }}
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Excluir
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}