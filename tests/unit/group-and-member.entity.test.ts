import { describe, it, expect } from "vitest";
import { Group } from "@/core/domain/entities/group.entity";
import { Member } from "@/core/domain/entities/member.entity";
import { DomainError } from "@/core/domain/errors/domain.error";

describe("Group and Member Entities (US3)", () => {
  it("creates a Member with valid ID and name", () => {
    const member = Member.create({ id: "mem-1", name: "Alice" });
    expect(member.id).toBe("mem-1");
    expect(member.name).toBe("Alice");
  });

  it("rejects empty or whitespace-only member names", () => {
    expect(() => Member.create({ id: "mem-1", name: "" })).toThrow(DomainError);
    expect(() => Member.create({ id: "mem-2", name: "   " })).toThrow(DomainError);
  });

  it("creates a Group with unique name and empty or initial members", () => {
    const group = Group.create({ id: "grp-1", name: "Roommates" });
    expect(group.id).toBe("grp-1");
    expect(group.name).toBe("Roommates");
    expect(group.members).toHaveLength(0);
  });

  it("adds members and rejects duplicate members in the same group", () => {
    const group = Group.create({ id: "grp-1", name: "Roommates" });
    const alice = Member.create({ id: "mem-1", name: "Alice" });
    const bob = Member.create({ id: "mem-2", name: "Bob" });

    const updated = group.addMember(alice).addMember(bob);
    expect(updated.members).toHaveLength(2);

    // Duplicate by ID
    expect(() => updated.addMember(alice)).toThrow(
      "Member with ID 'mem-1' already exists in group 'Roommates'"
    );

    // Duplicate by name (case-insensitive)
    const duplicateAlice = Member.create({ id: "mem-3", name: "alice" });
    expect(() => updated.addMember(duplicateAlice)).toThrow(
      "Member with name 'alice' already exists in group 'Roommates'"
    );
  });

  it("rejects empty or excessively long group names", () => {
    expect(() => Group.create({ id: "grp-1", name: "" })).toThrow(DomainError);
    expect(() => Group.create({ id: "grp-2", name: "a".repeat(101) })).toThrow(
      "Group name cannot exceed 100 characters"
    );
  });
});
