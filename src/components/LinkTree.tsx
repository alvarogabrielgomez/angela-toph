"use client";

import { useEffect, useSyncExternalStore } from "react";
import Image from "next/image";
import { Icon } from "@/components/icons";
import { bios, links, LANGS, LANG_NAMES, type Lang } from "@/data/content";
import {
  subscribe,
  getSnapshot,
  getServerSnapshot,
  setLanguage,
} from "@/data/languageStore";

const MONO = "var(--font-jetbrains-mono), monospace";
const DISPLAY = "var(--font-montserrat), sans-serif";

function LangSwitcher({
  lang,
  onChange,
}: {
  lang: Lang;
  onChange: (lang: Lang) => void;
}) {
  return (
    <div
      role="group"
      aria-label="Language"
      style={{
        display: "inline-flex",
        gap: "3px",
        padding: "3px",
        borderRadius: "999px",
        background: "rgba(10,7,24,0.5)",
        border: "1px solid rgba(255,255,255,0.16)",
      }}
    >
      {LANGS.map((o) => {
        const on = o === lang;
        return (
          <button
            key={o}
            type="button"
            onClick={() => onChange(o)}
            aria-pressed={on}
            aria-label={LANG_NAMES[o]}
            style={{
              cursor: "pointer",
              border: "none",
              borderRadius: "999px",
              padding: "6px 12px",
              fontSize: "10.5px",
              fontWeight: 700,
              letterSpacing: "0.08em",
              fontFamily: MONO,
              background: on ? "#08BED8" : "transparent",
              color: on ? "#04222A" : "#C9C2E4",
              boxShadow: on ? "0 2px 12px rgba(8,190,216,0.35)" : "none",
              transition: "all 0.25s ease",
            }}
          >
            {o.toUpperCase()}
          </button>
        );
      })}
    </div>
  );
}

export default function LinkTree() {
  // SSR renders the default ("es"); useSyncExternalStore resolves the stored /
  // browser-detected preference on the client with no hydration mismatch.
  const lang = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // Keep the document language in sync for a11y / SEO.
  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        maxWidth: "430px",
        padding: "30px 24px 48px",
        animation: "fadeUp 0.8s cubic-bezier(0.2,0.7,0.2,1) both",
      }}
    >
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "30px" }}>
        <LangSwitcher lang={lang} onChange={setLanguage} />
      </div>

      <header style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        <div style={{ animation: "floatY 6s ease-in-out infinite" }}>
          <div
            style={{
              width: "118px",
              height: "118px",
              borderRadius: "50%",
              padding: "3px",
              background: "linear-gradient(160deg, rgba(8,190,216,0.9), rgba(124,58,237,0.7))",
              boxShadow: "0 0 0 10px rgba(8,190,216,0.06), 0 0 50px rgba(8,190,216,0.28)",
            }}
          >
            <Image
              src="/angela.jpg"
              alt="Angela Potenza"
              width={112}
              height={112}
              priority
              unoptimized
              sizes="112px"
              style={{
                width: "100%",
                height: "100%",
                borderRadius: "50%",
                objectFit: "cover",
                objectPosition: "60% 18%",
                display: "block",
                border: "3px solid #140C28",
              }}
            />
          </div>
        </div>

        <h1
          style={{
            fontFamily: DISPLAY,
            fontWeight: 800,
            fontSize: "30px",
            letterSpacing: "-0.01em",
            margin: "22px 0 0",
            textShadow: "0 4px 30px rgba(124,58,237,0.5)",
          }}
        >
          Angela Potenza
        </h1>

        <div
          style={{
            display: "inline-flex",
            marginTop: "11px",
            padding: "6px 15px",
            borderRadius: "999px",
            background: "#08BED8",
            color: "#04222A",
            fontFamily: DISPLAY,
            fontWeight: 700,
            fontSize: "12px",
            letterSpacing: "0.06em",
            boxShadow: "0 6px 24px rgba(8,190,216,0.35)",
          }}
        >
          Copywriter &amp; UX Designer
        </div>

        <p
          lang={lang}
          style={{
            margin: "18px 0 0",
            fontSize: "15px",
            lineHeight: 1.65,
            color: "#C9C2E4",
            maxWidth: "340px",
            textWrap: "pretty",
          }}
        >
          {bios[lang]}
        </p>
      </header>

      <nav
        aria-label="Links"
        style={{ display: "flex", flexDirection: "column", gap: "12px", marginTop: "32px" }}
      >
        {links.map((link) => (
          <a
            key={link.key}
            href={link.url}
            target="_blank"
            rel="me noopener noreferrer"
            className="linkRow"
            style={{
              display: "flex",
              alignItems: "center",
              gap: "13px",
              padding: "14px 22px",
              borderRadius: "999px",
              background: "rgba(10,7,24,0.45)",
              border: "1px solid rgba(8,190,216,0.30)",
              backdropFilter: "blur(6px)",
              WebkitBackdropFilter: "blur(6px)",
              textDecoration: "none",
              color: "#F3F2F8",
            }}
          >
            <span style={{ width: "20px", height: "20px", flex: "0 0 20px", color: "#6FE3F2" }}>
              <Icon name={link.key} />
            </span>
            <span style={{ flex: 1, fontFamily: DISPLAY, fontWeight: 700, fontSize: "14.5px", textAlign: "left" }}>
              {link.label}
            </span>
            <span
              style={{
                fontFamily: MONO,
                fontSize: "10.5px",
                color: "#9D93C8",
                whiteSpace: "nowrap",
                overflow: "hidden",
                textOverflow: "ellipsis",
                maxWidth: "140px",
              }}
            >
              {link.handle}
            </span>
          </a>
        ))}
      </nav>
    </div>
  );
}
