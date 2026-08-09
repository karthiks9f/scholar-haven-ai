// Server-only helpers for the shared "access key" entry path.
import { createHash, timingSafeEqual } from "node:crypto";

const GUEST_EMAIL = "guest.access@studentvault.app";

export function accessKeyMatches(input: string, expected: string): boolean {
  const a = createHash("sha256").update(input, "utf8").digest();
  const b = createHash("sha256").update(expected, "utf8").digest();
  return timingSafeEqual(a, b);
}

/**
 * Ensures a single shared guest account exists and returns a one-time
 * magic-link token hash the browser can redeem for a session.
 */
export async function mintGuestSessionToken(): Promise<string> {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const { error: createError } = await supabaseAdmin.auth.admin.createUser({
    email: GUEST_EMAIL,
    email_confirm: true,
    user_metadata: { shared_guest: true },
  });
  // Already exists is expected on every call after the first.
  if (createError && !/already/i.test(createError.message)) throw createError;

  const { data, error } = await supabaseAdmin.auth.admin.generateLink({
    type: "magiclink",
    email: GUEST_EMAIL,
  });
  if (error) throw error;

  const tokenHash = data.properties?.hashed_token;
  if (!tokenHash) throw new Error("Could not create a guest session");
  return tokenHash;
}
