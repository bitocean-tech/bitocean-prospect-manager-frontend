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
} from "lucide-react";
import { useGerenciarProspects } from "@/contexts/GerenciarProspectsContext";
import { GerenciarProspectsService } from "@/services/gerenciar-prospects";
import type { Template } from "@/types/gerenciar-prospects";

export default function EnvioWhatsappPage() {
  const router = useRouter();
  const { selectedItems } = useGerenciarProspects();
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [messageContent, setMessageContent] = useState<string>("");

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
          {/* Select de Templates */}
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
        </CardContent>
      </Card>


    </div>
  );
}
