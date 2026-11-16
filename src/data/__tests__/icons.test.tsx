import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { Icon } from "@/components/icons";

describe("Icon", () => {
  it("draws a custom icon with its own viewBox and path", () => {
    const html = renderToStaticMarkup(
      <Icon icon={{ kind: "custom", viewBox: "0 0 10 10", paths: ["M0 0L10 10"] }} />,
    );
    expect(html).toContain('viewBox="0 0 10 10"');
    expect(html).toContain('d="M0 0L10 10"');
  });

  it("draws the generic link glyph, hidden from assistive tech", () => {
    const html = renderToStaticMarkup(<Icon icon={{ kind: "generic" }} />);
    expect(html).toContain("<svg");
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain('viewBox="0 0 24 24"');
    expect(html).toMatch(/<path d="M[^"]+" fill="currentColor"/);
  });

  it("draws the blog icon with its 56x57 viewBox", () => {
    const html = renderToStaticMarkup(<Icon icon={{ kind: "builtin", name: "blog" }} />);
    expect(html).toContain('viewBox="0 0 56 57"');
  });

  it("draws another built-in icon with the 24x24 viewBox", () => {
    const html = renderToStaticMarkup(<Icon icon={{ kind: "builtin", name: "youtube" }} />);
    expect(html).toContain('viewBox="0 0 24 24"');
    expect(html).toContain('d="M23.498 6.186');
  });
});
