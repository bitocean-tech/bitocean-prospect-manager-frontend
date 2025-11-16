"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertCircle,
  ArrowLeft,
  MessageCircle,
  Phone,
  Settings,
  User,
} from "lucide-react";
import { useGerenciarProspects } from "@/contexts/GerenciarProspectsContext";
import { GerenciarProspectsService } from "@/services/gerenciar-prospects";
import { isValidPhoneNumber } from "@/utils/phone";

export default function EnvioWhatsappPage() {
  const router = useRouter();
  const { selectedItems } = useGerenciarProspects();
  const [selectedMessageTypeId, setSelectedMessageTypeId] =
    useState<string>("");
  const [sendIntervalKey, setSendIntervalKey] = useState<string>("");
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);

  // Message Types
  const {
    data: messageTypes = [],
    isLoading: isLoadingMessageTypes,
    error: messageTypesError,
  } = useQuery({
    queryKey: ["messageTypes"],
    queryFn: GerenciarProspectsService.getMessageTypes,
  });

  // Templates por tipo (preview)
  const {
    data: templatesByType = [],
    isFetching: isFetchingTemplatesByType,
    error: templatesByTypeError,
  } = useQuery({
    queryKey: ["templatesByType", selectedMessageTypeId],
    queryFn: () =>
      selectedMessageTypeId
        ? GerenciarProspectsService.getTemplatesByMessageType(
            selectedMessageTypeId
          )
        : Promise.resolve([]),
    enabled: !!selectedMessageTypeId,
  });

  // Opções de intervalo (range min/max)
  const { data: intervalOptions = [] } = useQuery({
    queryKey: ["sendIntervalOptions"],
    queryFn: GerenciarProspectsService.getSendIntervalOptions,
  });

  const handleGoBack = () => {
    router.push("/dashboard/gerenciar-prospects");
  };

  const handleMessageTypeChange = (messageTypeId: string) => {
    setSelectedMessageTypeId(messageTypeId);
  };

  // Função para lidar com o envio de mensagens
  const handleSendMessages = () => {
    if (!sendIntervalKey) return;

    const contactsWithPhone = selectedItems.filter(
      (item) => item.normalizedPhoneE164 || item.nationalPhoneNumber
    );

    if (contactsWithPhone.length === 0) {
      alert("Nenhum contato com telefone válido encontrado.");
      return;
    }

    setIsConfirmModalOpen(true);
  };

  const handleConfirmSend = () => {
    setIsConfirmModalOpen(false);
    // Por enquanto apenas loga os dados selecionados
    // (futuro: criar campanha e redirecionar para tela de acompanhamento)
    console.log({
      selectedItems,
      selectedMessageTypeId,
      sendIntervalKey,
    });
  };

  // Validação de telefone utilizando utilitário compartilhado

  // Calcular estatísticas dos contatos
  const contactsWithPhone = selectedItems.filter((item) => {
    const phone = item.normalizedPhoneE164 || item.nationalPhoneNumber;
    return isValidPhoneNumber(phone);
  });
  const contactsWithoutPhone = selectedItems.filter((item) => {
    const phone = item.normalizedPhoneE164 || item.nationalPhoneNumber;
    return !isValidPhoneNumber(phone);
  });

  // Se não há itens selecionados, exibe estado vazio
  // Se não há itens selecionados E nenhum envio está ativo/aguardando, exibe estado vazio
  if (selectedItems.length === 0 && true) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button variant="ghost" onClick={handleGoBack} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar para Gerenciar Prospects
          </Button>

          <div className="flex items-center gap-3 mb-2">
            <MessageCircle className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold">Envio de Mensagens WhatsApp</h1>
          </div>
          <p className="text-muted-foreground">
            Envie mensagens em lote para os prospects selecionados.
          </p>
        </div>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Nenhum prospect foi selecionado. Volte para a tela de gerenciar
            prospects e selecione os contatos que deseja enviar mensagens.
          </AlertDescription>
        </Alert>

        <div className="mt-6">
          <Button onClick={handleGoBack}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Voltar e Selecionar Prospects
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <Button variant="ghost" onClick={handleGoBack} className="mb-4">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para Gerenciar Prospects
        </Button>

        <div className="flex items-center gap-3 mb-2">
          <MessageCircle className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Envio de Mensagens WhatsApp</h1>
        </div>
        <p className="text-muted-foreground">
          Envie mensagens em lote para os prospects selecionados.
        </p>
      </div>

      <>
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Prospects Selecionados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4">
              <Dialog>
                <DialogTrigger asChild>
                  <Badge
                    variant="secondary"
                    className="text-lg px-4 py-2 cursor-pointer hover:bg-secondary/80 transition-colors"
                  >
                    {selectedItems.length} contato
                    {selectedItems.length !== 1 ? "s" : ""} selecionado
                    {selectedItems.length !== 1 ? "s" : ""}
                  </Badge>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[90vw] md:max-w-6xl max-h-[70vh] overflow-y-auto bg-card">
                  <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                      <User className="h-5 w-5" />
                      Contatos Selecionados ({selectedItems.length})
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-1 mt-4">
                    {selectedItems.map((item, index) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-4 border rounded-lg bg-background"
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
                            <span className="text-sm font-medium text-primary">
                              {index + 1}
                            </span>
                          </div>
                          <div>
                            <h4 className="font-medium">{item.displayName}</h4>
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              {(item.normalizedPhoneE164 ||
                                item.nationalPhoneNumber) && (
                                <div className="flex items-center gap-1">
                                  <Phone className="h-3 w-3" />
                                  <span>
                                    {item.normalizedPhoneE164 ||
                                      item.nationalPhoneNumber}
                                  </span>
                                </div>
                              )}
                              {item.city && item.state && (
                                <span>
                                  {item.city}, {item.state}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{item.nicheSearched}</Badge>
                          {!item.normalizedPhoneE164 &&
                            !item.nationalPhoneNumber && (
                              <Badge variant="destructive">Sem telefone</Badge>
                            )}
                        </div>
                      </div>
                    ))}
                  </div>
                </DialogContent>
              </Dialog>
              <p className="text-muted-foreground">
                Pronto para envio de mensagens WhatsApp
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Configurar Mensagem
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="message-type-select">Tipo de Mensagem</Label>
                {messageTypesError && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Erro ao carregar tipos. Tente novamente.
                    </AlertDescription>
                  </Alert>
                )}
                <Select
                  value={selectedMessageTypeId}
                  onValueChange={handleMessageTypeChange}
                  disabled={isLoadingMessageTypes}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione um tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {messageTypes.map((mt) => (
                      <SelectItem key={mt.id} value={mt.id}>
                        {mt.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="send-interval">Intervalo entre envios</Label>
                <Select
                  value={sendIntervalKey}
                  onValueChange={setSendIntervalKey}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione o intervalo" />
                  </SelectTrigger>
                  <SelectContent>
                    {intervalOptions.map((opt, idx) => (
                      <SelectItem key={idx} value={`${opt.min}-${opt.max}`}>
                        {opt.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              onClick={handleSendMessages}
              disabled={!sendIntervalKey || selectedItems.length === 0}
              className="w-full bg-green-600 hover:bg-green-700 text-white"
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              Enviar para Selecionados
            </Button>
          </CardContent>
        </Card>

        {/* Lista de templates (preview somente leitura) */}
        {selectedMessageTypeId && (
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Variações de Mensagem</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {templatesByTypeError && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Erro ao carregar variações de mensagem.
                  </AlertDescription>
                </Alert>
              )}
              {!isFetchingTemplatesByType && templatesByType.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Nenhuma variação encontrada para este tipo.
                </p>
              )}
              {templatesByType.map((tpl) => (
                <div
                  key={tpl.id}
                  className="p-3 border rounded-md bg-muted/30 space-y-1"
                >
                  <div className="text-sm font-medium">{tpl.title}</div>
                  <div className="text-sm text-muted-foreground whitespace-pre-wrap">
                    {tpl.content}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        )}
      </>

      {/* Modal de Confirmação */}
      <Dialog open={isConfirmModalOpen} onOpenChange={setIsConfirmModalOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
              Confirmar Envio WhatsApp
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Estatísticas dos Contatos */}
            <div className="space-y-3">
              <h4 className="font-medium text-sm">Resumo do Envio:</h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="bg-green-50 dark:bg-green-950/30 p-3 rounded-md border border-green-200 dark:border-green-800">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-green-600 dark:text-green-400" />
                    <span className="text-sm font-medium text-green-800 dark:text-green-200">
                      Serão Enviados
                    </span>
                  </div>
                  <p className="text-lg font-bold text-green-700 dark:text-green-300 mt-1">
                    {contactsWithPhone.length}
                  </p>
                  <p className="text-xs text-green-600 dark:text-green-400">
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
                    {contactsWithoutPhone.length}
                  </p>
                  <p className="text-xs text-orange-600 dark:text-orange-400">
                    sem telefone válido
                  </p>
                </div>
              </div>

              {/* Informações Adicionais */}
              <div className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded-md border border-blue-200 dark:border-blue-800">
                <div className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-700 dark:text-blue-300">
                      Total selecionado:
                    </span>
                    <span className="font-medium text-blue-800 dark:text-blue-200">
                      {selectedItems.length}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-700 dark:text-blue-300">
                      Intervalo:
                    </span>
                    <span className="font-medium text-blue-800 dark:text-blue-200">
                      {
                        intervalOptions.find(
                          (o) => `${o.min}-${o.max}` === sendIntervalKey
                        )?.name
                      }
                    </span>
                  </div>
                  {selectedMessageTypeId && (
                    <div className="flex justify-between text-sm">
                      <span className="text-blue-700 dark:text-blue-300">
                        Tipo:
                      </span>
                      <span className="font-medium text-blue-800 dark:text-blue-200">
                        {
                          messageTypes.find(
                            (t) => t.id === selectedMessageTypeId
                          )?.name
                        }
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <Button
                variant="outline"
                onClick={() => setIsConfirmModalOpen(false)}
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button
                onClick={handleConfirmSend}
                className="flex-1 bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600 text-white"
                disabled={contactsWithPhone.length === 0}
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Confirmar Envio
              </Button>
            </div>

            {/* Aviso se não há contatos válidos */}
            {contactsWithPhone.length === 0 && (
              <Alert className="border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950/30">
                <AlertCircle className="h-4 w-4 text-orange-600 dark:text-orange-400" />
                <AlertDescription className="text-orange-800 dark:text-orange-200">
                  Nenhum contato possui número de telefone válido para envio.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
