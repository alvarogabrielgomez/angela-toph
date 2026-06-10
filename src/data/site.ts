import { links } from "@/data/content";

/**
 * Production origin. Set NEXT_PUBLIC_SITE_URL in the environment (Vercel) so
 * canonical / Open Graph / sitemap / JSON-LD URLs resolve to absolute paths.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://angela-potenza.vercel.app";

export const PERSON_NAME = "Angela Potenza";
export const PERSON_ROLE = "Copywriter & UX Designer";
export const PERSON_FIRST_NAME = "Angela";
export const PERSON_LAST_NAME = "Potenza";

export const KEYWORDS = [
  "Angela Potenza",
  "copywriter",
  "UX Designer",
  "UX writing",
  "content strategy",
  "estrategia de contenido",
  "redacción publicitaria",
  "diseño UX",
  "portfolio",
  "Accentio Studios",
];

const urlOf = (key: string) => links.find((l) => l.key === key)?.url ?? "";

/**
 * schema.org `sameAs` for the Person must only contain URLs that identify
 * Angela herself (LinkedIn, Behance, her blog author page). The studio's
 * YouTube/Instagram belong to the Organization, not the person.
 */
export const PERSON_SAME_AS = ["linkedin", "behance", "blog"].map(urlOf).filter(Boolean);

/** Accentio Studios — modeled as the Organization Angela works for. */
export const ORGANIZATION = {
  name: "Accentio Studios",
  url: "https://accentiostudios.com",
  sameAs: ["youtube", "instagram"].map(urlOf).filter(Boolean),
};

/** Stable last-modified date (ISO) shared by the sitemap and JSON-LD. */
export const LAST_MODIFIED = "2026-06-10";
