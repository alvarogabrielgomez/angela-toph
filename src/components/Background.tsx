// Static decorative backdrop: starfield, glow blobs, film grain, bottom halo.
// Rendered on the server (no interactivity).

const STAR_POINTS: [number, number][] = [
  [8, 6], [22, 14], [37, 4], [52, 10], [66, 7], [81, 13], [93, 5], [14, 22],
  [45, 20], [73, 24], [88, 20], [5, 34], [30, 30], [58, 33], [95, 32], [19, 44],
  [40, 42], [69, 40], [84, 46], [10, 52], [50, 50], [76, 55], [92, 58], [27, 58],
  [61, 57], [7, 68], [33, 70], [55, 66], [78, 69], [91, 72], [16, 80], [44, 78],
  [68, 82], [86, 86], [25, 88], [59, 90],
];

const GRAIN_NOISE =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%25' height='100%25' filter='url(%23n)'/></svg>\")";

export default function Background() {
  return (
    <div aria-hidden="true" style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
      {/* Starfield */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
        {STAR_POINTS.map((p, i) => (
          <span
            key={i}
            style={{
              position: "absolute",
              left: `${p[0]}%`,
              top: `${p[1]}%`,
              width: i % 5 === 0 ? "3px" : "2px",
              height: i % 5 === 0 ? "3px" : "2px",
              borderRadius: "50%",
              background: i % 4 === 0 ? "#6FE3F2" : "#E7E2FF",
              animation: `twinkle ${2.4 + (i % 5) * 0.9}s ease-in-out ${(i % 7) * 0.5}s infinite`,
            }}
          />
        ))}
      </div>

      {/* Cyan glow blob, bottom-left */}
      <div
        style={{
          position: "absolute",
          left: "-120px",
          bottom: "18%",
          width: "340px",
          height: "340px",
          borderRadius: "50%",
          background:
            "radial-gradient(circle at 35% 30%, rgba(8,190,216,0.28) 0%, rgba(8,190,216,0.05) 45%, rgba(8,190,216,0) 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Purple glow blob, top-right */}
      <div
        style={{
          position: "absolute",
          right: "-140px",
          top: "10%",
          width: "320px",
          height: "320px",
          borderRadius: "50%",
          background: "radial-gradient(circle, rgba(124,58,237,0.20) 0%, rgba(124,58,237,0) 65%)",
          pointerEvents: "none",
        }}
      />

      {/* Film grain */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          opacity: 0.05,
          mixBlendMode: "soft-light",
          backgroundImage: GRAIN_NOISE,
          backgroundSize: "160px 160px",
        }}
      />

      {/* Bottom cyan halo */}
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: "110px",
          background:
            "radial-gradient(55% 130px at 50% 115%, rgba(8,190,216,0.28) 0%, rgba(8,190,216,0) 100%)",
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
