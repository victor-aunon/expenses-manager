import { describe, it, expect, beforeEach } from "vitest";
import { getSqliteDatabase } from "@/infrastructure/database/sqlite-connection";
import { BetterSqliteExpenseRepository } from "@/infrastructure/repositories/better-sqlite-expense.repository";
import { BetterSqliteGroupRepository } from "@/infrastructure/repositories/better-sqlite-group.repository";
import { CreateExpenseUseCase } from "@/core/application/use-cases/create-expense.use-case";
import { ListExpensesUseCase } from "@/core/application/use-cases/list-expenses.use-case";
import { DeleteExpenseUseCase } from "@/core/application/use-cases/delete-expense.use-case";
import { CreateGroupUseCase } from "@/core/application/use-cases/create-group.use-case";
import { AddMemberUseCase } from "@/core/application/use-cases/add-member.use-case";
import { CalculateGroupBalancesUseCase } from "@/core/application/use-cases/calculate-group-balances.use-case";

describe("Quickstart E2E Scenarios (Verification)", () => {
  let db: ReturnType<typeof getSqliteDatabase>;
  let expenseRepo: BetterSqliteExpenseRepository;
  let groupRepo: BetterSqliteGroupRepository;

  let createExpense: CreateExpenseUseCase;
  let listExpenses: ListExpensesUseCase;
  let deleteExpense: DeleteExpenseUseCase;
  let createGroup: CreateGroupUseCase;
  let addMember: AddMemberUseCase;
  let calculateBalances: CalculateGroupBalancesUseCase;

  beforeEach(() => {
    db = getSqliteDatabase(":memory:");
    expenseRepo = new BetterSqliteExpenseRepository(db);
    groupRepo = new BetterSqliteGroupRepository(db);

    createExpense = new CreateExpenseUseCase(expenseRepo, groupRepo);
    listExpenses = new ListExpensesUseCase(expenseRepo, groupRepo);
    deleteExpense = new DeleteExpenseUseCase(expenseRepo);
    createGroup = new CreateGroupUseCase(groupRepo);
    addMember = new AddMemberUseCase(groupRepo);
    calculateBalances = new CalculateGroupBalancesUseCase(expenseRepo, groupRepo);
  });

  it("executes Scenario 1: Record and View Personal Expenses", async () => {
    const created = await createExpense.execute({
      amount: 12.5,
      currency: "EUR",
      date: "2026-10-20",
      category: "FOOD",
      description: "Morning Coffee & Croissant",
    });

    expect(created.amount.formatted).toBe("12.50 €");
    expect(created.categoryLabel).toBe("Food & Dining");

    const list = await listExpenses.execute();
    expect(list).toHaveLength(1);
    expect(list[0].description).toBe("Morning Coffee & Croissant");
  });

  it("executes Scenario 2: Delete Existing Expense", async () => {
    const created = await createExpense.execute({
      amount: 20.0,
      currency: "EUR",
      date: "2026-10-20",
      category: "TRANSPORTATION",
      description: "Airport Taxi",
    });

    expect(await listExpenses.execute()).toHaveLength(1);

    await deleteExpense.execute(created.id);
    expect(await listExpenses.execute()).toHaveLength(0);
  });

  it("executes Scenario 3: Create Groups & Add Members with duplicate prevention", async () => {
    const group = await createGroup.execute({ name: "Apartment Roommates" });
    const alice = await addMember.execute({ groupId: group.id, name: "Alice" });
    const bob = await addMember.execute({ groupId: group.id, name: "Bob" });
    const charlie = await addMember.execute({ groupId: group.id, name: "Charlie" });

    expect(alice.name).toBe("Alice");
    expect(bob.name).toBe("Bob");
    expect(charlie.name).toBe("Charlie");

    await expect(
      addMember.execute({ groupId: group.id, name: "Alice" })
    ).rejects.toThrow("already exists in group 'Apartment Roommates'");
  });

  it("executes Scenario 4: Shared Expense with Payer and Exact Penny Split", async () => {
    const group = await createGroup.execute({ name: "Apartment Roommates" });
    const alice = await addMember.execute({ groupId: group.id, name: "Alice" });
    const bob = await addMember.execute({ groupId: group.id, name: "Bob" });
    const charlie = await addMember.execute({ groupId: group.id, name: "Charlie" });

    // 100.00 EUR split among 3 members, paid by Alice
    const sharedExp = await createExpense.execute({
      amount: 100.0,
      currency: "EUR",
      date: "2026-10-20",
      category: "UTILITIES",
      description: "High-Speed Fiber Internet",
      groupId: group.id,
      payerMemberId: alice.id,
    });

    // Verification of Hare-Niemeyer exact split
    expect(sharedExp.splits).toHaveLength(3);
    expect(sharedExp.splits[0].amount.formatted).toBe("33.34 €");
    expect(sharedExp.splits[1].amount.formatted).toBe("33.33 €");
    expect(sharedExp.splits[2].amount.formatted).toBe("33.33 €");

    const sumSplits = sharedExp.splits.reduce((acc, s) => acc + s.amount.minorUnits, 0);
    expect(sumSplits).toBe(10000);

    // Verification of Net Balances
    const balanceReport = await calculateBalances.execute(group.id);
    const aliceBal = balanceReport.balances.find((b) => b.memberId === alice.id)!;
    const bobBal = balanceReport.balances.find((b) => b.memberId === bob.id)!;
    const charlieBal = balanceReport.balances.find((b) => b.memberId === charlie.id)!;

    expect(aliceBal.netBalance.formatted).toBe("+66.66 €");
    expect(aliceBal.status).toBe("CREDIT");

    expect(bobBal.netBalance.formatted).toBe("-33.33 €");
    expect(bobBal.status).toBe("DEBT");

    expect(charlieBal.netBalance.formatted).toBe("-33.33 €");
    expect(charlieBal.status).toBe("DEBT");

    const totalNetDrift = balanceReport.balances.reduce((acc, b) => acc + b.netBalance.minorUnits, 0);
    expect(totalNetDrift).toBe(0);
  });
});
