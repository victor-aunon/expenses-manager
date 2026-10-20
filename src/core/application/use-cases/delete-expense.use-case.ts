import { IExpenseRepository } from "@/core/domain/ports/expense-repository.port";
import { DomainError } from "@/core/domain/errors/domain.error";

export class DeleteExpenseUseCase {
  constructor(private readonly expenseRepo: IExpenseRepository) {}

  public async execute(expenseId: string): Promise<void> {
    const existing = await this.expenseRepo.findById(expenseId);
    if (!existing) {
      throw new DomainError(`Expense with ID '${expenseId}' not found`);
    }

    await this.expenseRepo.delete(expenseId);
  }
}
