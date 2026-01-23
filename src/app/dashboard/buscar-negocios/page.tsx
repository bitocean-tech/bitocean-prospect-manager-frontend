"use client";

import { useRef, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import {
  Upload,
  Database,
  Globe,
  PhoneOff,
  RotateCcw,
  CheckCircle,
  AlertCircle,
  FileSpreadsheet,
  X,
  FileUp,
  Layers,
} from "lucide-react";
import { BusinessService } from "@/common/services/businessService";
import type { CsvUploadResponse, Niche } from "@/common/interfaces";
import {
  SearchLoadingState,
  csvUploadMessages,
} from "@/common/components/SearchLoadingState";
import axios from "axios";
import { cn } from "@/lib/utils";

function getUploadErrorMessage(error: unknown): string {
  if (!axios.isAxiosError(error) || !error.response?.data) {
    return "Erro ao processar CSV. Tente novamente.";
  }
  const data = error.response.data;
  if (typeof data === "string") return data;
  if (
    data &&
    typeof data === "object" &&
    "message" in data &&
    typeof (data as { message: unknown }).message === "string"
  ) {
    return (data as { message: string }).message;
  }
  return "Erro ao processar CSV. Tente novamente.";
}

export default function BuscarNegociosPage() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedNiche, setSelectedNiche] = useState<Niche | null>(null);
  const [uploadResult, setUploadResult] = useState<CsvUploadResponse | null>(
    null,
  );

  const {
    data: niches,
    isLoading: isLoadingNiches,
    error: nichesError,
  } = useQuery({
    queryKey: ["niches"],
    queryFn: BusinessService.getNiches,
  });

  const uploadMutation = useMutation({
    mutationFn: ({ file, niche }: { file: File; niche: string }) =>
      BusinessService.uploadCsv(file, niche),
    onSuccess: (data) => {
      setUploadResult(data);
      toast.success("Upload realizado com sucesso!");
    },
    onError: (error) => {
      console.error("Erro no upload:", error);
      toast.error(getUploadErrorMessage(error));
    },
  });

  const handleSubmit = () => {
    if (!selectedFile || !selectedNiche) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }
    uploadMutation.mutate({
      file: selectedFile,
      niche: selectedNiche.standardizedName,
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    setSelectedFile(file ?? null);
  };

  const handleClearFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const isFormValid = !!selectedFile && !!selectedNiche;
  const isUploading = uploadMutation.isPending;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Importar negócios por CSV</h1>
        <p className="text-muted-foreground">
          Envie um arquivo CSV e selecione o nicho. Ao final do processamento,
          visualize o relatório e a lista de registros adicionados.
        </p>
      </div>

      <Card className="overflow-hidden border-0 bg-linear-to-br from-card via-card to-muted/30 shadow-lg shadow-primary/5 dark:shadow-primary/10">
        <CardHeader className="pb-2">
          <CardTitle className="flex items-center gap-3 text-xl font-semibold tracking-tight">
            <span className="flex size-10 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <FileSpreadsheet className="size-5" />
            </span>
            Formulário de Upload
          </CardTitle>
          <p className="text-sm text-muted-foreground pl-[52px] -mt-1">
            Envie seu CSV e escolha o nicho para processar os negócios.
          </p>
        </CardHeader>
        <CardContent className="space-y-5 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label
                htmlFor="csv-file"
                className="text-sm font-medium text-foreground/90"
              >
                Arquivo CSV *
              </Label>
              <input
                ref={fileInputRef}
                id="csv-file"
                type="file"
                accept=".csv,text/csv,application/vnd.ms-excel,text/plain,application/csv"
                onChange={handleFileChange}
                disabled={isUploading}
                className="sr-only"
              />
              {selectedFile ? (
                <div
                  className={cn(
                    "group relative flex min-h-[120px] flex-col items-center justify-center gap-2 rounded-xl border-2 border-primary/20 bg-primary/5 px-4 py-5 transition-all",
                    !isUploading &&
                      "hover:border-primary/30 hover:bg-primary/10 cursor-pointer",
                  )}
                  onClick={() =>
                    !isUploading && fileInputRef.current?.click()
                  }
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) =>
                    !isUploading &&
                    (e.key === "Enter" || e.key === " ") &&
                    fileInputRef.current?.click()
                  }
                >
                  <div className="flex size-12 items-center justify-center rounded-xl bg-primary/15 text-primary">
                    <FileUp className="size-6" />
                  </div>
                  <p className="max-w-full truncate text-center text-sm font-medium text-foreground">
                    {selectedFile.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Clique para trocar ou remova abaixo
                  </p>
                  {!isUploading && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-2 top-2 size-8 rounded-lg opacity-70 hover:opacity-100 hover:bg-destructive/10 hover:text-destructive"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClearFile();
                      }}
                      aria-label="Remover arquivo"
                    >
                      <X className="size-4" />
                    </Button>
                  )}
                </div>
              ) : (
                <label
                  htmlFor="csv-file"
                  className={cn(
                    "group flex min-h-[120px] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed border-input bg-muted/30 px-4 py-5 transition-all",
                    "hover:border-primary/40 hover:bg-muted/50",
                    "focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary/40",
                    isUploading && "pointer-events-none opacity-60",
                  )}
                >
                  <div className="flex size-12 items-center justify-center rounded-xl bg-muted text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                    <Upload className="size-6" />
                  </div>
                  <span className="text-center text-sm font-medium text-foreground">
                    Clique ou arraste o arquivo
                  </span>
                  <span className="text-xs text-muted-foreground">
                    .csv, .txt ou planilha
                  </span>
                </label>
              )}
            </div>

            <div className="space-y-2">
              <Label
                htmlFor="niche-select"
                className="text-sm font-medium text-foreground/90"
              >
                Nicho *
              </Label>
              {isLoadingNiches ? (
                <Skeleton className="h-[120px] w-full rounded-xl" />
              ) : (
                <div className="relative">
                  <div className="pointer-events-none absolute left-3 top-1/2 z-10 -translate-y-1/2">
                    <Layers className="size-4 text-muted-foreground" />
                  </div>
                  <Select
                    value={selectedNiche?.standardizedName}
                    onValueChange={(value) =>
                      setSelectedNiche(
                        niches?.find(
                          (n) => n.standardizedName === value,
                        ) ?? null,
                      )
                    }
                    disabled={isUploading}
                  >
                    <SelectTrigger
                      id="niche-select"
                      className="h-[120px] w-full rounded-xl border-2 border-input bg-muted/30 pl-10 text-left transition-all hover:border-primary/30 hover:bg-muted/50 focus:border-primary/40 focus:ring-2 focus:ring-primary/20 data-placeholder:text-muted-foreground"
                    >
                      <SelectValue placeholder="Selecione um nicho" />
                    </SelectTrigger>
                    <SelectContent className="rounded-xl">
                      {niches?.map((niche) => (
                        <SelectItem
                          key={niche.id}
                          value={niche.standardizedName}
                          className="rounded-lg py-2.5"
                        >
                          {niche.displayName}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>
          </div>

          {nichesError && (
            <Alert variant="destructive" className="rounded-xl">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Erro ao carregar nichos. Recarregue a página e tente novamente.
              </AlertDescription>
            </Alert>
          )}

          <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center">
            <Button
              onClick={handleSubmit}
              disabled={!isFormValid || isUploading}
              size="lg"
              className="h-11 rounded-xl px-6 font-medium shadow-md transition-all hover:shadow-lg disabled:shadow-none"
            >
              {isUploading ? (
                <>
                  <RotateCcw className="size-4 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  <Upload className="size-4" />
                  Enviar
                </>
              )}
            </Button>
            {isFormValid && !isUploading && (
              <p className="text-sm text-muted-foreground">
                Pronto para enviar o arquivo.
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {isUploading ? (
        <SearchLoadingState messages={csvUploadMessages} />
      ) : (
        uploadResult && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Database className="h-5 w-5 text-blue-500" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Total processado
                    </p>
                    <p className="text-2xl font-bold">
                      {uploadResult.totalProcessed}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <Globe className="h-5 w-5 text-amber-500" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Descartados por site
                    </p>
                    <p className="text-2xl font-bold">
                      {uploadResult.discardedByWebsite}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <PhoneOff className="h-5 w-5 text-red-500" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Descartados por telefone
                    </p>
                    <p className="text-2xl font-bold">
                      {uploadResult.discardedByPhone}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <RotateCcw className="h-5 w-5 text-orange-500" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Já existentes
                    </p>
                    <p className="text-2xl font-bold">
                      {uploadResult.alreadyExisting}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Adicionados com sucesso
                    </p>
                    <p className="text-2xl font-bold">
                      {uploadResult.addedSuccessfully}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )
      )}

      {!isUploading && uploadResult && (
        <Card>
          <CardHeader>
            <CardTitle>Registros adicionados</CardTitle>
          </CardHeader>
          <CardContent>
            {uploadResult.addedSuccessfully === 0 ||
            !uploadResult.addedRecords?.length ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Nenhum registro novo adicionado.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Telefone</TableHead>
                      <TableHead>Cidade</TableHead>
                      <TableHead>Estado</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {(uploadResult.addedRecords ?? []).map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          {item.displayName}
                        </TableCell>
                        <TableCell>{item.normalizedPhoneE164}</TableCell>
                        <TableCell>{item.city ?? "-"}</TableCell>
                        <TableCell>{item.state ?? "-"}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
