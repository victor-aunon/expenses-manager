import { DomainError } from "../errors/domain.error";
import { Money } from "../value-objects/money.vo";
import { assertExpenseCategory, ExpenseCategory } from "../value-objects/expense-category.vo";

export interface ExpenseSplitProps {
  memberId: string;
  amount: Money;
}

export interface CreateExpenseProps {
  id: string;
  amount: Money;
  date: string; // YYYY-MM-DD
  category: ExpenseCategory;
  description: string;
  groupId?: string | null;
  payerMemberId?: string | null;
  splits?: ExpenseSplitProps[];
  createdAt?: Date;
}

export class Expense {
  private readonly _id: string;
  private readonly _amount: Money;
  private readonly _date: string;
  private readonly _category: ExpenseCategory;
  private readonly _description: string;
  private readonly _groupId: string | null;
  private readonly _payerMemberId: string | null;
  private readonly _splits: ExpenseSplitProps[];
  private readonly _createdAt: Date;

  private constructor(props: CreateExpenseProps) {
    if (!props.id || typeof props.id !== "string" || props.id.trim() === "") {
      throw new DomainError("Expense ID is required");
    }

    if (props.amount.amountInMinorUnits <= 0) {
      throw new DomainError("Expense amount must be strictly greater than zero");
    }

    if (!props.description || typeof props.description !== "string" || props.description.trim() === "") {
      throw new DomainError("Expense description is required and cannot be empty");
    }

    if (props.description.length > 255) {
      throw new DomainError("Description cannot exceed 255 characters");
    }

    // YYYY-MM-DD validation
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(props.date) || isNaN(Date.parse(props.date))) {
      throw new DomainError("Invalid date format. Expected YYYY-MM-DD");
    }

    assertExpenseCategory(props.category);

    this._id = props.id;
    this._amount = props.amount;
    this._date = props.date;
    this._category = props.category;
    this._description = props.description.trim();
    this._groupId = props.groupId || null;
    this._payerMemberId = props.payerMemberId || null;
    this._splits = props.splits || [];
    this._createdAt = props.createdAt || new Date();

    // Invariant check for shared expenses
    if (this._groupId) {
      if (!this._payerMemberId) {
        throw new DomainError("A shared group expense requires designating a payer member");
      }
      if (this._splits.length > 0) {
        const totalSplitMinorUnits = this._splits.reduce(
          (sum, split) => sum + split.amount.amountInMinorUnits,
          0
        );
        if (totalSplitMinorUnits !== this._amount.amountInMinorUnits) {
          throw new DomainError(
            `Split total (${totalSplitMinorUnits}) does not match expense total (${this._amount.amountInMinorUnits})`
          );
        }
      }
    }

    Object.freeze(this);
  }

  public static create(props: CreateExpenseProps): Expense {
    return new Expense(props);
  }

  public get id(): string {
    return this._id;
  }

  public get amount(): Money {
    return this._amount;
  }

  public get date(): string {
    return this._date;
  }

  public get category(): ExpenseCategory {
    return this._category;
  }

  public get description(): string {
    return this._description;
  }

  public get groupId(): string | null {
    return this._groupId;
  }

  public get payerMemberId(): string | null {
    return this._payerMemberId;
  }

  public get splits(): ExpenseSplitProps[] {
    return [...this._splits];
  }

  public get createdAt(): Date {
    return this._createdAt;
  }

  public isShared(): boolean {
    return this._groupId !== null;
  }
}
