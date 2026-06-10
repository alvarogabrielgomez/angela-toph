import Background from "@/components/Background";
import LinkTree from "@/components/LinkTree";
import JsonLd from "@/components/JsonLd";

export default function Home() {
  return (
    <>
      <JsonLd />
      <main
        style={{
          minHeight: "100vh",
          position: "relative",
          overflow: "hidden",
          background:
            "linear-gradient(180deg, #0A0818 0%, #1A0F38 42%, #2A1150 68%, #0E1E36 100%)",
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
