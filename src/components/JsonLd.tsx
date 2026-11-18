import { DEFAULT_LANG, LANGS, metaDescriptions } from "@/data/content";
import {
  SITE_URL,
  PERSON_NAME,
  PERSON_ROLE,
  PERSON_SAME_AS,
  ORGANIZATION,
  LAST_MODIFIED,
  PERSON_PHOTO,
  PERSON_FOCUS,
} from "@/data/site";

/**
 * Serializes JSON-LD for inline use in a script tag. Every `<` becomes the
 * JSON escape backslash-u003c, so text from profile.json such as a closing
 * script tag cannot close the element. JSON parsers read the escape back
 * as `<`.
 */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

// schema.org structured data — the strongest machine-readable signal for search
// engines and LLM crawlers to understand who this page is about.
export default function JsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    url: SITE_URL,
    inLanguage: DEFAULT_LANG,
    dateModified: LAST_MODIFIED,
    mainEntity: {
      "@type": "Person",
      name: PERSON_NAME,
      jobTitle: PERSON_ROLE,
      description: metaDescriptions[DEFAULT_LANG],
      image: `${SITE_URL}${PERSON_PHOTO}`,
      url: SITE_URL,
      mainEntityOfPage: SITE_URL,
      sameAs: PERSON_SAME_AS,
      knowsAbout: PERSON_FOCUS,
      knowsLanguage: LANGS,
      worksFor: {
        "@type": "Organization",
        name: ORGANIZATION.name,
        url: ORGANIZATION.url,
        sameAs: ORGANIZATION.sameAs,
      },
    },
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(data) }}
    />
  );
}
