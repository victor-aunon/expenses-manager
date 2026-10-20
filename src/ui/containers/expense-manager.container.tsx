"use client";

import React, { useState } from "react";
import { useExpenses } from "@/ui/hooks/use-expenses";
import { ExpenseForm } from "@/ui/components/expense/expense-form";
import { ExpenseList } from "@/ui/components/expense/expense-list";
import { DeleteConfirmModal } from "@/ui/components/expense/delete-confirm-modal";
import { GroupPanel } from "@/ui/components/group/group-panel";
import { useGroups } from "@/ui/hooks/use-groups";
import { EXPENSE_CATEGORIES, CATEGORY_LABELS } from "@/core/domain/value-objects/expense-category.vo";

export function ExpenseManagerContainer() {
  const [activeTab, setActiveTab] = useState<"expenses" | "groups">("expenses");
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);

  // Group Management Hook
  const {
    groups,
    selectedGroupId,
    setSelectedGroupId,
    balances,
    createGroup,
    addMember,
    isLoading: groupsLoading,
  } = useGroups();

  // Expenses Hook (filtered by selected group if active)
  const {
    expenses,
    isLoading: expensesLoading,
    error: expenseError,
    createExpense,
    deleteExpense,
    filters,
    setFilters,
  } = useExpenses(selectedGroupId || undefined);

  const categories = EXPENSE_CATEGORIES.map((cat) => ({
    value: cat,
    label: CATEGORY_LABELS[cat],
  }));

  const targetExpense = expenses.find((e) => e.id === deleteTargetId);

  const handleConfirmDelete = async () => {
    if (deleteTargetId) {
      await deleteExpense(deleteTargetId);
      setDeleteTargetId(null);
    }
  };

  return (
    <div style={containerStyle}>
      <nav style={tabsNavStyle} aria-label="Main Navigation">
        <button
          onClick={() => setActiveTab("expenses")}
          style={{
            ...tabButtonStyle,
            backgroundColor: activeTab === "expenses" ? "var(--color-border)" : "transparent",
            color: activeTab === "expenses" ? "var(--color-bg-surface)" : "var(--color-text-primary)",
          }}
        >
          Expenses ({expenses.length})
        </button>
        <button
          onClick={() => setActiveTab("groups")}
          style={{
            ...tabButtonStyle,
            backgroundColor: activeTab === "groups" ? "var(--color-border)" : "transparent",
            color: activeTab === "groups" ? "var(--color-bg-surface)" : "var(--color-text-primary)",
          }}
        >
          Groups & Sharing ({groups.length})
        </button>
      </nav>

      {activeTab === "expenses" ? (
        <>
          <ExpenseForm
            groups={groups}
            categories={categories}
            isSubmitting={false}
            onSubmit={createExpense}
            errorMessage={expenseError || undefined}
          />

          <ExpenseList
            expenses={expenses}
            isLoading={expensesLoading}
            onDeleteExpense={(id) => setDeleteTargetId(id)}
            onFilterChange={setFilters}
            selectedGroupId={filters.groupId}
            selectedCategory={filters.category}
          />
        </>
      ) : (
        <GroupPanel
          groups={groups}
          selectedGroupId={selectedGroupId}
          onSelectGroup={(id) => {
            setSelectedGroupId(id);
            setFilters({ ...filters, groupId: id || undefined });
          }}
          onCreateGroup={createGroup}
          onAddMember={addMember}
          balances={balances}
          isLoading={groupsLoading}
        />
      )}

      {/* Two-step Deletion Modal (US2) */}
      <DeleteConfirmModal
        isOpen={deleteTargetId !== null}
        expenseDescription={targetExpense?.description || "this expense"}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTargetId(null)}
      />
    </div>
  );
}

const containerStyle: React.CSSProperties = {
  display: "flex",
  flexDirection: "column",
};

const tabsNavStyle: React.CSSProperties = {
  display: "flex",
  gap: "0.5rem",
  marginBottom: "1.5rem",
  borderBottom: "var(--border-width) solid var(--color-border)",
  paddingBottom: "0.5rem",
};

const tabButtonStyle: React.CSSProperties = {
  padding: "0.5rem 1.25rem",
  fontSize: "0.9rem",
  fontWeight: 700,
  textTransform: "uppercase",
  letterSpacing: "0.03em",
  cursor: "pointer",
};
