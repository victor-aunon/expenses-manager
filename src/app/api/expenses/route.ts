import { NextRequest, NextResponse } from "next/server";
import { getRepositories } from "@/infrastructure/di";
import { CreateExpenseUseCase } from "@/core/application/use-cases/create-expense.use-case";
import { ListExpensesUseCase } from "@/core/application/use-cases/list-expenses.use-case";
import { ExpenseCategory } from "@/core/domain/value-objects/expense-category.vo";
import { DomainError } from "@/core/domain/errors/domain.error";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get("groupId") || undefined;
    const category = (searchParams.get("category") as ExpenseCategory) || undefined;
    const startDate = searchParams.get("startDate") || undefined;
    const endDate = searchParams.get("endDate") || undefined;

    const { expenseRepo, groupRepo } = getRepositories();
    const useCase = new ListExpensesUseCase(expenseRepo, groupRepo);

    const expenses = await useCase.execute({
      groupId,
      category,
      startDate,
      endDate,
    });

    return NextResponse.json(expenses, { status: 200 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { expenseRepo, groupRepo } = getRepositories();
    const useCase = new CreateExpenseUseCase(expenseRepo, groupRepo);

    const created = await useCase.execute({
      amount: Number(body.amount),
      currency: body.currency,
      date: body.date,
      category: body.category,
      description: body.description,
      groupId: body.groupId || null,
      payerMemberId: body.payerMemberId || null,
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    if (error instanceof DomainError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: error?.message || "Invalid expense payload" },
      { status: 400 }
    );
  }
}
