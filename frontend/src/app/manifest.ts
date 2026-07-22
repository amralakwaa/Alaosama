import { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "أمانات ومكتبة أسامة — الوجهة الرقمية للكتاب",
    short_name: "مكتبة أسامة",
    description: "الوجهة الرقمية للكتاب في اليمن — مكتبة ذمار",
    start_url: "/",
    display: "standalone",
    background_color: "#FAFAF7",
    theme_color: "#8B6914",
    lang: "ar",
    dir: "rtl",
    icons: [
      { src: "/logo.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/logo.png", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
    categories: ["books", "education", "shopping"],
  };
}
