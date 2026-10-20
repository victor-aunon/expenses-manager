import React from "react";
import { ExpenseItemView } from "@/ui/types";
import { ExpenseItem } from "./expense-item";

export interface ExpenseListProps {
  expenses: ExpenseItemView[];
  isLoading: boolean;
  onDeleteExpense: (id: string) => void;
  onFilterChange: (filters: { groupId?: string; category?: string }) => void;
  selectedGroupId?: string;
  selectedCategory?: string;
}

export function ExpenseList({
  expenses,
  isLoading,
  onDeleteExpense,
  onFilterChange,
  selectedGroupId,
  selectedCategory,
}: ExpenseListProps) {
  return (
    <section style={containerStyle} aria-labelledby="list-heading">
      <div style={headerRowStyle}>
        <h2 id="list-heading" style={headingStyle}>
          Recorded Expenses ({expenses.length})
        </h2>

        <div style={filtersStyle}>
          <select
            value={selectedCategory || ""}
            onChange={(e) =>
              onFilterChange({
                groupId: selectedGroupId,
                category: e.target.value || undefined,
              })
            }
            aria-label="Filter by category"
            style={filterSelectStyle}
          >
            <option value="">All Categories</option>
            <option value="FOOD">Food & Dining</option>
            <option value="TRANSPORTATION">Transportation</option>
            <option value="HOUSING">Housing</option>
            <option value="UTILITIES">Utilities</option>
            <option value="ENTERTAINMENT">Entertainment</option>
            <option value="HEALTHCARE">Healthcare</option>
            <option value="OTHER">Other</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div style={emptyStateStyle}>Loading expenses...</div>
      ) : expenses.length === 0 ? (
        <div style={emptyStateStyle}>
          No expenses recorded yet. Use the form above to record your first expense.
        </div>
      ) : (
        <div style={tableWrapperStyle}>
          <table style={tableStyle}>
            <thead>
              <tr style={tableHeaderRowStyle}>
                <th style={{ ...tableHeaderStyle, width: "120px" }}>Date</th>
                <th style={tableHeaderStyle}>Description</th>
                <th style={{ ...tableHeaderStyle, width: "160px" }}>Category</th>
                <th style={{ ...tableHeaderStyle, textAlign: "right", width: "140px" }}>Amount</th>
                <th style={{ ...tableHeaderStyle, textAlign: "center", width: "80px" }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <ExpenseItem
                  key={expense.id}
                  expense={expense}
                  onDelete={onDeleteExpense}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

const containerStyle: React.CSSProperties = {
  backgroundColor: "var(--color-bg-surface)",
  border: "var(--border-width) solid var(--color-border)",
  padding: "1.5rem",
};

const headerRowStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  flexWrap: "wrap",
  gap: "1rem",
  marginBottom: "1.25rem",
  borderBottom: "var(--border-width) solid var(--color-border-subtle)",
  paddingBottom: "0.75rem",
};

const headingStyle: React.CSSProperties = {
  fontSize: "1.1rem",
  fontWeight: 700,
  letterSpacing: "-0.01em",
  textTransform: "uppercase",
};

const filtersStyle: React.CSSProperties = {
  display: "flex",
  gap: "0.5rem",
};

const filterSelectStyle: React.CSSProperties = {
  fontSize: "0.85rem",
  padding: "0.35rem 0.6rem",
};

const emptyStateStyle: React.CSSProperties = {
  padding: "3rem 1rem",
  textAlign: "center",
  color: "var(--color-text-muted)",
  fontStyle: "italic",
};

const tableWrapperStyle: React.CSSProperties = {
  overflowX: "auto",
};

const tableStyle: React.CSSProperties = {
  width: "100%",
  borderCollapse: "collapse",
  textAlign: "left",
};

const tableHeaderRowStyle: React.CSSProperties = {
  borderBottom: "var(--border-width-bold) solid var(--color-border)",
  backgroundColor: "var(--color-bg-subtle)",
};

const tableHeaderStyle: React.CSSProperties = {
  padding: "0.75rem 1rem",
  fontSize: "0.8rem",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.03em",
  color: "var(--color-text-primary)",
};
