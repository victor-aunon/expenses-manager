export interface FormattedMoney {
  minorUnits: number;
  formatted: string;
  currency: "EUR" | "USD" | "GBP";
}

export interface ExpenseItemView {
  id: string;
  amount: FormattedMoney;
  date: string; // YYYY-MM-DD
  category: string;
  categoryLabel: string;
  description: string;
  groupId?: string | null;
  groupName?: string;
  payerMemberId?: string | null;
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
  status: "CREDIT" | "DEBT" | "SETTLED";
}
