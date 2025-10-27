// Interfaces exatas conforme especificação do documento

export interface ListPlacesQuery {
  page?: number;
  pageSize?: number;
  state?: string;
  city?: string;
  hasWebsite?: 'true' | 'false';
  nicheSearched?: string;
  firstMessageSent?: 'true' | 'false';
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
  enrichmentStatus: 'pending' | 'enriched' | 'failed';
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