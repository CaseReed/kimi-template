import { ImageResponse } from "next/og";

// Route segment config
export const runtime = "edge";

// Image metadata
export const alt = "kimi-template - Production-Ready Next.js 16 Starter";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

/**
 * Generate Open Graph image dynamically
 * This creates a shareable image for social media platforms
 * @see https://nextjs.org/docs/app/api-reference/file-conventions/metadata/opengraph-image
 */
export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "48px",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        {/* Logo/Brand area */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "16px",
            marginBottom: "32px",
          }}
        >
          <div
            style={{
              width: "64px",
              height: "64px",
              borderRadius: "16px",
              background: "linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "32px",
              fontWeight: "bold",
              color: "white",
            }}
          >
            K
          </div>
          <span
            style={{
              fontSize: "48px",
              fontWeight: "bold",
              color: "white",
              letterSpacing: "-0.02em",
            }}
          >
            kimi-template
          </span>
        </div>

        {/* Main title */}
        <h1
          style={{
            fontSize: "56px",
            fontWeight: "bold",
            color: "white",
            textAlign: "center",
            lineHeight: 1.1,
            margin: "0 0 24px 0",
            letterSpacing: "-0.02em",
          }}
        >
          Production-Ready Starter
        </h1>

        {/* Subtitle */}
        <p
          style={{
            fontSize: "28px",
            color: "#94a3b8",
            textAlign: "center",
            lineHeight: 1.4,
            margin: 0,
            maxWidth: "800px",
          }}
        >
          Next.js 16 · Tailwind CSS v4 · React 19 · Better Auth · Drizzle ORM
        </p>

        {/* Feature badges */}
        <div
          style={{
            display: "flex",
            gap: "16px",
            marginTop: "40px",
          }}
        >
          {["Authentication", "Dashboard", "i18n", "Type-Safe"].map((badge) => (
            <span
              key={badge}
              style={{
                padding: "12px 24px",
                borderRadius: "9999px",
                background: "rgba(255, 255, 255, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                color: "white",
                fontSize: "18px",
                fontWeight: "500",
              }}
            >
              {badge}
            </span>
          ))}
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
