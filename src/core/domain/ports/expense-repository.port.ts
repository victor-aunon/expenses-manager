import { CurrencyCode } from "../value-objects/money.vo";
import { ExpenseCategory } from "../value-objects/expense-category.vo";

export interface ExpenseFilters {
  groupId?: string;
  category?: ExpenseCategory;
  startDate?: string; // YYYY-MM-DD
  endDate?: string;   // YYYY-MM-DD
}

export interface SplitData {
  memberId: string;
  amountMinorUnits: number;
  currency: CurrencyCode;
}

export interface ExpenseData {
  id: string;
  amountMinorUnits: number;
  currency: CurrencyCode;
  date: string; // YYYY-MM-DD
  category: ExpenseCategory;
  description: string;
  groupId: string | null;
  payerMemberId: string | null;
  splits: SplitData[];
  createdAt: string;
}

export interface IExpenseRepository {
  findById(id: string): Promise<ExpenseData | null>;
  findAll(filters?: ExpenseFilters): Promise<ExpenseData[]>;
  save(expense: ExpenseData): Promise<void>;
  delete(id: string): Promise<void>;
  countByGroupId(groupId: string): Promise<number>;
  countByMemberId(memberId: string): Promise<number>;
}
