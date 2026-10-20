import {
  ExpenseData,
  ExpenseFilters,
  IExpenseRepository,
} from "@/core/domain/ports/expense-repository.port";

export class InMemoryExpenseRepository implements IExpenseRepository {
  private readonly expenses = new Map<string, ExpenseData>();

  public async findById(id: string): Promise<ExpenseData | null> {
    const expense = this.expenses.get(id);
    return expense ? { ...expense, splits: [...expense.splits] } : null;
  }

  public async findAll(filters?: ExpenseFilters): Promise<ExpenseData[]> {
    let result = Array.from(this.expenses.values());

    if (filters?.groupId) {
      result = result.filter((e) => e.groupId === filters.groupId);
    }
    if (filters?.category) {
      result = result.filter((e) => e.category === filters.category);
    }
    if (filters?.startDate) {
      result = result.filter((e) => e.date >= filters.startDate!);
    }
    if (filters?.endDate) {
      result = result.filter((e) => e.date <= filters.endDate!);
    }

    // Sort reverse-chronological by date, then createdAt
    return result.sort((a, b) => {
      const dateCmp = b.date.localeCompare(a.date);
      if (dateCmp !== 0) return dateCmp;
      return b.createdAt.localeCompare(a.createdAt);
    });
  }

  public async save(expense: ExpenseData): Promise<void> {
    this.expenses.set(expense.id, {
      ...expense,
      splits: expense.splits.map((s) => ({ ...s })),
    });
  }

  public async delete(id: string): Promise<void> {
    this.expenses.delete(id);
  }

  public async countByGroupId(groupId: string): Promise<number> {
    let count = 0;
    for (const exp of this.expenses.values()) {
      if (exp.groupId === groupId) count++;
    }
    return count;
  }

  public async countByMemberId(memberId: string): Promise<number> {
    let count = 0;
    for (const exp of this.expenses.values()) {
      if (exp.payerMemberId === memberId) {
        count++;
        continue;
      }
      if (exp.splits.some((s) => s.memberId === memberId)) {
        count++;
      }
    }
    return count;
  }

  public clear(): void {
    this.expenses.clear();
  }
}
