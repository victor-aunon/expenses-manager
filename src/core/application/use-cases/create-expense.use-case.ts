import { IExpenseRepository } from "@/core/domain/ports/expense-repository.port";
import { IGroupRepository } from "@/core/domain/ports/group-repository.port";
import { Money } from "@/core/domain/value-objects/money.vo";
import { CATEGORY_LABELS } from "@/core/domain/value-objects/expense-category.vo";
import { Expense } from "@/core/domain/entities/expense.entity";
import { DomainError } from "@/core/domain/errors/domain.error";
import { CreateExpenseCommand, ExpenseDTO } from "../dtos/expense.dto";

export class CreateExpenseUseCase {
  constructor(
    private readonly expenseRepo: IExpenseRepository,
    private readonly groupRepo: IGroupRepository
  ) {}

  public async execute(command: CreateExpenseCommand): Promise<ExpenseDTO> {
    const money = Money.fromDecimal(command.amount, command.currency);
    const id = crypto.randomUUID();

    let splits: Array<{ memberId: string; amount: Money }> = [];
    let groupName: string | undefined;
    let payerName: string | undefined;

    if (command.groupId) {
      const group = await this.groupRepo.findById(command.groupId);
      if (!group) {
        throw new DomainError(`Group with ID '${command.groupId}' does not exist`);
      }
      groupName = group.name;

      if (!command.payerMemberId) {
        throw new DomainError("A payer must be designated when assigning an expense to a group");
      }

      const payer = group.members.find((m) => m.id === command.payerMemberId);
      if (!payer) {
        throw new DomainError(
          `Designated payer '${command.payerMemberId}' is not an active member of group '${group.name}'`
        );
      }
      payerName = payer.name;

      if (group.members.length === 0) {
        throw new DomainError("Cannot assign an expense to a group with zero members");
      }

      // Hare-Niemeyer exact penny split
      const splitAmounts = money.split(group.members.length);
      splits = group.members.map((member, idx) => ({
        memberId: member.id,
        amount: splitAmounts[idx],
      }));
    }

    const expense = Expense.create({
      id,
      amount: money,
      date: command.date,
      category: command.category,
      description: command.description,
      groupId: command.groupId,
      payerMemberId: command.payerMemberId,
      splits,
    });

    await this.expenseRepo.save({
      id: expense.id,
      amountMinorUnits: expense.amount.amountInMinorUnits,
      currency: expense.amount.currency,
      date: expense.date,
      category: expense.category,
      description: expense.description,
      groupId: expense.groupId,
      payerMemberId: expense.payerMemberId,
      splits: expense.splits.map((s) => ({
        memberId: s.memberId,
        amountMinorUnits: s.amount.amountInMinorUnits,
        currency: s.amount.currency,
      })),
      createdAt: expense.createdAt.toISOString(),
    });

    return {
      id: expense.id,
      amount: {
        minorUnits: expense.amount.amountInMinorUnits,
        formatted: expense.amount.format(),
        currency: expense.amount.currency,
      },
      date: expense.date,
      category: expense.category,
      categoryLabel: CATEGORY_LABELS[expense.category],
      description: expense.description,
      groupId: expense.groupId,
      groupName,
      payerMemberId: expense.payerMemberId,
      payerName,
      splits: expense.splits.map((s) => ({
        memberId: s.memberId,
        amount: {
          minorUnits: s.amount.amountInMinorUnits,
          formatted: s.amount.format(),
          currency: s.amount.currency,
        },
      })),
      createdAt: expense.createdAt.toISOString(),
    };
  }
}
