"use client";

import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, MessageSquare, Phone, User, AlertCircle } from "lucide-react";
import { useGerenciarProspects } from "@/contexts/GerenciarProspectsContext";

export default function EnvioWhatsappPage() {
  const router = useRouter();
  const { selectedItems } = useGerenciarProspects();

  const handleGoBack = () => {
    router.push("/dashboard/gerenciar-prospects");
  };

  // Se não há itens selecionados, exibe estado vazio
  if (selectedItems.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={handleGoBack}
            className="mb-4"
          >
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
            Nenhum prospect foi selecionado. Volte para a tela de gerenciar prospects e selecione os contatos que deseja enviar mensagens.
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
        <Button
          variant="ghost"
          onClick={handleGoBack}
          className="mb-4"
        >
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
            <Badge variant="secondary" className="text-lg px-4 py-2">
              {selectedItems.length} contato{selectedItems.length !== 1 ? "s" : ""} selecionado{selectedItems.length !== 1 ? "s" : ""}
            </Badge>
            <p className="text-muted-foreground">
              Pronto para envio de mensagens WhatsApp
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Lista dos prospects selecionados */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Contatos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {selectedItems.map((item, index) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-4 border rounded-lg"
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
                      {(item.normalizedPhoneE164 || item.nationalPhoneNumber) && (
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          <span>
                            {item.normalizedPhoneE164 || item.nationalPhoneNumber}
                          </span>
                        </div>
                      )}
                      {item.city && item.state && (
                        <span>{item.city}, {item.state}</span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant="outline">
                    {item.nicheSearched}
                  </Badge>
                  {!item.normalizedPhoneE164 && !item.nationalPhoneNumber && (
                    <Badge variant="destructive">
                      Sem telefone
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Debug: Informações do contexto */}
      <Card className="mt-6 border-dashed">
        <CardHeader>
          <CardTitle className="text-sm text-muted-foreground">
            Debug: Dados do Contexto
          </CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="text-xs bg-muted p-4 rounded overflow-auto">
            {JSON.stringify(
              {
                totalSelected: selectedItems.length,
                firstItem: selectedItems[0] || null,
                hasPhoneNumbers: selectedItems.filter(
                  (item) => item.normalizedPhoneE164 || item.nationalPhoneNumber
                ).length,
              },
              null,
              2
            )}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
}