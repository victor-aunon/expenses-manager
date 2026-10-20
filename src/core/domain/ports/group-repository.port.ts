export interface MemberData {
  id: string;
  name: string;
  createdAt: string;
}

export interface GroupData {
  id: string;
  name: string;
  members: MemberData[];
  createdAt: string;
}

export interface IGroupRepository {
  findById(id: string): Promise<GroupData | null>;
  findByName(name: string): Promise<GroupData | null>;
  findAll(): Promise<GroupData[]>;
  save(group: GroupData): Promise<void>;
  delete(id: string): Promise<void>;
  addMember(groupId: string, member: MemberData): Promise<void>;
  findMemberById(memberId: string): Promise<MemberData | null>;
}
