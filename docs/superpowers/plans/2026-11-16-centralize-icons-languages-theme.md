# Íconos, idiomas y colores en profile.json: plan de implementación

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** que Angela agregue una red, agregue o quite un idioma y cambie los colores editando solo `src/data/profile.json`.

**Architecture:** `src/data/profile.ts` valida el JSON al cargarse y un JSON inválido rompe `next build`. Cada tarea agrega una sección al JSON, su validación y la lectura en todos los consumidores (página, SEO, OG, manifest, `llms.txt`). Cada tarea es un slice vertical que se entrega por separado. No hay capas.

**Tech Stack:** Next.js 16.2.9 (App Router, Turbopack), React 19.2.7, TypeScript 6.0.3 y Vitest 5.0.5 (nuevo, solo para pruebas).

**Spec:** no hay documento de spec. Los requisitos salen de la conversación del 2026-11-16 y de la sección «Editing content» del `README.md`. Hoy esa sección dice que redes, idiomas y colores necesitan código, y este plan cierra esos tres huecos.

## Global Constraints

- Las versiones de las dependencias van exactas, sin `^`, como el resto de `package.json` salvo `@vercel/analytics`.
- Fuera de `profile.json` no quedan textos ni colores del sitio. Cada tarea deja una prueba que lo vigila.
- Un error en `profile.json` falla el build con `src/data/profile.json: "<ruta.del.campo>" ...`. Las pruebas comparan ese mensaje.
- Los commits van en inglés con Conventional Commits. **Sin trailer `Co-Authored-By`.** Nada de squash.
- El trabajo va en una rama nueva, nunca directo en `master`. Antes de crearla, revisar `git log origin/master..master`.
- Cuando el trabajo esté listo, `next build` sigue mostrando todas las rutas como `○ (Static)`.
- La prosa del README va en inglés, igual que el resto del archivo.

## Review Focus

1. **Un solo idioma en el JSON.** El selector de idioma con un solo botón no sirve. Se espera que no aparezca. La prueba va en la Tarea 3.
2. **Un `localStorage` con un idioma que ya no existe** (Angela quitó `pt` y el visitante lo había elegido). Se espera que la página caiga en el idioma por defecto sin error. La prueba va en la Tarea 3.
3. **Un `paths` de ícono propio con marcado** (`"<script>"`, comillas). Se espera un error de build. React escapa el atributo, pero el JSON solo debe aceptar comandos de path SVG. La prueba va en la Tarea 2.
4. **Dos links con el mismo `key`.** React repetiría la key y `sameAs` quedaría ambiguo. Se espera un error de build. La prueba va en la Tarea 2.
5. **Un color corto o con nombre** (`"#FFF"`, `"red"`). Se espera un error claro y no un CSS roto en silencio. La prueba va en la Tarea 4.

---

## Estructura de archivos

| Archivo | Responsabilidad |
|---|---|
| `src/data/profile.json` | Todo el contenido editable. Gana `links[].icon`, `languages`, `defaultLanguage` y `theme` |
| `src/data/profile.ts` | Tipos y `validateProfile`. Exporta `profile` |
| `src/data/theme.ts` (nuevo) | `alpha()`, `gradientCss()` y `themeCssVars()` a partir de `profile.theme` |
| `src/components/icons.tsx` | Dibuja `LinkIcon`: integrado, propio o genérico |
| `src/data/content.ts`, `src/data/site.ts` | Reexportan derivados de `profile` |
| `src/data/__tests__/*.test.ts(x)` (nuevo) | Pruebas del validador, del tema, de los íconos y la guarda de literales |
| `vitest.config.mts` (nuevo) | Config de Vitest |

---

### Tarea 1: Arnés de pruebas y caracterización del validador actual

Antes de cambiar el validador, las pruebas fijan lo que hoy hace.

**Files:**
- Create: `vitest.config.mts`, `src/data/__tests__/profile.test.ts`
- Modify: `package.json` (devDependencies y script `test`), `src/data/profile.ts` (exportar `validateProfile`)

