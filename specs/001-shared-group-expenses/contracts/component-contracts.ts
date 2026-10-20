/**
 * UI Component Props & Container Contracts (Atomic Design / Presentational Decoupling)
 *
 * Rules:
 * - Presentational components receive 100% typed props. Zero use cases, zero data fetching.
 * - Logic / Containers orchestrate hooks, state transitions, and callback binding.
 */

export interface FormattedMoney {
  minorUnits: number;
  formatted: string;
  currency: 'EUR' | 'USD' | 'GBP';
}

export interface ExpenseItemView {
  id: string;
  amount: FormattedMoney;
  date: string; // YYYY-MM-DD
  category: string;
  categoryLabel: string;
  description: string;
  groupName?: string;
  payerName?: string;
  splitsCount?: number;
}

export interface MemberOption {
  id: string;
  name: string;
}

export interface GroupOption {
  id: string;
  name: string;
  members: MemberOption[];
}

export interface MemberBalanceView {
  memberId: string;
  memberName: string;
  totalPaid: FormattedMoney;
  totalOwed: FormattedMoney;
  netBalance: FormattedMoney;
  status: 'CREDIT' | 'DEBT' | 'SETTLED';
}

// ---------------------------------------------------------------------------
// Presentational Component Props
// ---------------------------------------------------------------------------

export interface ExpenseListProps {
  expenses: ExpenseItemView[];
  isLoading: boolean;
  onDeleteExpense: (id: string) => void;
  onFilterChange: (filters: { groupId?: string; category?: string }) => void;
  selectedGroupId?: string;
  selectedCategory?: string;
}

export interface ExpenseFormProps {
  groups: GroupOption[];
  categories: Array<{ value: string; label: string }>;
  isSubmitting: boolean;
  onSubmit: (formData: ExpenseFormData) => Promise<void>;
  errorMessage?: string;
}

export interface ExpenseFormData {
  amount: string; // Decimal string input e.g. "45.00"
  currency: 'EUR' | 'USD' | 'GBP';
  date: string;
  category: string;
  description: string;
  groupId?: string;
  payerMemberId?: string;
}

export interface GroupRosterProps {
  groups: GroupOption[];
  selectedGroupId: string | null;
  onSelectGroup: (groupId: string) => void;
  onCreateGroup: (name: string) => Promise<void>;
  onAddMember: (groupId: string, memberName: string) => Promise<void>;
  balances: MemberBalanceView[];
}

export interface DeleteConfirmModalProps {
  isOpen: boolean;
  expenseDescription: string;
  onConfirm: () => void;
  onCancel: () => void;
}
