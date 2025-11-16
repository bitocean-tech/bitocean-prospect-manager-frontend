// Interfaces exatas conforme especificação do documento

export interface ListPlacesQuery {
  page?: number;
  pageSize?: number;
  state?: string;
  city?: string;
  hasWebsite?: "true" | "false";
  nicheSearched?: string;
  firstMessageSent?: "true" | "false";
  googlePrimaryCategoryLike?: string;
}

export interface PlaceItem {
  id: string;
  googlePlaceId: string;
  displayName: string;
  nicheSearched: string;
  googlePrimaryCategory?: string | null;
  websiteUri?: string | null;
  nationalPhoneNumber?: string | null;
  normalizedPhoneE164?: string | null;
  city?: string | null;
  state?: string | null;
  firstMessageSent: boolean;
  firstMessageSentAt?: string | null;
  enrichmentStatus: "pending" | "enriched" | "failed";
  enrichedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ListPlacesResponse {
  items: PlaceItem[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}

export interface SelectedProspects {
  selectedItems: PlaceItem[];
}

export interface SendIntervalOption {
  name: string;
  min: number;
  max: number;
}

// V2 - Campanhas / Tipos de Mensagem e Templates por Tipo
export interface MessageType {
  id: string;
  name: string;
  description: string;
  isActive: boolean;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  templateCount: number;
}

export interface MessageTemplate {
  id: string;
  title: string;
  content: string;
  messageTypeId: string;
  isActive: boolean;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
  messageType: {
    id: string;
    name: string;
  };
}

export interface CampaignCreateResponse {
  campaignId: string;
  status: "pending" | "in_progress" | "completed" | "failed";
  totalRecipients: number;
  message: string;
}

// Campaigns - listagem e tipos
export type CampaignStatus = "pending" | "in_progress" | "completed" | "failed";

export interface Campaign {
  id: string;
  name: string;
  messageTypeId: string;
  messageType: { id: string; name: string };
  status: CampaignStatus;
  intervalMin: number;
  intervalMax: number;
  totalRecipients: number;
  successCount: number;
  failedCount: number;
  pendingCount: number;
  startedAt: string | null;
  completedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ListCampaignsQuery {
  page?: number;
  pageSize?: number;
  status?: CampaignStatus;
  search?: string;
}

export interface ListCampaignsResponse {
  items: Campaign[];
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
}
