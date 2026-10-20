import { IGroupRepository } from "@/core/domain/ports/group-repository.port";
import { GroupDTO } from "../dtos/group.dto";

export class ListGroupsUseCase {
  constructor(private readonly groupRepo: IGroupRepository) {}

  public async execute(): Promise<GroupDTO[]> {
    const groups = await this.groupRepo.findAll();
    return groups.map((g) => ({
      id: g.id,
      name: g.name,
      members: g.members.map((m) => ({
        id: m.id,
        name: m.name,
        createdAt: m.createdAt,
      })),
      createdAt: g.createdAt,
    }));
  }
}
