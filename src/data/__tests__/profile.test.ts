import { describe, expect, it } from "vitest";
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
