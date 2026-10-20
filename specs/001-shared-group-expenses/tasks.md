---
description: "Task list for 001-shared-group-expenses implementation"
---

# Tasks: Shared Group Expenses

**Input**: Design documents from `/specs/001-shared-group-expenses/`
**Prerequisites**: `plan.md`, `spec.md`, `research.md`, `data-model.md`, `contracts/`, `quickstart.md`, `.specify/memory/constitution.md`
**Tests**: Dogmatic Test-Driven Development (TDD) is MANDATORY per Constitution Principle II. Test tasks must be written and failing (RED) before implementation code is written (GREEN).
**Organization**: Tasks are grouped by user story (P1 through P4) following Setup and Foundational prerequisites.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization, build tools, test framework, and utilitarian styling infrastructure.

- [ ] T001 Initialize Next.js project with TypeScript, React 19, and Node 24 support in `package.json`, `tsconfig.json`, and `next.config.ts`
- [ ] T002 [P] Configure Vitest, `@testing-library/react`, and `jsdom` for TDD in `vitest.config.ts`
- [ ] T003 [P] Implement Utilitarian CSS design tokens (`--color-bg-canvas: #e8e5e0` [taupe-200], `--color-bg-surface: #f2f0ec`, `--color-border: #443e39` [taupe-800], `--color-text-primary: #191715` [taupe-950], zero shadows, zero gradients) in `src/ui/styles/tokens.css` and `src/ui/styles/globals.css`
- [ ] T004 [P] Implement utilitarian shell layout with centered canvas and expansive outer margins for viewports >1800px in `src/ui/components/layout/utilitarian-shell.tsx` and `src/app/layout.tsx`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core domain value objects, repository interfaces, and SQLite database infrastructure that MUST be complete before any user story can be implemented.

**⚠️ CRITICAL**: No user story implementation can begin until this foundational phase is complete and verified.

- [ ] T005 [P] Unit tests for `Money` Value Object (immutable integer cents, currency match enforcement, ISO 4217 EUR/USD/GBP, safe integer check) in `tests/unit/money.vo.test.ts`
- [ ] T006 [P] Implement immutable `Money` Value Object with `amountInMinorUnits` (safe integer) and `currency` ('EUR' | 'USD' | 'GBP') in `src/core/domain/value-objects/money.vo.ts`
- [ ] T007 [P] Implement `ExpenseCategory` value enum with verbatim values: `FOOD`, `TRANSPORTATION`, `HOUSING`, `UTILITIES`, `ENTERTAINMENT`, `HEALTHCARE`, `OTHER` in `src/core/domain/value-objects/expense-category.vo.ts`
- [ ] T008 [P] Define domain repository port interfaces (`IExpenseRepository`, `IGroupRepository`) and DTOs in `src/core/domain/ports/expense-repository.port.ts` and `src/core/domain/ports/group-repository.port.ts`
- [ ] T009 Configure SQLite connection and schema migration runner with foreign keys enabled (`PRAGMA foreign_keys = ON;`) in `src/infrastructure/database/sqlite-connection.ts` and `src/infrastructure/database/migrations/001_initial_schema.sql`
- [ ] T010 [P] Implement in-memory repository adapters (`InMemoryExpenseRepository`, `InMemoryGroupRepository`) for fast hermetic test suites in `src/infrastructure/repositories/in-memory-expense.repository.ts` and `src/infrastructure/repositories/in-memory-group.repository.ts`
- [ ] T011 Implement `better-sqlite3` repository adapters (`BetterSqliteExpenseRepository`, `BetterSqliteGroupRepository`) implementing domain ports in `src/infrastructure/repositories/better-sqlite-expense.repository.ts` and `src/infrastructure/repositories/better-sqlite-group.repository.ts`
- [ ] T012 Integration tests verifying SQLite repository adapters with real SQLite instance in `tests/integration/sqlite-repositories.test.ts`

**Checkpoint**: Core domain primitives, repository ports, SQLite schema, and test harness verified green.

---

## Phase 3: User Story 1 - Record and View Personal Expenses (Priority: P1) 🎯 MVP

