import { ImageResponse } from "next/og";
import { SITE_SETTINGS } from "@/features/content/fallback/settings";
import type { Locale } from "@/i18n/routing";

export const alt = "PRIMA Due Diligence Consult";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpenGraphImage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const tagline = SITE_SETTINGS.tagline[locale] ?? SITE_SETTINGS.tagline.en;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #141d3d 0%, #1e2a54 55%, #00492b 100%)",
          padding: 72,
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div
            style={{
              width: 18,
              height: 64,
              background: "#018f55",
              borderRadius: 4,
            }}
          />
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              color: "#ffffff",
              fontSize: 34,
              fontWeight: 700,
              letterSpacing: 2,
            }}
          >
            PRIMA DUE DILIGENCE CONSULT
          </div>
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 24,
          }}
        >
          <div
            style={{
              color: "#ffffff",
              fontSize: 64,
              fontWeight: 700,
              lineHeight: 1.15,
              maxWidth: 980,
            }}
          >
            {tagline}
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ width: 56, height: 6, background: "#5cb531" }} />
            <div style={{ color: "#9fb3ae", fontSize: 28 }}>primaddc.com</div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
