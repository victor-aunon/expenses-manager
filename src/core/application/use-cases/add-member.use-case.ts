import { IGroupRepository } from "@/core/domain/ports/group-repository.port";
import { Member } from "@/core/domain/entities/member.entity";
import { Group } from "@/core/domain/entities/group.entity";
import { DomainError } from "@/core/domain/errors/domain.error";
import { AddMemberCommand, MemberDTO } from "../dtos/group.dto";

export class AddMemberUseCase {
  constructor(private readonly groupRepo: IGroupRepository) {}

  public async execute(command: AddMemberCommand): Promise<MemberDTO> {
    const groupData = await this.groupRepo.findById(command.groupId);
    if (!groupData) {
      throw new DomainError(`Group with ID '${command.groupId}' not found`);
    }

    const members = groupData.members.map((m) =>
      Member.create({ id: m.id, name: m.name, createdAt: new Date(m.createdAt) })
    );

    const group = Group.create({
      id: groupData.id,
      name: groupData.name,
      members,
      createdAt: new Date(groupData.createdAt),
    });

    const newMemberId = crypto.randomUUID();
    const newMember = Member.create({
      id: newMemberId,
      name: command.name.trim(),
    });

    // Invariant check on group
    group.addMember(newMember);

    const memberData = {
      id: newMember.id,
      name: newMember.name,
      createdAt: newMember.createdAt.toISOString(),
    };

    await this.groupRepo.addMember(group.id, memberData);

    return memberData;
  }
}
