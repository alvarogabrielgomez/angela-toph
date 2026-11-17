import { describe, expect, it } from "vitest";
import { DEFAULT_LANG, LANGS, LANG_NAMES, OG_LOCALES, isLang } from "@/data/content";
import { profile } from "@/data/profile";
import { validateProfile } from "../profile";
import { fixture } from "./fixture";

describe("validateProfile", () => {
  it("accepts the real profile.json", () => {
    expect(() => validateProfile(fixture())).not.toThrow();
  });

  it("rejects a missing bio", () => {
    const d = fixture();
    delete d.bios.pt;
    expect(() => validateProfile(d)).toThrow('"bios.pt" must be a non-empty string');
  });

  it("rejects sameAs pointing to a removed link", () => {
    const d = fixture();
    d.links = d.links.filter((l: { key: string }) => l.key !== "behance");
    expect(() => validateProfile(d)).toThrow('"person.sameAs[1]" is "behance", which is not in "links"');
  });

  it("rejects a non-URL link", () => {
    const d = fixture();
    d.links[0].url = "linkedin.com/x";
    expect(() => validateProfile(d)).toThrow('"links[0].url" must be an http(s) URL');
  });

  it("resolves the @/ alias from tsconfig paths", () => {
    expect(profile.person.name).toBe("Angela Potenza");
  });
});

describe("validateProfile link icons", () => {
  const tiktok = {
    key: "tiktok",
    label: "TikTok",
    handle: "@x",
    url: "https://www.tiktok.com/@x",
    description: "Test",
  };

  it("gives the built-in icon to a known key without an icon", () => {
    const result = validateProfile(fixture());
    expect(result.links[0].icon).toEqual({ kind: "builtin", name: "linkedin" });
  });

  it("gives the generic icon to an unknown key without an icon", () => {
    const d = fixture();
    d.links.push({ ...tiktok });
    const result = validateProfile(d);
    expect(result.links.at(-1)?.icon).toEqual({ kind: "generic" });
  });

  it("accepts a built-in icon name on a new key", () => {
    const d = fixture();
    d.links.push({ ...tiktok, icon: "behance" });
    const result = validateProfile(d);
    expect(result.links.at(-1)?.icon).toEqual({ kind: "builtin", name: "behance" });
  });

  it("accepts a custom icon as is", () => {
    const d = fixture();
    d.links.push({ ...tiktok, icon: { viewBox: "0 0 10 10", paths: ["M0 0L10 10", "m1.5-2 3 4z"] } });
    const result = validateProfile(d);
    expect(result.links.at(-1)?.icon).toEqual({
      kind: "custom",
      viewBox: "0 0 10 10",
      paths: ["M0 0L10 10", "m1.5-2 3 4z"],
    });
  });

  it("accepts a new link key in sameAs", () => {
    const d = fixture();
    d.links.push({ ...tiktok });
    d.person.sameAs.push("tiktok");
    expect(validateProfile(d).person.sameAs).toContain("tiktok");
  });

  it("rejects a repeated link key", () => {
    const d = fixture();
    const index = d.links.length;
    d.links.push({ ...tiktok, key: "youtube" });
    expect(() => validateProfile(d)).toThrow(
      new RegExp(`^src/data/profile\\.json: "links\\[${index}\\]\\.key" "youtube" is repeated`),
    );
  });

  it("rejects a link key outside a-z, 0-9 and hyphen", () => {
    const d = fixture();
    d.links.push({ ...tiktok, key: "Tik Tok" });
    expect(() => validateProfile(d)).toThrow(/"links\[\d+\]\.key" must match/);
  });

  it("rejects an icon string that is not built in", () => {
    const d = fixture();
    d.links[0].icon = "x";
    expect(() => validateProfile(d)).toThrow('"links[0].icon" is "x"; built-in icons: ');
  });

  it("rejects an icon that is neither a string nor an object", () => {
    const d = fixture();
    d.links[0].icon = 7;
    expect(() => validateProfile(d)).toThrow('"links[0].icon" must be');
  });

  it("rejects a custom icon with a malformed viewBox", () => {
    const d = fixture();
    d.links[0].icon = { viewBox: "0 0 24", paths: ["M0 0L10 10"] };
    expect(() => validateProfile(d)).toThrow('"links[0].icon.viewBox" must be');
  });

  it("rejects a custom icon without paths", () => {
    const d = fixture();
    d.links[0].icon = { viewBox: "0 0 24 24", paths: [] };
    expect(() => validateProfile(d)).toThrow('"links[0].icon.paths" must be a non-empty list');
  });

  it("rejects a custom icon path with markup", () => {
    const d = fixture();
    d.links[0].icon = { viewBox: "0 0 24 24", paths: ['M0 0"/><script>'] };
    expect(() => validateProfile(d)).toThrow(
      '"links[0].icon.paths[0]" must contain only SVG path commands',
    );
  });
});

