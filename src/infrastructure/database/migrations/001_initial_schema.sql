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
    date TEXT NOT NULL,
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

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_group ON expenses(group_id);
CREATE INDEX IF NOT EXISTS idx_expense_splits_expense ON expense_splits(expense_id);
CREATE INDEX IF NOT EXISTS idx_expense_splits_member ON expense_splits(member_id);
