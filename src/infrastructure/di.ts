import { getSqliteDatabase } from "./database/sqlite-connection";
import { BetterSqliteExpenseRepository } from "./repositories/better-sqlite-expense.repository";
import { BetterSqliteGroupRepository } from "./repositories/better-sqlite-group.repository";

export function getRepositories() {
  const db = getSqliteDatabase();
  return {
    expenseRepo: new BetterSqliteExpenseRepository(db),
    groupRepo: new BetterSqliteGroupRepository(db),
  };
}
