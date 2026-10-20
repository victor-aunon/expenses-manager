import { useState, useEffect, useCallback } from "react";
import { GroupOption } from "@/ui/components/expense/expense-form";
import { MemberBalanceView } from "@/ui/types";

export function useGroups() {
  const [groups, setGroups] = useState<GroupOption[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [balances, setBalances] = useState<MemberBalanceView[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchGroups = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/groups");
      if (res.ok) {
        const data = await res.json();
        setGroups(data);
      }
    } catch (err: any) {
      setError(err?.message || "Failed to load groups");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchBalances = useCallback(async (groupId: string) => {
    try {
      const res = await fetch(`/api/groups/${groupId}/balances`);
      if (res.ok) {
        const data = await res.json();
        setBalances(data.balances || []);
      }
    } catch (err) {
      console.error("Failed to load balances", err);
    }
  }, []);

  useEffect(() => {
    fetchGroups();
  }, [fetchGroups]);

  useEffect(() => {
    if (selectedGroupId) {
      fetchBalances(selectedGroupId);
    } else {
      setBalances([]);
    }
  }, [selectedGroupId, fetchBalances]);

  const createGroup = async (name: string): Promise<void> => {
    const res = await fetch("/api/groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || "Failed to create group");
    }

    await fetchGroups();
  };

  const addMember = async (groupId: string, memberName: string): Promise<void> => {
    const res = await fetch(`/api/groups/${groupId}/members`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: memberName }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || "Failed to add member");
    }

    await fetchGroups();
    if (selectedGroupId === groupId) {
      await fetchBalances(groupId);
    }
  };

  return {
    groups,
    selectedGroupId,
    setSelectedGroupId,
    balances,
    isLoading,
    error,
    createGroup,
    addMember,
    refreshBalances: () => selectedGroupId && fetchBalances(selectedGroupId),
  };
}