**Goal**: As an expense tracker, capture new expenses via an intuitive form (amount, currency defaulting to EUR, date, predefined category, description) and view them in a structured reverse-chronological list.

**Independent Test**: Open the application, fill out the expense form with valid details (amount `12.50`, EUR, date, Food & Dining, "Morning Coffee"), submit, and verify the record appears immediately at the top of the list with formatted amount `12.50 €`.

### Tests for User Story 1 (TDD First) ⚠️
> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T013 [P] [US1] Unit tests for `Expense` domain entity validation (`amount_minor_units > 0`, non-empty description <= 255 chars, valid date) in `tests/unit/expense.entity.test.ts`
- [ ] T014 [P] [US1] Integration tests for `CreateExpenseUseCase` and `ListExpensesUseCase` with in-memory repository in `tests/integration/create-and-list-expenses.test.ts`
- [ ] T015 [P] [US1] Component tests for `ExpenseForm` and `ExpenseList` presentational components verifying form entry and tabular list rendering in `tests/ui/expense-components.test.tsx`

### Implementation for User Story 1

- [ ] T016 [US1] Implement `Expense` domain entity with validation invariants in `src/core/domain/entities/expense.entity.ts`
- [ ] T017 [US1] Implement `CreateExpenseUseCase` in `src/core/application/use-cases/create-expense.use-case.ts`
- [ ] T018 [US1] Implement `ListExpensesUseCase` with reverse-chronological sorting in `src/core/application/use-cases/list-expenses.use-case.ts`
- [ ] T019 [P] [US1] Implement Next.js Route Handlers `GET /api/expenses` and `POST /api/expenses` in `src/app/api/expenses/route.ts`
- [ ] T020 [P] [US1] Implement presentational `ExpenseForm` component with EUR default, category dropdown, amount validation, and utilitarian borders in `src/ui/components/expense/expense-form.tsx`
- [ ] T021 [P] [US1] Implement presentational `ExpenseList` and `ExpenseItem` components with tabular monospace figures in `src/ui/components/expense/expense-list.tsx` and `src/ui/components/expense/expense-item.tsx`
- [ ] T022 [US1] Implement headless hook `useExpenses` and container `ExpenseManagerContainer` orchestrating state in `src/ui/hooks/use-expenses.ts` and `src/ui/containers/expense-manager.container.tsx`
- [ ] T023 [US1] Mount `ExpenseManagerContainer` in `src/app/page.tsx` and verify MVP personal expense recording and listing flow end-to-end

**Checkpoint**: User Story 1 is fully functional and testable as a standalone MVP increment.

---

## Phase 4: User Story 2 - Delete an Existing Expense (Priority: P2)

**Goal**: As an expense tracker, remove an erroneous or outdated expense from records with mandatory 2-step confirmation, updating the list and summary metrics.

**Independent Test**: Select an existing expense from the list, click delete, verify modal prompts for confirmation, cancel keeps the record, confirm permanently removes the expense and updates totals.

### Tests for User Story 2 (TDD First) ⚠️

- [ ] T024 [P] [US2] Integration test for `DeleteExpenseUseCase` verifying deletion and not-found error handling in `tests/integration/delete-expense.test.ts`
- [ ] T025 [P] [US2] Component test for `DeleteConfirmModal` verifying confirmation, cancellation, and focus trap in `tests/ui/delete-confirm-modal.test.tsx`

### Implementation for User Story 2

- [ ] T026 [US2] Implement `DeleteExpenseUseCase` in `src/core/application/use-cases/delete-expense.use-case.ts`
- [ ] T027 [P] [US2] Implement Next.js Route Handler `DELETE /api/expenses/[id]` in `src/app/api/expenses/[id]/route.ts`
- [ ] T028 [P] [US2] Implement presentational `DeleteConfirmModal` component in `src/ui/components/expense/delete-confirm-modal.tsx`
- [ ] T029 [US2] Wire deletion handler and modal state into `useExpenses` and `ExpenseManagerContainer` in `src/ui/hooks/use-expenses.ts` and `src/ui/containers/expense-manager.container.tsx`

