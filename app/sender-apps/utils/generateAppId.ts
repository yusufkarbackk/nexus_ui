/**
 * Generates a random app ID for sender app identification
 * Format: app_XXXXXXXXXXXXXXXX (16 random alphanumeric characters)
 */
export function generateAppId(): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  const length = 16;
  let result = 'app_';
  
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters[randomIndex];
  }
  
  return result;
}

/**
 * Generates a unique field ID
 * Format: field_XXXXXXXX (8 random alphanumeric characters)
 */
export function generateFieldId(): string {
  const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  const length = 8;
  let result = 'field_';
  
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * characters.length);
    result += characters[randomIndex];
  }
  
  return result;
}






