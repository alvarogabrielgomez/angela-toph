import raw from "./profile.json";

/**
 * Single source of truth for the site's content: edit `profile.json`.
 *
 * This module types the JSON and validates it when it loads. Next.js imports it
 * while prerendering, so an invalid profile fails `next build` instead of
 * shipping a broken page.
 *
 * The languages live in the JSON too: `languages` lists each code with its
 * display name and Open Graph locale, and `bios` and `metaDescriptions` carry
 * one text per listed code. Link icons live there as well: a built-in name, a
 * custom SVG, or the generic link glyph.
 */

/** A language code from `languages`: two lowercase letters, like "es". */
export type Lang = string;

export interface Language {
  /** Two lowercase letters: the browser detection cuts to 2 letters. */
  code: Lang;
  /** Name in its own language, used for the accessible switcher label. */
  name: string;
  /** Open Graph locale, like "es_ES". */
  ogLocale: string;
}

/** Icons drawn by `components/icons.tsx`; a link can name one in `icon`. */
export const BUILTIN_ICONS = ["linkedin", "blog", "youtube", "instagram", "behance"] as const;
export type BuiltinIcon = (typeof BUILTIN_ICONS)[number];

export type LinkIcon =
  | { kind: "builtin"; name: BuiltinIcon }
  | { kind: "custom"; viewBox: string; paths: string[] }
  | { kind: "generic" };

export interface LinkItem {
  /** Lowercase letters, digits and hyphens; unique across links. */
  key: string;
  label: string;
  handle: string;
  url: string;
  /** One-line description, used in llms.txt. */
  description: string;
  icon: LinkIcon;
}

export interface Profile {
  siteUrl: string;
  lastModified: string;
  person: {
    name: string;
    firstName: string;
    lastName: string;
    role: string;
    /** Path under `public/`, starting with "/". */
    photo: string;
    focus: string[];
    /** Link keys that identify the person (schema.org `sameAs`). */
    sameAs: string[];
  };
  organization: {
    name: string;
    url: string;
    /** Link keys that belong to the organization (schema.org `sameAs`). */
    sameAs: string[];
  };
  keywords: string[];
  llmsSummary: string;
  /** Must be one of the codes in `languages`. */
  defaultLanguage: Lang;
  /** At least one. The switcher shows only when there are two or more. */
  languages: Language[];
  bios: Record<Lang, string>;
  metaDescriptions: Record<Lang, string>;
  links: LinkItem[];
}

function fail(message: string): never {
  throw new Error(`src/data/profile.json: ${message}`);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function text(value: unknown, path: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    fail(`"${path}" must be a non-empty string`);
  }
  return value;
}

