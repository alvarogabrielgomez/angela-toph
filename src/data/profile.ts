import raw from "./profile.json";

/**
 * Single source of truth for the site's content: edit `profile.json`.
 *
 * This module types the JSON and validates it when it loads. Next.js imports it
 * while prerendering, so an invalid profile fails `next build` instead of
 * shipping a broken page.
 *
 * The languages and icon keys stay in code: each language needs locale wiring
 * and each network needs an SVG in `components/icons.tsx`.
 */

export const LANGS = ["es", "en", "pt"] as const;
export type Lang = (typeof LANGS)[number];

export const ICON_KEYS = ["linkedin", "blog", "youtube", "instagram", "behance"] as const;
export type IconKey = (typeof ICON_KEYS)[number];

export interface LinkItem {
  key: IconKey;
  label: string;
  handle: string;
  url: string;
  /** One-line description, used in llms.txt. */
  description: string;
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
    sameAs: IconKey[];
  };
  organization: {
    name: string;
    url: string;
    /** Link keys that belong to the organization (schema.org `sameAs`). */
    sameAs: IconKey[];
  };
  keywords: string[];
  llmsSummary: string;
  languageNames: Record<Lang, string>;
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

function iconKey(value: unknown, path: string): IconKey {
  if (!ICON_KEYS.includes(value as IconKey)) {
    fail(`"${path}" is "${String(value)}"; valid keys: ${ICON_KEYS.join(", ")}`);
  }
  return value as IconKey;
}

function perLang(value: unknown, path: string): Record<Lang, string> {
  if (!isRecord(value)) fail(`"${path}" must be an object with keys ${LANGS.join(", ")}`);
  const out = {} as Record<Lang, string>;
  for (const lang of LANGS) out[lang] = text(value[lang], `${path}.${lang}`);
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
    return root.links.map((item, i): LinkItem => {
      const link = section(item, `links[${i}]`);
      return {
        key: iconKey(link.key, `links[${i}].key`),
        label: text(link.label, `links[${i}].label`),
        handle: text(link.handle, `links[${i}].handle`),
        url: url(link.url, `links[${i}].url`),
        description: text(link.description, `links[${i}].description`),
      };
    });
  })();

  const linked = new Set(links.map((l) => l.key));
  const linkKeys = (value: unknown, path: string): IconKey[] => {
    if (!Array.isArray(value)) fail(`"${path}" must be a list of link keys`);
    return value.map((item, i) => {
      const key = iconKey(item, `${path}[${i}]`);
      if (!linked.has(key)) fail(`"${path}[${i}]" is "${key}", which is not in "links"`);
      return key;
    });
  };

  const person = section(root.person, "person");
  const photo = text(person.photo, "person.photo");
  if (!photo.startsWith("/")) fail(`"person.photo" must start with "/" (a path under public/)`);

  const organization = section(root.organization, "organization");

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
    languageNames: perLang(root.languageNames, "languageNames"),
    bios: perLang(root.bios, "bios"),
    metaDescriptions: perLang(root.metaDescriptions, "metaDescriptions"),
    links,
  };
}

export const profile: Profile = validateProfile(raw);
