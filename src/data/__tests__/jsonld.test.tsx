import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import JsonLd, { serializeJsonLd } from "@/components/JsonLd";

describe("serializeJsonLd", () => {
  const hostile = { description: 'Hi </script><script>alert("x")</script> <!-- end' };

  it("escapes every < so data cannot close the script tag", () => {
    const json = serializeJsonLd(hostile);
    expect(json).not.toContain("<");
    expect(json).not.toContain("</script");
    // The escape is a backslash followed by u003c.
    const escaped = String.fromCharCode(92) + "u003c";
    expect(json).toContain(escaped + "/script>");
  });

  it("round-trips: parsing the output gives back the original data", () => {
    expect(JSON.parse(serializeJsonLd(hostile))).toEqual(hostile);
  });

  it("leaves data without < unchanged", () => {
    const data = { name: "Angela", list: [1, 2], nested: { ok: true } };
    expect(serializeJsonLd(data)).toBe(JSON.stringify(data));
  });
});

describe("JsonLd component", () => {
  it("renders one ld+json script that holds no raw <", () => {
    const html = renderToStaticMarkup(<JsonLd />);
    const body = html.replace(/^<script type="application\/ld\+json">/, "").replace(/<\/script>$/, "");
    expect(html.startsWith('<script type="application/ld+json">')).toBe(true);
    expect(body).not.toContain("<");
    expect(JSON.parse(body)["@type"]).toBe("ProfilePage");
  });
});
