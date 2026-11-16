import { describe, expect, it } from "vitest";
import { validateProfile } from "../profile";
import { fixture } from "./fixture";

describe("validateProfile", () => {
  it("accepts the real profile.json", () => {
    expect(() => validateProfile(fixture())).not.toThrow();
  });

  it("rejects an unknown link key", () => {
    const d = fixture();
    d.links[0].key = "tiktok";
    expect(() => validateProfile(d)).toThrow('"links[0].key" is "tiktok"');
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
});
