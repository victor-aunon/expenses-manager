# Implementation Plan: Shared Group Expenses

**Branch**: `001-shared-group-expenses` | **Date**: 2026-10-20 | **Spec**: [specs/001-shared-group-expenses/spec.md](spec.md)

**Input**: Feature specification from `specs/001-shared-group-expenses/spec.md`

---

## Summary

Deliver a fullstack Next.js application implementing personal and shared group expense tracking. The system is built on **Clean Architecture (Hexagonal Ports & Adapters)**, ensuring the business domain is completely independent of React, Next.js, and SQLite.
- Core capabilities: Create/save/delete personal expenses, organize groups and member rosters, split group expenses with a designated upfront payer, and display real-time net balances.
- Technical stack: Next.js (latest App Router), SQLite (`better-sqlite3`), Vitest (strict Dogmatic TDD), and a custom **Utilitarian Design System** (`taupe-200`, `taupe-800`, `taupe-950`, zero shadows, zero gradients, ultra-wide viewport centering).

---

## Technical Context

**Language/Version**: TypeScript 5.x / Node.js 24.x (`v24.14.0`)

**Primary Dependencies**: Next.js (latest App Router), React 19, `better-sqlite3`

**Storage**: SQLite (`data/expenses.db` via `better-sqlite3`) + In-Memory repository adapters for hermetic testing

**Testing**: Vitest, `@testing-library/react`, `jsdom` (Strict Dogmatic TDD Red-Green-Refactor)

**Target Platform**: Fullstack Web Application (Next.js server + browser client, WCAG 2.1 AA accessible)

**Project Type**: Fullstack Web Application with decoupled Domain Core

**Performance Goals**: Sub-100ms UI interaction, Sub-5ms database queries, zero layout shift

**Constraints**:
- Strict Clean Architecture: Domain layer has 0 external dependencies (no Next.js, no React, no SQLite).
- Strict Financial Integrity: All monetary calculations executed through an immutable `Money` Value Object (minor units integer only, exact penny conservation).
- Visual Design: Utilitarian design system with centered canvas for screens `> 1800px`, `taupe-200` background, `taupe-800` borders, `taupe-950` text, NO shadows, NO gradients.

**Scale/Scope**: v1 standalone group & expense manager, local embedded SQLite, personal & multi-member group sharing.

---

## Constitution Check

*GATE: Evaluated against Expenses Manager Constitution v1.1.0*

| Principle | Requirement | Plan Compliance Status | Validation Mechanism |
| :--- | :--- | :---: | :--- |
| **I. Clean Architecture & Port/Adapter Isolation** | Core domain isolated; no React/DB imports in domain; explicit ports | **PASS** | `src/core/domain` and `src/core/application` contain zero imports from `react`, `next`, or `better-sqlite3`. Repositories defined as TypeScript interfaces. |
| **II. Dogmatic Test-First Development** | Strict Red-Green-Refactor; failing tests preceding code | **PASS** | Vitest configured for domain unit tests, repository integration tests, and UI component tests prior to authoring production code. |
| **III. Contract-First & Strict Type Safety** | Strict TypeScript (`strict: true`), no `any`, runtime invariant checks | **PASS** | TypeScript compiler flags set to strict; Domain entities validate invariants in constructor; unrepresentable invalid states. |
| **IV. Financial Integrity & Money VO** | Minor units integer representation, ISO 4217 currency, no float math | **PASS** | `Money` Value Object encapsulates integer cents and currency; Hare-Niemeyer split allocation eliminates rounding drift. |
| **V. Atomic Design & Container Decoupling** | Logic/orchestration decoupled from presentational rendering | **PASS** | Headless hooks (`src/ui/hooks/`) and containers (`src/ui/containers/`) manage state; presentational components (`src/ui/components/`) receive 100% typed props. |

---

## Project Structure

### Documentation (this feature)

```text
specs/001-shared-group-expenses/
├── plan.md              # Implementation plan (this file)
├── research.md          # Technical research & architectural decisions
├── data-model.md        # Domain models, value objects, and SQLite schema
├── quickstart.md        # Verification guide & manual testing scenarios
├── contracts/           # Interface contracts
│   ├── repository-ports.ts     # Domain repository interfaces
│   ├── api-endpoints.md        # Next.js Route Handler contracts
│   └── component-contracts.ts  # Container & Presentational props
└── checklists/
    └── requirements.md  # Specification quality checklist
```

### Source Code (Concrete Implementation Layout)

