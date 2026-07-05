export type AppVersionDecision =
  | { allowed: true; appVersion: string | null; clientType: string }
  | {
      allowed: false;
      appVersion: string | null;
      clientType: string;
      minVersion: string;
    };

const DEFAULT_MIN_SUPPORTED_VERSION = "0.2.10";

export function getClientVersionMeta(headers: Headers): {
  appVersion: string | null;
  clientType: string;
} {
  const appVersion = normalizeVersionHeader(headers.get("x-app-version"));
  const clientType = headers.get("x-client-type")?.trim() || inferClientType(headers);
  return { appVersion, clientType };
}

export function checkAppVersion(
  appVersion: string | null,
  clientType: string
): AppVersionDecision {
  if (clientType !== "desktop") {
    return { allowed: true, appVersion, clientType };
  }

  const minVersion =
    normalizeVersionHeader(process.env.MIN_SUPPORTED_APP_VERSION) ??
    DEFAULT_MIN_SUPPORTED_VERSION;

  if (!appVersion) {
    const blockLegacy =
      process.env.BLOCK_LEGACY_APP_WITHOUT_VERSION?.toLowerCase() !== "false";
    if (!blockLegacy) {
      return { allowed: true, appVersion, clientType };
    }
    return { allowed: false, appVersion, clientType, minVersion };
  }

  if (compareSemver(appVersion, minVersion) < 0) {
    return { allowed: false, appVersion, clientType, minVersion };
  }

  return { allowed: true, appVersion, clientType };
}

function inferClientType(headers: Headers): string {
  const authHeader = headers.get("authorization") ?? "";
  return authHeader.toLowerCase().startsWith("bearer ") ? "desktop" : "web";
}

function normalizeVersionHeader(value: string | null | undefined): string | null {
  if (!value) return null;
  const normalized = value.trim().replace(/^v/i, "");
  return /^\d+\.\d+\.\d+(?:[-+][0-9a-z.-]+)?$/i.test(normalized)
    ? normalized
    : null;
}

function compareSemver(a: string, b: string): number {
  const left = parseCore(a);
  const right = parseCore(b);

  for (let i = 0; i < 3; i++) {
    if (left[i] !== right[i]) return left[i] > right[i] ? 1 : -1;
  }
  return 0;
}

function parseCore(version: string): [number, number, number] {
  const [major = "0", minor = "0", patch = "0"] = version
    .split(/[+-]/)[0]
    .split(".");
  return [Number(major) || 0, Number(minor) || 0, Number(patch) || 0];
}
