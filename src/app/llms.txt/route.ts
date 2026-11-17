import { links } from "@/data/content";
import { profile } from "@/data/profile";

// llms.txt (https://llmstxt.org), built from profile.json. `force-static`
// prerenders it at build time: GET Route Handlers are dynamic by default
// since Next.js 15.
export const dynamic = "force-static";

function buildLlmsTxt(): string {
  const { person, llmsSummary } = profile;
  const summary = `${person.name} — ${person.role}. ${llmsSummary}`;

  return [
    `# ${person.name}`,
    "",
    `> ${summary}`,
    "",
    "## About",
    "",
    `- Name: ${person.name}`,
    `- Role: ${person.role}`,
    `- Focus: ${person.focus.join(", ")}`,
    `- Languages: ${profile.languages.map((l) => l.name).join(", ")}`,
    "",
    "## Links",
    "",
    ...links.map((l) => `- [${l.label}](${l.url}): ${l.description}`),
    "",
  ].join("\n");
}

export function GET() {
  return new Response(buildLlmsTxt(), {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
