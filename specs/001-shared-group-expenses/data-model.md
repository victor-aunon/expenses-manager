# Data Model Specification: Shared Group Expenses

**Feature**: `001-shared-group-expenses`
**Date**: 2026-10-20
**Status**: Completed

## 1. Core Domain Models & Value Objects

The domain layer is 100% independent of React, Next.js, and SQLite. All entities and value objects enforce invariants upon instantiation.

```
+---------------------------------------------------------------+
|                        Group Entity                           |
|  - id: GroupId (UUID)                                         |
|  - name: string (1..100 chars, non-empty)                     |
|  - members: Member[]                                          |
|  - createdAt: Date                                            |
+------------------------------+--------------------------------+
                               | 1:N
                               v
+---------------------------------------------------------------+
|                       Expense Entity                          |
|  - id: ExpenseId (UUID)                                       |
|  - amount: Money                                              |
|  - currency: CurrencyCode ('EUR' | 'USD' | 'GBP')             |
|  - date: Date                                                 |
|  - category: ExpenseCategory                                  |
|  - description: string (1..255 chars)                         |
|  - groupId: GroupId | null                                    |
|  - payerMemberId: MemberId | null                             |
|  - splits: ExpenseSplit[]                                     |
|  - createdAt: Date                                            |
+---------------------------------------------------------------+
```

### 1.1 Money Value Object (Constitution Principle IV)
- **Attributes**:
  - `amountInMinorUnits`: `number` (signed safe integer representing cents, centavos, pence).
  - `currency`: `CurrencyCode` (`'EUR' | 'USD' | 'GBP'`).
- **Invariants**:
  - Must be a finite safe integer: `Number.isSafeInteger(amount)`.
  - Floating-point representations are strictly prohibited at domain boundaries.
  - Currencies must match for any binary arithmetic operation (`add`, `subtract`). Mismatched currencies throw `CurrencyMismatchError`.
  - Multiplication/Division: `multiplyBy(factor: number): Money`, `split(parts: number): Money[]` (using Hare-Niemeyer largest-remainder allocation to prevent penny loss).
- **Display Formatter**:
  - Provides deterministic, locale-safe formatting string without mutating the underlying integer value.

### 1.2 ExpenseCategory (Value Enum)
- **Allowed Values**:
  - `FOOD` ("Food & Dining")
  - `TRANSPORTATION` ("Transportation")
  - `HOUSING` ("Housing")
  - `UTILITIES` ("Utilities")
  - `ENTERTAINMENT` ("Entertainment")
  - `HEALTHCARE` ("Healthcare")
  - `OTHER` ("Other")

