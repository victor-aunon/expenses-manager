import { describe, it, expect, vi } from "vitest";
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { GroupPanel } from "@/ui/components/group/group-panel";

describe("Group Presentational Components (UI)", () => {
  it("renders group panel with groups and handles group creation", () => {
    const handleCreateGroup = vi.fn().mockResolvedValue(undefined);
    const handleSelectGroup = vi.fn();
    const handleAddMember = vi.fn().mockResolvedValue(undefined);

    const groups = [
      {
        id: "grp-1",
        name: "Apartment Roommates",
        members: [{ id: "mem-1", name: "Alice" }],
      },
    ];

    render(
      <GroupPanel
        groups={groups}
        selectedGroupId={null}
        onSelectGroup={handleSelectGroup}
        onCreateGroup={handleCreateGroup}
        onAddMember={handleAddMember}
        balances={[]}
        isLoading={false}
      />
    );

    expect(screen.getByText("Apartment Roommates")).toBeInTheDocument();
    expect(screen.getByText("1 members")).toBeInTheDocument();

    // Create group
    fireEvent.change(screen.getByPlaceholderText(/New group name/i), {
      target: { value: "Weekend Trip" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Create/i }));

    expect(handleCreateGroup).toHaveBeenCalledWith("Weekend Trip");
  });

  it("renders selected group roster and handles adding a member", () => {
    const handleAddMember = vi.fn().mockResolvedValue(undefined);

    const groups = [
      {
        id: "grp-1",
        name: "Apartment Roommates",
        members: [{ id: "mem-1", name: "Alice" }],
      },
    ];

    render(
      <GroupPanel
        groups={groups}
        selectedGroupId="grp-1"
        onSelectGroup={vi.fn()}
        onCreateGroup={vi.fn()}
        onAddMember={handleAddMember}
        balances={[]}
        isLoading={false}
      />
    );

    expect(screen.getByText(/Apartment Roommates — Members & Balances/i)).toBeInTheDocument();
    expect(screen.getByText("Alice")).toBeInTheDocument();

    // Add member
    fireEvent.change(screen.getByPlaceholderText(/Add member name/i), {
      target: { value: "Bob" },
    });
    fireEvent.click(screen.getByRole("button", { name: /Add Member/i }));

    expect(handleAddMember).toHaveBeenCalledWith("grp-1", "Bob");
  });
});
