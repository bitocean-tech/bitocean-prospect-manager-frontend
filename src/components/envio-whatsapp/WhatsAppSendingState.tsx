"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Loader2,
  MessageCircle,
  Clock,
  Send,
  CheckCircle,
  AlertCircle,
  User,
} from "lucide-react";

interface WhatsAppSendingStateProps {
  className?: string;
  currentContact?: {
    displayName: string;
    id?: string;
    normalizedPhoneE164?: string;
    nationalPhoneNumber?: string;
  } | null;
  totalContacts: number;
  successCount: number;
  failureCount: number;
  intervalSeconds: number;
  isWaiting: boolean;
  isSending: boolean;
  currentStep: string;
  currentContactIndex?: number;
}

// Mapeamento de ícones declarado fora de render para seleção estável
const ICONS = {
  messageCircle: MessageCircle,
  user: User,
  send: Send,
  clock: Clock,
  checkCircle: CheckCircle,
};

const sendingMessages = [
  { text: "Preparando envio...", key: "messageCircle" as const },
  { text: "Formatando números...", key: "user" as const },
  { text: "Enviando mensagem...", key: "send" as const },
  { text: "Aguardando intervalo...", key: "clock" as const },
  { text: "Processando próximo contato...", key: "checkCircle" as const },
];

export function WhatsAppSendingState({
  className,
  currentContact,
  totalContacts,
  successCount,
  failureCount,
  intervalSeconds,
  isWaiting,
  isSending,
  currentStep,
  currentContactIndex,
}: WhatsAppSendingStateProps) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [countdown, setCountdown] = useState(0);

  // Rotação das mensagens a cada 3 segundos
  useEffect(() => {
    const messageInterval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % sendingMessages.length);
    }, 3000);

    return () => clearInterval(messageInterval);
  }, []);

  // Contador regressivo quando está aguardando
  useEffect(() => {
    if (isWaiting && intervalSeconds > 0) {
      const countdownInterval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(countdownInterval);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => clearInterval(countdownInterval);
    }
  }, [isWaiting, intervalSeconds]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Seleção de ícone via mapeamento estável
  const iconKey = isWaiting
    ? "clock"
    : isSending
    ? "send"
    : sendingMessages[currentMessageIndex].key;
  const CurrentIcon = ICONS[iconKey];

  const getCurrentMessage = () => {
    if (isWaiting && currentContact) {
      const display = countdown > 0 ? countdown : intervalSeconds;
      return `Aguardando ${display}s para enviar para ${currentContact.displayName}`;
    }
    if (isSending && currentContact) {
      return `Enviando mensagem para ${currentContact.displayName}`;
    }
    return currentStep || sendingMessages[currentMessageIndex].text;
  };

  const progress = totalContacts > 0 ? ((successCount + failureCount) / totalContacts) * 100 : 0;
  // CurrentIcon já calculado acima

  return (
    <div className={`w-full mx-auto ${className}`}>
      <Card className="border-0 shadow-2xl bg-gradient-to-br from-background to-muted/20">
        <CardContent className="p-12 text-center space-y-8">
          {/* Spinner principal */}
          <div className="flex justify-center">
            <div className="relative">
              <Loader2 className="h-16 w-16 animate-spin text-green-600 dark:text-green-400" />
              <div className="absolute inset-0 flex items-center justify-center">
                <CurrentIcon className="h-6 w-6 text-green-600/70 dark:text-green-400/70 animate-pulse" />
              </div>
            </div>
          </div>

          {/* Contador regressivo ou progresso */}
          <div className="space-y-3">
            {isWaiting && intervalSeconds > 0 ? (
              <div className="text-5xl font-mono font-bold text-green-600 dark:text-green-400 tracking-wider">
                {formatTime(countdown > 0 ? countdown : intervalSeconds)}
              </div>
            ) : (
              <div className="text-5xl font-mono font-bold text-green-600 dark:text-green-400 tracking-wider">
                {successCount + failureCount}/{totalContacts}
              </div>
            )}
            <p className="text-base text-muted-foreground font-medium">
              {isWaiting ? "Próximo envio em" : "Mensagens processadas"}
            </p>
          </div>

          {/* Mensagem atual com ícone */}
          <div className="space-y-4">
            <div className="h-8 flex items-center justify-center gap-3">
              <CurrentIcon
                key={`icon-${currentMessageIndex}-${isWaiting}-${isSending}`}
                className="h-6 w-6 text-green-600 dark:text-green-400 animate-in fade-in-0 slide-in-from-left-2 duration-700"
              />
              <p
                key={`text-${currentMessageIndex}-${isWaiting}-${isSending}`}
                className="text-xl font-semibold animate-in fade-in-0 slide-in-from-right-2 duration-700"
              >
                {getCurrentMessage()}
              </p>
            </div>
          </div>

          {/* Barra de progresso */}
          <div className="space-y-3">
            <div className="w-full bg-secondary/50 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-green-600 to-green-500 dark:from-green-500 dark:to-green-400 h-2 rounded-full transition-all duration-1000 ease-out shadow-sm"
                style={{
                  width: `${progress}%`,
                }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground font-medium">
              <span>Progresso</span>
              <span>{Math.round(progress)}%</span>
            </div>
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-2 gap-4 pt-4">
            <div className="bg-green-50 dark:bg-green-950/30 p-3 rounded-md border border-green-200 dark:border-green-800">
              <div className="flex items-center gap-2 justify-center">
                <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                <span className="text-sm font-medium text-green-800 dark:text-green-200">
                  Enviados
                </span>
              </div>
              <p className="text-2xl font-bold text-green-700 dark:text-green-300 mt-1">
                {successCount}
              </p>
            </div>

            <div className="bg-red-50 dark:bg-red-950/30 p-3 rounded-md border border-red-200 dark:border-red-800">
              <div className="flex items-center gap-2 justify-center">
                <AlertCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                <span className="text-sm font-medium text-red-800 dark:text-red-200">
                  Falhas
                </span>
              </div>
              <p className="text-2xl font-bold text-red-700 dark:text-red-300 mt-1">
                {failureCount}
              </p>
            </div>
          </div>

          {/* Próximo contato */}
          {currentContact && !isWaiting && (
            <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-md border border-blue-200 dark:border-blue-800">
              <p className="text-sm text-blue-700 dark:text-blue-300 mb-1">
                Próximo contato:
              </p>
              <p className="font-semibold text-blue-800 dark:text-blue-200">
                {currentContact.displayName} ({((currentContactIndex ?? (successCount + failureCount)) + 1)}/{totalContacts})
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}