"use client";

import React, { useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useSending } from "@/contexts/SendingContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  CheckCircle,
  AlertCircle,
  Clock,
  MessageCircle,
  X,
} from "lucide-react";

export function FloatingSendingStatus() {
  const router = useRouter();
  const pathname = usePathname();
  const {
    isActive,
    isWaiting,
    isSending,
    currentStep,
    successCount,
    failureCount,
    currentContactIndex,
    totalContacts,
    countdown,
    currentContact,
    stopSending,
  } = useSending();

  const progress = useMemo(() => {
    return totalContacts > 0
      ? Math.min(
          100,
          Math.round(((successCount + failureCount) / totalContacts) * 100)
        )
      : 0;
  }, [successCount, failureCount, totalContacts]);

  const isOnSendingPage =
    pathname === "/dashboard/gerenciar-prospects/envio-whatsapp";
  const shouldShow = (isActive || isWaiting || isSending) && !isOnSendingPage;

  if (!shouldShow) return null;

  return (
    <div
      className="fixed bottom-4 right-4 z-50 w-[340px] max-w-[90vw] cursor-pointer"
      onClick={() =>
        router.push("/dashboard/gerenciar-prospects/envio-whatsapp")
      }
      role="button"
      tabIndex={0}
    >
      <Card className="shadow-2xl border bg-card">
        <CardContent className="p-4 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MessageCircle className="h-4 w-4 text-primary" />
              <span className="font-semibold text-sm">Envio em andamento</span>
            </div>
            <Button
              size="sm"
              variant="ghost"
              onClick={(e) => {
                e.stopPropagation();
                stopSending();
              }}
              className="gap-2"
            >
              <X className="h-4 w-4" />
              Interromper
            </Button>
          </div>

          <div className="space-y-2">
            <div className="w-full bg-secondary/50 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-green-600 to-green-500 dark:from-green-500 dark:to-green-400 h-2 rounded-full transition-all duration-700 ease-out shadow-sm"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-muted-foreground font-medium">
              <span>Progresso</span>
              <span>{Math.round(progress)}%</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div className="bg-green-50 dark:bg-green-950/30 p-2 rounded-md border border-green-200 dark:border-green-800 text-center">
              <div className="flex items-center gap-1 justify-center">
                <CheckCircle className="h-3 w-3 text-green-600 dark:text-green-400" />
                <span className="text-[11px] font-medium text-green-800 dark:text-green-200">
                  Sucessos
                </span>
              </div>
              <p className="text-lg font-bold text-green-700 dark:text-green-300 mt-0.5">
                {successCount}
              </p>
            </div>
            <div className="bg-red-50 dark:bg-red-950/30 p-2 rounded-md border border-red-200 dark:border-red-800 text-center">
              <div className="flex items-center gap-1 justify-center">
                <AlertCircle className="h-3 w-3 text-red-600 dark:text-red-400" />
                <span className="text-[11px] font-medium text-red-800 dark:text-red-200">
                  Falhas
                </span>
              </div>
              <p className="text-lg font-bold text-red-700 dark:text-red-300 mt-0.5">
                {failureCount}
              </p>
            </div>
            <div className="bg-blue-50 dark:bg-blue-950/30 p-2 rounded-md border border-blue-200 dark:border-blue-800 text-center">
              <div className="flex items-center gap-1 justify-center">
                <Clock className="h-3 w-3 text-blue-600 dark:text-blue-400" />
                <span className="text-[11px] font-medium text-blue-800 dark:text-blue-200">
                  Pendentes
                </span>
              </div>
              <p className="text-lg font-bold text-blue-700 dark:text-blue-300 mt-0.5">
                {Math.max(totalContacts - (successCount + failureCount), 0)}
              </p>
            </div>
          </div>

          {currentContact && (
            <div className="bg-muted/30 dark:bg-muted/20 p-2 rounded-md border">
              <p className="text-[11px] text-muted-foreground">
                Próximo contato:
              </p>
              <p className="text-sm font-semibold">
                {currentContact.displayName} ({currentContactIndex + 1}/
                {totalContacts})
              </p>
              {isWaiting && countdown > 0 && (
                <p className="text-[11px] text-blue-700 dark:text-blue-300 flex items-center gap-1 mt-1">
                  <Clock className="h-3 w-3" /> Próximo envio em {countdown}s
                </p>
              )}
              {isSending && (
                <p className="text-[11px] text-green-700 dark:text-green-300 mt-1">
                  Enviando mensagem...
                </p>
              )}
              {!isSending && !isWaiting && (
                <p className="text-[11px] text-muted-foreground mt-1">
                  {currentStep}
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