**Interfaces:**
- Produces: `validateProfile(data: unknown): Profile`, exportada desde `src/data/profile.ts`. `profile` sigue siendo `validateProfile(raw)`.
- Produces: el helper de pruebas `fixture(): any`, que devuelve `structuredClone` del JSON real para mutarlo. Vive en `src/data/__tests__/fixture.ts`.

- [ ] **Paso 1: Rama y commit del trabajo previo.** Revisar que `git log origin/master..master` salga vacío. Después: `git switch -c feat/profile-json-everything`. Commitear los cambios sin commitear de la centralización (`profile.json`, `profile.ts`, la ruta `llms.txt`, el README y los consumidores) con el mensaje `refactor: centralize site content in profile.json`.

- [ ] **Paso 2: Instalar Vitest.** `npm install -D --save-exact vitest@5.0.5 vite-tsconfig-paths@<última con 2+ semanas>`. No hace falta jsdom: todas las pruebas corren en entorno `node`. Crear `vitest.config.mts` con `plugins: [tsconfigPaths()]` y `test.environment: "node"`. Agregar el script `"test": "vitest run"`.

- [ ] **Paso 3: Escribir las pruebas de caracterización** en `profile.test.ts`:

```ts
it("accepts the real profile.json", () => {
  expect(() => validateProfile(fixture())).not.toThrow();
});
it("rejects an unknown link key", () => {
  const d = fixture(); d.links[0].key = "tiktok";
  expect(() => validateProfile(d)).toThrow('"links[0].key" is "tiktok"');
});
it("rejects a missing bio", () => {
  const d = fixture(); delete d.bios.pt;
  expect(() => validateProfile(d)).toThrow('"bios.pt" must be a non-empty string');
});
it("rejects sameAs pointing to a removed link", () => {
  const d = fixture(); d.links = d.links.filter((l: any) => l.key !== "behance");
  expect(() => validateProfile(d)).toThrow('"person.sameAs[1]" is "behance", which is not in "links"');
});
it("rejects a non-URL link", () => {
  const d = fixture(); d.links[0].url = "linkedin.com/x";
  expect(() => validateProfile(d)).toThrow('"links[0].url" must be an http(s) URL');
});
```

- [ ] **Paso 4: Correr y ver el fallo.** `npm test`. Se espera un FAIL porque `validateProfile` no está exportada.

- [ ] **Paso 5: Renombrar `validate` a `validateProfile` y exportarla** en `profile.ts`. No cambia nada más.

- [ ] **Paso 6: Correr.** `npm test` → 5 PASS. `npm run build` → 7 rutas `○`.

- [ ] **Paso 7: Commit.** `test: add vitest and characterize profile validation`

---

### Tarea 2: Una red nueva sin tocar código

Historia: *Como Angela, quiero agregar un link a una red nueva con su ícono editando el JSON.*

**Files:**
- Modify: `src/data/profile.json`, `src/data/profile.ts`, `src/components/icons.tsx`, `src/components/LinkTree.tsx`, `src/data/site.ts`, `README.md`
- Test: `src/data/__tests__/profile.test.ts`, `src/data/__tests__/icons.test.tsx`

**Interfaces:**
- Consumes: `validateProfile` y `fixture()` de la Tarea 1.
- Produces, en `profile.ts`:
  - `BUILTIN_ICONS = ["linkedin", "blog", "youtube", "instagram", "behance"] as const`
  - `type BuiltinIcon = (typeof BUILTIN_ICONS)[number]`
  - `type LinkIcon = { kind: "builtin"; name: BuiltinIcon } | { kind: "custom"; viewBox: string; paths: string[] } | { kind: "generic" }`
  - `LinkItem.key: string` (deja de ser `IconKey`) y `LinkItem.icon: LinkIcon`
  - `Profile.person.sameAs: string[]` y `Profile.organization.sameAs: string[]`
  - Se eliminan `ICON_KEYS` e `IconKey`. Los reemplazan `BUILTIN_ICONS` y `BuiltinIcon`.
