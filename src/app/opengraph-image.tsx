import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { PERSON_NAME, PERSON_PHOTO, PERSON_ROLE } from "@/data/site";
import { alpha, gradientCss, theme } from "@/data/theme";

export const runtime = "nodejs";
export const alt = `${PERSON_NAME} — ${PERSON_ROLE}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Satori cannot resolve CSS variables, so this card reads the theme values directly.
export default async function OpengraphImage() {
  const avatar = await readFile(join(process.cwd(), "public", PERSON_PHOTO));
  const mime = PERSON_PHOTO.toLowerCase().endsWith(".png") ? "image/png" : "image/jpeg";
  const avatarSrc = `data:${mime};base64,${avatar.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: gradientCss(theme.gradient),
          color: theme.text,
          fontFamily: "sans-serif",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={avatarSrc}
          width={224}
          height={224}
          alt={PERSON_NAME}
          style={{
            borderRadius: "50%",
            objectFit: "cover",
            border: `6px solid ${theme.accent}`,
            boxShadow: `0 0 60px ${alpha(theme.accent, 0.45)}`,
          }}
        />
        <div style={{ fontSize: 76, fontWeight: 800, marginTop: 44, letterSpacing: "-0.02em" }}>
          {PERSON_NAME}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 26,
            padding: "14px 32px",
            borderRadius: 999,
            background: theme.accent,
            color: theme.onAccent,
            fontSize: 30,
            fontWeight: 700,
            letterSpacing: "0.04em",
          }}
        >
          {PERSON_ROLE}
        </div>
      </div>
    ),
    { ...size },
  );
}
