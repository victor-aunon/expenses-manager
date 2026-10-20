import React from "react";
import { MemberBalanceView } from "@/ui/types";

interface MemberBalanceCardProps {
  balances: MemberBalanceView[];
  members: Array<{ id: string; name: string }>;
}

export function MemberBalanceCard({ balances, members }: MemberBalanceCardProps) {
  if (members.length === 0) {
    return <p style={mutedTextStyle}>No members in this group yet.</p>;
  }

  // Create lookup for balances
  const balanceMap = new Map(balances.map((b) => [b.memberId, b]));

  return (
    <div style={containerStyle}>
      {members.map((member) => {
        const bal = balanceMap.get(member.id);
        const status = bal?.status || "SETTLED";
        const netFormatted = bal?.netBalance.formatted || "0.00 €";
        const totalPaid = bal?.totalPaid.formatted || "0.00 €";
        const totalOwed = bal?.totalOwed.formatted || "0.00 €";

        const statusColor =
          status === "CREDIT"
            ? "var(--color-credit)"
            : status === "DEBT"
            ? "var(--color-debt)"
            : "var(--color-text-muted)";

        const statusBg =
          status === "CREDIT"
            ? "var(--color-credit-bg)"
            : status === "DEBT"
            ? "var(--color-debt-bg)"
            : "var(--color-bg-subtle)";

        return (
          <div key={member.id} style={cardItemStyle}>
            <div style={memberInfoStyle}>
              <span style={memberNameStyle}>{member.name}</span>
              <span
                style={{
                  ...badgeStyle,
                  color: statusColor,
                  backgroundColor: statusBg,
                }}
              >
                {status === "CREDIT" ? "GETS BACK" : status === "DEBT" ? "OWES" : "SETTLED"}
              </span>
            </div>

            <div style={statsRowStyle}>
              <div style={statColStyle}>
                <span style={statLabelStyle}>Paid</span>
                <span className="currency-amount" style={statValueStyle}>
                  {totalPaid}
                </span>
              </div>

              <div style={statColStyle}>
                <span style={statLabelStyle}>Share Owed</span>
                <span className="currency-amount" style={statValueStyle}>
                  {totalOwed}
                </span>
              </div>

              <div style={{ ...statColStyle, textAlign: "right" }}>
                <span style={statLabelStyle}>Net Balance</span>
                <span
                  className="currency-amount"
                  style={{ ...statValueStyle, fontWeight: 700, color: statusColor }}
                >
                  {netFormatted}
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

const containerStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "0.75rem",
};

const cardItemStyle: React.CSSProperties = {
  backgroundColor: "var(--color-bg-surface)",
  border: "var(--border-width) solid var(--color-border-subtle)",
  padding: "1rem",
};

const memberInfoStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "0.75rem",
};

const memberNameStyle: React.CSSProperties = {
  fontWeight: 700,
  fontSize: "0.95rem",
};

const badgeStyle: React.CSSProperties = {
  fontSize: "0.7rem",
  fontWeight: 700,
  fontFamily: "var(--font-mono)",
  padding: "0.2rem 0.5rem",
  border: "var(--border-width) solid currentColor",
};

const statsRowStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  gap: "1rem",
  paddingTop: "0.5rem",
  borderTop: "var(--border-width) solid var(--color-bg-subtle)",
};

const statColStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "0.15rem",
};

const statLabelStyle: React.CSSProperties = {
  fontSize: "0.75rem",
  textTransform: "uppercase",
  color: "var(--color-text-muted)",
};

const statValueStyle: React.CSSProperties = {
  fontSize: "0.9rem",
};

const mutedTextStyle: React.CSSProperties = {
  fontSize: "0.85rem",
  color: "var(--color-text-muted)",
  fontStyle: "italic",
};