- Produces, en `icons.tsx`: `Icon({ icon }: { icon: LinkIcon })`.

**Formato del JSON.** `links[].icon` es opcional y acepta tres formas:
- Un string con un nombre de `BUILTIN_ICONS`, por ejemplo `"icon": "behance"`.
- Un objeto propio: `{ "viewBox": "0 0 24 24", "paths": ["M..."] }`.
- Nada. Si falta `icon`, el validador usa el integrado cuando `key` está en `BUILTIN_ICONS` y el genérico en cualquier otro caso. El `profile.json` actual no cambia.

**Reglas de validación** (cada una con su mensaje y su prueba):
- `key`: debe cumplir `/^[a-z0-9-]+$/` y ser único. Mensaje: `"links[3].key" "youtube" is repeated`.
- `icon` como string: debe estar en `BUILTIN_ICONS`. Mensaje: `"links[0].icon" is "x"; built-in icons: ...`.
- `viewBox`: debe cumplir `/^-?\d+(\.\d+)? -?\d+(\.\d+)? \d+(\.\d+)? \d+(\.\d+)?$/`.
- Cada path: debe cumplir `/^[MmLlHhVvCcSsQqTtAaZz0-9.,\s-]+$/` y `paths` no puede estar vacío. Mensaje: `"links[0].icon.paths[0]" must contain only SVG path commands`.

- [ ] **Paso 1: Pruebas del validador.** Seis casos:
  - El JSON actual produce `{kind:"builtin", name:"linkedin"}` en `links[0].icon`.
  - Un link `{key:"tiktok"}` sin `icon` produce `{kind:"generic"}`.
  - Un ícono propio válido pasa tal cual.
  - Un `key` duplicado falla con `is repeated`.
  - `paths: ['M0 0"/><script>']` falla con `must contain only SVG path commands`.
  - `"icon": "x"` falla con `built-in icons`.

  Hay que borrar la prueba `rejects an unknown link key` de la Tarea 1. Con esta historia la regla cambia: una clave nueva ahora es válida. **El informe tiene que decir qué prueba se quitó y por qué.**

- [ ] **Paso 2: Pruebas de dibujo** en `icons.test.tsx`, con `renderToStaticMarkup` de `react-dom/server`:
  - Un ícono propio produce `viewBox="0 0 10 10"` y `d="M0 0L10 10"`.
  - El genérico produce un `<svg` con `aria-hidden="true"`.
  - `{kind:"builtin", name:"blog"}` produce `viewBox="0 0 56 57"`.

- [ ] **Paso 3: Correr.** `npm test`. Se esperan FAILs en los casos nuevos.

- [ ] **Paso 4: Implementar.**
  - En `profile.ts`: los tipos y la resolución de `icon`.
  - En `icons.tsx`: `PATHS` pasa a ser `Record<Exclude<BuiltinIcon,"blog">, string>`. Agregar `GENERIC_PATH`, un glifo de enlace de 24×24 dibujado con `fill="currentColor"`. Puede ser de diseño propio o de Simple Icons/CC0, pero nada con licencia restrictiva.
  - En `LinkTree.tsx`: `<Icon icon={link.icon} />`.
  - En `site.ts`: `urlOf` recibe `string`.

- [ ] **Paso 5: Correr.** `npm test` → PASS.

- [ ] **Paso 6: Prueba de punta a punta.**
  1. Agregar temporalmente al JSON `{"key":"tiktok","label":"TikTok","handle":"@x","url":"https://www.tiktok.com/@x","description":"Test","icon":{"viewBox":"0 0 10 10","paths":["M0 0L10 10"]}}`.
  2. Correr `npm run build && npx next start -p 3123`.
  3. Con `curl -s localhost:3123/` comprobar que aparece `TikTok`. Con `curl -s localhost:3123/llms.txt` comprobar que aparece `[TikTok](https://www.tiktok.com/@x): Test`.
  4. Revertir el JSON y verificar con `git diff --quiet src/data/profile.json`.

