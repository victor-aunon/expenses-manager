# Research & Architectural Decisions: Shared Group Expenses

**Feature**: `001-shared-group-expenses`
**Date**: 2026-10-20
**Status**: Completed

## Executive Architectural Summary

This document establishes the technical foundation for the Shared Group Expenses feature in the Expenses Manager application, honoring the ratified Constitution v1.1.0 and user design mandates:
1. **Next.js (latest) App Router** with strict Clean Architecture (Domain -> Application -> Infrastructure -> UI).
2. **SQLite storage** via a decoupled repository adapter (`BetterSqliteExpenseRepository`, `BetterSqliteGroupRepository`) alongside in-memory mock adapters for hermetic unit testing.
3. **Container-Presentational separation** for React UI components.
4. **Utilitarian Design System** with custom design tokens (`taupe-200`, `taupe-800`, `taupe-950`), zero shadows, zero gradients, and centered layout with expansive margins on viewports `> 1800px`.
5. **Dogmatic TDD & Financial Integrity** with immutable `Money` Value Object (minor units / cents) and exact penny remainder conservation.

---

## Technical Investigations & Decisions

### 1. Framework Architecture: Next.js App Router with Clean Architecture

- **Context**: The user specified a fullstack Next.js latest application with clean separation between the API layer and the UI layer (logic vs. rendering components).
- **Decision**: Structure the application around an isolated `core/` directory completely agnostic of Next.js and React:
  - `src/core/domain`: Entities (`Expense`, `Group`, `Member`), Value Objects (`Money`, `ExpenseCategory`, `ExpenseSplit`), Invariants, and Repository Ports (`ExpenseRepository`, `GroupRepository`).
  - `src/core/application`: Use Cases (`CreateExpenseUseCase`, `DeleteExpenseUseCase`, `ListExpensesUseCase`, `CreateGroupUseCase`, `AddMemberToGroupUseCase`, `GetGroupBalancesUseCase`).
  - `src/infrastructure/sqlite`: SQLite connection, migrations, and repository implementations conforming to domain ports.
  - `src/app/api`: Next.js Route Handlers / Server Action endpoints serving as HTTP controllers that invoke application use cases.
  - `src/ui`: Container components / custom headless hooks (`useExpenses`, `useGroups`) orchestrating use cases/API calls, feeding pure typed props into presentational components (`ExpenseList`, `ExpenseForm`, `GroupSummary`).
- **Rationale**:
  - Complies with **Constitution Principle I** (Domain independence from UI and infrastructure).
  - Avoids coupling business logic to React Server Components (RSC) or Next.js request lifecycle.
  - Enables 100% test coverage of business logic in Node without needing browser mocks or running Next.js server processes.
- **Alternatives Considered**:
  - *Standard Next.js route colocated logic*: Rejected. Blurs boundaries, leaks SQL/Prisma/HTTP concerns into UI components, violates Constitution Principle I.
  - *Full separate Express/FastAPI backend*: Rejected. Unnecessary operational complexity when Next.js handles fullstack TypeScript within a single cohesive deployment.

---

### 2. Database & Persistence: SQLite Driver & Schema Strategy

- **Context**: The user specified SQLite as the storage engine.
- **Decision**: Use `better-sqlite3` as the SQLite engine for Node.js, managed through direct SQL migrations and lightweight prepared statements behind domain repository ports.
- **Rationale**:
  - `better-sqlite3` is synchronous, blistering fast, rock solid, and standard for Node.js server environments.
  - Synchronous query execution simplifies transaction management (e.g. creating an expense and its split allocations in a single `BEGIN...COMMIT` block).
  - Keeps domain repository ports (`IExpenseRepository`, `IGroupRepository`) asynchronous in their contract signature so they remain interchangeable with remote API or async adapters without leaking implementation details.
- **Alternatives Considered**:
  - *`node:sqlite` (experimental)*: Rejected for production stability; API is still evolving across Node versions.
  - *Prisma ORM*: Rejected. Heavy client generation, excessive abstraction layer, and potential performance overhead when domain entities already model all invariants.
  - *Drizzle ORM*: Viable, but raw SQL with typed mappers inside repository adapters provides the purest zero-dependency abstraction with maximum visibility.

---

### 3. Financial Integrity: Money Value Object & Remainder Allocation

