import type { Metadata } from "next";
import "@/ui/styles/globals.css";
import { UtilitarianShell } from "@/ui/components/layout/utilitarian-shell";

export const metadata: Metadata = {
  title: "Expenses Manager",
  description: "Shared and Personal Expenses Manager with Pure Financial Invariants",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <UtilitarianShell>
          {children}
        </UtilitarianShell>
      </body>
    </html>
  );
}