```text
src/
├── core/
│   ├── domain/                         # Isolated Core Business Logic
│   │   ├── entities/
│   │   │   ├── expense.entity.ts
│   │   │   ├── group.entity.ts
│   │   │   └── member.entity.ts
│   │   ├── value-objects/
│   │   │   ├── money.vo.ts             # Integer minor-units Money VO
│   │   │   ├── expense-category.vo.ts  # Predefined categories enum
│   │   │   └── expense-split.vo.ts     # Exact split allocation
│   │   ├── ports/                      # Outbound Interfaces
│   │   │   ├── expense-repository.port.ts
│   │   │   └── group-repository.port.ts
│   │   └── errors/
│   │       ├── domain.error.ts
│   │       └── currency-mismatch.error.ts
│   └── application/                    # Use Cases / Application Services
│       ├── use-cases/
│       │   ├── create-expense.use-case.ts
│       │   ├── delete-expense.use-case.ts
│       │   ├── list-expenses.use-case.ts
│       │   ├── create-group.use-case.ts
│       │   ├── add-member.use-case.ts
│       │   └── calculate-group-balances.use-case.ts
│       └── dtos/
│           ├── expense.dto.ts
│           └── group.dto.ts
├── infrastructure/                     # Adapters (SQLite & In-Memory)
│   ├── database/
│   │   ├── sqlite-connection.ts
│   │   ├── migrations/
│   │   │   └── 001_initial_schema.sql
│   │   └── migration-runner.ts
│   └── repositories/
│       ├── better-sqlite-expense.repository.ts
│       ├── better-sqlite-group.repository.ts
│       ├── in-memory-expense.repository.ts
│       └── in-memory-group.repository.ts
├── ui/                                 # User Interface (Next.js Presentation)
│   ├── components/                     # Pure Presentational Components
│   │   ├── primitives/
│   │   │   ├── button.tsx
│   │   │   ├── input.tsx
│   │   │   ├── select.tsx
│   │   │   └── badge.tsx
│   │   ├── expense/
│   │   │   ├── expense-form.tsx
│   │   │   ├── expense-list.tsx
│   │   │   ├── expense-item.tsx
│   │   │   └── delete-confirm-modal.tsx
│   │   ├── group/
│   │   │   ├── group-panel.tsx
│   │   │   ├── group-roster.tsx
│   │   │   └── member-balance-card.tsx
│   │   └── layout/
│   │       ├── utilitarian-shell.tsx   # Centered layout (>1800px canvas)
│   │       └── header.tsx
│   ├── containers/                     # Logic Containers & Headless Hooks
│   │   ├── expense-manager.container.tsx
│   │   ├── use-expenses.ts
│   │   └── use-groups.ts
│   └── styles/
│       ├── tokens.css                  # taupe-200, taupe-800, taupe-950
│       └── globals.css                 # Utilitarian rules, no shadows/gradients
└── app/                                # Next.js App Router (HTTP Delivery)
    ├── api/
    │   ├── expenses/
    │   │   ├── route.ts                # GET, POST
    │   │   └── [id]/route.ts           # DELETE
    │   └── groups/
    │       ├── route.ts                # GET, POST
    │       ├── [id]/members/route.ts   # POST
    │       └── [id]/balances/route.ts  # GET
    ├── layout.tsx
    └── page.tsx                        # Mounts ExpenseManagerContainer

tests/
├── unit/                               # Domain & Value Object Tests
│   ├── money.vo.test.ts
│   ├── expense.entity.test.ts
│   └── group.entity.test.ts
├── integration/                        # Use Cases & In-Memory Tests
│   ├── create-expense.test.ts
│   ├── calculate-group-balances.test.ts
│   └── better-sqlite-repositories.test.ts
└── ui/                                 # Presentational Component Tests
    ├── expense-form.test.tsx
    ├── expense-list.test.tsx
    └── group-panel.test.tsx
```

---

## Complexity Tracking

| Component / Pattern | Why Needed | Simpler Alternative Rejected Because |
| :--- | :--- | :--- |
| **Hexagonal Repository Ports** | Required by Constitution Principle I to allow switching between SQLite and In-Memory test adapters without modifying use cases. | Direct SQL queries in Next.js Server Components would tightly couple business logic to the database and framework, preventing automated domain unit testing. |
| **Hare-Niemeyer Remainder Allocation** | Required by Constitution Principle IV to guarantee that the sum of split shares equals the parent expense to the exact cent. | Standard float division with rounding creates or drops pennies, corrupting accounting ledger integrity. |
| **Container-Presentational Pattern** | Enforces clean separation between stateful logic hooks and pure stateless rendering components per Constitution Principle V. | Mixing `fetch` or SQL queries directly inside JSX components creates monolithic files that are difficult to unit-test and maintain. |
