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
} from "lucide-react";
import { BusinessService } from "@/common/services/businessService";
import type { CsvUploadResponse, Niche } from "@/common/interfaces";
import {
  SearchLoadingState,
  csvUploadMessages,
} from "@/common/components/SearchLoadingState";
import axios from "axios";

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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileSpreadsheet className="h-5 w-5" />
            Formulário de Upload
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="csv-file">Arquivo CSV *</Label>
              <div className="flex gap-2 items-center">
                <input
                  ref={fileInputRef}
                  id="csv-file"
                  type="file"
                  accept=".csv,text/csv,application/vnd.ms-excel,text/plain,application/csv"
                  onChange={handleFileChange}
                  disabled={isUploading}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
                {selectedFile && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={handleClearFile}
                    disabled={isUploading}
                    aria-label="Remover arquivo"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
              {selectedFile && (
                <p className="text-sm text-muted-foreground">
                  {selectedFile.name}
                </p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="niche-select">Nicho *</Label>
              {isLoadingNiches ? (
                <Skeleton className="h-10 w-full" />
              ) : (
                <Select
                  value={selectedNiche?.standardizedName}
                  onValueChange={(value) =>
                    setSelectedNiche(
                      niches?.find((n) => n.standardizedName === value) ?? null,
                    )
                  }
                  disabled={isUploading}
                >
                  <SelectTrigger id="niche-select">
                    <SelectValue placeholder="Selecione um nicho" />
                  </SelectTrigger>
                  <SelectContent>
                    {niches?.map((niche) => (
                      <SelectItem key={niche.id} value={niche.standardizedName}>
                        {niche.displayName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          {nichesError && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Erro ao carregar nichos. Recarregue a página e tente novamente.
              </AlertDescription>
            </Alert>
          )}

          <Button
            onClick={handleSubmit}
            disabled={!isFormValid || isUploading}
            className="w-full md:w-auto"
          >
            {isUploading ? (
              <>
                <RotateCcw className="mr-2 h-4 w-4 animate-spin" />
                Processando...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Enviar
              </>
            )}
          </Button>
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
