import { describe, it, expect, beforeEach } from "vitest";
import { CalculateGroupBalancesUseCase } from "@/core/application/use-cases/calculate-group-balances.use-case";
import { CreateExpenseUseCase } from "@/core/application/use-cases/create-expense.use-case";
import { CreateGroupUseCase } from "@/core/application/use-cases/create-group.use-case";
import { AddMemberUseCase } from "@/core/application/use-cases/add-member.use-case";
import { InMemoryExpenseRepository } from "@/infrastructure/repositories/in-memory-expense.repository";
import { InMemoryGroupRepository } from "@/infrastructure/repositories/in-memory-group.repository";

describe("Calculate Group Balances Use Case (US4)", () => {
  let expenseRepo: InMemoryExpenseRepository;
  let groupRepo: InMemoryGroupRepository;
  let calculateBalancesUseCase: CalculateGroupBalancesUseCase;
  let createExpenseUseCase: CreateExpenseUseCase;
  let createGroupUseCase: CreateGroupUseCase;
  let addMemberUseCase: AddMemberUseCase;

  beforeEach(() => {
    expenseRepo = new InMemoryExpenseRepository();
    groupRepo = new InMemoryGroupRepository();
    calculateBalancesUseCase = new CalculateGroupBalancesUseCase(expenseRepo, groupRepo);
    createExpenseUseCase = new CreateExpenseUseCase(expenseRepo, groupRepo);
    createGroupUseCase = new CreateGroupUseCase(groupRepo);
    addMemberUseCase = new AddMemberUseCase(groupRepo);
  });

  it("calculates exact net balances across multiple shared expenses and payers", async () => {
    // 1. Create group with 3 members
    const group = await createGroupUseCase.execute({ name: "Ski Trip" });
    const alice = await addMemberUseCase.execute({ groupId: group.id, name: "Alice" });
    const bob = await addMemberUseCase.execute({ groupId: group.id, name: "Bob" });
    const charlie = await addMemberUseCase.execute({ groupId: group.id, name: "Charlie" });

    // 2. Alice pays 90.00 EUR for Cabin Rental (30.00 EUR each)
    await createExpenseUseCase.execute({
      amount: 90.0,
      currency: "EUR",
      date: "2026-10-20",
      category: "HOUSING",
      description: "Cabin Rental",
      groupId: group.id,
      payerMemberId: alice.id,
    });

    // 3. Bob pays 60.00 EUR for Ski Passes (20.00 EUR each)
    await createExpenseUseCase.execute({
      amount: 60.0,
      currency: "EUR",
      date: "2026-10-20",
      category: "ENTERTAINMENT",
      description: "Ski Passes",
      groupId: group.id,
      payerMemberId: bob.id,
    });

    // 4. Calculate group balances
    const result = await calculateBalancesUseCase.execute(group.id);

    expect(result.groupId).toBe(group.id);
    expect(result.balances).toHaveLength(3);

    const aliceBal = result.balances.find((b) => b.memberId === alice.id)!;
    const bobBal = result.balances.find((b) => b.memberId === bob.id)!;
    const charlieBal = result.balances.find((b) => b.memberId === charlie.id)!;

    // Alice: Paid 90, Owes (30+20)=50 -> Net = +40.00 EUR
    expect(aliceBal.totalPaid.minorUnits).toBe(9000);
    expect(aliceBal.totalOwed.minorUnits).toBe(5000);
    expect(aliceBal.netBalance.minorUnits).toBe(4000);
    expect(aliceBal.status).toBe("CREDIT");
    expect(aliceBal.netBalance.formatted).toBe("+40.00 €");

    // Bob: Paid 60, Owes 50 -> Net = +10.00 EUR
    expect(bobBal.totalPaid.minorUnits).toBe(6000);
    expect(bobBal.totalOwed.minorUnits).toBe(5000);
    expect(bobBal.netBalance.minorUnits).toBe(1000);
    expect(bobBal.status).toBe("CREDIT");
    expect(bobBal.netBalance.formatted).toBe("+10.00 €");

    // Charlie: Paid 0, Owes 50 -> Net = -50.00 EUR
    expect(charlieBal.totalPaid.minorUnits).toBe(0);
    expect(charlieBal.totalOwed.minorUnits).toBe(5000);
    expect(charlieBal.netBalance.minorUnits).toBe(-5000);
    expect(charlieBal.status).toBe("DEBT");
    expect(charlieBal.netBalance.formatted).toBe("-50.00 €");

    // Conservation check: sum of all net balances in minor units must be zero
    const sumNet = result.balances.reduce((acc, b) => acc + b.netBalance.minorUnits, 0);
    expect(sumNet).toBe(0);
  });
});
