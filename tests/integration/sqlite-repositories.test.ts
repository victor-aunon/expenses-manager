import { describe, it, expect, beforeEach } from "vitest";
import { getSqliteDatabase } from "@/infrastructure/database/sqlite-connection";
import { BetterSqliteExpenseRepository } from "@/infrastructure/repositories/better-sqlite-expense.repository";
import { BetterSqliteGroupRepository } from "@/infrastructure/repositories/better-sqlite-group.repository";
import { ExpenseData } from "@/core/domain/ports/expense-repository.port";
import { GroupData } from "@/core/domain/ports/group-repository.port";

describe("SQLite Repository Adapters (Integration)", () => {
  let db: ReturnType<typeof getSqliteDatabase>;
  let expenseRepo: BetterSqliteExpenseRepository;
  let groupRepo: BetterSqliteGroupRepository;

  beforeEach(() => {
    // Isolated in-memory SQLite database for each test
    db = getSqliteDatabase(":memory:");
    expenseRepo = new BetterSqliteExpenseRepository(db);
    groupRepo = new BetterSqliteGroupRepository(db);
  });

  it("saves and retrieves a personal expense", async () => {
    const expense: ExpenseData = {
      id: "exp-1",
      amountMinorUnits: 2500,
      currency: "EUR",
      date: "2026-10-20",
      category: "FOOD",
      description: "Team Lunch",
      groupId: null,
      payerMemberId: null,
      splits: [],
      createdAt: new Date().toISOString(),
    };

    await expenseRepo.save(expense);
    const retrieved = await expenseRepo.findById("exp-1");

    expect(retrieved).not.toBeNull();
    expect(retrieved?.id).toBe("exp-1");
    expect(retrieved?.amountMinorUnits).toBe(2500);
    expect(retrieved?.currency).toBe("EUR");
    expect(retrieved?.category).toBe("FOOD");
  });

  it("saves and deletes an expense", async () => {
    const expense: ExpenseData = {
      id: "exp-del",
      amountMinorUnits: 1500,
      currency: "EUR",
      date: "2026-10-20",
      category: "TRANSPORTATION",
      description: "Metro Ticket",
      groupId: null,
      payerMemberId: null,
      splits: [],
      createdAt: new Date().toISOString(),
    };

    await expenseRepo.save(expense);
    expect(await expenseRepo.findById("exp-del")).not.toBeNull();

    await expenseRepo.delete("exp-del");
    expect(await expenseRepo.findById("exp-del")).toBeNull();
  });

  it("manages groups, members, and shared expense splits", async () => {
    const group: GroupData = {
      id: "grp-1",
      name: "Apartment",
      members: [
        { id: "mem-1", name: "Alice", createdAt: new Date().toISOString() },
        { id: "mem-2", name: "Bob", createdAt: new Date().toISOString() },
      ],
      createdAt: new Date().toISOString(),
    };

    await groupRepo.save(group);
    const retrievedGroup = await groupRepo.findById("grp-1");
    expect(retrievedGroup).not.toBeNull();
    expect(retrievedGroup?.members).toHaveLength(2);

    // Save shared expense in group
    const sharedExpense: ExpenseData = {
      id: "exp-shared-1",
      amountMinorUnits: 10000,
      currency: "EUR",
      date: "2026-10-20",
      category: "UTILITIES",
      description: "Fiber Internet",
      groupId: "grp-1",
      payerMemberId: "mem-1",
      splits: [
        { memberId: "mem-1", amountMinorUnits: 5000, currency: "EUR" },
        { memberId: "mem-2", amountMinorUnits: 5000, currency: "EUR" },
      ],
      createdAt: new Date().toISOString(),
    };

    await expenseRepo.save(sharedExpense);
    const retrievedExpense = await expenseRepo.findById("exp-shared-1");
    expect(retrievedExpense?.splits).toHaveLength(2);
    expect(retrievedExpense?.payerMemberId).toBe("mem-1");

    const groupExpenseCount = await expenseRepo.countByGroupId("grp-1");
    expect(groupExpenseCount).toBe(1);
  });
});
