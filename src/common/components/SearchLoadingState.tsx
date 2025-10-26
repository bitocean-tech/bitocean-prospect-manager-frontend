"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import {
  Loader2,
  Search,
  Database,
  BarChart3,
  Cpu,
  CheckCircle,
} from "lucide-react";

interface SearchLoadingStateProps {
  className?: string;
}

const loadingMessages = [
  { text: "Buscando negócios...", icon: Search },
  { text: "Alimentando banco de dados...", icon: Database },
  { text: "Comparando resultados encontrados...", icon: BarChart3 },
  { text: "Processando informações...", icon: Cpu },
  { text: "Finalizando busca...", icon: CheckCircle },
];

export function SearchLoadingState({ className }: SearchLoadingStateProps) {
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);

  // Rotação das mensagens a cada 3.5 segundos
  useEffect(() => {
    const messageInterval = setInterval(() => {
      setCurrentMessageIndex((prev) => (prev + 1) % loadingMessages.length);
    }, 3500);

    return () => clearInterval(messageInterval);
  }, []);

  // Contador de tempo
  useEffect(() => {
    const timeInterval = setInterval(() => {
      setElapsedTime((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(timeInterval);
  }, []);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  const CurrentIcon = loadingMessages[currentMessageIndex].icon;

  return (
    <div className="w-full mx-auto">
      <Card className="border-0 shadow-2xl bg-gradient-to-br from-background to-muted/20">
        <CardContent className="p-12 text-center space-y-8">
          {/* Spinner principal */}
          <div className="flex justify-center">
            <div className="relative">
              <Loader2 className="h-16 w-16 animate-spin text-primary" />
              <div className="absolute inset-0 flex items-center justify-center">
                <CurrentIcon className="h-6 w-6 text-primary/70 animate-pulse" />
              </div>
            </div>
          </div>

          {/* Contador de tempo */}
          <div className="space-y-3">
            <div className="text-5xl font-mono font-bold text-primary tracking-wider">
              {formatTime(elapsedTime)}
            </div>
            <p className="text-base text-muted-foreground font-medium">
              Esse processo pode demorar um pouco
            </p>
          </div>

          {/* Mensagem rotativa com ícone */}
          <div className="space-y-4">
            <div className="h-8 flex items-center justify-center gap-3">
              <CurrentIcon
                key={`icon-${currentMessageIndex}`}
                className="h-6 w-6 text-primary animate-in fade-in-0 slide-in-from-left-2 duration-700"
              />
              <p
                key={`text-${currentMessageIndex}`}
                className="text-xl font-semibold animate-in fade-in-0 slide-in-from-right-2 duration-700"
              >
                {loadingMessages[currentMessageIndex].text}
              </p>
            </div>
          </div>

          {/* Barra de progresso aprimorada */}
          <div className="space-y-3">
            <div className="w-full bg-secondary/50 rounded-full h-2 overflow-hidden">
              <div
                className="bg-gradient-to-r from-primary to-primary/80 h-2 rounded-full transition-all duration-1000 ease-out shadow-sm"
                style={{
                  width: `${
                    ((currentMessageIndex + 1) / loadingMessages.length) * 100
                  }%`,
                }}
              />
            </div>
            <div className="flex justify-between text-xs text-muted-foreground font-medium">
              <span>Progresso</span>
              <span>
                {Math.round(
                  ((currentMessageIndex + 1) / loadingMessages.length) * 100
                )}
                %
              </span>
            </div>
          </div>

          {/* Indicadores de fase */}
          <div className="flex justify-center gap-2 pt-4">
            {loadingMessages.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full transition-all duration-500 ${
                  index <= currentMessageIndex
                    ? "bg-primary shadow-sm"
                    : "bg-muted-foreground/30"
                }`}
              />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
