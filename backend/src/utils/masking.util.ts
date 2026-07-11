export function maskSensitiveData(
  data: Record<string, any>,
): Record<string, any> {
  const masked = { ...data };
  if (masked.amount) masked.amount = '***';
  if (masked.description) masked.description = '***';
  if (masked.email)
    masked.email = masked.email.replace(/(.{2})(.*)(?=@)/, '$1***');
  return masked;
}
