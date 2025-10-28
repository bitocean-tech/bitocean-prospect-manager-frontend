/**
 * Formata número de telefone para o formato esperado pelo WhatsApp
 * Remove + e caracteres especiais, mantendo apenas números
 * Exemplo: +55 11 94697-4555 -> 5511946974555
 */
export function formatPhoneForWhatsApp(phone: string | null | undefined): string | null {
  if (!phone) return null;
  
  // Remove todos os caracteres não numéricos
  const cleanPhone = phone.replace(/\D/g, '');
  
  // Verifica se tem pelo menos 10 dígitos (formato brasileiro mínimo)
  if (cleanPhone.length < 10) return null;
  
  return cleanPhone;
}

/**
 * Verifica se um número de telefone é válido
 */
export function isValidPhoneNumber(phone: string | null | undefined): boolean {
  if (!phone) return false;
  
  const formatted = formatPhoneForWhatsApp(phone);
  return formatted !== null && formatted.length >= 10;
}