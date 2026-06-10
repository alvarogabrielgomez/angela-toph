import { bios } from "@/data/content";
import { SITE_URL, PERSON_NAME, PERSON_ROLE, SAME_AS } from "@/data/site";

// schema.org structured data — the strongest machine-readable signal for search
// engines and LLM crawlers to understand who this page is about.
export default function JsonLd() {
  const data = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    url: SITE_URL,
    inLanguage: ["es", "en", "pt"],
    mainEntity: {
      "@type": "Person",
      name: PERSON_NAME,
      jobTitle: PERSON_ROLE,
      description: bios.es,
      image: `${SITE_URL}/angela.jpg`,
      url: SITE_URL,
      sameAs: SAME_AS,
      knowsAbout: ["Copywriting", "UX Design", "UX Writing", "Content Strategy"],
      knowsLanguage: ["es", "en", "pt"],
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
