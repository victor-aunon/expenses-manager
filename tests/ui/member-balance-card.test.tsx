import { describe, it, expect } from "vitest";
import React from "react";
import { render, screen } from "@testing-library/react";
import { MemberBalanceCard } from "@/ui/components/group/member-balance-card";
import { MemberBalanceView } from "@/ui/types";

describe("Member Balance Card (US4 UI)", () => {
  it("renders member balances with appropriate credit and debt indicators", () => {
    const members = [
      { id: "mem-1", name: "Alice" },
      { id: "mem-2", name: "Bob" },
    ];

    const balances: MemberBalanceView[] = [
      {
        memberId: "mem-1",
        memberName: "Alice",
        totalPaid: { minorUnits: 10000, formatted: "100.00 €", currency: "EUR" },
        totalOwed: { minorUnits: 5000, formatted: "50.00 €", currency: "EUR" },
        netBalance: { minorUnits: 5000, formatted: "+50.00 €", currency: "EUR" },
        status: "CREDIT",
      },
      {
        memberId: "mem-2",
        memberName: "Bob",
        totalPaid: { minorUnits: 0, formatted: "0.00 €", currency: "EUR" },
        totalOwed: { minorUnits: 5000, formatted: "50.00 €", currency: "EUR" },
        netBalance: { minorUnits: -5000, formatted: "-50.00 €", currency: "EUR" },
        status: "DEBT",
      },
    ];

    render(<MemberBalanceCard balances={balances} members={members} />);

    expect(screen.getByText("Alice")).toBeInTheDocument();
    expect(screen.getByText("+50.00 €")).toBeInTheDocument();
    expect(screen.getByText("GETS BACK")).toBeInTheDocument();

    expect(screen.getByText("Bob")).toBeInTheDocument();
    expect(screen.getByText("-50.00 €")).toBeInTheDocument();
    expect(screen.getByText("OWES")).toBeInTheDocument();
  });
});