describe("validateProfile languages", () => {
  const french = { code: "fr", name: "Français", ogLocale: "fr_FR" };

  // The real profile.json lists whatever languages Angela keeps there. These
  // tests start from a fixed three-language profile so editing the JSON never
  // breaks them.
  function trilingual() {
    const d = fixture();
    d.defaultLanguage = "es";
    d.languages = [
      { code: "es", name: "Español", ogLocale: "es_ES" },
      { code: "en", name: "English", ogLocale: "en_US" },
      { code: "pt", name: "Português", ogLocale: "pt_BR" },
    ];
    d.bios = { es: "Hola", en: "Hello", pt: "Olá" };
    d.metaDescriptions = { es: "Hola, en breve", en: "Hello, in short", pt: "Olá, em resumo" };
    return d;
  }

  it("rejects a new language without a bio", () => {
    const d = trilingual();
    d.languages.push({ ...french });
    expect(() => validateProfile(d)).toThrow(
      'src/data/profile.json: "bios.fr" must be a non-empty string',
    );
  });

  it("rejects a new language without a meta description", () => {
    const d = trilingual();
    d.languages.push({ ...french });
    d.bios.fr = "Bonjour";
    expect(() => validateProfile(d)).toThrow('"metaDescriptions.fr" must be a non-empty string');
  });

  it("accepts a new language with its bio and meta description", () => {
    const d = trilingual();
    d.languages.push({ ...french });
    d.bios.fr = "Bonjour";
    d.metaDescriptions.fr = "Bonjour, en bref";
    const result = validateProfile(d);
    expect(result.languages.map((l) => l.code)).toEqual(["es", "en", "pt", "fr"]);
    expect(result.bios.fr).toBe("Bonjour");
  });

  it("rejects a bio for a language that was removed", () => {
    const d = trilingual();
    d.languages = d.languages.filter((l: { code: string }) => l.code !== "pt");
    expect(() => validateProfile(d)).toThrow(
      'src/data/profile.json: "bios.pt" is not in "languages"',
    );
  });

  it("rejects a meta description for a language that was removed", () => {
    const d = trilingual();
    d.languages = d.languages.filter((l: { code: string }) => l.code !== "pt");
    delete d.bios.pt;
    expect(() => validateProfile(d)).toThrow('"metaDescriptions.pt" is not in "languages"');
  });

  it("accepts removing a language together with its texts", () => {
    const d = trilingual();
    d.languages = d.languages.filter((l: { code: string }) => l.code !== "pt");
    delete d.bios.pt;
    delete d.metaDescriptions.pt;
    expect(validateProfile(d).languages.map((l) => l.code)).toEqual(["es", "en"]);
  });

  it("rejects a default language that is not in the list", () => {
    const d = trilingual();
    d.defaultLanguage = "de";
    expect(() => validateProfile(d)).toThrow(
      '"defaultLanguage" is "de", which is not in "languages"',
    );
  });

  it("rejects a missing default language", () => {
    const d = trilingual();
    delete d.defaultLanguage;
    expect(() => validateProfile(d)).toThrow('"defaultLanguage" must be a non-empty string');
  });

  it("rejects a language code that is not two lowercase letters", () => {
    const d = trilingual();
    d.languages[0].code = "esp";
    expect(() => validateProfile(d)).toThrow(/"languages\[0\]\.code" must match/);
  });

  it("rejects a repeated language code", () => {
    const d = trilingual();
    d.languages.push({ ...d.languages[0] });
    expect(() => validateProfile(d)).toThrow('"languages[3].code" "es" is repeated');
  });

  it("rejects an Open Graph locale that is not xx_XX", () => {
    const d = trilingual();
    d.languages[0].ogLocale = "es-ES";
    expect(() => validateProfile(d)).toThrow(/"languages\[0\]\.ogLocale" must match/);
  });

  it("rejects a language without a name", () => {
    const d = trilingual();
    delete d.languages[1].name;
    expect(() => validateProfile(d)).toThrow('"languages[1].name" must be a non-empty string');
  });

  it("rejects an empty language list", () => {
    const d = trilingual();
    d.languages = [];
    expect(() => validateProfile(d)).toThrow('"languages" must be a non-empty list');
  });

  it("accepts a single language", () => {
    const d = trilingual();
    d.languages = [d.languages[0]];
    d.bios = { es: d.bios.es };
    d.metaDescriptions = { es: d.metaDescriptions.es };
    const result = validateProfile(d);
    expect(result.languages).toEqual([{ code: "es", name: "Español", ogLocale: "es_ES" }]);
    expect(result.defaultLanguage).toBe("es");
  });
});

describe("content language helpers", () => {
  it("derives the language constants from profile.json", () => {
    expect(LANGS).toEqual(profile.languages.map((l) => l.code));
    expect(DEFAULT_LANG).toBe(profile.defaultLanguage);
    for (const l of profile.languages) {
      expect(LANG_NAMES[l.code]).toBe(l.name);
      expect(OG_LOCALES[l.code]).toBe(l.ogLocale);
    }
  });

  it("accepts only the listed language codes", () => {
    expect(isLang(profile.defaultLanguage)).toBe(true);
    expect(isLang("zz")).toBe(false);
    expect(isLang(null)).toBe(false);
  });
});
