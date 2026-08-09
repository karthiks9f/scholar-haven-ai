import { createServerFn } from "@tanstack/react-start";

export const redeemAccessKey = createServerFn({ method: "POST" })
  .inputValidator((data: { key: string }) => {
    const key = typeof data?.key === "string" ? data.key.trim() : "";
    if (key.length < 4 || key.length > 200) throw new Error("Invalid access key");
    return { key };
  })
  .handler(async ({ data }) => {
    const expected = process.env["VAULT_ACCESS_KEY"];
    if (!expected) return { ok: false as const };

    const { accessKeyMatches, mintGuestSessionToken } = await import("./guest-access.server");
    if (!accessKeyMatches(data.key, expected)) return { ok: false as const };

    const tokenHash = await mintGuestSessionToken();
    return { ok: true as const, tokenHash };
  });
