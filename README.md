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
