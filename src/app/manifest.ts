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
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      {
        src: "/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
