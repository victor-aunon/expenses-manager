import { describe, it, expect, beforeEach } from "vitest";
import { CreateExpenseUseCase } from "@/core/application/use-cases/create-expense.use-case";
import { ListExpensesUseCase } from "@/core/application/use-cases/list-expenses.use-case";
import { InMemoryExpenseRepository } from "@/infrastructure/repositories/in-memory-expense.repository";
import { InMemoryGroupRepository } from "@/infrastructure/repositories/in-memory-group.repository";

describe("Create and List Expenses Use Cases (US1 - MVP)", () => {
  let expenseRepo: InMemoryExpenseRepository;
  let groupRepo: InMemoryGroupRepository;
  let createExpenseUseCase: CreateExpenseUseCase;
  let listExpensesUseCase: ListExpensesUseCase;

  beforeEach(() => {
    expenseRepo = new InMemoryExpenseRepository();
    groupRepo = new InMemoryGroupRepository();
    createExpenseUseCase = new CreateExpenseUseCase(expenseRepo, groupRepo);
    listExpensesUseCase = new ListExpensesUseCase(expenseRepo, groupRepo);
  });

  it("creates personal expense and lists it in reverse chronological order", async () => {
    // 1. Create older expense
    await createExpenseUseCase.execute({
      amount: 10.0,
      currency: "EUR",
      date: "2026-10-18",
      category: "TRANSPORTATION",
      description: "Bus Ticket",
    });

    // 2. Create newer expense
    await createExpenseUseCase.execute({
      amount: 25.5,
      currency: "EUR",
      date: "2026-10-20",
      category: "FOOD",
      description: "Client Lunch",
    });

    // 3. List expenses
    const list = await listExpensesUseCase.execute();

    expect(list).toHaveLength(2);
    // Newest first
    expect(list[0].description).toBe("Client Lunch");
    expect(list[0].amount.formatted).toBe("25.50 €");
    expect(list[0].amount.minorUnits).toBe(2550);

    expect(list[1].description).toBe("Bus Ticket");
    expect(list[1].amount.formatted).toBe("10.00 €");
  });

  it("filters expenses by category", async () => {
    await createExpenseUseCase.execute({
      amount: 15.0,
      currency: "EUR",
      date: "2026-10-20",
      category: "FOOD",
      description: "Groceries",
    });

    await createExpenseUseCase.execute({
      amount: 50.0,
      currency: "EUR",
      date: "2026-10-20",
      category: "UTILITIES",
      description: "Electricity",
    });

    const foodExpenses = await listExpensesUseCase.execute({ category: "FOOD" });
    expect(foodExpenses).toHaveLength(1);
    expect(foodExpenses[0].description).toBe("Groceries");
  });

  it("validates mandatory fields and positive amounts", async () => {
    await expect(
      createExpenseUseCase.execute({
        amount: -5.0,
        currency: "EUR",
        date: "2026-10-20",
        category: "FOOD",
        description: "Negative test",
      })
    ).rejects.toThrow();

    await expect(
      createExpenseUseCase.execute({
        amount: 20.0,
        currency: "EUR",
        date: "2026-10-20",
        category: "FOOD",
        description: "",
      })
    ).rejects.toThrow();
  });
});
