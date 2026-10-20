import { IGroupRepository } from "@/core/domain/ports/group-repository.port";
import { Group } from "@/core/domain/entities/group.entity";
import { DomainError } from "@/core/domain/errors/domain.error";
import { CreateGroupCommand, GroupDTO } from "../dtos/group.dto";

export class CreateGroupUseCase {
  constructor(private readonly groupRepo: IGroupRepository) {}

  public async execute(command: CreateGroupCommand): Promise<GroupDTO> {
    const existing = await this.groupRepo.findByName(command.name.trim());
    if (existing) {
      throw new DomainError(`A group with name '${command.name.trim()}' already exists`);
    }

    const id = crypto.randomUUID();
    const group = Group.create({
      id,
      name: command.name.trim(),
    });

    await this.groupRepo.save({
      id: group.id,
      name: group.name,
      members: [],
      createdAt: group.createdAt.toISOString(),
    });

    return {
      id: group.id,
      name: group.name,
      members: [],
      createdAt: group.createdAt.toISOString(),
    };
  }
}
