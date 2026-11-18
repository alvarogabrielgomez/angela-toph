import { profile } from "@/data/profile";

/**
 * Production origin. NEXT_PUBLIC_SITE_URL (Vercel) overrides `siteUrl` from
 * profile.json, so canonical / Open Graph / sitemap / JSON-LD URLs resolve to
 * absolute paths.
 */
export const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? profile.siteUrl;

export const PERSON_NAME = profile.person.name;
export const PERSON_ROLE = profile.person.role;
export const PERSON_FIRST_NAME = profile.person.firstName;
export const PERSON_LAST_NAME = profile.person.lastName;
/** Avatar path under public/, e.g. "/angela.jpg". */
export const PERSON_PHOTO = profile.person.photo;
export const PERSON_FOCUS = profile.person.focus;

export const KEYWORDS = profile.keywords;

const urlOf = (key: string) => profile.links.find((l) => l.key === key)?.url ?? "";

/**
 * schema.org `sameAs` for the Person must only contain URLs that identify
 * Angela herself (LinkedIn, Behance, her blog author page). The studio's
 * YouTube/Instagram belong to the Organization, not the person.
 */
export const PERSON_SAME_AS = profile.person.sameAs.map(urlOf).filter(Boolean);

/** Accentio Studios — modeled as the Organization Angela works for. */
export const ORGANIZATION = {
  name: profile.organization.name,
  url: profile.organization.url,
  sameAs: profile.organization.sameAs.map(urlOf).filter(Boolean),
};

/** Stable last-modified date (ISO) shared by the sitemap and JSON-LD. */
export const LAST_MODIFIED = profile.lastModified;
