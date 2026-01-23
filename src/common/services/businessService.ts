import { apiClient } from "./apiClient";
import type { CsvUploadResponse, Niche } from "@/common/interfaces";

/**
 * Serviço para operações relacionadas a busca de negócios (upload CSV)
 */
export class BusinessService {
  /**
   * Busca lista de nichos disponíveis
   */
  static async getNiches(): Promise<Niche[]> {
    const response = await apiClient.get<Niche[]>("/niches");
    return response.data;
  }

  /**
   * Envia CSV + nicho para ingestão (multipart/form-data)
   */
  static async uploadCsv(file: File, niche: string): Promise<CsvUploadResponse> {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("niche", niche);
    const response = await apiClient.post<CsvUploadResponse>(
      "/google-busines-scraper/upload-csv",
      formData
    );
    return response.data;
  }
}
