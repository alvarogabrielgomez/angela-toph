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

/** Verified profiles for schema.org `sameAs` / IndieAuth rel="me". */
export const SAME_AS = links.map((l) => l.url);
