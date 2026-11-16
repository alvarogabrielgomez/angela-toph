import { metaDescriptions } from "@/data/content";
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
import { LANGS } from "@/data/content";

// schema.org structured data — the strongest machine-readable signal for search
// engines and LLM crawlers to understand who this page is about.
export default function JsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    url: SITE_URL,
    inLanguage: "es",
    dateModified: LAST_MODIFIED,
    mainEntity: {
      "@type": "Person",
      name: PERSON_NAME,
      jobTitle: PERSON_ROLE,
      description: metaDescriptions.es,
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
      // Stringified, trusted, server-only data — safe to inject.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
