import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PRIMA Due Diligence Consult",
    short_name: "PRIMA",
    description:
      "Trusted Intelligence for Critical Decisions. Corporate intelligence, investigations, forensics, and risk advisory across Africa.",
    start_url: "/en",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#1e2a54",
    icons: [
      {
        src: "/icon.png",
        sizes: "any",
        type: "image/png",
      },
    ],
  };
}