function url(value: unknown, path: string): string {
  const s = text(value, path);
  if (!/^https?:\/\//.test(s)) fail(`"${path}" must be an http(s) URL, got "${s}"`);
  return s;
}

function textList(value: unknown, path: string): string[] {
  if (!Array.isArray(value) || value.length === 0) fail(`"${path}" must be a non-empty list`);
  return value.map((item, i) => text(item, `${path}[${i}]`));
}

function isBuiltinIcon(value: unknown): value is BuiltinIcon {
  return BUILTIN_ICONS.includes(value as BuiltinIcon);
}

const LINK_KEY = /^[a-z0-9-]+$/;
const VIEW_BOX = /^-?\d+(\.\d+)? -?\d+(\.\d+)? \d+(\.\d+)? \d+(\.\d+)?$/;
// Only path commands, numbers and separators: nothing that could close the
// `d` attribute or open a tag.
const PATH_DATA = /^[MmLlHhVvCcSsQqTtAaZz0-9.,\s-]+$/;
// The browser language detection cuts to 2 letters, so a code must be 2 letters.
const LANG_CODE = /^[a-z]{2}$/;
const OG_LOCALE = /^[a-z]{2}_[A-Z]{2}$/;

function linkKey(value: unknown, path: string, seen: Set<string>): string {
  const key = text(value, path);
  if (!LINK_KEY.test(key)) {
    fail(`"${path}" must match ${LINK_KEY} (lowercase letters, digits and "-"), got "${key}"`);
  }
  if (seen.has(key)) fail(`"${path}" "${key}" is repeated`);
  seen.add(key);
  return key;
}

function linkIcon(value: unknown, key: string, path: string): LinkIcon {
  if (value === undefined) {
    return isBuiltinIcon(key) ? { kind: "builtin", name: key } : { kind: "generic" };
  }
  if (typeof value === "string") {
    if (!isBuiltinIcon(value)) {
      fail(`"${path}" is "${value}"; built-in icons: ${BUILTIN_ICONS.join(", ")}`);
    }
    return { kind: "builtin", name: value };
  }
  if (!isRecord(value)) {
    fail(`"${path}" must be a built-in icon name or an object with "viewBox" and "paths"`);
  }
  const viewBox = text(value.viewBox, `${path}.viewBox`);
  if (!VIEW_BOX.test(viewBox)) {
    fail(`"${path}.viewBox" must be four numbers like "0 0 24 24", got "${viewBox}"`);
  }
  const paths = textList(value.paths, `${path}.paths`).map((d, i) => {
    if (!PATH_DATA.test(d)) fail(`"${path}.paths[${i}]" must contain only SVG path commands`);
    return d;
  });
  return { kind: "custom", viewBox, paths };
}

function languageList(value: unknown): Language[] {
  if (!Array.isArray(value) || value.length === 0) fail(`"languages" must be a non-empty list`);
  const seen = new Set<string>();
  return value.map((item, i): Language => {
    const language = section(item, `languages[${i}]`);
    const code = text(language.code, `languages[${i}].code`);
    if (!LANG_CODE.test(code)) {
      fail(`"languages[${i}].code" must match ${LANG_CODE} (two lowercase letters), got "${code}"`);
    }
    if (seen.has(code)) fail(`"languages[${i}].code" "${code}" is repeated`);
    seen.add(code);
    const name = text(language.name, `languages[${i}].name`);
    const ogLocale = text(language.ogLocale, `languages[${i}].ogLocale`);
    if (!OG_LOCALE.test(ogLocale)) {
      fail(`"languages[${i}].ogLocale" must match ${OG_LOCALE} (like "es_ES"), got "${ogLocale}"`);
    }
    return { code, name, ogLocale };
  });
}

/** One non-empty text per listed language code, and no text for any other. */
function perLang(value: unknown, path: string, codes: readonly Lang[]): Record<Lang, string> {
  if (!isRecord(value)) fail(`"${path}" must be an object with keys ${codes.join(", ")}`);
  const out: Record<Lang, string> = {};
  for (const code of codes) out[code] = text(value[code], `${path}.${code}`);
  for (const key of Object.keys(value)) {
    if (!codes.includes(key)) fail(`"${path}.${key}" is not in "languages"`);
  }
  return out;
}

function section(value: unknown, path: string): Record<string, unknown> {
  if (!isRecord(value)) fail(`"${path}" must be an object`);
  return value;
}

export function validateProfile(data: unknown): Profile {
  const root = section(data, "(root)");

  const links = (() => {
    if (!Array.isArray(root.links) || root.links.length === 0) fail(`"links" must be a non-empty list`);
    const seen = new Set<string>();
    return root.links.map((item, i): LinkItem => {
      const link = section(item, `links[${i}]`);
      const key = linkKey(link.key, `links[${i}].key`, seen);
      return {
        key,
        label: text(link.label, `links[${i}].label`),
        handle: text(link.handle, `links[${i}].handle`),
        url: url(link.url, `links[${i}].url`),
        description: text(link.description, `links[${i}].description`),
        icon: linkIcon(link.icon, key, `links[${i}].icon`),
      };
    });
  })();

  const linked = new Set(links.map((l) => l.key));
  const linkKeys = (value: unknown, path: string): string[] => {
    if (!Array.isArray(value)) fail(`"${path}" must be a list of link keys`);
    return value.map((item, i) => {
      const key = text(item, `${path}[${i}]`);
      if (!linked.has(key)) fail(`"${path}[${i}]" is "${key}", which is not in "links"`);
      return key;
    });
  };

  const person = section(root.person, "person");
  const photo = text(person.photo, "person.photo");
  if (!photo.startsWith("/")) fail(`"person.photo" must start with "/" (a path under public/)`);

  const organization = section(root.organization, "organization");

  const languages = languageList(root.languages);
  const codes = languages.map((l) => l.code);
  const defaultLanguage = text(root.defaultLanguage, "defaultLanguage");
  if (!codes.includes(defaultLanguage)) {
    fail(`"defaultLanguage" is "${defaultLanguage}", which is not in "languages"`);
  }

  return {
    siteUrl: url(root.siteUrl, "siteUrl"),
    lastModified: (() => {
      const d = text(root.lastModified, "lastModified");
      if (!/^\d{4}-\d{2}-\d{2}$/.test(d)) fail(`"lastModified" must be YYYY-MM-DD, got "${d}"`);
      return d;
    })(),
    person: {
      name: text(person.name, "person.name"),
      firstName: text(person.firstName, "person.firstName"),
      lastName: text(person.lastName, "person.lastName"),
      role: text(person.role, "person.role"),
      photo,
      focus: textList(person.focus, "person.focus"),
      sameAs: linkKeys(person.sameAs, "person.sameAs"),
    },
    organization: {
      name: text(organization.name, "organization.name"),
      url: url(organization.url, "organization.url"),
      sameAs: linkKeys(organization.sameAs, "organization.sameAs"),
    },
    keywords: textList(root.keywords, "keywords"),
    llmsSummary: text(root.llmsSummary, "llmsSummary"),
    defaultLanguage,
    languages,
    bios: perLang(root.bios, "bios", codes),
    metaDescriptions: perLang(root.metaDescriptions, "metaDescriptions", codes),
    links,
  };
}

export const profile: Profile = validateProfile(raw);