- [ ] **Paso 7: README.** En «Editing content», reemplazar la frase sobre los íconos por las tres formas de `icon`.

- [ ] **Paso 8: Commit.** `feat: let profile.json define link icons`

---

### Tarea 3: Agregar o quitar un idioma sin tocar código

Historia: *Como Angela, quiero agregar o quitar un idioma editando el JSON.*

**Files:**
- Modify: `src/data/profile.json`, `src/data/profile.ts`, `src/data/content.ts`, `src/data/languageStore.ts`, `src/app/layout.tsx`, `src/components/JsonLd.tsx`, `src/components/LinkTree.tsx`, `src/app/llms.txt/route.ts`, `README.md`
- Test: `src/data/__tests__/profile.test.ts`, `src/data/__tests__/languageStore.test.ts`

**Interfaces:**
- Consumes: `validateProfile` y `fixture()`.
- Produces, en `profile.ts`:
  - `interface Language { code: string; name: string; ogLocale: string }`
  - `type Lang = string`
  - `Profile.languages: Language[]`
  - `Profile.defaultLanguage: string`
  - `bios` y `metaDescriptions` pasan a `Record<string, string>`
  - Se elimina `Profile.languageNames`.
- Produces, en `content.ts`: `LANGS: readonly string[]`, `DEFAULT_LANG: string`, `LANG_NAMES: Record<string,string>`, `OG_LOCALES: Record<string,string>` y `isLang(value: unknown): value is Lang`. Los consumidores conservan esos nombres.
- Produces, en `languageStore.ts`: `resolveLanguage(stored: string | null, browser: readonly string[]): Lang`, una función pura que se extrae de `resolve()`.

**Formato del JSON.** `languageNames` desaparece. En su lugar entran:

```json
"defaultLanguage": "es",
"languages": [
  { "code": "es", "name": "Español",   "ogLocale": "es_ES" },
  { "code": "en", "name": "English",   "ogLocale": "en_US" },
  { "code": "pt", "name": "Português", "ogLocale": "pt_BR" }
]
```

**Reglas de validación:**
- `code`: debe cumplir `/^[a-z]{2}$/`. La detección del navegador corta a 2 letras.
- `code`: debe ser único.
- `ogLocale`: debe cumplir `/^[a-z]{2}_[A-Z]{2}$/`.
- La lista no puede estar vacía.
- `defaultLanguage` tiene que estar en la lista.
- `bios` y `metaDescriptions` necesitan todos los códigos y ninguno de más. Mensaje: `"bios.fr" is not in "languages"`.

- [ ] **Paso 1: Pruebas del validador.** Cinco casos:
  - Agregar `{code:"fr",...}` sin `bios.fr` falla con `"bios.fr" must be a non-empty string`.
  - Quitar `pt` de `languages` sin quitar `bios.pt` falla con `"bios.pt" is not in "languages"`.
  - `defaultLanguage:"de"` falla.
  - `code:"esp"` falla.
  - Una configuración de un solo idioma (`es`, con bios y meta solo en `es`) pasa.

- [ ] **Paso 2: Pruebas de `resolveLanguage`.** Siempre con `LANGS = es,en,pt`:
  - `("pt", ["en-US"])` → `"pt"`.
  - `("de", ["en-US"])` → `"en"`. Es el caso 2 del Review Focus: lo guardado ya no existe.
  - `(null, ["fr-FR"])` → `"es"`.

- [ ] **Paso 3: Correr.** `npm test`. Se esperan FAILs.

