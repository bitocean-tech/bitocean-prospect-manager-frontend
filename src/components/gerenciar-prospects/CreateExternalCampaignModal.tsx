"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Phone, Users, XCircle, Loader2 } from "lucide-react";
import { PlaceItem } from "@/types/gerenciar-prospects";
import { GerenciarProspectsService } from "@/services/gerenciar-prospects";

interface CreateExternalCampaignModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedItems: PlaceItem[];
  onConfirm?: () => void;
}

export function CreateExternalCampaignModal({
  open,
  onOpenChange,
  selectedItems,
  onConfirm,
}: CreateExternalCampaignModalProps) {
  const router = useRouter();
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Calcular estatísticas
  const stats = useMemo(() => {
    const contactsWithPhone = selectedItems.filter(
      (item) => item.normalizedPhoneE164 || item.nationalPhoneNumber
    );
    const contactsWithoutPhone = selectedItems.filter(
      (item) => !item.normalizedPhoneE164 && !item.nationalPhoneNumber
    );

    return {
      withPhone: contactsWithPhone.length,
      withoutPhone: contactsWithoutPhone.length,
      total: selectedItems.length,
    };
  }, [selectedItems]);

  const handleConfirm = async () => {
    if (stats.withPhone === 0) return;

    setIsCreating(true);
    setError(null);

    try {
      const placeIds = selectedItems
        .filter(
          (item) => item.normalizedPhoneE164 || item.nationalPhoneNumber
        )
        .map((item) => item.id);

      const response = await GerenciarProspectsService.createExternalCampaign({
        placeIds,
      });

      if (response?.campaignId) {
        // Chamar callback se fornecido
        if (onConfirm) {
          onConfirm();
        }
        
        // Fechar modal e redirecionar
        onOpenChange(false);
        router.push(`/dashboard/campanhas/${response.campaignId}`);
      } else {
        setError("Erro ao criar campanha: resposta inválida");
      }
    } catch (err) {
      console.error("Erro ao criar campanha externa:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Erro ao criar campanha. Tente novamente."
      );
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            Criar Campanha Externa
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Estatísticas dos Contatos */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Resumo da Campanha:</h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded-md border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2">
                  <Phone className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    Serão Adicionados
                  </span>
                </div>
                <p className="text-lg font-bold text-blue-700 dark:text-blue-300 mt-1">
                  {stats.withPhone}
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400">
                  contatos com telefone
                </p>
              </div>

              <div className="bg-orange-50 dark:bg-orange-950/30 p-3 rounded-md border border-orange-200 dark:border-orange-800">
                <div className="flex items-center gap-2">
                  <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                  <span className="text-sm font-medium text-orange-800 dark:text-orange-200">
                    Serão Ignorados
                  </span>
                </div>
                <p className="text-lg font-bold text-orange-700 dark:text-orange-300 mt-1">
                  {stats.withoutPhone}
                </p>
                <p className="text-xs text-orange-600 dark:text-orange-400">
                  sem telefone válido
                </p>
              </div>
            </div>

            {/* Informações Adicionais */}
            <div className="bg-muted/50 p-3 rounded-md border">
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Total selecionado:
                  </span>
                  <span className="font-medium">
                    {stats.total}
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">
                    Tipo de campanha:
                  </span>
                  <span className="font-medium">
                    Externa
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Aviso Informativo */}
          <Alert className="border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30">
            <AlertCircle className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <AlertDescription className="text-blue-800 dark:text-blue-200">
              A campanha externa armazenará os contatos selecionados para envio
              por outras plataformas. Você poderá marcar manualmente quais
              contatos foram enviados posteriormente.
            </AlertDescription>
          </Alert>

          {/* Mensagem de Erro */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Botões de Ação */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              variant="outline"
              onClick={() => {
                setError(null);
                onOpenChange(false);
              }}
              className="flex-1"
              disabled={isCreating}
            >
              Cancelar
            </Button>
            <Button
              onClick={handleConfirm}
              className="flex-1 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white"
              disabled={stats.withPhone === 0 || isCreating}
            >
              {isCreating ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Criando...
                </>
              ) : (
                <>
                  <Users className="mr-2 h-4 w-4" />
                  Confirmar Criação
                </>
              )}
            </Button>
          </div>

          {/* Aviso se não há contatos válidos */}
          {stats.withPhone === 0 && (
            <Alert className="border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/30">
              <XCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
              <AlertDescription className="text-orange-800 dark:text-orange-200">
                Nenhum contato possui número de telefone válido para adicionar
                à campanha.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

