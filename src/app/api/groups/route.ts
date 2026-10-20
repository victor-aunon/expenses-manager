import { NextRequest, NextResponse } from "next/server";
import { getRepositories } from "@/infrastructure/di";
import { CreateGroupUseCase } from "@/core/application/use-cases/create-group.use-case";
import { ListGroupsUseCase } from "@/core/application/use-cases/list-groups.use-case";
import { DomainError } from "@/core/domain/errors/domain.error";

export async function GET() {
  try {
    const { groupRepo } = getRepositories();
    const useCase = new ListGroupsUseCase(groupRepo);
    const groups = await useCase.execute();
    return NextResponse.json(groups, { status: 200 });
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
    const { groupRepo } = getRepositories();
    const useCase = new CreateGroupUseCase(groupRepo);

    const created = await useCase.execute({
      name: body.name,
    });

    return NextResponse.json(created, { status: 201 });
  } catch (error: any) {
    if (error instanceof DomainError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: error?.message || "Failed to create group" },
      { status: 400 }
    );
  }
}
