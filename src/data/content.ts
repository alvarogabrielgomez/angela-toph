import { LANGS, profile, type Lang } from "@/data/profile";

// Content lives in profile.json; this module re-exports it under the names the
// UI already uses, plus the language helpers.
export { LANGS, type Lang, type LinkIcon, type LinkItem } from "@/data/profile";

export const DEFAULT_LANG: Lang = "es";

/** localStorage key for the user's last chosen language. */
export const LANG_STORAGE_KEY = "angela-lang";

export function isLang(value: unknown): value is Lang {
  return LANGS.includes(value as Lang);
}

/** Bio copy per language. */
export const bios = profile.bios;

/** Concise (~150 char) SEO meta descriptions — the full bio is too long for a SERP snippet. */
export const metaDescriptions = profile.metaDescriptions;

/** Full language names for accessible control labels. */
export const LANG_NAMES = profile.languageNames;

export const links = profile.links;