### 1.3 Expense Entity
- **Attributes**:
  - `id`: `string` (UUID v4)
  - `amount`: `Money`
  - `date`: `Date`
  - `category`: `ExpenseCategory`
  - `description`: `string` (non-empty, trimmed, max 255 chars)
  - `groupId`: `string | null` (optional reference to parent group)
  - `payerMemberId`: `string | null` (required if `groupId` is present; must belong to the group's active members)
  - `splits`: `ExpenseSplit[]` (automatically calculated if `groupId` is present; empty array for personal expenses)
  - `createdAt`: `Date`
- **Invariants**:
  - `amount.amountInMinorUnits > 0` (expenses must be positive non-zero).
  - If `groupId` is set, `payerMemberId` MUST be non-null and belong to `groupId`.
  - If `splits` is non-empty, `sum(splits.map(s => s.amount.amountInMinorUnits)) === amount.amountInMinorUnits` (strict penny conservation).

### 1.4 Group Entity
- **Attributes**:
  - `id`: `string` (UUID v4)
  - `name`: `string` (1..100 characters, unique across active groups)
  - `members`: `Member[]`
  - `createdAt`: `Date`
- **Invariants**:
  - Name must not be blank or contain only whitespace.
  - Member identifiers within `members` list must be unique (no duplicate members).

### 1.5 Member Entity
- **Attributes**:
  - `id`: `string` (UUID v4)
  - `name`: `string` (1..100 characters)
  - `createdAt`: `Date`

### 1.6 ExpenseSplit (Child Value Object)
- **Attributes**:
  - `memberId`: `string` (UUID v4)
  - `amount`: `Money` (individual share in exact minor units)
- **Invariants**:
  - `amount.amountInMinorUnits >= 0`

### 1.7 MemberBalance (Calculated Domain View Model)
- **Attributes**:
  - `memberId`: `string`
  - `memberName`: `string`
  - `totalPaid`: `Money` (sum of all expenses in the group paid upfront by this member)
  - `totalOwed`: `Money` (sum of all split shares allocated to this member in the group)
  - `netBalance`: `Money` (`totalPaid.subtract(totalOwed)`)
- **Semantics**:
  - `netBalance > 0`: Member is owed money (credit).
  - `netBalance < 0`: Member owes money (debt).
  - `netBalance === 0`: Member is settled.

---

## 2. SQLite Database Schema (DDL)

The SQLite relational schema directly mirrors domain invariants, storing money strictly as integers (minor units) with foreign keys and index optimization.

```sql
-- SQLite Pragmas
PRAGMA foreign_keys = ON;

-- 1. Groups Table
CREATE TABLE IF NOT EXISTS groups (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 2. Members Table
CREATE TABLE IF NOT EXISTS members (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

-- 3. Group Members Join Table
CREATE TABLE IF NOT EXISTS group_members (
    group_id TEXT NOT NULL,
    member_id TEXT NOT NULL,
    joined_at TEXT NOT NULL DEFAULT (datetime('now')),
    PRIMARY KEY (group_id, member_id),
    FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE RESTRICT,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE RESTRICT
);

-- 4. Expenses Table
CREATE TABLE IF NOT EXISTS expenses (
    id TEXT PRIMARY KEY,
    amount_minor_units INTEGER NOT NULL CHECK (amount_minor_units > 0),
    currency TEXT NOT NULL CHECK (currency IN ('EUR', 'USD', 'GBP')),
    date TEXT NOT NULL, -- ISO-8601 date YYYY-MM-DD
    category TEXT NOT NULL CHECK (category IN ('FOOD', 'TRANSPORTATION', 'HOUSING', 'UTILITIES', 'ENTERTAINMENT', 'HEALTHCARE', 'OTHER')),
    description TEXT NOT NULL CHECK (length(trim(description)) > 0),
    group_id TEXT NULL,
    payer_member_id TEXT NULL,
    created_at TEXT NOT NULL DEFAULT (datetime('now')),
    FOREIGN KEY (group_id) REFERENCES groups(id) ON DELETE RESTRICT,
    FOREIGN KEY (payer_member_id) REFERENCES members(id) ON DELETE RESTRICT,
    CHECK (
        (group_id IS NULL AND payer_member_id IS NULL) OR
        (group_id IS NOT NULL AND payer_member_id IS NOT NULL)
    )
);

-- 5. Expense Splits Table
CREATE TABLE IF NOT EXISTS expense_splits (
    id TEXT PRIMARY KEY,
    expense_id TEXT NOT NULL,
    member_id TEXT NOT NULL,
    amount_minor_units INTEGER NOT NULL CHECK (amount_minor_units >= 0),
    currency TEXT NOT NULL CHECK (currency IN ('EUR', 'USD', 'GBP')),
    FOREIGN KEY (expense_id) REFERENCES expenses(id) ON DELETE CASCADE,
    FOREIGN KEY (member_id) REFERENCES members(id) ON DELETE RESTRICT
);

-- Indexes for Query Performance
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_group ON expenses(group_id);
CREATE INDEX IF NOT EXISTS idx_expense_splits_expense ON expense_splits(expense_id);
CREATE INDEX IF NOT EXISTS idx_expense_splits_member ON expense_splits(member_id);
```

---

## 3. Data Transformations & Entity Mappings

```
[UI Form Input]
  Amount: "25.50", Currency: "EUR"
         |
         v
[Application Layer DTO]
  amount: 25.50 -> Money.fromDecimal(25.50, 'EUR') -> amountInMinorUnits: 2550
         |
         v
[Domain Entity: Expense]
  id: "uuid-1", amount: Money(2550, 'EUR'), splits: [...]
         |
         v
[SQLite Repository Adapter]
  INSERT INTO expenses (id, amount_minor_units, currency, ...) VALUES ('uuid-1', 2550, 'EUR', ...)
```
