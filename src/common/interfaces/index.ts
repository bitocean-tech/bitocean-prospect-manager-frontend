// Tipos globais conforme especificação da documentação

export type EnrichmentStatus = "enriched" | "failed" | "pending";

export interface Niche {
  id: string;
  displayName: string;
  standardizedName: string;
  createdAt: string; // ISO 8601
  updatedAt: string; // ISO 8601
}

export interface ReportItem {
  googlePlaceId: string;
  displayName: string;
  nicheSearched: string;
  googlePrimaryCategory?: string;
  websiteUri?: string;
  normalizedPhoneE164?: string;
  city?: string;
  state?: string;
  enrichmentStatus: EnrichmentStatus;
}

export interface SearchResponse {
  totalFetched: number;
  newSavedCount: number;
  alreadyExistingCount: number;
  enrichedCount: number;
  failedCount: number;
  pendingCount: number;
  items: ReportItem[];
}

// Tipos para requisições
export interface SearchRequest {
  query: string;
  niche: string;
}

// Tipos para autenticação
export interface AuthValidationResponse {
  valid: boolean;
  message?: string;
}
