// Content moderation utility for topfastfood.lol
// Ensures fast-food banter & playful roasting is allowed, while strictly blocking
// hate speech, slurs, doxxing, phone numbers, scam links, and harassment.

export interface ModerationResult {
  isValid: boolean;
  reason?: string;
}

// ── Field length limits (enforced both client-side and server-side) ──────────
export const FIELD_LIMITS = {
  brand: 35,
  message: 40,
  author: 30,
  location: 30,
} as const;

// ── Normalization: defeat space-separated, repeated-char, & homoglyph evasion ─
// Maps common unicode homoglyphs / leet substitutions to their ASCII base
const HOMOGLYPH_MAP: Record<string, string> = {
  "0": "o", "1": "i", "3": "e", "4": "a", "5": "s", "7": "t",
  "@": "a", "$": "s", "!": "i",
  "\u0430": "a", "\u0435": "e", "\u043E": "o", "\u0440": "p", "\u0441": "c", // Cyrillic lookalikes
  "\u200B": "",  "\u200C": "",  "\u200D": "",  "\uFEFF": "",              // Zero-width chars
};

/**
 * Normalizes text to expose slur evasion tactics:
 * 1. Lowercase
 * 2. Replace unicode homoglyphs with ASCII equivalents
 * 3. Strip zero-width characters and extra whitespace between single chars
 * 4. Collapse repeated characters (e.g. "faaaggg" → "fag")
 */
function normalizeForSlurCheck(text: string): string {
  let normalized = text.toLowerCase();

  // Replace homoglyphs
  normalized = normalized
    .split("")
    .map((ch) => HOMOGLYPH_MAP[ch] ?? ch)
    .join("");

  // Strip whitespace & zero-width chars between single letters (catches "n i g g e r")
  normalized = normalized.replace(/(?<=\w)\s+(?=\w)/g, "");

  // Collapse runs of 2+ identical characters down to 1 (catches "faaaggg" → "fag")
  normalized = normalized.replace(/(.)\1{1,}/g, "$1");

  return normalized;
}

// 1. Hard blocked severe profanity, racial/ethnic/religious slurs, and hate speech
// Note: Mild food trash talk like "sucks", "trash", "crap", "gross", "cardboard", "greasy", "poison", "clown" are intentionally ALLOWED.
const SEVERE_SLURS_REGEX = new RegExp(
  [
    // Racial / ethnic / religious / sexual orientation slurs & hate speech
    "\\bn[i1l]gg[e3a]r?s?\\b",
    "\\bf[a4]gg?[o0]ts?\\b",
    "\\bk[i1]k[e3]s?\\b",
    "\\bsp[i1]cs?\\b",
    "\\bch[i1]nk[s]?\\b",
    "\\bg[o0]{2}k[s]?\\b",
    "\\btr[a4]nn[y1]e?s?\\b",
    "\\br[e3]t[a4]rd(ed)?\\b",
    "\\bwh[o0]r[e3]s?\\b",
    "\\bc[u4]nts?\\b",
    "\\br[a4]p[e3]([i1]ng|st|d)?\\b",
    "\\bped[o0](ph[i1]l[e3])?s?\\b",
    "\\bh[i1]tl[e3]r\\b",
    "\\bn[a4]z[i1]s?\\b",
    "\\bkys\\b",
    "\\bk[i1]ll\\s+(yo)?urself\\b",
    "\\bgenoc[i1]d[e3]\\b",
  ].join("|"),
  "i"
);

// Also check the normalized (collapsed) form against simplified patterns
const NORMALIZED_SLURS_REGEX = new RegExp(
  [
    "nig+er?s?",
    "fag+o?ts?",
    "kikes?",
    "spics?",
    "chinks?",
    "go+ks?",
    "tran+y",
    "retard",
    "whores?",
    "cunts?",
    "rap(e|ing|ist|ed)",
    "pedo",
    "hitler",
    "nazis?",
    "kys",
    "kilyourself",
    "genocide",
  ].join("|"),
  "i"
);

// 2. Phone numbers & Personal Information (Doxxing prevention)
// Matches 7+ consecutive digits, US/international phone formats
const PHONE_DOXXING_REGEX =
  /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\b\d{7,12}\b/;

// 3. Email addresses (Doxxing prevention)
const EMAIL_REGEX = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/;

