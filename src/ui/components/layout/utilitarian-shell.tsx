import React from "react";

interface UtilitarianShellProps {
  children: React.ReactNode;
}

export function UtilitarianShell({ children }: UtilitarianShellProps) {
  return (
    <div style={shellContainerStyle}>
      <header style={headerStyle}>
        <div style={headerContentStyle}>
          <div style={brandingStyle}>
            <span style={logoBadgeStyle}>EXP</span>
            <h1 style={titleStyle}>Expenses Manager</h1>
          </div>
          <span style={systemBadgeStyle}>Clean Arch / Hexagonal</span>
        </div>
      </header>

      <main style={mainContentStyle}>
        {children}
      </main>

      <footer style={footerStyle}>
        <span>Expenses Manager · Utilitarian Edition · Pure Financial Invariants</span>
      </footer>
    </div>
  );
}

const shellContainerStyle: React.CSSProperties = {
  minHeight: "100vh",
  display: "flex",
  flexDirection: "column",
  width: "100%",
  maxWidth: "1280px",
  marginInline: "auto",
  paddingInline: "1.5rem",
  borderLeft: "var(--border-width) solid var(--color-border)",
  borderRight: "var(--border-width) solid var(--color-border)",
  backgroundColor: "var(--color-bg-canvas)",
};

const headerStyle: React.CSSProperties = {
  borderBottom: "var(--border-width-bold) solid var(--color-border)",
  paddingBlock: "1.25rem",
  backgroundColor: "var(--color-bg-surface)",
  marginInline: "-1.5rem",
  paddingInline: "1.5rem",
};

const headerContentStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  flexWrap: "wrap",
  gap: "1rem",
};

const brandingStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "0.75rem",
};

const logoBadgeStyle: React.CSSProperties = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  backgroundColor: "var(--color-border)",
  color: "var(--color-bg-surface)",
  fontWeight: 700,
  fontSize: "0.85rem",
  fontFamily: "var(--font-mono)",
  padding: "0.25rem 0.5rem",
  border: "var(--border-width) solid var(--color-border)",
};

const titleStyle: React.CSSProperties = {
  fontSize: "1.35rem",
  fontWeight: 700,
  letterSpacing: "-0.02em",
  textTransform: "uppercase",
};

const systemBadgeStyle: React.CSSProperties = {
  fontSize: "0.75rem",
  fontFamily: "var(--font-mono)",
  color: "var(--color-text-muted)",
  border: "var(--border-width) solid var(--color-border-subtle)",
  padding: "0.2rem 0.5rem",
};

const mainContentStyle: React.CSSProperties = {
  flex: 1,
  paddingBlock: "2rem",
};

const footerStyle: React.CSSProperties = {
  borderTop: "var(--border-width) solid var(--color-border)",
  paddingBlock: "1.25rem",
  textAlign: "center",
  fontSize: "0.8rem",
  color: "var(--color-text-muted)",
  fontFamily: "var(--font-mono)",
};
