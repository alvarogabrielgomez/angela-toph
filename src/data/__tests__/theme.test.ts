import { describe, expect, it } from "vitest";
import { profile, validateProfile, type Theme } from "../profile";
import { alpha, gradientCss, themeCssVars, theme } from "../theme";
import { fixture } from "./fixture";

// The real profile.json holds whatever colors Angela keeps there. The helper
// tests start from this fixed theme so editing the JSON never breaks them.
const CYAN_THEME: Theme = {
  background: "#0A0818",
  gradient: ["#0A0818", "#1A0F38", "#2A1150", "#0E1E36"],
  accent: "#08BED8",
  accentLight: "#6FE3F2",
  onAccent: "#04222A",
  secondary: "#7C3AED",
  text: "#F3F2F8",
  textMuted: "#C9C2E4",
  textSubtle: "#9D93C8",
  surface: "#0A0718",
  avatarBorder: "#140C28",
  star: "#E7E2FF",
};

describe("alpha", () => {
  it("turns a hex color and an opacity into rgba()", () => {
    expect(alpha("#08BED8", 0.3)).toBe("rgba(8,190,216,0.3)");
  });

  it("reads each channel from its own pair of digits", () => {
    expect(alpha("#7C3AED", 0.2)).toBe("rgba(124,58,237,0.2)");
    expect(alpha("#0A0718", 0.45)).toBe("rgba(10,7,24,0.45)");
  });

  it("accepts lowercase hex and keeps a zero opacity", () => {
    expect(alpha("#08bed8", 0)).toBe("rgba(8,190,216,0)");
  });
});

describe("gradientCss", () => {
  it("builds the page background gradient with the four stops", () => {
    expect(gradientCss(CYAN_THEME.gradient)).toBe(
      "linear-gradient(180deg, #0A0818 0%, #1A0F38 42%, #2A1150 68%, #0E1E36 100%)",
    );
  });

  it("places each color at its own stop", () => {
    expect(gradientCss(["#000001", "#000002", "#000003", "#000004"])).toBe(
      "linear-gradient(180deg, #000001 0%, #000002 42%, #000003 68%, #000004 100%)",
    );
  });
});

describe("themeCssVars", () => {
  it("exposes the colors the stylesheet reads", () => {
    expect(themeCssVars(CYAN_THEME)).toEqual({
      "--color-bg": "#0A0818",
      "--color-text": "#F3F2F8",
      "--color-accent-light": "#6FE3F2",
      "--color-accent-rgb": "8 190 216",
    });
  });

  it("writes the accent as space-separated channels for rgb(var(...) / a)", () => {
    const vars = themeCssVars({ ...CYAN_THEME, accent: "#FF0066" });
    expect(vars["--color-accent-rgb"]).toBe("255 0 102");
  });
});

describe("theme", () => {
  it("is the validated theme of profile.json", () => {
    expect(profile.theme).toBeDefined();
    expect(theme).toBe(profile.theme);
    expect(theme).toEqual(fixture().theme);
  });
});

describe("validateProfile theme", () => {
  it("accepts the real profile.json theme", () => {
    expect(validateProfile(fixture()).theme).toEqual(fixture().theme);
  });

  it("accepts lowercase hex digits", () => {
    const d = fixture();
    d.theme.accent = "#08bed8";
    expect(validateProfile(d).theme.accent).toBe("#08bed8");
  });

  it("rejects a short hex color", () => {
    const d = fixture();
    d.theme.accent = "#FFF";
    expect(() => validateProfile(d)).toThrow(
      'src/data/profile.json: "theme.accent" must be a #RRGGBB color, got "#FFF"',
    );
  });

  it("rejects a named color", () => {
    const d = fixture();
    d.theme.accent = "red";
    expect(() => validateProfile(d)).toThrow(
      'src/data/profile.json: "theme.accent" must be a #RRGGBB color, got "red"',
    );
  });

  it("rejects a hex color with an alpha channel", () => {
    const d = fixture();
    d.theme.background = "#0A0818FF";
    expect(() => validateProfile(d)).toThrow('"theme.background" must be a #RRGGBB color');
  });

  it("rejects a hex color without the leading #", () => {
    const d = fixture();
    d.theme.text = "F3F2F8";
    expect(() => validateProfile(d)).toThrow('"theme.text" must be a #RRGGBB color');
  });

  it("rejects non-hex digits", () => {
    const d = fixture();
    d.theme.secondary = "#7C3AEG";
    expect(() => validateProfile(d)).toThrow('"theme.secondary" must be a #RRGGBB color');
  });

  it("checks every color key", () => {
    const keys = [
      "background",
      "accent",
      "accentLight",
      "onAccent",
      "secondary",
      "text",
      "textMuted",
      "textSubtle",
      "surface",
      "avatarBorder",
      "star",
    ];
    for (const key of keys) {
      const d = fixture();
      d.theme[key] = "blue";
      expect(() => validateProfile(d), key).toThrow(`"theme.${key}" must be a #RRGGBB color, got "blue"`);
    }
  });

  it("rejects a missing color", () => {
    const d = fixture();
    delete d.theme.onAccent;
    expect(() => validateProfile(d)).toThrow('"theme.onAccent" must be a non-empty string');
  });

  it("rejects a color that is not a string", () => {
    const d = fixture();
    d.theme.star = 0xe7e2ff;
    expect(() => validateProfile(d)).toThrow('"theme.star" must be a non-empty string');
  });

  it("rejects a missing theme", () => {
    const d = fixture();
    delete d.theme;
    expect(() => validateProfile(d)).toThrow('src/data/profile.json: "theme" must be an object');
  });

  it("rejects a gradient with 3 colors", () => {
    const d = fixture();
    d.theme.gradient = ["#0A0818", "#1A0F38", "#2A1150"];
    expect(() => validateProfile(d)).toThrow(
      'src/data/profile.json: "theme.gradient" must have exactly 4 colors, got 3',
    );
  });

  it("rejects a gradient with 5 colors", () => {
    const d = fixture();
    d.theme.gradient = ["#0A0818", "#1A0F38", "#2A1150", "#0E1E36", "#000000"];
    expect(() => validateProfile(d)).toThrow('"theme.gradient" must have exactly 4 colors, got 5');
  });

  it("rejects a gradient that is not a list", () => {
    const d = fixture();
    d.theme.gradient = "#0A0818";
    expect(() => validateProfile(d)).toThrow('"theme.gradient" must be a list of 4 colors');
  });

  it("rejects a bad color inside the gradient, naming its index", () => {
    const d = fixture();
    d.theme.gradient[2] = "purple";
    expect(() => validateProfile(d)).toThrow('"theme.gradient[2]" must be a #RRGGBB color, got "purple"');
  });
});
