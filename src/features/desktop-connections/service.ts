import { and, eq, gt, isNull } from "drizzle-orm";
import { db } from "@/infrastructure/db";
import {
  desktopConnectionCodes,
  desktopTokens,
  users,
  type User,
} from "@/infrastructure/db/schema";
import { generateApiKey } from "@/features/auth/api-keys/token";

const CODE_TTL_MS = 10 * 60 * 1000;
const CODE_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";

export async function createDesktopConnectionCode(user: User) {
  if (user.status !== "approved") {
    throw new Error("APPROVAL_REQUIRED");
  }

  await db
    .delete(desktopConnectionCodes)
    .where(eq(desktopConnectionCodes.clerkId, user.clerkId));

  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateConnectionCode();
    const expiresAt = new Date(Date.now() + CODE_TTL_MS);

    try {
      await db.insert(desktopConnectionCodes).values({
        code,
        clerkId: user.clerkId,
        expiresAt,
      });

      return {
        code,
        expiresAt: expiresAt.toISOString(),
      };
    } catch {
      // Retry on an unlikely code collision.
    }
  }

  throw new Error("CODE_GENERATION_FAILED");
}

export async function activateDesktopConnection(
  codeInput: string,
  deviceName?: string
) {
  const code = normalizeConnectionCode(codeInput);
  if (!code) return null;

  const rows = await db
    .select({ connection: desktopConnectionCodes, user: users })
    .from(desktopConnectionCodes)
    .innerJoin(users, eq(users.clerkId, desktopConnectionCodes.clerkId))
    .where(
      and(
        eq(desktopConnectionCodes.code, code),
        isNull(desktopConnectionCodes.usedAt),
        gt(desktopConnectionCodes.expiresAt, new Date())
      )
    )
    .limit(1);

  if (rows.length === 0) return null;

  const { connection, user } = rows[0];
  if (user.status !== "approved") return null;

  const token = await generateApiKey();
  const name = (deviceName || "HUDTyping desktop").trim().slice(0, 80);

  await db.insert(desktopTokens).values({
    clerkId: user.clerkId,
    name,
    prefix: token.prefix,
    hash: token.hash,
  });

  await db
    .update(desktopConnectionCodes)
    .set({ usedAt: new Date() })
    .where(eq(desktopConnectionCodes.code, connection.code));

  return {
    token: token.plain,
    user: {
      email: user.email,
      name: [user.lastName, user.firstName].filter(Boolean).join("") || user.email,
    },
  };
}

export async function revokeDesktopToken(clerkId: string, id: number) {
  const deleted = await db
    .delete(desktopTokens)
    .where(and(eq(desktopTokens.id, id), eq(desktopTokens.clerkId, clerkId)))
    .returning({ id: desktopTokens.id });

  return deleted.length > 0;
}

export async function listDesktopTokens(clerkId: string) {
  return db
    .select({
      id: desktopTokens.id,
      name: desktopTokens.name,
      prefix: desktopTokens.prefix,
      lastUsedAt: desktopTokens.lastUsedAt,
      createdAt: desktopTokens.createdAt,
    })
    .from(desktopTokens)
    .where(eq(desktopTokens.clerkId, clerkId));
}

function generateConnectionCode() {
  const bytes = new Uint8Array(10);
  globalThis.crypto.getRandomValues(bytes);
  let code = "";
  for (const byte of bytes) {
    code += CODE_ALPHABET[byte % CODE_ALPHABET.length];
  }
  return code.match(/.{1,5}/g)?.join("-") ?? code;
}

function normalizeConnectionCode(input: string) {
  return input
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .replace(/(.{5})(?=.)/g, "$1-");
}
