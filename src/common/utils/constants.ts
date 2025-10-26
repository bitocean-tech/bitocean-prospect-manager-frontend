// Constantes globais da aplicação

export const APP_CONFIG = {
  name: 'Prospect Manager',
  company: 'BitOcean',
  version: '1.0.0',
} as const;

export const API_ENDPOINTS = {
  auth: {
    validate: '/auth/validate',
  },
  niches: '/niches',
  search: '/google-busines-scraper/search',
  enrich: '/google-busines-scraper/enrich',
} as const;

export const ROUTES = {
  login: '/login',
  dashboard: '/dashboard',
  buscarNegocios: '/dashboard/buscar-negocios',
  enviarMensagens: '/dashboard/enviar-mensagens',
} as const;

export const QUERY_KEYS = {
  niches: ['niches'] as const,
  search: ['search'] as const,
  auth: ['auth'] as const,
} as const;