- [ ] **Paso 4: Implementar.**
  - **Validador y datos:** el validador nuevo. Pasar el JSON al formato nuevo.
  - **`content.ts`:** derivar `LANGS`, `DEFAULT_LANG`, `LANG_NAMES` y `OG_LOCALES` de `profile`.
  - **`languageStore.ts`:** `resolve()` llama a `resolveLanguage`.
  - **`layout.tsx`:**
    - `<html lang={DEFAULT_LANG}>`
    - `description = metaDescriptions[DEFAULT_LANG]`
    - `openGraph.locale = OG_LOCALES[DEFAULT_LANG]`
    - `alternateLocale` con los demás locales, en el orden de `LANGS`
  - **`JsonLd.tsx`:** `inLanguage` y `description` toman `DEFAULT_LANG`.
  - **`LinkTree.tsx`:** no renderizar `LangSwitcher` si `LANGS.length < 2`. Es el caso 1 del Review Focus.
  - **`route.ts`:** `llms.txt` usa `profile.languages`.

- [ ] **Paso 5: Correr.** `npm test` → PASS.

- [ ] **Paso 6: Comparar contra el build anterior.** Antes de implementar, guardar `.next/server/app/index.html` del build de la Tarea 2. Después de implementar, hacer el build otra vez y comparar el HTML sin `<script>` que no sean ld+json, sin rutas `/_next/static` y sin el hash de `opengraph-image`. Tiene que salir **idéntico**.

- [ ] **Paso 7: Prueba de punta a punta con un solo idioma.**
  1. Dejar temporalmente solo `es` en `languages`, `bios` y `metaDescriptions`.
  2. Hacer el build.
  3. Con `curl -s localhost:3123/ | grep -c 'aria-label="Language"'` comprobar que da `0`. Con `curl -s localhost:3123/llms.txt` comprobar que la línea dice `Languages: Español`.
  4. Revertir el JSON.

- [ ] **Paso 8: README.** Quitar «a new language needs its code in `LANGS`». Agregar una nota: `llmsSummary` es prosa y nombra los idiomas, así que hay que actualizarla a mano.

- [ ] **Paso 9: Commit.** `feat: let profile.json define the site languages`

---

### Tarea 4: Cambiar los colores sin tocar código

Historia: *Como Angela, quiero cambiar los colores del sitio editando el JSON.*

**Files:**
- Create: `src/data/theme.ts`, `src/data/__tests__/theme.test.ts`, `src/data/__tests__/no-color-literals.test.ts`
- Modify: `src/data/profile.json`, `src/data/profile.ts`, `src/app/globals.css`, `src/app/layout.tsx`, `src/app/page.tsx`, `src/app/manifest.ts`, `src/app/opengraph-image.tsx`, `src/components/LinkTree.tsx`, `src/components/Background.tsx`, `README.md`

**Interfaces:**
- Consumes: `validateProfile` y `fixture()`.
- Produces, en `profile.ts`: `Profile.theme: Theme`, donde `Theme` tiene las claves de la tabla de abajo. Todas son `string`, salvo `gradient`, que es `[string, string, string, string]`.
- Produces, en `theme.ts`:
  - `theme: Theme`
  - `alpha(hex: string, a: number): string` → `"rgba(r,g,b,a)"`
  - `gradientCss(stops: Theme["gradient"]): string` → `"linear-gradient(180deg, s0 0%, s1 42%, s2 68%, s3 100%)"`
  - `themeCssVars(t: Theme): Record<string, string>` → `{"--color-bg": ..., "--color-text": ..., "--color-accent-light": ..., "--color-accent-rgb": "8 190 216"}`

**Formato del JSON.** Los valores salen del código actual:

```json
"theme": {
  "background": "#0A0818",
  "gradient": ["#0A0818", "#1A0F38", "#2A1150", "#0E1E36"],
  "accent": "#08BED8",
  "accentLight": "#6FE3F2",
  "onAccent": "#04222A",
  "secondary": "#7C3AED",
  "text": "#F3F2F8",
  "textMuted": "#C9C2E4",
  "textSubtle": "#9D93C8",
  "surface": "#0A0718",
  "avatarBorder": "#140C28",
  "star": "#E7E2FF"
}
```

Cada `rgba(8,190,216,x)` se reemplaza por `alpha(theme.accent, x)`, cada `rgba(124,58,237,x)` por `alpha(theme.secondary, x)` y cada `rgba(10,7,24,x)` por `alpha(theme.surface, x)`. Quedan en código, por ser neutros y no de marca: `rgba(255,255,255,0.16)`, el borde del selector de idioma.

