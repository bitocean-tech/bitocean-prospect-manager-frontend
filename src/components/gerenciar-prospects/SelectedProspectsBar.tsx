"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronDown, MessageSquare, Users } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useGerenciarProspects } from "@/contexts/GerenciarProspectsContext";
import { useRouter } from "next/navigation";
import { CreateExternalCampaignModal } from "./CreateExternalCampaignModal";

export function SelectedProspectsBar() {
  const { selectedItems } = useGerenciarProspects();
  const router = useRouter();
  const [isExternalCampaignModalOpen, setIsExternalCampaignModalOpen] =
    useState(false);

  return (
    <Card className="mb-6 py-4">
      <CardContent>
        <div className="flex items-center justify-between gap-4">
          {/* Informações de seleção */}
          <div className="flex items-center gap-3">
            {selectedItems.length > 0 ? (
              <Badge variant="outline" className="px-4 py-2 ">
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
                  router.push("/dashboard/gerenciar-prospects/envio-whatsapp");
                }}
              >
                <MessageSquare className="h-4 w-4 mr-2" />
                Envio de Mensagem
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setIsExternalCampaignModalOpen(true);
                }}
              >
                <Users className="h-4 w-4 mr-2" />
                Criar Campanha Externa
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>

      {/* Modal de Criação de Campanha Externa */}
      <CreateExternalCampaignModal
        open={isExternalCampaignModalOpen}
        onOpenChange={setIsExternalCampaignModalOpen}
        selectedItems={selectedItems}
      />
    </Card>
  );
}
