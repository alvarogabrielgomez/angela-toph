import { describe, expect, it, vi } from "vitest";
import { resolveLanguage } from "../languageStore";

// Fixed language list: editing the languages in profile.json never breaks
// these tests.
vi.mock("@/data/content", () => {
  const LANGS = ["es", "en", "pt"];
  return {
    LANGS,
    DEFAULT_LANG: "es",
    LANG_STORAGE_KEY: "angela-lang",
    isLang: (value: unknown) => typeof value === "string" && LANGS.includes(value),
  };
});

describe("resolveLanguage", () => {
  it("keeps the stored language when it is still listed", () => {
    expect(resolveLanguage("pt", ["en-US"])).toBe("pt");
  });

  it("falls back to the browser language when the stored one no longer exists", () => {
    expect(resolveLanguage("de", ["en-US"])).toBe("en");
  });

  it("falls back to the default language when nothing matches", () => {
    expect(resolveLanguage(null, ["fr-FR"])).toBe("es");
  });

  it("takes the first browser language that is listed", () => {
    expect(resolveLanguage(null, ["fr-FR", "pt-BR", "en"])).toBe("pt");
  });

  it("matches the browser language regardless of case", () => {
    expect(resolveLanguage(null, ["EN-us"])).toBe("en");
  });

  it("falls back to the default language when the browser reports none", () => {
    expect(resolveLanguage(null, [])).toBe("es");
  });
});
