import { DEFAULT_LANG, LANG_STORAGE_KEY, isLang, type Lang } from "@/data/content";

// Tiny external store so the chosen language can be read via
// useSyncExternalStore: SSR uses the default language, the client resolves the
// real preference from localStorage / the browser language without a hydration
// mismatch, and updates fan out to every subscriber.

let current: Lang | null = null;
const listeners = new Set<() => void>();

/**
 * Picks the language to show. A stored language that profile.json no longer
 * lists is ignored, then the first listed browser language wins, then the
 * default.
 */
export function resolveLanguage(stored: string | null, browser: readonly string[]): Lang {
  if (isLang(stored)) return stored;
  const detected = browser.map((l) => l.slice(0, 2).toLowerCase()).find(isLang);
  return detected ?? DEFAULT_LANG;
}

function readStored(): string | null {
  try {
    return window.localStorage.getItem(LANG_STORAGE_KEY);
  } catch (error) {
    // localStorage may be unavailable (private mode / blocked storage).
    console.warn("Could not read the saved language from localStorage.", error);
    return null;
  }
}

function resolve(): Lang {
  if (typeof window === "undefined") return DEFAULT_LANG;
  const nav = window.navigator;
  const browser = nav.languages && nav.languages.length > 0 ? nav.languages : [nav.language];
  return resolveLanguage(readStored(), browser);
}

export function subscribe(callback: () => void): () => void {
  listeners.add(callback);
  return () => {
    listeners.delete(callback);
  };
}

export function getSnapshot(): Lang {
  if (current === null) current = resolve();
  return current;
}

export function getServerSnapshot(): Lang {
  return DEFAULT_LANG;
}

export function setLanguage(next: Lang): void {
  if (next === current) return;
  current = next;
  try {
    window.localStorage.setItem(LANG_STORAGE_KEY, next);
  } catch (error) {
    // The choice still applies for this visit; it is just not remembered.
    console.warn("Could not save the language to localStorage.", error);
  }
  listeners.forEach((l) => l());
}
