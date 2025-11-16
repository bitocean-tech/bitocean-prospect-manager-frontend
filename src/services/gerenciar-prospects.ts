import { apiClient } from "@/common/services/apiClient";
import type { Niche } from "@/common/interfaces";
import type {
  ListPlacesQuery,
  ListPlacesResponse,
  MessageType,
  MessageTemplate,
  SendIntervalOption,
  CampaignCreateResponse,
  ListCampaignsQuery,
  ListCampaignsResponse,
  Campaign,
  ListCampaignRecipientsQuery,
  ListCampaignRecipientsResponse,
} from "@/types/gerenciar-prospects";
import { admPhoneNumbers } from "@/common/constants/admPhoneNumbers";

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

  /**
   * Lista campanhas com filtros e paginação
   */
  static async getCampaigns(
    query: ListCampaignsQuery
  ): Promise<ListCampaignsResponse> {
    const response = await apiClient.get<ListCampaignsResponse>("/campaigns", {
      params: query,
    });
    return response.data;
  }

  /**
   * Busca detalhes de uma campanha por id
   */
  static async getCampaignById(id: string): Promise<Campaign> {
    const response = await apiClient.get<Campaign>(`/campaigns/${id}`);
    return response.data;
  }

  /**
   * Lista recipients de uma campanha
   */
  static async getCampaignRecipients(
    campaignId: string,
    query: ListCampaignRecipientsQuery
  ): Promise<ListCampaignRecipientsResponse> {
    const response = await apiClient.get<ListCampaignRecipientsResponse>(
      `/campaigns/${campaignId}/recipients`,
      { params: query }
    );
    return response.data;
  }

  /**
   * Cria uma campanha de envio em massa
   */
  static async createCampaign(params: {
    placeIds: string[];
    messageTypeId: string;
    intervalMin: number;
    intervalMax: number;
    messageTypeName: string;
  }): Promise<CampaignCreateResponse> {
    const {
      placeIds,
      messageTypeId,
      intervalMin,
      intervalMax,
      messageTypeName,
    } = params;

    const now = new Date();
    const dd = String(now.getDate()).padStart(2, "0");
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const yyyy = now.getFullYear();
    const hh = String(now.getHours()).padStart(2, "0");
    const min = String(now.getMinutes()).padStart(2, "0");
    const name = `${messageTypeName} - ${dd}/${mm}/${yyyy} ${hh}:${min}`;

    const response = await apiClient.post<CampaignCreateResponse>(
      "/campaigns",
      {
        placeIds,
        messageTypeId,
        intervalMin,
        intervalMax,
        name,
        notifyPhones: admPhoneNumbers,
      }
    );
    return response.data;
  }
}
