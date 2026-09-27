// Content moderation utility for topfastfood.lol
// Ensures fast-food banter & playful roasting is allowed, while strictly blocking
// hate speech, slurs, doxxing, phone numbers, scam links, and harassment.

export interface ModerationResult {
  isValid: boolean;
  reason?: string;
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

// 2. Phone numbers & Personal Information (Doxxing prevention)
// Matches 7+ consecutive digits, US/international phone formats
const PHONE_DOXXING_REGEX =
  /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\b\d{7,12}\b/;

// 3. Links / URLs / Crypto Scam promo
const URL_SPAM_REGEX =
  /https?:\/\/|www\.|\.(?:com|org|net|xyz|ru|top|vip|link|io|gg|cc|me|tk|ml|ga|cf|gq)\b|t\.me\/|wa\.me\/|discord\.gg\//i;

// 4. HTML / Script injection attempt
const SCRIPT_INJECTION_REGEX = /<script\b|javascript:|onerror=|<iframe\b|<img\b/i;

export function validateContent(
  text: string,
  field: "brand" | "message" | "author" | "location" = "message"
): ModerationResult {
  if (!text || !text.trim()) {
    return { isValid: true };
  }

  const cleanText = text.trim();

  // Check script injection
  if (SCRIPT_INJECTION_REGEX.test(cleanText)) {
    return {
      isValid: false,
      reason: "HTML or script tags are strictly prohibited.",
    };
  }

  // Check URLs / Spam Links
  if (URL_SPAM_REGEX.test(cleanText)) {
    return {
      isValid: false,
      reason: "Links, URLs, and domains are not allowed.",
    };
  }

  // Check Phone Numbers / Doxxing
  if (PHONE_DOXXING_REGEX.test(cleanText)) {
    return {
      isValid: false,
      reason: "Phone numbers and personal contact information are prohibited.",
    };
  }

  // Check Severe Slurs & Hate Speech
  if (SEVERE_SLURS_REGEX.test(cleanText)) {
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
    if (cleanText.length > 35) {
      return { isValid: false, reason: "Brand name cannot exceed 35 characters." };
    }
    // Only allow alphanumeric, spaces, and standard fast food punctuation
    if (!/^[a-zA-Z0-9\s'’&.\-!#+]+$/.test(cleanText)) {
      return {
        isValid: false,
        reason: "Brand name contains invalid symbols.",
      };
    }
  }

  if (field === "author") {
    if (cleanText.length > 30) {
      return { isValid: false, reason: "Identity name cannot exceed 30 characters." };
    }
    if (!/^[a-zA-Z0-9_@\s'’.\-]+$/.test(cleanText)) {
      return {
        isValid: false,
        reason: "Identity contains invalid characters.",
      };
    }
  }

  return { isValid: true };
}
