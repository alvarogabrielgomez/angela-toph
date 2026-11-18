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
- Client-side language switcher for the languages listed in `profile.json`. The
  site localizes only the bio copy, as the original design does.
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
npm test         # vitest run
```

The app requires Node `>=20.9.0`. `npm test` runs Vitest 5, which needs Node
`^22.12`, `^24` or `>=26`.

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
  `sitemap.xml`, `manifest.webmanifest`, and `llms.txt`
  ([llmstxt.org](https://llmstxt.org)) for LLM ingestion.
- **A11y** — semantic `<main>/<header>/<nav>`, single `<h1>`, decorative layer
  `aria-hidden`, visible `:focus-visible` ring, labelled language toggle,
  `prefers-reduced-motion`.

Set `NEXT_PUBLIC_SITE_URL` (see `.env.example`) so canonical / OG / sitemap /
JSON-LD URLs use your real domain instead of the `*.vercel.app` placeholder.

## Editing content

Edit `src/data/profile.json`. The page, meta tags, JSON-LD, manifest, OG image,
sitemap and `llms.txt` all read from it. `next build` fails with a message naming
the field if the file is invalid. A JSON syntax error, such as a trailing comma,
fails when the bundler parses the file, and its message names no field.

To add a network, add an entry to `links`. Give it a `key` of lowercase letters,
digits and hyphens that no other link uses. The optional `icon` takes one of
three forms:

- A built-in name: `"icon": "behance"`. The names are `linkedin`, `blog`,
  `youtube`, `instagram` and `behance`.
- Your own SVG: `"icon": { "viewBox": "0 0 24 24", "paths": ["M0 0L24 24"] }`.
  `paths` lists the `d` attribute of each `<path>`. Write SVG path commands,
  numbers and separators in it: `next build` fails on any other character.
- Nothing. A `key` that matches a built-in name gets that icon. Any other `key`
  gets a generic link icon.

To add a language, add an entry to `languages` with a two-letter lowercase
`code` (such as `"fr"`), a `name` in that language (`"Français"`) and an
`ogLocale` (`"fr_FR"`). Add a `bios` text and a `metaDescriptions` text under the
same code. To remove a language, delete its entry and both texts. `next build`
fails when a listed language lacks a text or a text has no language.

`defaultLanguage` picks the language for the HTML `lang` attribute, the meta
description, Open Graph and JSON-LD. It must be one of the listed codes. A
profile with a single language hides the language switcher.

`llmsSummary` is prose and names the languages, so update it by hand when you
add or remove one.

To change the colors, edit `theme`. Write each color as `#RRGGBB`: a `#` and six
hex digits, such as `"#08BED8"`. `next build` fails on short forms like `"#FFF"`,
on names like `"red"` and on any other value.

| Key | Colors |
| --- | --- |
| `background` | Page fill, browser theme color and manifest colors |
| `gradient` | Page background and Open Graph card, top to bottom. Exactly four colors |
| `accent` | Role badge, selected language, link borders and glows |
| `accentLight` | Link icons, keyboard focus ring and some stars |
| `onAccent` | Text on an `accent` fill |
| `secondary` | Second glow, avatar ring and name shadow |
| `text` | Name, link labels and body text |
| `textMuted` | Bio and unselected language buttons |
| `textSubtle` | Link handles |
| `surface` | Translucent fill behind the links and the language switcher |
| `avatarBorder` | Ring between the avatar photo and its gradient border |
| `star` | Most stars of the starfield |

The code sets the language switcher border to a neutral white.

## Project structure

```
src/
  app/
    layout.tsx     # fonts, <html>/<body>, SEO metadata, viewport/theme-color
    page.tsx       # gradient wrapper + Background + LinkTree
    globals.css    # reset, keyframes, link hover, reduced-motion
    llms.txt/route.ts # llms.txt, generated from profile.json at build time
  components/
    Background.tsx # starfield, glow blobs, film grain, bottom halo (static)
    LinkTree.tsx   # avatar, name, badge, bio, links, language switcher (client)
    icons.tsx      # link icons: built-in SVGs, custom SVGs from profile.json, generic glyph
  data/
    profile.json   # ALL editable content: name, role, bios, links, colors, SEO, org
    profile.ts     # types + validation of profile.json (build fails if invalid)
    content.ts     # language helpers + re-exports for the UI
    theme.ts       # theme colors + alpha(), gradientCss(), themeCssVars()
    site.ts        # SEO constants derived from profile.json
public/
  angela.jpg       # avatar
```

The original design handoff lives in `extracted/` (git-ignored) for reference.
