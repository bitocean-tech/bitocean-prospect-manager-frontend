import { apiClient } from "@/common/services/apiClient";
import type { Niche } from "@/common/interfaces";
import type {
  ListPlacesQuery,
  ListPlacesResponse,
  Template,
  MessageType,
  MessageTemplate,
  SendIntervalOption,
} from "@/types/gerenciar-prospects";

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

  /**
   * Lista tipos de mensagem (Message Types) para campanhas
   */
  static async getMessageTypes(): Promise<MessageType[]> {
    const response = await apiClient.get<MessageType[]>("/message-types");
    return response.data;
  }

  /**
   * Lista templates por tipo de mensagem (para preview)
   */
  static async getTemplatesByMessageType(
    messageTypeId: string
  ): Promise<MessageTemplate[]> {
    const response = await apiClient.get<MessageTemplate[]>("/templates", {
      params: { messageTypeId },
    });
    return response.data;
  }

  /**
   * Envia mensagem WhatsApp para um contato
   */
  static async sendWhatsappMessage(payload: {
    text: string;
    number: string;
    googlePlaceId?: string;
  }): Promise<{ success: boolean; message?: string; error?: string }> {
    const response = await apiClient.post<{
      success: boolean;
      message?: string;
      error?: string;
    }>("/whatsapp/sendWhatsappMessage", payload);
    return response.data;
  }

  /**
   * Retornas as opções de range de envio de mensagem
   */
  static async getSendIntervalOptions(): Promise<SendIntervalOption[]> {
    return [
      {
        name: "Entre 30 segundos e 2 minutos",
        min: 30,
        max: 120,
      },
      {
        name: "Entre 30 segundos e 3 minutos",
        min: 30,
        max: 180,
      },
      {
        name: "Entre 1 minuto e 3 minutos",
        min: 60,
        max: 180,
      },
      {
        name: "Entre 1 minuto e 5 minutos",
        min: 60,
        max: 300,
      },
      {
        name: "Entre 1 minuto e 10 minutos",
        min: 60,
        max: 10 * 60,
      },
    ] as SendIntervalOption[];
  }
}
