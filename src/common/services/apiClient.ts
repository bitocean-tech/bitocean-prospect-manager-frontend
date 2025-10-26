import axios, { type InternalAxiosRequestConfig } from "axios";
import { getAccessKey } from "@/common/helpers/cookies";

// Configuração base do cliente HTTP
export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "",
  timeout: 90000, // 90 segundos para suportar requisições longas como busca de negócios
});

// Interceptor para incluir automaticamente o token de autorização
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Só adiciona o header se não foi explicitamente definido na requisição
    if (!config.headers.Authorization) {
      const accessKey = getAccessKey();
      if (accessKey) {
        config.headers.Authorization = `Bearer ${accessKey}`;
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratamento de respostas
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Em caso de 401, poderia limpar cookies e redirecionar para login
    // Mas deixamos isso para ser tratado nos componentes específicos
    return Promise.reject(error);
  }
);
