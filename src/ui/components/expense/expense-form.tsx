import React, { useState } from "react";
import { CurrencyCode } from "@/core/domain/value-objects/money.vo";

export interface GroupOption {
  id: string;
  name: string;
  members: Array<{ id: string; name: string }>;
}

export interface ExpenseFormData {
  amount: string;
  currency: CurrencyCode;
  date: string;
  category: string;
  description: string;
  groupId?: string;
  payerMemberId?: string;
}

export interface ExpenseFormProps {
  groups: GroupOption[];
  categories: Array<{ value: string; label: string }>;
  isSubmitting: boolean;
  onSubmit: (formData: ExpenseFormData) => Promise<void>;
  errorMessage?: string;
}

export function ExpenseForm({
  groups,
  categories,
  isSubmitting,
  onSubmit,
  errorMessage,
}: ExpenseFormProps) {
  const today = new Date().toISOString().split("T")[0];

  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState<CurrencyCode>("EUR");
  const [date, setDate] = useState(today);
  const [category, setCategory] = useState(categories[0]?.value || "FOOD");
  const [description, setDescription] = useState("");
  const [groupId, setGroupId] = useState("");
  const [payerMemberId, setPayerMemberId] = useState("");
  const [localError, setLocalError] = useState<string | null>(null);

  const selectedGroup = groups.find((g) => g.id === groupId);

  const handleGroupChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newGroupId = e.target.value;
    setGroupId(newGroupId);
    const grp = groups.find((g) => g.id === newGroupId);
    setPayerMemberId(grp?.members[0]?.id || "");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLocalError(null);

    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      setLocalError("Amount must be greater than zero");
      return;
    }

    if (!description.trim()) {
      setLocalError("Description cannot be empty");
      return;
    }

    if (groupId && !payerMemberId) {
      setLocalError("Please designate a payer for this group expense");
      return;
    }

    try {
      await onSubmit({
        amount,
        currency,
        date,
        category,
        description: description.trim(),
        groupId: groupId || undefined,
        payerMemberId: groupId ? payerMemberId : undefined,
      });

      // Reset form
      setAmount("");
      setDescription("");
      setLocalError(null);
    } catch (err: any) {
      setLocalError(err?.message || "Failed to save expense");
    }
  };

  return (
    <section style={cardStyle} aria-labelledby="form-heading">
      <h2 id="form-heading" style={headingStyle}>
        Record New Expense
      </h2>

      {(errorMessage || localError) && (
        <div style={errorBannerStyle} role="alert">
          {errorMessage || localError}
        </div>
      )}

      <form onSubmit={handleSubmit} style={formStyle}>
        <div style={rowStyle}>
          <div style={{ ...fieldStyle, flex: 2 }}>
            <label htmlFor="amount" style={labelStyle}>
              Amount
            </label>
            <input
              id="amount"
              type="number"
              step="0.01"
              min="0.01"
              required
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              style={inputStyle}
            />
          </div>

          <div style={{ ...fieldStyle, flex: 1 }}>
            <label htmlFor="currency" style={labelStyle}>
              Currency
            </label>
            <select
              id="currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value as CurrencyCode)}
              style={inputStyle}
            >
              <option value="EUR">EUR (€)</option>
              <option value="USD">USD ($)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>

          <div style={{ ...fieldStyle, flex: 1.5 }}>
            <label htmlFor="date" style={labelStyle}>
              Date
            </label>
            <input
              id="date"
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              style={inputStyle}
            />
          </div>
        </div>

        <div style={rowStyle}>
          <div style={{ ...fieldStyle, flex: 1 }}>
            <label htmlFor="category" style={labelStyle}>
              Category
            </label>
            <select
              id="category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              style={inputStyle}
            >
              {categories.map((cat) => (
                <option key={cat.value} value={cat.value}>
                  {cat.label}
                </option>
              ))}
            </select>
          </div>

          <div style={{ ...fieldStyle, flex: 2 }}>
            <label htmlFor="description" style={labelStyle}>
              Description
            </label>
            <input
              id="description"
              type="text"
              required
              maxLength={255}
              placeholder="What was this expense for?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              style={inputStyle}
            />
          </div>
        </div>

        {groups.length > 0 && (
          <div style={rowStyle}>
            <div style={{ ...fieldStyle, flex: 1 }}>
              <label htmlFor="group" style={labelStyle}>
                Assign to Group (Optional)
              </label>
              <select
                id="group"
                value={groupId}
                onChange={handleGroupChange}
                style={inputStyle}
              >
                <option value="">-- Personal Expense --</option>
                {groups.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedGroup && (
              <div style={{ ...fieldStyle, flex: 1 }}>
                <label htmlFor="payer" style={labelStyle}>
                  Paid By
                </label>
                <select
                  id="payer"
                  required
                  value={payerMemberId}
                  onChange={(e) => setPayerMemberId(e.target.value)}
                  style={inputStyle}
                >
                  {selectedGroup.members.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>
        )}

        <button type="submit" disabled={isSubmitting} style={submitButtonStyle}>
          {isSubmitting ? "Saving..." : "Save Expense"}
        </button>
      </form>
    </section>
  );
}

const cardStyle: React.CSSProperties = {
  backgroundColor: "var(--color-bg-surface)",
  border: "var(--border-width) solid var(--color-border)",
  padding: "1.5rem",
  marginBottom: "2rem",
};

const headingStyle: React.CSSProperties = {
  fontSize: "1.1rem",
  fontWeight: 700,
  letterSpacing: "-0.01em",
  textTransform: "uppercase",
  marginBottom: "1rem",
  borderBottom: "var(--border-width) solid var(--color-border-subtle)",
  paddingBottom: "0.5rem",
};

const formStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "1rem",
};

const rowStyle: React.CSSProperties = {
  display: "flex",
  flexWrap: "wrap",
  gap: "1rem",
};

const fieldStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "0.35rem",
};

const labelStyle: React.CSSProperties = {
  fontSize: "0.85rem",
  fontWeight: 600,
  textTransform: "uppercase",
  letterSpacing: "0.02em",
  color: "var(--color-text-muted)",
};

const inputStyle: React.CSSProperties = {
  width: "100%",
};

const submitButtonStyle: React.CSSProperties = {
  alignSelf: "flex-start",
  marginTop: "0.5rem",
  padding: "0.6rem 1.5rem",
  backgroundColor: "var(--color-border)",
  color: "var(--color-bg-surface)",
  border: "var(--border-width) solid var(--color-border)",
  textTransform: "uppercase",
  letterSpacing: "0.03em",
};

const errorBannerStyle: React.CSSProperties = {
  backgroundColor: "var(--color-debt-bg)",
  color: "var(--color-debt)",
  border: "var(--border-width) solid var(--color-debt)",
  padding: "0.75rem 1rem",
  marginBottom: "1rem",
  fontSize: "0.9rem",
  fontWeight: 600,
};
