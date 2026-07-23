import { MetadataRoute } from "next";

export const dynamic = 'force-dynamic';

const API = process.env.NEXT_PUBLIC_API_URL || "/api";
const BASE_URL = "https://amanat.ye";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Static pages — high priority
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE_URL, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${BASE_URL}/books`, lastModified: now, changeFrequency: "hourly", priority: 0.95 },
    { url: `${BASE_URL}/authors`, lastModified: now, changeFrequency: "daily", priority: 0.85 },
    { url: `${BASE_URL}/categories`, lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: `${BASE_URL}/services`, lastModified: now, changeFrequency: "weekly", priority: 0.75 },
    { url: `${BASE_URL}/search`, lastModified: now, changeFrequency: "always", priority: 0.7 },
    { url: `${BASE_URL}/publishing`, lastModified: now, changeFrequency: "monthly", priority: 0.7 },
    { url: `${BASE_URL}/about`, lastModified: now, changeFrequency: "monthly", priority: 0.65 },
    { url: `${BASE_URL}/contact`, lastModified: now, changeFrequency: "monthly", priority: 0.65 },
  ];

  const dynamicPages: MetadataRoute.Sitemap = [];

  // Dynamic book pages
  try {
    const fetchUrl = API.startsWith("/") ? `http://127.0.0.1:3001${API}/books?limit=200` : `${API}/books?limit=200`;
    const res = await fetch(fetchUrl, { next: { revalidate: 3600 } });
    const data = await res.json();
    const bookPages: MetadataRoute.Sitemap = (data.data || []).map((book: { slug: string; updatedAt: string }) => ({
      url: `${BASE_URL}/books/${book.slug}`,
      lastModified: new Date(book.updatedAt || now),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
    dynamicPages.push(...bookPages);
  } catch { /* silent */ }

  // Dynamic author pages
  try {
    const fetchUrl = API.startsWith("/") ? `http://127.0.0.1:3001${API}/authors?limit=100` : `${API}/authors?limit=100`;
    const res = await fetch(fetchUrl, { next: { revalidate: 3600 } });
    const data = await res.json();
    const authorPages: MetadataRoute.Sitemap = (data.data || []).map((author: { id: number; updatedAt: string }) => ({
      url: `${BASE_URL}/authors/${author.id}`,
      lastModified: new Date(author.updatedAt || now),
      changeFrequency: "weekly" as const,
      priority: 0.7,
    }));
    dynamicPages.push(...authorPages);
  } catch { /* silent */ }

  return [...staticPages, ...dynamicPages];
}
