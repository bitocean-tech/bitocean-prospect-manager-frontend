"use client";

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
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
  Phone,
  Copy,
  CheckCircle2,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { GerenciarProspectsService } from "@/services/gerenciar-prospects";

interface CopyPhonesModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaignId: string;
  recipientIds?: string[];
}

export function CopyPhonesModal({
  open,
  onOpenChange,
  campaignId,
  recipientIds,
}: CopyPhonesModalProps) {
  const [phonesE164, setPhonesE164] = useState<string[]>([]);
  const [phonesWithoutPlus, setPhonesWithoutPlus] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [format, setFormat] = useState<"e164" | "withoutPlus">("e164");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (open && campaignId) {
      fetchPhones();
    } else {
      // Reset ao fechar
      setPhonesE164([]);
      setPhonesWithoutPlus([]);
      setError(null);
      setCopied(false);
      setFormat("e164");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, campaignId]);

  const fetchPhones = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await GerenciarProspectsService.getCampaignPhones(
        campaignId,
        recipientIds && recipientIds.length > 0 ? { recipientIds } : undefined
      );

      setPhonesE164(response.phonesE164);
      setPhonesWithoutPlus(response.phonesWithoutPlus);
    } catch (err) {
      console.error("Erro ao buscar telefones:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Erro ao buscar telefones. Tente novamente."
      );
    } finally {
      setLoading(false);
    }
  };

  const getPhonesString = (forDisplay = false) => {
    const phones = format === "e164" ? phonesE164 : phonesWithoutPlus;
    // Para exibição, usa vírgula com espaço. Para cópia, apenas vírgula
    return forDisplay ? phones.join(", ") : phones.join(",");
  };

  const handleCopy = async () => {
    const phonesString = getPhonesString(false);

    if (!phonesString) {
      toast.error("Nenhum telefone disponível para copiar.");
      return;
    }

    try {
      await navigator.clipboard.writeText(phonesString);
      setCopied(true);
      toast.success("Telefones copiados para a área de transferência!");
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Erro ao copiar:", err);
      toast.error("Erro ao copiar telefones. Tente novamente.");
    }
  };

  const phonesString = getPhonesString(true); // Para exibição
  const phonesCount =
    format === "e164" ? phonesE164.length : phonesWithoutPlus.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            Copiar Telefones
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {loading && (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          )}

          {!loading && !error && (
            <>
              <div className="space-y-2">
                <Label>Formato do número</Label>
                <Select
                  value={format}
                  onValueChange={(v: "e164" | "withoutPlus") => {
                    setFormat(v);
                    setCopied(false);
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="e164">
                      E.164 (com +) - Ex: +5511999999999
                    </SelectItem>
                    <SelectItem value="withoutPlus">
                      Sem + - Ex: 5511999999999
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>Telefones ({phonesCount} encontrados)</Label>
                  <Button
                    size="sm"
                    onClick={handleCopy}
                    disabled={!phonesString || copied}
                    className="h-8"
                  >
                    {copied ? (
                      <>
                        <CheckCircle2 className="h-4 w-4 mr-2" />
                        Copiado!
                      </>
                    ) : (
                      <>
                        <Copy className="h-4 w-4 mr-2" />
                        Copiar
                      </>
                    )}
                  </Button>
                </div>
                <Textarea
                  value={phonesString}
                  readOnly
                  rows={10}
                  className="font-mono text-sm break-words overflow-wrap-anywhere resize-none"
                  placeholder="Nenhum telefone encontrado"
                  style={{ wordBreak: "break-word", overflowWrap: "break-word" }}
                />
                <p className="text-xs text-muted-foreground">
                  Telefones separados por vírgula. Clique em "Copiar" para
                  copiar para a área de transferência.
                </p>
              </div>

              {phonesCount === 0 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Nenhum telefone encontrado. Verifique se os recipients
                    possuem números de telefone válidos.
                  </AlertDescription>
                </Alert>
              )}
            </>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

