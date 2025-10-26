/**
 * Funções para gerenciar cookies de autenticação
 */

const ACCESS_KEY_COOKIE = 'pm-access-key';

/**
 * Salva a chave de acesso em cookie seguro
 */
export function saveAccessKey(accessKey: string): void {
  if (typeof document === 'undefined') return;
  
  const expires = new Date();
  expires.setDate(expires.getDate() + 30); // 30 dias
  
  document.cookie = `${ACCESS_KEY_COOKIE}=${accessKey}; expires=${expires.toUTCString()}; path=/; secure; samesite=strict`;
}

/**
 * Recupera a chave de acesso do cookie
 */
export function getAccessKey(): string | null {
  if (typeof document === 'undefined') return null;
  
  const cookies = document.cookie.split(';');
  const cookie = cookies.find(c => c.trim().startsWith(`${ACCESS_KEY_COOKIE}=`));
  
  if (!cookie) return null;
  
  return cookie.split('=')[1] || null;
}

/**
 * Remove a chave de acesso do cookie
 */
export function clearAccessKey(): void {
  if (typeof document === 'undefined') return;
  
  document.cookie = `${ACCESS_KEY_COOKIE}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; secure; samesite=strict`;
}

/**
 * Verifica se existe uma chave de acesso armazenada
 */
export function hasAccessKey(): boolean {
  return getAccessKey() !== null;
}