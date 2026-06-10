import { DEFAULT_LANG, LANG_STORAGE_KEY, isLang, type Lang } from "@/data/content";

// Tiny external store so the chosen language can be read via
// useSyncExternalStore: SSR uses the default ("es"), the client resolves the
// real preference from localStorage / the browser language without a hydration
// mismatch, and updates fan out to every subscriber.

let current: Lang | null = null;
const listeners = new Set<() => void>();

function resolve(): Lang {
  if (typeof window === "undefined") return DEFAULT_LANG;
  try {
    const stored = window.localStorage.getItem(LANG_STORAGE_KEY);
    if (isLang(stored)) return stored;
  } catch {
    // localStorage may be unavailable (private mode / blocked storage).
  }
  const nav = window.navigator;
  const candidates =
    nav.languages && nav.languages.length > 0 ? nav.languages : [nav.language];
  const detected = candidates.map((l) => l.slice(0, 2).toLowerCase()).find(isLang);
  return detected ?? DEFAULT_LANG;
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
  } catch {
    // Ignore persistence failures.
  }
  listeners.forEach((l) => l());
}
