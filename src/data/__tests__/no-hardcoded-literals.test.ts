import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";

/**
 * Guard for the rule "outside profile.json there is no site text or color":
 *
 * - colors: `#RRGGBB` and `rgb(` / `rgba(` with a number, anywhere in
 *   `src/**\/*.{ts,tsx,css}`, comments included;
 * - languages: `lang="xx"` attributes and quoted `"xx_XX"` locales in code
 *   lines of `src/**\/*.{ts,tsx}` (comment-only lines are skipped).
 *
 * `src/data/__tests__/**` is not scanned: tests spell out literals on purpose.
 * Every exception below names a file and the text of the line it covers, so
 * moving the line keeps the exception and editing it breaks the guard.
 */

const COLOR = /#[0-9A-Fa-f]{6}\b|rgba?\(\s*\d/;
const LANGUAGE = /\blang="[a-z]{2}"|["'][a-z]{2}_[A-Z]{2}["']/;
const COMMENT_LINE = /^\s*(\/\/|\/\*|\*)/;

interface Exception {
  file: string;
  line: RegExp;
  why: string;
}

const COLOR_EXCEPTIONS: Exception[] = [
  {
    file: "src/components/LinkTree.tsx",
    line: /rgba\(255,255,255,0\.16\)/,
    why: "neutral border of the language switcher, not a brand color",
  },
];

const LANGUAGE_EXCEPTIONS: Exception[] = [
  {
    file: "src/data/profile.ts",
    line: /^\s*fail\(`"languages\[\$\{i\}\]\.ogLocale" must match \$\{OG_LOCALE\} \(like "es_ES"\)/,
    why: "example locale inside a validation error message",
  },
];

interface Rule {
  name: string;
  pattern: RegExp;
  appliesTo: RegExp;
  skipComments: boolean;
  exceptions: Exception[];
}

const RULES: Rule[] = [
  {
    name: "color literal",
    pattern: COLOR,
    appliesTo: /\.(ts|tsx|css)$/,
    skipComments: false,
    exceptions: COLOR_EXCEPTIONS,
  },
  {
    name: "language literal",
    pattern: LANGUAGE,
    appliesTo: /\.(ts|tsx)$/,
    skipComments: true,
    exceptions: LANGUAGE_EXCEPTIONS,
  },
];

interface Scan {
  hits: string[];
  usedExceptions: Set<Exception>;
}

/** Scans one file's text. `file` is a path like "src/app/page.tsx". */
function scanFile(file: string, source: string, scan: Scan): void {
  const lines = source.split(/\r?\n/);
  lines.forEach((raw, index) => {
    for (const rule of RULES) {
      if (!rule.appliesTo.test(file)) continue;
      if (rule.skipComments && COMMENT_LINE.test(raw)) continue;
      // In a stylesheet, `rgb(var(--x) / a)` reads a variable: it is not a literal.
      const line = file.endsWith(".css") ? raw.replaceAll("rgb(var(", "") : raw;
      if (!rule.pattern.test(line)) continue;
      const exception = rule.exceptions.find((e) => e.file === file && e.line.test(raw));
      if (exception) {
        scan.usedExceptions.add(exception);
        continue;
      }
      scan.hits.push(`${file}:${index + 1}: ${rule.name}: ${raw.trim()}`);
    }
  });
}

function scanSources(sources: Record<string, string>): Scan {
  const scan: Scan = { hits: [], usedExceptions: new Set() };
  for (const [file, source] of Object.entries(sources)) scanFile(file, source, scan);
  return scan;
}

const SRC_DIR = fileURLToPath(new URL("../../", import.meta.url));

/** Paths like "src/app/page.tsx", with "/" on every OS. */
function listSourceFiles(): string[] {
  return readdirSync(SRC_DIR, { recursive: true })
    .map((entry) => `src/${String(entry).replaceAll("\\", "/")}`)
    .filter((file) => /\.(ts|tsx|css)$/.test(file))
    .filter((file) => !file.startsWith("src/data/__tests__/"))
    .sort();
}

describe("literal scanner", () => {
  const hits = (file: string, source: string) => scanSources({ [file]: source }).hits;

  it("flags a #RRGGBB color", () => {
    expect(hits("src/app/page.tsx", `  background: "#0A0818",`)).toEqual([
      'src/app/page.tsx:1: color literal: background: "#0A0818",',
    ]);
  });

  it("flags lowercase hex and rgb()/rgba() with a number, with or without spaces", () => {
    expect(hits("src/app/globals.css", "a { color: #6fe3f2; }")).toHaveLength(1);
    expect(hits("src/app/globals.css", "a { color: rgba(8, 190, 216, 0.15); }")).toHaveLength(1);
    expect(hits("src/app/globals.css", "a { color: rgb( 8 190 216 / 0.15); }")).toHaveLength(1);
  });

  it("reports the line number of each hit", () => {
    const source = ["const a = 1;", "const b = 2;", 'const c = "#0A0818";'].join("\n");
    expect(hits("src/app/page.tsx", source)).toEqual([
      'src/app/page.tsx:3: color literal: const c = "#0A0818";',
    ]);
  });

  it("flags colors in comments too", () => {
    expect(hits("src/app/page.tsx", "// the page was #0A0818 before")).toHaveLength(1);
  });

  it("does not flag a color read from a variable or a template", () => {
    expect(hits("src/app/globals.css", "a { color: rgb(var(--color-accent-rgb) / 0.15); }")).toEqual([]);
    expect(hits("src/data/theme.ts", "return `rgba(${r},${g},${b},${a})`;")).toEqual([]);
  });

  it("allows the neutral switcher border in LinkTree.tsx and nowhere else", () => {
    const line = `border: "1px solid rgba(255,255,255,0.16)",`;
    expect(hits("src/components/LinkTree.tsx", line)).toEqual([]);
    expect(hits("src/components/Background.tsx", line)).toHaveLength(1);
    expect(hits("src/components/LinkTree.tsx", `color: "rgba(255,255,255,0.5)"`)).toHaveLength(1);
  });

  it("flags a lang attribute and a quoted locale in code", () => {
    expect(hits("src/app/layout.tsx", `<html lang="es">`)).toHaveLength(1);
    expect(hits("src/app/layout.tsx", `const locale = "es_ES";`)).toHaveLength(1);
    expect(hits("src/app/layout.tsx", `const locale = 'pt_BR';`)).toHaveLength(1);
  });

  it("does not flag a lang read from a value, nor a locale inside a comment", () => {
    expect(hits("src/app/layout.tsx", "<html lang={DEFAULT_LANG}>")).toEqual([]);
    expect(hits("src/app/layout.tsx", `/** Open Graph locale, like "es_ES". */`)).toEqual([]);
    expect(hits("src/app/layout.tsx", ` * like "es_ES"`)).toEqual([]);
  });

  it("allows only the example locale in the ogLocale error message", () => {
    const message =
      '      fail(`"languages[${i}].ogLocale" must match ${OG_LOCALE} (like "es_ES"), got "${ogLocale}"`);';
    expect(hits("src/data/profile.ts", message)).toEqual([]);
    expect(hits("src/data/content.ts", message)).toHaveLength(1);
    expect(hits("src/data/profile.ts", `const fallback = "es_ES";`)).toHaveLength(1);
  });

  it("does not look for language literals in stylesheets", () => {
    expect(hits("src/app/globals.css", `a[lang="es"] { color: inherit; }`)).toEqual([]);
  });

  it("records the exception a scan used, and only that one", () => {
    const line = `border: "1px solid rgba(255,255,255,0.16)",`;
    expect(scanSources({ "src/components/LinkTree.tsx": line }).usedExceptions.size).toBe(1);
    expect(scanSources({ "src/components/LinkTree.tsx": "const a = 1;" }).usedExceptions.size).toBe(0);
  });
});

describe("no hard-coded colors or languages outside profile.json", () => {
  const files = listSourceFiles();
  const scan = scanSources(
    Object.fromEntries(files.map((file) => [file, readFileSync(join(SRC_DIR, file.slice("src/".length)), "utf8")])),
  );

  it("scans the source files, and skips the tests", () => {
    expect(files).toContain("src/components/LinkTree.tsx");
    expect(files).toContain("src/components/Background.tsx");
    expect(files).toContain("src/app/globals.css");
    expect(files).toContain("src/app/layout.tsx");
    expect(files).toContain("src/data/profile.ts");
    expect(files.some((file) => file.includes("__tests__"))).toBe(false);
  });

  it("finds no color or language literal", () => {
    expect(scan.hits).toEqual([]);
  });

  it("uses every listed exception, so none outlives its line", () => {
    const unused = [...COLOR_EXCEPTIONS, ...LANGUAGE_EXCEPTIONS].filter((e) => !scan.usedExceptions.has(e));
    expect(unused.map((e) => `${e.file}: ${e.why}`)).toEqual([]);
  });
});
