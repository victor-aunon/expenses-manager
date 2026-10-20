import Database from "better-sqlite3";
import {
  ExpenseData,
  ExpenseFilters,
  IExpenseRepository,
  SplitData,
} from "@/core/domain/ports/expense-repository.port";
import { ExpenseCategory } from "@/core/domain/value-objects/expense-category.vo";
import { CurrencyCode } from "@/core/domain/value-objects/money.vo";

export class BetterSqliteExpenseRepository implements IExpenseRepository {
  constructor(private readonly db: Database.Database) {}

  public async findById(id: string): Promise<ExpenseData | null> {
    const row = this.db
      .prepare(
        `SELECT id, amount_minor_units, currency, date, category, description, group_id, payer_member_id, created_at
         FROM expenses WHERE id = ?`
      )
      .get(id) as any;

    if (!row) {
      return null;
    }

    const splits = this.getSplitsForExpense(id);

    return {
      id: row.id,
      amountMinorUnits: row.amount_minor_units,
      currency: row.currency as CurrencyCode,
      date: row.date,
      category: row.category as ExpenseCategory,
      description: row.description,
      groupId: row.group_id,
      payerMemberId: row.payer_member_id,
      splits,
      createdAt: row.created_at,
    };
  }

  public async findAll(filters?: ExpenseFilters): Promise<ExpenseData[]> {
    let sql = `
      SELECT id, amount_minor_units, currency, date, category, description, group_id, payer_member_id, created_at
      FROM expenses
      WHERE 1=1
    `;
    const params: any[] = [];

    if (filters?.groupId) {
      sql += " AND group_id = ?";
      params.push(filters.groupId);
    }
    if (filters?.category) {
      sql += " AND category = ?";
      params.push(filters.category);
    }
    if (filters?.startDate) {
      sql += " AND date >= ?";
      params.push(filters.startDate);
    }
    if (filters?.endDate) {
      sql += " AND date <= ?";
      params.push(filters.endDate);
    }

    sql += " ORDER BY date DESC, created_at DESC";

    const rows = this.db.prepare(sql).all(...params) as any[];

    return rows.map((row) => ({
      id: row.id,
      amountMinorUnits: row.amount_minor_units,
      currency: row.currency as CurrencyCode,
      date: row.date,
      category: row.category as ExpenseCategory,
      description: row.description,
      groupId: row.group_id,
      payerMemberId: row.payer_member_id,
      splits: this.getSplitsForExpense(row.id),
      createdAt: row.created_at,
    }));
  }

  public async save(expense: ExpenseData): Promise<void> {
    const insertExpense = this.db.transaction(() => {
      this.db
        .prepare(
          `INSERT OR REPLACE INTO expenses
           (id, amount_minor_units, currency, date, category, description, group_id, payer_member_id, created_at)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
        )
        .run(
          expense.id,
          expense.amountMinorUnits,
          expense.currency,
          expense.date,
          expense.category,
          expense.description,
          expense.groupId,
          expense.payerMemberId,
          expense.createdAt
        );

      // Replace splits
      this.db.prepare("DELETE FROM expense_splits WHERE expense_id = ?").run(expense.id);

      const insertSplit = this.db.prepare(
        `INSERT INTO expense_splits (id, expense_id, member_id, amount_minor_units, currency)
         VALUES (?, ?, ?, ?, ?)`
      );

      for (let i = 0; i < expense.splits.length; i++) {
        const split = expense.splits[i];
        const splitId = `${expense.id}_split_${i}`;
        insertSplit.run(splitId, expense.id, split.memberId, split.amountMinorUnits, split.currency);
      }
    });

    insertExpense();
  }

  public async delete(id: string): Promise<void> {
    const deleteTx = this.db.transaction(() => {
      this.db.prepare("DELETE FROM expense_splits WHERE expense_id = ?").run(id);
      this.db.prepare("DELETE FROM expenses WHERE id = ?").run(id);
    });
    deleteTx();
  }

  public async countByGroupId(groupId: string): Promise<number> {
    const result = this.db
      .prepare("SELECT COUNT(*) as count FROM expenses WHERE group_id = ?")
      .get(groupId) as any;
    return result ? Number(result.count) : 0;
  }

  public async countByMemberId(memberId: string): Promise<number> {
    const payerCount = (
      this.db
        .prepare("SELECT COUNT(*) as count FROM expenses WHERE payer_member_id = ?")
        .get(memberId) as any
    )?.count || 0;

    const splitCount = (
      this.db
        .prepare("SELECT COUNT(DISTINCT expense_id) as count FROM expense_splits WHERE member_id = ?")
        .get(memberId) as any
    )?.count || 0;

    return Number(payerCount) + Number(splitCount);
  }

  private getSplitsForExpense(expenseId: string): SplitData[] {
    const rows = this.db
      .prepare(
        `SELECT member_id, amount_minor_units, currency
         FROM expense_splits WHERE expense_id = ?`
      )
      .all(expenseId) as any[];

    return rows.map((r) => ({
      memberId: r.member_id,
      amountMinorUnits: r.amount_minor_units,
      currency: r.currency as CurrencyCode,
    }));
  }
}
