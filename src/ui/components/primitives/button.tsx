import React from "react";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
}

export function Button({ variant = "primary", style, children, ...props }: ButtonProps) {
  const variantStyles: React.CSSProperties =
    variant === "danger"
      ? {
          backgroundColor: "transparent",
          color: "var(--color-debt)",
          borderColor: "var(--color-debt)",
        }
      : variant === "secondary"
      ? {
          backgroundColor: "var(--color-bg-subtle)",
          color: "var(--color-text-primary)",
          borderColor: "var(--color-border-subtle)",
        }
      : {
          backgroundColor: "var(--color-border)",
          color: "var(--color-bg-surface)",
          borderColor: "var(--color-border)",
        };

  return (
    <button
      style={{
        padding: "0.5rem 1rem",
        fontSize: "0.85rem",
        fontWeight: 600,
        textTransform: "uppercase",
        letterSpacing: "0.02em",
        border: "var(--border-width) solid",
        cursor: props.disabled ? "not-allowed" : "pointer",
        opacity: props.disabled ? 0.5 : 1,
        ...variantStyles,
        ...style,
      }}
      {...props}
    >
      {children}
    </button>
  );
}
