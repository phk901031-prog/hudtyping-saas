// src/features/licenses/service.ts
// 낱말지기(hudtyping-local) 정품 라이선스 비즈니스 로직.
//
// 핵심 규칙(악용 방지): licenses.expiresAt 은 lifetime이면 항상 NULL, annual/trial이면
// **최초 활성화 시점에 딱 한 번** activatedAt + durationDays 로 계산해서 licenses 테이블에
// 고정 저장한다. 이후 같은 키로 재활성화(재설치 등)해도 이 값을 다시 계산하지 않는다 —
// 그래서 체험판을 지우고 다시 깔아도 기간이 늘어나지 않는다.

import { and, eq, isNull, sql } from "drizzle-orm";
import { db } from "@/infrastructure/db";
import {
  licenses,
  licenseActivations,
  type License,
  type LicensePlan,
} from "@/infrastructure/db/schema";
import { signLicenseToken } from "./signing";

const KEY_ALPHABET = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ"; // 0/1/I/O 등 혼동 문자 제외
const KEY_PREFIX = "HDTP";

export type LicenseErrorCode = "INVALID_KEY" | "REVOKED" | "EXPIRED" | "SLOT_FULL";

export interface LicenseActionResult {
  token: string;
  plan: LicensePlan;
  expiresAt: string | null;
}

function generateLicenseKey(): string {
  const bytes = new Uint8Array(12);
  globalThis.crypto.getRandomValues(bytes);
  let body = "";
  for (const b of bytes) body += KEY_ALPHABET[b % KEY_ALPHABET.length];
  const grouped = body.match(/.{1,4}/g)!.join("-");
  return `${KEY_PREFIX}-${grouped}`;
}

/** 사용자가 대소문자·공백·하이픈을 다르게 입력해도 같은 키로 인식하게 정규화 */
export function normalizeLicenseKey(input: string): string {
  const cleaned = input.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
  if (cleaned.startsWith(KEY_PREFIX) && cleaned.length === KEY_PREFIX.length + 12) {
    const body = cleaned.slice(KEY_PREFIX.length);
    return `${KEY_PREFIX}-${body.match(/.{1,4}/g)!.join("-")}`;
  }
  return cleaned;
}

async function countActiveActivations(licenseKey: string): Promise<number> {
  const [row] = await db
    .select({ cnt: sql<number>`COUNT(*)::int` })
    .from(licenseActivations)
    .where(
      and(eq(licenseActivations.licenseKey, licenseKey), isNull(licenseActivations.deactivatedAt))
    );
  return row?.cnt ?? 0;
}

function isExpired(license: Pick<License, "expiresAt">): boolean {
  return !!license.expiresAt && license.expiresAt.getTime() < Date.now();
}

/**
 * 라이선스 활성화. 같은 지문으로 이미 활성화된 적 있으면(재설치 등) 슬롯을 새로 안 쓰고
 * 토큰만 재발급한다 — 이때도 expiresAt은 절대 다시 계산하지 않는다.
 */
export async function activateLicense(
  keyInput: string,
  fingerprint: string,
  deviceName?: string
): Promise<LicenseActionResult | { error: LicenseErrorCode }> {
  const key = normalizeLicenseKey(keyInput);
  if (!key) return { error: "INVALID_KEY" };

  const [license] = await db.select().from(licenses).where(eq(licenses.key, key)).limit(1);
  if (!license) return { error: "INVALID_KEY" };
  if (license.revokedAt) return { error: "REVOKED" };

  const now = new Date();

  const [existingActivation] = await db
    .select()
    .from(licenseActivations)
    .where(
      and(
        eq(licenseActivations.licenseKey, key),
        eq(licenseActivations.fingerprint, fingerprint),
        isNull(licenseActivations.deactivatedAt)
      )
    )
    .limit(1);

  if (!existingActivation) {
    const activeCount = await countActiveActivations(key);
    if (activeCount >= license.maxActivations) {
      return { error: "SLOT_FULL" };
    }
  }

  // 최초 활성화 시점에만 만료일을 계산해서 고정 — 재활성화 시에는 절대 건드리지 않는다.
  let activatedAt = license.activatedAt;
  let expiresAt = license.expiresAt;
  if (license.plan !== "lifetime" && !license.activatedAt) {
    activatedAt = now;
    expiresAt = license.durationDays
      ? new Date(now.getTime() + license.durationDays * 24 * 60 * 60 * 1000)
      : null;
    await db.update(licenses).set({ activatedAt, expiresAt }).where(eq(licenses.key, key));
  }

  if (isExpired({ expiresAt })) {
    return { error: "EXPIRED" };
  }

  const activation =
    existingActivation ??
    (
      await db
        .insert(licenseActivations)
        .values({
          licenseKey: key,
          fingerprint,
          deviceName: deviceName?.trim().slice(0, 80) || null,
          lastSeenAt: now,
        })
        .returning()
    )[0];

  if (existingActivation) {
    await db
      .update(licenseActivations)
      .set({ lastSeenAt: now })
      .where(eq(licenseActivations.id, existingActivation.id));
  }

  const token = await signLicenseToken({
    licenseKey: key,
    fingerprint,
    plan: license.plan,
    activatedAt: (activatedAt ?? now).toISOString(),
    expiresAt: expiresAt ? expiresAt.toISOString() : null,
    activationId: activation.id,
  });

  return { token, plan: license.plan, expiresAt: expiresAt ? expiresAt.toISOString() : null };
}

