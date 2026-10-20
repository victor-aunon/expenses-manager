import React, { useState } from "react";
import { GroupOption } from "@/ui/components/expense/expense-form";
import { MemberBalanceView } from "@/ui/types";
import { MemberBalanceCard } from "./member-balance-card";

export interface GroupPanelProps {
  groups: GroupOption[];
  selectedGroupId: string | null;
  onSelectGroup: (groupId: string | null) => void;
  onCreateGroup: (name: string) => Promise<void>;
  onAddMember: (groupId: string, memberName: string) => Promise<void>;
  balances: MemberBalanceView[];
  isLoading: boolean;
}

export function GroupPanel({
  groups,
  selectedGroupId,
  onSelectGroup,
  onCreateGroup,
  onAddMember,
  balances,
  isLoading,
}: GroupPanelProps) {
  const [newGroupName, setNewGroupName] = useState("");
  const [newMemberName, setNewMemberName] = useState("");
  const [error, setError] = useState<string | null>(null);

  const selectedGroup = groups.find((g) => g.id === selectedGroupId);

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    setError(null);
    try {
      await onCreateGroup(newGroupName.trim());
      setNewGroupName("");
    } catch (err: any) {
      setError(err?.message || "Failed to create group");
    }
  };

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroupId || !newMemberName.trim()) return;
    setError(null);
    try {
      await onAddMember(selectedGroupId, newMemberName.trim());
      setNewMemberName("");
    } catch (err: any) {
      setError(err?.message || "Failed to add member");
    }
  };

  return (
    <div style={panelContainerStyle}>
      {error && <div style={errorBannerStyle}>{error}</div>}

      <div style={layoutGridStyle}>
        {/* Left Column: Groups List & Creation */}
        <section style={cardStyle}>
          <h2 style={headingStyle}>Spending Groups ({groups.length})</h2>

          <form onSubmit={handleCreateGroup} style={inlineFormStyle}>
            <input
              type="text"
              placeholder="New group name..."
              required
              value={newGroupName}
              onChange={(e) => setNewGroupName(e.target.value)}
              style={{ flex: 1 }}
            />
            <button type="submit">Create</button>
          </form>

          <div style={groupListStyle}>
            {groups.length === 0 ? (
              <p style={mutedTextStyle}>No groups created yet.</p>
            ) : (
              groups.map((group) => {
                const isSelected = group.id === selectedGroupId;
                return (
                  <div
                    key={group.id}
                    onClick={() => onSelectGroup(isSelected ? null : group.id)}
                    style={{
                      ...groupItemStyle,
                      backgroundColor: isSelected ? "var(--color-bg-subtle)" : "var(--color-bg-surface)",
                      borderColor: isSelected ? "var(--color-border)" : "var(--color-border-subtle)",
                      borderWidth: isSelected ? "2px" : "1px",
                    }}
                  >
                    <div style={{ fontWeight: 700 }}>{group.name}</div>
                    <div style={mutedTextStyle}>{group.members.length} members</div>
                  </div>
                );
              })
            )}
          </div>
        </section>

        {/* Right Column: Selected Group Roster & Net Balances */}
        <section style={cardStyle}>
          {selectedGroup ? (
            <>
              <div style={rosterHeaderStyle}>
                <h2 style={headingStyle}>{selectedGroup.name} — Members & Balances</h2>
                <button
                  onClick={() => onSelectGroup(null)}
                  style={smallButtonStyle}
                >
                  Deselect
                </button>
              </div>

              {/* Add Member Form */}
              <form onSubmit={handleAddMember} style={inlineFormStyle}>
                <input
                  type="text"
                  placeholder="Add member name..."
                  required
                  value={newMemberName}
                  onChange={(e) => setNewMemberName(e.target.value)}
                  style={{ flex: 1 }}
                />
                <button type="submit">Add Member</button>
              </form>

              {/* Balances & Roster */}
              <div style={{ marginTop: "1.5rem" }}>
                <h3 style={subHeadingStyle}>Net Balances</h3>
                <MemberBalanceCard balances={balances} members={selectedGroup.members} />
              </div>
            </>
          ) : (
            <div style={emptySelectionStyle}>
              <p>Select a group on the left to view member balances or manage the roster.</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

const panelContainerStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "1.5rem",
};

const layoutGridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "1fr 2fr",
  gap: "1.5rem",
};

const cardStyle: React.CSSProperties = {
  backgroundColor: "var(--color-bg-surface)",
  border: "var(--border-width) solid var(--color-border)",
  padding: "1.5rem",
};

const headingStyle: React.CSSProperties = {
  fontSize: "1.1rem",
  fontWeight: 700,
  letterSpacing: "-0.01em",
  textTransform: "uppercase",
  marginBottom: "1rem",
  borderBottom: "var(--border-width) solid var(--color-border-subtle)",
  paddingBottom: "0.5rem",
};

const subHeadingStyle: React.CSSProperties = {
  fontSize: "0.9rem",
  fontWeight: 700,
  letterSpacing: "0.02em",
  textTransform: "uppercase",
  color: "var(--color-text-muted)",
  marginBottom: "0.75rem",
};

const inlineFormStyle: React.CSSProperties = {
  display: "flex",
  gap: "0.5rem",
  marginBottom: "1rem",
};

const groupListStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
  gap: "0.5rem",
  marginTop: "1rem",
};

const groupItemStyle: React.CSSProperties = {
  padding: "0.75rem 1rem",
  border: "var(--border-width) solid var(--color-border-subtle)",
  cursor: "pointer",
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
};

const rosterHeaderStyle: React.CSSProperties = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "1rem",
};

const smallButtonStyle: React.CSSProperties = {
  fontSize: "0.75rem",
  padding: "0.25rem 0.5rem",
};

const mutedTextStyle: React.CSSProperties = {
  fontSize: "0.8rem",
  color: "var(--color-text-muted)",
  fontFamily: "var(--font-mono)",
};

const emptySelectionStyle: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  minHeight: "220px",
  color: "var(--color-text-muted)",
  fontStyle: "italic",
  textAlign: "center",
};

const errorBannerStyle: React.CSSProperties = {
  backgroundColor: "var(--color-debt-bg)",
  color: "var(--color-debt)",
  border: "var(--border-width) solid var(--color-debt)",
  padding: "0.75rem 1rem",
  fontSize: "0.9rem",
  fontWeight: 600,
};
