// Funções auxiliares para gerenciamento de cookies seguros

export const COOKIE_NAMES = {
  ACCESS_KEY: "prospect_manager_access_key",
} as const;

export interface CookieOptions {
  secure?: boolean;
  sameSite?: "strict" | "lax" | "none";
  path?: string;
  maxAge?: number; // em segundos
}

/**
 * Define um cookie com configurações seguras
 */
export function setCookie(
  name: string,
  value: string,
  options: CookieOptions = {}
): void {
  const {
    secure = true,
    sameSite = "strict",
    path = "/",
    maxAge = 30 * 24 * 60 * 60, // 30 dias por padrão
  } = options;

  let cookieString = `${name}=${encodeURIComponent(value)}`;
  cookieString += `; path=${path}`;
  cookieString += `; max-age=${maxAge}`;
  cookieString += `; samesite=${sameSite}`;

  if (secure) {
    cookieString += "; secure";
  }

  document.cookie = cookieString;
}

/**
 * Recupera o valor de um cookie
 */
export function getCookie(name: string): string | null {
  const nameEQ = name + "=";
  const cookies = document.cookie.split(";");

  for (let cookie of cookies) {
    cookie = cookie.trim();
    if (cookie.indexOf(nameEQ) === 0) {
      return decodeURIComponent(cookie.substring(nameEQ.length));
    }
  }

  return null;
}

/**
 * Remove um cookie
 */
export function removeCookie(name: string, path: string = "/"): void {
  document.cookie = `${name}=; path=${path}; expires=Thu, 01 Jan 1970 00:00:00 GMT`;
}

/**
 * Salva a chave de acesso
 */
export function saveAccessKey(accessKey: string): void {
  setCookie(COOKIE_NAMES.ACCESS_KEY, accessKey, {
    secure: true,
    sameSite: "strict",
    path: "/",
    maxAge: 30 * 24 * 60 * 60, // 30 dias
  });
}

/**
 * Recupera a chave de acesso armazenada
 */
export function getAccessKey(): string | null {
  return getCookie(COOKIE_NAMES.ACCESS_KEY);
}

/**
 * Remove a chave de acesso (logout)
 */
export function clearAccessKey(): void {
  removeCookie(COOKIE_NAMES.ACCESS_KEY);
}
