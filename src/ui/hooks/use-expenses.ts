import { useState, useEffect, useCallback } from "react";
import { ExpenseItemView } from "@/ui/types";
import { ExpenseFormData } from "@/ui/components/expense/expense-form";

export function useExpenses(initialGroupId?: string) {
  const [expenses, setExpenses] = useState<ExpenseItemView[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<{ groupId?: string; category?: string }>({
    groupId: initialGroupId,
  });

  const fetchExpenses = useCallback(async (currentFilters = filters) => {
    setIsLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (currentFilters.groupId) params.set("groupId", currentFilters.groupId);
      if (currentFilters.category) params.set("category", currentFilters.category);

      const url = `/api/expenses${params.toString() ? `?${params.toString()}` : ""}`;
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error(`Failed to load expenses (${res.status})`);
      }
      const data = await res.json();
      setExpenses(data);
    } catch (err: any) {
      setError(err?.message || "Failed to load expenses");
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchExpenses(filters);
  }, [fetchExpenses, filters]);

  const createExpense = async (formData: ExpenseFormData): Promise<void> => {
    setError(null);
    const res = await fetch("/api/expenses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || "Failed to create expense");
    }

    // Refresh expenses
    await fetchExpenses(filters);
  };

  const deleteExpense = async (id: string): Promise<void> => {
    setError(null);
    const res = await fetch(`/api/expenses/${id}`, {
      method: "DELETE",
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || "Failed to delete expense");
    }

    // Instant optimistic or refetch update
    setExpenses((prev) => prev.filter((e) => e.id !== id));
  };

  const handleFilterChange = (newFilters: { groupId?: string; category?: string }) => {
    setFilters(newFilters);
  };

  return {
    expenses,
    isLoading,
    error,
    filters,
    fetchExpenses,
    createExpense,
    deleteExpense,
    setFilters: handleFilterChange,
  };
}
