import { NextRequest, NextResponse } from "next/server";
import { getRepositories } from "@/infrastructure/di";
import { CalculateGroupBalancesUseCase } from "@/core/application/use-cases/calculate-group-balances.use-case";
import { DomainError } from "@/core/domain/errors/domain.error";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const { expenseRepo, groupRepo } = getRepositories();
    const useCase = new CalculateGroupBalancesUseCase(expenseRepo, groupRepo);

    const result = await useCase.execute(id);

    return NextResponse.json(result, { status: 200 });
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
