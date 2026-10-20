import React from "react";

export interface BadgeProps {
  children: React.ReactNode;
  variant?: "neutral" | "credit" | "debt";
  style?: React.CSSProperties;
}

export function Badge({ children, variant = "neutral", style }: BadgeProps) {
  const colorStyles: React.CSSProperties =
    variant === "credit"
      ? {
          color: "var(--color-credit)",
          backgroundColor: "var(--color-credit-bg)",
          borderColor: "var(--color-credit)",
        }
      : variant === "debt"
      ? {
          color: "var(--color-debt)",
          backgroundColor: "var(--color-debt-bg)",
          borderColor: "var(--color-debt)",
        }
      : {
          color: "var(--color-text-primary)",
          backgroundColor: "var(--color-bg-subtle)",
          borderColor: "var(--color-border-subtle)",
        };

  return (
    <span
      style={{
        display: "inline-block",
        padding: "0.2rem 0.5rem",
        fontSize: "0.75rem",
        fontWeight: 700,
        fontFamily: "var(--font-mono)",
        textTransform: "uppercase",
        border: "var(--border-width) solid",
        ...colorStyles,
        ...style,
      }}
    >
      {children}
    </span>
  );
}
