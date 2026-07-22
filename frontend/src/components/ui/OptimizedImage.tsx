"use client";

import NextImage, { ImageProps as NextImageProps } from "next/image";
import { useState } from "react";

const API_BASE = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000/api").replace("/api", "");

interface OptimizedImageProps extends Omit<NextImageProps, "src"> {
  src: string | null | undefined;
  fallback?: React.ReactNode;
  /** alt is required for accessibility */
  alt: string;
}

/**
 * OptimizedImage — Unified image component for the whole app.
 * - Auto-resolves relative API URLs to absolute.
 * - Falls back gracefully on broken images.
 * - Uses next/image for WebP srcset, lazy loading, and caching.
 */
export default function OptimizedImage({
  src,
  alt,
  fallback,
  ...props
}: OptimizedImageProps) {
  const [errored, setErrored] = useState(false);

  if (!src || errored) {
    return <>{fallback ?? null}</>;
  }

  // Keep relative URLs relative to use Next.js rewrites
  const resolvedSrc = src;

  return (
    <NextImage
      src={resolvedSrc}
      alt={alt}
      onError={() => setErrored(true)}
      {...props}
    />
  );
}
