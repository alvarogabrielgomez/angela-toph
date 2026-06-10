# Angela Potenza — Link in Bio

Link-in-bio page for **Angela Potenza** (Copywriter & UX Designer), built from the
Claude Design handoff. Pixel-perfect port to **Next.js (App Router)**, ready to deploy
on **Vercel**.

## Stack

| Tool | Version |
| --- | --- |
| Next.js | 16.2.9 (App Router, Turbopack) |
| React | 19.2.7 |
| TypeScript | 6.0.3 |
| ESLint | 10.4.1 + eslint-config-next (flat config) |

- Self-hosted Google Fonts via `next/font` (Montserrat, Karla, JetBrains Mono).
- Optimized avatar via `next/image`.
- Client-side language switcher (ES / EN / PT) — only the bio copy is localized,
  matching the original design.
- Respects `prefers-reduced-motion`.

## Develop

```bash
npm install
npm run dev      # http://localhost:3000
```

Other scripts:

```bash
npm run build    # production build
npm run start    # serve the production build
npm run lint     # eslint (flat config)
```

Requires Node `>=20.9.0`.

## Deploy to Vercel

The project is a zero-config Next.js app — Vercel auto-detects it.

1. Push this folder to a Git repository.
2. Import it in Vercel (or run `vercel` / `vercel --build-env` with the CLI).
3. (Optional) set `NEXT_PUBLIC_SITE_URL` to the production URL so Open Graph /
   canonical metadata resolve to absolute URLs.

No environment variables are required to build or run.

## SEO & discoverability

- **Metadata** — title, ~150-char description (per-language, SERP-sized), canonical,
  keywords, robots (`max-image-preview:large`, `max-snippet:-1`), Open Graph
  (`profile`, locale + alternates) and Twitter `summary_large_image`.
- **Generated OG image** — `opengraph-image.tsx` renders a branded 1200×630 card
  (also used as the Twitter image).
- **Structured data** — JSON-LD `ProfilePage` → `Person` (jobTitle, image,
  `sameAs` = Angela's own profiles, `worksFor` = Accentio Studios org,
  `knowsAbout`/`knowsLanguage`).
- **Icons** — square PNG set (32 / 180 apple / 192 / 512 / 512 maskable) in
  `public/`, generated from the avatar.
- **Routes** — `robots.txt` (explicitly allows major search + LLM crawlers:
  GPTBot, ClaudeBot, PerplexityBot, Google-Extended, Bytespider, …),
  `sitemap.xml`, `manifest.webmanifest`, and `public/llms.txt`
  ([llmstxt.org](https://llmstxt.org)) for LLM ingestion.
- **A11y** — semantic `<main>/<header>/<nav>`, single `<h1>`, decorative layer
  `aria-hidden`, visible `:focus-visible` ring, labelled language toggle,
  `prefers-reduced-motion`.

Set `NEXT_PUBLIC_SITE_URL` (see `.env.example`) so canonical / OG / sitemap /
JSON-LD URLs use your real domain instead of the `*.vercel.app` placeholder.

## Project structure

```
src/
  app/
    layout.tsx     # fonts, <html>/<body>, SEO metadata, viewport/theme-color
    page.tsx       # gradient wrapper + Background + LinkTree
    globals.css    # reset, keyframes, link hover, reduced-motion
  components/
    Background.tsx # starfield, glow blobs, film grain, bottom halo (static)
    LinkTree.tsx   # avatar, name, badge, bio, links, language switcher (client)
    icons.tsx      # inline brand SVG icons
  data/
    content.ts     # bio copy (ES/EN/PT) + link list
public/
  angela.jpg       # avatar
```

The original design handoff lives in `extracted/` (git-ignored) for reference.
