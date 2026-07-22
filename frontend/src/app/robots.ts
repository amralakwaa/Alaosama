import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: [
          "/",
          "/books",
          "/books/",
          "/authors",
          "/authors/",
          "/categories",
          "/categories/",
          "/services",
          "/search",
          "/about",
          "/contact",
          "/publishing",
        ],
        disallow: [
          "/admin",
          "/admin/",
          "/dashboard",
          "/dashboard/",
          "/profile",
          "/author/",
          "/api/",
          "/login",
          "/register",
        ],
      },
      {
        // Allow Googlebot specific crawl
        userAgent: "Googlebot",
        allow: ["/books/", "/authors/", "/services/"],
      },
    ],
    sitemap: "https://amanat.ye/sitemap.xml",
  };
}
