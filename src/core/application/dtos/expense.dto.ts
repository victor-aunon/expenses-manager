import { CurrencyCode } from "@/core/domain/value-objects/money.vo";
import { ExpenseCategory } from "@/core/domain/value-objects/expense-category.vo";

export interface CreateExpenseCommand {
  amount: number; // decimal e.g. 45.00
  currency: CurrencyCode;
  date: string; // YYYY-MM-DD
  category: ExpenseCategory;
  description: string;
  groupId?: string | null;
  payerMemberId?: string | null;
}

export interface SplitDTO {
  memberId: string;
  memberName?: string;
  amount: {
    minorUnits: number;
    formatted: string;
    currency: CurrencyCode;
  };
}

export interface ExpenseDTO {
  id: string;
  amount: {
    minorUnits: number;
    formatted: string;
    currency: CurrencyCode;
  };
  date: string;
  category: ExpenseCategory;
  categoryLabel: string;
  description: string;
  groupId: string | null;
  groupName?: string;
  payerMemberId: string | null;
  payerName?: string;
  splits: SplitDTO[];
  createdAt: string;
}
