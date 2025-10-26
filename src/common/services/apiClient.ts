import axios, {
  AxiosInstance,
  AxiosResponse,
  InternalAxiosRequestConfig,
} from "axios";
import { getAccessKey } from "../helpers/cookies";

// Configuração base do cliente HTTP
const baseURL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

// Criar instância do Axios
const apiClient: AxiosInstance = axios.create({
  baseURL,
  timeout: 30000, // 30 segundos
  headers: {
    "Content-Type": "application/json",
  },
});

// Interceptor de requisição - adiciona automaticamente o token de autorização
apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const accessKey = getAccessKey();

    if (accessKey) {
      // Garantir header Authorization
      config.headers = config.headers || {};
      config.headers["Authorization"] = `Bearer ${accessKey}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor de resposta - trata erros globalmente
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    // Log do erro para debug (pode ser removido em produção)
    console.error("API Error:", error.response?.data || error.message);

    // Tratar erros específicos se necessário
    if (error.response?.status === 401) {
      // Token inválido ou expirado - pode redirecionar para login
      console.warn("Token inválido ou expirado");
    }

    return Promise.reject(error);
  }
);

export default apiClient;
