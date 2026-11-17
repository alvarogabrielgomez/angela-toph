import Background from "@/components/Background";
import LinkTree from "@/components/LinkTree";
import JsonLd from "@/components/JsonLd";
import { gradientCss, theme } from "@/data/theme";

export default function Home() {
  return (
    <>
      <JsonLd />
      <main
        style={{
          minHeight: "100vh",
          position: "relative",
          overflow: "hidden",
          background: gradientCss(theme.gradient),
          display: "flex",
          justifyContent: "center",
        }}
      >
        <Background />
        <LinkTree />
      </main>
    </>
  );
}