**Checkpoint**: User Stories 1 and 2 operate seamlessly together with data integrity preserved.

---

## Phase 5: User Story 3 - Group Creation and Member Management (Priority: P3)

**Goal**: As a group coordinator, create named groups and add members/users to them, preventing duplicates and establishing participant rosters for shared spending.

**Independent Test**: Submit unique group name `"Apartment Roommates"`, add members `"Alice"`, `"Bob"`, `"Charlie"`, verify attempting to re-add `"Alice"` alerts duplicate rejection, and verify group roster renders correctly.

### Tests for User Story 3 (TDD First) ⚠️

- [ ] T030 [P] [US3] Unit tests for `Group` and `Member` domain entities (non-empty name 1..100 chars, duplicate member rejection) in `tests/unit/group-and-member.entity.test.ts`
- [ ] T031 [P] [US3] Integration tests for `CreateGroupUseCase`, `ListGroupsUseCase`, and `AddMemberUseCase` in `tests/integration/group-use-cases.test.ts`
- [ ] T032 [P] [US3] Component tests for `GroupPanel` and `GroupRoster` in `tests/ui/group-components.test.tsx`

### Implementation for User Story 3

- [ ] T033 [US3] Implement `Member` and `Group` domain entities with duplicate member validation in `src/core/domain/entities/member.entity.ts` and `src/core/domain/entities/group.entity.ts`
- [ ] T034 [US3] Implement `CreateGroupUseCase` and `ListGroupsUseCase` in `src/core/application/use-cases/create-group.use-case.ts` and `src/core/application/use-cases/list-groups.use-case.ts`
- [ ] T035 [US3] Implement `AddMemberUseCase` with duplicate rejection in `src/core/application/use-cases/add-member.use-case.ts`
- [ ] T036 [P] [US3] Implement Next.js Route Handlers `GET /api/groups`, `POST /api/groups`, and `POST /api/groups/[id]/members` in `src/app/api/groups/route.ts` and `src/app/api/groups/[id]/members/route.ts`
- [ ] T037 [P] [US3] Implement presentational `GroupPanel` and `GroupRoster` components in `src/ui/components/group/group-panel.tsx` and `src/ui/components/group/group-roster.tsx`
- [ ] T038 [US3] Implement headless hook `useGroups` in `src/ui/hooks/use-groups.ts` and integrate group selection into `src/ui/containers/expense-manager.container.tsx`

**Checkpoint**: Groups and members can be created, managed, and viewed with complete validation.

---

## Phase 6: User Story 4 - Share Group Expenses and View Balances (Priority: P4)

**Goal**: As a group member, assign an expense to a group, designate who paid upfront, calculate equal splits with exact minor-unit conservation (Hare-Niemeyer), and view net balances (`total paid - total owed`).

**Independent Test**: Record an expense of 100.00 EUR in a group of 3 members with Alice as payer; verify splits equal 33.34 EUR, 33.33 EUR, 33.33 EUR (sum 100.00 EUR); verify net balances Alice +66.66 EUR (credit), Bob -33.33 EUR (debt), Charlie -33.33 EUR (debt).

### Tests for User Story 4 (TDD First) ⚠️

- [ ] T039 [P] [US4] Unit tests for Hare-Niemeyer largest-remainder split algorithm on `Money.split(n)` verifying exact minor-unit conservation in `tests/unit/money-split.test.ts`
- [ ] T040 [P] [US4] Integration test for `CalculateGroupBalancesUseCase` with multiple shared expenses and payers in `tests/integration/calculate-group-balances.test.ts`
- [ ] T041 [P] [US4] Component test for `MemberBalanceCard` verifying credit/debt status badges and tabular amounts in `tests/ui/member-balance-card.test.tsx`

### Implementation for User Story 4

