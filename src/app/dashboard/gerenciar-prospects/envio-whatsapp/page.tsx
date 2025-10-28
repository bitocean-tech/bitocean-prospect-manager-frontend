"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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
  CheckCircle,
  MessageCircle,
  Phone,
  Settings,
  User,
  XCircle,
  FileText,
  Clock,
} from "lucide-react";
import { useGerenciarProspects } from "@/contexts/GerenciarProspectsContext";
import { GerenciarProspectsService } from "@/services/gerenciar-prospects";
// Removido componente de loading durante envio
import { formatPhoneForWhatsApp, isValidPhoneNumber } from "@/utils/phone";
import { useSending } from "@/contexts/SendingContext";

// Estados da página
type PageState = "configuration" | "sending" | "completed";

// Interface para resultado de envio
interface SendResult {
  success: boolean;
  contact: {
    id: string;
    displayName: string;
    phone: string;
    normalizedPhoneE164?: string;
    nationalPhoneNumber?: string;
  };
  error?: string;
}

export default function EnvioWhatsappPage() {
  const router = useRouter();
  const { selectedItems } = useGerenciarProspects();
  const {
    startSending,
    stopSending,
    isActive,
    isWaiting: globalIsWaiting,
    isSending: globalIsSending,
    currentStep: globalCurrentStep,
    successCount: globalSuccessCount,
    failureCount: globalFailureCount,
    currentContactIndex: globalCurrentContactIndex,
    totalContacts,
    countdown: globalCountdown,
    sendResults: globalSendResults,
    completed,
    currentContact,
  } = useSending();
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [messageContent, setMessageContent] = useState<string>("");
  const [sendInterval, setSendInterval] = useState<string>("");
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);

  // Estados do envio
  const [pageState, setPageState] = useState<PageState>("configuration");

  // Derivar estado de visualização priorizando configuração quando há seleção e nenhum envio ativo
  const hasActiveGlobal = isActive || globalIsWaiting || globalIsSending;
  const hasSelection = selectedItems.length > 0;
  const viewState: PageState = hasActiveGlobal
    ? "sending"
    : completed && !hasSelection
    ? "completed"
    : pageState;

  const formatTime = (seconds: number): string => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  // Buscar templates usando React Query
  const {
    data: templates = [],
    isLoading: isLoadingTemplates,
    error: templatesError,
  } = useQuery({
    queryKey: ["templates"],
    queryFn: GerenciarProspectsService.getTemplates,
  });

  const handleGoBack = () => {
    router.push("/dashboard/gerenciar-prospects");
  };

  const handleTemplateChange = (templateId: string) => {
    setSelectedTemplate(templateId);
    const template = templates.find((t) => t.id === templateId);
    if (template) {
      setMessageContent(template.content);
    }
  };

  // Filtrar contatos com telefone válido
  const validContacts = useMemo(() => {
    return selectedItems.filter((item) => {
      const phone = item.normalizedPhoneE164 || item.nationalPhoneNumber;
      return !!phone && isValidPhoneNumber(phone);
    });
  }, [selectedItems]);

  const progress = validContacts.length
    ? Math.min(
        100,
        Math.round(
          ((globalSuccessCount + globalFailureCount) / validContacts.length) *
            100
        )
      )
    : 0;
  // Base de contatos para cálculo de progresso: prioriza estado global (totalContacts)
  const contactsBaseline = totalContacts || validContacts.length;
  const globalProgress = contactsBaseline
    ? Math.min(
        100,
        Math.round(
          ((globalSuccessCount + globalFailureCount) / contactsBaseline) * 100
        )
      )
    : 0;

  // Função para lidar com o envio de mensagens
  const handleSendMessages = () => {
    if (!messageContent || !sendInterval) return;

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
    setPageState("sending");
    const intervalSeconds = parseInt(sendInterval) || 0;
    // dispara envio global; conclusão será refletida via "completed"
    startSending(selectedItems, messageContent, intervalSeconds).catch(() => {
      // falhas são tratadas no provider; mantemos a página em sending/feedback
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
  if (
    selectedItems.length === 0 &&
    !(isActive || globalIsWaiting || globalIsSending)
  ) {
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

      {/* Estado de Envio - Texto com contagem e detalhes do próximo contato */}
      {viewState === "sending" && (
        <Card className="mb-6">
          <CardContent className="space-y-4 py-6">
            <div className="flex flex-wrap items-center gap-3 justify-between">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5 text-primary" />
                <span className="font-semibold">Envio em andamento</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Processados:{" "}
                {Math.min(
                  globalSuccessCount + globalFailureCount,
                  contactsBaseline
                )}{" "}
                / {contactsBaseline}
              </div>
              <div className="flex-1" />
              <Button size="sm" variant="outline" onClick={stopSending}>
                Interromper Envio
              </Button>
            </div>

            {/* Barra de progresso */}
            <div className="space-y-2">
              <div className="w-full bg-secondary/50 rounded-full h-2 overflow-hidden">
                <div
                  className="bg-gradient-to-r from-green-600 to-green-500 dark:from-green-500 dark:to-green-400 h-2 rounded-full transition-all duration-700 ease-out shadow-sm"
                  style={{ width: `${globalProgress}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground font-medium">
                <span>Progresso</span>
                <span>{Math.round(globalProgress)}%</span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="bg-green-50 dark:bg-green-950/30 p-3 rounded-md border border-green-200 dark:border-green-800">
                <div className="flex items-center gap-2 justify-center">
                  <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                  <span className="text-sm font-medium text-green-800 dark:text-green-200">
                    Sucessos
                  </span>
                </div>
                <p className="text-2xl font-bold text-green-700 dark:text-green-300 mt-1 text-center">
                  {globalSuccessCount}
                </p>
              </div>
              <div className="bg-red-50 dark:bg-red-950/30 p-3 rounded-md border border-red-200 dark:border-red-800">
                <div className="flex items-center gap-2 justify-center">
                  <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                  <span className="text-sm font-medium text-red-800 dark:text-red-200">
                    Falhas
                  </span>
                </div>
                <p className="text-2xl font-bold text-red-700 dark:text-red-300 mt-1 text-center">
                  {globalFailureCount}
                </p>
              </div>
              <div className="bg-blue-50 dark:bg-blue-950/30 p-3 rounded-md border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-2 justify-center">
                  <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  <span className="text-sm font-medium text-blue-800 dark:text-blue-200">
                    Pendentes
                  </span>
                </div>
                <p className="text-2xl font-bold text-blue-700 dark:text-blue-300 mt-1 text-center">
                  {Math.max(
                    contactsBaseline -
                      (globalSuccessCount + globalFailureCount),
                    0
                  )}
                </p>
              </div>
            </div>

            {/* Próximo contato detalhado */}
            {currentContact && (
              <div className="bg-muted/30 dark:bg-muted/20 p-4 rounded-md border">
                <p className="text-sm text-muted-foreground mb-1">
                  Próximo contato:
                </p>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <p className="font-semibold">
                      {currentContact.displayName} (
                      {Math.min(
                        globalCurrentContactIndex + 1,
                        contactsBaseline
                      )}
                      /{contactsBaseline})
                    </p>
                    <p className="text-sm text-muted-foreground flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      {formatPhoneForWhatsApp(
                        currentContact.normalizedPhoneE164 ||
                          currentContact.nationalPhoneNumber ||
                          ""
                      ) ||
                        currentContact.normalizedPhoneE164 ||
                        currentContact.nationalPhoneNumber ||
                        "Sem telefone"}
                    </p>
                  </div>
                  {currentContact.googlePlaceId && (
                    <p className="text-xs text-muted-foreground">
                      Google Place ID: {currentContact.googlePlaceId}
                    </p>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  {globalCurrentStep}
                </p>
                {globalIsWaiting && (
                  <div className="mt-2 flex items-center gap-2">
                    <Clock className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-xs text-blue-700 dark:text-blue-300">
                      Próximo envio em
                    </span>
                    <span className="text-base font-mono font-bold text-blue-700 dark:text-blue-300 tracking-wider">
                      {formatTime(globalCountdown)}
                    </span>
                  </div>
                )}
                {globalIsSending && (
                  <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                    Enviando mensagem...
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Estado de Finalizado - Cards de Resumo */}
      {viewState === "completed" && (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-2">Envio Finalizado</h2>
            <p className="text-muted-foreground">
              Processo de envio de mensagens WhatsApp concluído
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Card de Sucessos */}
            <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950/30">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-green-800 dark:text-green-200">
                  <CheckCircle className="h-5 w-5" />
                  Mensagens Enviadas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-700 dark:text-green-300 mb-2">
                  {globalSuccessCount}
                </div>
                <p className="text-sm text-green-600 dark:text-green-400">
                  {globalSuccessCount === 1
                    ? "mensagem enviada"
                    : "mensagens enviadas"}{" "}
                  com sucesso
                </p>
              </CardContent>
            </Card>

            {/* Card de Falhas */}
            <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950/30">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-red-800 dark:text-red-200">
                  <XCircle className="h-5 w-5" />
                  Falhas no Envio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-700 dark:text-red-300 mb-2">
                  {globalFailureCount}
                </div>
                <p className="text-sm text-red-600 dark:text-red-400">
                  {globalFailureCount === 1
                    ? "mensagem falhou"
                    : "mensagens falharam"}{" "}
                  no envio
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Detalhes dos Resultados (opcional) */}
          {globalSendResults.length > 0 && (
            <Card className="mt-6 ">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Detalhes do Envio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-90 overflow-y-auto">
                  {globalSendResults.map((result, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        result.success
                          ? "bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800"
                          : "bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {result.success ? (
                          <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                        )}
                        <div>
                          <p className="font-medium text-sm">
                            {result.contact.displayName}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {result.contact.normalizedPhoneE164 ||
                              result.contact.nationalPhoneNumber}
                          </p>
                        </div>
                      </div>
                      {!result.success && result.error && (
                        <Badge variant="destructive" className="text-xs">
                          Erro
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Card com contador de selecionados - apenas no estado de configuração */}
      {viewState === "configuration" && (
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
                              <h4 className="font-medium">
                                {item.displayName}
                              </h4>
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
                            <Badge variant="outline">
                              {item.nicheSearched}
                            </Badge>
                            {!item.normalizedPhoneE164 &&
                              !item.nationalPhoneNumber && (
                                <Badge variant="destructive">
                                  Sem telefone
                                </Badge>
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

          {/* Card de Configurar Mensagem - apenas no estado de configuração */}
          <Card className="mb-6">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Configurar Mensagem
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Select de Templates e Intervalo na mesma linha */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="template-select">Template de Mensagem</Label>
                  {templatesError && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Erro ao carregar templates. Tente novamente.
                      </AlertDescription>
                    </Alert>
                  )}
                  <Select
                    value={selectedTemplate}
                    onValueChange={handleTemplateChange}
                    disabled={isLoadingTemplates}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um modelo" />
                    </SelectTrigger>
                    <SelectContent>
                      {templates.map((template) => (
                        <SelectItem key={template.id} value={template.id}>
                          {template.title}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="send-interval">Intervalo entre envios</Label>
                  <Select value={sendInterval} onValueChange={setSendInterval}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o intervalo" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="4">4 segundos</SelectItem>
                      <SelectItem value="8">8 segundos</SelectItem>
                      <SelectItem value="10">10 segundos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Textarea para a mensagem */}
              <div className="space-y-2">
                <Label htmlFor="message-content">Mensagem</Label>
                <Textarea
                  id="message-content"
                  placeholder="Digite sua mensagem aqui..."
                  value={messageContent}
                  onChange={(e) => setMessageContent(e.target.value)}
                  rows={6}
                  className="resize-none"
                />
                <p className="text-sm text-muted-foreground">
                  Você pode editar livremente a mensagem após selecionar um
                  template.
                </p>
              </div>

              {/* Botão de Envio WhatsApp */}
              <Button
                onClick={handleSendMessages}
                disabled={!messageContent || !sendInterval}
                className="w-full bg-green-600 hover:bg-green-700 text-white"
              >
                <MessageCircle className="mr-2 h-4 w-4" />
                Enviar para Selecionados
              </Button>
            </CardContent>
          </Card>
        </>
      )}

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
            {/* Prévia da Mensagem */}
            <div className="space-y-2">
              <h4 className="font-medium text-sm">Mensagem:</h4>
              <div className="bg-muted p-3 rounded-md border max-h-40 overflow-y-auto">
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {messageContent}
                </p>
              </div>
            </div>

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
                      {sendInterval} segundos
                    </span>
                  </div>
                  {selectedTemplate && (
                    <div className="flex justify-between text-sm">
                      <span className="text-blue-700 dark:text-blue-300">
                        Template:
                      </span>
                      <span className="font-medium text-blue-800 dark:text-blue-200">
                        {templates.find((t) => t.id === selectedTemplate)
                          ?.title || "Personalizado"}
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
