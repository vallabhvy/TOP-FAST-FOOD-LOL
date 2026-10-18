/**
 * Security utilities for topfastfood.lol
 * Provides centralized origin verification, rate limiting, URL validation, and input sanitization.
 */

// ── 1. Origin & Referer Verification (CORS / CSRF Defense) ───────────────────
const ALLOWED_HOSTNAMES = new Set([
  "topfastfood.lol",
  "www.topfastfood.lol",
  "localhost",
  "127.0.0.1",
]);

/**
 * Validates that an incoming HTTP request originated from an authorized frontend domain.
 * Strictly parses hostnames rather than using substring matching to prevent subdomain / query hijacking.
 */
export function isValidOrigin(req: Request): boolean {
  const originHeader = req.headers.get("origin");
  const refererHeader = req.headers.get("referer");
  const target = originHeader || refererHeader;

  if (!target) {
    // If neither origin nor referer is provided (e.g. server-to-server or strict privacy headers),
    // verify host/x-forwarded-host matches our server
    const host = (req.headers.get("x-forwarded-host") || req.headers.get("host") || "").split(":")[0].toLowerCase();
    if (!host) return false;
    return (
      ALLOWED_HOSTNAMES.has(host) ||
      host.endsWith(".vercel.app")
    );
  }

  try {
    const url = new URL(target);
    const hostname = url.hostname.toLowerCase();

    // Exact match for configured production or local domains
    if (ALLOWED_HOSTNAMES.has(hostname)) {
      return true;
    }

    // Allow Vercel preview environments (*.vercel.app)
    if (hostname.endsWith(".vercel.app")) {
      return true;
    }

    return false;
  } catch {
    return false;
  }
}

// ── 2. UUID Validation ───────────────────────────────────────────────────────
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function isValidUUID(id: unknown): id is string {
  if (typeof id !== "string") return false;
  return UUID_REGEX.test(id.trim());
}

// ── 3. Secure HTTPS URL Validation ───────────────────────────────────────────
const TRUSTED_AVATAR_HOSTS = new Set([
  "unavatar.io",
  "ui-avatars.com",
  "pbs.twimg.com",
  "abs.twimg.com",
  "api.dicebear.com",
  "avatars.githubusercontent.com",
  "lh3.googleusercontent.com",
]);

/**
 * Validates that an avatar URL uses https://, has no script payload,
 * and optionally belongs to a trusted avatar host.
 */
export function isValidAvatarUrl(url: unknown): boolean {
  if (!url || typeof url !== "string") return false;
  const clean = url.trim();
  if (clean.length > 500) return false;

  try {
    const parsed = new URL(clean);
    if (parsed.protocol !== "https:") return false;
    const hostname = parsed.hostname.toLowerCase();

    // Check against trusted image CDNs
    if (TRUSTED_AVATAR_HOSTS.has(hostname)) return true;

    // Check if it's a subdomain of an allowed host (e.g. *.supabase.co)
    if (hostname.endsWith(".supabase.co") || hostname.endsWith(".twimg.com")) {
      return true;
    }

    return false;
  } catch {
    return false;
  }
}

// ── 4. Standard In-Memory Rate Limiter with Automatic Hygiene ────────────────
interface RateLimitEntry {
  count: number;
  resetAt: number;
}

export interface RateLimiterOptions {
  windowMs: number;
  maxRequests: number;
  maxEntries?: number;
}

export function createRateLimiter(options: RateLimiterOptions) {
  const store = new Map<string, RateLimitEntry>();
  const { windowMs, maxRequests, maxEntries = 2000 } = options;

  return {
    check(ip: string): { isLimited: boolean; remaining: number; resetInSec: number } {
      const now = Date.now();
      const entry = store.get(ip);

      // Periodically purge stale keys to avoid unbounded memory growth
      if (store.size > maxEntries) {
        for (const [key, val] of store.entries()) {
          if (now >= val.resetAt) {
            store.delete(key);
          }
        }
      }

      if (!entry || now >= entry.resetAt) {
        store.set(ip, { count: 1, resetAt: now + windowMs });
        return {
          isLimited: false,
          remaining: maxRequests - 1,
          resetInSec: Math.ceil(windowMs / 1000),
        };
      }

      entry.count++;
      const isLimited = entry.count > maxRequests;
      const remaining = Math.max(0, maxRequests - entry.count);
      const resetInSec = Math.ceil((entry.resetAt - now) / 1000);

      return { isLimited, remaining, resetInSec };
    },
  };
}

// ── 5. Client IP Extractor ──────────────────────────────────────────────────
export function getClientIp(req: Request): string {
  const forwarded = req.headers.get("x-forwarded-for");
  if (forwarded) {
    const first = forwarded.split(",")[0]?.trim();
    if (first && /^[0-9a-fA-F:.]+$/.test(first)) {
      return first;
    }
  }

  const realIp = req.headers.get("x-real-ip")?.trim();
  if (realIp && /^[0-9a-fA-F:.]+$/.test(realIp)) {
    return realIp;
  }

  const cfIp = req.headers.get("cf-connecting-ip")?.trim();
  if (cfIp && /^[0-9a-fA-F:.]+$/.test(cfIp)) {
    return cfIp;
  }

  return "unknown";
}

// ── 6. Header Sanitizer (Defeats Log Injection / CRLF Injection) ────────────
export function sanitizeHeader(val: string | null, maxLen = 60): string {
  if (!val) return "";
  return val
    .replace(/[\r\n\t<>]/g, "")
    .trim()
    .slice(0, maxLen);
}
