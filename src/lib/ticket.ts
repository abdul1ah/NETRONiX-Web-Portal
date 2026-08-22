import { randomBytes } from "crypto";

// Unambiguous uppercase alphanumeric charset (omits 0, O, 1, I, L)
const CHARSET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

/**
 * Generate a cryptographically secure, unpredictable public Ticket ID.
 * Format: NX-XXXXXXXX (e.g. NX-7K4M9X2Q)
 * 31^8 ≈ 852 billion combinations
 */
export function generateTicketId(): string {
  const length = 8;
  const bytes = randomBytes(length);
  let result = "";

  for (let i = 0; i < length; i++) {
    const index = bytes[i] % CHARSET.length;
    result += CHARSET[index];
  }

  return `NX-${result}`;
}