- **Context**: In shared expense splitting, integer minor units (cents) divided by group sizes (e.g. $100.00 / 3) create fractional cents. Floating-point arithmetic is strictly forbidden by Constitution Principle IV.
- **Decision**: Implement an immutable `Money` Value Object:
  - Internal state: `amountInMinorUnits: number` (integer, e.g., `10000` for 100.00 EUR) and `currency: CurrencyCode` (ISO 4217: `EUR`, `USD`, `GBP`).
  - Strict validation: Invariant checks enforcing integers (`Number.isSafeInteger`), supported currencies, and currency match on arithmetic operations (`add`, `subtract`).
  - Split Algorithm (Hare-Niemeyer / Largest Remainder distribution):
    - Base share: `Math.floor(totalMinorUnits / participantCount)`.
    - Remainder: `totalMinorUnits % participantCount`.
    - Distribute the remainder 1 cent at a time to the first `remainder` members in deterministic roster order.
    - Mathematical invariant: `sum(splits) === totalMinorUnits`.
- **Rationale**: Guarantees zero cent drift and absolute conservation of financial assets.
- **Alternatives Considered**:
  - *Float division with round-to-nearest*: Rejected. Loses or creates cents across participants, violating Constitution Principle IV.

---

### 4. Container-Presentational Pattern in Next.js

- **Context**: Constitution Principle V and user prompt mandate clean separation between logic and visual rendering.
- **Decision**:
  - **Headless Hooks / Containers (`src/ui/containers/` & `src/ui/hooks/`)**:
    - Responsible for state management, form state, input validation coordination, calling API endpoints / use cases, and handling loading/error states.
    - Exposes strictly typed data and event handler callbacks.
  - **Presentational Components (`src/ui/components/`)**:
    - Pure, stateless React components with 100% typed props.
    - Zero business logic, zero use case imports, zero direct fetch/store calls.
    - Focuses solely on markup, keyboard navigation, ARIA roles, and utilitarian styling.
- **Rationale**:
  - Enhances testability: presentational components can be verified with visual snapshots and unit tests without mocking use cases.
  - Logic hooks can be tested using React hook testing utilities with mock repository adapters.

---

### 5. Utilitarian Design System & Ultra-Wide Layout

- **Context**: The user specified an "Utilitario" style: centered on screen with generous outer margins for viewports `> 1800px`, design tokens (`taupe-200` background, `taupe-800` borders, `taupe-950` text), and strictly NO shadows and NO gradients.
- **Decision**:
  - **Design Tokens (CSS Variables)** defined in `src/ui/styles/tokens.css`:
    ```css
    :root {
      --color-bg-canvas: #e8e5e0;       /* taupe-200 */
      --color-bg-surface: #f2f0ec;      /* taupe-100 / crisp surface */
      --color-border: #443e39;          /* taupe-800 */
      --color-text-primary: #191715;    /* taupe-950 */
      --color-text-muted: #5c544d;      /* taupe-700 */
      --color-accent: #2e2a27;          /* taupe-900 */
      --color-positive: #2d5a3f;        /* utilitarian sage green */
      --color-negative: #8a3324;        /* utilitarian brick red */
      --font-mono: ui-monospace, "SF Mono", Menlo, Consolas, monospace;
      --font-sans: system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      --border-width: 1px;
      --border-width-bold: 2px;
    }
    ```
  - **Visual Rules**:
    - Strict flat styling: `box-shadow: none !important; background-image: none !important;`
    - Crisp borders: solid 1px or 2px `var(--color-border)` framing every card, table, button, and input field.
    - Monospace figures for all financial amounts (`font-variant-numeric: tabular-nums`).
  - **Layout & Centering**:
    - App container: `max-w-5xl` (approx. 1100px - 1200px) centered via `margin-inline: auto`.
    - For viewports `> 1800px`: fixed maximum width constraint with expansive outer margins (`margin-inline: auto; padding-inline: 4rem;`), creating a focused utilitarian workbench aesthetic.

---

### 6. Testing Strategy (Dogmatic TDD - Constitution Principle II)

- **Test Runner**: Vitest with `@testing-library/react` and `jsdom`.
- **TDD Workflow**:
  1. Unit tests for `Money` Value Object (immutability, currency mismatch rejection, Hare-Niemeyer exact remainder distribution).
  2. Unit tests for Domain Entities (`Expense`, `Group`, `Member`) and validation invariants.
  3. Integration tests for Use Cases with `InMemoryExpenseRepository` and `InMemoryGroupRepository`.
  4. Integration tests for `BetterSqliteExpenseRepository` against temporary SQLite database instances.
  5. Component tests for presentational components verifying WCAG 2.1 AA accessibility and user interactions.
