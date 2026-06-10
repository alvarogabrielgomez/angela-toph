import type { MetadataRoute } from "next";
import { PERSON_NAME, PERSON_ROLE } from "@/data/site";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: `${PERSON_NAME} — ${PERSON_ROLE}`,
    short_name: PERSON_NAME,
    description: `${PERSON_NAME}, ${PERSON_ROLE}. Links and work.`,
    start_url: "/",
    display: "standalone",
    background_color: "#0A0818",
    theme_color: "#0A0818",
    icons: [{ src: "/angela.jpg", sizes: "any", type: "image/jpeg" }],
  };
}
