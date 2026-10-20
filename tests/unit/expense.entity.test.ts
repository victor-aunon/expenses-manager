import { describe, it, expect } from "vitest";
import { Expense } from "@/core/domain/entities/expense.entity";
import { Money } from "@/core/domain/value-objects/money.vo";
import { DomainError } from "@/core/domain/errors/domain.error";

describe("Expense Domain Entity (US1 - Personal Expenses)", () => {
  const validMoney = Money.fromMinorUnits(1500, "EUR");

  it("creates a valid personal expense", () => {
    const expense = Expense.create({
      id: "exp-uuid-1",
      amount: validMoney,
      date: "2026-10-20",
      category: "FOOD",
      description: "Lunch with client",
    });

    expect(expense.id).toBe("exp-uuid-1");
    expect(expense.amount.equals(validMoney)).toBe(true);
    expect(expense.date).toBe("2026-10-20");
    expect(expense.category).toBe("FOOD");
    expect(expense.description).toBe("Lunch with client");
    expect(expense.groupId).toBeNull();
    expect(expense.payerMemberId).toBeNull();
    expect(expense.splits).toEqual([]);
    expect(expense.isShared()).toBe(false);
  });

  it("rejects non-positive amounts", () => {
    const zeroMoney = Money.fromMinorUnits(0, "EUR");
    const negativeMoney = Money.fromMinorUnits(-500, "EUR");

    expect(() =>
      Expense.create({
        id: "exp-1",
        amount: zeroMoney,
        date: "2026-10-20",
        category: "FOOD",
        description: "Zero amount",
      })
    ).toThrowError(DomainError);

    expect(() =>
      Expense.create({
        id: "exp-2",
        amount: negativeMoney,
        date: "2026-10-20",
        category: "FOOD",
        description: "Negative amount",
      })
    ).toThrowError(DomainError);
  });

  it("rejects empty or whitespace-only description", () => {
    expect(() =>
      Expense.create({
        id: "exp-1",
        amount: validMoney,
        date: "2026-10-20",
        category: "FOOD",
        description: "",
      })
    ).toThrowError(DomainError);

    expect(() =>
      Expense.create({
        id: "exp-2",
        amount: validMoney,
        date: "2026-10-20",
        category: "FOOD",
        description: "   ",
      })
    ).toThrowError(DomainError);
  });

  it("rejects descriptions exceeding 255 characters", () => {
    const longDesc = "a".repeat(256);
    expect(() =>
      Expense.create({
        id: "exp-1",
        amount: validMoney,
        date: "2026-10-20",
        category: "FOOD",
        description: longDesc,
      })
    ).toThrowError("Description cannot exceed 255 characters");
  });

  it("rejects invalid date formats", () => {
    expect(() =>
      Expense.create({
        id: "exp-1",
        amount: validMoney,
        date: "invalid-date",
        category: "FOOD",
        description: "Valid desc",
      })
    ).toThrowError("Invalid date format. Expected YYYY-MM-DD");
  });
});
