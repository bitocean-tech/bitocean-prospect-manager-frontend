"use client";

import { useState } from "react";
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
  ArrowLeft,
  MessageSquare,
  Phone,
  User,
  AlertCircle,
  Settings,
  MessageCircle,
} from "lucide-react";
import { useGerenciarProspects } from "@/contexts/GerenciarProspectsContext";
import { GerenciarProspectsService } from "@/services/gerenciar-prospects";
import type { Template } from "@/types/gerenciar-prospects";

export default function EnvioWhatsappPage() {
  const router = useRouter();
  const { selectedItems } = useGerenciarProspects();
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [messageContent, setMessageContent] = useState<string>("");
  const [sendInterval, setSendInterval] = useState<string>("");
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);

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

  const handleSendMessages = () => {
    setIsConfirmModalOpen(true);
  };

  const handleConfirmSend = () => {
    console.log("=== DADOS DO ENVIO ===");
    console.log("Prospects selecionados:", selectedItems.length);
    console.log("Mensagem:", messageContent);
    console.log("Intervalo entre envios:", sendInterval, "segundos");
    console.log("Template usado:", selectedTemplate || "Nenhum");
    console.log("Dados dos prospects:", selectedItems);
    console.log("=====================");
    setIsConfirmModalOpen(false);
  };

  // Função para verificar se um número de telefone é válido
  const isValidPhoneNumber = (phone: string | null | undefined): boolean => {
    if (!phone) return false;
    // Remove espaços, parênteses, hífens e outros caracteres especiais
    const cleanPhone = phone.replace(/[\s\(\)\-\+]/g, '');
    // Verifica se tem pelo menos 10 dígitos (formato brasileiro mínimo)
    return /^\d{10,}$/.test(cleanPhone);
  };

  // Calcular estatísticas dos contatos
  const contactsWithPhone = selectedItems.filter(item => isValidPhoneNumber(item.nationalPhoneNumber));
  const contactsWithoutPhone = selectedItems.filter(item => !isValidPhoneNumber(item.nationalPhoneNumber));



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
            <MessageSquare className="h-8 w-8 text-primary" />
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
          <MessageSquare className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Envio de Mensagens WhatsApp</h1>
        </div>
        <p className="text-muted-foreground">
          Envie mensagens em lote para os prospects selecionados.
        </p>
      </div>

      {/* Card com contador de selecionados */}
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

      {/* Card de Configurar Mensagem */}
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
              Você pode editar livremente a mensagem após selecionar um template.
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
                    <span className="text-blue-700 dark:text-blue-300">Total selecionado:</span>
                    <span className="font-medium text-blue-800 dark:text-blue-200">{selectedItems.length}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-blue-700 dark:text-blue-300">Intervalo:</span>
                    <span className="font-medium text-blue-800 dark:text-blue-200">{sendInterval} segundos</span>
                  </div>
                  {selectedTemplate && (
                    <div className="flex justify-between text-sm">
                      <span className="text-blue-700 dark:text-blue-300">Template:</span>
                      <span className="font-medium text-blue-800 dark:text-blue-200">
                        {templates.find(t => t.id === selectedTemplate)?.title || 'Personalizado'}
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
