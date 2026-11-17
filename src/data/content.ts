import { profile, type Lang } from "@/data/profile";

// Content lives in profile.json; this module re-exports it under the names the
// UI already uses, plus the language helpers.
export { type Lang, type LinkIcon, type LinkItem } from "@/data/profile";

/** Language codes, in the order `languages` lists them in profile.json. */
export const LANGS: readonly Lang[] = profile.languages.map((l) => l.code);

export const DEFAULT_LANG: Lang = profile.defaultLanguage;

/** Language names for the accessible control labels. */
export const LANG_NAMES: Record<Lang, string> = Object.fromEntries(
  profile.languages.map((l) => [l.code, l.name]),
);

/** Open Graph locale per language code. */
export const OG_LOCALES: Record<Lang, string> = Object.fromEntries(
  profile.languages.map((l) => [l.code, l.ogLocale]),
);

/** localStorage key for the user's last chosen language. */
export const LANG_STORAGE_KEY = "angela-lang";

export function isLang(value: unknown): value is Lang {
  return typeof value === "string" && LANGS.includes(value);
}

/** Bio copy per language. */
export const bios = profile.bios;

/** Concise (~150 char) SEO meta descriptions — the full bio is too long for a SERP snippet. */
export const metaDescriptions = profile.metaDescriptions;

export const links = profile.links;