/** 선택적 주기 재확인 — 회수·만료 여부를 다시 확인하고 신선한 토큰을 재발급한다. */
export async function checkinLicense(
  keyInput: string,
  fingerprint: string
): Promise<LicenseActionResult | { error: LicenseErrorCode }> {
  const key = normalizeLicenseKey(keyInput);
  const [license] = await db.select().from(licenses).where(eq(licenses.key, key)).limit(1);
  if (!license) return { error: "INVALID_KEY" };
  if (license.revokedAt) return { error: "REVOKED" };
  if (isExpired(license)) return { error: "EXPIRED" };

  const [activation] = await db
    .select()
    .from(licenseActivations)
    .where(
      and(
        eq(licenseActivations.licenseKey, key),
        eq(licenseActivations.fingerprint, fingerprint),
        isNull(licenseActivations.deactivatedAt)
      )
    )
    .limit(1);
  if (!activation) return { error: "INVALID_KEY" };

  await db
    .update(licenseActivations)
    .set({ lastSeenAt: new Date() })
    .where(eq(licenseActivations.id, activation.id));

  const token = await signLicenseToken({
    licenseKey: key,
    fingerprint,
    plan: license.plan,
    activatedAt: (license.activatedAt ?? new Date()).toISOString(),
    expiresAt: license.expiresAt ? license.expiresAt.toISOString() : null,
    activationId: activation.id,
  });

  return {
    token,
    plan: license.plan,
    expiresAt: license.expiresAt ? license.expiresAt.toISOString() : null,
  };
}

/** 사용자가 이 PC의 슬롯을 반납(다른 PC에서 쓰려고 등) */
export async function deactivateLicenseSlot(
  keyInput: string,
  fingerprint: string
): Promise<boolean> {
  const key = normalizeLicenseKey(keyInput);
  const updated = await db
    .update(licenseActivations)
    .set({ deactivatedAt: new Date(), deactivationReason: "user" })
    .where(
      and(
        eq(licenseActivations.licenseKey, key),
        eq(licenseActivations.fingerprint, fingerprint),
        isNull(licenseActivations.deactivatedAt)
      )
    )
    .returning({ id: licenseActivations.id });
  return updated.length > 0;
}

// ──────────────────────────────────────────────────────────────────────
// 관리자 전용
// ──────────────────────────────────────────────────────────────────────

export interface IssueLicenseInput {
  plan: LicensePlan;
  durationDays?: number;
  issuedToEmail?: string;
  notes?: string;
  maxActivations?: number;
  createdBy: string;
}

export async function issueLicense(input: IssueLicenseInput): Promise<License> {
  if (input.plan !== "lifetime" && !input.durationDays) {
    throw new Error("annual/trial 플랜은 durationDays가 필요합니다.");
  }

  for (let attempt = 0; attempt < 5; attempt++) {
    const key = generateLicenseKey();
    try {
      const [inserted] = await db
        .insert(licenses)
        .values({
          key,
          plan: input.plan,
          durationDays: input.plan === "lifetime" ? null : (input.durationDays ?? null),
          issuedToEmail: input.issuedToEmail?.trim() || null,
          notes: input.notes?.trim() || null,
          maxActivations: input.maxActivations ?? 1,
          createdBy: input.createdBy,
        })
        .returning();
      return inserted;
    } catch {
      // 키 충돌 시(극히 드묾) 재시도
    }
  }
  throw new Error("라이선스 키 생성에 반복 실패했습니다.");
}

export async function listLicenses(limit = 200) {
  return db
    .select()
    .from(licenses)
    .orderBy(sql`${licenses.issuedAt} DESC`)
    .limit(limit);
}

export async function getLicenseActivations(keyInput: string) {
  const key = normalizeLicenseKey(keyInput);
  return db
    .select()
    .from(licenseActivations)
    .where(eq(licenseActivations.licenseKey, key))
    .orderBy(sql`${licenseActivations.activatedAt} DESC`);
}

export async function revokeLicense(keyInput: string): Promise<License | null> {
  const key = normalizeLicenseKey(keyInput);
  const [updated] = await db
    .update(licenses)
    .set({ revokedAt: new Date() })
    .where(eq(licenses.key, key))
    .returning();
  return updated ?? null;
}

export async function unrevokeLicense(keyInput: string): Promise<License | null> {
  const key = normalizeLicenseKey(keyInput);
  const [updated] = await db
    .update(licenses)
    .set({ revokedAt: null })
    .where(eq(licenses.key, key))
    .returning();
  return updated ?? null;
}

export async function forceDeactivateSlot(activationId: number) {
  const [updated] = await db
    .update(licenseActivations)
    .set({ deactivatedAt: new Date(), deactivationReason: "admin" })
    .where(eq(licenseActivations.id, activationId))
    .returning();
  return updated ?? null;
}