- [ ] T042 [US4] Implement `ExpenseSplit` value object and Hare-Niemeyer exact penny split logic in `src/core/domain/value-objects/expense-split.vo.ts` and `src/core/domain/entities/expense.entity.ts`
- [ ] T043 [US4] Update `CreateExpenseUseCase` to enforce group membership validation for `payerMemberId` and generate splits in `src/core/application/use-cases/create-expense.use-case.ts`
- [ ] T044 [US4] Implement `CalculateGroupBalancesUseCase` computing `netBalance = totalPaid - totalOwed` in `src/core/application/use-cases/calculate-group-balances.use-case.ts`
- [ ] T045 [P] [US4] Implement Next.js Route Handler `GET /api/groups/[id]/balances` in `src/app/api/groups/[id]/balances/route.ts`
- [ ] T046 [P] [US4] Implement presentational `MemberBalanceCard` component in `src/ui/components/group/member-balance-card.tsx`
- [ ] T047 [US4] Update `ExpenseForm` to display group selection and dynamic payer dropdown when a group is chosen in `src/ui/components/expense/expense-form.tsx`
- [ ] T048 [US4] Update `ExpenseItem` to display group name, payer attribution, and split breakdown in `src/ui/components/expense/expense-item.tsx`
- [ ] T049 [US4] Connect balance calculation and group filtering into `ExpenseManagerContainer` in `src/ui/containers/expense-manager.container.tsx`

**Checkpoint**: All 4 user stories are fully implemented, verified, and integrated into the fullstack application.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Accessibility, responsive design verification for viewports >1800px, and end-to-end quickstart validation.

- [ ] T050 [P] Implement WCAG 2.1 AA accessible keyboard navigation, ARIA live regions for balance updates, and high-contrast focus rings in `src/ui/components/primitives/`
- [ ] T051 Verify utilitarian visual design tokens (taupe-200, taupe-800, taupe-950, zero shadows, zero gradients) and centered canvas on viewports >1800px in `src/ui/styles/globals.css` and `src/ui/components/layout/utilitarian-shell.tsx`
- [ ] T052 Execute manual verification scenarios 1 through 5 from `specs/001-shared-group-expenses/quickstart.md`
- [ ] T053 Run full automated test suite (`npm test`) and strict type checking (`tsc --noEmit`) verifying 0 errors and 0 warnings

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: Can start immediately.
- **Foundational (Phase 2)**: Depends on Setup completion. **BLOCKS all user stories.**
- **User Story 1 (Phase 3)**: Depends on Foundational completion. Delivers the core MVP.
- **User Story 2 (Phase 4)**: Depends on User Story 1 completion.
- **User Story 3 (Phase 5)**: Depends on Foundational completion. Can run in parallel with US1/US2.
- **User Story 4 (Phase 6)**: Depends on User Story 1 and User Story 3 completion (requires both expenses and groups).
- **Polish (Phase 7)**: Depends on all user stories being completed.

### Parallel Opportunities

- Within Phase 1: `T002`, `T003`, `T004` can execute in parallel.
- Within Phase 2: `T005`, `T006`, `T007`, `T008`, `T010` can execute in parallel.
- Within User Story 1: Test tasks `T013`, `T014`, `T015` run in parallel; UI components `T020`, `T021` run in parallel.
- Within User Story 3: Test tasks `T030`, `T031`, `T032` run in parallel; Route Handlers `T036` and UI `T037` run in parallel.
- Within User Story 4: Test tasks `T039`, `T040`, `T041` run in parallel; Route Handler `T045` and UI `T046` run in parallel.

---

## Implementation Strategy: MVP First

1. **Phase 1 (Setup) + Phase 2 (Foundational)**: Establish the Next.js scaffold, `Money` Value Object, SQLite schema, and repository ports.
2. **Phase 3 (User Story 1)**: Deliver the standalone MVP. Test that a user can record and list personal expenses with exact monetary formatting.
3. **Phase 4 (User Story 2)**: Add deletion with two-step confirmation.
4. **Phase 5 (User Story 3)**: Add group creation and member rosters.
5. **Phase 6 (User Story 4)**: Add shared group expense splitting with upfront payer and real-time net balances.
6. **Phase 7 (Polish)**: Validate WCAG 2.1 AA accessibility and utilitarian visual aesthetic on screens >1800px.
