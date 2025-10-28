"use client";

import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import type { PlaceItem } from "@/types/gerenciar-prospects";
import { GerenciarProspectsService } from "@/services/gerenciar-prospects";
import { formatPhoneForWhatsApp, isValidPhoneNumber } from "@/utils/phone";

interface SendResult {
  success: boolean;
  contact: {
    id: string;
    displayName: string;
    phone: string;
    normalizedPhoneE164?: string | null;
    nationalPhoneNumber?: string | null;
  };
  error?: string;
}

interface CurrentContactInfo {
  id: string;
  displayName: string;
  normalizedPhoneE164?: string | null;
  nationalPhoneNumber?: string | null;
  googlePlaceId?: string;
}

interface SendingContextType {
  // state
  isActive: boolean;
  isWaiting: boolean;
  isSending: boolean;
  currentStep: string;
  successCount: number;
  failureCount: number;
  currentContactIndex: number;
  totalContacts: number;
  countdown: number;
  sendResults: SendResult[];
  currentContact: CurrentContactInfo | null;
  completed: boolean;
  // actions
  startSending: (
    items: PlaceItem[],
    messageText: string,
    intervalSeconds: number
  ) => Promise<void>;
  stopSending: () => void;
}

const SendingContext = createContext<SendingContextType | undefined>(undefined);

export function SendingProvider({ children }: { children: React.ReactNode }) {
  const [isActive, setIsActive] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [currentStep, setCurrentStep] = useState("");
  const [successCount, setSuccessCount] = useState(0);
  const [failureCount, setFailureCount] = useState(0);
  const [currentContactIndex, setCurrentContactIndex] = useState(0);
  const [totalContacts, setTotalContacts] = useState(0);
  const [countdown, setCountdown] = useState(0);
  const [sendResults, setSendResults] = useState<SendResult[]>([]);
  const [currentContact, setCurrentContact] =
    useState<CurrentContactInfo | null>(null);
  const [completed, setCompleted] = useState(false);

  const cancelRef = useRef(false);
  const countdownIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const clearCountdownInterval = () => {
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
      countdownIntervalRef.current = null;
    }
  };

  useEffect(() => {
    return () => {
      clearCountdownInterval();
    };
  }, []);

  const waitForInterval = (seconds: number): Promise<void> => {
    return new Promise((resolve) => {
      setCountdown(seconds);
      clearCountdownInterval();
      countdownIntervalRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearCountdownInterval();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      setTimeout(() => {
        clearCountdownInterval();
        resolve();
      }, seconds * 1000);
    });
  };

  const startSending = async (
    items: PlaceItem[],
    messageText: string,
    intervalSeconds: number
  ) => {
    // Reset state
    cancelRef.current = false;
    setIsActive(true);
    setCompleted(false);
    setIsWaiting(false);
    setIsSending(false);
    setCurrentStep("Iniciando processo de envio...");
    setSuccessCount(0);
    setFailureCount(0);
    setCurrentContactIndex(0);
    setCountdown(0);
    setSendResults([]);
    setCurrentContact(null);

    // Filter valid contacts
    const validContacts = items.filter((item) => {
      const phone = item.normalizedPhoneE164 || item.nationalPhoneNumber;
      return !!phone && isValidPhoneNumber(phone);
    });
    setTotalContacts(validContacts.length);

    for (let i = 0; i < validContacts.length; i++) {
      if (cancelRef.current) break;

      const contact = validContacts[i];
      setCurrentContactIndex(i);
      setCurrentContact({
        id: contact.id,
        displayName: contact.displayName,
        normalizedPhoneE164: contact.normalizedPhoneE164,
        nationalPhoneNumber: contact.nationalPhoneNumber,
        googlePlaceId: contact.googlePlaceId,
      });

      setCurrentStep(`Preparando envio para ${contact.displayName}`);

      // wait interval except before first
      if (i > 0) {
        setIsWaiting(true);
        await waitForInterval(intervalSeconds);
        setIsWaiting(false);
        if (cancelRef.current) break;
      }

      // send
      setIsSending(true);
      setCurrentStep(`Enviando mensagem para ${contact.displayName}`);
      try {
        const phone = formatPhoneForWhatsApp(
          contact.normalizedPhoneE164 || contact.nationalPhoneNumber || ""
        );
        if (!phone) throw new Error("Número de telefone inválido");

        const result = await GerenciarProspectsService.sendWhatsappMessage({
          text: messageText,
          number: phone,
          googlePlaceId: contact.googlePlaceId,
        });

        const sendResult: SendResult = {
          success: result.success,
          contact: {
            id: contact.id,
            displayName: contact.displayName,
            phone,
            normalizedPhoneE164: contact.normalizedPhoneE164 || null,
            nationalPhoneNumber: contact.nationalPhoneNumber || null,
          },
          error: result.error,
        };
        setSendResults((prev) => [...prev, sendResult]);
        if (result.success) setSuccessCount((prev) => prev + 1);
        else setFailureCount((prev) => prev + 1);
      } catch (error) {
        const sendResult: SendResult = {
          success: false,
          contact: {
            id: contact.id,
            displayName: contact.displayName,
            phone:
              contact.normalizedPhoneE164 || contact.nationalPhoneNumber || "",
            normalizedPhoneE164: contact.normalizedPhoneE164 || null,
            nationalPhoneNumber: contact.nationalPhoneNumber || null,
          },
          error: error instanceof Error ? error.message : "Erro desconhecido",
        };
        setSendResults((prev) => [...prev, sendResult]);
        setFailureCount((prev) => prev + 1);
      }
      setIsSending(false);
    }

    if (!cancelRef.current) {
      setCurrentStep("Processo de envio finalizado");
      setCompleted(true);
    } else {
      setCurrentStep("Envio interrompido pelo usuário");
      setCompleted(false);
    }
    setIsActive(false);
    setIsWaiting(false);
    setIsSending(false);
    setCountdown(0);
    clearCountdownInterval();
  };

  const stopSending = () => {
    cancelRef.current = true;
    setIsActive(false);
    setIsWaiting(false);
    setIsSending(false);
    setCountdown(0);
    clearCountdownInterval();
    setCurrentStep("Envio interrompido pelo usuário");
  };

  const value: SendingContextType = {
    isActive,
    isWaiting,
    isSending,
    currentStep,
    successCount,
    failureCount,
    currentContactIndex,
    totalContacts,
    countdown,
    sendResults,
    currentContact,
    completed,
    startSending,
    stopSending,
  };

  return (
    <SendingContext.Provider value={value}>{children}</SendingContext.Provider>
  );
}

export function useSending() {
  const ctx = useContext(SendingContext);
  if (!ctx) throw new Error("useSending must be used within SendingProvider");
  return ctx;
}
