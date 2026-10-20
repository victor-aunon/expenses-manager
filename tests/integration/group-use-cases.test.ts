import { describe, it, expect, beforeEach } from "vitest";
import { CreateGroupUseCase } from "@/core/application/use-cases/create-group.use-case";
import { ListGroupsUseCase } from "@/core/application/use-cases/list-groups.use-case";
import { AddMemberUseCase } from "@/core/application/use-cases/add-member.use-case";
import { InMemoryGroupRepository } from "@/infrastructure/repositories/in-memory-group.repository";

describe("Group Use Cases (US3)", () => {
  let groupRepo: InMemoryGroupRepository;
  let createGroupUseCase: CreateGroupUseCase;
  let listGroupsUseCase: ListGroupsUseCase;
  let addMemberUseCase: AddMemberUseCase;

  beforeEach(() => {
    groupRepo = new InMemoryGroupRepository();
    createGroupUseCase = new CreateGroupUseCase(groupRepo);
    listGroupsUseCase = new ListGroupsUseCase(groupRepo);
    addMemberUseCase = new AddMemberUseCase(groupRepo);
  });

  it("creates a new group and lists it", async () => {
    const created = await createGroupUseCase.execute({ name: "Trip to Paris" });
    expect(created.id).toBeDefined();
    expect(created.name).toBe("Trip to Paris");
    expect(created.members).toHaveLength(0);

    const allGroups = await listGroupsUseCase.execute();
    expect(allGroups).toHaveLength(1);
    expect(allGroups[0].name).toBe("Trip to Paris");
  });

  it("rejects duplicate group names", async () => {
    await createGroupUseCase.execute({ name: "Work Team" });
    await expect(createGroupUseCase.execute({ name: "work team" })).rejects.toThrow(
      "A group with name 'work team' already exists"
    );
  });

  it("adds members to a group and rejects duplicate names in the group", async () => {
    const group = await createGroupUseCase.execute({ name: "House" });

    const member1 = await addMemberUseCase.execute({
      groupId: group.id,
      name: "Alice",
    });
    expect(member1.name).toBe("Alice");

    const member2 = await addMemberUseCase.execute({
      groupId: group.id,
      name: "Bob",
    });
    expect(member2.name).toBe("Bob");

    // Duplicate member
    await expect(
      addMemberUseCase.execute({
        groupId: group.id,
        name: "alice",
      })
    ).rejects.toThrow("Member with name 'alice' already exists in group 'House'");

    const updated = await groupRepo.findById(group.id);
    expect(updated?.members).toHaveLength(2);
  });
});
