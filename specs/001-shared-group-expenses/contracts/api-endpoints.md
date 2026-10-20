# Next.js Route Handlers (API Contracts)

**Base URL**: `/api`
**Content-Type**: `application/json`

---

## 1. Expenses Endpoints

### `GET /api/expenses`
Retrieves a list of expenses with optional query parameter filtering.

- **Query Parameters**:
  - `groupId` (optional, string): Filter by group ID.
  - `category` (optional, string): Filter by category code.
  - `startDate` (optional, string): ISO date `YYYY-MM-DD`.
  - `endDate` (optional, string): ISO date `YYYY-MM-DD`.
- **Response 200 (OK)**:
  ```json
  [
    {
      "id": "e58b8f2d-74d7-4bc2-8152-3cb56662e08e",
      "amount": { "minorUnits": 4500, "formatted": "45.00 €", "currency": "EUR" },
      "date": "2026-10-20",
      "category": "FOOD",
      "categoryLabel": "Food & Dining",
      "description": "Team Lunch",
      "groupId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "payerMemberId": "c9b1f23d-4e56-4c78-9a01-2b3c4d5e6f7a",
      "splits": [
        {
          "memberId": "c9b1f23d-4e56-4c78-9a01-2b3c4d5e6f7a",
          "amount": { "minorUnits": 2250, "formatted": "22.50 €", "currency": "EUR" }
        },
        {
          "memberId": "d1a2f3b4-5c6d-4e7f-8a9b-0c1d2e3f4a5b",
          "amount": { "minorUnits": 2250, "formatted": "22.50 €", "currency": "EUR" }
        }
      ],
      "createdAt": "2026-10-20T12:00:00.000Z"
    }
  ]
  ```

### `POST /api/expenses`
Creates a new personal or shared group expense.

- **Request Body**:
  ```json
  {
    "amount": 45.00,
    "currency": "EUR",
    "date": "2026-10-20",
    "category": "FOOD",
    "description": "Team Lunch",
    "groupId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "payerMemberId": "c9b1f23d-4e56-4c78-9a01-2b3c4d5e6f7a"
  }
  ```
- **Response 201 (Created)**: Returns created Expense object.
- **Response 400 (Bad Request)**:
  ```json
  {
    "error": "Validation failed",
    "details": ["Amount must be greater than zero", "Payer must belong to the selected group"]
  }
  ```

### `DELETE /api/expenses/:id`
Permanently deletes an expense.

- **Response 204 (No Content)**
- **Response 404 (Not Found)**:
  ```json
  { "error": "Expense not found" }
  ```

---

## 2. Groups Endpoints

### `GET /api/groups`
Lists all active groups with their member rosters.

- **Response 200 (OK)**:
  ```json
  [
    {
      "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
      "name": "Apartment Roommates",
      "members": [
        { "id": "c9b1f23d-4e56-4c78-9a01-2b3c4d5e6f7a", "name": "Alice" },
        { "id": "d1a2f3b4-5c6d-4e7f-8a9b-0c1d2e3f4a5b", "name": "Bob" }
      ],
      "createdAt": "2026-10-20T10:00:00.000Z"
    }
  ]
  ```

### `POST /api/groups`
Creates a new group.

- **Request Body**:
  ```json
  {
    "name": "Trip to Rome"
  }
  ```
- **Response 201 (Created)**: Returns created Group object.
- **Response 409 (Conflict)**: Group with this name already exists.

### `POST /api/groups/:id/members`
Adds a member to an existing group.

- **Request Body**:
  ```json
  {
    "name": "Charlie"
  }
  ```
- **Response 201 (Created)**: Returns added Member object.
- **Response 409 (Conflict)**: Member already in group.

### `GET /api/groups/:id/balances`
Calculates and returns net balances for all members in the group.

- **Response 200 (OK)**:
  ```json
  {
    "groupId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "balances": [
      {
        "memberId": "c9b1f23d-4e56-4c78-9a01-2b3c4d5e6f7a",
        "memberName": "Alice",
        "totalPaid": { "minorUnits": 4500, "formatted": "45.00 €", "currency": "EUR" },
        "totalOwed": { "minorUnits": 2250, "formatted": "22.50 €", "currency": "EUR" },
        "netBalance": { "minorUnits": 2250, "formatted": "+22.50 €", "currency": "EUR" },
        "status": "CREDIT"
      },
      {
        "memberId": "d1a2f3b4-5c6d-4e7f-8a9b-0c1d2e3f4a5b",
        "memberName": "Bob",
        "totalPaid": { "minorUnits": 0, "formatted": "0.00 €", "currency": "EUR" },
        "totalOwed": { "minorUnits": 2250, "formatted": "22.50 €", "currency": "EUR" },
        "netBalance": { "minorUnits": -2250, "formatted": "-22.50 €", "currency": "EUR" },
        "status": "DEBT"
      }
    ]
  }
  ```
