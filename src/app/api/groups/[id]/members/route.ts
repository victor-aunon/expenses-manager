import { NextRequest, NextResponse } from "next/server";
import { getRepositories } from "@/infrastructure/di";
import { AddMemberUseCase } from "@/core/application/use-cases/add-member.use-case";
import { DomainError } from "@/core/domain/errors/domain.error";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();

    const { groupRepo } = getRepositories();
    const useCase = new AddMemberUseCase(groupRepo);

    const member = await useCase.execute({
      groupId: id,
      name: body.name,
    });

    return NextResponse.json(member, { status: 201 });
  } catch (error: any) {
    if (error instanceof DomainError) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    return NextResponse.json(
      { error: error?.message || "Failed to add member" },
      { status: 400 }
    );
  }
}
