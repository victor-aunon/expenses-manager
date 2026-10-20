import { IExpenseRepository } from "@/core/domain/ports/expense-repository.port";
import { IGroupRepository } from "@/core/domain/ports/group-repository.port";
import { Money, CurrencyCode } from "@/core/domain/value-objects/money.vo";
import { DomainError } from "@/core/domain/errors/domain.error";

export interface MemberBalanceDTO {
  memberId: string;
  memberName: string;
  totalPaid: {
    minorUnits: number;
    formatted: string;
    currency: CurrencyCode;
  };
  totalOwed: {
    minorUnits: number;
    formatted: string;
    currency: CurrencyCode;
  };
  netBalance: {
    minorUnits: number;
    formatted: string;
    currency: CurrencyCode;
  };
  status: "CREDIT" | "DEBT" | "SETTLED";
}

export interface GroupBalancesDTO {
  groupId: string;
  groupName: string;
  balances: MemberBalanceDTO[];
}

export class CalculateGroupBalancesUseCase {
  constructor(
    private readonly expenseRepo: IExpenseRepository,
    private readonly groupRepo: IGroupRepository
  ) {}

  public async execute(groupId: string): Promise<GroupBalancesDTO> {
    const group = await this.groupRepo.findById(groupId);
    if (!group) {
      throw new DomainError(`Group with ID '${groupId}' not found`);
    }

    const expenses = await this.expenseRepo.findAll({ groupId });

    // Identify primary currency (defaulting to EUR)
    const currency: CurrencyCode = expenses[0]?.currency || "EUR";

    // Initialize balance maps for all members
    const paidMap = new Map<string, number>();
    const owedMap = new Map<string, number>();

    for (const member of group.members) {
      paidMap.set(member.id, 0);
      owedMap.set(member.id, 0);
    }

    // Accumulate paid and owed amounts
    for (const expense of expenses) {
      if (expense.payerMemberId && paidMap.has(expense.payerMemberId)) {
        paidMap.set(
          expense.payerMemberId,
          (paidMap.get(expense.payerMemberId) || 0) + expense.amountMinorUnits
        );
      }

      for (const split of expense.splits) {
        if (owedMap.has(split.memberId)) {
          owedMap.set(
            split.memberId,
            (owedMap.get(split.memberId) || 0) + split.amountMinorUnits
          );
        }
      }
    }

    // Compute net balance per member
    const balances: MemberBalanceDTO[] = group.members.map((member) => {
      const paidMinor = paidMap.get(member.id) || 0;
      const owedMinor = owedMap.get(member.id) || 0;
      const netMinor = paidMinor - owedMinor;

      const paidMoney = Money.fromMinorUnits(paidMinor, currency);
      const owedMoney = Money.fromMinorUnits(owedMinor, currency);
      const absNetMoney = Money.fromMinorUnits(Math.abs(netMinor), currency);

      let formattedNet: string;
      let status: "CREDIT" | "DEBT" | "SETTLED";

      if (netMinor > 0) {
        status = "CREDIT";
        formattedNet = `+${absNetMoney.format()}`;
      } else if (netMinor < 0) {
        status = "DEBT";
        formattedNet = `-${absNetMoney.format()}`;
      } else {
        status = "SETTLED";
        formattedNet = absNetMoney.format();
      }

      return {
        memberId: member.id,
        memberName: member.name,
        totalPaid: {
          minorUnits: paidMinor,
          formatted: paidMoney.format(),
          currency,
        },
        totalOwed: {
          minorUnits: owedMinor,
          formatted: owedMoney.format(),
          currency,
        },
        netBalance: {
          minorUnits: netMinor,
          formatted: formattedNet,
          currency,
        },
        status,
      };
    });

    return {
      groupId: group.id,
      groupName: group.name,
      balances,
    };
  }
}
