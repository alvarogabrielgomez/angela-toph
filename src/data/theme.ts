import { profile, type Theme } from "./profile";

/** The validated `theme` of profile.json. */
export const theme: Theme = profile.theme;

/** Red, green and blue (0 to 255) of a six-digit hex color. */
function channels(hex: string): [number, number, number] {
  const channel = (start: number) => parseInt(hex.slice(start, start + 2), 16);
  return [channel(1), channel(3), channel(5)];
}

/** A hex color at an opacity from 0 to 1, as `rgba(r,g,b,a)` with no spaces. */
export function alpha(hex: string, a: number): string {
  const [r, g, b] = channels(hex);
  return `rgba(${r},${g},${b},${a})`;
}

/** The page background: the four stops from top to bottom. */
export function gradientCss(stops: Theme["gradient"]): string {
  return `linear-gradient(180deg, ${stops[0]} 0%, ${stops[1]} 42%, ${stops[2]} 68%, ${stops[3]} 100%)`;
}

/**
 * Custom properties for the `<html>` style attribute, read by globals.css.
 * The accent goes out as space-separated channels so the stylesheet can pick
 * its own opacity with `rgb(var(--color-accent-rgb) / 0.15)`.
 */
export function themeCssVars(t: Theme): Record<string, string> {
  return {
    "--color-bg": t.background,
    "--color-text": t.text,
    "--color-accent-light": t.accentLight,
    "--color-accent-rgb": channels(t.accent).join(" "),
  };
}
