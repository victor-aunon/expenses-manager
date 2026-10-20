# Quickstart & Verification Guide: Shared Group Expenses

**Feature**: `001-shared-group-expenses`
**Date**: 2026-10-20
**Status**: Ready for Verification

---

## 1. Prerequisites & Environment Setup

- **Node.js**: >= 20.x (Current environment: `v24.14.0`)
- **Package Manager**: `npm` (or `pnpm`)
- **Database**: SQLite (local embedded file `data/expenses.db` or in-memory)

```bash
# 1. Install dependencies
npm install

# 2. Run database migrations
npm run db:migrate

# 3. Run full automated test suite in TDD mode
npm test
```

---

## 2. Automated Test Execution (Dogmatic TDD Gates)

The test suite enforces the Constitution's Red-Green-Refactor gates before any manual testing:

```bash
# Run unit & domain invariants tests (Money VO, Hare-Niemeyer split conservation)
npm run test:unit

# Run use case integration tests with in-memory adapters
npm run test:integration

# Run SQLite repository adapter tests with temporary SQLite instance
npm run test:db

# Run component accessibility & interaction tests
npm run test:ui
```

---

## 3. End-to-End Manual Verification Scenarios

Run the local development server:
```bash
npm run dev
# Application accessible at http://localhost:3000
```

### Scenario 1: Record and View Personal Expenses (P1)
1. Open `http://localhost:3000`.
2. Locate the utilitarian expense form. Verify the currency defaults to `EUR`.
3. Enter amount `12.50`, select category `Food & Dining`, enter description `Morning Coffee & Croissant`, and submit.
4. **Verification**:
   - The expense immediately appears at the top of the expense list.
   - Form resets cleanly without full page reload.
   - Displayed amount is formatted as `12.50 €` using tabular figures.

### Scenario 2: Delete an Existing Expense with Confirmation (P2)
1. Locate the expense created in Scenario 1.
2. Click the `Delete` button.
3. Verify a confirmation prompt appears asking: *"Are you sure you want to delete 'Morning Coffee & Croissant'?"*
4. Click `Cancel`. Verify the record remains in the list.
5. Click `Delete` again, then click `Confirm Delete`.
6. **Verification**:
   - The expense is permanently removed from the list.
   - Total summary metrics update instantaneously.

### Scenario 3: Create Groups & Add Members (P3)
1. Navigate to the **Groups** panel.
2. Type group name `"Apartment Roommates"` and click `Create Group`.
3. In the group member roster, add:
   - `Alice`
   - `Bob`
   - `Charlie`
4. Attempt to add `Alice` a second time.
5. **Verification**:
   - The system alerts that duplicate member names in the same group are rejected.
   - The group roster displays all 3 unique members.

### Scenario 4: Shared Expense with Payer & Exact Penny Split (P4)
1. In the expense form:
   - Enter amount `100.00` `EUR`.
   - Category: `Utilities`.
   - Description: `High-Speed Fiber Internet`.
   - Assign to group: `"Apartment Roommates"`.
   - Select Payer: `Alice`.
2. Submit the expense.
3. Open the group details view.
4. **Verification**:
   - **Split Conservation**: Total $100.00 split among 3 members equals:
     - Member 1: `33.34 €`
     - Member 2: `33.33 €`
     - Member 3: `33.33 €`
     - Sum: `33.34 + 33.33 + 33.33 = 100.00 €` (0 cent discrepancy).
   - **Net Balance Summary**:
     - Alice (Payer): Paid `100.00 €`, owes `33.34 €` -> Net: `+66.66 €` (Credit / Owed money).
     - Bob: Paid `0.00 €`, owes `33.33 €` -> Net: `-33.33 €` (Debt / Owes money).
     - Charlie: Paid `0.00 €`, owes `33.33 €` -> Net: `-33.33 €` (Debt / Owes money).
     - Net balance sum across group: `+66.66 - 33.33 - 33.33 = 0.00 €`.

### Scenario 5: Utilitarian Design System & Ultra-Wide Layout Verification
1. Inspect the layout on a viewport `> 1800px` (or zoom out / stretch browser).
2. **Verification**:
   - Content is centered on screen with generous outer margins (`max-w` constraint with balanced whitespace).
   - Background colors strictly use `var(--color-bg-canvas)` (`taupe-200`).
   - Card and table borders strictly use `var(--color-border)` (`taupe-800`).
   - Typography strictly uses `var(--color-text-primary)` (`taupe-950`).
   - Inspect CSS styles: verify `box-shadow` is `none` and `background-image` is `none` across all components.