// 4. Links / URLs / Crypto Scam promo
const URL_SPAM_REGEX =
  /https?:\/\/|www\.|\.(?: com|org|net|xyz|ru|top|vip|link|io|gg|cc|me|tk|ml|ga|cf|gq)\b|t\.me\/|wa\.me\/|discord\.gg\//i;

// 5. HTML / Script injection attempt
const SCRIPT_INJECTION_REGEX = /<script\b|javascript:|onerror=|<iframe\b|<img\b/i;

// 6. Factual Defamation Traps (Health code, food poisoning, named employee attacks, criminal accusations)
// Comedic opinions ("tastes like cardboard", "trash", "overrated", "greasy") are protected parody/opinion.
// Factual assertions of disease, contamination, or named worker misconduct carry defamation risk.
const FACTUAL_DEFAMATION_REGEX = new RegExp(
  [
    "\\bfood\\s+poison(ing|ed)?\\b",
    "\\bsalmonella\\b",
    "\\be\\.?\\s*coli\\b",
    "\\bmaggots?\\b",
    "\\broaches?\\b",
    "\\brats?\\s+in\\s+(the)?\\s*(kitchen|food|burger|fryer)\\b",
    "\\bhealth\\s+code\\s+violat\\b",
    "\\bhealth\\s+inspector\\b",
    "\\bmanager\\s+at\\b",
    "\\bemployee\\s+named\\b",
    "\\barrested\\s+for\\b",
  ].join("|"),
  "i"
);

export function validateContent(
  text: string,
  field: "brand" | "message" | "author" | "location" = "message"
): ModerationResult {
  if (!text || !text.trim()) {
    return { isValid: true };
  }

  const cleanText = text.trim();

  // ── Universal length enforcement (server-side safety net) ──
  const maxLen = FIELD_LIMITS[field] ?? 40;
  if (cleanText.length > maxLen) {
    return {
      isValid: false,
      reason: `${field.charAt(0).toUpperCase() + field.slice(1)} cannot exceed ${maxLen} characters.`,
    };
  }

  // Check script injection
  if (SCRIPT_INJECTION_REGEX.test(cleanText)) {
    return {
      isValid: false,
      reason: "HTML or script tags are strictly prohibited.",
    };
  }

  // Check Factual Defamation allegations
  if (FACTUAL_DEFAMATION_REGEX.test(cleanText)) {
    return {
      isValid: false,
      reason: "Factual health claims, contamination allegations, or employee callouts are not permitted. Please keep roasts to opinions.",
    };
  }

  // Check URLs / Spam Links
  if (URL_SPAM_REGEX.test(cleanText)) {
    return {
      isValid: false,
      reason: "Links, URLs, and domains are not allowed.",
    };
  }

  // Check Email Addresses (Doxxing)
  if (EMAIL_REGEX.test(cleanText)) {
    return {
      isValid: false,
      reason: "Email addresses are not allowed to protect privacy.",
    };
  }

  // Check Phone Numbers / Doxxing
  if (PHONE_DOXXING_REGEX.test(cleanText)) {
    return {
      isValid: false,
      reason: "Phone numbers and personal contact information are prohibited.",
    };
  }

  // Check Severe Slurs & Hate Speech (original text)
  if (SEVERE_SLURS_REGEX.test(cleanText)) {
    return {
      isValid: false,
      reason: "Content contains prohibited hate speech, slurs, or harassment.",
    };
  }

  // Check Severe Slurs & Hate Speech (normalized text — catches evasion)
  const normalized = normalizeForSlurCheck(cleanText);
  if (NORMALIZED_SLURS_REGEX.test(normalized)) {
    return {
      isValid: false,
      reason: "Content contains prohibited hate speech, slurs, or harassment.",
    };
  }

  // Field-specific validation
  if (field === "brand") {
    // Brand name must be reasonable length fast-food name
    if (cleanText.length < 2) {
      return { isValid: false, reason: "Brand name must be at least 2 characters." };
    }
    // Only allow alphanumeric, spaces, and standard fast food punctuation
    if (!/^[a-zA-Z0-9\s''&.\-!#+]+$/.test(cleanText)) {
      return {
        isValid: false,
        reason: "Brand name contains invalid symbols.",
      };
    }
  }

  if (field === "author") {
    if (!/^[a-zA-Z0-9_@\s''.\-]+$/.test(cleanText)) {
      return {
        isValid: false,
        reason: "Identity contains invalid characters.",
      };
    }
  }

  return { isValid: true };
}
