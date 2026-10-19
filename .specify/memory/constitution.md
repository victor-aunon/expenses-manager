# Expenses Manager Constitution

## Core Principles

### I. Frontend Clean Architecture & Port/Adapter Isolation
The application MUST be organized around an isolated core domain, independent of React, browser APIs,
and rendering libraries. Domain entities, business rules, and use cases (application services) reside at
the center and MUST NOT import UI components, router hooks, or infrastructure libraries.
External integrations—such as HTTP clients, local storage, analytics, and mock services—MUST be defined
as explicit ports (interfaces) in the domain/application layer and implemented by swappable adapters in
the infrastructure layer.

### II. Dogmatic Test-First Development (NON-NEGOTIABLE)
Dogmatic Test-Driven Development (TDD) is NON-NEGOTIABLE for every unit of functionality, bug fix,
and refactor. Development MUST strictly follow the Red-Green-Refactor lifecycle:
1. **Red**: Write an automated test asserting the expected behavior and verify that it FAILS for the expected reason.
2. **Green**: Write the minimal production code necessary to make the failing test pass.
3. **Refactor**: Clean up the implementation and test code while ensuring all tests remain green.
No production implementation code may be authored without a pre-existing, failing test verifying its requirement.

### III. Contract-First & Strict Type Safety
All domain models, API payloads, component interfaces, and state stores MUST be statically typed with
explicit TypeScript contracts. The compiler MUST run in strict mode (`strict: true`). The use of `any`,
type assertions (`as Type`), and suppression comments (`@ts-ignore`, `@ts-nocheck`) is strictly prohibited.
Domain models MUST be modeled such that invalid states are unrepresentable at compile time and rejected
via invariant validation at runtime instantiation.

### IV. Financial Integrity & Domain Money Value Object
All monetary values MUST be modeled and manipulated using an immutable `Money` Value Object.
The `Money` Value Object encapsulates the amount (represented in integer minor units / cents) and an
ISO 4217 currency code. Floating-point arithmetic for currency is strictly prohibited.
All arithmetic operations (addition, subtraction, multiplication, currency conversions) MUST be performed
via methods on the `Money` Value Object, preserving immutability, validating currency compatibility, and
preventing rounding drift. Every monetary state transition MUST be traceable and auditable.

### V. Atomic Design & Container-Presentational Decoupling
User interface code MUST maintain a strict separation between state orchestration and visual presentation:
- **Presentational Components (Primitives/Molecules)**: Pure, stateless, and reusable UI components. They
  receive all data and callbacks exclusively through typed props. They MUST NOT trigger side effects,
  dispatch store actions directly, or perform business calculations.
- **Container Components & Headless Hooks**: Responsible for data fetching, subscribing to application
  state, executing use cases, and mapping domain models to view models before passing them to presentational
  components.

## Frontend Standards & Operational Constraints

- **Swappable Mock & API Adapters**: The frontend MUST be fully operational and testable using mock
  in-memory adapters before live backend APIs are attached.
- **Component Design System**: Components MUST be built with clean, composable primitives rather than
  monolithic, deeply nested JSX structures. Styling MUST follow consistent design tokens and atomic principles.
- **Performance & Render Hygiene**: Components MUST prevent unnecessary re-renders through targeted state
  slices, stable callback references, and appropriate memoization. Unbounded list rendering without
  virtualization is prohibited.
- **Accessibility & UX**: All interactive elements MUST comply with WCAG 2.1 AA standards, supporting full
  keyboard navigation, ARIA attributes, and accessible color contrast.

## Development Workflow & Quality Gates

- **Specification First**: Every new feature MUST begin with an approved feature specification (`spec.md`)
  and implementation plan (`plan.md`) generated via Spec Kit before writing any production code.
- **Verification Gates**: CI and local validation scripts MUST pass all test suites (unit, component, and
  integration tests), static analysis (Biome/ESLint), and strict type checking with zero errors or warnings.
- **Code Review**: Every pull request requires architectural verification against the constitution. PRs
  introducing domain logic into UI components, floating-point currency math, or code without tests MUST be
  rejected.

## Governance

- The Constitution represents the governing architectural law of the Expenses Manager frontend application
  and supersedes all informal conventions or personal habits.
- Any amendment to the Constitution requires an explicit documentation update, architectural rationale,
  and consensus approval.
- Versioning follows Semantic Versioning (SemVer):
  - **MAJOR**: Breaking architectural changes, removal or fundamental redefinition of core principles.
  - **MINOR**: Addition of new principles, sections, or materially expanded governance rules.
  - **PATCH**: Wording clarifications, structural formatting, and typo corrections.
- All Spec Kit plans, task checklists, and code reviews MUST include a formal Constitution Check verifying
  strict compliance.

**Version**: 1.1.0 | **Ratified**: 2026-10-19 | **Last Amended**: 2026-10-19
