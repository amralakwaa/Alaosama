"use client";

import React, { forwardRef } from "react";

type ButtonVariant = "gold" | "gold-outline" | "ghost" | "ink" | "danger";
type ButtonSize = "xs" | "sm" | "md" | "lg" | "xl";
// Legacy compat
type LegacyVariant = "primary" | "accent";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant | LegacyVariant;
  size?: ButtonSize;
  loading?: boolean;
  children: React.ReactNode;
  asChild?: boolean;
}

const VARIANT_MAP: Record<string, string> = {
  gold:         "btn-gold",
  "gold-outline":"btn-gold-outline",
  ghost:        "btn-ghost",
  ink:          "btn-ink",
  danger:       "btn-danger",
  // Legacy aliases
  primary:      "btn-ink",
  accent:       "btn-gold",
};

const SIZE_MAP: Record<string, string> = {
  xs: "btn-xs",
  sm: "btn-sm",
  md: "btn-md",
  lg: "btn-lg",
  xl: "btn-xl",
};

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = "gold",
      size = "md",
      loading = false,
      children,
      className = "",
      disabled,
      ...props
    },
    ref
  ) {
    const variantClass = VARIANT_MAP[variant] ?? "btn-gold";
    const sizeClass = SIZE_MAP[size] ?? "btn-md";

    return (
      <button
        ref={ref}
        className={[
          "btn",
          variantClass,
          sizeClass,
          loading ? "btn-loading" : "",
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        {...props}
      >
        {!loading && children}
        {loading && <span className="sr-only">جارٍ التحميل…</span>}
      </button>
    );
  }
);

Button.displayName = "Button";
export default Button;
