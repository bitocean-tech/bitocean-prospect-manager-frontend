import { apiClient } from "@/common/services/apiClient";
import type { Niche } from "@/common/interfaces";
import type { ListPlacesQuery, ListPlacesResponse, Template } from "@/types/gerenciar-prospects";

/**
 * Serviço para operações da funcionalidade Gerenciar Prospects
 */
export class GerenciarProspectsService {
  /**
   * Busca lista de prospects com filtros
   */
  static async getPlaces(query: ListPlacesQuery): Promise<ListPlacesResponse> {
    const response = await apiClient.get<ListPlacesResponse>(
      "/google-busines-scraper/places",
      { params: query }
    );
    return response.data;
  }

  /**
   * Busca lista de nichos disponíveis
   */
  static async getNiches(): Promise<Niche[]> {
    const response = await apiClient.get<Niche[]>("/niches");
    return response.data;
  }

  /**
   * Busca lista de templates disponíveis
   */
  static async getTemplates(): Promise<Template[]> {
    const response = await apiClient.get<Template[]>("/templates");
    return response.data;
  }
}