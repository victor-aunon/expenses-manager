import { NextRequest, NextResponse } from "next/server";
import { getRepositories } from "@/infrastructure/di";
import { DeleteExpenseUseCase } from "@/core/application/use-cases/delete-expense.use-case";
import { DomainError } from "@/core/domain/errors/domain.error";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { expenseRepo } = getRepositories();
    const useCase = new DeleteExpenseUseCase(expenseRepo);

    await useCase.execute(id);

    return new NextResponse(null, { status: 204 });
  } catch (error: any) {
    if (error instanceof DomainError) {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    );
  }
}
