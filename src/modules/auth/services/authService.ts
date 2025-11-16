import { apiClient } from "@/common/services/apiClient";
import type { AuthValidationResponse } from "@/common/interfaces";

/**
 * Serviço de autenticação
 */
export class AuthService {
  /**
   * Valida a chave de acesso via API
   */
  static async validateAccessKey(
    accessKey: string
  ): Promise<AuthValidationResponse> {
    try {
      const response = await apiClient.get("/auth/validate", {
        headers: {
          Authorization: `Bearer ${accessKey}`,
        },
      });

      return {
        valid: response.status === 200,
        message: "Chave válida",
      };
    } catch (error: unknown) {
      return {
        valid: false,
        message: error instanceof Error ? error.message : "Erro desconhecido",
      };
    }
  }
}
