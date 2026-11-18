import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";

// LinkTree reads LANGS from content.ts. Each test sets the list it wants and
// loads a fresh copy of the component.
async function renderWith(langs: string[]): Promise<string> {
  vi.resetModules();
  vi.doMock("@/data/content", async (importActual) => {
    const actual = await importActual<typeof import("@/data/content")>();
    return { ...actual, LANGS: langs };
  });
  const { default: LinkTree } = await import("@/components/LinkTree");
  return renderToStaticMarkup(<LinkTree />);
}

describe("LinkTree language switcher", () => {
  afterEach(() => {
    vi.doUnmock("@/data/content");
  });

  it("shows one button per language", async () => {
    const html = await renderWith(["es", "en", "pt"]);
    expect(html).toContain('aria-label="Language"');
    expect(html.match(/aria-pressed=/g)).toHaveLength(3);
  });

  it("hides the switcher when the profile has a single language", async () => {
    const html = await renderWith(["es"]);
    expect(html).not.toContain('aria-label="Language"');
    expect(html).not.toContain("aria-pressed");
  });
});
