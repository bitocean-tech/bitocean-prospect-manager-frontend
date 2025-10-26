import { apiClient } from "./apiClient";
import type { Niche, SearchResponse } from "@/common/interfaces";

export interface SearchRequest {
  query: string;
  niche: string;
}

/**
 * Serviço para operações relacionadas a busca de negócios
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
   * Executa busca de negócios por termo e nicho
   */
  static async searchBusinesses(
    request: SearchRequest
  ): Promise<SearchResponse> {
    const response = await apiClient.post<SearchResponse>(
      "/google-busines-scraper/search",
      request
    );
    return response.data;
  }
}
