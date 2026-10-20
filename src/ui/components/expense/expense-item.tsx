import React from "react";
import { ExpenseItemView } from "@/ui/types";

interface ExpenseItemProps {
  expense: ExpenseItemView;
  onDelete: (id: string) => void;
}

export function ExpenseItem({ expense, onDelete }: ExpenseItemProps) {
  return (
    <tr style={rowStyle}>
      <td style={{ ...cellStyle, fontFamily: "var(--font-mono)" }}>{expense.date}</td>
      <td style={cellStyle}>
        <div style={descriptionContainerStyle}>
          <span style={descTextStyle}>{expense.description}</span>
          {expense.groupName && (
            <span style={groupBadgeStyle}>
              {expense.groupName}
              {expense.payerName ? ` · Paid by ${expense.payerName}` : ""}
            </span>
          )}
        </div>
      </td>
      <td style={cellStyle}>
        <span style={categoryBadgeStyle}>{expense.categoryLabel}</span>
      </td>
      <td style={{ ...cellStyle, textAlign: "right", fontWeight: 700 }}>
        <span className="currency-amount">{expense.amount.formatted}</span>
      </td>
      <td style={{ ...cellStyle, textAlign: "center", width: "80px" }}>
        <button
          onClick={() => onDelete(expense.id)}
          style={deleteButtonStyle}
          aria-label={`Delete expense: ${expense.description}`}
        >
          DEL
        </button>
      </td>
    </tr>
  );
}

const rowStyle: React.CSSProperties = {
  borderBottom: "var(--border-width) solid var(--color-border-subtle)",
  backgroundColor: "var(--color-bg-surface)",
};

const cellStyle: React.CSSProperties = {
  padding: "0.85rem 1rem",
  verticalAlign: "middle",
};

const descriptionContainerStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "0.25rem",
};

const descTextStyle: React.CSSProperties = {
  fontWeight: 600,
  color: "var(--color-text-primary)",
};

const groupBadgeStyle: React.CSSProperties = {
  fontSize: "0.75rem",
  color: "var(--color-text-muted)",
  fontFamily: "var(--font-mono)",
};

const categoryBadgeStyle: React.CSSProperties = {
  display: "inline-block",
  fontSize: "0.75rem",
  fontWeight: 600,
  textTransform: "uppercase",
  padding: "0.2rem 0.5rem",
  backgroundColor: "var(--color-bg-subtle)",
  border: "var(--border-width) solid var(--color-border-subtle)",
  color: "var(--color-text-primary)",
};

const deleteButtonStyle: React.CSSProperties = {
  padding: "0.25rem 0.5rem",
  fontSize: "0.75rem",
  fontWeight: 700,
  fontFamily: "var(--font-mono)",
  backgroundColor: "transparent",
  color: "var(--color-debt)",
  border: "var(--border-width) solid var(--color-debt)",
  cursor: "pointer",
};
