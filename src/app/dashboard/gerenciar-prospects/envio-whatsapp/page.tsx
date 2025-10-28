"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useQuery, useMutation } from "@tanstack/react-query";
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
} from "lucide-react";
import { useGerenciarProspects } from "@/contexts/GerenciarProspectsContext";
import { GerenciarProspectsService } from "@/services/gerenciar-prospects";
import { WhatsAppSendingState } from "@/components/envio-whatsapp/WhatsAppSendingState";
import { formatPhoneForWhatsApp, isValidPhoneNumber } from "@/utils/phone";
import type { Template } from "@/types/gerenciar-prospects";

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
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [messageContent, setMessageContent] = useState<string>("");
  const [sendInterval, setSendInterval] = useState<string>("");
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);

  // Estados do envio
  const [pageState, setPageState] = useState<PageState>("configuration");
  const [currentContactIndex, setCurrentContactIndex] = useState<number>(0);
  const [successCount, setSuccessCount] = useState<number>(0);
  const [failureCount, setFailureCount] = useState<number>(0);
  const [isWaiting, setIsWaiting] = useState<boolean>(false);
  const [isSending, setIsSending] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<string>("");
  const [sendResults, setSendResults] = useState<SendResult[]>([]);

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
    startSendingProcess();
  };

  // Função para iniciar o processo de envio
  const startSendingProcess = async () => {
    const validContacts = selectedItems.filter((item) => {
      const phone = item.normalizedPhoneE164 || item.nationalPhoneNumber;
      return isValidPhoneNumber(phone);
    });

    setCurrentStep("Iniciando processo de envio...");

    for (let i = 0; i < validContacts.length; i++) {
      const contact = validContacts[i];
      setCurrentContactIndex(i);

      // Mostrar próximo contato
      setCurrentStep(`Preparando envio para ${contact.displayName}`);

      // Se não é o primeiro, aguardar intervalo
      if (i > 0) {
        setIsWaiting(true);
        await waitForInterval(parseInt(sendInterval));
        setIsWaiting(false);
      }

      // Enviar mensagem
      setIsSending(true);
      setCurrentStep(`Enviando mensagem para ${contact.displayName}`);

      try {
        const phone = formatPhoneForWhatsApp(
          contact.normalizedPhoneE164 || contact.nationalPhoneNumber
        );

        if (!phone) {
          throw new Error("Número de telefone inválido");
        }

        const result = await GerenciarProspectsService.sendWhatsappMessage({
          text: messageContent,
          number: phone,
          googlePlaceId: contact.googlePlaceId,
        });

        const sendResult: SendResult = {
          success: result.success,
          contact: {
            id: contact.id,
            displayName: contact.displayName,
            phone: phone,
          },
          error: result.error,
        };

        setSendResults((prev) => [...prev, sendResult]);

        if (result.success) {
          setSuccessCount((prev) => prev + 1);
        } else {
          setFailureCount((prev) => prev + 1);
        }
      } catch (error) {
        const sendResult: SendResult = {
          success: false,
          contact: {
            id: contact.id,
            displayName: contact.displayName,
            phone:
              contact.normalizedPhoneE164 || contact.nationalPhoneNumber || "",
          },
          error: error instanceof Error ? error.message : "Erro desconhecido",
        };

        setSendResults((prev) => [...prev, sendResult]);
        setFailureCount((prev) => prev + 1);
      }

      setIsSending(false);
    }

    // Finalizar processo
    setPageState("completed");
    setCurrentStep("Processo de envio finalizado");
  };

  // Função para aguardar intervalo
  const waitForInterval = (seconds: number): Promise<void> => {
    return new Promise((resolve) => {
      setTimeout(resolve, seconds * 1000);
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
  if (selectedItems.length === 0) {
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

      {/* Estado de Envio */}
      {pageState === "sending" && (
        <WhatsAppSendingState
          currentContact={
            currentContactIndex < validContacts.length
              ? {
                  displayName: validContacts[currentContactIndex].displayName,
                  id: validContacts[currentContactIndex].id,
                  normalizedPhoneE164:
                    validContacts[currentContactIndex].normalizedPhoneE164 ||
                    undefined,
                  nationalPhoneNumber:
                    validContacts[currentContactIndex].nationalPhoneNumber ||
                    undefined,
                }
              : null
          }
          totalContacts={validContacts.length}
          successCount={successCount}
          failureCount={failureCount}
          intervalSeconds={parseInt(sendInterval)}
          isWaiting={isWaiting}
          isSending={isSending}
          currentStep={currentStep}
        />
      )}

      {/* Estado de Finalizado - Cards de Resumo */}
      {pageState === "completed" && (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold mb-2">Envio Finalizado</h2>
            <p className="text-muted-foreground">
              Processo de envio de mensagens WhatsApp concluído
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Card de Sucessos */}
            <Card className="border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-950">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-300">
                  <CheckCircle className="h-5 w-5" />
                  Mensagens Enviadas
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-700 dark:text-green-300 mb-2">
                  {successCount}
                </div>
                <p className="text-sm text-green-600 dark:text-green-400">
                  {successCount === 1
                    ? "mensagem enviada"
                    : "mensagens enviadas"}{" "}
                  com sucesso
                </p>
              </CardContent>
            </Card>

            {/* Card de Falhas */}
            <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-950">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-red-700 dark:text-red-300">
                  <XCircle className="h-5 w-5" />
                  Falhas no Envio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-red-700 dark:text-red-300 mb-2">
                  {failureCount}
                </div>
                <p className="text-sm text-red-600 dark:text-red-400">
                  {failureCount === 1
                    ? "mensagem falhou"
                    : "mensagens falharam"}{" "}
                  no envio
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Botões de Ação */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              variant="outline"
              onClick={() => {
                setPageState("configuration");
                setCurrentContactIndex(0);
                setSuccessCount(0);
                setFailureCount(0);
                setSendResults([]);
                setCurrentStep("");
              }}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              Voltar para Configuração
            </Button>
            <Button
              onClick={() => {
                setCurrentContactIndex(0);
                setSuccessCount(0);
                setFailureCount(0);
                setSendResults([]);
                setCurrentStep("");
                startSendingProcess();
              }}
              className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white"
            >
              <MessageCircle className="h-4 w-4" />
              Enviar Novamente
            </Button>
          </div>

          {/* Detalhes dos Resultados (opcional) */}
          {sendResults.length > 0 && (
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Detalhes do Envio
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {sendResults.map((result, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-3 rounded-lg border ${
                        result.success
                          ? "bg-green-50 border-green-200 dark:bg-green-950 dark:border-green-800"
                          : "bg-red-50 border-red-200 dark:bg-red-950 dark:border-red-800"
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
      {pageState === "configuration" && (
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
