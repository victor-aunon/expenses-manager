import {
  GroupData,
  IGroupRepository,
  MemberData,
} from "@/core/domain/ports/group-repository.port";

export class InMemoryGroupRepository implements IGroupRepository {
  private readonly groups = new Map<string, GroupData>();
  private readonly members = new Map<string, MemberData>();

  public async findById(id: string): Promise<GroupData | null> {
    const group = this.groups.get(id);
    return group ? { ...group, members: [...group.members] } : null;
  }

  public async findByName(name: string): Promise<GroupData | null> {
    for (const group of this.groups.values()) {
      if (group.name.toLowerCase() === name.toLowerCase()) {
        return { ...group, members: [...group.members] };
      }
    }
    return null;
  }

  public async findAll(): Promise<GroupData[]> {
    return Array.from(this.groups.values()).map((g) => ({
      ...g,
      members: [...g.members],
    }));
  }

  public async save(group: GroupData): Promise<void> {
    this.groups.set(group.id, {
      ...group,
      members: [...group.members],
    });
    for (const member of group.members) {
      this.members.set(member.id, { ...member });
    }
  }

  public async delete(id: string): Promise<void> {
    this.groups.delete(id);
  }

  public async addMember(groupId: string, member: MemberData): Promise<void> {
    const group = this.groups.get(groupId);
    if (!group) {
      throw new Error(`Group with id ${groupId} not found`);
    }
    this.members.set(member.id, { ...member });
    group.members.push({ ...member });
  }

  public async findMemberById(memberId: string): Promise<MemberData | null> {
    const member = this.members.get(memberId);
    return member ? { ...member } : null;
  }

  public clear(): void {
    this.groups.clear();
    this.members.clear();
  }
}
