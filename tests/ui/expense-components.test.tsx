import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { ExpenseForm } from "@/ui/components/expense/expense-form";
import { ExpenseList } from "@/ui/components/expense/expense-list";
import { ExpenseItemView } from "@/ui/types";

describe("Expense Presentational Components (UI)", () => {
  const categories = [
    { value: "FOOD", label: "Food & Dining" },
    { value: "TRANSPORTATION", label: "Transportation" },
  ];

  it("renders expense form with default EUR and submits valid input", async () => {
    const handleSubmit = vi.fn().mockResolvedValue(undefined);

    render(
      <ExpenseForm
        groups={[]}
        categories={categories}
        isSubmitting={false}
        onSubmit={handleSubmit}
      />
    );

    // Verify EUR is default
    const currencySelect = screen.getByLabelText(/Currency/i) as HTMLSelectElement;
    expect(currencySelect.value).toBe("EUR");

    // Fill form
    fireEvent.change(screen.getByLabelText(/Amount/i), { target: { value: "45.00" } });
    fireEvent.change(screen.getByLabelText(/Date/i), { target: { value: "2026-10-20" } });
    fireEvent.change(screen.getByLabelText(/Category/i), { target: { value: "FOOD" } });
    fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: "Dinner" } });

    fireEvent.click(screen.getByRole("button", { name: /Save Expense/i }));

    expect(handleSubmit).toHaveBeenCalledWith({
      amount: "45.00",
      currency: "EUR",
      date: "2026-10-20",
      category: "FOOD",
      description: "Dinner",
      groupId: undefined,
      payerMemberId: undefined,
    });
  });

  it("renders expense list with tabular currency formatting", () => {
    const expenses: ExpenseItemView[] = [
      {
        id: "exp-1",
        amount: { minorUnits: 3500, formatted: "35.00 €", currency: "EUR" },
        date: "2026-10-20",
        category: "FOOD",
        categoryLabel: "Food & Dining",
        description: "Dinner",
      },
    ];

    const handleDelete = vi.fn();
    const handleFilter = vi.fn();

    render(
      <ExpenseList
        expenses={expenses}
        isLoading={false}
        onDeleteExpense={handleDelete}
        onFilterChange={handleFilter}
      />
    );

    expect(screen.getByText("Dinner")).toBeInTheDocument();
    expect(screen.getByText("35.00 €")).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: /Food & Dining/i })).toBeInTheDocument();
  });
});
