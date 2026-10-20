export interface CreateGroupCommand {
  name: string;
}

export interface AddMemberCommand {
  groupId: string;
  name: string;
}

export interface MemberDTO {
  id: string;
  name: string;
  createdAt: string;
}

export interface GroupDTO {
  id: string;
  name: string;
  members: MemberDTO[];
  createdAt: string;
}
