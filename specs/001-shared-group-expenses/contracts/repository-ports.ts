/**
 * Domain Repository Ports (Interfaces)
 *
 * Placed in Domain/Application layer. Concrete implementations (SQLite, In-Memory)
 * reside in the Infrastructure layer and implement these contracts.
 */

export interface ExpenseFilters {
  groupId?: string;
  category?: string;
  startDate?: string;
  endDate?: string;
}

export interface IExpenseRepository {
  findById(id: string): Promise<ExpenseData | null>;
  findAll(filters?: ExpenseFilters): Promise<ExpenseData[]>;
  save(expense: ExpenseData): Promise<void>;
  delete(id: string): Promise<void>;
  countByGroupId(groupId: string): Promise<number>;
  countByMemberId(memberId: string): Promise<number>;
}

export interface IGroupRepository {
  findById(id: string): Promise<GroupData | null>;
  findAll(): Promise<GroupData[]>;
  save(group: GroupData): Promise<void>;
  delete(id: string): Promise<void>;
  addMember(groupId: string, member: MemberData): Promise<void>;
  findMemberById(memberId: string): Promise<MemberData | null>;
}

// Data Transfer Objects (DTOs) for Repository Port boundaries
export interface ExpenseData {
  id: string;
  amountMinorUnits: number;
  currency: 'EUR' | 'USD' | 'GBP';
  date: string; // YYYY-MM-DD
  category: string;
  description: string;
  groupId: string | null;
  payerMemberId: string | null;
  splits: Array<{
    memberId: string;
    amountMinorUnits: number;
    currency: 'EUR' | 'USD' | 'GBP';
  }>;
  createdAt: string;
}

export interface MemberData {
  id: string;
  name: string;
  createdAt: string;
}

export interface GroupData {
  id: string;
  name: string;
  members: MemberData[];
  createdAt: string;
}