**Regla de validación:** cada color debe cumplir `/^#[0-9A-Fa-f]{6}$/`. Mensaje: `"theme.accent" must be a #RRGGBB color, got "red"`. `gradient` tiene que tener exactamente 4 colores.

- [ ] **Paso 1: Pruebas.**
  - `alpha("#08BED8", 0.3)` → `"rgba(8,190,216,0.3)"`.
  - `gradientCss` con los 4 stops actuales devuelve el string exacto que hoy está en `page.tsx`.
  - `themeCssVars` produce `"--color-accent-rgb": "8 190 216"`.
  - En el validador, `"#FFF"` y `"red"` en `theme.accent` fallan con el mensaje de arriba, y un `gradient` de 3 colores falla.

- [ ] **Paso 2: Escribir la prueba de guarda** `no-color-literals.test.ts`. Recorre `src/**/*.{ts,tsx,css}` y falla si encuentra `/#[0-9A-Fa-f]{6}\b|rgba?\(\s*\d/`. Excepciones:
  - `src/data/__tests__/**`
  - la línea de `rgba(255,255,255,0.16)` en `LinkTree.tsx`
  - en `globals.css`, el patrón `rgb(var(` no cuenta

  Un fallo informa archivo:línea.

- [ ] **Paso 3: Correr.** `npm test`. Se esperan FAILs, y la guarda lista los literales actuales.

- [ ] **Paso 4: Implementar.**
  - `theme.ts`.
  - `layout.tsx`: `<html style={themeCssVars(theme)}>` y `viewport.themeColor = theme.background`.
  - `globals.css`: usar `var(--color-bg)`, `var(--color-text)`, `var(--color-accent-light)` y `rgb(var(--color-accent-rgb) / 0.15)`, con la misma sintaxis en hover y focus.
  - El resto de los archivos importa `theme`, `alpha` y `gradientCss`.
  - `manifest.ts`: `background_color` y `theme_color` toman `theme.background`.
  - La imagen OG usa `theme` directo, porque Satori no resuelve variables CSS.

- [ ] **Paso 5: Correr.** `npm test` → PASS, guarda incluida.

- [ ] **Paso 6: Verificar la salida.**
  1. Hacer el build.
  2. Comparar `manifest.webmanifest` contra el de la Tarea 3: tiene que salir idéntico.
  3. Comparar el HTML visible. Solo puede cambiar el formato numérico dentro de `rgba(...)` (`0.30` pasa a `0.3`) y el atributo `style` de `<html>`. Cualquier otra diferencia cuenta como fallo.

- [ ] **Paso 7: Prueba de punta a punta.**
  1. Cambiar temporalmente `theme.accent` a `#FF0066`.
  2. Hacer el build.
  3. Con `curl -s localhost:3123/` comprobar que aparece `rgba(255,0,102,` y que no queda `rgba(8,190,216,`.
  4. Revertir el JSON.

- [ ] **Paso 8: Revisión visual del dueño.** Ningún paso anterior compara píxeles. Hay que pedirle al dueño que abra la página y la imagen OG y confirme que se ven igual que antes. El informe dice que esa comprobación la hizo el dueño y no el agente.

- [ ] **Paso 9: README.** Quitar «theme colors still live in code» y documentar `theme` y la regla `#RRGGBB`.

- [ ] **Paso 10: Commit.** `feat: let profile.json define the color theme`

---

## Fuera de este plan

- `NEXT_PUBLIC_SITE_URL` sigue teniendo prioridad sobre `siteUrl`. Si se quita esa prioridad, `siteUrl` queda como única fuente, pero los previews de Vercel usarían el dominio de producción. Esa decisión le toca al dueño.
- La estructura y las animaciones (estrellas, posiciones y tamaños) siguen en código.
- `llmsSummary` sigue siendo prosa libre y no se genera de los datos.
