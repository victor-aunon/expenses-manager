# Feature Specification: Shared Group Expenses

**Feature Branch**: `001-shared-group-expenses`

**Created**: 2026-10-20

**Status**: Draft

**Input**: User description: "I want to enter a new expense via a form, save it , delete it and list other expenses. Also I would like to add groups and users to groups so an expense can be shared by the uses on a group"

## Clarifications

### Session 2026-10-20

- Q: When recording a shared group expense, who should be designated as the payer of the transaction? → A: Option A (Selectable group member as payer: The form includes a dropdown of group members to designate who paid upfront for the transaction).
- Q: Should the application compute and display net settlement balances for each group member, or focus solely on recording and displaying individual expense splits? → A: Option A (Net balance summary: Compute each member's overall balance [total paid minus total owed share] displayed on the group details view, without automated debt simplification).
- Q: When creating an expense, should category selection be restricted to a predefined list or allow custom free-text categories? → A: Option A (Predefined standard categories: Select from a fixed standard list [Food, Transportation, Housing, Utilities, Entertainment, Healthcare, Other]).
- Q: When recording an expense, should the currency default to a standard system currency or require explicit selection each time? → A: Option A (Default to EUR with selector: Pre-select EUR by default, allowing the user to change to another ISO 4217 currency [e.g., USD, GBP]).
- Q: Should the application persist expenses and groups across browser sessions via a LocalStorage adapter, or start in-memory only? → A: Option B (Pure in-memory only: State resets on every browser refresh or tab close; external persistence adapter is deferred to a future phase).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Record and View Personal Expenses (Priority: P1)

As an individual expense tracker, I want to capture new expenses through an intuitive form and view them in a structured list, so that I maintain clear visibility over my financial outlays.

**Why this priority**: This represents the foundational MVP functionality of the application. Without the ability to record, save, and list expenses, no higher-level grouping or sharing features can operate.

**Independent Test**: Can be fully tested by opening the application, filling out the expense form with valid details (amount, currency defaulting to EUR, date, category chosen from standard list, description), submitting it, and verifying that the record appears immediately in the expense list with accurate data and formatting.

**Acceptance Scenarios**:

1. **Given** the user is on the expense entry form, **When** they open the form, **Then** the currency defaults to EUR with an option to select other supported currencies (USD, GBP).
2. **Given** valid expense details (amount, currency, date, category, description), **When** the user submits the form, **Then** the expense is saved and appended to the expense list with formatted monetary values.
3. **Given** the user enters an invalid amount (such as zero, negative, or non-numeric input) or leaves mandatory fields empty, **When** they attempt to save, **Then** the form prevents submission and displays actionable validation feedback.
4. **Given** multiple expenses have been recorded, **When** the user views the expense list, **Then** all recorded expenses are displayed in reverse chronological order (newest first).

---

### User Story 2 - Delete an Existing Expense (Priority: P2)

As an expense tracker, I want to remove an erroneous or outdated expense from my records, so that my expense history and cumulative totals remain accurate.

**Why this priority**: Essential for data hygiene and user trust. Users frequently make entry errors and require an immediate, safe mechanism to delete records.

**Independent Test**: Can be fully tested by selecting an existing expense from the list, initiating the delete action, confirming the prompt, and verifying the expense is completely removed from the list and totals are recalculated.

**Acceptance Scenarios**:

1. **Given** an existing expense in the list, **When** the user clicks to delete the expense and confirms the confirmation prompt, **Then** the expense is permanently removed from the list and summary metrics update.
2. **Given** an existing expense in the list, **When** the user clicks to delete the expense but cancels the confirmation prompt, **Then** the expense remains in the list unchanged.

---

### User Story 3 - Group Creation and Member Management (Priority: P3)

As a group coordinator, I want to create named groups and add members/users to them, so that I can organize shared spending contexts such as households, trips, or team projects.

**Why this priority**: Required prerequisite for splitting expenses. Group rosters establish the participants among whom expenses can subsequently be distributed.

**Independent Test**: Can be fully tested by creating a new group with a unique name, adding multiple named users to that group, and viewing the group details to verify the member roster.

**Acceptance Scenarios**:

1. **Given** a user wishes to organize shared expenses, **When** they submit a unique group name, **Then** a new group is created and displayed in the group overview.
2. **Given** an existing group, **When** the user adds a new member with a name and identifier, **Then** the member is linked to the group roster and available for expense splitting.
3. **Given** an existing group, **When** the user attempts to add a member who is already in that group, **Then** the system rejects the duplicate and alerts the user.

---

### User Story 4 - Share Group Expenses and View Balances (Priority: P4)

As a group member, I want to record an expense assigned to a group, designate who paid upfront, and view each member's net balance, so that everyone understands their overall financial standing in the group.

**Why this priority**: Delivers the collaborative value of shared spending. It builds on individual expense tracking (P1) and group membership (P3) to provide automated cost-sharing and net balance tracking.

**Independent Test**: Can be fully tested by recording an expense assigned to a group of 3 members with a selected payer, verifying that the system calculates each member's split accurately without losing cents, and viewing the net balances on the group details view.

**Acceptance Scenarios**:

1. **Given** a group with N active members, **When** an expense is recorded for that group designating a specific member as the payer, **Then** the cost is split equally across all members, the payer is attributed, and each member's share is explicitly displayed.
2. **Given** an expense amount that cannot be divided evenly across members (e.g., $100.00 split among 3 members), **When** the split is computed, **Then** the system allocates exact whole minor units (cents) such that the sum of all individual shares precisely equals the total amount ($33.34 + $33.33 + $33.33 = $100.00) with zero rounding drift.
3. **Given** a list containing both personal and group expenses, **When** the user filters by a specific group, **Then** only expenses associated with that group are displayed.
4. **Given** recorded shared expenses within a group, **When** the user views the group details, **Then** the system computes and displays a net balance summary for each member (total amount paid upfront minus total share owed).

---

### Edge Cases

- **Unequal Minor Unit Division**: When an expense cannot be divided evenly down to the cent, the remainder cents MUST be deterministically distributed among the first participants so that no fraction of a cent is discarded or created.
- **Empty Group Assignment**: An expense cannot be assigned to a group that has zero members. The system must require at least one member in the group before permitting shared expenses.
- **Group Deletion with Existing Expenses**: A group with associated shared expenses cannot be deleted without either reassigning or deleting its associated expenses first.
- **Member Removal with Active Splits**: A member cannot be removed from a group if they have active unsettled expense shares linked to that group.
- **Zero and Negative Amounts**: The form must reject amounts less than or equal to zero.
- **Large Values**: Amounts exceeding 999,999,999 units in currency must be safely handled and rejected if exceeding supported architectural bounds.
- **Single Currency Consistency per Transaction**: All split shares of a single transaction must be recorded in the identical currency as the parent expense.
- **Payer Must Belong to Group**: For shared expenses, the selected payer MUST be an active member of the designated group.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide an expense entry form capturing amount, currency (defaulting to EUR with options for USD and GBP), date, category (selected from a predefined standard list: Food, Transportation, Housing, Utilities, Entertainment, Healthcare, Other), description, optional group selection, and payer member selection (when a group is selected).
- **FR-002**: System MUST validate all monetary entries to ensure amounts are strictly greater than zero and contain a valid supported ISO 4217 currency code.
- **FR-003**: System MUST require a non-empty description and a valid calendar date for every expense record.
- **FR-004**: System MUST store expenses with exact monetary representation in minor units (integer cents) to eliminate floating-point precision loss.
- **FR-005**: System MUST display an expense list showing date, category, description, formatted monetary value with currency symbol, group name (if applicable), and payer name (if applicable).
- **FR-006**: System MUST support permanent deletion of any expense after explicit user confirmation.
- **FR-007**: System MUST allow users to create groups with a non-empty, unique name.
- **FR-008**: System MUST allow adding users/members with a name to any existing group.
- **FR-009**: System MUST prevent duplicate members from being added to the same group.
- **FR-010**: System MUST allow associating an expense with an existing group.
- **FR-011**: System MUST automatically compute an equal split allocation among all members of the selected group when a shared expense is created.
- **FR-012**: System MUST guarantee monetary conservation: the exact sum of all individual split shares MUST equal the total expense amount without any cent loss or surplus.
- **FR-013**: System MUST allow filtering the expense list by group, category, or date range.
- **FR-014**: System MUST display the per-member split breakdown when viewing details of a shared expense.
- **FR-015**: System MUST prevent deletion of groups that contain active expenses until those expenses are deleted or reassigned.
- **FR-016**: When an expense is assigned to a group, the form MUST require selecting which group member paid the upfront amount from the group's active members roster.
- **FR-017**: System MUST compute and display a net balance summary for each group member (calculated as total amount paid upfront by the member minus total share owed by the member across all group expenses).
- **FR-018**: System MUST enforce category selection strictly from the predefined standard list (Food, Transportation, Housing, Utilities, Entertainment, Healthcare, Other).
- **FR-019**: System MUST initialize the currency input with EUR by default and support EUR, USD, and GBP ISO 4217 currencies.
- **FR-020**: System MUST manage all state in-memory during the application session via repository ports and in-memory adapters, with persistent storage adapters explicitly deferred to future phases.

### Key Entities *(include if feature involves data)*

- **Money**: Value object encapsulating an integer amount in minor units (e.g., cents, centavos) and an ISO 4217 currency code (supported: "EUR", "USD", "GBP", with EUR as default). Guarantees immutable arithmetic and exact penny conservation.
- **ExpenseCategory**: Predefined standard domain category enumeration (Food, Transportation, Housing, Utilities, Entertainment, Healthcare, Other).
- **Expense**: Core business entity representing a financial outlay. Attributes: unique identifier, Money value object, transaction date, ExpenseCategory, description, optional group reference, optional payer member reference (required if group is set), created timestamp.
- **Group**: Entity representing an organizational collective for shared spending. Attributes: unique identifier, name, created date, list of associated member identifiers.
- **User / Member**: Entity representing a participant who can belong to groups and be assigned expense shares. Attributes: unique identifier, display name, created date.
- **ExpenseSplit**: Value object or sub-entity representing a participant's allocated share of a shared expense. Attributes: member identifier, Money value object (individual share amount and currency).
- **MemberBalance**: Calculated view model or value object representing a member's net standing within a group. Attributes: member identifier, Money net amount (positive = owed money, negative = owes money).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Users can complete entry and saving of a new expense in under 20 seconds.
- **SC-002**: The expense list updates instantaneously (under 100 milliseconds) upon saving or deleting an expense.
- **SC-003**: 100% of shared expense splits satisfy strict financial conservation where the sum of member shares equals the parent expense amount with zero discrepancy.
- **SC-004**: Users can create a group and populate it with 3 members in under 45 seconds.
- **SC-005**: 0% accidental expense deletions observed due to mandatory two-step confirmation prompts.
- **SC-006**: 95% of users successfully locate and review per-member split breakdowns on their first attempt without instructions.
- **SC-007**: Group member net balances update accurately in under 100 milliseconds whenever an expense is added, edited, or deleted.
- **SC-008**: 100% of expense, group, and member operations execute deterministically in-memory with sub-5ms repository access latency and zero external storage dependencies.

## Assumptions

- **Equal Sharing Default**: All members of a group share group expenses equally in this initial version. Custom variable weighting, percentage splits, and itemized sub-allocations are deferred to future enhancements.
- **Currency Homogeneity per Expense**: All splits for a given shared expense inherit the currency of that expense. Cross-currency conversion during splitting is out of scope for v1.
- **Supported Initial Currencies**: EUR is the system default currency, with USD and GBP selectable.
- **Pure In-Memory Architecture**: All entities, state transitions, and use cases operate strictly in-memory via repository ports and in-memory adapters. State resets upon page reload or browser tab closure; persistent storage adapters (LocalStorage/API) are out of scope for v1.
- **Single Payer Model**: Each shared expense is paid upfront by a single designated payer chosen from the group's members.
