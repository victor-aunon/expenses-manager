import { describe, it, expect, beforeEach } from "vitest";
import { DeleteExpenseUseCase } from "@/core/application/use-cases/delete-expense.use-case";
import { InMemoryExpenseRepository } from "@/infrastructure/repositories/in-memory-expense.repository";
import { ExpenseData } from "@/core/domain/ports/expense-repository.port";

describe("Delete Expense Use Case (US2)", () => {
  let expenseRepo: InMemoryExpenseRepository;
  let deleteExpenseUseCase: DeleteExpenseUseCase;

  beforeEach(() => {
    expenseRepo = new InMemoryExpenseRepository();
    deleteExpenseUseCase = new DeleteExpenseUseCase(expenseRepo);
  });

  it("deletes an existing expense successfully", async () => {
    const expense: ExpenseData = {
      id: "exp-del-1",
      amountMinorUnits: 2500,
      currency: "EUR",
      date: "2026-10-20",
      category: "FOOD",
      description: "Quick Lunch",
      groupId: null,
      payerMemberId: null,
      splits: [],
      createdAt: new Date().toISOString(),
    };

    await expenseRepo.save(expense);
    expect(await expenseRepo.findById("exp-del-1")).not.toBeNull();

    await deleteExpenseUseCase.execute("exp-del-1");
    expect(await expenseRepo.findById("exp-del-1")).toBeNull();
  });

  it("throws an error when attempting to delete a non-existent expense", async () => {
    await expect(deleteExpenseUseCase.execute("non-existent-id")).rejects.toThrow(
      "Expense with ID 'non-existent-id' not found"
    );
  });
});
