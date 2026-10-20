import { IExpenseRepository, ExpenseFilters } from "@/core/domain/ports/expense-repository.port";
import { IGroupRepository } from "@/core/domain/ports/group-repository.port";
import { Money } from "@/core/domain/value-objects/money.vo";
import { CATEGORY_LABELS } from "@/core/domain/value-objects/expense-category.vo";
import { ExpenseDTO } from "../dtos/expense.dto";

export class ListExpensesUseCase {
  constructor(
    private readonly expenseRepo: IExpenseRepository,
    private readonly groupRepo: IGroupRepository
  ) {}

  public async execute(filters?: ExpenseFilters): Promise<ExpenseDTO[]> {
    const expenses = await this.expenseRepo.findAll(filters);
    const groups = await this.groupRepo.findAll();
    const groupMap = new Map(groups.map((g) => [g.id, g]));

    return expenses.map((expense) => {
      const money = Money.fromMinorUnits(expense.amountMinorUnits, expense.currency);
      const group = expense.groupId ? groupMap.get(expense.groupId) : undefined;
      const payer = group && expense.payerMemberId
        ? group.members.find((m) => m.id === expense.payerMemberId)
        : undefined;

      return {
        id: expense.id,
        amount: {
          minorUnits: expense.amountMinorUnits,
          formatted: money.format(),
          currency: expense.currency,
        },
        date: expense.date,
        category: expense.category,
        categoryLabel: CATEGORY_LABELS[expense.category] || expense.category,
        description: expense.description,
        groupId: expense.groupId,
        groupName: group?.name,
        payerMemberId: expense.payerMemberId,
        payerName: payer?.name,
        splits: expense.splits.map((s) => {
          const splitMoney = Money.fromMinorUnits(s.amountMinorUnits, s.currency);
          const member = group?.members.find((m) => m.id === s.memberId);
          return {
            memberId: s.memberId,
            memberName: member?.name,
            amount: {
              minorUnits: s.amountMinorUnits,
              formatted: splitMoney.format(),
              currency: s.currency,
            },
          };
        }),
        createdAt: expense.createdAt,
      };
    });
  }
}
