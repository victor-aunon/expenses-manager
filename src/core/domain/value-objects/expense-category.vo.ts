import { DomainError } from "../errors/domain.error";

export const EXPENSE_CATEGORIES = [
  "FOOD",
  "TRANSPORTATION",
  "HOUSING",
  "UTILITIES",
  "ENTERTAINMENT",
  "HEALTHCARE",
  "OTHER",
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

export const CATEGORY_LABELS: Record<ExpenseCategory, string> = {
  FOOD: "Food & Dining",
  TRANSPORTATION: "Transportation",
  HOUSING: "Housing",
  UTILITIES: "Utilities",
  ENTERTAINMENT: "Entertainment",
  HEALTHCARE: "Healthcare",
  OTHER: "Other",
};

export function isValidExpenseCategory(value: unknown): value is ExpenseCategory {
  return typeof value === "string" && EXPENSE_CATEGORIES.includes(value as ExpenseCategory);
}

export function assertExpenseCategory(value: unknown): asserts value is ExpenseCategory {
  if (!isValidExpenseCategory(value)) {
    throw new DomainError(`Invalid expense category: '${String(value)}'`);
  }
}
